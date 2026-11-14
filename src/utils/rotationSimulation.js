import { ROTATIONS } from "../data/rotations.js";
import { getTeamBuffsForAction } from "./buffTimeline.js";

// These manual damage packets have a usable kit basis today. Other hard-coded
// branches are retained for reference but are not exposed as combat totals
// until their multipliers and conditions are checked against profile data.
const SUPPORTED_MANUAL_SCENARIOS = new Set(["1003", "1308"]);

function calculateDefenseMultiplier(characterLevel, enemyLevel, defenseReductionPercent) {
  const reduction = Math.min(1, Math.max(0, defenseReductionPercent / 100));
  return (characterLevel + 20) / (characterLevel + 20 + (enemyLevel + 20) * (1 - reduction));
}

function calculateResistanceMultiplier(baseResistance, resistancePenetrationPercent) {
  const effectiveResistance = Math.max(-1, baseResistance - resistancePenetrationPercent / 100);
  return 1 - effectiveResistance;
}

function extractMotionValues(description, characterName) {
  const pattern = new RegExp(`([\\d.]+)% of ${characterName}['’]s ATK`, "gi");
  return [...String(description || "").matchAll(pattern)].map((match) => Number(match[1]) / 100);
}

export function runFullTeamRotationSimulation(mainChar, mainStats, squad, matchedTeammates = [], lang = "ru", options = {}) {
  if (!mainChar || !mainStats) return null;
  const isRu = lang === "ru";
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
  // Generic target presets. Target-specific element resistances are not available in this selector.
  const enemyMode = options.enemyMode || "moc";
  const ENEMY_PRESETS = {
    moc: { lv: 95, res: 0.2, targets: 3 },
    pf: { lv: 88, res: 0.2, targets: 5 },
    as: { lv: 95, res: 0.2, targets: 3 }
  };
  const enemy = ENEMY_PRESETS[enemyMode] || ENEMY_PRESETS.moc;
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
  const defMult = calculateDefenseMultiplier(charLv, enemyLv, totalDefShred * 100);
  const baseEnemyRes = enemy.res;
  const resMult = calculateResistanceMultiplier(baseEnemyRes, teamResPen + kitResPen);
  const damageTakenMult = 1 + teamVuln / 100;
  const toughnessMultiplier = options.enemyBroken ? 1 : 0.9;
  // Without a break-state timeline, direct hits assume an active Toughness bar.
  // Super Break instances below assume the target is already broken.
  const vulnMult = damageTakenMult * toughnessMultiplier;
  // Use profile stats and explicit team buffs only. There is no universal
  // E0S1 light-cone stat package across characters or signature passives.
  const characterBaseAttack = (mainChar.attributes || []).find((attribute) => attribute.field === "atk")?.value;
  const baseAttackForPercent = Number(mainStats.base_atk || mainStats.baseAtk || mainChar.baseAtk || mainChar.baseStats?.atk || characterBaseAttack || 0);
  const percentAttackGrant = baseAttackForPercent * teamAtkPercent / 100;
  const combatAtk = baseAtk + teamAtkGrant + percentAttackGrant;
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

  const combatCr = Math.min(1, rawTotalCr / 100);
  const combatCd = (baseCd + teamCdGrant + kitCd + overcritBonusCd) / 100;
  // Crit vulnerability applies only to crit instances. Fold its expected value
  // into the expected crit multiplier instead of inflating every hit.
  const baseCritMultiplier = 1 + combatCr * combatCd;
  const critMultiplier = baseCritMultiplier +
    (combatCr * (1 + combatCd) * (teamCritVuln / 100)) / vulnMult;
  const combatDmgBonus = 1 + (baseDmgBoost + teamDmgBoost + elationSurgeBonus) / 100;
  const steps = [];
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
      const actionCritMult = 1 + actionCr * actionCd;
      const actionDmgBonus = 1 + (baseDmgBoost + (Number(b.dmgBoost) || 0) + (kitRotation.passiveDmgBoost || 0)) / 100;
      const actionDefShred = Math.min(1, (Number(b.defShred) || 0) / 100);
      const actionDefMult = calculateDefenseMultiplier(charLv, enemyLv, actionDefShred * 100);
      const actionResMult = calculateResistanceMultiplier(baseEnemyRes, (Number(b.resPen) || 0) + kitResPen);
      const actionVulnMult = (1 + ((Number(b.allVuln) || 0) + (Number(b.vuln) || 0)) / 100) * toughnessMultiplier;
      const actionCritVulnFactor = actionCr * (1 + actionCd) * ((Number(b.critVuln) || 0) / 100);
      const actionCritMultiplier = actionCritMult + actionCritVulnFactor / actionVulnMult;
      const actionScalingStat = kitRotation.hpScale ? combatHp : actionAtk;
      const actionKitDmgBonus = actionDmgBonus;
      const instDmg = Math.round(actionScalingStat * inst.mv * inst.count * inst.targets * actionKitDmgBonus * actionCritMultiplier * actionDefMult * actionResMult * actionVulnMult);
      rotationTotalDamage += instDmg;
      const perHit = Math.round(actionScalingStat * inst.mv * actionKitDmgBonus * actionCritMultiplier * actionDefMult * actionResMult * actionVulnMult);
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
    const skillDescription = (mainChar.skills || []).find((skill) => skill.type === "BPSkill" || skill.type_text === "Skill")?.desc || "";
    const ultimateDescription = (mainChar.skills || []).find((skill) => skill.type === "Ultra" || skill.type_text === "Ultimate")?.desc || "";
    const talentDescription = (mainChar.skills || []).find((skill) => skill.type === "Talent")?.desc || "";
    const skillMvs = extractMotionValues(skillDescription, "Himeko");
    const ultimateMv = extractMotionValues(ultimateDescription, "Himeko")[0];
    const talentMv = extractMotionValues(talentDescription, "Himeko")[0];
    if (skillMvs.length < 2 || !Number.isFinite(ultimateMv) || !Number.isFinite(talentMv)) return null;
    const skillMotionValue = skillMvs[0] + skillMvs[1] * Math.min(2, targetCount - 1);
    const skillDmg = Math.round(combatAtk * skillMotionValue * combatDmgBonus * critMultiplier * defMult * resMult * vulnMult);
    rotationTotalDamage += skillDmg;
    peakHitDamage = Math.max(peakHitDamage, skillDmg);
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
    const ultMotionValue = ultimateMv * targetCount;
    const ultDmg = Math.round(combatAtk * ultMotionValue * combatDmgBonus * critMultiplier * defMult * resMult * vulnMult);
    rotationTotalDamage += ultDmg;
    peakHitDamage = Math.max(peakHitDamage, ultDmg);
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
    const fuaMotionValue = talentMv * targetCount;
    const fuaCritMultiplier = critMultiplier + combatCr * teamFuaCd / 100;
    const fuaDmg = Math.round(combatAtk * fuaMotionValue * combatDmgBonus * fuaCritMultiplier * defMult * resMult * vulnMult);
    rotationTotalDamage += fuaDmg;
    peakHitDamage = Math.max(peakHitDamage, fuaDmg);
    steps.push({
      stepNumber: steps.length + 1,
      charName: mainChar.name,
      avatar: mainChar.avatar?.icon || null,
      phase: isRu ? "БОНУС-АТАКА (ТАЛАНТ)" : "FOLLOW-UP ATTACK",
      actionNameRu: "Талант «Победный кураж» (одно заданное срабатывание)",
      actionNameEn: "Talent: Victory Rush (one configured follow-up)",
      descRu: `${(talentMv * 100).toFixed(1)}% ATK каждому врагу, множитель взят из профиля; число реальных срабатываний зависит от пробитий.`,
      descEn: `${(talentMv * 100).toFixed(1)}% ATK to each enemy from the profile; actual trigger count depends on breaks.`,
      damage: fuaDmg,
      isDamageAction: true
    });
    if (hasSuperBreak) {
      // Simplified Super Break estimate; toughness and ability-level details remain scripted.
      const baseBreakLv80 = 3767.55;
      const beMultiplier = 1 + (baseBe + teamBeBoost) / 100;
      const toughnessReduction = 60; // 60 единиц базового истощения стойкости под навыком
      const effectiveToughnessReduction = toughnessReduction * (1 + teamBreakEff / 100);
      const breakVulnMult = 1 + (teamVuln + teamBreakVuln) / 100;
      const sbDmg = Math.round(baseBreakLv80 * (effectiveToughnessReduction / 30) * beMultiplier * defMult * resMult * breakVulnMult * superBreakFactor * 2);
      rotationTotalDamage += sbDmg;
      steps.push({
        stepNumber: steps.length + 1,
        charName: isRu ? "Эффект Суперпробития" : "Super Break Proc",
        avatar: null,
        phase: isRu ? "СУПЕРПРОБИТИЕ (ОТРЯД)" : "SUPER BREAK IMPACT",
        actionNameRu: "Командное Суперпробитие (2 срабатывания по сломанной стойкости)",
        actionNameEn: "Team Super Break (2 procs on broken bar)",
        descRu: `Оценка Super Break: истощение ${effectiveToughnessReduction.toFixed(0)} × ЭП ${beMultiplier.toFixed(2)} × Защита × Сопротивление × Уязвимость × ${superBreakFactor.toFixed(1)}.`,
        descEn: `Super Break estimate: ${effectiveToughnessReduction.toFixed(0)} Toughness reduction x ${beMultiplier.toFixed(2)} BE x DEF x RES x vulnerability x ${superBreakFactor.toFixed(1)}.`,
        damage: sbDmg,
        isDamageAction: true
      });
    }
  } else if (isAcheron) {
    const skillDescription = (mainChar.skills || []).find((skill) => skill.type === "BPSkill" || skill.type_text === "Skill")?.desc || "";
    const ultimateDescription = (mainChar.skills || []).find((skill) => skill.type === "Ultra" || skill.type_text === "Ultimate")?.desc || "";
    const talentDescription = (mainChar.skills || []).find((skill) => skill.type === "Talent")?.desc || "";
    const skillMvs = skillDescription.match(/equal to ([\d.]+)% of Acheron's ATK to this target[\s\S]*?equal to ([\d.]+)% of Acheron's ATK to adjacent targets/i);
    const rainbladeMvs = ultimateDescription.match(/Rainblade[^:]*:[\s\S]*?equal to ([\d.]+)% of Acheron's ATK to (?:a single target enemy|one designated enemy target)[\s\S]*?equal to ([\d.]+)% of Acheron's ATK to all enemies[\s\S]*?up to a maximum of ([\d.]+)%[\s\S]*?Stygian Resurge[^:]*:[\s\S]*?equal to ([\d.]+)% of Acheron's ATK to all enemies/i);
    const ultResReductionMatch = talentDescription.match(/reduces all enemies' All-Type RES by ([\d.]+)%/i);
    if (!skillMvs || !rainbladeMvs || !ultResReductionMatch) return null;
    const ultResReduction = Number(ultResReductionMatch[1]);

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
    const skillTargets = Math.min(2, Math.max(0, enemy.targets - 1));
    const skillMotionValue = Number(skillMvs[1]) / 100 + Number(skillMvs[2]) / 100 * skillTargets;
    const skillDmg = Math.round(combatAtk * skillMotionValue * combatDmgBonus * critMultiplier * defMult * resMult * vulnMult * a4Multiplier);

    // This configured Ultimate assumes 9 Crimson Knots and three Rainblades
    // that each remove 3. Thunder Core gains +30% DMG after each slash; the
    // final AoE and its six 25%-ATK follow-up hits therefore use all 3 stacks.
    const rainbladePrimaryMv = Number(rainbladeMvs[1]) / 100;
    const rainbladeMaxAoeMv = Number(rainbladeMvs[3]) / 100;
    const finalAoeMv = Number(rainbladeMvs[4]) / 100;
    const a6BonusPerSlash = hasA6 ? 0.3 : 0;
    const ultimateResMult = calculateResistanceMultiplier(baseEnemyRes, teamResPen + kitResPen + ultResReduction);
    const directUltimateFactor = critMultiplier * defMult * ultimateResMult * vulnMult * a4Multiplier;
    let ultDmg = 0;
    for (let slash = 0; slash < 3; slash += 1) {
      const slashDmgBonus = combatDmgBonus + a6BonusPerSlash * slash;
      const slashMotionValue = rainbladePrimaryMv + rainbladeMaxAoeMv * enemy.targets;
      ultDmg += Math.round(combatAtk * slashMotionValue * slashDmgBonus * directUltimateFactor);
    }
    const finalDmgBonus = combatDmgBonus + a6BonusPerSlash * 3;
    const finalMotionValue = finalAoeMv * enemy.targets + 0.25 * (hasA6 ? 6 : 0);
    ultDmg += Math.round(combatAtk * finalMotionValue * finalDmgBonus * directUltimateFactor);
    rotationTotalDamage += skillDmg + ultDmg;
    peakHitDamage = ultDmg;
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
      descRu: `Сценарий максимальных 9 узлов. Учтены A4 ×${a4Multiplier.toFixed(2)}, снижение RES на ${ultResReduction}% по уровню следа${hasA6 ? " и 6 дополнительных ударов A6 по 25% ATK" : "; след A6 не найден, дополнительные удары исключены"}. AoE считает ${enemy.targets} целей.`,
      descEn: `Maximum 9-Knot scenario. Includes A4 ×${a4Multiplier.toFixed(2)}, ${ultResReduction}% RES reduction from the profile trace level${hasA6 ? " and six A6 follow-up hits at 25% ATK" : "; A6 was not found, so its extra hits are excluded"}. AoE counts ${enemy.targets} targets.`,
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
    targetCount: enemy.targets,
    enemyLevel: enemyLv,
    baseEnemyRes,
    buffTimingStatus,
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
