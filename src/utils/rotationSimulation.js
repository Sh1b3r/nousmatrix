/**
 * NousMatrix Full Team Rotation Simulation Engine
 * Simulates chronological step-by-step ability sequences, buff application,
 * and exact damage output down to a single digit against MoC 12 Lv.90 Boss.
 */

export function runFullTeamRotationSimulation(mainChar, mainStats, squad, matchedTeammates = [], lang = 'ru') {
  if (!mainChar || !mainStats) return null;
  const isRu = lang === 'ru';
  const name = (mainChar.name || '').toLowerCase();
  const charId = String(mainChar.id || '');

  // 1. Base Stats of Main DPS
  let baseAtk = Number(mainStats.atk || 0);
  let baseHp = Number(mainStats.hp || 0);
  let baseDef = Number(mainStats.def || 0);
  let baseSpd = Number(mainStats.spd || 100);
  let baseCr = Number(mainStats.cr || 5);
  let baseCd = Number(mainStats.cd || 50);
  let baseBe = Number(mainStats.be || 0);
  let baseDmgBoost = Number(mainStats.dmg_boost || 0);

  // 2. Aggregate Team Buffs from Matched Teammates
  let teamAtkGrant = 0;
  let teamCdGrant = 0;
  let teamCrGrant = 0;
  let teamDmgBoost = 0;
  let teamResPen = 0;
  let teamDefShred = 0;
  let teamVuln = 0;
  let teamBreakVuln = 0;
  let teamBeBoost = 0;
  let hasSuperBreak = false;
  let superBreakFactor = 1.0;
  let teamActionAdvances = [];

  matchedTeammates.forEach(tm => {
    const b = tm.dynamicBuffs || {};
    if (b.atkGrant) teamAtkGrant += b.atkGrant;
    if (b.cdGrant) teamCdGrant += b.cdGrant;
    if (b.crGrant) teamCrGrant += b.crGrant;
    if (b.dmgBoost) teamDmgBoost += b.dmgBoost;
    if (b.resPen) teamResPen += b.resPen;
    if (b.defShred) teamDefShred += b.defShred;
    if (b.ultVuln) teamVuln += b.ultVuln;
    if (b.allVuln) teamVuln += b.allVuln;
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

  // Cap DEF shred at 100% max
  const totalDefShred = Math.min(1.0, teamDefShred / 100);
  // MoC 12 Boss Lv.90 DEF multiplier: 1000 / (1100 * (1 - defShred) + 1000)
  const defMult = 1000 / (1100 * (1 - totalDefShred) + 1000);

  // Elemental Resistance multiplier: Base 20% RES (0.80) + RES PEN
  const resMult = 0.80 + (teamResPen / 100);

  // Vulnerability multiplier: 1 + Total Vulnerability
  const vulnMult = 1 + (teamVuln / 100);

  // Total Combat Crit Stats with team buffs
  const combatCr = Math.min(1.0, (baseCr + teamCrGrant + (name.includes('химеко') ? 15 : 0)) / 100);
  const combatCd = (baseCd + teamCdGrant) / 100;
  const critMultiplier = 1 + (combatCr * combatCd);

  // Total Scaling Stat with team buffs
  const combatAtk = baseAtk + teamAtkGrant;
  const combatHp = baseHp;
  const combatDmgBonus = 1 + ((baseDmgBoost + teamDmgBoost) / 100);

  // -------------------------------------------------------------------------
  // 3. Chronological Step-by-Step Action Rotation
  // -------------------------------------------------------------------------
  const steps = [];
  let rotationTotalDamage = 0;
  let peakHitDamage = 0;

  // Step 1: Buffers Pre-cast Phase
  matchedTeammates.forEach((tm, idx) => {
    steps.push({
      stepNumber: steps.length + 1,
      charName: tm.matchedChar?.name || (isRu ? tm.names[0] : tm.names[1] || tm.names[0]),
      avatar: tm.matchedChar?.avatar?.icon || null,
      phase: isRu ? 'ФАЗА ПОДГОТОВКИ (БУФФЫ И ДЕБАФФЫ)' : 'SETUP PHASE (BUFFS & DEBUFFS)',
      actionNameRu: `${tm.roleRu}: Активация навыка и сверхспособности`,
      actionNameEn: `${tm.roleEn}: Skill & Ultimate Activation`,
      descRu: tm.dynamicBuffDescRu,
      descEn: tm.dynamicBuffDescEn,
      damage: 0,
      isDamageAction: false,
      isEquipped: tm.isEquippedInShowcase
    });
  });

  // Step 2: Main DPS Execution Phase
  const isHimeko = charId === '1003' || name.includes('химеко') || name.includes('himeko') || name.includes('нова');
  const isAcheron = charId === '1308' || name.includes('ахерон') || name.includes('acheron');
  const isFirefly = charId === '1310' || name.includes('светлячок') || name.includes('firefly');
  const isFeixiao = charId === '1220' || name.includes('фэйсяо') || name.includes('feixiao');
  const isMortenax = charId === '1507' || name.includes('мортенакс') || name.includes('mortenax');

  if (isHimeko) {
    // Button 1: Himeko Enhanced Skill "Molten Detonation" (200% primary + 2x 80% blast = 360% total)
    const skillDmg = Math.round(combatAtk * 3.60 * combatDmgBonus * critMultiplier * defMult * resMult * vulnMult);
    rotationTotalDamage += skillDmg;
    peakHitDamage = Math.max(peakHitDamage, skillDmg);
    steps.push({
      stepNumber: steps.length + 1,
      charName: mainChar.name,
      avatar: mainChar.avatar?.icon || null,
      phase: isRu ? 'ХОД ДПС (НАВЫК)' : 'DPS TURN (SKILL)',
      actionNameRu: 'Навык «Расплавленное пламя» (Огненный взрыв по боссу и миньонам)',
      actionNameEn: 'Skill: Molten Detonation (Blast Fire DMG)',
      descRu: `200% ATK по боссу + 80% по соседним целям под баффом +${teamDmgBoost}% урона и ${((combatCr * 100)).toFixed(0)}% КШ / ${((combatCd * 100)).toFixed(0)}% КУ.`,
      descEn: `200% ATK single + 80% blast with full team multipliers.`,
      damage: skillDmg,
      isDamageAction: true
    });

    // Button 2: Himeko Ultimate "Heavenly Flare" (230% AoE to all targets)
    const ultDmg = Math.round(combatAtk * 4.60 * (combatDmgBonus + 0.20) * critMultiplier * defMult * resMult * vulnMult);
    rotationTotalDamage += ultDmg;
    peakHitDamage = Math.max(peakHitDamage, ultDmg);
    steps.push({
      stepNumber: steps.length + 1,
      charName: mainChar.name,
      avatar: mainChar.avatar?.icon || null,
      phase: isRu ? 'СВЕРХСПОСОБНОСТЬ (УЛЬТИМЕЙТ)' : 'ULTIMATE BURST',
      actionNameRu: 'Сверхспособность «Небесное пламя» (Массовый залп орбитального спутника)',
      actionNameEn: 'Ultimate: Heavenly Flare (Massive Orbital Strike)',
      descRu: `230% AoE урон по всему полю боя с гарантированным пробитием уязвимости.`,
      descEn: `230% AoE strike triggering weakness break across field.`,
      damage: ultDmg,
      isDamageAction: true
    });

    // Button 3: Talent "Victory Rush" (140% ATK x 3 procs on broken targets)
    const fuaDmg = Math.round(combatAtk * 1.40 * 3 * (combatDmgBonus + 0.25) * critMultiplier * defMult * resMult * vulnMult);
    rotationTotalDamage += fuaDmg;
    peakHitDamage = Math.max(peakHitDamage, fuaDmg);
    steps.push({
      stepNumber: steps.length + 1,
      charName: mainChar.name,
      avatar: mainChar.avatar?.icon || null,
      phase: isRu ? 'БОНУС-АТАКА (ТАЛАНТ)' : 'FOLLOW-UP ATTACK',
      actionNameRu: 'Талант «Победный кураж» (3 срабатывания по пробитым целям)',
      actionNameEn: 'Talent: Victory Rush (3 Follow-up procs)',
      descRu: `140% ATK по всем врагам при истощении стойкости босса и миньонов.`,
      descEn: `140% ATK AoE follow-up triggered on weakness break.`,
      damage: fuaDmg,
      isDamageAction: true
    });

    // Button 4: Super Break proc (if Super Break squad)
    if (hasSuperBreak) {
      const baseBreakLv80 = 3767.55;
      const beMultiplier = 1 + ((baseBe + teamBeBoost) / 100);
      const sbDmg = Math.round(baseBreakLv80 * (40 / 30) * beMultiplier * defMult * resMult * (1 + teamBreakVuln / 100) * superBreakFactor * 2);
      rotationTotalDamage += sbDmg;
      steps.push({
        stepNumber: steps.length + 1,
        charName: isRu ? 'Эффект Суперпробития' : 'Super Break Proc',
        avatar: null,
        phase: isRu ? 'СУПЕРПРОБИТИЕ (ОТРЯД)' : 'SUPER BREAK IMPACT',
        actionNameRu: 'Командное Суперпробитие (2 срабатывания по сломанной стойкости)',
        actionNameEn: 'Team Super Break (2 procs on broken bar)',
        descRu: `Урон суперпробития от истощения стойкости под баффом Гармонии ГГ и Жуань Мэй.`,
        descEn: `Super Break damage scaling on toughness reduction and Break Effect.`,
        damage: sbDmg,
        isDamageAction: true
      });
    }
  } else if (isAcheron) {
    // Acheron: Skill (160% ATK) + 9-hit Ultimate "Slashed Dream: Crying Red" (372% ST + 300% Crimson Knot + 120% AoE)
    const skillDmg = Math.round(combatAtk * 1.60 * combatDmgBonus * critMultiplier * defMult * resMult * vulnMult);
    const ultDmg = Math.round(combatAtk * 7.92 * (combatDmgBonus + 0.90) * critMultiplier * defMult * resMult * vulnMult);
    rotationTotalDamage += skillDmg + ultDmg;
    peakHitDamage = ultDmg;

    steps.push({
      stepNumber: steps.length + 1,
      charName: mainChar.name,
      phase: isRu ? 'ХОД ДПС (НАВЫК)' : 'DPS TURN (SKILL)',
      actionNameRu: 'Навык «Восьмикратный раскол» (2 заряда Рассечённого сна)',
      actionNameEn: 'Skill: Octobolt Flash (2 Slashed Dream charges)',
      damage: skillDmg,
      isDamageAction: true
    });

    steps.push({
      stepNumber: steps.length + 1,
      charName: mainChar.name,
      phase: isRu ? 'СВЕРХСПОСОБНОСТЬ (УЛЬТИМЕЙТ)' : 'ULTIMATE BURST',
      actionNameRu: 'Сверхспособность «Сон в багряных слезах» (9 зарядов Багрового узла)',
      actionNameEn: 'Ultimate: Slashed Dream (9 Crimson Knots)',
      damage: ultDmg,
      isDamageAction: true
    });
  } else if (isFirefly) {
    // Firefly: Enhanced Skill (200% ATK + Super Break burst)
    const baseBreakLv80 = 3767.55;
    const beMultiplier = 1 + ((baseBe + teamBeBoost) / 100);
    const sbDmg = Math.round(baseBreakLv80 * (60 / 30) * beMultiplier * defMult * resMult * (1 + teamBreakVuln / 100) * 2.5);
    rotationTotalDamage += sbDmg;
    peakHitDamage = sbDmg;

    steps.push({
      stepNumber: steps.length + 1,
      charName: mainChar.name,
      phase: isRu ? 'УСИЛЕННЫЙ НАВЫК' : 'ENHANCED SKILL',
      actionNameRu: 'Навык «Смертоносная звезда» (Огненное суперпробитие)',
      actionNameEn: 'Skill: Deathstar Overload (Super Break)',
      damage: sbDmg,
      isDamageAction: true
    });
  } else if (isMortenax) {
    // Mortenax Blade: Skill (168% HP AoE & Bounce) + Ult inside Zone
    const skillDmg = Math.round(combatHp * 1.68 * combatDmgBonus * critMultiplier * defMult * resMult * vulnMult);
    const ultDmg = Math.round(combatHp * 1.80 * (combatDmgBonus + 0.30) * critMultiplier * defMult * resMult * vulnMult);
    rotationTotalDamage += skillDmg + ultDmg;
    peakHitDamage = Math.max(skillDmg, ultDmg);

    steps.push({
      stepNumber: steps.length + 1,
      charName: mainChar.name,
      phase: isRu ? 'НАВЫК В ЗОНЕ' : 'ZONE SKILL',
      actionNameRu: 'Навык «Дождь клинков вершит судьбу» (168% Макс. HP)',
      actionNameEn: 'Skill: Rain of Blades (168% Max HP)',
      damage: skillDmg,
      isDamageAction: true
    });

    steps.push({
      stepNumber: steps.length + 1,
      charName: mainChar.name,
      phase: isRu ? 'СВЕРХСПОСОБНОСТЬ В ЗОНЕ' : 'ZONE ULTIMATE',
      actionNameRu: 'Сверхспособность «Неукротимый сквозь огонь» (Огненный взрыв)',
      actionNameEn: 'Ultimate: Tenax Per Ignem',
      damage: ultDmg,
      isDamageAction: true
    });
  } else {
    // Generic Crit DPS: Skill + Ultimate
    const scalingStat = Math.max(1200, combatAtk || combatHp);
    const skillDmg = Math.round(scalingStat * 2.20 * combatDmgBonus * critMultiplier * defMult * resMult * vulnMult);
    const ultDmg = Math.round(scalingStat * 3.40 * (combatDmgBonus + 0.30) * critMultiplier * defMult * resMult * vulnMult);
    rotationTotalDamage += skillDmg + ultDmg;
    peakHitDamage = Math.max(skillDmg, ultDmg);

    steps.push({
      stepNumber: steps.length + 1,
      charName: mainChar.name,
      phase: isRu ? 'ХОД ДПС (НАВЫК)' : 'DPS TURN (SKILL)',
      actionNameRu: 'Усиленный боевой навык',
      actionNameEn: 'Enhanced Combat Skill',
      damage: skillDmg,
      isDamageAction: true
    });

    steps.push({
      stepNumber: steps.length + 1,
      charName: mainChar.name,
      phase: isRu ? 'СВЕРХСПОСОБНОСТЬ' : 'ULTIMATE BURST',
      actionNameRu: 'Сверхспособность (Полный прокаст под баффами)',
      actionNameEn: 'Ultimate Burst (Full Team Buffs)',
      damage: ultDmg,
      isDamageAction: true
    });
  }

  // Calculate Team Cycle DPS (Standard 100 AV window)
  const actionsPerCycle = Math.max(1.0, (100 * baseSpd) / 10000);
  const teamCycleDps = Math.round((rotationTotalDamage / 2.0) * actionsPerCycle);

  return {
    rotationTotalDamage,
    peakHitDamage,
    teamCycleDps,
    steps,
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
