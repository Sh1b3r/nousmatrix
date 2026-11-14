import { ROTATIONS } from "../data/rotations.js";

export function runFullTeamRotationSimulation(mainChar, mainStats, squad, matchedTeammates = [], lang = "ru", options = {}) {
  if (!mainChar || !mainStats) return null;
  const isRu = lang === "ru";
  const name = (mainChar.name || "").toLowerCase();
  const charId = String(mainChar.id || "");  const pathId = String(mainChar.path?.id || "").toLowerCase();
  const pathName = String(mainChar.path?.name || "").toLowerCase();
  let baseAtk = Number(mainStats.atk || 0);
  let baseHp = Number(mainStats.hp || 0);
  let baseDef = Number(mainStats.def || 0);
  let baseSpd = Number(mainStats.spd || 100);
  let baseCr = Number(mainStats.cr || 5);
  let baseCd = Number(mainStats.cd || 50);
  let baseBe = Number(mainStats.be || 0);
  let baseDmgBoost = Number(mainStats.dmg_boost || 0);
  let teamAtkGrant = 0;
  let teamCdGrant = 0;
  let teamCrGrant = 0;
  let teamDmgBoost = 0;
  let teamResPen = 0;
  let teamDefShred = 0;
  let teamVuln = 0;
  let teamBreakVuln = 0;
  let teamBeBoost = 0;
  let loopFactor = 1;
  let hasSuperBreak = false;  let superBreakFactor = 1;
  let teamActionAdvances = [];
  matchedTeammates.forEach((tm) => {
    const b = tm.dynamicBuffs || {};
    if (b.atkGrant) teamAtkGrant += b.atkGrant;
    if (b.cdGrant) teamCdGrant += b.cdGrant;
    if (b.crGrant) teamCrGrant += b.crGrant;
    if (b.dmgBoost) teamDmgBoost += b.dmgBoost;
    if (b.resPen) teamResPen += b.resPen;
    if (b.defShred) teamDefShred += b.defShred;
    if (b.ultVuln) teamVuln += b.ultVuln;
    if (b.allVuln) teamVuln += b.allVuln;
    if (b.vuln) teamVuln += b.vuln;
    if (b.fuaVuln) teamVuln += b.fuaVuln;
    if (b.critVuln) teamVuln += b.critVuln;
    if (b.breakVuln) teamBreakVuln += b.breakVuln;
    if (b.beBoost) teamBeBoost += b.beBoost;
    if (b.superBreakFactor) {
      hasSuperBreak = true;
      superBreakFactor = b.superBreakFactor;
    }
    if (b.targetAdvance) teamActionAdvances.push(b.targetAdvance);
    if (b.teamAdvance) teamActionAdvances.push(b.teamAdvance);
  });
  // Пресеты врагов по режимам: MoC (босс ур. 95, RES 20%), PF (мобы ур. 88, RES 20%), AS (ап-босс ур. 95, RES 40%)
  const enemyMode = options.enemyMode || "moc";
  const ENEMY_PRESETS = {
    moc: { lv: 95, res: 0.2 },
    pf: { lv: 88, res: 0.2 },
    as: { lv: 95, res: 0.4 }
  };
  const enemy = ENEMY_PRESETS[enemyMode] || ENEMY_PRESETS.moc;
  const totalDefShred = Math.min(1, teamDefShred / 100);
  const charLv = Number(mainChar.level || 80);
  const enemyLv = enemy.lv;
  const defMult = (charLv + 20) / (charLv + 20 + (enemyLv + 20) * (1 - totalDefShred));
  const baseEnemyRes = enemy.res;
  const effectiveRes = Math.max(-1, baseEnemyRes - teamResPen / 100);
  const resMult = 1 - effectiveRes;
  const vulnMult = 1 + teamVuln / 100;
  const combatAtk = baseAtk + teamAtkGrant;
  const combatHp = baseHp;
  const combatCr = Math.min(1, (baseCr + teamCrGrant) / 100);
  const combatCd = (baseCd + teamCdGrant) / 100;
  const critMultiplier = 1 + combatCr * combatCd;
  const combatDmgBonus = 1 + (baseDmgBoost + teamDmgBoost) / 100;
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
  const isHimeko = charId === "1003" || name.includes("химеко") || name.includes("himeko") || name.includes("нова");
  const isAcheron = charId === "1308" || name.includes("ахерон") || name.includes("acheron");
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
  const isSupportRole = pathId === "shaman" || pathName.includes("harmony") || pathName.includes("гармон");
  const isSustainRole = pathId === "knight" || pathId === "priest" || pathName.includes("preservation") || pathName.includes("abundance") || pathName.includes("сохран") || pathName.includes("изобил");
  const kitRotation = ROTATIONS[charId] || null;
  if (kitRotation) {
    const kitDmgBonus = 1 + (baseDmgBoost + teamDmgBoost + (kitRotation.passiveDmgBoost || 0)) / 100;
    const scalingStat = Math.max(1200, kitRotation.hpScale ? combatHp : combatAtk);
    kitRotation.instances.forEach((inst) => {
      const instDmg = Math.round(scalingStat * inst.mv * inst.count * inst.targets * kitDmgBonus * critMultiplier * defMult * resMult * vulnMult);
      rotationTotalDamage += instDmg;
      const perHit = Math.round(scalingStat * inst.mv * kitDmgBonus * critMultiplier * defMult * resMult * vulnMult);
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
    if (kitRotation.ultLoop) {
      // Калібрування енергетичної петлі: SPD × ERR визначають, скільки разів ульт встигає
      // перезарядитися за цикл MoC (~150 AV). Базова ротація = один каст.
      const err = Number(mainStats.err || 100);
      loopFactor = Math.min(2.5, Math.max(0.8, (baseSpd / 135) * (err / 100) * 1.4));
      rotationTotalDamage = Math.round(rotationTotalDamage * loopFactor);
      steps.push({
        stepNumber: steps.length + 1,
        charName: mainChar.name,
        phase: isRu ? "КАЛИБРОВКА" : "CALIBRATION",
        actionNameRu: `Енергетична петля ×${loopFactor.toFixed(2)}`,
        actionNameEn: `Energy loop x${loopFactor.toFixed(2)}`,
        descRu: `Ротация успевает повторяться ×${loopFactor.toFixed(2)} за цикл (СКОР ${baseSpd.toFixed(0)} × ВЭ ${err}%). Допущение модели, а не точный расчёт игры.`,
        descEn: `Rotation repeats x${loopFactor.toFixed(2)} per cycle (SPD ${baseSpd.toFixed(0)} x ERR ${err}%). Model assumption, not exact game sim.`,
        damage: 0,
        isDamageAction: false
      });
    }
  } else if (isHimeko) {
    const skillDmg = Math.round(combatAtk * 3.6 * combatDmgBonus * critMultiplier * defMult * resMult * vulnMult);
    rotationTotalDamage += skillDmg;
    peakHitDamage = Math.max(peakHitDamage, skillDmg);
    steps.push({
      stepNumber: steps.length + 1,
      charName: mainChar.name,
      avatar: mainChar.avatar?.icon || null,
      phase: isRu ? "ХОД ДПС (НАВЫК)" : "DPS TURN (SKILL)",
      actionNameRu: "Навык «Расплавленное пламя» (Огненный взрыв по боссу и миньонам)",
      actionNameEn: "Skill: Molten Detonation (Blast Fire DMG)",
      descRu: `200% ATK по боссу + 80% по соседним целям под баффом +${teamDmgBoost}% урона и ${(combatCr * 100).toFixed(0)}% КШ / ${(combatCd * 100).toFixed(0)}% КУ.`,
      descEn: `200% ATK single + 80% blast with full team multipliers.`,
      damage: skillDmg,
      isDamageAction: true
    });
    const ultDmg = Math.round(combatAtk * 4.6 * (combatDmgBonus + 0.2) * critMultiplier * defMult * resMult * vulnMult);
    rotationTotalDamage += ultDmg;
    peakHitDamage = Math.max(peakHitDamage, ultDmg);
    steps.push({
      stepNumber: steps.length + 1,
      charName: mainChar.name,
      avatar: mainChar.avatar?.icon || null,
      phase: isRu ? "СВЕРХСПОСОБНОСТЬ (УЛЬТИМЕЙТ)" : "ULTIMATE BURST",
      actionNameRu: "Сверхспособность «Небесное пламя» (Массовый залп орбитального спутника)",
      actionNameEn: "Ultimate: Heavenly Flare (Massive Orbital Strike)",
      descRu: `230% AoE урон по всему полю боя с гарантированным пробитием уязвимости.`,
      descEn: `230% AoE strike triggering weakness break across field.`,
      damage: ultDmg,
      isDamageAction: true
    });
    const fuaDmg = Math.round(combatAtk * 1.4 * 3 * (combatDmgBonus + 0.25) * critMultiplier * defMult * resMult * vulnMult);
    rotationTotalDamage += fuaDmg;
    peakHitDamage = Math.max(peakHitDamage, fuaDmg);
    steps.push({
      stepNumber: steps.length + 1,
      charName: mainChar.name,
      avatar: mainChar.avatar?.icon || null,
      phase: isRu ? "БОНУС-АТАКА (ТАЛАНТ)" : "FOLLOW-UP ATTACK",
      actionNameRu: "Талант «Победный кураж» (3 срабатывания по пробитым целям)",
      actionNameEn: "Talent: Victory Rush (3 Follow-up procs)",
      descRu: `140% ATK по всем врагам при истощении стойкости босса и миньонов.`,
      descEn: `140% ATK AoE follow-up triggered on weakness break.`,
      damage: fuaDmg,
      isDamageAction: true
    });
    if (hasSuperBreak) {
      const baseBreakLv80 = 3767.55;
      const beMultiplier = 1 + (baseBe + teamBeBoost) / 100;
      const sbDmg = Math.round(baseBreakLv80 * (40 / 30) * beMultiplier * defMult * resMult * (1 + teamBreakVuln / 100) * superBreakFactor * 2);
      rotationTotalDamage += sbDmg;
      steps.push({
        stepNumber: steps.length + 1,
        charName: isRu ? "Эффект Суперпробития" : "Super Break Proc",
        avatar: null,
        phase: isRu ? "СУПЕРПРОБИТИЕ (ОТРЯД)" : "SUPER BREAK IMPACT",
        actionNameRu: "Командное Суперпробитие (2 срабатывания по сломанной стойкости)",
        actionNameEn: "Team Super Break (2 procs on broken bar)",
        descRu: `Урон суперпробития от истощения стойкости под баффом Гармонии ГГ и Жуань Мэй.`,
        descEn: `Super Break damage scaling on toughness reduction and Break Effect.`,
        damage: sbDmg,
        isDamageAction: true
      });
    }
  } else if (isAcheron) {
    const skillDmg = Math.round(combatAtk * 1.6 * combatDmgBonus * critMultiplier * defMult * resMult * vulnMult);
    const ultDmg = Math.round(combatAtk * 7.92 * (combatDmgBonus + 0.9) * critMultiplier * defMult * resMult * vulnMult);
    rotationTotalDamage += skillDmg + ultDmg;
    peakHitDamage = ultDmg;
    steps.push({
      stepNumber: steps.length + 1,
      charName: mainChar.name,
      phase: isRu ? "ХОД ДПС (НАВЫК)" : "DPS TURN (SKILL)",
      actionNameRu: "Навык «Восьмикратный раскол» (2 заряда Рассечённого сна)",
      actionNameEn: "Skill: Octobolt Flash (2 Slashed Dream charges)",
      damage: skillDmg,
      isDamageAction: true
    });
    steps.push({
      stepNumber: steps.length + 1,
      charName: mainChar.name,
      phase: isRu ? "СВЕРХСПОСОБНОСТЬ (УЛЬТИМЕЙТ)" : "ULTIMATE BURST",
      actionNameRu: "Сверхспособность «Сон в багряных слезах» (9 зарядов Багрового узла)",
      actionNameEn: "Ultimate: Slashed Dream (9 Crimson Knots)",
      damage: ultDmg,
      isDamageAction: true
    });
  } else if (isFirefly) {
    const baseBreakLv80 = 3767.55;
    const beMultiplier = 1 + (baseBe + teamBeBoost) / 100;
    const sbDmg = Math.round(baseBreakLv80 * (60 / 30) * beMultiplier * defMult * resMult * (1 + teamBreakVuln / 100) * 2.5);
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
    const fuaDmg = Math.round(combatAtk * 1.1 * 3 * (combatDmgBonus + 0.3) * critMultiplier * defMult * resMult * vulnMult);
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
  } else if (isMortenax || isBlade) {
    const hpStat = combatHp || baseHp || 7e3;
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
  } else if (isSupportRole) {
    const carryBenchmarkDmg = Math.round(3500 * 5.2 * combatDmgBonus * critMultiplier * defMult * resMult * vulnMult);
    const personalImpact = Math.round(combatAtk * 1.8 * combatDmgBonus * defMult * resMult * vulnMult);
    rotationTotalDamage = carryBenchmarkDmg + personalImpact;
    peakHitDamage = carryBenchmarkDmg;
    steps.push({
      stepNumber: steps.length + 1,
      charName: isRu ? "Поддерживаемый Керри" : "Empowered Carry",
      phase: isRu ? "УДАР КЕРРИ ПОД ВАШИМИ БАФФАМИ" : "BUFFED CARRY STRIKE",
      actionNameRu: "Полный прокаст основного керри с переданными баффами",
      actionNameEn: "Carry Full Cast with Transferred Buffs",
      damage: carryBenchmarkDmg,
      isDamageAction: true
    });
    if (personalImpact > 0) {
      steps.push({
        stepNumber: steps.length + 1,
        charName: mainChar.name,
        phase: isRu ? "ЛИЧНЫЙ ВКЛАД САППОРТА" : "PERSONAL OUTPUT",
        actionNameRu: "Дополнительный урон (Концерт / Командная синергия)",
        actionNameEn: "Additional Co-op Damage Trigger",
        damage: personalImpact,
        isDamageAction: true
      });
    }
  } else if (isSustainRole) {
    const personalDmg = Math.round(Math.max(baseAtk, baseDef, baseHp * 0.4) * 2.8 * combatDmgBonus * critMultiplier * defMult * resMult * vulnMult);
    const teamCoverDmg = Math.round(3200 * 4.4 * combatDmgBonus * critMultiplier * defMult * resMult * vulnMult);
    rotationTotalDamage = teamCoverDmg + personalDmg;
    peakHitDamage = teamCoverDmg;
    steps.push({
      stepNumber: steps.length + 1,
      charName: mainChar.name,
      phase: isRu ? "САБ-ДПС ВКЛАД СУСТЕЙНА" : "SUSTAIN SUB-DPS HIT",
      actionNameRu: "Бонус-атака / Контрудар / Ультимейт выживания",
      actionNameEn: "Sustain Sub-DPS / Counter / Ultimate Impact",
      damage: personalDmg,
      isDamageAction: true
    });
    steps.push({
      stepNumber: steps.length + 1,
      charName: isRu ? "Отряд под защитой" : "Protected Team",
      phase: isRu ? "УРОН ОТРЯДА ПОД ДЕБАФФАМИ" : "TEAM DAMAGE UNDER PROTECTION",
      actionNameRu: "Урон отряда с учётом крит-уязвимости и щитов",
      actionNameEn: "Team Output Enabled by Mitigation & Vulnerability",
      damage: teamCoverDmg,
      isDamageAction: true
    });
  } else {
    const scalingStat = Math.max(1200, combatAtk || combatHp);
    const skillDmg = Math.round(scalingStat * 2.2 * combatDmgBonus * critMultiplier * defMult * resMult * vulnMult);
    const ultDmg = Math.round(scalingStat * 3.4 * (combatDmgBonus + 0.3) * critMultiplier * defMult * resMult * vulnMult);
    rotationTotalDamage += skillDmg + ultDmg;
    peakHitDamage = Math.max(skillDmg, ultDmg);
    steps.push({
      stepNumber: steps.length + 1,
      charName: mainChar.name,
      phase: isRu ? "ХОД ДПС (НАВЫК)" : "DPS TURN (SKILL)",
      actionNameRu: "Усиленный боевой навык",
      actionNameEn: "Enhanced Combat Skill",
      damage: skillDmg,
      isDamageAction: true
    });
    steps.push({
      stepNumber: steps.length + 1,
      charName: mainChar.name,
      phase: isRu ? "СВЕРХСПОСОБНОСТЬ" : "ULTIMATE BURST",
      actionNameRu: "Сверхспособность (Полный прокаст под баффами)",
      actionNameEn: "Ultimate Burst (Full Team Buffs)",
      damage: ultDmg,
      isDamageAction: true
    });
  }
  const actionsPerCycle = Math.max(1, 100 * baseSpd / 1e4);
  const teamCycleDps = Math.round(rotationTotalDamage / 2 * actionsPerCycle);
  return {
    rotationTotalDamage,
    peakHitDamage,
    teamCycleDps,
    steps,
    enemyMode,
    loopFactor,
    combatStats: {
      combatAtk,
      combatHp,
      combatCr: (combatCr * 100).toFixed(1),
      combatCd: (combatCd * 100).toFixed(1),
      critMultiplier: critMultiplier.toFixed(2),
      totalDefShred: (totalDefShred * 100).toFixed(1),
      resMult: resMult.toFixed(2),
      vulnMult: vulnMult.toFixed(2)
    }
  };
}
