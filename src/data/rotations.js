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
// - extraDmgPercent: instance-scoped DMG bonus (Hyacine Talent +80% x3 -> only
//   Little Ica instances; must not buff her Basic ATK).
// - healTallyFraction: damage per hit = options.healingTally x fraction
//   (Hyacine's Little Ica: 20% of the accumulated healing tally).
// - inAfterRain: instance happens while the "After Rain" state is active
//   (Hyacine Ult buff +30% Max HP +600 -> applies via passiveHpPercent/passiveHpFlat).
// Rotation-level extras: passiveCritRate (unconditional +CRIT Rate trace),
// passiveHpPercent / passiveHpFlat (After Rain), superBreak { toughnessReductionPrimary,
// toughnessReductionAdjacent, tiers, targets } (Firefly A4: kit-native Super Break,
// triggered by the explicit options.superBreakProcs input).

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
    noteRu: "Цикл: ульт (240 энергии; талант даёт старт ≥50%) → окно Complete Combustion: 2 усиленных навыка (200% + 0.2×ЭП по главной, 100% + 0.1×ЭП по смежным) + 1 усиленная базовая (150%) → 1 обычный навык (+144 энергии = 60% от макс). Энергия: 144 + 120 (старт) = 264 ≥ 240. Длина окна CC (2 навыка + 1 базовая) — допущение по таймеру SPD 70. Суперпробитие (след A4, HoYoWiki-формула): при пробитой цели и ЭП ≥150%/300% каждый удар конвертирует истощение (30 + 15×смежные) в 100%/150% Super Break урона — число срабатываний задаётся явным вводом «Суперпробития», коэффициент выбирается по учтённому ЭП (кап 360%). Формула без крита, ATK и DMG%. Не включено: A6 (+0.8% ЭП за каждые 10 ATK свыше 1800 — не входит в учтённый ЭП), траты HP.",
    noteEn: "Cycle: ult (240 energy; Talent grants >=50% start) -> Complete Combustion window: 2 enhanced skills (200% + 0.2xBE primary, 100% + 0.1xBE adjacent) + 1 enhanced basic (150%) -> 1 base skill (+144 energy = 60% of Max). Energy: 144 + 120 (start) = 264 >= 240. The CC window length (2 skills + 1 basic) assumes the SPD 70 countdown. Super Break (A4 trace, HoYoWiki formula): against a broken target at BE >=150%/300% each hit converts its toughness reduction (30 + 15x adjacent) into 100%/150% Super Break DMG — the proc count is set by the explicit Super Break input, and the coefficient is selected from the counted BE (capped at 360%). No crit, ATK, or DMG% in the formula. Excluded: A6 (+0.8% BE per 10 ATK above 1800 — not part of the counted BE), HP costs.",
    hpScale: false,
    beCapPercent: 360,
    energy: { ultCost: 240, startEnergyPercent: 50 },
    // След A4 «Module β: Autoreactive Armor» (Prydwen): в состоянии Complete
    // Combustion при ЭП >=150%/300% истощение удара конвертируется в 1 срабатывание
    // 100%/150% Super Break урона. Усиленный навык снимает 30 стойкости (+15 по
    // смежным) — это T eligible для формулы Super Break.
    superBreak: {
      toughnessReductionPrimary: 30,
      toughnessReductionAdjacent: 15,
      targets: 3,
      tiers: [
        { bePercent: 300, factor: 1.5 },
        { bePercent: 150, factor: 1.0 }
      ]
    },
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
  },

  // Кастория (1407) — окно Нижнего Крыла: ульт-призыв → усиленный навык → 4 выдоха
  // (24/28/34/34% Max HP AoE, эскалация множителя) → «Крылья сметают руины»
  // (6×40% bounce) → обычные навыки-заполнители (50%+30% blast). Ресурс — Newbud,
  // не энергия: энергетическая проверка цикла к ней неприменима.
  "1407": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "prydwen.gg",
        url: "https://www.prydwen.gg/star-rail/characters/castorice/",
        capturedOn: "2026-11-16",
        note: "Basic 50% MaxHP; Skill (blast) 50% + 30% adjacent; Enhanced Skill (joint AoE) 30%+50% = 80% MaxHP to all; Breath attacks 24%/28%/34% (cap), 4th breath at <=25% dragon HP triggers Wings Sweep the Ruins 6x40%; Territory -20% All-Type RES; Talent +20% DMG x3 stacks; summon +10% DMG 3 turns; Newbud charge 34000 (Prydwen Review, max Equilibrium)."
      }
    ],
    noteRu: "Цикл одного призыва Нижнего Крыла (предпочтительная ротация по Review Prydwen — «сразу 4 выдоха одним действием + финальный взрыв»): 1 усиленный навык «Костяной коготь» (80% Max HP AoE, совместная атака с драконом), 4 выдоха (24% → 28% → 34% → 34% Max HP AoE; 4-й при HP дракона ≤25% переводит его в 1 HP и запускает финал), финал «Крылья сметают руины» (6 отскоков по 40%, суммарно 240% Max HP — смоделировано концентрированно на главной цели; при 3 целях распределение случайное, суммарный урон по волне тот же), плюс 2 обычных навыка-заполнителя (50% + 30% смежные) вне окна. Учетные пассивы: Territory «Потусторонние земли» −20% All-Type RES (весь цикл окна); стакы Таланта +20%×3 урона (каждое использование навыка расходует HP союзников — постоянный аптайм внутри цикла, по Review «фактически постоянные 60%»); +10% урона всем союзникам на 3 хода при призыве (тalent «Рёв, гремящий в царстве»). УЛЬТ не тратит энергию: ресурс Newbud (34000 ед. заряда при максимальном Равновесии — Review Prydwen) накапливается от потерянного HP союзников и конвертации лечения (след A2); абсолютная модель заряда не числится — доступность ульты в цикле допущение, энергетическая проверка не выполняется. Не включено (аптайм/состояние не подтверждены): E1 (×1.2/×1.4 урона AoE-ударов при HP цели ≤80%/50% от Max HP Кастории), след A6 (+30% урона дракона за каждый выдох, до 6 стаков — занижает урон выдохов/финала), след A4 (+40% SPD, на урон не влияет), E2 (Ardent Will экономит HP дракона и +30% Newbud — ресурсная сторона, множители не меняет), техника «Плачь, вестник смерти» (вне боя), пассивы поддержки (перенаправление урона, лечение, оживление). Базовая атака: уровень из кита (Lv. 6, E2 профиля не повышает).",
    noteEn: "One-summon Netherwing window cycle (preferred rotation per the Prydwen Review — 'all 4 breath attacks in one action plus the finisher explosion'): 1 Enhanced Skill 'Boneclaw, Doomdrake's Embrace' (80% MaxHP AoE joint ATK), 4 breath attacks (24% -> 28% -> 34% -> 34% MaxHP AoE; the 4th at <=25% dragon HP drops it to 1 and triggers the finisher), the 'Wings Sweep the Ruins' finisher (6 bounces of 40%, 240% MaxHP total — modeled concentrated on the primary target; across 3 targets the distribution is random, the wave-total damage is identical), plus 2 normal-skill fillers (50% + 30% adjacent) outside the window. Counted passives: the 'Lost Netherland' Territory -20% All-Type RES (whole window); Talent stacks +20%x3 DMG (every skill use drains ally HP — sustained uptime inside the cycle, per the Review 'essentially a permanent 60%'); +10% DMG to all allies for 3 turns on summon ('Roar Rumbles the Realm'). The ult uses no Energy: the Newbud resource (34000 charge at max Equilibrium per the Prydwen Review) accumulates from ally HP lost and healing conversion (A2 trace); no absolute charge model exists — ult availability per cycle is an assumption and the energy feasibility check does not apply. Excluded (uptime/state unverified): E1 (x1.2/x1.4 multiplier on the listed AoE attacks when target HP is <=80%/50% of Castorice's MaxHP), A6 trace (+30% dragon DMG per breath, up to 6 stacks — undercounts breath/finisher damage), A4 trace (+40% SPD, damage-neutral), E2 (Ardent Will preserves dragon HP and +30% Newbud — resource-side only, multipliers unchanged), the out-of-combat Technique, support passives (damage redirection, healing, revive). Basic ATK level mirrors the displayed kit (Lv. 6; the profile's E2 does not raise it).",
    hpScale: true,
    passiveDmgBoost: 70,
    passiveResPen: 20,
    instances: [
      {
        key: "enhanced_skill",
        phaseRu: "СВЕРХСПОСОБНОСТЬ → ОКНО НИЖНЕГО КРЫЛА — УСИЛЕННЫЙ НАВЫК",
        phaseEn: "ULTIMATE → NETHERWING WINDOW — ENHANCED SKILL",
        actionRu: "«Костяной коготь — объятие рока»: 80% Max HP AoE, совместная атака с драконом",
        actionEn: "Boneclaw, Doomdrake's Embrace (80% MaxHP AoE joint ATK)",
        descRu: "Кастория и Нижнее Крыло атакуют совместно: 30% + 50% Max HP по всем врагам; расходует 40% текущего HP союзников (не моделируется).",
        descEn: "Castorice and Netherwing launch a joint ATK: 30% + 50% MaxHP to all enemies; consumes 40% of allies' current HP (not modeled).",
        mv: 0.8, targets: 3, count: 1
      },
      {
        key: "breath_1",
        phaseRu: "ОКНО НИЖНЕГО КРЫЛА — ВЫДОХ #1",
        phaseEn: "NETHERWING WINDOW — BREATH #1",
        actionRu: "«Дыхание опаляет тень»: 24% Max HP AoE (−25% HP дракона)",
        actionEn: "Breath Scorches the Shadow: 24% MaxHP AoE (−25% dragon HP)",
        descRu: "Первый выдох, множитель начальный.",
        descEn: "First breath, base multiplier.",
        mv: 0.24, targets: 3, count: 1
      },
      {
        key: "breath_2",
        phaseRu: "ОКНО НИЖНЕГО КРЫЛА — ВЫДОХ #2",
        phaseEn: "NETHERWING WINDOW — BREATH #2",
        actionRu: "«Дыхание опаляет тень»: 28% Max HP AoE (−25% HP дракона)",
        actionEn: "Breath Scorches the Shadow: 28% MaxHP AoE (−25% dragon HP)",
        descRu: "Второй выдох, множитель 28%.",
        descEn: "Second breath, 28% multiplier.",
        mv: 0.28, targets: 3, count: 1
      },
      {
        key: "breath_3",
        phaseRu: "ОКНО НИЖНЕГО КРЫЛА — ВЫДОХ #3",
        phaseEn: "NETHERWING WINDOW — BREATH #3",
        actionRu: "«Дыхание опаляет тень»: 34% Max HP AoE (−25% HP дракона)",
        actionEn: "Breath Scorches the Shadow: 34% MaxHP AoE (−25% dragon HP)",
        descRu: "Третий выдох, множитель достигает капа 34%.",
        descEn: "Third breath, multiplier reaches the 34% cap.",
        mv: 0.34, targets: 3, count: 1
      },
      {
        key: "breath_4",
        phaseRu: "ОКНО НИЖНЕГО КРЫЛА — ВЫДОХ #4",
        phaseEn: "NETHERWING WINDOW — BREATH #4",
        actionRu: "«Дыхание опаляет тень»: 34% Max HP AoE; HP дракона ≤25% → 1 HP и запуск финала",
        actionEn: "Breath Scorches the Shadow: 34% MaxHP AoE; dragon HP <=25% -> 1 HP and finisher trigger",
        descRu: "Четвёртый выдох, кап 34%; при HP дракона ≤25% расход снижает его до 1 HP и вызывает финал.",
        descEn: "Fourth breath at the 34% cap; at <=25% dragon HP the drain drops it to 1 HP and triggers the finisher.",
        mv: 0.34, targets: 3, count: 1
      },
      {
        key: "finisher",
        phaseRu: "ФИНАЛ — КРЫЛЬЯ СМЕТАЮТ РУИНЫ",
        phaseEn: "FINISHER — WINGS SWEEP THE RUINS",
        actionRu: "6 отскоков по 40% Max HP (суммарно 240%; смоделировано на главной цели)",
        actionEn: "6x 40% MaxHP bounces (240% total; modeled on the primary target)",
        descRu: "Нижнее Крыло исчезает: 6 случайных удара по 40% Max HP каждый + восстановление 6% Max HP + 800 всем союзникам (лечение не моделируется).",
        descEn: "Netherwing disappears: 6 random hits of 40% MaxHP each + restores 6% MaxHP + 800 to all allies (healing not modeled).",
        mv: 0.4, targets: 1, count: 6
      },
      {
        key: "filler_skills",
        phaseRu: "ЗАПОЛНЯЮЩИЕ ХОДЫ — ЗАРЯДКА NEWBUD",
        phaseEn: "FILLER TURNS — NEWBUD CHARGING",
        actionRu: "2 обычных навыка: 50% Max HP по цели + 30% по смежным",
        actionEn: "2x normal Skill: 50% MaxHP primary + 30% adjacent",
        descRu: "Расход 30% текущего HP союзников за ход заряжает Newbud до следующего призыва (не числится).",
        descEn: "Each use drains 30% of allies' current HP, charging Newbud toward the next summon (not numerically modeled).",
        mv: 0.5, adjacentMv: 0.3, targets: 3, count: 2
      }
    ]
  },

  // Гиацина (1409) — цикл ульты: ульт (140 энергии, призыв Ica, After Rain 3 хода)
  // → базовая + навык внутри окна (Ica автоматически кастует Rainclouds после
  // каждой способности Гиацины) → базовая + навык вне окна. Урон — базовая
  // (50% Max HP) и мемо-навык Little Ica (20% от накопленного лечения, явный ввод).
  "1409": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "prydwen.gg",
        url: "https://www.prydwen.gg/star-rail/characters/hyacine/",
        capturedOn: "2026-11-16",
        note: "Basic 50% MaxHP (energy 20); Skill heal 8%+160 / 10%+200 Ica (energy 30); Ult 140 energy (+5): heal + After Rain 3 turns (+30% Max HP +600 all); Talent: Ica MaxHP = 50% of Hyacine's, healing -> Ica DMG +80% for 2 turns, max 3 stacks; Memosprite Skill 'Rainclouds, Time to Go!': Wind AoE = 20% of healing tally, clears 50% (energy 5, break 10); Memosprite Talent: while in After Rain Ica auto-uses Rainclouds after each Hyacine ability; summon grants +15 energy; A2: Hyacine & Ica CRIT Rate +100%."
      }
    ],
    noteRu: "Цикл одной ульты: ульт (140 энергии, +5 после; призыв Ica даёт +15 энергии по мемо-таланту «Soar, Unto the Sunlight») → окно After Rain (3 хода): базовая (50% Max HP ×1.3+600 от бафа +30% Max HP) + навык-лечение (энергия 30, урона нет), вне окна ещё одна базовая и один навык. После каждой способности в окне Ica автоматически кастует мемо-навык «Rainclouds, Time to Go!» — 3 касты: Wind AoE = 20% от введённой суммы накопленного лечения (каждая каста снимает 50% tally; в модели каждая каста использует один и тот же введённый tally — приближение steady-state). Талант: DMG Ica +80%×3 стака (максимум, +240%) — только для Ica, базовая не бафается. След A2 «Gloomy Grin»: +100% CRIT Rate Гиацине и Ica — безусловный, учтён. Энергия цикла: 5 + 20+30+20+30 + 3×5 = 120 + 15 (призыв) = 135 < 140 — без энергии союзников/входящих атак и ERR цикл не замыкается (выдаётся предупреждение; в бою Гиацина добирает энергию от ударов по ней и союзников). Не включено (аптайм/условия не подтверждены): A6 (при СК >200: +20% Max HP и +1% исцеления за каждые 10 лишних СК — условие по билду), условная часть A2 (+25% исцеления при HP цели ≤50% — лечение, не урон), техника (вне боя), +2% Max HP+20 всем союзникам от лечения Ica (в tally не числится), энергия союзников. Эйдолоны E1/E4/E6 не применяются: в профиле E0.",
    noteEn: "One-ult cycle: ult (140 energy, +5 after; summoning Ica grants +15 energy via the 'Soar, Unto the Sunlight' memosprite talent) -> After Rain window (3 turns): Basic ATK (50% Max HP x1.3+600 from the +30% Max HP buff) + healing Skill (30 energy, no damage), plus one more Basic and Skill outside the window. After each ability inside the window, Ica automatically casts the 'Rainclouds, Time to Go!' memosprite skill — 3 casts: Wind AoE = 20% of the entered accumulated healing tally (each cast clears 50% of the tally; the model applies the same entered tally to every cast — a steady-state approximation). Talent: Ica DMG +80%x3 stacks (maximum, +240%) — Ica only, the Basic ATK is not buffed. A2 trace 'Gloomy Grin': +100% CRIT Rate for Hyacine and Ica — unconditional, counted. Cycle energy: 5 + 20+30+20+30 + 3x5 = 120 + 15 (summon) = 135 < 140 — without ally/incoming energy and ERR the cycle does not close (a warning is emitted; in battle Hyacine gains energy from being attacked and from allies). Excluded (uptime/conditions unverified): A6 (SPD >200: +20% Max HP and +1% outgoing healing per 10 excess SPD — build-conditional), the conditional A2 part (+25% healing on targets <=50% HP — healing, not damage), the out-of-combat Technique, the +2% Max HP +20 group heal from Ica's Talent healing (not part of the tally input), ally energy. Eidolons E1/E4/E6 do not apply: the profile is E0.",
    hpScale: true,
    passiveCritRate: 100,
    passiveHpPercent: 30,
    passiveHpFlat: 600,
    energy: { ultCost: 140, startEnergyFlat: 15 },
    instances: [
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ — AFTER RAIN",
        phaseEn: "ULTIMATE — AFTER RAIN",
        actionRu: "Ульт «We Who Fly Into Twilight»: лечение + состояние After Rain (3 хода, +30% Max HP +600 всем)",
        actionEn: "Ult 'We Who Fly Into Twilight': healing + After Rain state (3 turns, +30% Max HP +600 all)",
        descRu: "Стоимость 140 энергии, +5 энергии после. Урона нет; баф Max HP учтён в базовой внутри окна. Призыв Ica даёт +15 энергии.",
        descEn: "Costs 140 energy, +5 after. No damage; the Max HP buff is applied to the in-window Basic. Summoning Ica grants +15 energy.",
        mv: 0, targets: 1, count: 1, energyGain: 5, isUlt: true
      },
      {
        key: "basic_ar",
        phaseRu: "ОКНО AFTER RAIN — БАЗОВАЯ АТАКА",
        phaseEn: "AFTER RAIN WINDOW — BASIC ATK",
        actionRu: "Базовая «When Breeze Kisses Cirrus»: 50% Max HP по одной цели (баф After Rain: ×1.3 +600)",
        actionEn: "Basic 'When Breeze Kisses Cirrus': 50% MaxHP to one target (After Rain buff: x1.3 +600)",
        descRu: "50% Max HP ×(1+30%) +600 внутри After Rain. Ica отвечает авто-кастом мемо-навыка.",
        descEn: "50% Max HP x(1+30%) +600 inside After Rain. Ica answers with an automatic memosprite skill.",
        mv: 0.5, targets: 1, count: 1, energyGain: 20, inAfterRain: true
      },
      {
        key: "skill_ar",
        phaseRu: "ОКНО AFTER RAIN — НАВЫК",
        phaseEn: "AFTER RAIN WINDOW — SKILL",
        actionRu: "Навык «Love Over the Rainbow»: лечение всем союзникам (8%+160; Ica 10%+200), урона нет",
        actionEn: "Skill 'Love Over the Rainbow': heals all allies (8%+160; Ica 10%+200), no damage",
        descRu: "Лечение пополняет tally (учитывается через явный ввод суммы лечения). +30 энергии. Ica отвечает авто-кастом.",
        descEn: "The healing feeds the tally (counted through the explicit healing-tally input). +30 energy. Ica answers with an automatic cast.",
        mv: 0, targets: 1, count: 1, energyGain: 30, inAfterRain: true
      },
      {
        key: "ica_storm",
        phaseRu: "ОКНО AFTER RAIN — АВТО-КАСТЫ LITTLE ICA",
        phaseEn: "AFTER RAIN WINDOW — LITTLE ICA AUTO-CASTS",
        actionRu: "3× «Rainclouds, Time to Go!»: Wind AoE = 20% от суммы накопленного лечения (каждая снимает 50% tally)",
        actionEn: "3x 'Rainclouds, Time to Go!': Wind AoE = 20% of the accumulated healing tally (each clears 50%)",
        descRu: "Урон = 20% × введённая сумма лечения × (1 + DMG% + 240% Таланта) × крит (A2: +100% CR). Талант в максимуме (3 стака) — допущение.",
        descEn: "Damage = 20% x entered healing tally x (1 + DMG% + 240% Talent) x crit (A2: +100% CR). Talent at maximum (3 stacks) — an assumption.",
        mv: 1, healTallyFraction: 0.2, extraDmgPercent: 240, targets: 3, count: 3, energyGain: 5
      },
      {
        key: "basic_plain",
        phaseRu: "ХОД ВНЕ ОКНА — БАЗОВАЯ АТАКА",
        phaseEn: "TURN OUTSIDE WINDOW — BASIC ATK",
        actionRu: "Базовая «When Breeze Kisses Cirrus»: 50% Max HP по одной цели",
        actionEn: "Basic 'When Breeze Kisses Cirrus': 50% MaxHP to one target",
        descRu: "После истечения After Rain бафа Max HP нет. Ica не действует вне окна (СК 0, вне очерёдности).",
        descEn: "After Rain has expired, so no Max HP buff. Ica does not act outside the window (SPD 0, off the action order).",
        mv: 0.5, targets: 1, count: 1, energyGain: 20
      },
      {
        key: "skill_plain",
        phaseRu: "ХОД ВНЕ ОКНА — НАВЫК",
        phaseEn: "TURN OUTSIDE WINDOW — SKILL",
        actionRu: "Навык «Love Over the Rainbow»: лечение всем союзникам, урона нет",
        actionEn: "Skill 'Love Over the Rainbow': heals all allies, no damage",
        descRu: "Лечение пополняет tally (учитывается через явный ввод). +30 энергии к следующей ульте.",
        descEn: "The healing feeds the tally (counted through the explicit input). +30 energy toward the next ult.",
        mv: 0, targets: 1, count: 1, energyGain: 30
      }
    ]
  }
};
