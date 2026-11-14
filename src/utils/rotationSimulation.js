import { ROTATIONS } from "../data/rotations.js";
import { getTeamBuffsForAction } from "./buffTimeline.js";
import { resolveCombatEquipmentEffects } from "./combatEquipmentEffects.js";
import { resolveEnemyScenario } from "./enemyScenario.js";
import { simulateCombatTimeline } from "./combatTimeline.js";
import {
  calculateDefenseMultiplier,
  calculateExpectedCritMultiplier,
  calculateResistanceMultiplier,
  calculateToughnessMultiplier
} from "./damageFormula.js";

// These manual damage packets have a usable kit basis today. Other hard-coded
// branches are retained for reference but are not exposed as combat totals
// until their multipliers and conditions are checked against profile data.
const SUPPORTED_MANUAL_SCENARIOS = new Set(["1003", "1308"]);

function extractMotionValues(description, characterName) {
  const pattern = new RegExp(`([\\d.]+)% of ${characterName}['’]s ATK`, "gi");
  const text = String(description || "");
  const namedValues = [...text.matchAll(pattern)].map((match) => Number(match[1].replace(",", ".")) / 100);
  if (namedValues.length > 0) return namedValues;

  // Mihomo localizes skill descriptions. Numeric coefficients keep their
  // order when the English "of Character's ATK" phrase is translated.
  return [...text.matchAll(/([\d]+(?:[.,][\d]+)?)\s*%/g)]
    .map((match) => Number(match[1].replace(",", ".")) / 100)
    .filter(Number.isFinite);
}

export function runFullTeamRotationSimulation(mainChar, mainStats, squad, matchedTeammates = [], lang = "ru", options = {}) {
  if (!mainChar || !mainStats) return null;
  const isRu = lang === "ru";
  const combatTimeline = options.timelineScenario && typeof options.timelineScenario === "object"
    ? simulateCombatTimeline(options.timelineScenario)
    : null;
  const name = (mainChar.name || "").toLowerCase();
  const charId = String(mainChar.id || "");
  let baseAtk = Number(mainStats.atk || 0);
  let baseHp = Number(mainStats.hp || 0);
  let baseCr = Number(mainStats.cr || 5);
  let baseCd = Number(mainStats.cd || 50);
  let baseBe = Number(mainStats.be || 0);
  let baseDmgBoost = Number(mainStats.dmg_boost || 0);
  let teamAtkGrant = 0;
  let teamAtkPercent = 0;
  let teamCdGrant = 0;
  let teamCrGrant = 0;
  let teamDmgBoost = 0;
  let teamResPen = 0;
  let teamDefShred = 0;
  let teamVuln = 0;
  let teamCritVuln = 0;
  let teamBreakVuln = 0;
  let teamBeBoost = 0;
  let teamBreakEff = 0;
  let teamFuaCd = 0;
  let hasSuperBreak = false;
  let superBreakFactor = 1;
  let buffTimingStatus = "assumed-full-uptime";
  matchedTeammates.forEach((tm) => {
    const b = tm.dynamicBuffs || {};
    if (b.atkGrant) teamAtkGrant += b.atkGrant;
    if (b.atkPercent) teamAtkPercent += b.atkPercent;
    if (b.cdGrant) teamCdGrant += b.cdGrant;
    if (b.crGrant) teamCrGrant += b.crGrant;
    if (b.dmgBoost) teamDmgBoost += b.dmgBoost;
    if (b.resPen) teamResPen += b.resPen;
    if (b.defShred) teamDefShred += b.defShred;
    if (b.allVuln) teamVuln += b.allVuln;
    if (b.vuln) teamVuln += b.vuln;
    if (b.critVuln) teamCritVuln += b.critVuln;
    if (b.breakVuln) teamBreakVuln += b.breakVuln;
    if (b.beBoost) teamBeBoost += b.beBoost;
    if (b.breakEff) teamBreakEff += b.breakEff;
    if (b.fuaCd) teamFuaCd += b.fuaCd;
    if (b.superBreakFactor) {
      hasSuperBreak = true;
      superBreakFactor = b.superBreakFactor;
    }
  });
  // Kit-ротація виявляється ДО обчислення множників: пасиви кіта (КУ/RES PEN) входять у бойові стати
  const kitRotation = ROTATIONS[charId] || null;
  const kitCd = (kitRotation && kitRotation.passiveCritDmg) || 0;
  const kitResPen = (kitRotation && kitRotation.passiveResPen) || 0;
  const enemyMode = options.enemyMode || "moc";
  const enemyScenario = resolveEnemyScenario(options, enemyMode, mainChar.element?.id || mainChar.element || "");
  const primaryEnemy = enemyScenario.targets[0];
  const enemy = {
    lv: primaryEnemy.level,
    res: primaryEnemy.resistancePercent / 100,
    targets: enemyScenario.targetCount,
    targetData: enemyScenario.targets
  };
  const totalDefShred = Math.min(1, teamDefShred / 100);
  const appliedBuffFields = new Set([
    "atkGrant", "atkPercent", "cdGrant", "crGrant", "dmgBoost", "resPen", "defShred",
    "allVuln", "vuln", "critVuln", "breakVuln", "beBoost", "breakEff",
    "superBreakFactor", "fuaCd"
  ]);
  const hasAppliedTeamBuffValues = matchedTeammates.some((teammate) =>
    Object.entries(teammate.dynamicBuffs || {}).some(([key, value]) =>
      appliedBuffFields.has(key) && typeof value === "number" && value !== 0
    )
  );
  if (!hasAppliedTeamBuffValues) buffTimingStatus = "no-numeric-buffs-configured";
  const charLv = Number(mainChar.level || 80);
  const enemyLv = enemy.lv;
  const baseEnemyRes = enemy.res;
  const getTargetDamageFactors = (target, {
    defShredPercent = teamDefShred,
    resPenPercent = teamResPen + kitResPen,
    vulnerabilityPercent = teamVuln,
    vulnerabilityByTarget = {},
    includeToughness = true
  } = {}) => {
    const defense = calculateDefenseMultiplier(charLv, target.level, defShredPercent);
    const resistance = calculateResistanceMultiplier(target.resistancePercent / 100, resPenPercent);
    const toughness = includeToughness ? calculateToughnessMultiplier(target.isBroken) : 1;
    const vulnerability = 1 + (vulnerabilityPercent + target.vulnerabilityPercent
      + (Number(vulnerabilityByTarget[target.id]) || 0)) / 100;
    return {
      defMult: defense,
      resMult: resistance,
      toughnessMultiplier: toughness,
      vulnMult: vulnerability * toughness,
      damageFactor: defense * resistance * vulnerability * toughness
    };
  };
  const primaryTargetFactors = getTargetDamageFactors(primaryEnemy);
  const defMult = primaryTargetFactors.defMult;
  const resMult = primaryTargetFactors.resMult;
  const damageTakenMult = 1 + teamVuln / 100;
  const toughnessMultiplier = primaryTargetFactors.toughnessMultiplier;
  // Without a break-state timeline, direct hits assume an active Toughness bar.
  // Super Break instances below assume the target is already broken.
  const vulnMult = damageTakenMult * toughnessMultiplier;
  // The profile's attributes/additions already include cone base stats and
  // static property bonuses. Conditional effects are added by exact ID below.
  const characterBaseAttack = (mainChar.attributes || []).find((attribute) => attribute.field === "atk")?.value;
  const baseAttackForPercent = Number(mainStats.base_atk || mainStats.baseAtk || mainChar.baseAtk || mainChar.baseStats?.atk || characterBaseAttack || 0);
  const equipmentEffects = resolveCombatEquipmentEffects(mainChar, matchedTeammates, {
    ...options,
    targetCount: enemy.targets,
    enemies: enemy.targetData,
    enemyTargetsAreExplicit: enemyScenario.status === "explicit-targets",
    enemyHpPercent: enemyScenario.status === "explicit-targets" ? null : options.enemyHpPercent
  });
  const percentAttackGrant = baseAttackForPercent * teamAtkPercent / 100;
  const coneAttackGrant = baseAttackForPercent * equipmentEffects.lightConeDamage.attackPercent / 100;
  const combatAtk = baseAtk + teamAtkGrant + percentAttackGrant + coneAttackGrant;
  const combatHp = baseHp;
  const rawTotalCr = (baseCr + teamCrGrant);

  // Специфика таланта СВ ур. 999 («I Carry, We Win»):
  // Избыточный КШ > 100% конвертируется в Крит. Урон
  const isWolf999 = charId === "1506" || charId === "999" || name.includes("999");
  const overcritBonusCd = (isWolf999 && rawTotalCr > 100) ? (rawTotalCr - 100) : 0;

  // Специфика следа Авантюрина: Прибой («Revel in Surging Waves»):
  // +100% базовой эффективности Радости при наличии союзника Радости
  const isAvenSurging = charId === "1513" || name.includes("прибой") || name.includes("waveflair");
  const hasElationTeammate = matchedTeammates.some(tm => {
    const tmId = String(tm.id || "");
    const tmRole = `${tm.roleRu || ""} ${tm.roleEn || ""}`.toLowerCase();
    return tmId === "1501" || tmId === "1502" || tmId === "1503" || tmId === "1506" || tmId === "1513"
      || tmRole.includes("радост") || tmRole.includes("elation");
  });
  const elationSurgeBonus = (isAvenSurging && hasElationTeammate) ? 50 : 0;

  const combatCr = Math.min(1, (rawTotalCr
    + equipmentEffects.eidolonDamage.critRate
    + equipmentEffects.lightConeDamage.critRate) / 100);
  const combatCd = (baseCd + teamCdGrant + kitCd + overcritBonusCd
    + equipmentEffects.lightConeDamage.critDamage) / 100;
  // Crit vulnerability applies only to crit instances. Fold its expected value
  // into the expected crit multiplier instead of inflating every hit.
  const critMultiplier = calculateExpectedCritMultiplier(
    combatCr * 100,
    combatCd * 100,
    teamCritVuln
  );
  const combatDmgBonus = 1 + (baseDmgBoost + teamDmgBoost + elationSurgeBonus
    + equipmentEffects.lightConeDamage.allDamage
    + equipmentEffects.eidolonDamage.lowHpDamage) / 100;
  const calculateDamageAcrossTargets = (targets, getMotionValue, damageBonus, hitCritMultiplier, factorOptions = {}) =>
    targets.reduce((result, target, index) => {
      const motionValue = typeof getMotionValue === "function" ? getMotionValue(index, target) : getMotionValue;
      const targetDamageBonus = typeof damageBonus === "function" ? damageBonus(index, target) : damageBonus;
      const targetCritMultiplier = typeof hitCritMultiplier === "function"
        ? hitCritMultiplier(index, target)
        : hitCritMultiplier;
      const factors = getTargetDamageFactors(target, factorOptions);
      const damage = Math.round(combatAtk * motionValue * targetDamageBonus * targetCritMultiplier * factors.damageFactor);
      result.total += damage;
      result.peak = Math.max(result.peak, damage);
      return result;
    }, { total: 0, peak: 0 });
  const steps = [];
  const calculationWarnings = [];
  if (enemyScenario.isGenericAssumption) {
    calculationWarnings.push(isRu
      ? "Для врагов используются общие допущения режима; для точных уровней, сопротивлений и пробития нужны параметры каждого противника."
      : "Enemy lineup uses generic mode assumptions; supply options.enemies for stage-specific levels, elemental RES, and break states");
    if (enemyScenario.officialDataStatus === "outside-active-window") {
      calculationWarnings.push(isRu
        ? "Снимок игровых данных 4.7.0 больше не попадает в окно активного цикла; обновите каталог врагов, прежде чем использовать его как актуальный."
        : "The 4.7.0 game-data snapshot is outside its active challenge window; refresh the enemy catalog before treating it as current.");
    }
  } else if (enemyScenario.status === "official-stage-targets" && enemyScenario.officialEncounter) {
    const encounter = enemyScenario.officialEncounter;
    const modeNameRu = { moc: "MoC", pf: "Чистый вымысел", as: "Апокалиптическая тень" }[encounter.mode] || encounter.mode;
    const modeNameEn = { moc: "MoC", pf: "Pure Fiction", as: "Apocalyptic Shadow" }[encounter.mode] || encounter.mode;
    calculationWarnings.push(isRu
      ? `Враги взяты из активных данных ${modeNameRu} 4.7.0: этаж ${encounter.floor}, сторона ${encounter.sideNumber}, этап ${encounter.stageId}, волна ${encounter.waveNumber}/${encounter.waveCount}. По умолчанию считается только выбранная волна; бафф испытания ${encounter.challengeBuffId} пока не моделируется.`
      : `Enemies use active ${modeNameEn} 4.7.0 game data: floor ${encounter.floor}, side ${encounter.sideNumber}, stage ${encounter.stageId}, wave ${encounter.waveNumber}/${encounter.waveCount}. Only this wave is counted; challenge buff ${encounter.challengeBuffId} is not modeled.`);
    calculationWarnings.push(isRu
      ? "Итоговые HP, скорость и стойкость врагов рассчитаны по игровым конфигам. Они пока не управляют очерёдностью ходов, входящими атаками или моментом гибели в симуляции; урон использует уровень, RES и слабости."
      : "Final enemy HP, speed, and Toughness are derived from game configs. They do not yet drive turn order, enemy attacks, or defeat timing; damage currently uses level, RES, and weaknesses.");
  } else if (enemyScenario.status === "custom-generic-targets") {
    calculationWarnings.push(isRu
      ? "Список врагов всё ещё условный; заданы только отдельные параметры уровня, сопротивления или числа целей."
      : "Enemy targets still use a generic roster; only explicitly supplied level, RES, or count overrides the mode preset");
  }
  if (enemyScenario.targets.some((target) => !target.weaknesses.length)) {
    calculationWarnings.push(isRu
      ? "Не заданы слабости врагов: время пробития и эффекты, зависящие от него, не рассчитываются."
      : "Enemy weakness data is incomplete; weakness-break timing and break-triggered effects are not simulated");
  }
  if (enemyScenario.targets.some((target) => target.isBroken === null)) {
    calculationWarnings.push(isRu
      ? "Состояние стойкости врагов не задано; прямой урон рассчитан для целой шкалы стойкости."
      : "Enemy break state is unspecified; direct damage assumes an intact Toughness bar");
  }
  if (["explicit-targets", "official-stage-targets"].includes(enemyScenario.status) && enemyScenario.targets.some((target) =>
    !target.isLevelExplicit || !target.isResistanceExplicit
  )) {
    calculationWarnings.push(isRu
      ? "Для части врагов не заданы уровень или сопротивление к стихии; используются общие значения режима."
      : "Some enemies lack a specific level or elemental RES, so mode defaults are used.");
  }
  let rotationTotalDamage = 0;
  let peakHitDamage = 0;
  matchedTeammates.forEach((tm) => {
    steps.push({
      stepNumber: steps.length + 1,
      charName: tm.characterName || (isRu ? tm.nameRu || tm.names[0] : tm.nameEn || tm.names[1] || tm.names[0]),
      avatar: tm.characterIcon || null,
      phase: isRu ? "ФАЗА ПОДГОТОВКИ (БУФФЫ И ДЕБАФФЫ)" : "SETUP PHASE (BUFFS & DEBUFFS)",
      actionNameRu: `${tm.roleRu}: Активация навыка и сверхспособности`,
      actionNameEn: `${tm.roleEn}: Skill & Ultimate Activation`,
      descRu: tm.dynamicBuffDescRu || tm.buffDescRu,
      descEn: tm.dynamicBuffDescEn || tm.buffDescEn,
      damage: 0,
      isDamageAction: false,
      isEquipped: tm.isEquippedInShowcase
    });
  });
  // Character-specific kits must use exact IDs. Himeko: Nova (1510) has its
  // own configured script and must never fall through to regular Himeko (1003).
  if (kitRotation?.status !== "verified" && !SUPPORTED_MANUAL_SCENARIOS.has(charId)) return null;
  const isHimeko = charId === "1003";
  const isAcheron = charId === "1308";
  const isFirefly = charId === "1310" || name.includes("светлячок") || name.includes("firefly");
  const isFeixiao = charId === "1220" || name.includes("фэйсяо") || name.includes("feixiao");
  const isMortenax = charId === "1507" || name.includes("мортенакс") || name.includes("mortenax");
  const isJingliu = charId === "1212" || name.includes("цзинлю") || name.includes("jingliu");
  const isDHIL = charId === "1213" || name.includes("пожиратель") || name.includes("imbibitor");
  const isKafka = charId === "1005" || name.includes("кафка") || name.includes("kafka");
  const isBlackSwan = charId === "1307" || name.includes("лебедь") || name.includes("swan");
  const isBoothill = charId === "1315" || name.includes("бутхилл") || name.includes("boothill");
  const isRappa = charId === "1317" || name.includes("раппа") || name.includes("rappa");
  const isSeele = charId === "1102" || name.includes("зеле") || name.includes("seele");
  const isRatio = charId === "1305" || name.includes("рацио") || name.includes("ratio");
  const isYunli = charId === "1221" || name.includes("юньли") || name.includes("yunli");
  const isBlade = charId === "1205" || name.includes("блейд") && !isMortenax || name.includes("blade") && !isMortenax;
  const isJingYuan = charId === "1204" || name.includes("цзин юань") || name.includes("jing yuan");
  const isArgenti = charId === "1302" || name.includes("аргенти") || name.includes("argenti");
  if (kitRotation?.status === "verified") {
    const actionBuffStatuses = new Set();
    kitRotation.instances.forEach((inst) => {
      const actionTeamBuffs = getTeamBuffsForAction(squad, matchedTeammates, inst.key);
      actionBuffStatuses.add(actionTeamBuffs.status);
      const b = actionTeamBuffs.buffs;
      const actionAtkPercent = baseAttackForPercent * (Number(b.atkPercent) || 0) / 100;
      const actionAtk = baseAtk + (Number(b.atkGrant) || 0) + actionAtkPercent;
      const actionCr = Math.min(1, (baseCr + (Number(b.crGrant) || 0)) / 100);
      const actionCd = (baseCd + (Number(b.cdGrant) || 0) + kitCd) / 100;
      const actionDmgBonus = 1 + (baseDmgBoost + (Number(b.dmgBoost) || 0) + (kitRotation.passiveDmgBoost || 0)) / 100;
      const actionCritMultiplier = calculateExpectedCritMultiplier(
        actionCr * 100,
        actionCd * 100,
        Number(b.critVuln) || 0
      );
      const actionScalingStat = kitRotation.hpScale ? combatHp : actionAtk;
      const actionKitDmgBonus = actionDmgBonus;
      const selectedTargets = enemy.targetData.slice(0, Math.min(enemy.targetData.length, Math.max(1, Number(inst.targets) || 1)));
      const actionTargetFactors = selectedTargets.map((target) => getTargetDamageFactors(target, {
        defShredPercent: Number(b.defShred) || 0,
        resPenPercent: (Number(b.resPen) || 0) + kitResPen,
        vulnerabilityPercent: (Number(b.allVuln) || 0) + (Number(b.vuln) || 0)
      }));
      const instDmg = Math.round(actionScalingStat * inst.mv * inst.count * actionKitDmgBonus
        * actionCritMultiplier * actionTargetFactors.reduce((sum, factors) => sum + factors.damageFactor, 0));
      rotationTotalDamage += instDmg;
      const perHit = Math.max(0, ...actionTargetFactors.map((factors) =>
        Math.round(actionScalingStat * inst.mv * actionKitDmgBonus * actionCritMultiplier * factors.damageFactor)
      ));
      peakHitDamage = Math.max(peakHitDamage, perHit);
      steps.push({
        stepNumber: steps.length + 1,
        charName: mainChar.name,
        avatar: mainChar.avatar?.icon || null,
        phase: isRu ? inst.phaseRu : inst.phaseEn,
        actionNameRu: inst.actionRu,
        actionNameEn: inst.actionEn,
        descRu: inst.descRu,
        descEn: inst.descEn,
        damage: instDmg,
        isDamageAction: true
      });
    });
    if (actionBuffStatuses.size === 1 && actionBuffStatuses.has("verified-schedule")) {
      buffTimingStatus = "verified-schedule";
    } else if (actionBuffStatuses.size === 1 && actionBuffStatuses.has("no-numeric-buffs-configured")) {
      buffTimingStatus = "no-numeric-buffs-configured";
    }
    // Repeated ultimates need a real action-value and energy timeline. This fixed script represents only its listed damage instances.
  } else if (isHimeko) {
    const targetCount = Math.max(1, enemy.targets);
    const hasExplicitEnemyRoster = enemyScenario.status === "explicit-targets";
    const himekoDamageBonus = (baseBonus, isFollowUp = false) => (index, target) => {
      let bonus = baseBonus;
      if (hasExplicitEnemyRoster && target.hpPercent !== null && target.hpPercent <= 50) {
        bonus += equipmentEffects.eidolonDamage.conditionalLowHpDamage / 100;
        if (isFollowUp) bonus += equipmentEffects.lightConeDamage.followUpDamageAtLowHp / 100;
      }
      if (target.isBroken === true) {
        bonus += equipmentEffects.lightConeDamage.damageAfterBreak / 100;
      }
      return bonus;
    };
    const skillDescription = (mainChar.skills || []).find((skill) => skill.type === "BPSkill" || skill.type_text === "Skill")?.desc || "";
    const ultimateDescription = (mainChar.skills || []).find((skill) => skill.type === "Ultra" || skill.type_text === "Ultimate")?.desc || "";
    const talentDescription = (mainChar.skills || []).find((skill) => skill.type === "Talent")?.desc || "";
    const skillMvs = extractMotionValues(skillDescription, "Himeko");
    const ultimateMv = extractMotionValues(ultimateDescription, "Himeko")[0];
    const talentMv = extractMotionValues(talentDescription, "Himeko")[0];
    if (skillMvs.length !== 2 || extractMotionValues(ultimateDescription, "Himeko").length !== 1
      || extractMotionValues(talentDescription, "Himeko").length !== 1
      || !Number.isFinite(ultimateMv) || !Number.isFinite(talentMv)) return null;
    const skillTargetData = enemy.targetData.slice(0, Math.min(3, targetCount));
    const skillMotionValue = skillMvs[0] + skillMvs[1] * Math.max(0, skillTargetData.length - 1);
    const skillDamageBonus = equipmentEffects.lightConeDamage.skillDamage / 100;
    const skillResult = calculateDamageAcrossTargets(
      skillTargetData,
      (index) => index === 0 ? skillMvs[0] : skillMvs[1],
      himekoDamageBonus(combatDmgBonus + skillDamageBonus),
      critMultiplier
    );
    const skillDmg = skillResult.total;
    rotationTotalDamage += skillDmg;
    peakHitDamage = Math.max(peakHitDamage, skillResult.peak);
    steps.push({
      stepNumber: steps.length + 1,
      charName: mainChar.name,
      avatar: mainChar.avatar?.icon || null,
      phase: isRu ? "ХОД ДПС (НАВЫК)" : "DPS TURN (SKILL)",
      actionNameRu: "Навык «Расплавленное пламя» (Огненный взрыв по боссу и миньонам)",
      actionNameEn: "Skill: Molten Detonation (Blast Fire DMG)",
      descRu: `Множители навыка взяты из описания в профиле; учтено целей: ${targetCount} (до 2 соседних).`,
      descEn: `Skill multipliers come from the profile description; counted targets: ${targetCount} (up to 2 adjacent).`,
      damage: skillDmg,
      isDamageAction: true
    });
    const ultTargets = enemy.targetData;
    const ultMotionValue = ultimateMv * ultTargets.length;
    const ultimateDamageBonus = equipmentEffects.lightConeDamage.ultimateDamage / 100;
    let ultResult = calculateDamageAcrossTargets(
      ultTargets,
      ultimateMv,
      himekoDamageBonus(combatDmgBonus + ultimateDamageBonus),
      critMultiplier
    );
    let ultDmg = ultResult.total;
    if (equipmentEffects.eidolonDamage.extraUltimateSingleTargetRatio > 0) {
      const extraHitResult = calculateDamageAcrossTargets(
        ultTargets.slice(0, 1),
        ultimateMv * equipmentEffects.eidolonDamage.extraUltimateSingleTargetRatio,
        himekoDamageBonus(combatDmgBonus + ultimateDamageBonus),
        critMultiplier
      );
      ultDmg += extraHitResult.total;
      ultResult.peak = Math.max(ultResult.peak, extraHitResult.peak);
    }
    rotationTotalDamage += ultDmg;
    peakHitDamage = Math.max(peakHitDamage, ultResult.peak);
    steps.push({
      stepNumber: steps.length + 1,
      charName: mainChar.name,
      avatar: mainChar.avatar?.icon || null,
      phase: isRu ? "СВЕРХСПОСОБНОСТЬ (УЛЬТИМЕЙТ)" : "ULTIMATE BURST",
      actionNameRu: "Сверхспособность «Небесное пламя» (Массовый залп орбитального спутника)",
      actionNameEn: "Ultimate: Heavenly Flare (Massive Orbital Strike)",
      descRu: `${(ultimateMv * 100).toFixed(1)}% ATK каждому врагу; множитель взят из профиля. Пробитие не моделируется.`,
      descEn: `${(ultimateMv * 100).toFixed(1)}% ATK to each enemy; MV comes from the profile. Weakness break is not simulated.`,
      damage: ultDmg,
      isDamageAction: true
    });
    const followUpProcs = Number(options.followUpProcs);
    if (Number.isFinite(followUpProcs) && Math.floor(followUpProcs) > 0) {
      const fuaCritMultiplier = critMultiplier + combatCr * teamFuaCd / 100;
      const fuaDamageBonus = equipmentEffects.lightConeDamage.followUpDamage / 100;
      const fuaResult = calculateDamageAcrossTargets(
        enemy.targetData,
        talentMv,
        himekoDamageBonus(combatDmgBonus + fuaDamageBonus, true),
        fuaCritMultiplier
      );
      const fuaCount = Math.floor(followUpProcs);
      const fuaDmg = fuaResult.total * fuaCount;
      rotationTotalDamage += fuaDmg;
      peakHitDamage = Math.max(peakHitDamage, fuaResult.peak);
      steps.push({
        stepNumber: steps.length + 1,
        charName: mainChar.name,
        avatar: mainChar.avatar?.icon || null,
        phase: isRu ? "БОНУС-АТАКА (ТАЛАНТ)" : "FOLLOW-UP ATTACK",
        actionNameRu: "Талант «Победный кураж» (" + fuaCount + " заданных срабатываний)",
        actionNameEn: "Talent: Victory Rush (" + fuaCount + " configured procs)",
        descRu: (talentMv * 100).toFixed(1) + "% ATK каждому врагу; число срабатываний задано вручную, поскольку оно зависит от пробитий.",
        descEn: (talentMv * 100).toFixed(1) + "% ATK to each enemy; the proc count is a manual input because it depends on weakness breaks.",
        damage: fuaDmg,
        isDamageAction: true
      });
    } else {
      calculationWarnings.push(isRu
        ? "Бонус-атаки Химеко не включены: для них нужно задать число срабатываний после расчёта пробитий."
        : "Himeko follow-up damage omitted: set an explicit followUpProcs count after modeling enemy breaks");
    }
    if (hasSuperBreak) {
      const superBreakProcs = Number(options.superBreakProcs);
      const toughnessReduction = Number(options.superBreakToughnessReduction);
      const configuredBreakBase = Number(options.superBreakBaseDamage);
      const baseBreakDamage = Number.isFinite(configuredBreakBase) && configuredBreakBase > 0
        ? configuredBreakBase
        : charLv === 80 ? 3767.55 : null;
      if (primaryEnemy.isBroken === true
        && Number.isFinite(superBreakProcs) && Math.floor(superBreakProcs) > 0
        && Number.isFinite(toughnessReduction) && toughnessReduction > 0
        && baseBreakDamage !== null) {
        // A proc count is an explicit scenario input; team archetype alone is
        // not enough to invent break state, toughness reduction, or proc count.
        const beMultiplier = 1 + (baseBe + teamBeBoost) / 100;
        const effectiveToughnessReduction = toughnessReduction * (1 + teamBreakEff / 100);
        const breakTargetFactors = getTargetDamageFactors(primaryEnemy, {
          vulnerabilityPercent: teamVuln + teamBreakVuln,
          includeToughness: false
        });
        const oneProcDmg = baseBreakDamage * (effectiveToughnessReduction / 30)
          * beMultiplier * breakTargetFactors.damageFactor * superBreakFactor;
        const sbDmg = Math.round(oneProcDmg * Math.floor(superBreakProcs));
        rotationTotalDamage += sbDmg;
        steps.push({
          stepNumber: steps.length + 1,
          charName: isRu ? "Эффект Суперпробития" : "Super Break Proc",
          avatar: null,
          phase: isRu ? "СУПЕРПРОБИТИЕ (ОТРЯД)" : "SUPER BREAK IMPACT",
          actionNameRu: `Командное Суперпробитие (${Math.floor(superBreakProcs)} срабатыв.)`,
          actionNameEn: `Team Super Break (${Math.floor(superBreakProcs)} procs)`,
          descRu: `Оценка на заданное число срабатываний: истощение ${effectiveToughnessReduction.toFixed(0)} × ЭП ${beMultiplier.toFixed(2)} × Защита × Сопротивление × Уязвимость × ${superBreakFactor.toFixed(1)}.`,
          descEn: `Estimate for the configured proc count: ${effectiveToughnessReduction.toFixed(0)} Toughness reduction x ${beMultiplier.toFixed(2)} BE x DEF x RES x vulnerability x ${superBreakFactor.toFixed(1)}.`,
          damage: sbDmg,
          isDamageAction: true
        });
      } else {
        calculationWarnings.push("Super Break omitted: provide a broken primary target, proc count, toughness reduction, and level-specific base break damage");
      }
    }
  } else if (isAcheron) {
    const skillDescription = (mainChar.skills || []).find((skill) => skill.type === "BPSkill" || skill.type_text === "Skill")?.desc || "";
    const ultimateDescription = (mainChar.skills || []).find((skill) => skill.type === "Ultra" || skill.type_text === "Ultimate")?.desc || "";
    const talentDescription = (mainChar.skills || []).find((skill) => skill.type === "Talent")?.desc || "";
    const skillMvs = extractMotionValues(skillDescription, "Acheron");
    const rainbladeMvs = extractMotionValues(ultimateDescription, "Acheron");
    const talentMvs = extractMotionValues(talentDescription, "Acheron");
    // Skill percentages are [main, adjacent]. Ultimate percentages are
    // [overall main, overall other, Rainblade main, AoE, capped AoE, Stygian].
    if (skillMvs.length !== 2 || rainbladeMvs.length !== 6 || talentMvs.length !== 1) return null;
    const ultResReduction = talentMvs[0] * 100;

    const otherNihilityCount = matchedTeammates.filter((teammate) =>
      /nihility|небытие/i.test(`${teammate.roleRu || ""} ${teammate.roleEn || ""}`)
    ).length;
    const unlockedTraces = new Set((mainChar.skill_trees || [])
      .filter((trace) => Number(trace.level) > 0)
      .map((trace) => String(trace.id || "")));
    const hasA4 = unlockedTraces.has("1308102"); // The Abyss
    const hasA6 = unlockedTraces.has("1308103"); // Thunder Core
    const requiredNihilityForFullA4 = Number(mainChar.rank || 0) >= 2 ? 1 : 2;
    const a4Multiplier = !hasA4 ? 1
      : otherNihilityCount >= requiredNihilityForFullA4 ? 1.6
        : otherNihilityCount === 1 ? 1.15 : 1;
    const skillTargetData = enemy.targetData.slice(0, Math.min(3, enemy.targets));
    const skillTargets = Math.max(0, skillTargetData.length - 1);
    const skillMotionValue = skillMvs[0] + skillMvs[1] * skillTargets;
    const hasE6 = Number(mainChar.rank || 0) >= 6;
    const e4UltimateVulnerability = equipmentEffects.eidolonDamage.ultimateVulnerability;
    const skillResPen = teamResPen + kitResPen
      + (hasE6 ? equipmentEffects.eidolonDamage.ultimateResPen : 0);
    const getAcheronCritMultiplier = (index, target) => calculateExpectedCritMultiplier(
      combatCr * 100
        + (Number(equipmentEffects.eidolonDamage.critRateByTarget?.[target.id]) || 0)
        + (Number(equipmentEffects.lightConeDamage.critRateByTarget?.[target.id]) || 0),
      combatCd * 100 + (Number(equipmentEffects.lightConeDamage.critDamageByTarget?.[target.id]) || 0),
      teamCritVuln
    );
    const getAcheronDamageBonus = (baseBonus, index, target) =>
      baseBonus + (Number(equipmentEffects.lightConeDamage.allDamageByTarget?.[target.id]) || 0) / 100;
    const skillResult = calculateDamageAcrossTargets(
      skillTargetData,
      (index) => index === 0 ? skillMvs[0] : skillMvs[1],
      (index, target) => getAcheronDamageBonus(
        combatDmgBonus + equipmentEffects.lightConeDamage.skillDamage / 100
          + (hasE6 ? equipmentEffects.lightConeDamage.ultimateDamage / 100 : 0),
        index,
        target
      ),
      (index, target) => getAcheronCritMultiplier(index, target) * a4Multiplier,
      {
        resPenPercent: skillResPen,
        vulnerabilityPercent: teamVuln + (hasE6 ? e4UltimateVulnerability : 0)
      }
    );
    const skillDmg = skillResult.total;

    // This configured Ultimate assumes 9 Crimson Knots and three Rainblades
    // that each remove 3. Thunder Core gains +30% DMG after each slash; the
    // final AoE and its six 25%-ATK follow-up hits therefore use all 3 stacks.
    const rainbladePrimaryMv = rainbladeMvs[2];
    const rainbladeMaxAoeMv = rainbladeMvs[4];
    const finalAoeMv = rainbladeMvs[5];
    const a6BonusPerSlash = hasA6 ? 0.3 : 0;
    const mirageTargetData = skillTargetData.slice(0, Math.min(enemy.targets, 1 + skillTargets));
    const mirageTargetCount = mirageTargetData.length;
    const ultimateResPen = teamResPen + kitResPen + ultResReduction
      + equipmentEffects.eidolonDamage.ultimateResPen;
    const ultimateFactorOptions = {
      resPenPercent: ultimateResPen,
      vulnerabilityPercent: teamVuln + e4UltimateVulnerability
        + equipmentEffects.lightConeDamage.vulnerability,
      vulnerabilityByTarget: equipmentEffects.lightConeDamage.vulnerabilityByTarget
    };
    const ultimateCritMultiplier = (index, target) => getAcheronCritMultiplier(index, target) * a4Multiplier;
    let ultDmg = 0;
    let ultPeak = 0;
    for (let slash = 0; slash < 3; slash += 1) {
      const slashDmgBonus = combatDmgBonus + a6BonusPerSlash * slash
        + equipmentEffects.lightConeDamage.ultimateDamage / 100;
      const slashAoe = calculateDamageAcrossTargets(
        enemy.targetData,
        rainbladeMaxAoeMv,
        (index, target) => getAcheronDamageBonus(slashDmgBonus, index, target),
        ultimateCritMultiplier,
        ultimateFactorOptions
      );
      const slashPrimary = calculateDamageAcrossTargets(
        enemy.targetData.slice(0, 1),
        rainbladePrimaryMv,
        (index, target) => getAcheronDamageBonus(slashDmgBonus, index, target),
        ultimateCritMultiplier,
        ultimateFactorOptions
      );
      ultDmg += slashAoe.total + slashPrimary.total;
      ultPeak = Math.max(ultPeak, slashAoe.peak, slashPrimary.peak);
      if (mirageTargetCount > 0 && equipmentEffects.lightConeDamage.mirageFizzleDamage > 0) {
        const fizzleBonus = (index, target) =>
          getAcheronDamageBonus(slashDmgBonus, index, target)
            * equipmentEffects.lightConeDamage.mirageFizzleDamage / 100;
        const fizzleAoe = calculateDamageAcrossTargets(
          mirageTargetData,
          rainbladeMaxAoeMv,
          fizzleBonus,
          ultimateCritMultiplier,
          ultimateFactorOptions
        );
        const fizzlePrimary = calculateDamageAcrossTargets(
          mirageTargetData.slice(0, 1),
          rainbladePrimaryMv,
          fizzleBonus,
          ultimateCritMultiplier,
          ultimateFactorOptions
        );
        ultDmg += fizzleAoe.total + fizzlePrimary.total;
        ultPeak = Math.max(ultPeak, fizzleAoe.peak, fizzlePrimary.peak);
      }
    }
    const finalDmgBonus = combatDmgBonus + a6BonusPerSlash * 3
      + equipmentEffects.lightConeDamage.ultimateDamage / 100;
    const finalAoe = calculateDamageAcrossTargets(
      enemy.targetData,
      finalAoeMv,
      (index, target) => getAcheronDamageBonus(finalDmgBonus, index, target),
      ultimateCritMultiplier,
      ultimateFactorOptions
    );
    ultDmg += finalAoe.total;
    ultPeak = Math.max(ultPeak, finalAoe.peak);
    const randomExtraMotionValuePerTarget = hasA6 ? 0.25 * 6 / enemy.targets : 0;
    if (randomExtraMotionValuePerTarget > 0) {
      const randomExtra = calculateDamageAcrossTargets(
        enemy.targetData,
        randomExtraMotionValuePerTarget,
        (index, target) => getAcheronDamageBonus(finalDmgBonus, index, target),
        ultimateCritMultiplier,
        ultimateFactorOptions
      );
      ultDmg += randomExtra.total;
      ultPeak = Math.max(ultPeak, randomExtra.peak);
    }
    if (mirageTargetCount > 0 && equipmentEffects.lightConeDamage.mirageFizzleDamage > 0) {
      const fizzleBonus = (index, target) =>
        getAcheronDamageBonus(finalDmgBonus, index, target)
          * equipmentEffects.lightConeDamage.mirageFizzleDamage / 100;
      const finalFizzle = calculateDamageAcrossTargets(
        mirageTargetData,
        finalAoeMv,
        fizzleBonus,
        ultimateCritMultiplier,
        ultimateFactorOptions
      );
      ultDmg += finalFizzle.total;
      ultPeak = Math.max(ultPeak, finalFizzle.peak);
      if (randomExtraMotionValuePerTarget > 0) {
        const randomExtraFizzle = calculateDamageAcrossTargets(
          mirageTargetData,
          randomExtraMotionValuePerTarget,
          fizzleBonus,
          ultimateCritMultiplier,
          ultimateFactorOptions
        );
        ultDmg += randomExtraFizzle.total;
        ultPeak = Math.max(ultPeak, randomExtraFizzle.peak);
      }
    }
    rotationTotalDamage += skillDmg + ultDmg;
    peakHitDamage = Math.max(skillResult.peak, ultPeak);
    steps.push({
      stepNumber: steps.length + 1,
      charName: mainChar.name,
      phase: isRu ? "ХОД ДПС (НАВЫК)" : "DPS TURN (SKILL)",
      actionNameRu: "Навык «Восьмикратный раскол» (одна цель + соседние)",
      actionNameEn: "Skill: Octobolt Flash (main target + adjacent targets)",
      descRu: `Множители взяты из описания навыка профиля; учтено соседних целей: ${skillTargets}. След A4 ${hasA4 ? `даёт ×${a4Multiplier.toFixed(2)} при ${otherNihilityCount} союзниках Небытия` : "не найден в профиле"}.`,
      descEn: `Motion values come from the profile skill description; adjacent targets counted: ${skillTargets}. A4 ${hasA4 ? `gives ×${a4Multiplier.toFixed(2)} with ${otherNihilityCount} Nihility teammates` : "was not found in the profile"}.`,
      damage: skillDmg,
      isDamageAction: true
    });
    steps.push({
      stepNumber: steps.length + 1,
      charName: mainChar.name,
      phase: isRu ? "СВЕРХСПОСОБНОСТЬ (УЛЬТИМЕЙТ)" : "ULTIMATE BURST",
      actionNameRu: "Сверхспособность (9 узлов, 3 Rainblade + Stygian Resurge)",
      actionNameEn: "Ultimate (9 Knots, 3 Rainblades + Stygian Resurge)",
      descRu: `Сценарий максимальных 9 узлов. Учтены A4 ×${a4Multiplier.toFixed(2)}, снижение RES на ${ultResReduction}% по уровню следа${hasA6 ? " и 6 дополнительных ударов A6 по 25% ATK" : "; след A6 не найден, дополнительные удары исключены"}. AoE считает ${enemy.targets} целей.${equipmentEffects.lightConeDamage.mirageFizzleDamage > 0 ? ` Миражное затмение учтено для ${mirageTargetCount} целей, поражённых навыком; основная цель ульты считается одной из них.` : ""}`,
      descEn: `Maximum 9-Knot scenario. Includes A4 ×${a4Multiplier.toFixed(2)}, ${ultResReduction}% RES reduction from the profile trace level${hasA6 ? " and six A6 follow-up hits at 25% ATK" : "; A6 was not found, so its extra hits are excluded"}. AoE counts ${enemy.targets} targets.${equipmentEffects.lightConeDamage.mirageFizzleDamage > 0 ? ` Mirage Fizzle applies to the ${mirageTargetCount} targets hit by Skill; the Ultimate's primary target is assumed to be one of them.` : ""}`,
      damage: ultDmg,
      isDamageAction: true
    });
  } else if (isFirefly) {
    const baseBreakLv80 = 3767.55;
    const beMultiplier = 1 + (baseBe + teamBeBoost) / 100;
    const effectiveToughnessReduction = 60 * (1 + teamBreakEff / 100);
    const sbDmg = Math.round(baseBreakLv80 * (effectiveToughnessReduction / 30) * beMultiplier * defMult * resMult * (1 + (teamVuln + teamBreakVuln) / 100) * 2.5);
    rotationTotalDamage += sbDmg;
    peakHitDamage = sbDmg;
    steps.push({
      stepNumber: steps.length + 1,
      charName: mainChar.name,
      phase: isRu ? "УСИЛЕННЫЙ НАВЫК" : "ENHANCED SKILL",
      actionNameRu: "Навык «Смертоносная звезда» (Огненное суперпробитие)",
      actionNameEn: "Skill: Deathstar Overload (Super Break)",
      damage: sbDmg,
      isDamageAction: true
    });
  } else if (isFeixiao) {
    const skillDmg = Math.round(combatAtk * 2 * combatDmgBonus * critMultiplier * defMult * resMult * vulnMult);
    const fuaCritMultiplier = critMultiplier + combatCr * teamFuaCd / 100;
    const fuaDmg = Math.round(combatAtk * 1.1 * 3 * (combatDmgBonus + 0.3) * fuaCritMultiplier * defMult * resMult * vulnMult);
    const ultDmg = Math.round(combatAtk * 7 * (combatDmgBonus + 0.6) * critMultiplier * defMult * resMult * vulnMult);
    rotationTotalDamage += skillDmg + fuaDmg + ultDmg;
    peakHitDamage = ultDmg;
    steps.push({
      stepNumber: steps.length + 1,
      charName: mainChar.name,
      phase: isRu ? "НАВЫК И БОНУС-АТАКИ" : "SKILL & FUA",
      actionNameRu: "Навык «Рассечение вихря» + Совместные бонус-атаки",
      actionNameEn: "Skill: Waraxe Cleave + Follow-up Strikes",
      damage: skillDmg + fuaDmg,
      isDamageAction: true
    });
    steps.push({
      stepNumber: steps.length + 1,
      charName: mainChar.name,
      phase: isRu ? "СВЕРХСПОСОБНОСТЬ" : "ULTIMATE BURST",
      actionNameRu: "Сверхспособность «Великое сияние Небес» (6-12 зарядов ауреуса)",
      actionNameEn: "Ultimate: Terrasplit (Flying Aureus Finisher)",
      damage: ultDmg,
      isDamageAction: true
    });
  } else if (isJingliu) {
    const skillDmg = Math.round(combatAtk * 2.5 * (combatDmgBonus + 0.5) * (critMultiplier * 1.25) * defMult * resMult * vulnMult);
    const ultDmg = Math.round(combatAtk * 3 * (combatDmgBonus + 0.7) * (critMultiplier * 1.25) * defMult * resMult * vulnMult);
    rotationTotalDamage += skillDmg + ultDmg;
    peakHitDamage = ultDmg;
    steps.push({
      stepNumber: steps.length + 1,
      charName: mainChar.name,
      phase: isRu ? "ТРАНСМИГРАЦИЯ (НАВЫК)" : "TRANSMIGRATION SKILL",
      actionNameRu: "Усиленный навык «Лунный покров» (Взрыв по площади)",
      actionNameEn: "Enhanced Skill: Moon on Glacial River",
      damage: skillDmg,
      isDamageAction: true
    });
    steps.push({
      stepNumber: steps.length + 1,
      charName: mainChar.name,
      phase: isRu ? "СВЕРХСПОСОБНОСТЬ" : "ULTIMATE BURST",
      actionNameRu: "Сверхспособность «Быстротечные мгновения снегопада»",
      actionNameEn: "Ultimate: Florephemeral Dreamflux",
      damage: ultDmg,
      isDamageAction: true
    });
  } else if (isDHIL) {
    const leapDmg = Math.round(combatAtk * 5 * (combatDmgBonus + 0.6) * critMultiplier * defMult * resMult * vulnMult);
    const ultDmg = Math.round(combatAtk * 3 * combatDmgBonus * critMultiplier * defMult * resMult * vulnMult);
    rotationTotalDamage += leapDmg + ultDmg;
    peakHitDamage = leapDmg;
    steps.push({
      stepNumber: steps.length + 1,
      charName: mainChar.name,
      phase: isRu ? "3-SP УСИЛЕННЫЙ НАВЫК" : "3-SP FULGURANT LEAP",
      actionNameRu: "Удар 3-SP «Сверкающий скачок» (7 ударов с нарастающим КУ)",
      actionNameEn: "Enhanced Attack: Fulgurant Leap (7-hit blast)",
      damage: leapDmg,
      isDamageAction: true
    });
    steps.push({
      stepNumber: steps.length + 1,
      charName: mainChar.name,
      phase: isRu ? "СВЕРХСПОСОБНОСТЬ" : "ULTIMATE BURST",
      actionNameRu: "Сверхспособность «Очищение дракона» (+2 Чешуи дракона)",
      actionNameEn: "Ultimate: Azures Cleansing (Dragon Scales)",
      damage: ultDmg,
      isDamageAction: true
    });
  } else if (isKafka) {
    const skillDmg = Math.round(combatAtk * 1.6 * combatDmgBonus * defMult * resMult * vulnMult);
    const detonateDmg = Math.round(combatAtk * 3.2 * combatDmgBonus * defMult * resMult * vulnMult);
    const ultDmg = Math.round(combatAtk * 4.5 * combatDmgBonus * defMult * resMult * vulnMult);
    rotationTotalDamage += skillDmg + detonateDmg + ultDmg;
    peakHitDamage = ultDmg;
    steps.push({
      stepNumber: steps.length + 1,
      charName: mainChar.name,
      phase: isRu ? "НАВЫК И ДЕТОНАЦИЯ" : "SKILL & DETONATION",
      actionNameRu: "Навык «Ласковый полумрак» (Взрыв 75% всех ДоТов)",
      actionNameEn: "Skill: Caressing Moonlight (DoT Trigger)",
      damage: skillDmg + detonateDmg,
      isDamageAction: true
    });
    steps.push({
      stepNumber: steps.length + 1,
      charName: mainChar.name,
      phase: isRu ? "СВЕРХСПОСОБНОСТЬ" : "ULTIMATE BURST",
      actionNameRu: "Сверхспособность «Сумеречная трель» (100% детонация ДоТов + Шок)",
      actionNameEn: "Ultimate: Twilight Trill (AoE DoT Cascade)",
      damage: ultDmg,
      isDamageAction: true
    });
  } else if (isMortenax) {
    // Skill availability depends on current HP and Infinite Fury state. The
    // profile contains Max HP, but not current HP or a healing/action timeline.
    // Do not turn a conditional hit into a rotation total.
    return null;
  } else if (isBlade) {
    const hpStat = combatHp;
    const skillDmg = Math.round(hpStat * 1.68 * combatDmgBonus * critMultiplier * defMult * resMult * vulnMult);
    const ultDmg = Math.round(hpStat * 2.2 * (combatDmgBonus + 0.3) * critMultiplier * defMult * resMult * vulnMult);
    rotationTotalDamage += skillDmg + ultDmg;
    peakHitDamage = Math.max(skillDmg, ultDmg);
    steps.push({
      stepNumber: steps.length + 1,
      charName: mainChar.name,
      phase: isRu ? "ХОД ДПС (НАВЫК HP)" : "HP SKILL TURN",
      actionNameRu: "Усиленный боевой навык расхода HP",
      actionNameEn: "Enhanced HP-Draining Combat Strike",
      damage: skillDmg,
      isDamageAction: true
    });
    steps.push({
      stepNumber: steps.length + 1,
      charName: mainChar.name,
      phase: isRu ? "СВЕРХСПОСОБНОСТЬ" : "ULTIMATE BURST",
      actionNameRu: "Сверхспособность (Масштабирование от потерянного HP)",
      actionNameEn: "Ultimate Burst (HP Scaling)",
      damage: ultDmg,
      isDamageAction: true
    });
  } else if (isWolf999) {
    const skillDmg = Math.round(combatAtk * 2.8 * combatDmgBonus * critMultiplier * defMult * resMult * vulnMult);
    const ultDmg = Math.round(combatAtk * 6.5 * (combatDmgBonus + 0.5) * (critMultiplier * 1.3) * defMult * resMult * vulnMult);
    const lootBoxDmg = Math.round(combatAtk * 2.4 * combatDmgBonus * defMult * resMult * vulnMult);
    rotationTotalDamage += skillDmg + ultDmg + lootBoxDmg;
    peakHitDamage = ultDmg;
    steps.push({
      stepNumber: steps.length + 1,
      charName: mainChar.name,
      phase: isRu ? "ХОД ГИПЕРКЕРРИ РАДОСТИ (НАВЫК)" : "ELATION HYPERCARRY TURN (SKILL)",
      actionNameRu: "Навык «Взлом кода Радости» (Взрывной урон + срез -45% DEF)",
      actionNameEn: "Skill: Elation Code Hack (Burst DMG + -45% DEF Shred)",
      damage: skillDmg,
      isDamageAction: true
    });
    steps.push({
      stepNumber: steps.length + 1,
      charName: mainChar.name,
      phase: isRu ? "ЗОНА «GOD MODE: ON!» (СВЕРХСПОСОБНОСТЬ)" : "«GOD MODE: ON!» ZONE (ULTIMATE)",
      actionNameRu: "Сверхспособность «God Mode: ON!» (Массивный оверкрит-залп Радости)",
      actionNameEn: "Ultimate: God Mode: ON! (Massive Elation Overcrit Burst)",
      damage: ultDmg,
      isDamageAction: true
    });
    steps.push({
      stepNumber: steps.length + 1,
      charName: isRu ? "Механика Топового Лутбокса" : "Top Loot Box Procs",
      phase: isRu ? "ТОПОВЫЙ ЛУТБОКС (ЧИСТЫЙ УРОН)" : "TOP LOOT BOX (TRUE DMG)",
      actionNameRu: "Активация Топового Лутбокса (Панчлайны + Чистый урон)",
      actionNameEn: "Top Loot Box Activation (Punchlines + True DMG)",
      damage: lootBoxDmg,
      isDamageAction: true
    });
  } else if (isAvenSurging) {
    const comboDmg = Math.round(combatAtk * 4.8 * (combatDmgBonus + 0.5) * critMultiplier * defMult * resMult * vulnMult);
    const ahaInstantDmg = Math.round(combatAtk * 3.6 * (combatDmgBonus + 0.5) * critMultiplier * defMult * resMult * vulnMult);
    rotationTotalDamage += comboDmg + ahaInstantDmg;
    peakHitDamage = comboDmg;
    steps.push({
      stepNumber: steps.length + 1,
      charName: mainChar.name,
      phase: isRu ? "ХОД ДАМАГЕРА РАДОСТИ (КОМБО)" : "ELATION DPS TURN (COMBO)",
      actionNameRu: "Навык «Ставка на прибой» (След «Revel in Surging Waves» +100% статов Радости)",
      actionNameEn: "Skill: Waveflair Wager («Revel in Surging Waves» +100% Elation stats)",
      damage: comboDmg,
      isDamageAction: true
    });
    steps.push({
      stepNumber: steps.length + 1,
      charName: mainChar.name,
      phase: isRu ? "ФАЗА AHA INSTANT (ЦЕПНЫЕ АТАКИ)" : "AHA INSTANT PHASE (CHAIN ATTACKS)",
      actionNameRu: "Цепные атаки Радости в синергии со СВ ур. 999 (+15% крит. уязвимости)",
      actionNameEn: "Chain Elation Strikes with SW Lv.999 (+15% Crit Vuln)",
      damage: ahaInstantDmg,
      isDamageAction: true
    });
  } else {
    // Unknown kits and role-based placeholder damage must not be presented as
    // a character rotation. Add an explicit, sourced kit profile first.
    return null;
  }
  return {
    rotationTotalDamage,
    peakHitDamage,
    steps,
    enemyMode,
    enemyScenarioStatus: enemyScenario.status,
    enemyScenarioInfo: enemyScenario.officialEncounter,
    enemyTargets: enemy.targetData,
    targetCount: enemy.targets,
    enemyLevel: enemyLv,
    baseEnemyRes,
    enemyResistancePercent: baseEnemyRes * 100,
    buffTimingStatus,
    equipmentEffects,
    calculationWarnings,
    combatTimeline,
    combatTimelineStatus: combatTimeline?.status || "not-configured",
    teamBuffStatus: buffTimingStatus === "verified-schedule"
      ? "verified-per-hit-schedule"
      : hasAppliedTeamBuffValues ? "explicit-values-assumed-full-uptime" : "no-numeric-buffs-configured",
    calculationStatus: "manual-script-estimate",
    combatStats: {
      combatAtk,
      combatHp,
      combatCr: (combatCr * 100).toFixed(1),
      combatCd: (combatCd * 100).toFixed(1),
      critMultiplier: critMultiplier.toFixed(2),
      totalDefShred: (totalDefShred * 100).toFixed(1),
      resMult: resMult.toFixed(2),
      vulnMult: damageTakenMult.toFixed(2),
      toughnessMultiplier: toughnessMultiplier.toFixed(2)
    },
    hasUnmodeledAtkPercent: teamAtkPercent > 0 && baseAttackForPercent <= 0
  };
}
