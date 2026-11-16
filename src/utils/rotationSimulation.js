import { ROTATIONS } from "../data/rotations.js";
import { getTeamBuffsForAction } from "./buffTimeline.js";
import { resolveCombatEquipmentEffects } from "./combatEquipmentEffects.js";
import { resolveEnemyScenario } from "./enemyScenario.js";
import { simulateCombatTimeline } from "./combatTimeline.js";
import {
  BREAK_DOT_CONFIG,
  BREAK_INSTANT_ELEMENT_MULTIPLIERS,
  calculateBreakBaseDamage,
  calculateBreakInstantDamage,
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
  const enemyMode = options.enemyMode || "moc";
  const enemyScenario = resolveEnemyScenario(options, enemyMode, mainChar.element?.id || mainChar.element || "");
  const timelineInputActors = Array.isArray(options.timelineScenario?.actors)
    ? options.timelineScenario.actors
    : [];
  const hasTimelineEnemyActors = timelineInputActors.some((actor) => actor?.kind === "enemy");
  const timelineSeedEnemies = options.timelineScenario && !hasTimelineEnemyActors
    && enemyScenario.status === "explicit-targets"
    ? enemyScenario.targets.map((target) => ({
      id: target.id,
      name: target.name || target.id,
      kind: "enemy",
      level: target.isLevelExplicit ? target.level : null,
      maxHp: target.maxHp,
      currentHp: target.currentHp,
      maxToughness: target.maxToughness,
      currentToughness: target.isToughnessExplicit ? target.currentToughness : null,
      isBroken: target.isBreakStateExplicit ? target.isBroken : null,
      weaknesses: target.weaknesses,
      resistancePercent: target.isScalarResistanceExplicit ? target.resistancePercent : null,
      resistancesPercent: target.resistancesPercent,
      resistanceDataComplete: target.resistanceDataComplete,
      vulnerabilityPercent: target.vulnerabilityPercent,
      critVulnerabilityPercent: target.critVulnerabilityPercent,
      defenseReductionPercent: target.defenseReductionPercent,
      actions: []
    }))
    : [];
  const combatTimeline = options.timelineScenario && typeof options.timelineScenario === "object"
    ? simulateCombatTimeline({
      ...options.timelineScenario,
      actors: [...timelineInputActors, ...timelineSeedEnemies]
    })
    : null;
  const usesExplicitTimeline = Boolean(combatTimeline && combatTimeline.status !== "invalid-input");
  const timelineEnemyActors = usesExplicitTimeline
    ? combatTimeline.actors.filter((actor) => actor.kind === "enemy")
    : [];
  const timelineEnemyTargets = timelineEnemyActors.map((actor) => ({
    id: actor.id,
    name: actor.name,
    level: actor.level,
    resistancePercent: actor.resistancePercent,
    resistances: actor.resistancesPercent,
    weaknesses: actor.weaknesses,
    isBroken: actor.isBroken,
    currentHp: actor.hp,
    maxHp: actor.maxHp,
    currentToughness: actor.toughness,
    maxToughness: actor.maxToughness,
    vulnerabilityPercent: actor.vulnerabilityPercent,
    derivedStats: null,
    derivedStatsStatus: "explicit-timeline-input"
  }));
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
  if (!usesExplicitTimeline) matchedTeammates.forEach((tm) => {
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
  // Статуси ротації: "verified" (повна часова шкала підтверджена) або "kit-verified"
  // (множники й енергія з офіційного кіта, число повторів за цикл — документований допущення).
  const KIT_ROTATION_STATUSES = new Set(["verified", "kit-verified"]);
  const kitRotation = ROTATIONS[charId] || null;
  const kitRotationSupported = kitRotation && KIT_ROTATION_STATUSES.has(kitRotation.status);
  const kitCd = (kitRotation && kitRotation.passiveCritDmg) || 0;
  const kitResPen = (kitRotation && kitRotation.passiveResPen) || 0;
  // Безусловные следы кита: +CRIT Rate (Гиацина A2 «Gloomy Grin», +100% ей и
  // Little Ica) — применяется ко всем инстансам ротации. Условная часть следа
  // (+25% Outgoing Healing при лечении цели <=50% HP) не моделируется.
  const kitCritRate = (kitRotation && kitRotation.passiveCritRate) || 0;
  // Состояние «After Rain» (Гиацина): +30% Max HP и +600 всем союзникам — влияет
  // только на инстансы, помеченные inAfterRain: true.
  const kitHpPercent = (kitRotation && kitRotation.passiveHpPercent) || 0;
  const kitHpFlat = (kitRotation && kitRotation.passiveHpFlat) || 0;
  // Безусловный внутриоконный бонус ЭП (Светлячок A2 «Antilag Outburst»: +25% ЭП
  // в состоянии Complete Combustion). Все инстансы окна помечены
  // inCompleteCombustion: true, поэтому аптайм гарантирован структурой цикла.
  const kitBeBonus = (kitRotation && kitRotation.beBonusPercent) || 0;
  // Сумма накопленного лечения — явный ввод сценария (урон Little Ica считается
  // от неё). Движок сам её не придумывает.
  const healingTally = Math.max(0, Number(options.healingTally) || 0);
  const primaryEnemy = enemyScenario.targets[0];
  const enemy = {
    lv: primaryEnemy.level,
    res: primaryEnemy.resistancePercent / 100,
    targets: enemyScenario.targetCount,
    targetData: enemyScenario.targets
  };
  const defenseIgnorePercent = Math.max(0, Number(options.defenseIgnorePercent) || 0);
  const totalDefShred = Math.min(1, Math.max(0,
    (teamDefShred + (Number(primaryEnemy.defenseReductionPercent) || 0)) / 100));
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
    // Target-scoped DEF reductions can come from the explicit encounter state
    // (for example, a debuff applied before this packet). Previously the field
    // was parsed but silently dropped from every manual hit calculation.
    const effectiveDefShred = defShredPercent + (Number(target.defenseReductionPercent) || 0);
    const defense = calculateDefenseMultiplier(
      charLv, target.level, effectiveDefShred, defenseIgnorePercent
    );
    const resistance = calculateResistanceMultiplier(target.resistancePercent / 100, resPenPercent);
    const toughness = includeToughness ? calculateToughnessMultiplier(target.isBroken) : 1;
    const vulnerability = 1 + (vulnerabilityPercent + target.vulnerabilityPercent
      + (Number(vulnerabilityByTarget[target.id]) || 0)) / 100;
    const damageReduction = Math.max(0, 1 - (Number(target.damageReductionPercent) || 0) / 100)
      * Math.max(0, 1 - (Number(target.universalDamageReductionPercent) || 0) / 100);
    return {
      defMult: defense,
      resMult: resistance,
      toughnessMultiplier: toughness,
      vulnMult: vulnerability * toughness,
      damageReductionMultiplier: damageReduction,
      damageFactor: defense * resistance * vulnerability * damageReduction * toughness
    };
  };
  const primaryTargetFactors = getTargetDamageFactors(primaryEnemy);
  const defMult = primaryTargetFactors.defMult;
  const resMult = primaryTargetFactors.resMult;
  const toughnessMultiplier = primaryTargetFactors.toughnessMultiplier;
  // Without a break-state timeline, direct hits assume an active Toughness bar.
  // Super Break instances below assume the target is already broken.
  const vulnMult = primaryTargetFactors.vulnMult * primaryTargetFactors.damageReductionMultiplier;
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
  if (!usesExplicitTimeline && enemyScenario.isGenericAssumption) {
    calculationWarnings.push(isRu
      ? "Для врагов используются общие допущения режима; для точных уровней, сопротивлений и пробития нужны параметры каждого противника."
      : "Enemy lineup uses generic mode assumptions; supply options.enemies for stage-specific levels, elemental RES, and break states");
    if (enemyScenario.officialDataStatus === "outside-active-window") {
      calculationWarnings.push(isRu
        ? "Снимок игровых данных 4.7.0 больше не попадает в окно активного цикла; обновите каталог врагов, прежде чем использовать его как актуальный."
        : "The 4.7.0 game-data snapshot is outside its active challenge window; refresh the enemy catalog before treating it as current.");
    }
  } else if (!usesExplicitTimeline && enemyScenario.status === "official-stage-targets" && enemyScenario.officialEncounter) {
    const encounter = enemyScenario.officialEncounter;
    const modeNameRu = { moc: "MoC", pf: "Чистый вымысел", as: "Апокалиптическая тень" }[encounter.mode] || encounter.mode;
    const modeNameEn = { moc: "MoC", pf: "Pure Fiction", as: "Apocalyptic Shadow" }[encounter.mode] || encounter.mode;
    calculationWarnings.push(isRu
      ? `Враги взяты из активных данных ${modeNameRu} 4.7.0: этаж ${encounter.floor}, сторона ${encounter.sideNumber}, этап ${encounter.stageId}, волна ${encounter.waveNumber}/${encounter.waveCount}. По умолчанию считается только выбранная волна; бафф испытания ${encounter.challengeBuffId} пока не моделируется.`
      : `Enemies use active ${modeNameEn} 4.7.0 game data: floor ${encounter.floor}, side ${encounter.sideNumber}, stage ${encounter.stageId}, wave ${encounter.waveNumber}/${encounter.waveCount}. Only this wave is counted; challenge buff ${encounter.challengeBuffId} is not modeled.`);
    calculationWarnings.push(isRu
      ? "Итоговые HP, скорость и стойкость врагов рассчитаны по игровым конфигам. Они пока не управляют очерёдностью ходов, входящими атаками или моментом гибели в симуляции; урон использует уровень, RES и слабости."
      : "Final enemy HP, speed, and Toughness are derived from game configs. They do not yet drive turn order, enemy attacks, or defeat timing; damage currently uses level, RES, and weaknesses.");
  } else if (!usesExplicitTimeline && enemyScenario.status === "custom-generic-targets") {
    calculationWarnings.push(isRu
      ? "Список врагов всё ещё условный; заданы только отдельные параметры уровня, сопротивления или числа целей."
      : "Enemy targets still use a generic roster; only explicitly supplied level, RES, or count overrides the mode preset");
  }
  if (!usesExplicitTimeline && enemyScenario.targets.some((target) => !target.weaknesses.length)) {
    calculationWarnings.push(isRu
      ? "Не заданы слабости врагов: время пробития и эффекты, зависящие от него, не рассчитываются."
      : "Enemy weakness data is incomplete; weakness-break timing and break-triggered effects are not simulated");
  }
  if (!usesExplicitTimeline && enemyScenario.targets.some((target) => target.isBroken === null)) {
    calculationWarnings.push(isRu
      ? "Состояние стойкости врагов не задано; прямой урон рассчитан для целой шкалы стойкости."
      : "Enemy break state is unspecified; direct damage assumes an intact Toughness bar");
  }
  if (!usesExplicitTimeline && ["explicit-targets", "official-stage-targets"].includes(enemyScenario.status) && enemyScenario.targets.some((target) =>
    !target.isLevelExplicit || !target.isResistanceExplicit
  )) {
    calculationWarnings.push(isRu
      ? "Для части врагов не заданы уровень или сопротивление к стихии; используются общие значения режима."
      : "Some enemies lack a specific level or elemental RES, so mode defaults are used.");
  }
  let rotationTotalDamage = 0;
  let peakHitDamage = 0;
  if (!usesExplicitTimeline) matchedTeammates.forEach((tm) => {
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
  if (!usesExplicitTimeline && !kitRotationSupported && !SUPPORTED_MANUAL_SCENARIOS.has(charId)) return null;
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
  if (usesExplicitTimeline) {
    rotationTotalDamage = combatTimeline.alliedEffectiveDamageTotal ?? combatTimeline.alliedDamageTotal ?? 0;
    buffTimingStatus = "timeline-scenario";
    calculationWarnings.push(...combatTimeline.warnings);
    calculationWarnings.push(...(combatTimeline.assumptions || []));
    calculationWarnings.push(isRu
      ? "Конусы, эйдолоны и пассивные бонусы профиля не добавляются в пользовательский таймлайн автоматически; их итоговые боевые статы и эффекты должны быть явно заданы в сценарии."
      : "Light Cones, Eidolons, and profile passives are not injected into a custom timeline; their final combat stats and effects must be explicit in the scenario.");
    combatTimeline.events
      .filter((event) => event.actorKind === "ally")
      .forEach((event) => {
        const outgoingHits = event.damage.filter((hit) => hit.targetKind === "enemy");
        const effectiveDamage = (hit) => Number(hit.hpDamage || 0) + Number(hit.shieldAbsorbed || 0);
        const damage = outgoingHits.reduce((sum, hit) => sum + effectiveDamage(hit), 0);
        peakHitDamage = Math.max(peakHitDamage, ...outgoingHits.map(effectiveDamage));
        steps.push({
          stepNumber: steps.length + 1,
          charName: event.actorName,
          avatar: event.actorId === charId ? mainChar.avatar?.icon || null : null,
          phase: `${isRu ? "ХОД" : "ACTION"} ${event.turn} · AV ${event.actionValue}`,
          actionNameRu: event.actionName,
          actionNameEn: event.actionName,
          descRu: event.status === "blocked"
            ? `Действие пропущено: ${event.blockedBy || "ресурс недоступен"}.`
            : `Энергия после действия: ${event.energyAfter ?? "—"}; ОН после действия: ${event.skillPointsAfter ?? "—"}.`,
          descEn: event.status === "blocked"
            ? `Action blocked: ${event.blockedBy || "resource unavailable"}.`
            : `Energy after action: ${event.energyAfter ?? "—"}; SP after action: ${event.skillPointsAfter ?? "—"}.`,
          damage,
          isDamageAction: outgoingHits.length > 0
        });
      });
  } else if (kitRotationSupported) {
    const actionBuffStatuses = new Set();
    if (kitRotation.status === "kit-verified") {
      calculationWarnings.push(isRu
        ? "Ротация построена по официальным множителям и энергии кита (Prydwen, обновление из OSPROD). Число повторов за цикл — документированное допущение; условные пассивы с неподтверждённым аптаймом и энергия союзников не учитываются."
        : "The rotation uses official kit multipliers and energy (Prydwen, OSPROD-sourced). Per-cycle repeat counts are a documented assumption; conditional passives with unverified uptime and ally energy feed are not modeled.");
    }
    // Эффект пробития (BE) в долях, ограниченный явным капом кита (например, 360% у Светлячка).
    const beCapFraction = kitRotation.beCapPercent != null
      ? Math.max(0, Number(kitRotation.beCapPercent)) / 100
      : Number.POSITIVE_INFINITY;
    const beFraction = Math.min(Math.max(0, Number(mainStats.be || 0)) / 100, beCapFraction);
    kitRotation.instances.forEach((inst) => {
      const actionTeamBuffs = getTeamBuffsForAction(squad, matchedTeammates, inst.key);
      actionBuffStatuses.add(actionTeamBuffs.status);
      const b = actionTeamBuffs.buffs;
      const actionAtkPercent = baseAttackForPercent * (Number(b.atkPercent) || 0) / 100;
      const actionAtk = baseAtk + (Number(b.atkGrant) || 0) + actionAtkPercent;
      const actionCr = Math.min(1, (baseCr + (Number(b.crGrant) || 0) + kitCritRate) / 100);
      const actionCd = (baseCd + (Number(b.cdGrant) || 0) + kitCd) / 100;
      // inst.extraDmgPercent: усилители, действующие только на конкретный
      // инстанс (Талант Гиацины +80%x3 урона — только для Little Ica).
      const actionDmgBonus = 1 + (baseDmgBoost + (Number(b.dmgBoost) || 0) + (kitRotation.passiveDmgBoost || 0)
        + (Number(inst.extraDmgPercent) || 0)) / 100;
      const actionCritMultiplier = calculateExpectedCritMultiplier(
        actionCr * 100,
        actionCd * 100,
        Number(b.critVuln) || 0
      );
      const actionScalingStat = inst.healTallyFraction != null
        ? healingTally * Number(inst.healTallyFraction)
        : kitRotation.hpScale
          ? (inst.inAfterRain ? combatHp * (1 + kitHpPercent / 100) + kitHpFlat : combatHp)
          : actionAtk;
      const actionKitDmgBonus = actionDmgBonus;
      const selectedTargets = enemy.targetData.slice(0, Math.min(enemy.targetData.length, Math.max(1, Number(inst.targets) || 1)));
      // Множитель на цель: главный таргет — inst.mv (+ BE-часть), остальные — adjacentMv
      // (для AoE без adjacentMv значения совпадают со старым поведением).
      const primaryMv = Number(inst.mv) + (Number(inst.beScale) || 0)
        * (inst.inCompleteCombustion ? Math.min((Number(mainStats.be || 0) + kitBeBonus) / 100, beCapFraction) : beFraction);
      const adjacentMvBase = inst.adjacentMv !== undefined ? Number(inst.adjacentMv) : Number(inst.mv);
      const adjacentBeScale = inst.beScaleAdjacent !== undefined ? Number(inst.beScaleAdjacent) : (Number(inst.beScale) || 0);
      const targetMotionValues = selectedTargets.map((target, index) => {
        const mv = index === 0 ? primaryMv : adjacentMvBase + adjacentBeScale
          * (inst.inCompleteCombustion ? Math.min((Number(mainStats.be || 0) + kitBeBonus) / 100, beCapFraction) : beFraction);
        const factors = getTargetDamageFactors(target, {
          defShredPercent: Number(b.defShred) || 0,
          resPenPercent: (Number(b.resPen) || 0) + kitResPen,
          vulnerabilityPercent: (Number(b.allVuln) || 0) + (Number(b.vuln) || 0)
        });
        return mv * factors.damageFactor;
      });
      const instDmg = Math.round(actionScalingStat * inst.count * actionKitDmgBonus
        * actionCritMultiplier * targetMotionValues.reduce((sum, weighted) => sum + weighted, 0));
      rotationTotalDamage += instDmg;
      const perHit = Math.max(0, ...targetMotionValues.map((weighted) =>
        Math.round(actionScalingStat * inst.count * actionKitDmgBonus * actionCritMultiplier * weighted)
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
    // Проверка энергетического баланса цикла: суммарный прирост энергии заполнителей
    // должен покрывать стоимость сверхспособности (без учёта энергии союзников — намеренно).
    // ERR профиля (sp_rate) умножает плоский прирост энергии от способностей.
    const energyCycle = kitRotation.energy;
    if (energyCycle && Number(energyCycle.ultCost) > 0) {
      const energyRegenRate = 1 + (Number(mainStats.sp_rate) || 0) / 100;
      const fillerGain = kitRotation.instances
        .filter((inst) => !inst.isUlt)
        .reduce((sum, inst) => sum + (Number(inst.energyGain) || 0) * Math.max(1, Number(inst.count) || 1), 0)
        * energyRegenRate;
      const startEnergy = Number(energyCycle.startEnergyPercent || 0) / 100 * Number(energyCycle.ultCost)
        + (Number(energyCycle.startEnergyFlat) || 0);
      if (fillerGain + startEnergy < Number(energyCycle.ultCost)) {
        calculationWarnings.push(isRu
          ? `Энергетический цикл не замыкается без энергии союзников: ${Math.round(fillerGain + startEnergy)} < ${Math.round(energyCycle.ultCost)}.`
          : `The energy cycle does not close without ally energy feed: ${Math.round(fillerGain + startEnergy)} < ${Math.round(energyCycle.ultCost)}.`);
      }
    }
    if (actionBuffStatuses.size === 1 && actionBuffStatuses.has("verified-schedule")) {
      buffTimingStatus = "verified-schedule";
    } else if (actionBuffStatuses.size === 1 && actionBuffStatuses.has("no-numeric-buffs-configured")) {
      buffTimingStatus = "no-numeric-buffs-configured";
    }
    // Урон мемо-спрайта от накопленного лечения (Гиацина): если tally не задан,
    // шаг остаётся с нулевым уроном и выдаётся явное предупреждение.
    const usesHealTally = kitRotation.instances.some((inst) => inst.healTallyFraction != null);
    if (usesHealTally && !(healingTally > 0)) {
      calculationWarnings.push(isRu
        ? "Урон Little Ica считается от накопленного лечения: задайте сумму лечения в поле ввода сценария."
        : "Little Ica damage scales with accumulated healing: set the healing tally input.");
    }
    // Суперпробитие кита (Светлячок, след A4 «Autoreactive Armor»): при ЭП
    // >=150%/300% истощение удара конвертируется в 100%/150% Super Break урона.
    // Формула (HoYoWiki): база(level) x (истощение/10) x (1+ЭП) x коэф. A4 x
    // DEF x RES x уязвимость. Без крита, ATK и DMG%. Цель должна быть пробита.
    // Число срабатываний — явный ввод сценария (options.superBreakProcs).
    const sbConfig = kitRotation.superBreak;
    const sbProcs = Math.max(0, Math.floor(Number(options.superBreakProcs) || 0));
    if (sbConfig && sbProcs > 0) {
      // ЭП для порогов A4 учитывает A2 (+25% в окне CC) и кап кита.
      const bePercent = Math.min(Math.max(0, Number(mainStats.be || 0)) + kitBeBonus,
        kitRotation.beCapPercent != null ? Number(kitRotation.beCapPercent) : Number.POSITIVE_INFINITY);
      const sbTier = (sbConfig.tiers || []).slice()
        .sort((a, b) => Number(b.bePercent) - Number(a.bePercent))
        .find((tier) => bePercent >= Number(tier.bePercent));
      const minBeThreshold = Math.min(...(sbConfig.tiers || []).map((tier) => Number(tier.bePercent)));
      if (!sbTier) {
        calculationWarnings.push(isRu
          ? `Суперпробитие не сработало: учтённый ЭП ${bePercent.toFixed(0)}% ниже порога ${minBeThreshold}%.`
          : `Super Break did not trigger: counted BE ${bePercent.toFixed(0)}% is below the ${minBeThreshold}% threshold.`);
      } else if (primaryEnemy.isBroken !== true) {
        calculationWarnings.push(isRu
          ? "Суперпробитие пропущено: для него нужна пробитая главная цель."
          : "Super Break omitted: the primary target must be Weakness-Broken.");
      } else {
        const baseBreakDamage = calculateBreakBaseDamage(charLv);
        const sbTargets = enemy.targetData.slice(0, Math.min(enemy.targetData.length, Math.max(1, Number(sbConfig.targets) || 3)));
        const beMultiplier = 1 + bePercent / 100;
        const effTPrimary = Number(sbConfig.toughnessReductionPrimary) * (1 + teamBreakEff / 100);
        const effTAdjacent = (Number(sbConfig.toughnessReductionAdjacent) || 0) * (1 + teamBreakEff / 100);
        let perProc = 0;
        let sbPeak = 0;
        sbTargets.forEach((target, index) => {
          const toughnessReduction = index === 0 ? effTPrimary : effTAdjacent;
          if (!(toughnessReduction > 0)) return;
          const sbFactors = getTargetDamageFactors(target, {
            vulnerabilityPercent: teamVuln + teamBreakVuln,
            includeToughness: false
          });
          const hit = Math.round(baseBreakDamage * (toughnessReduction / 10) * beMultiplier
            * sbTier.factor * sbFactors.damageFactor);
          perProc += hit;
          sbPeak = Math.max(sbPeak, hit);
        });
        const sbDmg = perProc * sbProcs;
        rotationTotalDamage += sbDmg;
        peakHitDamage = Math.max(peakHitDamage, sbPeak);
        steps.push({
          stepNumber: steps.length + 1,
          charName: mainChar.name,
          avatar: mainChar.avatar?.icon || null,
          phase: isRu ? "СУПЕРПРОБИТИЕ (СЛЕД A4)" : "SUPER BREAK (A4 TRACE)",
          actionNameRu: `Суперпробитие ×${sbProcs} (${(sbTier.factor * 100).toFixed(0)}% коэф. A4)`,
          actionNameEn: `Super Break x${sbProcs} (${(sbTier.factor * 100).toFixed(0)}% A4 coefficient)`,
          descRu: `Формула Super Break: база ур. ${charLv} × (истощение ${effTPrimary.toFixed(0)} + ${effTAdjacent.toFixed(0)}×смежные)/10 × (1+ЭП ${bePercent.toFixed(0)}%) × коэф. ${sbTier.factor} × Защита × Сопротивление × Уязвимость. Без крита, ATK и DMG%. Число срабатываний — явный ввод сценария.`,
          descEn: `Super Break formula: Lv${charLv} base x (toughness reduction ${effTPrimary.toFixed(0)} + ${effTAdjacent.toFixed(0)}x adjacent)/10 x (1+BE ${bePercent.toFixed(0)}%) x coefficient ${sbTier.factor} x DEF x RES x vulnerability. No crit, ATK, or DMG%. Proc count is an explicit scenario input.`,
          damage: sbDmg,
          isDamageAction: true
        });
      }
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
  // Явные пробития (options.breakProcs): каждое — удар Weakness Break по официальной
  // формуле (уровень 80, мгновенный множитель стихии, (1+ЭП), DEF/RES/уязвимость),
  // плюс DoT-тики стандартного дебаффа пробития. Число пробитий — явный ввод
  // сценария; движок сам их не придумывает.
  const configuredBreakProcs = Math.max(0, Math.floor(Number(options.breakProcs) || 0));
  if (configuredBreakProcs > 0) {
    const breakElement = String(mainChar.element?.id || mainChar.element || "");
    const breakMaxToughness = Number(primaryEnemy.maxToughness);
    const breakBePercent = baseBe + teamBeBoost;
    if (!BREAK_INSTANT_ELEMENT_MULTIPLIERS[breakElement]) {
      calculationWarnings.push(isRu
        ? `Пробитие пропущено: стихия '${breakElement}' не распознана в таблице мгновенных множителей пробития.`
        : `Break omitted: element '${breakElement}' is not in the instant-break multiplier table.`);
    } else if (!(breakMaxToughness > 0)) {
      calculationWarnings.push(isRu
        ? "Пробитие пропущено: у цели этапа нет подтверждённой максимальной стойкости."
        : "Break omitted: the stage target has no confirmed max Toughness.");
    } else {
      const breakFactors = getTargetDamageFactors(primaryEnemy, {
        vulnerabilityPercent: teamVuln + teamBreakVuln,
        includeToughness: false
      });
      const instantBreakDamage = calculateBreakInstantDamage({
        attackerLevel: charLv,
        maxToughness: breakMaxToughness,
        element: breakElement,
        breakEffectPercent: breakBePercent,
        defenseMultiplier: breakFactors.defMult,
        resistanceMultiplier: breakFactors.resMult,
        vulnerabilityMultiplier: breakFactors.vulnMult,
        mitigationMultiplier: breakFactors.damageReductionMultiplier
      });
      if (instantBreakDamage === null) {
        calculationWarnings.push(isRu
          ? "Пробитие пропущено: не хватает данных цели (макс. стойкость/стихия)."
          : "Break omitted: target data is incomplete (max Toughness/element).");
      } else {
        const breakTotal = instantBreakDamage * configuredBreakProcs;
        rotationTotalDamage += breakTotal;
        peakHitDamage = Math.max(peakHitDamage, instantBreakDamage);
        steps.push({
          stepNumber: steps.length + 1,
          charName: mainChar.name,
          avatar: mainChar.avatar?.icon || null,
          phase: isRu ? "СЛАБОСТЬ ПРОБИТА (ЗАДАННЫЕ ПРОБИТИЯ)" : "WEAKNESS BREAK (CONFIGURED PROCS)",
          actionNameRu: `Weakness Break ×${configuredBreakProcs} (${(BREAK_INSTANT_ELEMENT_MULTIPLIERS[breakElement]).toFixed(1)}× ${breakElement})`,
          actionNameEn: `Weakness Break x${configuredBreakProcs} (${(BREAK_INSTANT_ELEMENT_MULTIPLIERS[breakElement]).toFixed(1)}x ${breakElement})`,
          descRu: `Официальная формула: база ур. 80 × (0,5 + стойкость ${breakMaxToughness}/40) × множитель стихии × (1+ЭП ${(breakBePercent / 100).toFixed(2)}) × Защита × Сопротивление × Уязвимость. Без крита.`,
          descEn: `Official formula: Lv80 base x (0.5 + toughness ${breakMaxToughness}/40) x element coefficient x (1+BE ${(breakBePercent / 100).toFixed(2)}) x DEF x RES x vulnerability. No crit.`,
          damage: breakTotal,
          isDamageAction: true
        });
        // DoT от пробития — тики стандартного дебаффа по верифицированным множителям.
        const dotConfig = BREAK_DOT_CONFIG[breakElement];
        if (dotConfig) {
          let dotPerTick;
          let dotDescRu;
          let dotDescEn;
          if (dotConfig.bleedMaxHpPercent) {
            const enemyMaxHp = Number(primaryEnemy.maxHp);
            // Кап тика = начальный удар Physical-пробития (HoYoWiki entry/1099:
            // «Capped at: initial damage»; wywyx/GameKee: 2 x база(level) x
            // (0.5 + maxToughness/40)). (1+ЭП) применяется и к 7% HP, и к капу.
            const bleedCapBase = 2 * calculateBreakBaseDamage(charLv) * (0.5 + breakMaxToughness / 40);
            if (Number.isFinite(enemyMaxHp) && enemyMaxHp > 0) {
              dotPerTick = Math.min(enemyMaxHp * dotConfig.bleedMaxHpPercent / 100, bleedCapBase)
                * (1 + breakBePercent / 100);
              dotDescRu = `Кровотечение: ${(dotConfig.bleedMaxHpPercent).toFixed(0)}% макс. HP цели за тик ×(1+ЭП); кап тика = начальный удар пробития ${Math.round(bleedCapBase)} ×(1+ЭП).`;
              dotDescEn = `Bleed: ${(dotConfig.bleedMaxHpPercent).toFixed(0)}% of target Max HP per tick x(1+BE); per-tick cap = the initial break hit ${Math.round(bleedCapBase)} x(1+BE).`;
            }
          } else {
            const stacks = dotConfig.eliteStacks || 1;
            dotPerTick = calculateBreakBaseDamage(charLv) * dotConfig.perTurnMultiplier * stacks
              * (1 + breakBePercent / 100);
            dotDescRu = `Стандартный DoT пробития: ×${dotConfig.perTurnMultiplier}${stacks > 1 ? `×${stacks} стаков` : ""} от базы ур. 80, ×(1+ЭП).`;
            dotDescEn = `Standard break DoT: x${dotConfig.perTurnMultiplier}${stacks > 1 ? ` x${stacks} stacks` : ""} of the Lv80 base, x(1+BE).`;
          }
          if (Number.isFinite(dotPerTick) && dotPerTick > 0) {
            // DoT не проходит проверку стойкости (цель уже пробита) и не может критовать.
            const dotTickDamage = Math.round(dotPerTick * breakFactors.defMult
              * breakFactors.resMult * breakFactors.vulnMult
              * breakFactors.damageReductionMultiplier);
            const dotTotal = dotTickDamage * dotConfig.turns * configuredBreakProcs;
            rotationTotalDamage += dotTotal;
            steps.push({
              stepNumber: steps.length + 1,
              charName: mainChar.name,
              avatar: mainChar.avatar?.icon || null,
              phase: isRu ? "DoT ПРОБИТИЯ (ТИКИ)" : "BREAK DoT (TICKS)",
              actionNameRu: `${dotConfig.turns} тик(а) за пробитие ×${configuredBreakProcs}`,
              actionNameEn: `${dotConfig.turns} tick(s) per break x${configuredBreakProcs}`,
              descRu: dotDescRu,
              descEn: dotDescEn,
              damage: dotTotal,
              isDamageAction: true
            });
          }
        }
      }
    }
  }
  const timelinePrimaryEnemy = timelineEnemyActors[0] || null;
  const timelineEnemyResistancePercent = timelinePrimaryEnemy?.resistancePercent ?? null;
  return {
    rotationTotalDamage,
    peakHitDamage,
    steps,
    enemyMode,
    enemyScenarioStatus: usesExplicitTimeline ? "explicit-timeline-actors" : enemyScenario.status,
    enemyScenarioInfo: usesExplicitTimeline ? null : enemyScenario.officialEncounter,
    enemyTargets: usesExplicitTimeline ? timelineEnemyTargets : enemy.targetData,
    targetCount: usesExplicitTimeline ? timelineEnemyActors.length : enemy.targets,
    enemyLevel: usesExplicitTimeline ? timelinePrimaryEnemy?.level ?? null : enemyLv,
    baseEnemyRes: usesExplicitTimeline
      ? (timelineEnemyResistancePercent === null ? null : timelineEnemyResistancePercent / 100)
      : baseEnemyRes,
    enemyResistancePercent: usesExplicitTimeline
      ? timelineEnemyResistancePercent
      : baseEnemyRes * 100,
    buffTimingStatus,
    equipmentEffects,
    calculationWarnings,
    combatTimeline,
    combatTimelineStatus: combatTimeline?.status || "not-configured",
    teamBuffStatus: usesExplicitTimeline
      ? "explicit-timeline-modifier-events"
      : buffTimingStatus === "verified-schedule"
      ? "verified-per-hit-schedule"
      : hasAppliedTeamBuffValues ? "explicit-values-assumed-full-uptime" : "no-numeric-buffs-configured",
    calculationStatus: usesExplicitTimeline ? "explicit-timeline-simulation"
      : kitRotationSupported ? "kit-rotation-estimate" : "manual-script-estimate",
    kitRotationStatus: kitRotationSupported ? kitRotation.status : null,
    combatStats: {
      combatAtk,
      combatHp,
      combatCr: (combatCr * 100).toFixed(1),
      combatCd: (combatCd * 100).toFixed(1),
      critMultiplier: critMultiplier.toFixed(2),
      totalDefShred: (totalDefShred * 100).toFixed(1),
      defenseIgnorePercent: defenseIgnorePercent.toFixed(1),
      resMult: resMult.toFixed(2),
      vulnMult: vulnMult.toFixed(2),
      toughnessMultiplier: toughnessMultiplier.toFixed(2)
    },
    hasUnmodeledAtkPercent: teamAtkPercent > 0 && baseAttackForPercent <= 0
  };
}
