// Hand-configured damage-instance scripts. These are draft model inputs, not
// validated game-engine rotations (timing, energy, and conditional uptime are absent).
// Each instance: { mv, targets, count, phase, actionName, desc }
// mv = motion value (multiplier of scaling stat per hit), targets = how many enemies each hit covers
// (1 = single target, 3 = boss + 2 adds), count = number of repeated hits.
// Scaling stat is resolved by the engine: atk (default) or hp (hpScale).
//
// Rotation statuses:
// - "draft": multipliers come from the kit but no energy/action timeline is checked.
// - "kit-verified": motion values AND energy gains/costs come from the official kit
//   (mirrored by Prydwen from OSPROD game data). Per-cycle repeat counts are a
//   documented assumption stated in noteRu/noteEn; conditional passives with
//   unverified uptime are deliberately excluded and listed in the notes.
// - "verified": full turn-by-turn timeline with energy and buff uptime verified
//   against a published source.
//
// Optional per-instance fields:
// - energyGain: energy produced by one use (filler instances must be able to fund the ult).
// - isUlt: instance is the ultimate itself (excluded from the filler energy sum).
// - adjacentMv: motion value on non-primary targets (blast). Omitted => same as mv (AoE).
// - beScale / beScaleAdjacent: motion value added as (fraction x Break Effect),
//   capped by kitRotation.beCapPercent (percentage points).

export const ROTATIONS = {
  // Химеко: Нова (1510) — полный цикл сверхспособности «Starblazer» по реальному киту (4.7)
  "1510": {
    status: "draft",
    gameVersion: "4.7",
    evidence: [],
    buffUptimeStatus: "unverified",
    noteRu: "Нет проверенной временной шкалы ходов, энергии и длительности эффектов.",
    noteEn: "No verified action, energy, or effect-duration timeline is available.",
    hpScale: false,
    passiveDmgBoost: 20, // Navigator's Semaphore: +20% урона всем союзникам — учитывается как собственный аурный баф
    // Талант «Of Fire and Far Faring» (Territory Starblazer): пока Химеко Нова на поле,
    // её All-Type RES PEN +20% и CRIT DMG +80% — учитываются в личных множителях.
    passiveCritDmg: 80,
    passiveResPen: 20,
    ultLoop: true,
    instances: [
      {
        key: "beams",
        phaseRu: "СВЕРХСПОСОБНОСТЬ — HYPERLUMINAL BEAM",
        phaseEn: "ULTIMATE — HYPERLUMINAL BEAM",
        actionRu: "6 лучей «Гиперсветового ускорителя» (32% AoE каждый, копит Source Energy)",
        actionEn: "6x Hyperluminal Particle Beam (32% AoE each, stacks Source Energy)",
        descRu: "32% ATK по всем врагам, 6 срабатываний. Каждый луч даёт 1 ед. Source Energy (макс. 3).",
        descEn: "32% ATK to all enemies, 6 instances. Each beam grants 1 Source Energy (max 3).",
        mv: 0.32, targets: 3, count: 6
      },
      {
        key: "pulse",
        phaseRu: "СВЕРХСПОСОБНОСТЬ — ORBITAL PULSE",
        phaseEn: "ULTIMATE — ORBITAL ANNIHILATION PULSE",
        actionRu: "3 залпа «Орбитального уничтожения» (20% AoE + 2×60%×SE по случайным целям, след A6: +30% к множителю случайных)",
        actionEn: "3x Orbital Annihilation Pulse (20% AoE + 2x60% per SE randoms, A6 trace: +30% random multiplier)",
        descRu: "20% ATK по всем + 2 случайных удара по 60% ATK (30% базово + 30% от следа A6 при 3 ед. Source Energy). До 140% ATK за залп по боссу.",
        descEn: "20% ATK AoE + 2 random hits of 60% ATK (30% base + 30% from A6 trace at 3 Source Energy). Up to 140% ATK per volley on one target.",
        mv: 1.4, targets: 1, count: 3
      },
      {
        key: "final",
        phaseRu: "СВЕРХСПОСОБНОСТЬ — FINAL HIT",
        phaseEn: "ULTIMATE — FINAL HIT",
        actionRu: "Финальный залп: 3×80% ATK по случайным целям",
        actionEn: "Final Hit: 3x 80% ATK random targets",
        descRu: "Финал цикла Starblazer: 3 инстанса по 80% ATK.",
        descEn: "Starblazer cycle finale: 3 instances of 80% ATK.",
        mv: 0.8, targets: 1, count: 3
      },
      {
        key: "basic",
        phaseRu: "ЗАПОЛНЯЮЩИЕ ХОДЫ",
        phaseEn: "FILLER TURNS",
        actionRu: "2 базовые атаки (100% ATK) + бонус-атака таланта (3×90% ATK)",
        actionEn: "2 Basic ATKs (100% ATK) + Talent FUA (3x 90% ATK)",
        descRu: "Ходы между ультами: базовые атаки и срабатывания таланта «Of Fire and Far Faring».",
        descEn: "Turns between ultimates: basic attacks and Talent procs.",
        mv: 1.0, targets: 1, count: 2
      },
      {
        key: "talent_fua",
        phaseRu: "ТАЛАНТ — БОНУС-АТАКИ",
        phaseEn: "TALENT — FOLLOW-UP",
        actionRu: "Бонус-атаки таланта между действиями союзников",
        actionEn: "Talent follow-up procs between ally actions",
        descRu: "3 срабатывания по 90% ATK (оценка по классу кита).",
        descEn: "3 procs of 90% ATK (kit-class estimate).",
        mv: 0.9, targets: 1, count: 3
      }
    ]
  },

  // Зеле (1102) — цикл: 3 навыка + 2 базовые + ульт (120 энергии). Множители и энергия — официальный кит.
  "1102": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "prydwen.gg",
        url: "https://www.prydwen.gg/star-rail/characters/seele/",
        capturedOn: "2026-11-15",
        note: "Skill 360% ATK, Basic 100%, Ult 720% (120 energy, +5), Skill energy +30, Basic energy +20."
      }
    ],
    noteRu: "Цикл: 3 навыка (360%×3) + 2 базовые атаки (100%) + ульт (720%). Энергия: 3×30 + 2×20 = 130 ≥ 120. Не включено (аптайм не подтверждён): авто-навык таланта по цели ≤50% HP (360%, без энергии, 1 раз/ход), +80% урона в состоянии Усиления (след), +25% Quantum RES PEN (след A4). Энергия союзников и авто-процы не учитываются — оценка консервативная.",
    noteEn: "Cycle: 3 skills (360% x3) + 2 basics (100%) + ult (720%). Energy: 3x30 + 2x20 = 130 >= 120. Excluded (uptime unverified): Talent auto-skill on <=50% HP targets (360%, no energy, once/turn), +80% DMG in Amplification (Talent), +25% Quantum RES PEN (A4 trace). Ally energy feed and auto-procs are not counted — conservative estimate.",
    hpScale: false,
    energy: { ultCost: 120 },
    instances: [
      {
        key: "skill",
        phaseRu: "НАВЫК — ОСТРИЁ В НОЖНАХ",
        phaseEn: "SKILL — SHEATHED BLADE",
        actionRu: "3 применения навыка (360% ATK каждый)",
        actionEn: "3x Skill uses (360% ATK each)",
        descRu: "360% ATK по одной цели, +30 энергии за применение.",
        descEn: "360% ATK to one target, +30 energy per use.",
        mv: 3.6, targets: 1, count: 3, energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "БАЗОВЫЕ АТАКИ — ЗАПОЛНЕНИЕ",
        phaseEn: "BASIC ATK — FILLER",
        actionRu: "2 базовые атаки (100% ATK)",
        actionEn: "2x Basic ATK (100% ATK)",
        descRu: "Заполнители SP/энергии: 100% ATK, +20 энергии.",
        descEn: "SP/energy fillers: 100% ATK, +20 energy.",
        mv: 1.0, targets: 1, count: 2, energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ — ВИХРЬ БАБОЧЕК",
        phaseEn: "ULTIMATE — BUTTERFLY FLURRY",
        actionRu: "Ульт: 720% ATK по одной цели (гарантированный крит)",
        actionEn: "Ult: 720% ATK to one target (guaranteed crit)",
        descRu: "720% ATK, стоимость 120 энергии, +5 энергии после.",
        descEn: "720% ATK, costs 120 energy, +5 energy after.",
        mv: 7.2, targets: 1, count: 1, energyGain: 5, isUlt: true
      }
    ]
  },

  // Дань Хэн: Пожиратель Луны (1213) — цикл: 3 взлёта + базовая + ульт (140 энергии, A2: +15 на старте).
  "1213": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "prydwen.gg",
        url: "https://www.prydwen.gg/star-rail/characters/imbibitor-lunae/",
        capturedOn: "2026-11-15",
        note: "Fulgurant Leap 500% + 180% adjacent, energy +40; Basic 100%, energy +20; Ult 300% + 140% adjacent (140 energy, +5); A2 start +15 energy."
      }
    ],
    noteRu: "Цикл: 3 «Стремительного прыжка» (500% + 180% по смежным) + базовая (100%) + ульт (300% + 140% по смежным). Энергия: 3×40 + 20 + 15 (след A2) = 155 ≥ 140. Не включено: стаки Праведного сердца (+10% урона за удар, до 6) и Смертельной новости (+12% КУ за стак) — средний аптайм по ударам не верифицирован; Чешуя (смещение трат ОН) — экономия ОН не моделируется.",
    noteEn: "Cycle: 3x Fulgurant Leap (500% + 180% adjacent) + Basic (100%) + Ult (300% + 140% adjacent). Energy: 3x40 + 20 + 15 (A2 trace) = 155 >= 140. Excluded: Righteous Heart stacks (+10% DMG per hit, up to 6) and Outroar (+12% CD per stack) — per-hit average uptime unverified; Squama Sacrosancta SP offset not modeled.",
    hpScale: false,
    energy: { ultCost: 140, startEnergyFlat: 15 },
    instances: [
      {
        key: "leap",
        phaseRu: "УСИЛЕННАЯ БАЗОВАЯ — СТРЕМИТЕЛЬНЫЙ ПРЫЖОК",
        phaseEn: "ENHANCED BASIC — FULGURANT LEAP",
        actionRu: "3 взлёта: 500% ATK по главной цели + 180% по смежным (7 ударов, +40 энергии)",
        actionEn: "3x Leap: 500% ATK primary + 180% adjacent (7 hits, +40 energy)",
        descRu: "Пиковое усиление базовой атаки после 3 усиления навыка.",
        descEn: "Peak enhanced basic after three Dracore Libre enhancements.",
        mv: 5.0, adjacentMv: 1.8, targets: 3, count: 3, energyGain: 40
      },
      {
        key: "basic",
        phaseRu: "БАЗОВАЯ АТАКА — ЗАПОЛНЕНИЕ",
        phaseEn: "BASIC ATK — FILLER",
        actionRu: "1 базовая атака (100% ATK, +20 энергии)",
        actionEn: "1x Basic ATK (100% ATK, +20 energy)",
        descRu: "Обычная базовая атака для замыкания энергии цикла.",
        descEn: "Plain basic ATK to close the cycle's energy budget.",
        mv: 1.0, targets: 1, count: 1, energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ — ЛАЗУРНАЯ ВОДА ОМЫВАЕТ ВСЁ",
        phaseEn: "ULTIMATE — AZURE'S AQUA ABLUTES ALL",
        actionRu: "Ульт: 300% ATK по главной + 140% по смежным, 2 ед. Чешуи",
        actionEn: "Ult: 300% ATK primary + 140% adjacent, 2 Squama Sacrosancta",
        descRu: "Стоимость 140 энергии, +5 энергии после, взрыв по площади.",
        descEn: "Costs 140 energy, +5 after, blast AoE.",
        mv: 3.0, adjacentMv: 1.4, targets: 3, count: 1, energyGain: 5, isUlt: true
      }
    ]
  },

  // Арчер (1015) — цикл 2 хода: 2×5 навыков в Circuit Connection (стаки +100%/+200%) + 4 FUA + ульт (220 энергии).
  "1015": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "prydwen.gg",
        url: "https://www.prydwen.gg/star-rail/characters/archer/",
        capturedOn: "2026-11-15",
        note: "Skill 360% (+100% per stack, max 2 stacks), 5 uses per turn, +30 energy each; FUA 200% (Charge, +5 energy, +1 SP); Ult 1000% (220 energy, +5); A4: start with 1 Charge."
      }
    ],
    noteRu: "Цикл 2 хода: за ход 5 навыков (1-й 360%, 2-й 720%, далее 1080% при 2 стаках), всего 10 навыков за цикл + 4 бонус-атаки таланта (200%) + ульт (1000%). Энергия: 10×30 + 4×5 = 320 ≥ 220. Число FUA (4 за цикл) — допущение по темпу атак союзников (заряд: старт 1 от следа A4, макс 4). Не включено: A6 (+120% КУ при ≥4 ОН), E2 (−20% Quantum RES от ульты). Экономия ОН (E1 возвращает 2 ОН после 3 навыков) не моделируется — при нехватке ОН число навыков за ход меньше.",
    noteEn: "2-turn cycle: 5 skills per turn (1st 360%, 2nd 720%, then 1080% at 2 stacks), 10 skills per cycle + 4 Talent FUAs (200%) + ult (1000%). Energy: 10x30 + 4x5 = 320 >= 220. The FUA count (4 per cycle) assumes the teammates' attack pace (Charge: start 1 via A4, max 4). Excluded: A6 (+120% CD at >=4 SP), E2 (-20% Quantum RES on ult). SP economy (E1 refunds 2 SP after 3 skills) is not modeled — with SP shortage fewer skills fire per turn.",
    hpScale: false,
    energy: { ultCost: 220 },
    instances: [
      {
        key: "skill_first",
        phaseRu: "НАВЫК — ПЕРВЫЙ ЗА ХОД",
        phaseEn: "SKILL — FIRST OF TURN",
        actionRu: "2 навыка без стаков (360% ATK, +30 энергии)",
        actionEn: "2 unstacked Skill uses (360% ATK, +30 energy)",
        descRu: "Первый навык хода в Circuit Connection: 360% ATK.",
        descEn: "First skill of a turn in Circuit Connection: 360% ATK.",
        mv: 3.6, targets: 1, count: 2, energyGain: 30
      },
      {
        key: "skill_mid",
        phaseRu: "НАВЫК — ВТОРОЙ ЗА ХОД (1 СТАК)",
        phaseEn: "SKILL — SECOND OF TURN (1 STACK)",
        actionRu: "2 навыка с 1 стаком (720% ATK, +30 энергии)",
        actionEn: "2 Skill uses at 1 stack (720% ATK, +30 energy)",
        descRu: "Второй навык хода: урон навыка ×2 (стак +100%).",
        descEn: "Second skill of a turn: skill DMG x2 (stack +100%).",
        mv: 7.2, targets: 1, count: 2, energyGain: 30
      },
      {
        key: "skill_stacked",
        phaseRu: "НАВЫК — ПОЛНЫЙ СТАК",
        phaseEn: "SKILL — FULL STACKS",
        actionRu: "6 навыков с 2 стаками (1080% ATK, +30 энергии)",
        actionEn: "6 Skill uses at 2 stacks (1080% ATK, +30 energy)",
        descRu: "С 3-го навыка хода и далее: урон ×3 (2 стака).",
        descEn: "Third skill of a turn onward: DMG x3 (2 stacks).",
        mv: 10.8, targets: 1, count: 6, energyGain: 30
      },
      {
        key: "fua",
        phaseRu: "ТАЛАНТ — ОКО РАЗУМА (ИСТИНА)",
        phaseEn: "TALENT — MIND'S EYE (TRUE)",
        actionRu: "4 бонус-атаки (200% ATK за атаку союзника, +5 энергии, +1 ОН)",
        actionEn: "4x Talent FUA (200% ATK per ally attack, +5 energy, +1 SP)",
        descRu: "Допущение: 4 срабатывания за 2 хода по темпу атак союзников (заряды расходуются по 1).",
        descEn: "Assumption: 4 procs per 2 turns based on allies' attack pace (Charges consumed 1 per proc).",
        mv: 2.0, targets: 1, count: 4, energyGain: 5
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ — НЕОГРАНИЧЕННЫЕ КЛИНКИ",
        phaseEn: "ULTIMATE — UNLIMITED BLADE WORKS",
        actionRu: "Ульт: 1000% ATK по одной цели, 2 заряда",
        actionEn: "Ult: 1000% ATK to one target, 2 Charges",
        descRu: "Стоимость 220 энергии, +5 энергии после.",
        descEn: "Costs 220 energy, +5 energy after.",
        mv: 10.0, targets: 1, count: 1, energyGain: 5, isUlt: true
      }
    ]
  },

  // Светлячок (1310) — цикл: ульт (240, старт ≥50% от таланта) → окно Complete Combustion
  // (2 усиленных навыка + 1 усиленная базовая) → обычный навык (восстановление энергии).
  "1310": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "prydwen.gg",
        url: "https://www.prydwen.gg/star-rail/characters/firefly/",
        capturedOn: "2026-11-15",
        note: "Enhanced Skill (0.2xBE+200%) primary, (0.1xBE+100%) adjacent; Enhanced Basic 150%; base Skill 200%, +60% Max Energy; Ult costs 240; Talent: start with >=50% energy."
      }
    ],
    noteRu: "Цикл: ульт (240 энергии; талант даёт старт ≥50%) → окно Complete Combustion: 2 усиленных навыка (200% + 0.2×ЭП по главной, 100% + 0.1×ЭП по смежным) + 1 усиленная базовая (150%) → 1 обычный навык (+144 энергии = 60% от макс). Энергия: 144 + 120 (старт) = 264 ≥ 240. Длина окна CC (2 навыка + 1 базовая) — допущение по таймеру SPD 70. Не включено: Super Break (след A4, 100%/150% при ЭП ≥150%/300%), A6 (+0.8% ЭП за каждые 10 ATK свыше 1800), траты HP, кап ЭП 360% учитывается.",
    noteEn: "Cycle: ult (240 energy; Talent grants >=50% start) -> Complete Combustion window: 2 enhanced skills (200% + 0.2xBE primary, 100% + 0.1xBE adjacent) + 1 enhanced basic (150%) -> 1 base skill (+144 energy = 60% of Max). Energy: 144 + 120 (start) = 264 >= 240. The CC window length (2 skills + 1 basic) assumes the SPD 70 countdown. Excluded: Super Break (A4 trace, 100%/150% at BE >=150%/300%), A6 (+0.8% BE per 10 ATK above 1800), HP costs; the 360% BE cap is applied.",
    hpScale: false,
    beCapPercent: 360,
    energy: { ultCost: 240, startEnergyPercent: 50 },
    instances: [
      {
        key: "e_skill",
        phaseRu: "УСИЛЕННЫЙ НАВЫК — DEATHSTAR OVERLOAD",
        phaseEn: "ENHANCED SKILL — DEATHSTAR OVERLOAD",
        actionRu: "2 усиленных навыка: (0.2×ЭП + 200%) по главной + (0.1×ЭП + 100%) по смежным",
        actionEn: "2x Enhanced Skill: (0.2xBE + 200%) primary + (0.1xBE + 100%) adjacent",
        descRu: "Кап учтённого ЭП — 360%. Добавляет огневую слабость целям.",
        descEn: "Counted BE capped at 360%. Adds Fire Weakness to targets.",
        mv: 2.0, beScale: 0.2, adjacentMv: 1.0, beScaleAdjacent: 0.1, targets: 3, count: 2, energyGain: 0
      },
      {
        key: "e_basic",
        phaseRu: "УСИЛЕННАЯ БАЗОВАЯ — PYROGENIC DECIMATION",
        phaseEn: "ENHANCED BASIC — PYROGENIC DECIMATION",
        actionRu: "1 усиленная базовая: 150% ATK (восстановление HP)",
        actionEn: "1x Enhanced Basic: 150% ATK (heals self)",
        descRu: "Заполнитель внутри окна CC, энергии не даёт.",
        descEn: "Filler inside the CC window, produces no energy.",
        mv: 1.5, targets: 1, count: 1, energyGain: 0
      },
      {
        key: "refill_skill",
        phaseRu: "НАВЫК ПОСЛЕ CC — ЗАРЯДКА ЭНЕРГИИ",
        phaseEn: "BASE SKILL AFTER CC — ENERGY REFILL",
        actionRu: "1 обычный навык: 200% ATK, +60% макс. энергии (+144)",
        actionEn: "1x Base Skill: 200% ATK, +60% Max Energy (+144)",
        descRu: "Тратит 40% HP (не моделируется), заряжает ульту.",
        descEn: "Costs 40% HP (not modeled), charges the ult.",
        mv: 2.0, targets: 1, count: 1, energyGain: 144
      }
    ]
  }
};
