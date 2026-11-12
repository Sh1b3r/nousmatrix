/**
 * NousMatrix Combat Simulation Engine
 * Official Honkai: Star Rail damage & performance formulas:
 * - Enemy: Lv. 90 MoC 12 Boss (1100 DEF factor)
 * - Character: Lv. 80 (1000 DEF factor)
 * - Resistance: Standard 20% Base RES (0.80 multiplier) or Weakness broken (1.00)
 * - Cycle AV: Cycle 0 (150 AV) and Standard Cycles (100 AV)
 */

export function runCombatSimulation(char, stats, archetype, lang = 'ru') {
  if (!char || !stats) return null;
  const isRu = lang === 'ru';
  const name = (char.name || '').toLowerCase();
  const charId = String(char.id || '');

  const {
    hp = 0,
    atk = 0,
    def = 0,
    spd = 100,
    cr = 5,
    cd = 50,
    be = 0,
    ehr = 0,
    err = 0,
    dmg_boost = 0
  } = stats;

  // 1. Core Multipliers
  const defMult = 1000 / (1100 + 1000); // 0.47619
  const resMult = 0.80; // Standard 20% base enemy RES
  const baseDmgCoeff = defMult * resMult; // ~0.38095

  // Speed & Action Value
  // Actions in 150 AV (Cycle 0) and 100 AV (Subsequent cycles)
  const actionsPerCycle0 = Math.floor((150 * spd) / 10000) + (((150 * spd) % 10000) / 10000);
  const actionsPerCycle = Math.floor((100 * spd) / 10000) + (((100 * spd) % 10000) / 10000);

  // Mortenax Blade check: +20% CR / +60% CD in Zone
  const isMortenax = charId === '1507' || name.includes('мортенакс') || name.includes('mortenax');
  const simCr = Math.min(1.0, (cr + (isMortenax ? 20 : 0)) / 100);
  const simCd = (cd + (isMortenax ? 60 : 0)) / 100;
  const critMultiplier = 1 + (simCr * simCd);

  // 2. Archetype Based Simulations
  let result = null;

  switch (archetype) {
    case 'BREAK_DPS': {
      // Super Break / Break DPS (Firefly, Boothill, Rappa)
      const baseBreakLv80 = 3767.55;
      const beMultiplier = 1 + (be / 100);
      const toughnessReduction = 30; // Standard enhanced skill / ult toughness
      const superBreakDPA = Math.round(baseBreakLv80 * (toughnessReduction / 30) * beMultiplier * defMult * 1.5);
      const totalDPC = Math.round(superBreakDPA * actionsPerCycle);

      result = {
        type: 'DAMAGE',
        metric1Label: isRu ? 'УРОН СУПЕРПРОБИТИЯ (DPA)' : 'SUPER BREAK HIT (DPA)',
        metric1Value: `${superBreakDPA.toLocaleString('ru-RU')}`,
        metric2Label: isRu ? 'DPS ЗА ЦИКЛ (100 AV)' : 'CYCLE DPS (100 AV)',
        metric2Value: `${totalDPC.toLocaleString('ru-RU')}`,
        metric3Label: isRu ? 'ЧАСТОТА ХОДОВ В ЦИКЛЕ' : 'ACTIONS PER CYCLE',
        metric3Value: `${actionsPerCycle.toFixed(2)}x (${actionsPerCycle0.toFixed(2)}x в Цикле 0)`,
        summaryRu: `Симуляция против босса MoC 12 (90 ур.): пробитие наносит ~${superBreakDPA.toLocaleString('ru-RU')} урона за атаку при ${be.toFixed(0)}% ЭП.`,
        summaryEn: `Simulated vs MoC 12 Lv.90 Boss: Super Break deals ~${superBreakDPA.toLocaleString('en-US')} per action at ${be.toFixed(0)}% BE.`,
        benchmarkTier: totalDPC >= 280000 ? 'SSS' : (totalDPC >= 200000 ? 'SS' : (totalDPC >= 140000 ? 'S' : 'A'))
      };
      break;
    }

    case 'DOT_DPS': {
      // DoT DPS (Kafka, Black Swan, Guinaifen, Sampo)
      const dotMultiplier = 2.40; // Average aggregated DoT motion value
      const totalDmgBonus = 1 + (dmg_boost / 100);
      const ehrFactor = Math.min(1.0, (1 + ehr / 100) * 0.65); // Against 30-40% Boss Effect RES
      const dotTick = Math.round(atk * dotMultiplier * totalDmgBonus * baseDmgCoeff * ehrFactor);
      const dotDPC = Math.round(dotTick * (actionsPerCycle + 1.0)); // DoT ticks naturally + skill detonations

      result = {
        type: 'DAMAGE',
        metric1Label: isRu ? 'ТИК ДОТА (DPA)' : 'DOT TICK (DPA)',
        metric1Value: `${dotTick.toLocaleString('ru-RU')}`,
        metric2Label: isRu ? 'УРОН ЗА ЦИКЛ С ДЕТОНАЦИЕЙ' : 'CYCLE DAMAGE W/ DETONATION',
        metric2Value: `${dotDPC.toLocaleString('ru-RU')}`,
        metric3Label: isRu ? 'ШАНС НАЛОЖЕНИЯ (ПРОТИВ 40% СЭ)' : 'HIT CHANCE (VS 40% RES)',
        metric3Value: `${(ehrFactor * 100).toFixed(1)}%`,
        summaryRu: `Периодический урон боссу: ~${dotTick.toLocaleString('ru-RU')} за срабатывание. При детонациях суммарно ~${dotDPC.toLocaleString('ru-RU')} в цикл.`,
        summaryEn: `Boss DoT tick: ~${dotTick.toLocaleString('en-US')} per proc. Aggregated cycle output ~${dotDPC.toLocaleString('en-US')}.`,
        benchmarkTier: dotDPC >= 220000 ? 'SSS' : (dotDPC >= 160000 ? 'SS' : (dotDPC >= 110000 ? 'S' : 'A'))
      };
      break;
    }

    case 'HP_CRIT_DPS':
    case 'MORTENAX_HYBRID':
    case 'CRIT_DPS':
    default: {
      if (archetype === 'HARMONY_SPD' || archetype === 'HARMONY_BREAK' || archetype === 'HARMONY_ATK' || archetype === 'HARMONY_CRIT') {
        // Harmony Buffer (Sunday, Yao Guang, Robin, Sparkle, Bronya, Ruan Mei, Tingyun)
        const teamAdvanceBonus = spd >= 160 ? 40 : (spd >= 145 ? 25 : 15);
        const effectiveBuffUptime = Math.min(100, Math.round((spd / 160) * 85 + (err >= 19.4 ? 15 : 5)));
        const teamDpsAmp = Math.round(35 + (spd / 160) * 25 + (err >= 19.4 ? 15 : 0) + (be >= 180 ? 20 : 0));

        result = {
          type: 'SUPPORT',
          metric1Label: isRu ? 'УСИЛЕНИЕ УРОНА ОТРЯДА' : 'TEAM DPS AMPLIFICATION',
          metric1Value: `+${teamDpsAmp}%`,
          metric2Label: isRu ? 'АПТАЙМ БАФФОВ И УЛЬТЫ' : 'BUFF & ULT UPTIME',
          metric2Value: `${effectiveBuffUptime}%`,
          metric3Label: isRu ? 'ПРОДВИЖЕНИЕ ДЕЙСТВИЙ ОТРЯДА' : 'TEAM ACTION ADVANCE',
          metric3Value: `+${teamAdvanceBonus}% AV (${actionsPerCycle.toFixed(2)}x ходов/цикл)`,
          summaryRu: `Поддержка команды: обеспечивает +${teamDpsAmp}% к общему урону отряда и ${effectiveBuffUptime}% аптайм усилений при скорости ${spd.toFixed(1)} SPD.`,
          summaryEn: `Team Support: delivers +${teamDpsAmp}% total team DPS increase with ${effectiveBuffUptime}% buff uptime at ${spd.toFixed(1)} SPD.`,
          benchmarkTier: teamDpsAmp >= 75 ? 'SSS' : (teamDpsAmp >= 60 ? 'SS' : (teamDpsAmp >= 48 ? 'S' : 'A'))
        };
        break;
      }

      if (archetype === 'PRESERVATION_DEF' || archetype === 'PRESERVATION_HP') {
        // Preservation Shielder (Aventurine, Gepard, Fu Xuan)
        const isFuXuan = name.includes('фу') || name.includes('fu');
        const shieldPerSkill = isFuXuan
          ? Math.round(hp * 0.06 + def * 0.15) // Damage reduction & HP mitigation
          : Math.round(def * 0.24 + 320); // Standard Aventurine/Gepard shield
        const teamEhpMultiplier = ((1 + (def / 1200)) * (isFuXuan ? 1.65 : 1.45)).toFixed(2);

        result = {
          type: 'SUSTAIN',
          metric1Label: isRu ? (isFuXuan ? 'ПОГЛОЩЕНИЕ УРОНА / ХОД' : 'ПРОЧНОСТЬ ЩИТА СО СКИЛЛА') : 'SHIELD CAPACITY PER SKILL',
          metric1Value: `${shieldPerSkill.toLocaleString('ru-RU')} HP`,
          metric2Label: isRu ? 'ЭФФЕКТИВНАЯ ЖИВУЧЕСТЬ ОТРЯДА' : 'TEAM EFFECTIVE HP (EHP)',
          metric2Value: `${teamEhpMultiplier}x БАЗЫ`,
          metric3Label: isRu ? 'ЧАСТОТА ОБНОВЛЕНИЯ ЩИТА' : 'SHIELD REFRESH RATE',
          metric3Value: `${actionsPerCycle.toFixed(2)}x в цикл (${spd.toFixed(1)} SPD)`,
          summaryRu: `Защитный барьер: генерирует ${shieldPerSkill.toLocaleString('ru-RU')} прочности за ход, увеличивая выживаемость команды в ${teamEhpMultiplier} раза.`,
          summaryEn: `Protective Barrier: provides ${shieldPerSkill.toLocaleString('en-US')} shield capacity per action, multiplying team EHP by ${teamEhpMultiplier}x.`,
          benchmarkTier: def >= 4000 || hp >= 7500 ? 'SSS' : (def >= 3500 || hp >= 6500 ? 'SS' : 'S')
        };
        break;
      }

      if (archetype === 'ABUNDANCE_HEAL') {
        // Abundance Healer (Luocha, Huohuo, Lingsha, Gallagher, Natasha)
        const healPerTurn = Math.round(hp * 0.12 + 180);
        const teamCleanseRate = spd >= 145 ? '100% (КАЖДЫЙ ХОД)' : '80% (ПО ТРЕБОВАНИЮ)';

        result = {
          type: 'SUSTAIN',
          metric1Label: isRu ? 'ЛЕЧЕНИЕ ЗА ДЕЙСТВИЕ' : 'HEAL PER ACTION',
          metric1Value: `+${healPerTurn.toLocaleString('ru-RU')} HP`,
          metric2Label: isRu ? 'ГОТОВНОСТЬ СНЯТИЯ ОСЛАБЛЕНИЙ' : 'CLEANSE READINESS',
          metric2Value: teamCleanseRate,
          metric3Label: isRu ? 'СКОРОСТЬ ВОССТАНОВЛЕНИЯ' : 'RECOVERY FREQUENCY',
          metric3Value: `${actionsPerCycle.toFixed(2)}x ходов в цикл (${spd.toFixed(1)} SPD)`,
          summaryRu: `Исцеление: восстанавливает ~${healPerTurn.toLocaleString('ru-RU')} HP за действие и надёжно удерживает здоровье отряда выше 90%.`,
          summaryEn: `Sustain Healing: restores ~${healPerTurn.toLocaleString('en-US')} HP per turn, maintaining team above 90% HP.`,
          benchmarkTier: spd >= 145 && hp >= 5500 ? 'SSS' : (spd >= 134 ? 'SS' : 'S')
        };
        break;
      }

      // Standard CRIT DPS & HP_CRIT_DPS (Acheron, Mortenax Hypercarry, Jingliu, Feixiao, Dan Heng IL)
      const isHpScale = archetype === 'HP_CRIT_DPS' || (isMortenax && archetype !== 'MORTENAX_SUPPORT');
      const scalingStat = isHpScale ? hp : atk;
      const motionValue = 2.20; // Average enhanced skill/ultimate motion value
      const totalDmgBonus = 1 + (dmg_boost / 100);

      const dpaRaw = scalingStat * motionValue * totalDmgBonus * critMultiplier * baseDmgCoeff;
      const dpa = Math.round(dpaRaw);
      const dpc = Math.round(dpa * actionsPerCycle);

      result = {
        type: 'DAMAGE',
        metric1Label: isRu ? 'СРЕДНИЙ УРОН ЗА УДАР (DPA)' : 'AVG DAMAGE PER HIT (DPA)',
        metric1Value: `${dpa.toLocaleString('ru-RU')}`,
        metric2Label: isRu ? 'DPS ЗА ЦИКЛ (100 AV)' : 'CYCLE DPS (100 AV)',
        metric2Value: `${dpc.toLocaleString('ru-RU')}`,
        metric3Label: isRu ? 'ОЖИДАЕМЫЙ МНОЖИТЕЛЬ КРИТА' : 'EXPECTED CRIT MULTIPLIER',
        metric3Value: `${critMultiplier.toFixed(2)}x (${(simCr * 100).toFixed(0)}% / ${(simCd * 100).toFixed(0)}%)`,
        summaryRu: `Симуляция боя против босса MoC 12: средний удар наносит ~${dpa.toLocaleString('ru-RU')}, суммарный урон за цикл ~${dpc.toLocaleString('ru-RU')} при множителе крита ${critMultiplier.toFixed(2)}x.`,
        summaryEn: `Simulated vs MoC 12 Boss: average attack delivers ~${dpa.toLocaleString('en-US')}, totaling ~${dpc.toLocaleString('en-US')} per cycle at ${critMultiplier.toFixed(2)}x crit expectation.`,
        benchmarkTier: dpc >= 260000 ? 'SSS' : (dpc >= 190000 ? 'SS' : (dpc >= 130000 ? 'S' : (dpc >= 85000 ? 'A' : 'B')))
      };
      break;
    }
  }

  return result;
}
