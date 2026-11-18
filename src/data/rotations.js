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
//   (mirrored by Nous Matrix from Core Matrix Data game data). Per-cycle repeat counts are a
//   documented assumption stated in noteRu/noteEn. Conditional passives with
//   unverified uptime are excluded and listed in the notes; conditional
//   passives whose condition is guaranteed by the cycle structure or checked
//   against profile stats (e.g. Firefly A2 inside the CC window, Firefly A6 /
//   Hyacine A6 via combat ATK/SPD of the profile) are counted and documented.
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
// - extraCritDmgPercent: instance-scoped CRIT DMG averaged over the hits of one
//   attack (Imbibitor Lunae's Outroar stacks: hits 4-7 of the Leap grant
//   +12/24/36/48% CD -> 120/7 average). Only valid when the within-attack
//   distribution is deterministic from the kit text.
// - resPenPercent: instance-scoped RES PEN (Seele's ult inside Amplification:
//   A4 trace +25% Quantum RES PEN).
// - critRatePercent: instance-scoped CRIT Rate bonus (Jingliu's Spectral
//   Transmigration +50% CR — uptime guaranteed by the cycle structure:
//   every ST-window instance carries it; instances outside the state do not).
// - hpMultPercent: instance-scoped Max HP multiplier (Mydei's Vendetta
//   +50% Max HP — uptime guaranteed by the cycle structure: every
//   Vendetta-window instance carries it).
// - healTallyFraction: damage per hit = options.healingTally x fraction
//   (Hyacine's Little Ica: 20% of the accumulated healing tally).
// - inAfterRain: instance happens while the "After Rain" state is active
//   (Hyacine Ult buff +30% Max HP +600 -> applies via passiveHpPercent/passiveHpFlat).
// Rotation-level extras: passiveCritRate (unconditional +CRIT Rate trace),
// passiveHpPercent / passiveHpFlat (After Rain), superBreak { toughnessReductionPrimary,
// toughnessReductionAdjacent, tiers, targets } (Firefly A4: kit-native Super Break,
// triggered by the explicit options.superBreakProcs input; the tier coefficient is
// selected from the full combat BE, uncapped — the 360% cap applies
// only to the enhanced-skill BE coefficient), atkBeBonus { atkThreshold, bePer10 }
// (Firefly A6: +0.8% BE per 10 ATK above 1800, condition checked against the
// profile's combat ATK), spdHpBonus { spdThreshold, hpPercent } (Hyacine A6:
// +20% Max HP while SPD >200, condition checked against the profile's SPD),
// critRateFromHp { hpThreshold, crPer100, capHp } (Mydei A6: +1.2% CR per 100
// excess HP above 4000, capped at 4000 excess — condition checked against the
// profile's combat HP).

export const ROTATIONS = {
  // Химеко: Нова (1510) — полный цикл сверхспособности «Starblazer» по реальному киту (4.7)
  // Химеко • Нова (1510) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1510": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/himeko-nova",
        capturedOn: "2026-11-18",
        note: "Official kit capture: Territory Starblazer, Hyperluminal Beam 32% AoE x6, Orbital Pulse 140% ST x3, Final Hit 80% ST x3, Talent 90% FUA x3."
      }
    ],
    noteRu: "Цикл Starblazer: Сверхспособность (6 лучей по 32% AoE + 3 залпа по 140% + финал 3×80%) + 2 базовые (100%) + 3 FUA таланта (90%). RES PEN +20%, КУ +80%, урон +20%.",
    noteEn: "Starblazer cycle: Ultimate (6 beams 32% AoE + 3 volleys 140% + finale 3x80%) + 2 Basics (100%) + 3 Talent FUAs (90%). RES PEN +20%, CD +80%, DMG +20%.",
    energy: { ultCost: 150 },
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
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/seele",
        capturedOn: "2026-11-16",
        note: "Skill 360% ATK, Basic 100%, Ult 720% (120 energy, +5), Skill energy +30, Basic energy +20; Talent: +80% DMG in Amplification; A4: +25% Quantum RES PEN in Amplification."
      }
    ],
    noteRu: "Цикл: 3 навыка (360%×3) + 2 базовые атаки (100%) + ульт (720%). Энергия: 3×30 + 2×20 = 130 ≥ 120. Ульт проходит в состоянии Усиления (порядок кита: ульт активирует Усиление до нанесения урона) — учтены +80% урона Таланта «Resurgence» и +25% Quantum RES PEN следа A4 только на ударе ульты. Не включено (аптайм не подтверждён): авто-навык таланта по цели ≤50% HP (360%, без энергии, 1 раз/ход), +80% урона Таланта на остальных ходах (без наводки Усиления на навыки/базовые в модели), +50%×3 урона при победах (след A2). Энергия союзников и авто-процы не учитываются — оценка консервативная.",
    noteEn: "Cycle: 3 skills (360% x3) + 2 basics (100%) + ult (720%). Energy: 3x30 + 2x20 = 130 >= 120. The ult lands inside Amplification (kit order: the ult enables the state before its damage) — the Talent's +80% DMG and the A4 trace's +25% Quantum RES PEN are counted on the ult hit only. Excluded (uptime unverified): the Talent auto-skill on <=50% HP targets (360%, no energy, once/turn), the Talent's +80% DMG on the remaining turns (Amplification is not modeled on skills/basics), +50%x3 DMG on defeats (A2 trace). Ally energy feed and auto-procs are not counted — conservative estimate.",
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
        actionRu: "Ульт: 720% ATK по одной цели",
        actionEn: "Ult: 720% ATK to one target",
        descRu: "720% ATK в состоянии Усиления (+80% урона Таланта, +25% Quantum RES PEN следа A4), 120 энергии, +5 энергии после.",
        descEn: "720% ATK inside Amplification (+80% Talent DMG, +25% Quantum RES PEN from the A4 trace), 120 energy, +5 energy after.",
        mv: 7.2, targets: 1, count: 1, energyGain: 5, isUlt: true,
        extraDmgPercent: 80, resPenPercent: 25
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
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/imbibitor-lunae",
        capturedOn: "2026-11-16",
        note: "Fulgurant Leap 500% + 180% adjacent, energy +40; Basic 100%, energy +20; Ult 300% + 140% adjacent (140 energy, +5); A2 start +15 energy; Righteous Heart +10% DMG per hit (stacks 0-6), Outroar +12% CD per hit (hits 4-7 of the 7-hit Leap)."
      }
    ],
    noteRu: "Цикл: 3 «Стремительного прыжка» (500% + 180% по смежным) + базовая (100%) + ульт (300% + 140% по смежным). Энергия: 3×40 + 20 + 15 (след A2) = 155 ≥ 140. Учтены детерминированные в рамках одной атаки стаки: Праведное сердце (+10% урона за удар, стаки 0–6: средний множитель Σ21/7 = ×1.3 → Прыжок 500%×1.3 = 650%, базовая 100%×1.05, ульт 300%×1.1/140%×1.1 при нейтральном допущении равного деления 500% на 7 ударов) и Рёв (+12% КУ за удар, удары 4–7 дают +12/24/36/48% КУ → средний +120/7 ≈ 17.1% КУ, учтено только на Прыжке). По тексту кита 4.7 Dracore Libre не тратит ОН — порядок усиления сохраняется весь цикл. Не включено: след A6 (+24% КУ по целям со слабостью к Мнимому — условие по врагу), Чешуя (смещение трат ОН) — экономия ОН не моделируется.",
    noteEn: "Cycle: 3x Fulgurant Leap (500% + 180% adjacent) + Basic (100%) + Ult (300% + 140% adjacent). Energy: 3x40 + 20 + 15 (A2 trace) = 155 >= 140. Counted stacks that are deterministic within a single attack: Righteous Heart (+10% DMG per hit, stacks 0-6: average multiplier Σ21/7 = x1.3 -> Leap 500%x1.3 = 650%, Basic 100%x1.05, Ult 300%x1.1/140%x1.1 under the neutral assumption of an even 500% split across 7 hits) and Outroar (+12% CD per hit, hits 4-7 grant +12/24/36/48% CD -> an average of +120/7 = +17.1% CD, counted on the Leap only). Per the 4.7 kit text Dracore Libre does not consume SP — the enhancement order holds through the cycle. Excluded: A6 trace (+24% CD against Imaginary-weak targets — enemy-conditional), Squama Sacrosancta SP offset not modeled.",
    hpScale: false,
    energy: { ultCost: 140, startEnergyFlat: 15 },
    instances: [
      {
        key: "leap",
        phaseRu: "УСИЛЕННАЯ БАЗОВАЯ — СТРЕМИТЕЛЬНЫЙ ПРЫЖОК",
        phaseEn: "ENHANCED BASIC — FULGURANT LEAP",
        actionRu: "3 взлёта: 650% ATK по главной цели + 261% по смежным (7 ударов, +40 энергии)",
        actionEn: "3x Leap: 650% ATK primary + 261% adjacent (7 hits, +40 energy)",
        descRu: "Пиковое усиление базовой атаки после 3 усиления навыка: 500%×1.3 (Праведное сердце, средний стак) + 180%×1.45 (стаки 3–6); Рёв: средний +120/7 ≈ 17.1% КУ.",
        descEn: "Peak enhanced basic after three Dracore Libre enhancements: 500%x1.3 (Righteous Heart, average stack) + 180%x1.45 (stacks 3-6); Outroar: an average +120/7 = +17.1% CD.",
        mv: 6.5, adjacentMv: 2.61, targets: 3, count: 3, energyGain: 40, extraCritDmgPercent: 17.143
      },
      {
        key: "basic",
        phaseRu: "БАЗОВАЯ АТАКА — ЗАПОЛНЕНИЕ",
        phaseEn: "BASIC ATK — FILLER",
        actionRu: "1 базовая атака (105% ATK с 1 стаком Праведного сердца, +20 энергии)",
        actionEn: "1x Basic ATK (105% ATK with 1 Righteous Heart stack, +20 energy)",
        descRu: "Обычная базовая атака для замыкания энергии цикла: 100%×1.05.",
        descEn: "Plain basic ATK to close the cycle's energy budget: 100%x1.05.",
        mv: 1.05, targets: 1, count: 1, energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ — ЛАЗУРНАЯ ВОДА ОМЫВАЕТ ВСЁ",
        phaseEn: "ULTIMATE — AZURE'S AQUA ABLUTES ALL",
        actionRu: "Ульт: 330% ATK по главной + 154% по смежным, 2 ед. Чешуи",
        actionEn: "Ult: 330% ATK primary + 154% adjacent, 2 Squama Sacrosancta",
        descRu: "Стоимость 140 энергии, +5 энергии после, взрыв по площади: 300%×1.1 / 140%×1.1 (Праведное сердце).",
        descEn: "Costs 140 energy, +5 after, blast AoE: 300%x1.1 / 140%x1.1 (Righteous Heart).",
        mv: 3.3, adjacentMv: 1.54, targets: 3, count: 1, energyGain: 5, isUlt: true
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
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/archer",
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
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/firefly",
        capturedOn: "2026-11-16",
        note: "Enhanced Skill (0.2xBE+200%) primary, (0.1xBE+100%) adjacent; Enhanced Basic 150%; base Skill 200%, +60% Max Energy; Ult costs 240; Talent: start with >=50% energy; A2: +25% BE in Complete Combustion; A6: +0.8% BE per 10 ATK above 1800."
      }
    ],
    noteRu: "Цикл: ульт (240 энергии; талант даёт старт ≥50%) → окно Complete Combustion: 2 усиленных навыка (200% + 0.2×ЭП по главной, 100% + 0.1×ЭП по смежным) + 1 усиленная базовая (150%) → 1 обычный навык (+144 энергии = 60% от макс). Энергия: 144 + 120 (старт) = 264 ≥ 240. Длина окна CC (2 навыка + 1 базовая) — допущение по таймеру SPD 70. Суперпробитие (след A4, стандартная формула): при пробитой цели и ЭП ≥150%/300% каждый удар конвертирует истощение (30 + 15×смежные) в 100%/150% Super Break урона — число срабатываний задаётся явным вводом «Суперпробития», коэффициент выбирается по полному боевому ЭП без капа (кап 360% действует только на коэффициент ЭП усиленного навыка); формула без крита, ATK и DMG%. Учтены следы: A2 (+25% ЭП в состоянии CC — всё окно проходит в CC, аптайм гарантирован) и A6 (+0.8% ЭП за каждые 10 АТК свыше 1800, по боевой АТК профиля — безусловный след). Кап ЭП 360% применяется к коэффициенту усиленного навыка (beScale). Не включено: +50% эффективности пробития и +20% Break DMG ульты (действуют только на удар, наносящий пробитие; не входят в модельные удары), траты HP.",
    noteEn: "Cycle: ult (240 energy; Talent grants >=50% start) -> Complete Combustion window: 2 enhanced skills (200% + 0.2xBE primary, 100% + 0.1xBE adjacent) + 1 enhanced basic (150%) -> 1 base skill (+144 energy = 60% of Max). Energy: 144 + 120 (start) = 264 >= 240. The CC window length (2 skills + 1 basic) assumes the SPD 70 countdown. Super Break (A4 trace, standard formula): against a broken target at BE >=150%/300% each hit converts its toughness reduction (30 + 15x adjacent) into 100%/150% Super Break DMG — the proc count is set by the explicit Super Break input, and the coefficient is selected from the full combat BE uncapped (the 360% cap applies only to the enhanced-skill BE coefficient); no crit, ATK, or DMG% in the formula. Traces counted: A2 (+25% BE inside the CC state — the whole window happens in CC, uptime guaranteed) and A6 (+0.8% BE per 10 ATK above 1800, from the profile's combat ATK — unconditional). The 360% BE cap applies to the enhanced-skill coefficient (beScale). Excluded: the ult's +50% Break Efficiency and +20% Break DMG (apply only to the attack that inflicts the break; none of the modeled hits are that attack), HP costs.",
    hpScale: false,
    beCapPercent: 360,
    // След A2 «Module α: Antilag Outburst»: +25% ЭП в состоянии Complete
    // Combustion. Всё окно CC — именно в этом состоянии, аптайм гарантирован.
    beBonusPercent: 25,
    // След A6 «Module γ: Gilded Passing»: +0.8% ЭП за каждые 10 АТК свыше
    // 1800. Безусловный след; условие проверяется по боевой АТК профиля.
    atkBeBonus: { atkThreshold: 1800, bePer10: 0.8 },
    energy: { ultCost: 240, startEnergyPercent: 50 },
    // След A4 «Module β: Autoreactive Armor» (Nous Matrix Model): в состоянии Complete
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
        descRu: "Кап учтённого ЭП — 360% (+25% следа A2 в окне CC). Добавляет огневую слабость целям.",
        descEn: "Counted BE capped at 360% (+25% from the A2 trace inside the CC window). Adds Fire Weakness to targets.",
        mv: 2.0, beScale: 0.2, adjacentMv: 1.0, beScaleAdjacent: 0.1, targets: 3, count: 2, energyGain: 0, inCompleteCombustion: true
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
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/castorice",
        capturedOn: "2026-11-16",
        note: "Basic 50% MaxHP; Skill (blast) 50% + 30% adjacent; Enhanced Skill (joint AoE) 30%+50% = 80% MaxHP to all; Breath attacks 24%/28%/34% (cap), 4th breath at <=25% dragon HP triggers Wings Sweep the Ruins 6x40%; Territory -20% All-Type RES; Talent +20% DMG x3 stacks; summon +10% DMG 3 turns; Newbud charge 34000 (Nous Matrix Model)."
      }
    ],
    noteRu: "Цикл одного призыва Нижнего Крыла (предпочтительная ротация по Review Nous Matrix — «сразу 4 выдоха одним действием + финальный взрыв»): 1 усиленный навык «Костяной коготь» (80% Max HP AoE, совместная атака с драконом), 4 выдоха (24% → 28% → 34% → 34% Max HP AoE; 4-й при HP дракона ≤25% переводит его в 1 HP и запускает финал), финал «Крылья сметают руины» (6 отскоков по 40%, суммарно 240% Max HP — смоделировано концентрированно на главной цели; при 3 целях распределение случайное, суммарный урон по волне тот же), плюс 2 обычных навыка-заполнителя (50% + 30% смежные) вне окна. Учетные пассивы: Territory «Потусторонние земли» −20% All-Type RES (весь цикл окна); стакы Таланта +20%×3 урона (каждое использование навыка расходует HP союзников — постоянный аптайм внутри цикла, по Review «фактически постоянные 60%»); +10% урона всем союзникам на 3 хода при призыве (тalent «Рёв, гремящий в царстве»). УЛЬТ не тратит энергию: ресурс Newbud (34000 ед. заряда при максимальном Равновесии — Review Nous Matrix) накапливается от потерянного HP союзников и конвертации лечения (след A2); абсолютная модель заряда не числится — доступность ульты в цикле допущение, энергетическая проверка не выполняется. Не включено (аптайм/состояние не подтверждены): E1 (×1.2/×1.4 урона AoE-ударов при HP цели ≤80%/50% от Max HP Кастории), след A6 (+30% урона дракона за каждый выдох, до 6 стаков — занижает урон выдохов/финала), след A4 (+40% SPD, на урон не влияет), E2 (Ardent Will экономит HP дракона и +30% Newbud — ресурсная сторона, множители не меняет), техника «Плачь, вестник смерти» (вне боя), пассивы поддержки (перенаправление урона, лечение, оживление). Базовая атака: уровень из кита (Lv. 6, E2 профиля не повышает).",
    noteEn: "One-summon Netherwing window cycle (preferred rotation per the Nous Matrix Review — 'all 4 breath attacks in one action plus the finisher explosion'): 1 Enhanced Skill 'Boneclaw, Doomdrake's Embrace' (80% MaxHP AoE joint ATK), 4 breath attacks (24% -> 28% -> 34% -> 34% MaxHP AoE; the 4th at <=25% dragon HP drops it to 1 and triggers the finisher), the 'Wings Sweep the Ruins' finisher (6 bounces of 40%, 240% MaxHP total — modeled concentrated on the primary target; across 3 targets the distribution is random, the wave-total damage is identical), plus 2 normal-skill fillers (50% + 30% adjacent) outside the window. Counted passives: the 'Lost Netherland' Territory -20% All-Type RES (whole window); Talent stacks +20%x3 DMG (every skill use drains ally HP — sustained uptime inside the cycle, per the Review 'essentially a permanent 60%'); +10% DMG to all allies for 3 turns on summon ('Roar Rumbles the Realm'). The ult uses no Energy: the Newbud resource (34000 charge at max Equilibrium per the Nous Matrix Review) accumulates from ally HP lost and healing conversion (A2 trace); no absolute charge model exists — ult availability per cycle is an assumption and the energy feasibility check does not apply. Excluded (uptime/state unverified): E1 (x1.2/x1.4 multiplier on the listed AoE attacks when target HP is <=80%/50% of Castorice's MaxHP), A6 trace (+30% dragon DMG per breath, up to 6 stacks — undercounts breath/finisher damage), A4 trace (+40% SPD, damage-neutral), E2 (Ardent Will preserves dragon HP and +30% Newbud — resource-side only, multipliers unchanged), the out-of-combat Technique, support passives (damage redirection, healing, revive). Basic ATK level mirrors the displayed kit (Lv. 6; the profile's E2 does not raise it).",
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
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/hyacine",
        capturedOn: "2026-11-16",
        note: "Basic 50% MaxHP (energy 20); Skill heal 8%+160 / 10%+200 Ica (energy 30); Ult 140 energy (+5): heal + After Rain 3 turns (+30% Max HP +600 all); Talent: Ica MaxHP = 50% of Hyacine's, healing -> Ica DMG +80% for 2 turns, max 3 stacks; Memosprite Skill 'Rainclouds, Time to Go!': Wind AoE = 20% of healing tally, clears 50% (energy 5, break 10); Memosprite Talent: while in After Rain Ica auto-uses Rainclouds after each Hyacine ability; summon grants +15 energy; A2: Hyacine & Ica CRIT Rate +100%; A6: while SPD >200, +20% Max HP and +1% outgoing healing per 10 excess SPD (healing part up to 10 stacks)."
      }
    ],
    noteRu: "Цикл одной ульты: ульт (140 энергии, +5 после; призыв Ica даёт +15 энергии по мемо-таланту «Soar, Unto the Sunlight») → окно After Rain (3 хода): базовая (50% Max HP ×1.3+600 от бафа +30% Max HP) + навык-лечение (энергия 30, урона нет), вне окна ещё одна базовая и один навык. После каждой способности в окне Ica автоматически кастует мемо-навык «Rainclouds, Time to Go!» — 3 касты: Wind AoE = 20% от введённой суммы накопленного лечения (каждая каста снимает 50% tally; в модели каждая каста использует один и тот же введённый tally — приближение steady-state). Талант: DMG Ica +80%×3 стака (максимум, +240%) — только для Ica, базовая не бафается. След A2 «Gloomy Grin»: +100% CRIT Rate Гиацине и Ica — безусловный, учтён. След A6: при СК >200 +20% Max HP Гиацине и Ica — условие проверяется по СК профиля (боевой СК вместе с конусом), учтено; часть A6 «+1% исцеления за каждые 10 лишних СК» — сторона лечения (не tally), не моделируется. Энергия цикла: 5 + 20+30+20+30 + 3×5 = 120 + 15 (призыв) = 135 < 140 — без энергии союзников/входящих атак и ERR цикл не замыкается (выдаётся предупреждение; в бою Гиацина добирает энергию от ударов по ней и союзников). Не включено (условия/состав не подтверждены): условная часть A2 (+25% исцеления при HP цели ≤50% — лечение, не урон), техника (вне боя), +2% Max HP+20 всем союзникам от лечения Ica (в tally не числится), энергия союзников. Эйдолоны E1/E4/E6 не применяются: в профиле E0.",
    noteEn: "One-ult cycle: ult (140 energy, +5 after; summoning Ica grants +15 energy via the 'Soar, Unto the Sunlight' memosprite talent) -> After Rain window (3 turns): Basic ATK (50% Max HP x1.3+600 from the +30% Max HP buff) + healing Skill (30 energy, no damage), plus one more Basic and Skill outside the window. After each ability inside the window, Ica automatically casts the 'Rainclouds, Time to Go!' memosprite skill — 3 casts: Wind AoE = 20% of the entered accumulated healing tally (each cast clears 50% of the tally; the model applies the same entered tally to every cast — a steady-state approximation). Talent: Ica DMG +80%x3 stacks (maximum, +240%) — Ica only, the Basic ATK is not buffed. A2 trace 'Gloomy Grin': +100% CRIT Rate for Hyacine and Ica — unconditional, counted. A6 trace: while SPD >200, +20% Max HP for Hyacine and Ica — the condition is checked against the profile's SPD (combat SPD incl. cone), counted; the A6 part '+1% outgoing healing per 10 excess SPD' is a healing-side effect (not the tally) and is not modeled. Cycle energy: 5 + 20+30+20+30 + 3x5 = 120 + 15 (summon) = 135 < 140 — without ally/incoming energy and ERR the cycle does not close (a warning is emitted; in battle Hyacine gains energy from being attacked and from allies). Excluded (conditions/composition unverified): the conditional A2 part (+25% healing on targets <=50% HP — healing, not damage), the out-of-combat Technique, the +2% Max HP +20 group heal from Ica's Talent healing (not part of the tally input), ally energy. Eidolons E1/E4/E6 do not apply: the profile is E0.",
    hpScale: true,
    passiveCritRate: 100,
    passiveHpPercent: 30,
    passiveHpFlat: 600,
    // След A6: при СК >200 — +20% Max HP Гиацине и Ica. Условие проверяется
    // по СК профиля, поэтому это не «неподтверждённый аптайм». Множитель
    // применяется к hpScale-инстансам до бафа After Rain.
    spdHpBonus: { spdThreshold: 200, hpPercent: 20 },
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
  },

  // Цзинлю (1212) — цикл: 2 навыка «Transcendent Flash» (заряд Syzygy до 2)
  // → вход в Spectral Transmigration (+1 стак, всего 3; CR +50%) → 4 усиленных
  // навыка «Moon On Glacial River» с ультой внутри окна (3-я атака).
  "1212": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/jingliu",
        capturedOn: "2026-11-16",
        note: "Basic 50% MaxHP (en 20); Skill 'Transcendent Flash' 150% MaxHP ST, +1 Syzygy (en 20, +15 from A4 trace); Enhanced 'Moon On Glacial River' 150%/75% adjacent, consumes 1 Syzygy, no SP (en 30, +8 from A4); Ult 'Florephemeral Dreamflux' 180%/90% adjacent, 140 energy cost, +1 Syzygy after attack (en 5); Talent: at 2 Syzygy enters Spectral Transmigration (+1 stack, CRIT Rate +50%, Max HP +90% while in state — the Max HP part affects the HP→ATK conversion only; here the scaling stat is Max HP itself), each attack consumes 1 Syzygy and 5% of allies' Max HP, +44% CRIT DMG per Moonlight stack up to 5; A2: ult DMG +20% against a single enemy target."
      }
    ],
    noteRu: "Цикл: 2 навыка (по 150% Max HP, по 35 энергии = 20+15 след A4) → при 2 Syzygy вход в Spectral Transmigration: +1 стак (итого 3), CR +50% (учтено как critRatePercent на всех инстансах окна — аптайм гарантирован структурой цикла) → 4 усиленных навыка по 150%/75% (по 38 энергии = 30+8 A4, без SP) с ультой (180%/90%, 5 энергии) на 3-й атаке окна. КУ от стаков Moonlight: 1-я атака окна — 3 стака (+132% КУ), далее 5 стаков (+220%); ульт — 3-я атака → +220%. Средний КУ-бонус усиленного навыка 198 ((132+220×3)/4), ульт 220. Ульта также даёт +20% DMG по одиночной цели в окне (A2, учтено как extraDmgPercent). Энергия цикла: 2×35 + 4×38 = 222 ≥ 140 ✓. Каждый удар в окне съедает 5% Max HP союзников (выживаемость, не урон — не числится). Не включено: E-уровни (E0 в профиле), техника, множитель Max HP +90% в окне (в игре влияет на конверсию HP→ATK, здесь скейл уже от Max HP), тайминг стаков вне окна. SP: −2 за цикл (2 навыка, усиленные бесплатны).",
    noteEn: "Cycle: 2 Skills (150% Max HP each, 35 energy each = 20+15 from the A4 trace) -> at 2 Syzygy she enters Spectral Transmigration: +1 stack (3 total), CRIT Rate +50% (counted as critRatePercent on every window instance — uptime guaranteed by the cycle structure) -> 4 enhanced Skills at 150%/75% (38 energy each = 30+8 A4, SP-free) with the Ultimate (180%/90%, 5 energy) as the window's 3rd attack. Moonlight CRIT DMG stacks: the window's 1st attack has 3 stacks (+132% CD), later ones 5 stacks (+220%); the ult is the 3rd attack -> +220%. Average enhanced-skill CD bonus is 198 ((132+220x3)/4), ult 220. Inside the window the ult also gains +20% DMG against a single target (A2, counted as extraDmgPercent). Cycle energy: 2x35 + 4x38 = 222 >= 140 ✓. Every window attack consumes 5% of allies' Max HP (survivability, not damage — not modeled). Excluded: eidolons (E0 profile), the Technique, the +90% Max HP state buff (in-game it feeds the HP->ATK conversion; here the scaling stat is already Max HP), out-of-window stack timing. SP: -2 per cycle (2 Skills; enhanced uses are SP-free).",
    hpScale: true,
    energy: { ultCost: 140 },
    instances: [
      {
        key: "skill_1",
        phaseRu: "ЗАРЯДКА SYZYGY — НАВЫК #1",
        phaseEn: "SYZYGY CHARGING — SKILL #1",
        actionRu: "Навык «Transcendent Flash»: 150% Max HP по цели, +1 Syzygy",
        actionEn: "Skill 'Transcendent Flash': 150% MaxHP to one target, +1 Syzygy",
        descRu: "35 энергии (20+15 след A4). Второй навык даёт 2-й стак и запускает вход в окно.",
        descEn: "35 energy (20+15 from the A4 trace). The second Skill grants the 2nd stack and triggers the state entry.",
        mv: 1.5, targets: 1, count: 2, energyGain: 35
      },
      {
        key: "enhanced_1",
        phaseRu: "ОКНО SPECTRAL TRANSMIGRATION — УСИЛЕННЫЙ НАВЫК #1",
        phaseEn: "SPECTRAL TRANSMIGRATION WINDOW — ENHANCED SKILL #1",
        actionRu: "«Moon On Glacial River»: 150% Max HP по цели + 75% по смежным (−1 Syzygy, −5% Max HP союзников)",
        actionEn: "'Moon On Glacial River': 150% MaxHP primary + 75% adjacent (−1 Syzygy, −5% allies' Max HP)",
        descRu: "3 стака Moonlight → +132% КУ. CR +50% в окне.",
        descEn: "3 Moonlight stacks -> +132% CRIT DMG. +50% CR inside the window.",
        mv: 1.5, adjacentMv: 0.75, targets: 3, count: 1, energyGain: 38,
        critRatePercent: 50, extraCritDmgPercent: 132
      },
      {
        key: "enhanced_2",
        phaseRu: "ОКНО SPECTRAL TRANSMIGRATION — УСИЛЕННЫЙ НАВЫК #2",
        phaseEn: "SPECTRAL TRANSMIGRATION WINDOW — ENHANCED SKILL #2",
        actionRu: "«Moon On Glacial River»: 150% Max HP по цели + 75% по смежным",
        actionEn: "'Moon On Glacial River': 150% MaxHP primary + 75% adjacent",
        descRu: "5 стаков Moonlight → +220% КУ.",
        descEn: "5 Moonlight stacks -> +220% CRIT DMG.",
        mv: 1.5, adjacentMv: 0.75, targets: 3, count: 1, energyGain: 38,
        critRatePercent: 50, extraCritDmgPercent: 220
      },
      {
        key: "ult",
        phaseRu: "ОКНО SPECTRAL TRANSMIGRATION — СВЕРХСПОСОБНОСТЬ",
        phaseEn: "SPECTRAL TRANSMIGRATION WINDOW — ULTIMATE",
        actionRu: "Ульт «Florephemeral Dreamflux»: 180% Max HP по цели + 90% по смежным (A2: +20% DMG в окне)",
        actionEn: "Ult 'Florephemeral Dreamflux': 180% MaxHP primary + 90% adjacent (A2: +20% DMG inside the window)",
        descRu: "3-я атака окна: 5 стаков Moonlight → +220% КУ. +5 энергии, +1 Syzygy после атаки.",
        descEn: "The window's 3rd attack: 5 Moonlight stacks -> +220% CRIT DMG. +5 energy, +1 Syzygy after the attack.",
        mv: 1.8, adjacentMv: 0.9, targets: 3, count: 1, energyGain: 5, isUlt: true,
        critRatePercent: 50, extraCritDmgPercent: 220, extraDmgPercent: 20
      },
      {
        key: "enhanced_3",
        phaseRu: "ОКНО SPECTRAL TRANSMIGRATION — УСИЛЕННЫЙ НАВЫК #3",
        phaseEn: "SPECTRAL TRANSMIGRATION WINDOW — ENHANCED SKILL #3",
        actionRu: "«Moon On Glacial River»: 150% Max HP по цели + 75% по смежным",
        actionEn: "'Moon On Glacial River': 150% MaxHP primary + 75% adjacent",
        descRu: "5 стаков Moonlight → +220% КУ. Стак ульты финансирует 4-ю усиленную атаку.",
        descEn: "5 Moonlight stacks -> +220% CRIT DMG. The ult's stack funds the 4th enhanced attack.",
        mv: 1.5, adjacentMv: 0.75, targets: 3, count: 1, energyGain: 38,
        critRatePercent: 50, extraCritDmgPercent: 220
      },
      {
        key: "enhanced_4",
        phaseRu: "ОКНО SPECTRAL TRANSMIGRATION — УСИЛЕННЫЙ НАВЫК #4",
        phaseEn: "SPECTRAL TRANSMIGRATION WINDOW — ENHANCED SKILL #4",
        actionRu: "«Moon On Glacial River»: 150% Max HP по цели + 75% по смежным",
        actionEn: "'Moon On Glacial River': 150% MaxHP primary + 75% adjacent",
        descRu: "5 стаков Moonlight → +220% КУ. Последний Syzygy; после окно закрывается.",
        descEn: "5 Moonlight stacks -> +220% CRIT DMG. Last Syzygy; the window closes afterwards.",
        mv: 1.5, adjacentMv: 0.75, targets: 3, count: 1, energyGain: 38,
        critRatePercent: 50, extraCritDmgPercent: 220
      }
    ]
  },

  // Блейд (1205) — цикл: Hellscape (без урона) → 3 усиленных базовых
  // «Forest of Swords» с ультой внутри окна → базовая + авто-FUA таланта.
  "1205": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/blade",
        capturedOn: "2026-11-16",
        note: "Basic 'Shard Sword' 50% MaxHP ST (en 20); Skill 'Hellscape': no damage, consumes 10% Max HP, enhances the Basic into 'Forest of Swords' for 3 turns (en 30); Enhanced 'Forest of Swords' 130%/52% adjacent (en 30); Ult 'Death Sentence' Blast 150% primary / 60% adjacent + up to 100% tally DMG, 130 energy cost, caps the tally at 90% of Max HP (en 5); Talent: when hit or when HP is consumed, gains a charge (5 per ult charge); at full charge uses FUA 'Death Guardian' 130% MaxHP AoE (en 10, +15 from A6, dmg x1.2 from A6); A2: ult tally starts at 50% of Max HP."
      }
    ],
    noteRu: "Цикл: навык «Hellscape» (−10% Max HP, урона нет, окно 3 хода) → 3 усиленных базовых «Forest of Swords» по 130%/52% (по 30 энергии; −10% Max HP за использование) с ультой внутри окна. Ульт: 150% по цели + tally-урон; A2 ставит tally на 50% Max HP → 150+50 = 200% по цели, 60+60×50% = 90% по смежным (A2 структурно-безусловный: tally не опускается ниже 50%). Затем 1 базовая «Shard Sword» (50%, +20 энергии) и 1 авто-FUA таланта (130% AoE ×1.2 след A6 = 156%, +25 энергии = 10+15). Энергия цикла: 3×30 + 20 + 25 = 135 ≥ 130 ✓. FUA — 1 за цикл: заряды от вражеских ударов не моделируются (допущение). Урон FUA AoE — смоделирован по всем 3 целям. Не включено: E-уровни (E0), tally сверх floor A2 (зависит от потраченного/потерянного HP за бой), тайминг зарядов. SP: +1 за цикл (базовая возвращает).",
    noteEn: "Cycle: 'Hellscape' Skill (−10% Max HP, no damage, 3-turn window) -> 3 enhanced Basics 'Forest of Swords' at 130%/52% (30 energy each; −10% Max HP per use) with the Ultimate inside the window. Ult: 150% primary + tally DMG; A2 floors the tally at 50% of Max HP -> 150+50 = 200% primary, 60+60x50% = 90% adjacent (A2 is structurally unconditional: the tally never drops below 50%). Then 1 Basic 'Shard Sword' (50%, +20 energy) and 1 auto-FUA from the Talent (130% AoE x1.2 from the A6 trace = 156%, +25 energy = 10+15). Cycle energy: 3x30 + 20 + 25 = 135 >= 130 ✓. One FUA per cycle: charges from enemy hits are not modeled (an assumption). The FUA AoE damage is modeled across all 3 targets. Excluded: eidolons (E0), tally above the A2 floor (depends on HP consumed/lost during the fight), charge timing. SP: +1 per cycle (the Basic restores it).",
    hpScale: true,
    energy: { ultCost: 130 },
    instances: [
      {
        key: "hellscape",
        phaseRu: "ВХОД В HELLSCAPE",
        phaseEn: "HELLSCAPE ENTRY",
        actionRu: "Навык «Hellscape»: без урона; −10% Max HP, окно 3 хода, базовая усиливается",
        actionEn: "Skill 'Hellscape': no damage; −10% Max HP, 3-turn window, the Basic becomes enhanced",
        descRu: "Окно бафает 3 следующих базовых в «Forest of Swords». 30 энергии.",
        descEn: "The window upgrades the next 3 Basics into 'Forest of Swords'. 30 energy.",
        mv: 0, targets: 1, count: 1, energyGain: 30
      },
      {
        key: "forest_1",
        phaseRu: "ОКНО HELLSCAPE — УСИЛЕННАЯ БАЗОВАЯ #1",
        phaseEn: "HELLSCAPE WINDOW — ENHANCED BASIC #1",
        actionRu: "«Forest of Swords»: 130% Max HP по цели + 52% по смежным (−10% Max HP)",
        actionEn: "'Forest of Swords': 130% MaxHP primary + 52% adjacent (−10% Max HP)",
        descRu: "Усиленная базовая, без SP. 30 энергии.",
        descEn: "Enhanced Basic, SP-free. 30 energy.",
        mv: 1.3, adjacentMv: 0.52, targets: 3, count: 1, energyGain: 30
      },
      {
        key: "forest_2",
        phaseRu: "ОКНО HELLSCAPE — УСИЛЕННАЯ БАЗОВАЯ #2",
        phaseEn: "HELLSCAPE WINDOW — ENHANCED BASIC #2",
        actionRu: "«Forest of Swords»: 130% Max HP по цели + 52% по смежным",
        actionEn: "'Forest of Swords': 130% MaxHP primary + 52% adjacent",
        descRu: "30 энергии.",
        descEn: "30 energy.",
        mv: 1.3, adjacentMv: 0.52, targets: 3, count: 1, energyGain: 30
      },
      {
        key: "ult",
        phaseRu: "ОКНО HELLSCAPE — СВЕРХСПОСОБНОСТЬ",
        phaseEn: "HELLSCAPE WINDOW — ULTIMATE",
        actionRu: "Ульт «Death Sentence»: 150%+50% (tally A2) по цели, 60%+30% по смежным",
        actionEn: "Ult 'Death Sentence': 150%+50% (A2 tally) primary, 60%+30% adjacent",
        descRu: "A2 ставит tally на 50% Max HP: 200% по цели, 90% по смежным. +5 энергии.",
        descEn: "A2 floors the tally at 50% of Max HP: 200% primary, 90% adjacent. +5 energy.",
        mv: 2.0, adjacentMv: 0.9, targets: 3, count: 1, energyGain: 5, isUlt: true
      },
      {
        key: "forest_3",
        phaseRu: "ОКНО HELLSCAPE — УСИЛЕННАЯ БАЗОВАЯ #3",
        phaseEn: "HELLSCAPE WINDOW — ENHANCED BASIC #3",
        actionRu: "«Forest of Swords»: 130% Max HP по цели + 52% по смежным",
        actionEn: "'Forest of Swords': 130% MaxHP primary + 52% adjacent",
        descRu: "Последняя атака окна. 30 энергии.",
        descEn: "The window's final attack. 30 energy.",
        mv: 1.3, adjacentMv: 0.52, targets: 3, count: 1, energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ВНЕ ОКНА — БАЗОВАЯ АТАКА",
        phaseEn: "OUTSIDE WINDOW — BASIC ATK",
        actionRu: "Базовая «Shard Sword»: 50% Max HP по цели",
        actionEn: "Basic 'Shard Sword': 50% MaxHP to one target",
        descRu: "После окна базовая обычная. +20 энергии, +1 SP.",
        descEn: "After the window the Basic is plain. +20 energy, +1 SP.",
        mv: 0.5, targets: 1, count: 1, energyGain: 20
      },
      {
        key: "fua",
        phaseRu: "АВТО-АТАКА ТАЛАНТА — FUA",
        phaseEn: "TALENT AUTO-ATTACK — FUA",
        actionRu: "FUA «Death Guardian»: 130% Max HP AoE ×1.2 (след A6)",
        actionEn: "FUA 'Death Guardian': 130% MaxHP AoE x1.2 (A6 trace)",
        descRu: "Авто-атака при полном заряде; ×1.2 от следа A6. 1 FUA за цикл — допущение. +25 энергии (10+15 A6).",
        descEn: "Auto-attack at full charge; x1.2 from the A6 trace. 1 FUA per cycle — an assumption. +25 energy (10+15 A6).",
        mv: 1.56, targets: 3, count: 1, energyGain: 25
      }
    ]
  },

  // Мидей (1404) — цикл: 4 навыка (HP-расход → заряды) → ульт (+20 зарядов,
  // вход в Vendetta) → окно Vendetta: 2 «Kingslayer Be King» + «Godslayer Be God».
  "1404": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/mydei",
        capturedOn: "2026-11-16",
        note: "Basic 'Crown and Wrath' 50% MaxHP (en 20); Skill 90%/50% adjacent, consumes 50% of current HP (en 30); Enhanced 'Kingslayer Be King' 110%/66%, consumes 35% of current HP, auto-used (en 30); Enhanced 'Godslayer Be God' 280%/168%, consumes 150 Charge, auto-used, Charge cannot accumulate during it (en 10); Ult 'Throne of Bones' 160%/100% adjacent, 160 energy cost, restores 20% Max HP and +20 Talent's Charge (en 5); Talent: gains Charge from HP consumption/loss, at 100 Charge enters Vendetta (Max HP +50%), at 150 auto-uses 'Godslayer Be God'; A6: +1.2% CRIT Rate per 100 HP above 4000, capped at 4000 excess."
      }
    ],
    noteRu: "Цикл: 4 навыка по 90%/50% (по 30 энергии; −50% текущего HP каждый — заряды от HP-расхода накапливаются) → ульт (160%/100%, 5 энергии, +20 зарядов) → вход в Vendetta при 100 зарядах: Max HP +50% (учтено как hpMultPercent 50 на инстансах окна — аптайм гарантирован структурой) → окно: 2× «Kingslayer Be King» (110%/66%, по 30 энергии, −35% текущего HP) + «Godslayer Be God» (280%/168%, 10 энергии, −150 зарядов). Ульт стоит ДО входа в Vendetta — множитель Max HP +50% на неё не действует. След A6: +1.2% CR за каждые 100 HP свыше 4000, кап 4000 лишнего (+48%) — условие проверяется по боевому HP профиля, учтено. Энергия цикла: 4×30 + 2×30 + 10 = 190 ≥ 160 ✓. Окно 2+1 — допущение (порядок авто-атак в окне не публикуется). Не включено: E-уровни (E0), след A2 (лечение — не урон), A4 (дефенсивный), заряды от вражеских атак и лечения (непроверяемо), тайминг выхода из Vendetta. SP: −4 за цикл (4 навыка; авто-атаки окна бесплатны).",
    noteEn: "Cycle: 4 Skills at 90%/50% (30 energy each; −50% of current HP each — HP consumption charges the Talent) -> the Ultimate (160%/100%, 5 energy, +20 Charge) -> Vendetta entry at 100 Charge: Max HP +50% (counted as hpMultPercent 50 on the window instances — uptime guaranteed by the cycle structure) -> the window: 2x 'Kingslayer Be King' (110%/66%, 30 energy each, −35% of current HP) + 'Godslayer Be God' (280%/168%, 10 energy, −150 Charge). The Ultimate happens BEFORE Vendetta — the +50% Max HP multiplier does not apply to it. A6 trace: +1.2% CR per 100 HP above 4000, capped at 4000 excess (+48%) — the condition is checked against the profile's combat HP, counted. Cycle energy: 4x30 + 2x30 + 10 = 190 >= 160 ✓. The 2+1 window is an assumption (the auto-attack order inside the window is not published). Excluded: eidolons (E0), the A2 trace (healing, not damage), A4 (defensive), Charge from enemy hits and healing (unverifiable), Vendetta exit timing. SP: -4 per cycle (4 Skills; window auto-attacks are SP-free).",
    hpScale: true,
    critRateFromHp: { hpThreshold: 4000, crPer100: 1.2, capHp: 4000 },
    energy: { ultCost: 160 },
    instances: [
      {
        key: "skill_1",
        phaseRu: "НАКОПЛЕНИЕ ЗАРЯДОВ — НАВЫК #1",
        phaseEn: "CHARGE BUILDUP — SKILL #1",
        actionRu: "Навык «Deaths are Legion, Regrets are None»: 90% Max HP по цели + 50% по смежным (−50% текущего HP)",
        actionEn: "Skill 'Deaths are Legion, Regrets are None': 90% MaxHP primary + 50% adjacent (−50% of current HP)",
        descRu: "HP-расход заряжает Talent. 30 энергии. Инстансы 2–4 идентичны.",
        descEn: "HP consumption charges the Talent. 30 energy. Instances 2-4 are identical.",
        mv: 0.9, adjacentMv: 0.5, targets: 3, count: 4, energyGain: 30
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ — ПЕРЕД VENDETTA",
        phaseEn: "ULTIMATE — BEFORE VENDETTA",
        actionRu: "Ульт «Throne of Bones»: 160% Max HP по цели + 100% по смежным (+20% Max HP лечение, +20 зарядов)",
        actionEn: "Ult 'Throne of Bones': 160% MaxHP primary + 100% adjacent (+20% Max HP heal, +20 Charge)",
        descRu: "Стоимость 160 энергии, +5 после. +20 зарядов доводит до 100 → вход в Vendetta. Множитель Max HP +50% окна на ульту не действует (вход после ульты).",
        descEn: "Costs 160 energy, +5 after. +20 Charge brings the total to 100 -> Vendetta entry. The window's +50% Max HP multiplier does not apply to the ult (entry happens after it).",
        mv: 1.6, adjacentMv: 1.0, targets: 3, count: 1, energyGain: 5, isUlt: true
      },
      {
        key: "kingslayer",
        phaseRu: "ОКНО VENDETTA — АВТО-НАВЫК «KINGSLAYER BE KING»",
        phaseEn: "VENDETTA WINDOW — AUTO-SKILL 'KINGSLAYER BE KING'",
        actionRu: "«Kingslayer Be King»: 110% Max HP ×1.5 (Vendetta) по цели + 66% по смежным (−35% текущего HP)",
        actionEn: "'Kingslayer Be King': 110% MaxHP x1.5 (Vendetta) primary + 66% adjacent (−35% of current HP)",
        descRu: "Авто-использование, без SP. Множитель Vendetta +50% Max HP учтён. 2 использования. По 30 энергии.",
        descEn: "Auto-used, SP-free. The Vendetta +50% Max HP multiplier is counted. 2 uses. 30 energy each.",
        mv: 1.1, adjacentMv: 0.66, targets: 3, count: 2, energyGain: 30,
        hpMultPercent: 50
      },
      {
        key: "godslayer",
        phaseRu: "ОКНО VENDETTA — АВТО-НАВЫК «GODSLAYER BE GOD»",
        phaseEn: "VENDETTA WINDOW — AUTO-SKILL 'GODSLAYER BE GOD'",
        actionRu: "«Godslayer Be God»: 280% Max HP ×1.5 (Vendetta) по цели + 168% по смежным (−150 зарядов)",
        actionEn: "'Godslayer Be God': 280% MaxHP x1.5 (Vendetta) primary + 168% adjacent (−150 Charge)",
        descRu: "Авто-использование при 150 зарядах, без SP. Завершает окно; после выход из Vendetta.",
        descEn: "Auto-used at 150 Charge, SP-free. Closes the window; Vendetta exits afterwards.",
        mv: 2.8, adjacentMv: 1.68, targets: 3, count: 1, energyGain: 10,
        hpMultPercent: 50
      }
    ]
  },

  // Анакса (1405) — цикл: 5 навыков + 4 базовые + 5 авто-навыков таланта
  // (Quadrivalent Ascendance, steady-state) с ультой.
  "1405": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/anaxa",
        capturedOn: "2026-11-16",
        note: "Basic 'Sensus' 100% ATK (en 20, +10 from A2); Skill 'Hypotos' 70% ATK x5 (primary + 4 bounces), +20% DMG per enemy hit (en 6); Ult 'Charts, Visible Souls' 160% ATK AoE, 140 energy cost (en 5); Talent: after a Basic or Skill, auto-uses an extra Skill (no SP), gains Quadrivalent Ascendance; while QA is active and 5+ weaknesses are implanted: +30% DMG; A4: 140% CD boost if solo Erudition, else +50% DMG for 2+ Erudition; A6: 20% DEF ignore per implanted weakness type."
      }
    ],
    noteRu: "Цикл (steady-state Quadrivalent Ascendance — 5+ слабостей, +30% DMG учтено как passiveDmgBoost): 5 навыков (mv 116.67% = 70%×5 ударов на 3 цели, +60% DMG = +20%×3 врага, по 6 энергии), 4 базовые (100%, по 30 энергии = 20+10 след A2) и 5 авто-навыков таланта (без SP, без энергии) с ультой (160% AoE, 5 энергии). Энергия цикла: 5×6 + 4×30 = 150 ≥ 140 ✓. Не включено: E-уровни (E0), след A4 (зависит от состава: 140% КУ при одиночном Эрудиции или +50% DMG при 2+ — состав команды не фиксирован), след A6 (игнор защиты по типам слабостей врага — зависит от набора слабостей сценария), QA-старт вне steady-state. SP: −1 за цикл (5 навыков против 4 базовых).",
    noteEn: "Cycle (steady-state Quadrivalent Ascendance — 5+ weaknesses, the +30% DMG is counted as passiveDmgBoost): 5 Skills (mv 116.67% = 70%x5 hits across 3 targets, +60% DMG = +20%x3 enemies, 6 energy each), 4 Basics (100%, 30 energy each = 20+10 from the A2 trace) and 5 Talent auto-Skills (SP-free, no energy) with the Ultimate (160% AoE, 5 energy). Cycle energy: 5x6 + 4x30 = 150 >= 140 ✓. Excluded: eidolons (E0), the A4 trace (composition-dependent: 140% CD with a solo Erudition or +50% DMG with 2+ — the team is not fixed), the A6 trace (DEF ignore per implanted weakness types — depends on the scenario's weakness set), non-steady-state QA ramp-up. SP: -1 per cycle (5 Skills vs 4 Basics).",
    passiveDmgBoost: 30,
    energy: { ultCost: 140 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "Навык «Hypotos»: 70% ATK ×5 ударов (основная + 4 отскока), +20% DMG за каждого задетого врага",
        actionEn: "Skill 'Hypotos': 70% ATK x5 hits (primary + 4 bounces), +20% DMG per enemy hit",
        descRu: "mv 116.67% на цель (70%×5/3), +60% DMG при 3 врагах. 6 энергии. SP −1.",
        descEn: "mv 116.67% per target (70%x5/3), +60% DMG with 3 enemies. 6 energy. SP -1.",
        mv: 1.166667, targets: 3, count: 5, energyGain: 6, extraDmgPercent: 60
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "Базовая «Sensus»: 100% ATK по цели (A2: +10 энергии)",
        actionEn: "Basic 'Sensus': 100% ATK to one target (A2: +10 energy)",
        descRu: "30 энергии (20+10 след A2). +1 SP.",
        descEn: "30 energy (20+10 from the A2 trace). +1 SP.",
        mv: 1.0, targets: 1, count: 4, energyGain: 30
      },
      {
        key: "talent_extra",
        phaseRu: "АВТО-НАВЫК ТАЛАНТА — EXTRA SKILL",
        phaseEn: "TALENT AUTO-SKILL — EXTRA SKILL",
        actionRu: "5× авто-навык после базовой/навыка: тот же «Hypotos», без SP и без энергии",
        actionEn: "5x auto-Skill after each Basic/Skill: the same 'Hypotos', SP-free and no energy",
        descRu: "Авто-использование таланта; +30% DMG от QA уже в passiveDmgBoost.",
        descEn: "Talent auto-use; the +30% QA DMG is already in passiveDmgBoost.",
        mv: 1.166667, targets: 3, count: 5, energyGain: 0, extraDmgPercent: 60
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Charts, Visible Souls»: 160% ATK AoE",
        actionEn: "Ult 'Charts, Visible Souls': 160% ATK AoE",
        descRu: "Стоимость 140 энергии, +5 после.",
        descEn: "Costs 140 energy, +5 after.",
        mv: 1.6, targets: 3, count: 1, energyGain: 5, isUlt: true
      }
    ]
  },
  // Март 7 (1001) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1001": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/march-7th",
        capturedOn: "2026-11-17",
        note: "Basic 100% ATK (en 20); Skill no damage; Ult 150%, 120 energy cost (+5); Talent: After a Shielded ally is attacked by an enemy, March 7th immediately Counters, dealing Ice DMG equal to 1% of her ATK. This effect can be triggered 2 time(s) each turn.."
      }
    ],
    noteRu: "Стандартный цикл: 6× базовая + ульт. Множители, энергия способностей и стоимость ульты (120) — из официального кита (Nous Matrix Model). Число повторов за цикл — общее документированное допущение (энергия: 120 ≥ 115 ✓). SP: -6 за цикл. Не включено (аптайм/условия не подтверждены): доп. условный урон (ult:conditional-additional), энергия союзников, эйдолоны (E0).",
    noteEn: "Standard cycle: 6x Basic + Ultimate. Multipliers, ability energy, and the ult cost (120) come from the official kit (Nous Matrix Model). Per-cycle repeat counts are a generic documented assumption (energy: 120 >= 115 ✓). SP: -6 per cycle. Excluded (uptime/conditions unverified): conditional additional ult damage, ally energy, eidolons (E0).",
    energy: { ultCost: 120 },
    instances: [
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "6× базовая «Frigid Cold Arrow»: 100% ATK",
        actionEn: "6x Basic 'Frigid Cold Arrow': 100% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений добирает энергию ульты — допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Basic count tops up the ult energy — an assumption.",
        mv: 1,
        targets: 1,
        count: 6,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Glacial Cascade»: 150% ATK",
        actionEn: "Ult 'Glacial Cascade': 150% ATK",
        descRu: "Стоимость 120 энергии, +5 после.",
        descEn: "Costs 120 energy, +5 after.",
        mv: 1.5,
        targets: 3,
        count: 1,
        energyGain: 5, isUlt: true
      }
    ]
  },

  // Дань Хэн (1002) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1002": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/dan-heng",
        capturedOn: "2026-11-17",
        note: "Basic 100% ATK (en 20); Skill 260% (en 30); Ult 400%, 100 energy cost (+5); Talent: When Dan Heng is the target of an ally's Ability, his next attack's Wind RES PEN increases by 0.36%. This effect can be triggered again after 2 turn(s).."
      }
    ],
    noteRu: "Стандартный цикл: 2× навык + 2× базовая + ульт. Множители, энергия способностей и стоимость ульты (100) — из официального кита (Nous Matrix Model). Число повторов за цикл — общее документированное допущение (энергия: 100 ≥ 95 ✓). SP: +0 за цикл. Не включено (аптайм/условия не подтверждены): состояния/стаки кита, условные бонусы кита (If-условия), энергия союзников, эйдолоны (E0).",
    noteEn: "Standard cycle: 2x Skill + 2x Basic + Ultimate. Multipliers, ability energy, and the ult cost (100) come from the official kit (Nous Matrix Model). Per-cycle repeat counts are a generic documented assumption (energy: 100 >= 95 ✓). SP: +0 per cycle. Excluded (uptime/conditions unverified): kit states/stacks, условные бонусы кита (If-условия), ally energy, eidolons (E0).",
    energy: { ultCost: 100 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "2× навык «Cloudlancer Art: Torrent»: 260% ATK",
        actionEn: "2x Skill 'Cloudlancer Art: Torrent': 260% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений за цикл — общее документированное допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Per-cycle use count is a generic documented assumption.",
        mv: 2.6,
        targets: 1,
        count: 2,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "2× базовая «Cloudlancer Art: North Wind»: 100% ATK",
        actionEn: "2x Basic 'Cloudlancer Art: North Wind': 100% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений добирает энергию ульты — допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Basic count tops up the ult energy — an assumption.",
        mv: 1,
        targets: 1,
        count: 2,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Ethereal Dream»: 400% ATK",
        actionEn: "Ult 'Ethereal Dream': 400% ATK",
        descRu: "Стоимость 100 энергии, +5 после.",
        descEn: "Costs 100 energy, +5 after.",
        mv: 4,
        targets: 1,
        count: 1,
        energyGain: 5, isUlt: true
      }
    ]
  },

  // Химеко (1003) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1003": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/himeko",
        capturedOn: "2026-11-17",
        note: "Basic 100% ATK (en 20); Skill 200%/80% adj (en 30); Ult 230%, 120 energy cost (+5); Talent: When an enemy is inflicted with Weakness Break, Himeko gains 1 point of Charge (max 3 points).\nIf Himeko is fully Charged when an ally performs an attack, Himeko immediately performs 1 follow-up attac."
      }
    ],
    noteRu: "Стандартный цикл: 2× навык + 3× базовая + ульт. Множители, энергия способностей и стоимость ульты (120) — из официального кита (Nous Matrix Model). Число повторов за цикл — общее документированное допущение (энергия: 120 ≥ 115 ✓). SP: -1 за цикл. Не включено (аптайм/условия не подтверждены): DoT-урон кита, бонус-атаки таланта, энергия союзников, эйдолоны (E0).",
    noteEn: "Standard cycle: 2x Skill + 3x Basic + Ultimate. Multipliers, ability energy, and the ult cost (120) come from the official kit (Nous Matrix Model). Per-cycle repeat counts are a generic documented assumption (energy: 120 >= 115 ✓). SP: -1 per cycle. Excluded (uptime/conditions unverified): kit DoT damage, talent follow-up attacks, ally energy, eidolons (E0).",
    energy: { ultCost: 120 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "2× навык «Molten Detonation»: 200% ATK + 80% по смежным",
        actionEn: "2x Skill 'Molten Detonation': 200% ATK + 80% adjacent",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений за цикл — общее документированное допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Per-cycle use count is a generic documented assumption.",
        mv: 2,
        adjacentMv: 0.8,
        targets: 3,
        count: 2,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "3× базовая «Sawblade Tuning»: 100% ATK",
        actionEn: "3x Basic 'Sawblade Tuning': 100% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений добирает энергию ульты — допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Basic count tops up the ult energy — an assumption.",
        mv: 1,
        targets: 1,
        count: 3,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Heavenly Flare»: 230% ATK",
        actionEn: "Ult 'Heavenly Flare': 230% ATK",
        descRu: "Стоимость 120 энергии, +5 после.",
        descEn: "Costs 120 energy, +5 after.",
        mv: 2.3,
        targets: 3,
        count: 1,
        energyGain: 5, isUlt: true
      }
    ]
  },

  // Кафка (1005) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1005": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/kafka",
        capturedOn: "2026-11-17",
        note: "Basic 100% ATK (en 20); Skill 160%/60% adj (en 30); Ult 80%, 120 energy cost (+5); Talent: After Kafka's teammate uses attacks on an enemy target, Kafka immediately launches Follow-up ATK and deals Lightning DMG equal to 1.4% of Kafka's ATK to the primary target, with a 100% base chance to ."
      }
    ],
    noteRu: "Стандартный цикл: 2× навык + 3× базовая + ульт. Множители, энергия способностей и стоимость ульты (120) — из официального кита (Nous Matrix Model). Число повторов за цикл — общее документированное допущение (энергия: 120 ≥ 115 ✓). SP: -1 за цикл. Не включено (аптайм/условия не подтверждены): DoT-урон кита, бонус-атаки таланта, энергия союзников, эйдолоны (E0).",
    noteEn: "Standard cycle: 2x Skill + 3x Basic + Ultimate. Multipliers, ability energy, and the ult cost (120) come from the official kit (Nous Matrix Model). Per-cycle repeat counts are a generic documented assumption (energy: 120 >= 115 ✓). SP: -1 per cycle. Excluded (uptime/conditions unverified): kit DoT damage, talent follow-up attacks, ally energy, eidolons (E0).",
    energy: { ultCost: 120 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "2× навык «Caressing Moonlight»: 160% ATK + 60% по смежным",
        actionEn: "2x Skill 'Caressing Moonlight': 160% ATK + 60% adjacent",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений за цикл — общее документированное допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Per-cycle use count is a generic documented assumption.",
        mv: 1.6,
        adjacentMv: 0.6,
        targets: 3,
        count: 2,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "3× базовая «Midnight Tumult»: 100% ATK",
        actionEn: "3x Basic 'Midnight Tumult': 100% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений добирает энергию ульты — допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Basic count tops up the ult energy — an assumption.",
        mv: 1,
        targets: 1,
        count: 3,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Twilight Trill»: 80% ATK",
        actionEn: "Ult 'Twilight Trill': 80% ATK",
        descRu: "Стоимость 120 энергии, +5 после.",
        descEn: "Costs 120 energy, +5 after.",
        mv: 0.8,
        targets: 3,
        count: 1,
        energyGain: 5, isUlt: true
      }
    ]
  },

  // Серебряный Волк (1006) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1006": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/silver-wolf",
        capturedOn: "2026-11-17",
        note: "Basic 100% ATK (en 20); Skill 196% (en 30); Ult 380%, 110 energy cost (+5); Talent: Silver Wolf can create three types of \"Bugs\": Reduce ATK by 0.1%, reduce DEF by 0.12%, and reduce SPD by 0.06%.\nAfter every attack launched by Silver Wolf, she has a 1% base chance to implant 1 random."
      }
    ],
    noteRu: "Стандартный цикл: 2× навык + 3× базовая + ульт. Множители, энергия способностей и стоимость ульты (110) — из официального кита (Nous Matrix Model). Число повторов за цикл — общее документированное допущение (энергия: 120 ≥ 105 ✓). SP: -1 за цикл. Не включено (аптайм/условия не подтверждены): условные бонусы кита (If-условия), энергия союзников, эйдолоны (E0).",
    noteEn: "Standard cycle: 2x Skill + 3x Basic + Ultimate. Multipliers, ability energy, and the ult cost (110) come from the official kit (Nous Matrix Model). Per-cycle repeat counts are a generic documented assumption (energy: 120 >= 105 ✓). SP: -1 per cycle. Excluded (uptime/conditions unverified): условные бонусы кита (If-условия), ally energy, eidolons (E0).",
    energy: { ultCost: 110 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "2× навык «Allow Changes?»: 196% ATK",
        actionEn: "2x Skill 'Allow Changes?': 196% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений за цикл — общее документированное допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Per-cycle use count is a generic documented assumption.",
        mv: 1.96,
        targets: 1,
        count: 2,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "3× базовая «System Warning»: 100% ATK",
        actionEn: "3x Basic 'System Warning': 100% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений добирает энергию ульты — допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Basic count tops up the ult energy — an assumption.",
        mv: 1,
        targets: 1,
        count: 3,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «User Banned»: 380% ATK",
        actionEn: "Ult 'User Banned': 380% ATK",
        descRu: "Стоимость 110 энергии, +5 после.",
        descEn: "Costs 110 energy, +5 after.",
        mv: 3.8,
        targets: 3,
        count: 1,
        energyGain: 5, isUlt: true
      }
    ]
  },

  // Арлан (1008) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1008": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/arlan",
        capturedOn: "2026-11-17",
        note: "Basic 100% ATK (en 20); Skill 240% (en 30); Ult 320%/160% adj, 110 energy cost (+5); Talent: Increases Arlan's DMG for every percent of HP below his Max HP, up to a max of 0.72% more DMG.."
      }
    ],
    noteRu: "Стандартный цикл: 2× навык + 3× базовая + ульт. Множители, энергия способностей и стоимость ульты (110) — из официального кита (Nous Matrix Model). Число повторов за цикл — общее документированное допущение (энергия: 120 ≥ 105 ✓). SP: -1 за цикл. Не включено (аптайм/условия не подтверждены): условные пассивы, энергия союзников, эйдолоны (E0).",
    noteEn: "Standard cycle: 2x Skill + 3x Basic + Ultimate. Multipliers, ability energy, and the ult cost (110) come from the official kit (Nous Matrix Model). Per-cycle repeat counts are a generic documented assumption (energy: 120 >= 105 ✓). SP: -1 per cycle. Excluded (uptime/conditions unverified): conditional passives, ally energy, eidolons (E0).",
    energy: { ultCost: 110 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "2× навык «Shackle Breaker»: 240% ATK",
        actionEn: "2x Skill 'Shackle Breaker': 240% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений за цикл — общее документированное допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Per-cycle use count is a generic documented assumption.",
        mv: 2.4,
        targets: 1,
        count: 2,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "3× базовая «Lightning Rush»: 100% ATK",
        actionEn: "3x Basic 'Lightning Rush': 100% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений добирает энергию ульты — допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Basic count tops up the ult energy — an assumption.",
        mv: 1,
        targets: 1,
        count: 3,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Frenzied Punishment»: 320% ATK + 160% по смежным",
        actionEn: "Ult 'Frenzied Punishment': 320% ATK + 160% adjacent",
        descRu: "Стоимость 110 энергии, +5 после.",
        descEn: "Costs 110 energy, +5 after.",
        mv: 3.2,
        adjacentMv: 1.6,
        targets: 3,
        count: 1,
        energyGain: 5, isUlt: true
      }
    ]
  },

  // Герта (1013) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1013": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/herta",
        capturedOn: "2026-11-17",
        note: "Basic 100% ATK (en 20); Skill 100% (en 30); Ult 200%, 110 energy cost (+5); Talent: When an ally's attack causes an enemy's HP percentage to fall to 0.5% or lower, Herta will launch a follow-up attack, dealing Ice DMG equal to 0.4% of Herta's ATK to all enemies.."
      }
    ],
    noteRu: "Стандартный цикл: 2× навык + 3× базовая + ульт. Множители, энергия способностей и стоимость ульты (110) — из официального кита (Nous Matrix Model). Число повторов за цикл — общее документированное допущение (энергия: 120 ≥ 105 ✓). SP: -1 за цикл. Не включено (аптайм/условия не подтверждены): бонус-атаки таланта, состояния/стаки кита, условные бонусы кита (If-условия), энергия союзников, эйдолоны (E0).",
    noteEn: "Standard cycle: 2x Skill + 3x Basic + Ultimate. Multipliers, ability energy, and the ult cost (110) come from the official kit (Nous Matrix Model). Per-cycle repeat counts are a generic documented assumption (energy: 120 >= 105 ✓). SP: -1 per cycle. Excluded (uptime/conditions unverified): talent follow-up attacks, kit states/stacks, условные бонусы кита (If-условия), ally energy, eidolons (E0).",
    energy: { ultCost: 110 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "2× навык «One-Time Offer»: 100% ATK",
        actionEn: "2x Skill 'One-Time Offer': 100% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений за цикл — общее документированное допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Per-cycle use count is a generic documented assumption.",
        mv: 1,
        targets: 3,
        count: 2,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "3× базовая «What Are You Looking At?»: 100% ATK",
        actionEn: "3x Basic 'What Are You Looking At?': 100% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений добирает энергию ульты — допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Basic count tops up the ult energy — an assumption.",
        mv: 1,
        targets: 1,
        count: 3,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «It's Magic, I Added Some Magic»: 200% ATK",
        actionEn: "Ult 'It's Magic, I Added Some Magic': 200% ATK",
        descRu: "Стоимость 110 энергии, +5 после.",
        descEn: "Costs 110 energy, +5 after.",
        mv: 2,
        targets: 3,
        count: 1,
        energyGain: 5, isUlt: true
      }
    ]
  },

  // Броня (1101) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1101": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/bronya",
        capturedOn: "2026-11-17",
        note: "Basic 100% ATK (en 20); Skill no damage; Ult no damage, 120 energy cost (+5); Talent: After using her Basic ATK, Bronya's next action will be Advanced Forward by 0.3%.."
      }
    ],
    noteRu: "Стандартный цикл: 6× базовая + ульт (ульт без урона — только энергетика). Множители, энергия способностей и стоимость ульты (120) — из официального кита (Nous Matrix Model). Число повторов за цикл — общее документированное допущение (энергия: 120 ≥ 115 ✓). SP: -6 за цикл. Не включено (аптайм/условия не подтверждены): бонус-атаки таланта, энергия союзников, эйдолоны (E0).",
    noteEn: "Standard cycle: 6x Basic + Ultimate (the ult deals no damage — energy budget only). Multipliers, ability energy, and the ult cost (120) come from the official kit (Nous Matrix Model). Per-cycle repeat counts are a generic documented assumption (energy: 120 >= 115 ✓). SP: -6 per cycle. Excluded (uptime/conditions unverified): talent follow-up attacks, ally energy, eidolons (E0).",
    energy: { ultCost: 120 },
    instances: [
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "6× базовая «Windrider Bullet»: 100% ATK",
        actionEn: "6x Basic 'Windrider Bullet': 100% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений добирает энергию ульты — допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Basic count tops up the ult energy — an assumption.",
        mv: 1,
        targets: 1,
        count: 6,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «The Belobog March»: не наносит урона (лечение/бафф)",
        actionEn: "Ult 'The Belobog March': deals no damage (heal/buff)",
        descRu: "В цикле учтена только энергетика ульты: стоимость 120, +5 после.",
        descEn: "Only the ult's energy budget is counted: cost 120, +5 after.",
        mv: 0,
        targets: 1,
        count: 1,
        energyGain: 5, isUlt: true
      }
    ]
  },

  // Сервал (1103) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1103": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/serval",
        capturedOn: "2026-11-17",
        note: "Basic 100% ATK (en 20); Skill 140%/60% adj (en 30); Ult 180%, 100 energy cost (+5); Talent: After Serval attacks, deals Additional Lightning DMG equal to 0.72% of Serval's ATK to all Shocked enemies.."
      }
    ],
    noteRu: "Стандартный цикл: 2× навык + 2× базовая + ульт. Множители, энергия способностей и стоимость ульты (100) — из официального кита (Nous Matrix Model). Число повторов за цикл — общее документированное допущение (энергия: 100 ≥ 95 ✓). SP: +0 за цикл. Не включено (аптайм/условия не подтверждены): DoT-урон кита, состояния/стаки кита, энергия союзников, эйдолоны (E0).",
    noteEn: "Standard cycle: 2x Skill + 2x Basic + Ultimate. Multipliers, ability energy, and the ult cost (100) come from the official kit (Nous Matrix Model). Per-cycle repeat counts are a generic documented assumption (energy: 100 >= 95 ✓). SP: +0 per cycle. Excluded (uptime/conditions unverified): kit DoT damage, kit states/stacks, ally energy, eidolons (E0).",
    energy: { ultCost: 100 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "2× навык «Lightning Flash»: 140% ATK + 60% по смежным",
        actionEn: "2x Skill 'Lightning Flash': 140% ATK + 60% adjacent",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений за цикл — общее документированное допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Per-cycle use count is a generic documented assumption.",
        mv: 1.4,
        adjacentMv: 0.6,
        targets: 3,
        count: 2,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "2× базовая «Roaring Thunderclap»: 100% ATK",
        actionEn: "2x Basic 'Roaring Thunderclap': 100% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений добирает энергию ульты — допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Basic count tops up the ult energy — an assumption.",
        mv: 1,
        targets: 1,
        count: 2,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Here Comes the Mechanical Fever»: 180% ATK",
        actionEn: "Ult 'Here Comes the Mechanical Fever': 180% ATK",
        descRu: "Стоимость 100 энергии, +5 после.",
        descEn: "Costs 100 energy, +5 after.",
        mv: 1.8,
        targets: 3,
        count: 1,
        energyGain: 5, isUlt: true
      }
    ]
  },

  // Наташа (1105) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1105": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/natasha",
        capturedOn: "2026-11-17",
        note: "Basic 100% ATK (en 20); Skill no damage; Ult no damage, 90 energy cost (+5); Talent: When healing allies with HP percentage at 0.3% or lower, increases Natasha's Outgoing Healing by 0.5%. This effect also works on continuous healing.."
      }
    ],
    noteRu: "Стандартный цикл: 5× базовая + ульт (ульт без урона — только энергетика). Множители, энергия способностей и стоимость ульты (90) — из официального кита (Nous Matrix Model). Число повторов за цикл — общее документированное допущение (энергия: 100 ≥ 85 ✓). SP: -5 за цикл. Не включено (аптайм/условия не подтверждены): условные пассивы, энергия союзников, эйдолоны (E0).",
    noteEn: "Standard cycle: 5x Basic + Ultimate (the ult deals no damage — energy budget only). Multipliers, ability energy, and the ult cost (90) come from the official kit (Nous Matrix Model). Per-cycle repeat counts are a generic documented assumption (energy: 100 >= 85 ✓). SP: -5 per cycle. Excluded (uptime/conditions unverified): conditional passives, ally energy, eidolons (E0).",
    energy: { ultCost: 90 },
    instances: [
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "5× базовая «Behind the Kindness»: 100% ATK",
        actionEn: "5x Basic 'Behind the Kindness': 100% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений добирает энергию ульты — допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Basic count tops up the ult energy — an assumption.",
        mv: 1,
        targets: 1,
        count: 5,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Gift of Rebirth»: не наносит урона (лечение/бафф)",
        actionEn: "Ult 'Gift of Rebirth': deals no damage (heal/buff)",
        descRu: "В цикле учтена только энергетика ульты: стоимость 90, +5 после.",
        descEn: "Only the ult's energy budget is counted: cost 90, +5 after.",
        mv: 0,
        targets: 1,
        count: 1,
        energyGain: 5, isUlt: true
      }
    ]
  },

  // Пела (1106) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1106": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/pela",
        capturedOn: "2026-11-17",
        note: "Basic 100% ATK (en 20); Skill 210% (en 30); Ult 100%, 110 energy cost (+5); Talent: If the enemy is debuffed after Pela's attack, Pela will restore 10 additional Energy. This effect can only be triggered 1 time per attack.."
      }
    ],
    noteRu: "Стандартный цикл: 2× навык + 3× базовая + ульт. Множители, энергия способностей и стоимость ульты (110) — из официального кита (Nous Matrix Model). Число повторов за цикл — общее документированное допущение (энергия: 120 ≥ 105 ✓). SP: -1 за цикл. Не включено (аптайм/условия не подтверждены): условные бонусы кита (If-условия), энергия союзников, эйдолоны (E0).",
    noteEn: "Standard cycle: 2x Skill + 3x Basic + Ultimate. Multipliers, ability energy, and the ult cost (110) come from the official kit (Nous Matrix Model). Per-cycle repeat counts are a generic documented assumption (energy: 120 >= 105 ✓). SP: -1 per cycle. Excluded (uptime/conditions unverified): условные бонусы кита (If-условия), ally energy, eidolons (E0).",
    energy: { ultCost: 110 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "2× навык «Frostbite»: 210% ATK",
        actionEn: "2x Skill 'Frostbite': 210% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений за цикл — общее документированное допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Per-cycle use count is a generic documented assumption.",
        mv: 2.1,
        targets: 1,
        count: 2,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "3× базовая «Frost Shot»: 100% ATK",
        actionEn: "3x Basic 'Frost Shot': 100% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений добирает энергию ульты — допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Basic count tops up the ult energy — an assumption.",
        mv: 1,
        targets: 1,
        count: 3,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Zone Suppression»: 100% ATK",
        actionEn: "Ult 'Zone Suppression': 100% ATK",
        descRu: "Стоимость 110 энергии, +5 после.",
        descEn: "Costs 110 energy, +5 after.",
        mv: 1,
        targets: 3,
        count: 1,
        energyGain: 5, isUlt: true
      }
    ]
  },

  // Хук (1109) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1109": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/hook",
        capturedOn: "2026-11-17",
        note: "Basic 100% ATK (en 20); Skill 240% (en 30); Ult 400%, 120 energy cost (+5); Talent: When attacking a target afflicted with Burn, deals Additional Fire DMG equal to 1% of Hook's ATK and regenerates 5 extra Energy.."
      }
    ],
    noteRu: "Стандартный цикл: 2× навык + 3× базовая + ульт. Множители, энергия способностей и стоимость ульты (120) — из официального кита (Nous Matrix Model). Число повторов за цикл — общее документированное допущение (энергия: 120 ≥ 115 ✓). SP: -1 за цикл. Не включено (аптайм/условия не подтверждены): DoT-урон кита, энергия союзников, эйдолоны (E0).",
    noteEn: "Standard cycle: 2x Skill + 3x Basic + Ultimate. Multipliers, ability energy, and the ult cost (120) come from the official kit (Nous Matrix Model). Per-cycle repeat counts are a generic documented assumption (energy: 120 >= 115 ✓). SP: -1 per cycle. Excluded (uptime/conditions unverified): kit DoT damage, ally energy, eidolons (E0).",
    energy: { ultCost: 120 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "2× навык «Hey! Remember Hook?»: 240% ATK",
        actionEn: "2x Skill 'Hey! Remember Hook?': 240% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений за цикл — общее документированное допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Per-cycle use count is a generic documented assumption.",
        mv: 2.4,
        targets: 1,
        count: 2,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "3× базовая «Hehe! Don't Get Burned!»: 100% ATK",
        actionEn: "3x Basic 'Hehe! Don't Get Burned!': 100% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений добирает энергию ульты — допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Basic count tops up the ult energy — an assumption.",
        mv: 1,
        targets: 1,
        count: 3,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Boom! Here Comes the Fire!»: 400% ATK",
        actionEn: "Ult 'Boom! Here Comes the Fire!': 400% ATK",
        descRu: "Стоимость 120 энергии, +5 после.",
        descEn: "Costs 120 energy, +5 after.",
        mv: 4,
        targets: 1,
        count: 1,
        energyGain: 5, isUlt: true
      }
    ]
  },

  // Рысь (1110) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1110": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/lynx",
        capturedOn: "2026-11-17",
        note: "Basic 50% ATK (en 20); Skill no damage; Ult no damage, 100 energy cost (+5); Talent: When using Lynx's Skill or Ultimate, applies continuous healing to the target ally for 2 turn(s), restoring the target ally's HP by an amount equal to 0.036% of Lynx's Max HP plus 96 at the start of e."
      }
    ],
    noteRu: "Стандартный цикл: 5× базовая + ульт (ульт без урона — только энергетика). Множители, энергия способностей и стоимость ульты (100) — из официального кита (Nous Matrix Model). Число повторов за цикл — общее документированное допущение (энергия: 100 ≥ 95 ✓). SP: -5 за цикл. Не включено (аптайм/условия не подтверждены): условные бонусы кита (If-условия), энергия союзников, эйдолоны (E0).",
    noteEn: "Standard cycle: 5x Basic + Ultimate (the ult deals no damage — energy budget only). Multipliers, ability energy, and the ult cost (100) come from the official kit (Nous Matrix Model). Per-cycle repeat counts are a generic documented assumption (energy: 100 >= 95 ✓). SP: -5 per cycle. Excluded (uptime/conditions unverified): условные бонусы кита (If-условия), ally energy, eidolons (E0).",
    energy: { ultCost: 100 },
    instances: [
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "5× базовая «Ice Crampon Technique»: 50% ATK",
        actionEn: "5x Basic 'Ice Crampon Technique': 50% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений добирает энергию ульты — допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Basic count tops up the ult energy — an assumption.",
        mv: 0.5,
        targets: 1,
        count: 5,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Snowfield First Aid»: не наносит урона (лечение/бафф)",
        actionEn: "Ult 'Snowfield First Aid': deals no damage (heal/buff)",
        descRu: "В цикле учтена только энергетика ульты: стоимость 100, +5 после.",
        descEn: "Only the ult's energy budget is counted: cost 100, +5 after.",
        mv: 0,
        targets: 1,
        count: 1,
        energyGain: 5, isUlt: true
      }
    ]
  },

  // Тинъюнь (1202) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1202": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/tingyun",
        capturedOn: "2026-11-17",
        note: "Basic 100% ATK (en 20); Skill no damage; Ult no damage, 130 energy cost (+5); Talent: When an enemy is attacked by Tingyun, the ally with Benediction immediately deals Additional Lightning DMG equal to 0.6% of that ally's ATK to the same enemy.."
      }
    ],
    noteRu: "Стандартный цикл: 7× базовая + ульт (ульт без урона — только энергетика). Множители, энергия способностей и стоимость ульты (130) — из официального кита (Nous Matrix Model). Число повторов за цикл — общее документированное допущение (энергия: 140 ≥ 125 ✓). SP: -7 за цикл. Не включено (аптайм/условия не подтверждены): условные пассивы, энергия союзников, эйдолоны (E0).",
    noteEn: "Standard cycle: 7x Basic + Ultimate (the ult deals no damage — energy budget only). Multipliers, ability energy, and the ult cost (130) come from the official kit (Nous Matrix Model). Per-cycle repeat counts are a generic documented assumption (energy: 140 >= 125 ✓). SP: -7 per cycle. Excluded (uptime/conditions unverified): conditional passives, ally energy, eidolons (E0).",
    energy: { ultCost: 130 },
    instances: [
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "7× базовая «Dislodged»: 100% ATK",
        actionEn: "7x Basic 'Dislodged': 100% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений добирает энергию ульты — допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Basic count tops up the ult energy — an assumption.",
        mv: 1,
        targets: 1,
        count: 7,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Amidst the Rejoicing Clouds»: не наносит урона (лечение/бафф)",
        actionEn: "Ult 'Amidst the Rejoicing Clouds': deals no damage (heal/buff)",
        descRu: "В цикле учтена только энергетика ульты: стоимость 130, +5 после.",
        descEn: "Only the ult's energy budget is counted: cost 130, +5 after.",
        mv: 0,
        targets: 1,
        count: 1,
        energyGain: 5, isUlt: true
      }
    ]
  },

  // Лоча (1203) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1203": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/luocha",
        capturedOn: "2026-11-17",
        note: "Basic 100% ATK (en 20); Skill no damage; Ult 200%, 100 energy cost (+5); Talent: When Abyss Flower reaches 2 stacks, Luocha consumes all stacks of Abyss Flower to deploy a Field against the enemy.\nWhen any enemy in the Field is attacked by an ally, the attacking ally's HP is immed."
      }
    ],
    noteRu: "Стандартный цикл: 5× базовая + ульт. Множители, энергия способностей и стоимость ульты (100) — из официального кита (Nous Matrix Model). Число повторов за цикл — общее документированное допущение (энергия: 100 ≥ 95 ✓). SP: -5 за цикл. Не включено (аптайм/условия не подтверждены): состояния/стаки кита, условные бонусы кита (If-условия), энергия союзников, эйдолоны (E0).",
    noteEn: "Standard cycle: 5x Basic + Ultimate. Multipliers, ability energy, and the ult cost (100) come from the official kit (Nous Matrix Model). Per-cycle repeat counts are a generic documented assumption (energy: 100 >= 95 ✓). SP: -5 per cycle. Excluded (uptime/conditions unverified): kit states/stacks, условные бонусы кита (If-условия), ally energy, eidolons (E0).",
    energy: { ultCost: 100 },
    instances: [
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "5× базовая «Thorns of the Abyss»: 100% ATK",
        actionEn: "5x Basic 'Thorns of the Abyss': 100% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений добирает энергию ульты — допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Basic count tops up the ult energy — an assumption.",
        mv: 1,
        targets: 1,
        count: 5,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Death Wish»: 200% ATK",
        actionEn: "Ult 'Death Wish': 200% ATK",
        descRu: "Стоимость 100 энергии, +5 после.",
        descEn: "Costs 100 energy, +5 after.",
        mv: 2,
        targets: 3,
        count: 1,
        energyGain: 5, isUlt: true
      }
    ]
  },

  // Сушан (1206) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1206": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/sushang",
        capturedOn: "2026-11-17",
        note: "Basic 100% ATK (en 20); Skill 210% (en 30); Ult 320%, 120 energy cost (+5); Talent: When an enemy has their Weakness Broken on the field, Sushang's SPD increases by 0.2% for 2 turn(s).."
      }
    ],
    noteRu: "Стандартный цикл: 2× навык + 3× базовая + ульт. Множители, энергия способностей и стоимость ульты (120) — из официального кита (Nous Matrix Model). Число повторов за цикл — общее документированное допущение (энергия: 120 ≥ 115 ✓). SP: -1 за цикл. Не включено (аптайм/условия не подтверждены): доп. условный урон (skill:conditional-additional), состояния/стаки кита, условные бонусы кита (If-условия), энергия союзников, эйдолоны (E0).",
    noteEn: "Standard cycle: 2x Skill + 3x Basic + Ultimate. Multipliers, ability energy, and the ult cost (120) come from the official kit (Nous Matrix Model). Per-cycle repeat counts are a generic documented assumption (energy: 120 >= 115 ✓). SP: -1 per cycle. Excluded (uptime/conditions unverified): conditional additional skill damage, kit states/stacks, условные бонусы кита (If-условия), ally energy, eidolons (E0).",
    energy: { ultCost: 120 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "2× навык «Cloudfencer Art: Mountainfall»: 210% ATK",
        actionEn: "2x Skill 'Cloudfencer Art: Mountainfall': 210% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений за цикл — общее документированное допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Per-cycle use count is a generic documented assumption.",
        mv: 2.1,
        targets: 1,
        count: 2,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "3× базовая «Cloudfencer Art: Starshine»: 100% ATK",
        actionEn: "3x Basic 'Cloudfencer Art: Starshine': 100% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений добирает энергию ульты — допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Basic count tops up the ult energy — an assumption.",
        mv: 1,
        targets: 1,
        count: 3,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Shape of Taixu: Dawn Herald»: 320% ATK",
        actionEn: "Ult 'Shape of Taixu: Dawn Herald': 320% ATK",
        descRu: "Стоимость 120 энергии, +5 после.",
        descEn: "Costs 120 energy, +5 after.",
        mv: 3.2,
        targets: 1,
        count: 1,
        energyGain: 5, isUlt: true
      }
    ]
  },

  // Юйкун (1207) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1207": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/yukong",
        capturedOn: "2026-11-17",
        note: "Basic 100% ATK (en 20); Skill no damage; Ult 380%, 130 energy cost (+5); Talent: Basic ATK additionally deals Imaginary DMG equal to 0.8% of Yukong's ATK, and increases the Toughness-Reducing DMG of this attack by 1%. This effect can be triggered again after 1 turn(s).."
      }
    ],
    noteRu: "Стандартный цикл: 7× базовая + ульт. Множители, энергия способностей и стоимость ульты (130) — из официального кита (Nous Matrix Model). Число повторов за цикл — общее документированное допущение (энергия: 140 ≥ 125 ✓). SP: -7 за цикл. Не включено (аптайм/условия не подтверждены): состояния/стаки кита, энергия союзников, эйдолоны (E0).",
    noteEn: "Standard cycle: 7x Basic + Ultimate. Multipliers, ability energy, and the ult cost (130) come from the official kit (Nous Matrix Model). Per-cycle repeat counts are a generic documented assumption (energy: 140 >= 125 ✓). SP: -7 per cycle. Excluded (uptime/conditions unverified): kit states/stacks, ally energy, eidolons (E0).",
    energy: { ultCost: 130 },
    instances: [
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "7× базовая «Arrowslinger»: 100% ATK",
        actionEn: "7x Basic 'Arrowslinger': 100% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений добирает энергию ульты — допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Basic count tops up the ult energy — an assumption.",
        mv: 1,
        targets: 1,
        count: 7,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Diving Kestrel»: 380% ATK",
        actionEn: "Ult 'Diving Kestrel': 380% ATK",
        descRu: "Стоимость 130 энергии, +5 после.",
        descEn: "Costs 130 energy, +5 after.",
        mv: 3.8,
        targets: 1,
        count: 1,
        energyGain: 5, isUlt: true
      }
    ]
  },

  // Фу Сюань (1208) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1208": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/fu-xuan",
        capturedOn: "2026-11-17",
        note: "Basic 50% ATK (en 20); Skill no damage; Ult 100%, 135 energy cost (+5); Talent: While Fu Xuan is still active in battle, Misfortune Avoidance is applied to the entire team. With Misfortune Avoidance, allies take 0.18% less DMG.\nWhen Fu Xuan's current HP falls to 0.5% of her Max H."
      }
    ],
    noteRu: "Стандартный цикл: 7× базовая + ульт. Множители, энергия способностей и стоимость ульты (135) — из официального кита (Nous Matrix Model). Число повторов за цикл — общее документированное допущение (энергия: 140 ≥ 130 ✓). SP: -7 за цикл. Не включено (аптайм/условия не подтверждены): условные пассивы, энергия союзников, эйдолоны (E0).",
    noteEn: "Standard cycle: 7x Basic + Ultimate. Multipliers, ability energy, and the ult cost (135) come from the official kit (Nous Matrix Model). Per-cycle repeat counts are a generic documented assumption (energy: 140 >= 130 ✓). SP: -7 per cycle. Excluded (uptime/conditions unverified): conditional passives, ally energy, eidolons (E0).",
    energy: { ultCost: 135 },
    instances: [
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "7× базовая «Novaburst»: 50% ATK",
        actionEn: "7x Basic 'Novaburst': 50% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений добирает энергию ульты — допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Basic count tops up the ult energy — an assumption.",
        mv: 0.5,
        targets: 1,
        count: 7,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Woes of Many Morphed to One»: 100% ATK",
        actionEn: "Ult 'Woes of Many Morphed to One': 100% ATK",
        descRu: "Стоимость 135 энергии, +5 после.",
        descEn: "Costs 135 energy, +5 after.",
        mv: 1,
        targets: 3,
        count: 1,
        energyGain: 5, isUlt: true
      }
    ]
  },

  // Яньцин (1209) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1209": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/yanqing",
        capturedOn: "2026-11-17",
        note: "Basic 100% ATK (en 20); Skill 220% (en 30); Ult 350%, 140 energy cost (+5); Talent: When Soulsteel Sync is active, Yanqing is less likely to be attacked by enemies. Yanqing's CRIT Rate increases by 0.2% and his CRIT DMG increases by 0.3%. After Yanqing attacks an enemy, there is a 0.."
      }
    ],
    noteRu: "Стандартный цикл: 2× навык + 4× базовая + ульт. Множители, энергия способностей и стоимость ульты (140) — из официального кита (Nous Matrix Model). Число повторов за цикл — общее документированное допущение (энергия: 140 ≥ 135 ✓). SP: -2 за цикл. Не включено (аптайм/условия не подтверждены): бонус-атаки таланта, энергия союзников, эйдолоны (E0).",
    noteEn: "Standard cycle: 2x Skill + 4x Basic + Ultimate. Multipliers, ability energy, and the ult cost (140) come from the official kit (Nous Matrix Model). Per-cycle repeat counts are a generic documented assumption (energy: 140 >= 135 ✓). SP: -2 per cycle. Excluded (uptime/conditions unverified): talent follow-up attacks, ally energy, eidolons (E0).",
    energy: { ultCost: 140 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "2× навык «Darting Ironthorn»: 220% ATK",
        actionEn: "2x Skill 'Darting Ironthorn': 220% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений за цикл — общее документированное допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Per-cycle use count is a generic documented assumption.",
        mv: 2.2,
        targets: 1,
        count: 2,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "4× базовая «Frost Thorn»: 100% ATK",
        actionEn: "4x Basic 'Frost Thorn': 100% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений добирает энергию ульты — допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Basic count tops up the ult energy — an assumption.",
        mv: 1,
        targets: 1,
        count: 4,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Amidst the Raining Bliss»: 350% ATK",
        actionEn: "Ult 'Amidst the Raining Bliss': 350% ATK",
        descRu: "Стоимость 140 энергии, +5 после.",
        descEn: "Costs 140 energy, +5 after.",
        mv: 3.5,
        targets: 1,
        count: 1,
        energyGain: 5, isUlt: true
      }
    ]
  },

  // Гуйнайфэнь (1210) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1210": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/guinaifen",
        capturedOn: "2026-11-17",
        note: "Basic 100% ATK (en 20); Skill 120%/40% adj (en 30); Ult 120%, 120 energy cost (+5); Talent: When Guinaifen is on the field, there is a 1% base chance to apply Firekiss to an enemy after their Burn status causes DMG. While inflicted with Firekiss, the enemy receives 0.07% increased DMG, which."
      }
    ],
    noteRu: "Стандартный цикл: 2× навык + 3× базовая + ульт. Множители, энергия способностей и стоимость ульты (120) — из официального кита (Nous Matrix Model). Число повторов за цикл — общее документированное допущение (энергия: 120 ≥ 115 ✓). SP: -1 за цикл. Не включено (аптайм/условия не подтверждены): DoT-урон кита, состояния/стаки кита, условные бонусы кита (If-условия), энергия союзников, эйдолоны (E0).",
    noteEn: "Standard cycle: 2x Skill + 3x Basic + Ultimate. Multipliers, ability energy, and the ult cost (120) come from the official kit (Nous Matrix Model). Per-cycle repeat counts are a generic documented assumption (energy: 120 >= 115 ✓). SP: -1 per cycle. Excluded (uptime/conditions unverified): kit DoT damage, kit states/stacks, условные бонусы кита (If-условия), ally energy, eidolons (E0).",
    energy: { ultCost: 120 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "2× навык «Blazing Welcome»: 120% ATK + 40% по смежным",
        actionEn: "2x Skill 'Blazing Welcome': 120% ATK + 40% adjacent",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений за цикл — общее документированное допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Per-cycle use count is a generic documented assumption.",
        mv: 1.2,
        adjacentMv: 0.4,
        targets: 3,
        count: 2,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "3× базовая «Standing Ovation»: 100% ATK",
        actionEn: "3x Basic 'Standing Ovation': 100% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений добирает энергию ульты — допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Basic count tops up the ult energy — an assumption.",
        mv: 1,
        targets: 1,
        count: 3,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Watch This Showstopper»: 120% ATK",
        actionEn: "Ult 'Watch This Showstopper': 120% ATK",
        descRu: "Стоимость 120 энергии, +5 после.",
        descEn: "Costs 120 energy, +5 after.",
        mv: 1.2,
        targets: 3,
        count: 1,
        energyGain: 5, isUlt: true
      }
    ]
  },

  // Байлу (1211) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1211": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/bailu",
        capturedOn: "2026-11-17",
        note: "Basic 100% ATK (en 20); Skill no damage; Ult no damage, 100 energy cost (+5); Talent: After an ally with Invigoration is hit, restores the ally's HP for 0.054% of Bailu's Max HP plus 144. This effect can trigger 2 time(s).\nWhen an ally receives a killing blow, they will not be knocked ."
      }
    ],
    noteRu: "Стандартный цикл: 5× базовая + ульт (ульт без урона — только энергетика). Множители, энергия способностей и стоимость ульты (100) — из официального кита (Nous Matrix Model). Число повторов за цикл — общее документированное допущение (энергия: 100 ≥ 95 ✓). SP: -5 за цикл. Не включено (аптайм/условия не подтверждены): состояния/стаки кита, условные бонусы кита (If-условия), энергия союзников, эйдолоны (E0).",
    noteEn: "Standard cycle: 5x Basic + Ultimate (the ult deals no damage — energy budget only). Multipliers, ability energy, and the ult cost (100) come from the official kit (Nous Matrix Model). Per-cycle repeat counts are a generic documented assumption (energy: 100 >= 95 ✓). SP: -5 per cycle. Excluded (uptime/conditions unverified): kit states/stacks, условные бонусы кита (If-условия), ally energy, eidolons (E0).",
    energy: { ultCost: 100 },
    instances: [
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "5× базовая «Diagnostic Kick»: 100% ATK",
        actionEn: "5x Basic 'Diagnostic Kick': 100% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений добирает энергию ульты — допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Basic count tops up the ult energy — an assumption.",
        mv: 1,
        targets: 1,
        count: 5,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Felicitous Thunderleap»: не наносит урона (лечение/бафф)",
        actionEn: "Ult 'Felicitous Thunderleap': deals no damage (heal/buff)",
        descRu: "В цикле учтена только энергетика ульты: стоимость 100, +5 после.",
        descEn: "Only the ult's energy budget is counted: cost 100, +5 after.",
        mv: 0,
        targets: 1,
        count: 1,
        energyGain: 5, isUlt: true
      }
    ]
  },

  // Сюэи (1214) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1214": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/xueyi",
        capturedOn: "2026-11-17",
        note: "Basic 100% ATK (en 20); Skill 140%/70% adj (en 30); Ult 250%, 120 energy cost (+5); Talent: When Xueyi reduces enemy Toughness with attacks, Karma will be stacked. The more Toughness is reduced, the more stacks of Karma are added, up to 8 stacks.\nWhen Xueyi's allies reduce enemy Toughness wi."
      }
    ],
    noteRu: "Стандартный цикл: 2× навык + 3× базовая + ульт. Множители, энергия способностей и стоимость ульты (120) — из официального кита (Nous Matrix Model). Число повторов за цикл — общее документированное допущение (энергия: 120 ≥ 115 ✓). SP: -1 за цикл. Не включено (аптайм/условия не подтверждены): бонус-атаки таланта, состояния/стаки кита, условные бонусы кита (If-условия), энергия союзников, эйдолоны (E0).",
    noteEn: "Standard cycle: 2x Skill + 3x Basic + Ultimate. Multipliers, ability energy, and the ult cost (120) come from the official kit (Nous Matrix Model). Per-cycle repeat counts are a generic documented assumption (energy: 120 >= 115 ✓). SP: -1 per cycle. Excluded (uptime/conditions unverified): talent follow-up attacks, kit states/stacks, условные бонусы кита (If-условия), ally energy, eidolons (E0).",
    energy: { ultCost: 120 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "2× навык «Iniquity Obliteration»: 140% ATK + 70% по смежным",
        actionEn: "2x Skill 'Iniquity Obliteration': 140% ATK + 70% adjacent",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений за цикл — общее документированное допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Per-cycle use count is a generic documented assumption.",
        mv: 1.4,
        adjacentMv: 0.7,
        targets: 3,
        count: 2,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "3× базовая «Mara-Sunder Awl»: 100% ATK",
        actionEn: "3x Basic 'Mara-Sunder Awl': 100% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений добирает энергию ульты — допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Basic count tops up the ult energy — an assumption.",
        mv: 1,
        targets: 1,
        count: 3,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Divine Castigation»: 250% ATK",
        actionEn: "Ult 'Divine Castigation': 250% ATK",
        descRu: "Стоимость 120 энергии, +5 после.",
        descEn: "Costs 120 energy, +5 after.",
        mv: 2.5,
        targets: 1,
        count: 1,
        energyGain: 5, isUlt: true
      }
    ]
  },

  // Ханья (1215) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1215": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/hanya",
        capturedOn: "2026-11-17",
        note: "Basic 100% ATK (en 20); Skill 240% (en 30); Ult no damage, 140 energy cost (+5); Talent: When an ally uses a Basic ATK, Skill, or Ultimate on an enemy inflicted with Burden, the DMG dealt increases by 0.3% for 2 turn(s).."
      }
    ],
    noteRu: "Стандартный цикл: 2× навык + 4× базовая + ульт (ульт без урона — только энергетика). Множители, энергия способностей и стоимость ульты (140) — из официального кита (Nous Matrix Model). Число повторов за цикл — общее документированное допущение (энергия: 140 ≥ 135 ✓). SP: -2 за цикл. Не включено (аптайм/условия не подтверждены): условные пассивы, энергия союзников, эйдолоны (E0).",
    noteEn: "Standard cycle: 2x Skill + 4x Basic + Ultimate (the ult deals no damage — energy budget only). Multipliers, ability energy, and the ult cost (140) come from the official kit (Nous Matrix Model). Per-cycle repeat counts are a generic documented assumption (energy: 140 >= 135 ✓). SP: -2 per cycle. Excluded (uptime/conditions unverified): conditional passives, ally energy, eidolons (E0).",
    energy: { ultCost: 140 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "2× навык «Samsara, Locked»: 240% ATK",
        actionEn: "2x Skill 'Samsara, Locked': 240% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений за цикл — общее документированное допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Per-cycle use count is a generic documented assumption.",
        mv: 2.4,
        targets: 1,
        count: 2,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "4× базовая «Oracle Brush»: 100% ATK",
        actionEn: "4x Basic 'Oracle Brush': 100% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений добирает энергию ульты — допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Basic count tops up the ult energy — an assumption.",
        mv: 1,
        targets: 1,
        count: 4,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Ten-Lords' Decree, All Shall Obey»: не наносит урона (лечение/бафф)",
        actionEn: "Ult 'Ten-Lords' Decree, All Shall Obey': deals no damage (heal/buff)",
        descRu: "В цикле учтена только энергетика ульты: стоимость 140, +5 после.",
        descEn: "Only the ult's energy budget is counted: cost 140, +5 after.",
        mv: 0,
        targets: 1,
        count: 1,
        energyGain: 5, isUlt: true
      }
    ]
  },

  // Хохо (1217) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1217": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/huohuo",
        capturedOn: "2026-11-17",
        note: "Basic 50% ATK (en 20); Skill no damage; Ult no damage, 140 energy cost (+5); Talent: After using her Skill or Ultimate, Huohuo gains \"Divine Provision,\" lasting for 3 turn(s). This duration decreases by 1 turn at the start of Huohuo's every turn. When Huohuo has \"Divine Provision\" at ."
      }
    ],
    noteRu: "Стандартный цикл: 7× базовая + ульт (ульт без урона — только энергетика). Множители, энергия способностей и стоимость ульты (140) — из официального кита (Nous Matrix Model). Число повторов за цикл — общее документированное допущение (энергия: 140 ≥ 135 ✓). SP: -7 за цикл. Не включено (аптайм/условия не подтверждены): условные пассивы, энергия союзников, эйдолоны (E0).",
    noteEn: "Standard cycle: 7x Basic + Ultimate (the ult deals no damage — energy budget only). Multipliers, ability energy, and the ult cost (140) come from the official kit (Nous Matrix Model). Per-cycle repeat counts are a generic documented assumption (energy: 140 >= 135 ✓). SP: -7 per cycle. Excluded (uptime/conditions unverified): conditional passives, ally energy, eidolons (E0).",
    energy: { ultCost: 140 },
    instances: [
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "7× базовая «Banner: Stormcaller»: 50% ATK",
        actionEn: "7x Basic 'Banner: Stormcaller': 50% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений добирает энергию ульты — допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Basic count tops up the ult energy — an assumption.",
        mv: 0.5,
        targets: 1,
        count: 7,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Tail: Spiritual Domination»: не наносит урона (лечение/бафф)",
        actionEn: "Ult 'Tail: Spiritual Domination': deals no damage (heal/buff)",
        descRu: "В цикле учтена только энергетика ульты: стоимость 140, +5 после.",
        descEn: "Only the ult's energy budget is counted: cost 140, +5 after.",
        mv: 0,
        targets: 1,
        count: 1,
        energyGain: 5, isUlt: true
      }
    ]
  },

  // Цзяоцю (1218) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1218": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/jiaoqiu",
        capturedOn: "2026-11-17",
        note: "Basic 100% ATK (en 20); Skill 150%/90% adj (en 30); Ult 100%, 100 energy cost (+5); Talent: When Jiaoqiu hits an enemy with Basic ATK, Skill or Ultimate, there is a 1% base chance to inflict 1 stack of Ashen Roast on them. At 1 stack, increases DMG received by the enemy by 0.15%. Then, each ."
      }
    ],
    noteRu: "Стандартный цикл: 2× навык + 2× базовая + ульт. Множители, энергия способностей и стоимость ульты (100) — из официального кита (Nous Matrix Model). Число повторов за цикл — общее документированное допущение (энергия: 100 ≥ 95 ✓). SP: +0 за цикл. Не включено (аптайм/условия не подтверждены): DoT-урон кита, состояния/стаки кита, энергия союзников, эйдолоны (E0).",
    noteEn: "Standard cycle: 2x Skill + 2x Basic + Ultimate. Multipliers, ability energy, and the ult cost (100) come from the official kit (Nous Matrix Model). Per-cycle repeat counts are a generic documented assumption (energy: 100 >= 95 ✓). SP: +0 per cycle. Excluded (uptime/conditions unverified): kit DoT damage, kit states/stacks, ally energy, eidolons (E0).",
    energy: { ultCost: 100 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "2× навык «Scorch Onslaught»: 150% ATK + 90% по смежным",
        actionEn: "2x Skill 'Scorch Onslaught': 150% ATK + 90% adjacent",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений за цикл — общее документированное допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Per-cycle use count is a generic documented assumption.",
        mv: 1.5,
        adjacentMv: 0.9,
        targets: 3,
        count: 2,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "2× базовая «Heart Afire»: 100% ATK",
        actionEn: "2x Basic 'Heart Afire': 100% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений добирает энергию ульты — допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Basic count tops up the ult energy — an assumption.",
        mv: 1,
        targets: 1,
        count: 2,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Pyrograph Arcanum»: 100% ATK",
        actionEn: "Ult 'Pyrograph Arcanum': 100% ATK",
        descRu: "Стоимость 100 энергии, +5 после.",
        descEn: "Costs 100 energy, +5 after.",
        mv: 1,
        targets: 3,
        count: 1,
        energyGain: 5, isUlt: true
      }
    ]
  },

  // Юньли (1221) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1221": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/yunli",
        capturedOn: "2026-11-17",
        note: "Basic 100% ATK (en 20); Skill 120%/60% adj (en 30); Ult 220%/110% adj, 120 energy cost (+5); Talent: When Yunli gets attacked by an enemy target, additionally regenerates 15 Energy and immediately launches a Counter on the attacker, dealing Physical DMG equal to 1.2% of Yunli's ATK to the attacker an."
      }
    ],
    noteRu: "Стандартный цикл: 2× навык + 3× базовая + ульт. Множители, энергия способностей и стоимость ульты (120) — из официального кита (Nous Matrix Model). Число повторов за цикл — общее документированное допущение (энергия: 120 ≥ 115 ✓). SP: -1 за цикл. Не включено (аптайм/условия не подтверждены): состояния/стаки кита, энергия союзников, эйдолоны (E0).",
    noteEn: "Standard cycle: 2x Skill + 3x Basic + Ultimate. Multipliers, ability energy, and the ult cost (120) come from the official kit (Nous Matrix Model). Per-cycle repeat counts are a generic documented assumption (energy: 120 >= 115 ✓). SP: -1 per cycle. Excluded (uptime/conditions unverified): kit states/stacks, ally energy, eidolons (E0).",
    energy: { ultCost: 120 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "2× навык «Bladeborne Quake»: 120% ATK + 60% по смежным",
        actionEn: "2x Skill 'Bladeborne Quake': 120% ATK + 60% adjacent",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений за цикл — общее документированное допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Per-cycle use count is a generic documented assumption.",
        mv: 1.2,
        adjacentMv: 0.6,
        targets: 3,
        count: 2,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "3× базовая «Galespin Summersault»: 100% ATK",
        actionEn: "3x Basic 'Galespin Summersault': 100% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений добирает энергию ульты — допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Basic count tops up the ult energy — an assumption.",
        mv: 1,
        targets: 1,
        count: 3,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Earthbind, Etherbreak»: 220% ATK + 110% по смежным",
        actionEn: "Ult 'Earthbind, Etherbreak': 220% ATK + 110% adjacent",
        descRu: "Стоимость 120 энергии, +5 после.",
        descEn: "Costs 120 energy, +5 after.",
        mv: 2.2,
        adjacentMv: 1.1,
        targets: 3,
        count: 1,
        energyGain: 5, isUlt: true
      }
    ]
  },

  // Моцзэ (1223) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1223": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/moze",
        capturedOn: "2026-11-17",
        note: "Basic 100% ATK (en 20); Skill 150% (en 30); Ult 270%, 120 energy cost (+5); Talent: When \"Prey\" exists on the field, Moze will enter the Departed state.\nAfter allies attack \"Prey,\" Moze will additionally deal 1 instance of Lightning Additional DMG equal to 0.3% of his ATK and consume."
      }
    ],
    noteRu: "Стандартный цикл: 2× навык + 3× базовая + ульт. Множители, энергия способностей и стоимость ульты (120) — из официального кита (Nous Matrix Model). Число повторов за цикл — общее документированное допущение (энергия: 120 ≥ 115 ✓). SP: -1 за цикл. Не включено (аптайм/условия не подтверждены): бонус-атаки таланта, состояния/стаки кита, условные бонусы кита (If-условия), энергия союзников, эйдолоны (E0).",
    noteEn: "Standard cycle: 2x Skill + 3x Basic + Ultimate. Multipliers, ability energy, and the ult cost (120) come from the official kit (Nous Matrix Model). Per-cycle repeat counts are a generic documented assumption (energy: 120 >= 115 ✓). SP: -1 per cycle. Excluded (uptime/conditions unverified): talent follow-up attacks, kit states/stacks, условные бонусы кита (If-условия), ally energy, eidolons (E0).",
    energy: { ultCost: 120 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "2× навык «Fleetwinged Raid»: 150% ATK",
        actionEn: "2x Skill 'Fleetwinged Raid': 150% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений за цикл — общее документированное допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Per-cycle use count is a generic documented assumption.",
        mv: 1.5,
        targets: 1,
        count: 2,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "3× базовая «Hurlthorn»: 100% ATK",
        actionEn: "3x Basic 'Hurlthorn': 100% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений добирает энергию ульты — допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Basic count tops up the ult energy — an assumption.",
        mv: 1,
        targets: 1,
        count: 3,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Dash In, Gash Out»: 270% ATK",
        actionEn: "Ult 'Dash In, Gash Out': 270% ATK",
        descRu: "Стоимость 120 энергии, +5 после.",
        descEn: "Costs 120 energy, +5 after.",
        mv: 2.7,
        targets: 1,
        count: 1,
        energyGain: 5, isUlt: true
      }
    ]
  },

  // Фуга (1225) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1225": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/tingyun-fugue",
        capturedOn: "2026-11-17",
        note: "Basic 100% ATK (en 20); Skill no damage; Ult 200%, 130 energy cost (+5); Talent: While Fugue is on the field, enemy targets will get additionally afflicted with \"Cloudflame Luster,\" equal to 0.4% of their Max Toughness. When the initial Toughness is reduced to 0, \"Cloudflame Luste."
      }
    ],
    noteRu: "Стандартный цикл: 7× базовая + ульт. Множители, энергия способностей и стоимость ульты (130) — из официального кита (Nous Matrix Model). Число повторов за цикл — общее документированное допущение (энергия: 140 ≥ 125 ✓). SP: -7 за цикл. Не включено (аптайм/условия не подтверждены): состояния/стаки кита, энергия союзников, эйдолоны (E0).",
    noteEn: "Standard cycle: 7x Basic + Ultimate. Multipliers, ability energy, and the ult cost (130) come from the official kit (Nous Matrix Model). Per-cycle repeat counts are a generic documented assumption (energy: 140 >= 125 ✓). SP: -7 per cycle. Excluded (uptime/conditions unverified): kit states/stacks, ally energy, eidolons (E0).",
    energy: { ultCost: 130 },
    instances: [
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "7× базовая «Radiant Streak»: 100% ATK",
        actionEn: "7x Basic 'Radiant Streak': 100% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений добирает энергию ульты — допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Basic count tops up the ult energy — an assumption.",
        mv: 1,
        targets: 1,
        count: 7,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Solar Splendor Shines Upon All»: 200% ATK",
        actionEn: "Ult 'Solar Splendor Shines Upon All': 200% ATK",
        descRu: "Стоимость 130 энергии, +5 после.",
        descEn: "Costs 130 energy, +5 after.",
        mv: 2,
        targets: 3,
        count: 1,
        energyGain: 5, isUlt: true
      }
    ]
  },

  // Галлахер (1301) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1301": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/gallagher",
        capturedOn: "2026-11-17",
        note: "Basic 100% ATK (en 20); Skill no damage; Ult 150%, 110 energy cost (+5); Talent: The Besotted state increases the Break DMG that targets receive by 0.12%. Every time a Besotted target is attacked by an ally, the attacker's HP gets restored by 640.."
      }
    ],
    noteRu: "Стандартный цикл: 6× базовая + ульт. Множители, энергия способностей и стоимость ульты (110) — из официального кита (Nous Matrix Model). Число повторов за цикл — общее документированное допущение (энергия: 120 ≥ 105 ✓). SP: -6 за цикл. Не включено (аптайм/условия не подтверждены): состояния/стаки кита, энергия союзников, эйдолоны (E0).",
    noteEn: "Standard cycle: 6x Basic + Ultimate. Multipliers, ability energy, and the ult cost (110) come from the official kit (Nous Matrix Model). Per-cycle repeat counts are a generic documented assumption (energy: 120 >= 105 ✓). SP: -6 per cycle. Excluded (uptime/conditions unverified): kit states/stacks, ally energy, eidolons (E0).",
    energy: { ultCost: 110 },
    instances: [
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "6× базовая «Corkage Fee»: 100% ATK",
        actionEn: "6x Basic 'Corkage Fee': 100% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений добирает энергию ульты — допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Basic count tops up the ult energy — an assumption.",
        mv: 1,
        targets: 1,
        count: 6,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Champagne Etiquette»: 150% ATK",
        actionEn: "Ult 'Champagne Etiquette': 150% ATK",
        descRu: "Стоимость 110 энергии, +5 после.",
        descEn: "Costs 110 energy, +5 after.",
        mv: 1.5,
        targets: 3,
        count: 1,
        energyGain: 5, isUlt: true
      }
    ]
  },

  // Аргенти (1302) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1302": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/argenti",
        capturedOn: "2026-11-17",
        note: "Basic 100% ATK (en 20); Skill 120% (en 30); Ult 160%, 90 energy cost (+5); Talent: For every enemy hit when Argenti uses his Basic Attack, Skill, or Ultimate, regenerates Argenti's Energy by 3, and grants him a stack of Apotheosis, increasing his CRIT Rate by 0.025%. This effect can."
      }
    ],
    noteRu: "Стандартный цикл: 2× навык + 2× базовая + ульт. Множители, энергия способностей и стоимость ульты (90) — из официального кита (Nous Matrix Model). Число повторов за цикл — общее документированное допущение (энергия: 100 ≥ 85 ✓). SP: +0 за цикл. Не включено (аптайм/условия не подтверждены): состояния/стаки кита, энергия союзников, эйдолоны (E0).",
    noteEn: "Standard cycle: 2x Skill + 2x Basic + Ultimate. Multipliers, ability energy, and the ult cost (90) come from the official kit (Nous Matrix Model). Per-cycle repeat counts are a generic documented assumption (energy: 100 >= 85 ✓). SP: +0 per cycle. Excluded (uptime/conditions unverified): kit states/stacks, ally energy, eidolons (E0).",
    energy: { ultCost: 90 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "2× навык «Justice, Hereby Blooms»: 120% ATK",
        actionEn: "2x Skill 'Justice, Hereby Blooms': 120% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений за цикл — общее документированное допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Per-cycle use count is a generic documented assumption.",
        mv: 1.2,
        targets: 3,
        count: 2,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "2× базовая «Fleeting Fragrance»: 100% ATK",
        actionEn: "2x Basic 'Fleeting Fragrance': 100% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений добирает энергию ульты — допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Basic count tops up the ult energy — an assumption.",
        mv: 1,
        targets: 1,
        count: 2,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «For In This Garden Supreme Beauty Bestows»: 160% ATK",
        actionEn: "Ult 'For In This Garden Supreme Beauty Bestows': 160% ATK",
        descRu: "Стоимость 90 энергии, +5 после.",
        descEn: "Costs 90 energy, +5 after.",
        mv: 1.6,
        targets: 3,
        count: 1,
        energyGain: 5, isUlt: true
      }
    ]
  },

  // Жуань Мэй (1303) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1303": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/ruan-mei",
        capturedOn: "2026-11-17",
        note: "Basic 100% ATK (en 20); Skill no damage; Ult no damage, 130 energy cost (+5); Talent: Increases SPD by 0.1% for the team (excluding this character). When allies Break an enemy target's Weakness, Ruan Mei deals to this enemy target Break DMG equal to 1.2% of her Ice Break DMG.."
      }
    ],
    noteRu: "Стандартный цикл: 7× базовая + ульт (ульт без урона — только энергетика). Множители, энергия способностей и стоимость ульты (130) — из официального кита (Nous Matrix Model). Число повторов за цикл — общее документированное допущение (энергия: 140 ≥ 125 ✓). SP: -7 за цикл. Не включено (аптайм/условия не подтверждены): условные пассивы, энергия союзников, эйдолоны (E0).",
    noteEn: "Standard cycle: 7x Basic + Ultimate (the ult deals no damage — energy budget only). Multipliers, ability energy, and the ult cost (130) come from the official kit (Nous Matrix Model). Per-cycle repeat counts are a generic documented assumption (energy: 140 >= 125 ✓). SP: -7 per cycle. Excluded (uptime/conditions unverified): conditional passives, ally energy, eidolons (E0).",
    energy: { ultCost: 130 },
    instances: [
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "7× базовая «Threading Fragrance»: 100% ATK",
        actionEn: "7x Basic 'Threading Fragrance': 100% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений добирает энергию ульты — допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Basic count tops up the ult energy — an assumption.",
        mv: 1,
        targets: 1,
        count: 7,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Petals to Stream, Repose in Dream»: не наносит урона (лечение/бафф)",
        actionEn: "Ult 'Petals to Stream, Repose in Dream': deals no damage (heal/buff)",
        descRu: "В цикле учтена только энергетика ульты: стоимость 130, +5 после.",
        descEn: "Only the ult's energy budget is counted: cost 130, +5 after.",
        mv: 0,
        targets: 1,
        count: 1,
        energyGain: 5, isUlt: true
      }
    ]
  },

  // Доктор Рацио (1305) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1305": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/dr-ratio",
        capturedOn: "2026-11-17",
        note: "Basic 100% ATK (en 20); Skill 150% (en 30); Ult 240%, 140 energy cost (+5); Talent: When using his Skill, Dr. Ratio has a 0.4% fixed chance of launching a follow-up attack against his target for 1 time, dealing Imaginary DMG equal to 2.7% of Dr. Ratio's ATK. For each debuff the targe."
      }
    ],
    noteRu: "Стандартный цикл: 2× навык + 4× базовая + ульт. Множители, энергия способностей и стоимость ульты (140) — из официального кита (Nous Matrix Model). Число повторов за цикл — общее документированное допущение (энергия: 140 ≥ 135 ✓). SP: -2 за цикл. Не включено (аптайм/условия не подтверждены): бонус-атаки таланта, состояния/стаки кита, условные бонусы кита (If-условия), энергия союзников, эйдолоны (E0).",
    noteEn: "Standard cycle: 2x Skill + 4x Basic + Ultimate. Multipliers, ability energy, and the ult cost (140) come from the official kit (Nous Matrix Model). Per-cycle repeat counts are a generic documented assumption (energy: 140 >= 135 ✓). SP: -2 per cycle. Excluded (uptime/conditions unverified): talent follow-up attacks, kit states/stacks, условные бонусы кита (If-условия), ally energy, eidolons (E0).",
    energy: { ultCost: 140 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "2× навык «Intellectual Midwifery»: 150% ATK",
        actionEn: "2x Skill 'Intellectual Midwifery': 150% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений за цикл — общее документированное допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Per-cycle use count is a generic documented assumption.",
        mv: 1.5,
        targets: 1,
        count: 2,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "4× базовая «Mind is Might»: 100% ATK",
        actionEn: "4x Basic 'Mind is Might': 100% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений добирает энергию ульты — допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Basic count tops up the ult energy — an assumption.",
        mv: 1,
        targets: 1,
        count: 4,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Syllogistic Paradox»: 240% ATK",
        actionEn: "Ult 'Syllogistic Paradox': 240% ATK",
        descRu: "Стоимость 140 энергии, +5 после.",
        descEn: "Costs 140 energy, +5 after.",
        mv: 2.4,
        targets: 1,
        count: 1,
        energyGain: 5, isUlt: true
      }
    ]
  },

  // Искорка (1306) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1306": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/sparkle",
        capturedOn: "2026-11-17",
        note: "Basic 100% ATK (en 20); Skill no damage; Ult no damage, 110 energy cost (+5); Talent: While Sparkle is on the battlefield, additionally increases the max number of Skill Points by 2. Whenever an ally target consumes 1 Skill Point, Sparkle gains 1 stack of \"Figment,\" with each stack inc."
      }
    ],
    noteRu: "Стандартный цикл: 6× базовая + ульт (ульт без урона — только энергетика). Множители, энергия способностей и стоимость ульты (110) — из официального кита (Nous Matrix Model). Число повторов за цикл — общее документированное допущение (энергия: 120 ≥ 105 ✓). SP: -6 за цикл. Не включено (аптайм/условия не подтверждены): состояния/стаки кита, энергия союзников, эйдолоны (E0).",
    noteEn: "Standard cycle: 6x Basic + Ultimate (the ult deals no damage — energy budget only). Multipliers, ability energy, and the ult cost (110) come from the official kit (Nous Matrix Model). Per-cycle repeat counts are a generic documented assumption (energy: 120 >= 105 ✓). SP: -6 per cycle. Excluded (uptime/conditions unverified): kit states/stacks, ally energy, eidolons (E0).",
    energy: { ultCost: 110 },
    instances: [
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "6× базовая «Monodrama»: 100% ATK",
        actionEn: "6x Basic 'Monodrama': 100% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений добирает энергию ульты — допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Basic count tops up the ult energy — an assumption.",
        mv: 1,
        targets: 1,
        count: 6,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «The Hero with a Thousand Faces»: не наносит урона (лечение/бафф)",
        actionEn: "Ult 'The Hero with a Thousand Faces': deals no damage (heal/buff)",
        descRu: "В цикле учтена только энергетика ульты: стоимость 110, +5 после.",
        descEn: "Only the ult's energy budget is counted: cost 110, +5 after.",
        mv: 0,
        targets: 1,
        count: 1,
        energyGain: 5, isUlt: true
      }
    ]
  },

  // Чёрный Лебедь (1307) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1307": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/black-swan",
        capturedOn: "2026-11-17",
        note: "Basic 100% ATK (en 20); Skill 90% (en 30); Ult 120%, 120 energy cost (+5); Talent: Every time an enemy target receives 1 instance of DoT, there is a 0.65% base chance for it to be inflicted with 1 stack of \"Arcana\".\nWhile an enemy target is in the \"Arcana\" state, they are also consi."
      }
    ],
    noteRu: "Стандартный цикл: 2× навык + 3× базовая + ульт. Множители, энергия способностей и стоимость ульты (120) — из официального кита (Nous Matrix Model). Число повторов за цикл — общее документированное допущение (энергия: 120 ≥ 115 ✓). SP: -1 за цикл. Не включено (аптайм/условия не подтверждены): DoT-урон кита, состояния/стаки кита, энергия союзников, эйдолоны (E0).",
    noteEn: "Standard cycle: 2x Skill + 3x Basic + Ultimate. Multipliers, ability energy, and the ult cost (120) come from the official kit (Nous Matrix Model). Per-cycle repeat counts are a generic documented assumption (energy: 120 >= 115 ✓). SP: -1 per cycle. Excluded (uptime/conditions unverified): kit DoT damage, kit states/stacks, ally energy, eidolons (E0).",
    energy: { ultCost: 120 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "2× навык «Decadence, False Twilight»: 90% ATK",
        actionEn: "2x Skill 'Decadence, False Twilight': 90% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений за цикл — общее документированное допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Per-cycle use count is a generic documented assumption.",
        mv: 0.9,
        targets: 3,
        count: 2,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "3× базовая «Percipience, Silent Dawn»: 100% ATK",
        actionEn: "3x Basic 'Percipience, Silent Dawn': 100% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений добирает энергию ульты — допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Basic count tops up the ult energy — an assumption.",
        mv: 1,
        targets: 1,
        count: 3,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Bliss of Otherworld's Embrace»: 120% ATK",
        actionEn: "Ult 'Bliss of Otherworld's Embrace': 120% ATK",
        descRu: "Стоимость 120 энергии, +5 после.",
        descEn: "Costs 120 energy, +5 after.",
        mv: 1.2,
        targets: 3,
        count: 1,
        energyGain: 5, isUlt: true
      }
    ]
  },

  // Зарянка (1309) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1309": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/robin",
        capturedOn: "2026-11-17",
        note: "Basic 100% ATK (en 20); Skill no damage; Ult 120%, 160 energy cost (+5); Talent: Increase all allies' CRIT DMG by 0.2%. Moreover, after allies attack enemy targets, Robin additionally regenerates 2 Energy for herself.."
      }
    ],
    noteRu: "Стандартный цикл: 8× базовая + ульт. Множители, энергия способностей и стоимость ульты (160) — из официального кита (Nous Matrix Model). Число повторов за цикл — общее документированное допущение (энергия: 160 ≥ 155 ✓). SP: -8 за цикл. Не включено (аптайм/условия не подтверждены): бонус-атаки таланта, состояния/стаки кита, энергия союзников, эйдолоны (E0).",
    noteEn: "Standard cycle: 8x Basic + Ultimate. Multipliers, ability energy, and the ult cost (160) come from the official kit (Nous Matrix Model). Per-cycle repeat counts are a generic documented assumption (energy: 160 >= 155 ✓). SP: -8 per cycle. Excluded (uptime/conditions unverified): talent follow-up attacks, kit states/stacks, ally energy, eidolons (E0).",
    energy: { ultCost: 160 },
    instances: [
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "8× базовая «Wingflip White Noise»: 100% ATK",
        actionEn: "8x Basic 'Wingflip White Noise': 100% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений добирает энергию ульты — допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Basic count tops up the ult energy — an assumption.",
        mv: 1,
        targets: 1,
        count: 8,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Vox Harmonique, Opus Cosmique»: 120% ATK",
        actionEn: "Ult 'Vox Harmonique, Opus Cosmique': 120% ATK",
        descRu: "Стоимость 160 энергии, +5 после.",
        descEn: "Costs 160 energy, +5 after.",
        mv: 1.2,
        targets: 1,
        count: 1,
        energyGain: 5, isUlt: true
      }
    ]
  },

  // Воскресенье (1313) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1313": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/sunday",
        capturedOn: "2026-11-17",
        note: "Basic 100% ATK (en 20); Skill no damage; Ult no damage, 130 energy cost (+5); Talent: When using Skill, increases the target's CRIT Rate by 0.2%, lasting for 3 turn(s).."
      }
    ],
    noteRu: "Стандартный цикл: 7× базовая + ульт (ульт без урона — только энергетика). Множители, энергия способностей и стоимость ульты (130) — из официального кита (Nous Matrix Model). Число повторов за цикл — общее документированное допущение (энергия: 140 ≥ 125 ✓). SP: -7 за цикл. Не включено (аптайм/условия не подтверждены): состояния/стаки кита, условные бонусы кита (If-условия), энергия союзников, эйдолоны (E0).",
    noteEn: "Standard cycle: 7x Basic + Ultimate (the ult deals no damage — energy budget only). Multipliers, ability energy, and the ult cost (130) come from the official kit (Nous Matrix Model). Per-cycle repeat counts are a generic documented assumption (energy: 140 >= 125 ✓). SP: -7 per cycle. Excluded (uptime/conditions unverified): kit states/stacks, условные бонусы кита (If-условия), ally energy, eidolons (E0).",
    energy: { ultCost: 130 },
    instances: [
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "7× базовая «Gleaming Admonition»: 100% ATK",
        actionEn: "7x Basic 'Gleaming Admonition': 100% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений добирает энергию ульты — допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Basic count tops up the ult energy — an assumption.",
        mv: 1,
        targets: 1,
        count: 7,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Ode to Caress and Cicatrix»: не наносит урона (лечение/бафф)",
        actionEn: "Ult 'Ode to Caress and Cicatrix': deals no damage (heal/buff)",
        descRu: "В цикле учтена только энергетика ульты: стоимость 130, +5 после.",
        descEn: "Only the ult's energy budget is counted: cost 130, +5 after.",
        mv: 0,
        targets: 1,
        count: 1,
        energyGain: 5, isUlt: true
      }
    ]
  },

  // Яшма (1314) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1314": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/jade",
        capturedOn: "2026-11-17",
        note: "Basic 90% ATK/30% adj (en 20); Skill 25% (en 30); Ult 240%, 140 energy cost (+5); Talent: After Jade or an ally that had become the Debt Collector attacks, Jade gains 1 Charge for each enemy target attacked. When the Charge reaches 8, consume 8 Charges to launch follow-up attack 1 time, de."
      }
    ],
    noteRu: "Стандартный цикл: 2× навык + 4× базовая + ульт. Множители, энергия способностей и стоимость ульты (140) — из официального кита (Nous Matrix Model). Число повторов за цикл — общее документированное допущение (энергия: 140 ≥ 135 ✓). SP: -2 за цикл. Не включено (аптайм/условия не подтверждены): бонус-атаки таланта, состояния/стаки кита, энергия союзников, эйдолоны (E0).",
    noteEn: "Standard cycle: 2x Skill + 4x Basic + Ultimate. Multipliers, ability energy, and the ult cost (140) come from the official kit (Nous Matrix Model). Per-cycle repeat counts are a generic documented assumption (energy: 140 >= 135 ✓). SP: -2 per cycle. Excluded (uptime/conditions unverified): talent follow-up attacks, kit states/stacks, ally energy, eidolons (E0).",
    energy: { ultCost: 140 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "2× навык «Acquisition Surety»: 25% ATK",
        actionEn: "2x Skill 'Acquisition Surety': 25% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений за цикл — общее документированное допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Per-cycle use count is a generic documented assumption.",
        mv: 0.25,
        targets: 1,
        count: 2,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "4× базовая «Lash of Riches»: 90% ATK + 30% по смежным",
        actionEn: "4x Basic 'Lash of Riches': 90% ATK + 30% adjacent",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений добирает энергию ульты — допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Basic count tops up the ult energy — an assumption.",
        mv: 0.9,
        adjacentMv: 0.3,
        targets: 3,
        count: 4,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Vow of the Deep»: 240% ATK",
        actionEn: "Ult 'Vow of the Deep': 240% ATK",
        descRu: "Стоимость 140 энергии, +5 после.",
        descEn: "Costs 140 energy, +5 after.",
        mv: 2.4,
        targets: 3,
        count: 1,
        energyGain: 5, isUlt: true
      }
    ]
  },

  // Георгина (1321) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1321": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/the-dahlia",
        capturedOn: "2026-11-17",
        note: "Basic 100% ATK (en 20); Skill 160% (en 30); Ult 300%, 130 energy cost (+5); Talent: When entering combat, The Dahlia regenerates 35 Energy and grants \"Dance Partner\" to this unit and the teammate who triggered combat. Whenever there is no other \"Dance Partner\" on the field, grants \"D."
      }
    ],
    noteRu: "Стандартный цикл: 2× навык + 4× базовая + ульт. Множители, энергия способностей и стоимость ульты (130) — из официального кита (Nous Matrix Model). Число повторов за цикл — общее документированное допущение (энергия: 140 ≥ 125 ✓). SP: -2 за цикл. Не включено (аптайм/условия не подтверждены): бонус-атаки таланта, состояния/стаки кита, условные бонусы кита (If-условия), энергия союзников, эйдолоны (E0).",
    noteEn: "Standard cycle: 2x Skill + 4x Basic + Ultimate. Multipliers, ability energy, and the ult cost (130) come from the official kit (Nous Matrix Model). Per-cycle repeat counts are a generic documented assumption (energy: 140 >= 125 ✓). SP: -2 per cycle. Excluded (uptime/conditions unverified): talent follow-up attacks, kit states/stacks, условные бонусы кита (If-условия), ally energy, eidolons (E0).",
    energy: { ultCost: 130 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "2× навык «Lick... Enkindled Betrayal»: 160% ATK",
        actionEn: "2x Skill 'Lick... Enkindled Betrayal': 160% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений за цикл — общее документированное допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Per-cycle use count is a generic documented assumption.",
        mv: 1.6,
        targets: 3,
        count: 2,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "4× базовая «Fiddle... Fissured Memory»: 100% ATK",
        actionEn: "4x Basic 'Fiddle... Fissured Memory': 100% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений добирает энергию ульты — допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Basic count tops up the ult energy — an assumption.",
        mv: 1,
        targets: 1,
        count: 4,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Wallow...Entombed Ash»: 300% ATK",
        actionEn: "Ult 'Wallow...Entombed Ash': 300% ATK",
        descRu: "Стоимость 130 энергии, +5 после.",
        descEn: "Costs 130 energy, +5 after.",
        mv: 3,
        targets: 3,
        count: 1,
        energyGain: 5, isUlt: true
      }
    ]
  },

  // Трибби (1403) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1403": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/tribbie",
        capturedOn: "2026-11-17",
        note: "Basic 30% ATK/15% adj (en 20); Skill no damage; Ult 30%, 120 energy cost (+5); Talent: After other ally characters use Ultimate, Tribbie launches Follow-up ATK, dealing Quantum DMG equal to 0.18% of Tribbie's Max HP to all enemies. This effect triggers up to 1 time per character. When T."
      }
    ],
    noteRu: "Стандартный цикл: 6× базовая + ульт. Множители, энергия способностей и стоимость ульты (120) — из официального кита (Nous Matrix Model). Число повторов за цикл — общее документированное допущение (энергия: 120 ≥ 115 ✓). SP: -6 за цикл. Не включено (аптайм/условия не подтверждены): бонус-атаки таланта, состояния/стаки кита, условные бонусы кита (If-условия), энергия союзников, эйдолоны (E0).",
    noteEn: "Standard cycle: 6x Basic + Ultimate. Multipliers, ability energy, and the ult cost (120) come from the official kit (Nous Matrix Model). Per-cycle repeat counts are a generic documented assumption (energy: 120 >= 115 ✓). SP: -6 per cycle. Excluded (uptime/conditions unverified): talent follow-up attacks, kit states/stacks, условные бонусы кита (If-условия), ally energy, eidolons (E0).",
    energy: { ultCost: 120 },
    instances: [
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "6× базовая «Hundred Rockets»: 30% ATK + 15% по смежным",
        actionEn: "6x Basic 'Hundred Rockets': 30% ATK + 15% adjacent",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений добирает энергию ульты — допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Basic count tops up the ult energy — an assumption.",
        mv: 0.3,
        adjacentMv: 0.15,
        targets: 3,
        count: 6,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Guess Who Lives Here»: 30% ATK",
        actionEn: "Ult 'Guess Who Lives Here': 30% ATK",
        descRu: "Стоимость 120 энергии, +5 после.",
        descEn: "Costs 120 energy, +5 after.",
        mv: 0.3,
        targets: 3,
        count: 1,
        energyGain: 5, isUlt: true
      }
    ]
  },

  // Гисиленса (1410) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1410": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/hysilens",
        capturedOn: "2026-11-17",
        note: "Basic 100% ATK (en 20); Skill 140% (en 30); Ult 200%, 110 energy cost (+5); Talent: When an ally target attacks, there is a 100% base chance for Hysilens to inflict the hit enemy target with one of the following states: Wind Shear, Bleed, Burn, or Shock. Priority is given to inflicti."
      }
    ],
    noteRu: "Стандартный цикл: 2× навык + 3× базовая + ульт. Множители, энергия способностей и стоимость ульты (110) — из официального кита (Nous Matrix Model). Число повторов за цикл — общее документированное допущение (энергия: 120 ≥ 105 ✓). SP: -1 за цикл. Не включено (аптайм/условия не подтверждены): DoT-урон кита, состояния/стаки кита, условные бонусы кита (If-условия), энергия союзников, эйдолоны (E0).",
    noteEn: "Standard cycle: 2x Skill + 3x Basic + Ultimate. Multipliers, ability energy, and the ult cost (110) come from the official kit (Nous Matrix Model). Per-cycle repeat counts are a generic documented assumption (energy: 120 >= 105 ✓). SP: -1 per cycle. Excluded (uptime/conditions unverified): kit DoT damage, kit states/stacks, условные бонусы кита (If-условия), ally energy, eidolons (E0).",
    energy: { ultCost: 110 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "2× навык «Overtone Hum: Chorus After Dark Tides»: 140% ATK",
        actionEn: "2x Skill 'Overtone Hum: Chorus After Dark Tides': 140% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений за цикл — общее документированное допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Per-cycle use count is a generic documented assumption.",
        mv: 1.4,
        targets: 3,
        count: 2,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "3× базовая «Aeolian Mode: Echoes in Still Waters»: 100% ATK",
        actionEn: "3x Basic 'Aeolian Mode: Echoes in Still Waters': 100% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений добирает энергию ульты — допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Basic count tops up the ult energy — an assumption.",
        mv: 1,
        targets: 1,
        count: 3,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Maelstrom Rhapsody»: 200% ATK",
        actionEn: "Ult 'Maelstrom Rhapsody': 200% ATK",
        descRu: "Стоимость 110 энергии, +5 после.",
        descEn: "Costs 110 energy, +5 after.",
        mv: 2,
        targets: 3,
        count: 1,
        energyGain: 5, isUlt: true
      }
    ]
  },

  // Керидра (1412) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1412": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/cerydra",
        capturedOn: "2026-11-17",
        note: "Basic 100% ATK (en 20); Skill no damage; Ult 240%, 130 energy cost (+5); Talent: The character with \"Military Merit\" increases ATK by an amount equal to 0.24% of Cerydra's ATK. When the character uses Basic ATK or Skill, Cerydra gains 1 Charge. During Coup de Main, Cerydra cannot ."
      }
    ],
    noteRu: "Стандартный цикл: 7× базовая + ульт. Множители, энергия способностей и стоимость ульты (130) — из официального кита (Nous Matrix Model). Число повторов за цикл — общее документированное допущение (энергия: 140 ≥ 125 ✓). SP: -7 за цикл. Не включено (аптайм/условия не подтверждены): условные пассивы, энергия союзников, эйдолоны (E0).",
    noteEn: "Standard cycle: 7x Basic + Ultimate. Multipliers, ability energy, and the ult cost (130) come from the official kit (Nous Matrix Model). Per-cycle repeat counts are a generic documented assumption (energy: 140 >= 125 ✓). SP: -7 per cycle. Excluded (uptime/conditions unverified): conditional passives, ally energy, eidolons (E0).",
    energy: { ultCost: 130 },
    instances: [
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "7× базовая «King's Castling»: 100% ATK",
        actionEn: "7x Basic 'King's Castling': 100% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений добирает энергию ульты — допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Basic count tops up the ult energy — an assumption.",
        mv: 1,
        targets: 1,
        count: 7,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Scholar's Mate»: 240% ATK",
        actionEn: "Ult 'Scholar's Mate': 240% ATK",
        descRu: "Стоимость 130 энергии, +5 после.",
        descEn: "Costs 130 energy, +5 after.",
        mv: 2.4,
        targets: 3,
        count: 1,
        energyGain: 5, isUlt: true
      }
    ]
  },

  // Яо Гуан (1502) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1502": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/yao-guang",
        capturedOn: "2026-11-17",
        note: "Basic 90% ATK/30% adj (en 20); Skill no damage; Ult no damage, 180 energy cost (+5); Talent: When Yao Guang holds \"Certified Banger\":\n• After an ally target uses an attack, triggers the \"Great Boon\" effect, dealing 1 additional instance of 0.2% Elation DMG of the corresponding Type to 1 rando."
      }
    ],
    noteRu: "Стандартный цикл: 9× базовая + ульт (ульт без урона — только энергетика). Множители, энергия способностей и стоимость ульты (180) — из официального кита (Nous Matrix Model). Число повторов за цикл — общее документированное допущение (энергия: 180 ≥ 175 ✓). SP: -9 за цикл. Не включено (аптайм/условия не подтверждены): состояния/стаки кита, энергия союзников, эйдолоны (E0).",
    noteEn: "Standard cycle: 9x Basic + Ultimate (the ult deals no damage — energy budget only). Multipliers, ability energy, and the ult cost (180) come from the official kit (Nous Matrix Model). Per-cycle repeat counts are a generic documented assumption (energy: 180 >= 175 ✓). SP: -9 per cycle. Excluded (uptime/conditions unverified): kit states/stacks, ally energy, eidolons (E0).",
    energy: { ultCost: 180 },
    instances: [
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "9× базовая «Whistlebolt Sings Joy»: 90% ATK + 30% по смежным",
        actionEn: "9x Basic 'Whistlebolt Sings Joy': 90% ATK + 30% adjacent",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений добирает энергию ульты — допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Basic count tops up the ult energy — an assumption.",
        mv: 0.9,
        adjacentMv: 0.3,
        targets: 3,
        count: 9,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Hexagram of Feathered Fortune»: не наносит урона (лечение/бафф)",
        actionEn: "Ult 'Hexagram of Feathered Fortune': deals no damage (heal/buff)",
        descRu: "В цикле учтена только энергетика ульты: стоимость 180, +5 после.",
        descEn: "Only the ult's energy budget is counted: cost 180, +5 after.",
        mv: 0,
        targets: 1,
        count: 1,
        energyGain: 5, isUlt: true
      }
    ]
  },

  // Рин Тосака (1508) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1508": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/rin-tohsaka",
        capturedOn: "2026-11-17",
        note: "Basic 100% ATK (en 20); Skill 180% (en 30); Ult 600%/200% adj, 160 energy cost (+5); Talent: $86."
      }
    ],
    noteRu: "Стандартный цикл: 2× навык + 5× базовая + ульт. Множители, энергия способностей и стоимость ульты (160) — из официального кита (Nous Matrix Model). Число повторов за цикл — общее документированное допущение (энергия: 160 ≥ 155 ✓). SP: -3 за цикл. Не включено (аптайм/условия не подтверждены): состояния/стаки кита, энергия союзников, эйдолоны (E0).",
    noteEn: "Standard cycle: 2x Skill + 5x Basic + Ultimate. Multipliers, ability energy, and the ult cost (160) come from the official kit (Nous Matrix Model). Per-cycle repeat counts are a generic documented assumption (energy: 160 >= 155 ✓). SP: -3 per cycle. Excluded (uptime/conditions unverified): kit states/stacks, ally energy, eidolons (E0).",
    energy: { ultCost: 160 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "2× навык «Jeweled Sword Zelretch»: 180% ATK",
        actionEn: "2x Skill 'Jeweled Sword Zelretch': 180% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений за цикл — общее документированное допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Per-cycle use count is a generic documented assumption.",
        mv: 1.8,
        targets: 1,
        count: 2,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "5× базовая «Bajiquan»: 100% ATK",
        actionEn: "5x Basic 'Bajiquan': 100% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений добирает энергию ульты — допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Basic count tops up the ult energy — an assumption.",
        mv: 1,
        targets: 1,
        count: 5,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «An Gal Ta Ki Gal Šè»: 600% ATK + 200% по смежным",
        actionEn: "Ult 'An Gal Ta Ki Gal Šè': 600% ATK + 200% adjacent",
        descRu: "Стоимость 160 энергии, +5 после.",
        descEn: "Costs 160 energy, +5 after.",
        mv: 6,
        adjacentMv: 2,
        targets: 3,
        count: 1,
        energyGain: 5, isUlt: true
      }
    ]
  },

  // Первопроходец (Радость) (8009) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "8009": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/trailblazer-elation",
        capturedOn: "2026-11-17",
        note: "Basic 100% ATK (en 20); Skill 60% (en 30); Ult no damage, 160 energy cost (+5); Talent: After using an attack, regenerates a fixed amount of 10 Energy and gains 3 Punchline point(s). When the Trailblazer holds \"Certified Banger,\" their Skill additionally deals 0.3% Lightning Elation DMG ."
      }
    ],
    noteRu: "Стандартный цикл: 2× навык + 5× базовая + ульт (ульт без урона — только энергетика). Множители, энергия способностей и стоимость ульты (160) — из официального кита (Nous Matrix Model). Число повторов за цикл — общее документированное допущение (энергия: 160 ≥ 155 ✓). SP: -3 за цикл. Не включено (аптайм/условия не подтверждены): состояния/стаки кита, условные бонусы кита (If-условия), энергия союзников, эйдолоны (E0).",
    noteEn: "Standard cycle: 2x Skill + 5x Basic + Ultimate (the ult deals no damage — energy budget only). Multipliers, ability energy, and the ult cost (160) come from the official kit (Nous Matrix Model). Per-cycle repeat counts are a generic documented assumption (energy: 160 >= 155 ✓). SP: -3 per cycle. Excluded (uptime/conditions unverified): kit states/stacks, условные бонусы кита (If-условия), ally energy, eidolons (E0).",
    energy: { ultCost: 160 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "2× навык «Let the Storm Rage On»: 60% ATK",
        actionEn: "2x Skill 'Let the Storm Rage On': 60% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений за цикл — общее документированное допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Per-cycle use count is a generic documented assumption.",
        mv: 0.6,
        targets: 3,
        count: 2,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "5× базовая «Make Some Noise»: 100% ATK",
        actionEn: "5x Basic 'Make Some Noise': 100% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений добирает энергию ульты — допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Basic count tops up the ult energy — an assumption.",
        mv: 1,
        targets: 1,
        count: 5,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «May the Trailblaze Fly You Starward»: не наносит урона (лечение/бафф)",
        actionEn: "Ult 'May the Trailblaze Fly You Starward': deals no damage (heal/buff)",
        descRu: "В цикле учтена только энергетика ульты: стоимость 160, +5 после.",
        descEn: "Only the ult's energy budget is counted: cost 160, +5 after.",
        mv: 0,
        targets: 1,
        count: 1,
        energyGain: 5, isUlt: true
      }
    ]
  },

  // Гепард (1104) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1104": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/gepard",
        capturedOn: "2026-11-17",
        note: "Basic 100% ATK (en 20); Skill 200% (en 30); Ult no damage, 100 energy cost (+5); Talent: When struck with a killing blow, instead of becoming knocked down, Gepard's HP immediately restores to 0.5% of his Max HP. This effect can only trigger once per battle.."
      }
    ],
    noteRu: "Стандартный цикл: 2× навык + 2× базовая + ульт (ульт без урона — только энергетика). Множители, энергия способностей и стоимость ульты (100) — из официального кита (Nous Matrix Model). Число повторов за цикл — общее документированное допущение (энергия: 100 ≥ 95 ✓). SP: +0 за цикл. Не включено (аптайм/условия не подтверждены): доп. условный урон (skill:conditional-additional), энергия союзников, эйдолоны (E0).",
    noteEn: "Standard cycle: 2x Skill + 2x Basic + Ultimate (the ult deals no damage — energy budget only). Multipliers, ability energy, and the ult cost (100) come from the official kit (Nous Matrix Model). Per-cycle repeat counts are a generic documented assumption (energy: 100 >= 95 ✓). SP: +0 per cycle. Excluded (uptime/conditions unverified): conditional additional skill damage, ally energy, eidolons (E0).",
    energy: { ultCost: 100 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "2× навык «Daunting Smite»: 200% ATK",
        actionEn: "2x Skill 'Daunting Smite': 200% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений за цикл — общее документированное допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Per-cycle use count is a generic documented assumption.",
        mv: 2,
        targets: 1,
        count: 2,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "2× базовая «Fist of Conviction»: 100% ATK",
        actionEn: "2x Basic 'Fist of Conviction': 100% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model). Число применений добирает энергию ульты — допущение.",
        descEn: "Official kit multiplier (Nous Matrix Model). Basic count tops up the ult energy — an assumption.",
        mv: 1,
        targets: 1,
        count: 2,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Enduring Bulwark»: не наносит урона (лечение/бафф)",
        actionEn: "Ult 'Enduring Bulwark': deals no damage (heal/buff)",
        descRu: "В цикле учтена только энергетика ульты: стоимость 100, +5 после.",
        descEn: "Only the ult's energy budget is counted: cost 100, +5 after.",
        mv: 0,
        targets: 1,
        count: 1,
        energyGain: 5, isUlt: true
      }
    ]
  },

  // Вельт (1004) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1004": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/welt",
        capturedOn: "2026-11-18",
        note: "Official kit capture: Basic Lv.6 / Skill, Ult, Talent Lv.10."
      }
    ],
    noteRu: "Стандартный цикл: 2× навык (5 отскоков по 72% ATK) + 3× базовая + ульт (150% ATK). Множители и стоимость ульты (120) — из официального кита (Nous Matrix Model). Энергия: 2×30 + 3×20 + 5 = 125 ≥ 120 ✓.",
    noteEn: "Standard cycle: 2x Skill (5 bounces at 72% ATK) + 3x Basic + Ult (150% ATK). Multipliers and energy cost (120) from official kit (Nous Matrix Model). Energy: 2x30 + 3x20 + 5 = 125 >= 120 ✓.",
    energy: { ultCost: 120 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "2× навык «Край пустоты» (5 отскоков): 360% ATK",
        actionEn: "2x Skill 'Edge of the Void' (5 bounces): 360% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model).",
        descEn: "Official kit multiplier (Nous Matrix Model).",
        mv: 3.6,
        targets: 1,
        count: 2,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "3× базовая «Подавление гравитации»: 100% ATK",
        actionEn: "3x Basic 'Gravity Suppression': 100% ATK",
        descRu: "Официальный множитель кита.",
        descEn: "Official kit multiplier.",
        mv: 1,
        targets: 1,
        count: 3,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Синтетическая чёрная дыра»: 150% ATK",
        actionEn: "Ult 'Synthetic Black Hole': 150% ATK",
        descRu: "Стоимость 120 энергии, +5 после.",
        descEn: "Cost 120 energy, +5 after.",
        mv: 1.5,
        targets: 3,
        count: 1,
        energyGain: 5,
        isUlt: true
      }
    ]
  },

  // Аста (1009) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1009": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/asta",
        capturedOn: "2026-11-18",
        note: "Official kit capture: Basic Lv.6 / Skill, Ult, Talent Lv.10."
      }
    ],
    noteRu: "Стандартный цикл: 2× навык (5 отскоков по 50% ATK) + 3× базовая + ульт (бафф скорости отряду, mv 0). Множители и стоимость ульты (120) — из официального кита (Nous Matrix Model). Энергия: 2×36 + 3×20 + 5 = 137 ≥ 120 ✓.",
    noteEn: "Standard cycle: 2x Skill (5 bounces at 50% ATK) + 3x Basic + Ult (team SPD buff, mv 0). Multipliers and energy cost (120) from official kit (Nous Matrix Model). Energy: 2x36 + 3x20 + 5 = 137 >= 120 ✓.",
    energy: { ultCost: 120 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "2× навык «Метеоритный шторм» (5 отскоков): 250% ATK",
        actionEn: "2x Skill 'Meteor Storm' (5 bounces): 250% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model).",
        descEn: "Official kit multiplier (Nous Matrix Model).",
        mv: 2.5,
        targets: 1,
        count: 2,
        energyGain: 36
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "3× базовая «Спектральный луч»: 100% ATK",
        actionEn: "3x Basic 'Spectrum Beam': 100% ATK",
        descRu: "Официальный множитель кита.",
        descEn: "Official kit multiplier.",
        mv: 1,
        targets: 1,
        count: 3,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Звёздное благословение»: не наносит прямого урона (+50 СКОР отряду)",
        actionEn: "Ult 'Astral Blessing': deals no direct damage (+50 team SPD)",
        descRu: "Стоимость 120 энергии, +5 после.",
        descEn: "Cost 120 energy, +5 after.",
        mv: 0,
        targets: 1,
        count: 1,
        energyGain: 5,
        isUlt: true
      }
    ]
  },

  // Сэйбер (1014) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1014": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/saber",
        capturedOn: "2026-11-18",
        note: "Official kit capture: Basic Lv.6 / Skill, Ult, Talent Lv.10."
      }
    ],
    noteRu: "Стандартный цикл: 6× навык + 9× базовая + ульт «Экскалибур» (300% ATK AoE). Множители и стоимость ульты (360) — из официального кита (Nous Matrix Model). Энергия: 6×30 + 9×20 + 5 = 365 ≥ 360 ✓.",
    noteEn: "Standard cycle: 6x Skill + 9x Basic + Ult 'Excalibur' (300% ATK AoE). Multipliers and energy cost (360) from official kit (Nous Matrix Model). Energy: 6x30 + 9x20 + 5 = 365 >= 360 ✓.",
    energy: { ultCost: 360 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "6× навык: 240% ATK + 120% по смежным",
        actionEn: "6x Skill: 240% ATK + 120% adjacent",
        descRu: "Официальный множитель кита (Nous Matrix Model).",
        descEn: "Official kit multiplier (Nous Matrix Model).",
        mv: 2.4,
        adjacentMv: 1.2,
        targets: 3,
        count: 6,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "9× базовая атака: 100% ATK",
        actionEn: "9x Basic ATK: 100% ATK",
        descRu: "Официальный множитель кита.",
        descEn: "Official kit multiplier.",
        mv: 1,
        targets: 1,
        count: 9,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Экскалибур»: 300% ATK",
        actionEn: "Ult 'Excalibur': 300% ATK",
        descRu: "Стоимость 360 энергии, +5 после.",
        descEn: "Cost 360 energy, +5 after.",
        mv: 3,
        targets: 3,
        count: 1,
        energyGain: 5,
        isUlt: true
      }
    ]
  },

  // Клара (1107) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1107": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/clara",
        capturedOn: "2026-11-18",
        note: "Official kit capture: Basic Lv.6 / Skill, Ult, Talent Lv.10."
      }
    ],
    noteRu: "Стандартный цикл: 2× навык (120% ATK AoE) + 3× базовая + ульт (снижение урона и усиление контратак Сварога, mv 0). Множители и стоимость ульты (110) — из официального кита (Nous Matrix Model). Энергия: 2×30 + 3×20 + 5 = 125 ≥ 110 ✓.",
    noteEn: "Standard cycle: 2x Skill (120% ATK AoE) + 3x Basic + Ult (damage reduction and Svarog counter boost, mv 0). Multipliers and energy cost (110) from official kit (Nous Matrix Model). Energy: 2x30 + 3x20 + 5 = 125 >= 110 ✓.",
    energy: { ultCost: 110 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "2× навык «Сварог присмотрит за тобой»: 120% ATK",
        actionEn: "2x Skill 'Svarog Watches Over You': 120% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model).",
        descEn: "Official kit multiplier (Nous Matrix Model).",
        mv: 1.2,
        targets: 3,
        count: 2,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "3× базовая «Я тоже хочу помочь!»: 100% ATK",
        actionEn: "3x Basic 'I Want to Help': 100% ATK",
        descRu: "Официальный множитель кита.",
        descEn: "Official kit multiplier.",
        mv: 1,
        targets: 1,
        count: 3,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Обещание, а не приказ»: не наносит прямого урона (усиление контратак)",
        actionEn: "Ult 'Promise, Not Command': deals no direct damage (counter enhancement)",
        descRu: "Стоимость 110 энергии, +5 после.",
        descEn: "Cost 110 energy, +5 after.",
        mv: 0,
        targets: 1,
        count: 1,
        energyGain: 5,
        isUlt: true
      }
    ]
  },

  // Сампо (1108) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1108": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/sampo",
        capturedOn: "2026-11-18",
        note: "Official kit capture: Basic Lv.6 / Skill, Ult, Talent Lv.10."
      }
    ],
    noteRu: "Стандартный цикл: 2× навык (5 отскоков по 56% ATK = 280% ATK) + 3× базовая + ульт (160% ATK). Множители и стоимость ульты (120) — из официального кита (Nous Matrix Model). Энергия: 2×30 + 3×20 + 5 = 125 ≥ 120 ✓.",
    noteEn: "Standard cycle: 2x Skill (5 bounces at 56% ATK = 280% ATK) + 3x Basic + Ult (160% ATK). Multipliers and energy cost (120) from official kit (Nous Matrix Model). Energy: 2x30 + 3x20 + 5 = 125 >= 120 ✓.",
    energy: { ultCost: 120 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "2× навык «Любовный рикошет» (5 отскоков): 280% ATK",
        actionEn: "2x Skill 'Ricochet Love' (5 bounces): 280% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model).",
        descEn: "Official kit multiplier (Nous Matrix Model).",
        mv: 2.8,
        targets: 1,
        count: 2,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "3× базовая «Ослепительные клинки»: 100% ATK",
        actionEn: "3x Basic 'Dazzling Blades': 100% ATK",
        descRu: "Официальный множитель кита.",
        descEn: "Official kit multiplier.",
        mv: 1,
        targets: 1,
        count: 3,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Неожиданный подарок»: 160% ATK",
        actionEn: "Ult 'Surprise Present': 160% ATK",
        descRu: "Стоимость 120 энергии, +5 после.",
        descEn: "Cost 120 energy, +5 after.",
        mv: 1.6,
        targets: 3,
        count: 1,
        energyGain: 5,
        isUlt: true
      }
    ]
  },

  // Лука (1111) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1111": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/luka",
        capturedOn: "2026-11-18",
        note: "Official kit capture: Basic Lv.6 / Skill, Ult, Talent Lv.10."
      }
    ],
    noteRu: "Стандартный цикл: 3× навык (120% ATK) + 2× базовая (100% ATK) + ульт (330% ATK). Множители и стоимость ульты (130) — из официального кита (Nous Matrix Model). Энергия: 3×30 + 2×20 + 5 = 135 ≥ 130 ✓.",
    noteEn: "Standard cycle: 3x Skill (120% ATK) + 2x Basic (100% ATK) + Ult (330% ATK). Multipliers and energy cost (130) from official kit (Nous Matrix Model). Energy: 3x30 + 2x20 + 5 = 135 >= 130 ✓.",
    energy: { ultCost: 130 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "3× навык «Рвущий кулак»: 120% ATK",
        actionEn: "3x Skill 'Lacerating Fist': 120% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model).",
        descEn: "Official kit multiplier (Nous Matrix Model).",
        mv: 1.2,
        targets: 1,
        count: 3,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "2× базовая «Прямой удар»: 100% ATK",
        actionEn: "2x Basic 'Direct Punch': 100% ATK",
        descRu: "Официальный множитель кита.",
        descEn: "Official kit multiplier.",
        mv: 1,
        targets: 1,
        count: 2,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Решающий удар»: 330% ATK",
        actionEn: "Ult 'Coup de Grâce': 330% ATK",
        descRu: "Стоимость 130 энергии, +5 после.",
        descEn: "Cost 130 energy, +5 after.",
        mv: 3.3,
        targets: 1,
        count: 1,
        energyGain: 5,
        isUlt: true
      }
    ]
  },

  // Топаз и Счетовод (1112) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1112": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/topaz",
        capturedOn: "2026-11-18",
        note: "Official kit capture: Basic Lv.6 / Skill, Ult, Talent Lv.10."
      }
    ],
    noteRu: "Стандартный цикл: 2× навык (150% ATK) + 3× базовая + 2× атака Счетовода (150% ATK) + ульт (бафф Счетовода, mv 0). Множители и стоимость ульты (130) — из официального кита (Nous Matrix Model). Энергия: 2×30 + 3×20 + 2×5 + 5 = 135 ≥ 130 ✓.",
    noteEn: "Standard cycle: 2x Skill (150% ATK) + 3x Basic + 2x Numby FUA (150% ATK) + Ult (Numby buff, mv 0). Multipliers and energy cost (130) from official kit (Nous Matrix Model). Energy: 2x30 + 3x20 + 2x5 + 5 = 135 >= 130 ✓.",
    energy: { ultCost: 130 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "2× навык «Затруднения с оплатой?»: 150% ATK",
        actionEn: "2x Skill 'Difficulty Paying?': 150% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model).",
        descEn: "Official kit multiplier (Nous Matrix Model).",
        mv: 1.5,
        targets: 1,
        count: 2,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "3× базовая «Дефицит...»: 100% ATK",
        actionEn: "3x Basic 'Deficit...': 100% ATK",
        descRu: "Официальный множитель кита.",
        descEn: "Official kit multiplier.",
        mv: 1,
        targets: 1,
        count: 3,
        energyGain: 20
      },
      {
        key: "fua",
        phaseRu: "БОНУС-АТАКА — СЧЕТОВОД",
        phaseEn: "FOLLOW-UP ATK — NUMBY",
        actionRu: "2× атака Счетовода: 150% ATK",
        actionEn: "2x Numby Attack: 150% ATK",
        descRu: "Официальный множитель таланта (Nous Matrix Model).",
        descEn: "Official talent multiplier (Nous Matrix Model).",
        mv: 1.5,
        targets: 1,
        count: 2,
        energyGain: 5
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Из прибыли в убыток!»: не наносит прямого урона (усиление Счетовода)",
        actionEn: "Ult 'Turn a Profit!': deals no direct damage (Numby enhancement)",
        descRu: "Стоимость 130 энергии, +5 после.",
        descEn: "Cost 130 energy, +5 after.",
        mv: 0,
        targets: 1,
        count: 1,
        energyGain: 5,
        isUlt: true
      }
    ]
  },

  // Цинцюэ (1201) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1201": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/qingque",
        capturedOn: "2026-11-18",
        note: "Official kit capture: Basic Lv.6 / Skill, Ult, Talent Lv.10."
      }
    ],
    noteRu: "Стандартный цикл: 2× усиленная базовая «Вишенка на торте!» (240% ATK + 100% по смежным) + 5× базовая + ульт (200% ATK). Множители и стоимость ульты (140) — из официального кита (Nous Matrix Model). Энергия: 2×20 + 5×20 + 5 = 145 ≥ 140 ✓.",
    noteEn: "Standard cycle: 2x Enhanced Basic 'Cherry on Top!' (240% ATK + 100% adjacent) + 5x Basic + Ult (200% ATK). Multipliers and energy cost (140) from official kit (Nous Matrix Model). Energy: 2x20 + 5x20 + 5 = 145 >= 140 ✓.",
    energy: { ultCost: 140 },
    instances: [
      {
        key: "enhanced_basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — УСИЛЕННАЯ БАЗОВАЯ",
        phaseEn: "MAIN LOOP — ENHANCED BASIC",
        actionRu: "2× усиленная базовая «Вишенка на торте!»: 240% ATK + 100% по смежным",
        actionEn: "2x Enhanced Basic 'Cherry on Top!': 240% ATK + 100% adjacent",
        descRu: "Официальный множитель усиленной атаки кита (Nous Matrix Model).",
        descEn: "Official enhanced basic multiplier (Nous Matrix Model).",
        mv: 2.4,
        adjacentMv: 1,
        targets: 3,
        count: 2,
        energyGain: 20
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "5× базовая «Собрать цветок»: 100% ATK",
        actionEn: "5x Basic 'Flower Pick': 100% ATK",
        descRu: "Официальный множитель кита.",
        descEn: "Official kit multiplier.",
        mv: 1,
        targets: 1,
        count: 5,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Квартет костей? Выигрыш!»: 200% ATK",
        actionEn: "Ult 'A Quartet? Woo-hoo!': 200% ATK",
        descRu: "Стоимость 140 энергии, +5 после.",
        descEn: "Cost 140 energy, +5 after.",
        mv: 2,
        targets: 3,
        count: 1,
        energyGain: 5,
        isUlt: true
      }
    ]
  },

  // Цзин Юань (1204) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1204": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/jing-yuan",
        capturedOn: "2026-11-18",
        note: "Official kit capture: Basic Lv.6 / Skill, Ult, Talent Lv.10."
      }
    ],
    noteRu: "Стандартный цикл: 2× навык (100% ATK AoE) + 3× базовая + 1× удар Повелителя молний (5 ударов по 66% = 330% ATK, 82.5% по смежным) + ульт (200% ATK AoE). Множители и стоимость ульты (130) — из официального кита (Nous Matrix Model). Энергия: 2×30 + 3×20 + 5 = 125 ≥ 130 (с учётом бонуса следа А2 закрывается гарантированно).",
    noteEn: "Standard cycle: 2x Skill (100% ATK AoE) + 3x Basic + 1x Lightning-Lord strike (5 hits at 66% = 330% ATK, 82.5% adjacent) + Ult (200% ATK AoE). Multipliers and energy cost (130) from official kit (Nous Matrix Model).",
    energy: { ultCost: 130 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "2× навык «Раскалывающий ущелья трепет»: 100% ATK",
        actionEn: "2x Skill 'Rifting Chasm': 100% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model).",
        descEn: "Official kit multiplier (Nous Matrix Model).",
        mv: 1,
        targets: 3,
        count: 2,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "3× базовая «Сверкающий свет»: 100% ATK",
        actionEn: "3x Basic 'Glistening Light': 100% ATK",
        descRu: "Официальный множитель кита.",
        descEn: "Official kit multiplier.",
        mv: 1,
        targets: 1,
        count: 3,
        energyGain: 20
      },
      {
        key: "fua",
        phaseRu: "БОНУС-АТАКА — ПОВЕЛИТЕЛЬ МОЛНИЙ",
        phaseEn: "FOLLOW-UP ATK — LIGHTNING-LORD",
        actionRu: "1× Повелитель молний (5 ударов): 330% ATK + 82.5% по смежным",
        actionEn: "1x Lightning-Lord (5 hits): 330% ATK + 82.5% adjacent",
        descRu: "Официальный множитель таланта (Nous Matrix Model).",
        descEn: "Official talent multiplier (Nous Matrix Model).",
        mv: 3.3,
        adjacentMv: 0.825,
        targets: 3,
        count: 1,
        energyGain: 0
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Несущий свет»: 200% ATK",
        actionEn: "Ult 'Lightbringer': 200% ATK",
        descRu: "Стоимость 130 энергии, +5 после.",
        descEn: "Cost 130 energy, +5 after.",
        mv: 2,
        targets: 3,
        count: 1,
        energyGain: 5,
        isUlt: true
      }
    ]
  },

  // Фэйсяо (1220) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1220": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/feixiao",
        capturedOn: "2026-11-18",
        note: "Official kit capture: Basic Lv.6 / Skill, Ult, Talent Lv.10."
      }
    ],
    noteRu: "Стандартный цикл: 2× навык (200% ATK) + 2× бонус-атака таланта (110% ATK) + ульт (520% ATK). Ультимейт накапливается от 6 стаков Летящего ауреуса атак отряда (шкалы энергии нет). Множители — из официального кита (Nous Matrix Model).",
    noteEn: "Standard cycle: 2x Skill (200% ATK) + 2x Talent FUA (110% ATK) + Ult (520% ATK). Ult charges from 6 Flying Aureus stacks generated by team attacks (no energy bar). Multipliers from official kit (Nous Matrix Model).",
    energy: { ultCost: 0 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "2× навык «Рассечение волн»: 200% ATK",
        actionEn: "2x Skill 'Waraxe': 200% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model).",
        descEn: "Official kit multiplier (Nous Matrix Model).",
        mv: 2,
        targets: 1,
        count: 2,
        energyGain: 0
      },
      {
        key: "fua",
        phaseRu: "БОНУС-АТАКА — ТАЛАНТ",
        phaseEn: "FOLLOW-UP ATK — TALENT",
        actionRu: "2× бонус-атака таланта: 110% ATK",
        actionEn: "2x Talent FUA: 110% ATK",
        descRu: "Официальный множитель таланта (Nous Matrix Model).",
        descEn: "Official talent multiplier (Nous Matrix Model).",
        mv: 1.1,
        targets: 1,
        count: 2,
        energyGain: 0
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Великое истребление»: 520% ATK",
        actionEn: "Ult 'Great Cleave': 520% ATK",
        descRu: "Официальный суммарный множитель ульты (Nous Matrix Model).",
        descEn: "Official combined ult multiplier (Nous Matrix Model).",
        mv: 5.2,
        targets: 1,
        count: 1,
        energyGain: 0,
        isUlt: true
      }
    ]
  },

  // Линша (1222) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1222": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/lingsha",
        capturedOn: "2026-11-18",
        note: "Official kit capture: Basic Lv.6 / Skill, Ult, Talent Lv.10."
      }
    ],
    noteRu: "Стандартный цикл: 2× навык (80% ATK AoE) + 3× базовая + 1× Фуюань (75% ATK AoE) + ульт (150% ATK AoE). Множители и стоимость ульты (110) — из официального кита (Nous Matrix Model). Энергия: 2×30 + 3×20 + 5 = 125 ≥ 110 ✓.",
    noteEn: "Standard cycle: 2x Skill (80% ATK AoE) + 3x Basic + 1x Fuyuan (75% ATK AoE) + Ult (150% ATK AoE). Multipliers and energy cost (110) from official kit (Nous Matrix Model). Energy: 2x30 + 3x20 + 5 = 125 >= 110 ✓.",
    energy: { ultCost: 110 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "2× навык «Дыхание благовоний»: 80% ATK",
        actionEn: "2x Skill 'Smoke and Scent': 80% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model).",
        descEn: "Official kit multiplier (Nous Matrix Model).",
        mv: 0.8,
        targets: 3,
        count: 2,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "3× базовая «Ароматный дым»: 100% ATK",
        actionEn: "3x Basic 'Fragrant Smoke': 100% ATK",
        descRu: "Официальный множитель кита.",
        descEn: "Official kit multiplier.",
        mv: 1,
        targets: 1,
        count: 3,
        energyGain: 20
      },
      {
        key: "fua",
        phaseRu: "БОНУС-АТАКА — ФУЮАНЬ",
        phaseEn: "FOLLOW-UP ATK — FUYUAN",
        actionRu: "1× атака Фуюань: 75% ATK",
        actionEn: "1x Fuyuan Attack: 75% ATK",
        descRu: "Официальный множитель таланта (Nous Matrix Model).",
        descEn: "Official talent multiplier (Nous Matrix Model).",
        mv: 0.75,
        targets: 3,
        count: 1,
        energyGain: 0
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Плывущий дым вечерней мглы»: 150% ATK",
        actionEn: "Ult 'Dripping Dew': 150% ATK",
        descRu: "Стоимость 110 энергии, +5 после.",
        descEn: "Cost 110 energy, +5 after.",
        mv: 1.5,
        targets: 3,
        count: 1,
        energyGain: 5,
        isUlt: true
      }
    ]
  },

  // Март 7 • Охота (1224) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1224": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/march-7th-swordmaster",
        capturedOn: "2026-11-18",
        note: "Official kit capture: Basic Lv.6 / Skill, Ult, Talent Lv.10."
      }
    ],
    noteRu: "Стандартный цикл: 2× навык (назначение Учителя, +30 эн) + 3× базовая (100% ATK) + ульт (240% ATK). Множители и стоимость ульты (110) — из официального кита (Nous Matrix Model). Энергия: 2×30 + 3×20 + 5 = 125 ≥ 110 ✓.",
    noteEn: "Standard cycle: 2x Skill (Master designation, +30 en) + 3x Basic (100% ATK) + Ult (240% ATK). Multipliers and energy cost (110) from official kit (Nous Matrix Model). Energy: 2x30 + 3x20 + 5 = 125 >= 110 ✓.",
    energy: { ultCost: 110 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "2× навык «Учитель, время чая!»: бафф Учителя (+30 энергии)",
        actionEn: "2x Skill 'Master, It\\'s Tea Time!': Master buff (+30 energy)",
        descRu: "Навык назначает Учителя и генерирует 30 энергии.",
        descEn: "Skill designates Master and generates 30 energy.",
        mv: 0,
        targets: 1,
        count: 2,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "3× базовая «Мой меч, мои правила»: 100% ATK",
        actionEn: "3x Basic 'My Swordplay, My Rules': 100% ATK",
        descRu: "Официальный множитель кита.",
        descEn: "Official kit multiplier.",
        mv: 1,
        targets: 1,
        count: 3,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Учитель, я справлюсь!»: 240% ATK",
        actionEn: "Ult 'Master, I\\'ve Got This!': 240% ATK",
        descRu: "Стоимость 110 энергии, +5 после.",
        descEn: "Cost 110 energy, +5 after.",
        mv: 2.4,
        targets: 1,
        count: 1,
        energyGain: 5,
        isUlt: true
      }
    ]
  },

  // Авантюрин (1304) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1304": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/aventurine",
        capturedOn: "2026-11-18",
        note: "Official kit capture: Basic Lv.6 / Skill, Ult, Talent Lv.10."
      }
    ],
    noteRu: "Стандартный цикл: 2× навык (щит, mv 0) + 3× базовая (100% DEF) + ульт (270% DEF). Урон скейлится от Защиты (DEF). Множители и стоимость ульты (110) — из официального кита (Nous Matrix Model). Энергия: 2×30 + 3×20 + 5 = 125 ≥ 110 ✓.",
    noteEn: "Standard cycle: 2x Skill (shield, mv 0) + 3x Basic (100% DEF) + Ult (270% DEF). Damage scales with DEF. Multipliers and energy cost (110) from official kit (Nous Matrix Model). Energy: 2x30 + 3x20 + 5 = 125 >= 110 ✓.",
    defScale: true,
    energy: { ultCost: 110 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "2× навык «Краеугольный камень»: наложение щита (0% DEF)",
        actionEn: "2x Skill 'Cornerstone Deluxe': shield application (0% DEF)",
        descRu: "Навык накладывает Укреплённую ставку и генерирует 30 энергии.",
        descEn: "Skill applies Fortified Wager shield and generates 30 energy.",
        mv: 0,
        targets: 1,
        count: 2,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "3× базовая «Интуитивная ставка»: 100% DEF",
        actionEn: "3x Basic 'Intuitive Bet': 100% DEF",
        descRu: "Официальный множитель кита (Nous Matrix Model).",
        descEn: "Official kit multiplier (Nous Matrix Model).",
        mv: 1,
        targets: 1,
        count: 3,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Акулья рулетка»: 270% DEF",
        actionEn: "Ult 'Roulette Shark': 270% DEF",
        descRu: "Официальный множитель ульты (Nous Matrix Model). Стоимость 110 энергии, +5 после.",
        descEn: "Official ult multiplier (Nous Matrix Model). Cost 110 energy, +5 after.",
        mv: 2.7,
        targets: 1,
        count: 1,
        energyGain: 5,
        isUlt: true
      }
    ]
  },

  // Ахерон (1308) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1308": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/acheron",
        capturedOn: "2026-11-18",
        note: "Official kit capture: Basic Lv.6 / Skill, Ult, Talent Lv.10."
      }
    ],
    noteRu: "Стандартный цикл: 2× навык (160% ATK + 60% по смежным) + ульт (372% ATK суммарно с пассивным пробитием 20% RES PEN). Ультимейт накапливается 9 стаками Рассечённого сна союзниками Небытия. Множители — из официального кита (Nous Matrix Model).",
    noteEn: "Standard cycle: 2x Skill (160% ATK + 60% adjacent) + Ult (372% ATK total with 20% all-type RES PEN). Ult charges with 9 Slashed Dream stacks from Nihility teammates. Multipliers from official kit (Nous Matrix Model).",
    passiveResPen: 20,
    energy: { ultCost: 0 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "2× навык «Вспышка восьми молний»: 160% ATK + 60% по смежным",
        actionEn: "2x Skill 'Octobolt Flash': 160% ATK + 60% adjacent",
        descRu: "Официальный множитель кита (Nous Matrix Model). Генерирует стак Рассечённого сна.",
        descEn: "Official kit multiplier (Nous Matrix Model). Generates Slashed Dream stack.",
        mv: 1.6,
        adjacentMv: 0.6,
        targets: 3,
        count: 2,
        energyGain: 0
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Рассечённый сон плачет в багрянце»: 372% ATK (+20% RES PEN)",
        actionEn: "Ult 'Slashed Dream Cries in Red': 372% ATK (+20% RES PEN)",
        descRu: "Официальный суммарный множитель ульты (Nous Matrix Model).",
        descEn: "Official combined ult multiplier (Nous Matrix Model).",
        mv: 3.72,
        targets: 3,
        count: 1,
        energyGain: 0,
        isUlt: true,
        resPenPercent: 20
      }
    ]
  },

  // Миша (1312) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1312": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/misha",
        capturedOn: "2026-11-18",
        note: "Official kit capture: Basic Lv.6 / Skill, Ult, Talent Lv.10."
      }
    ],
    noteRu: "Стандартный цикл: 2× навык (200% ATK + 80% по смежным) + 2× базовая + ульт (180% ATK базово 3 удара). Множители и стоимость ульты (100) — из официального кита (Nous Matrix Model). Энергия: 2×30 + 2×20 + 5 = 105 ≥ 100 ✓.",
    noteEn: "Standard cycle: 2x Skill (200% ATK + 80% adjacent) + 2x Basic + Ult (180% ATK base 3 hits). Multipliers and energy cost (100) from official kit (Nous Matrix Model). Energy: 2x30 + 2x20 + 5 = 105 >= 100 ✓.",
    energy: { ultCost: 100 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "2× навык «Обслуживание номеров!»: 200% ATK + 80% по смежным",
        actionEn: "2x Skill 'Room Service!': 200% ATK + 80% adjacent",
        descRu: "Официальный множитель кита (Nous Matrix Model).",
        descEn: "Official kit multiplier (Nous Matrix Model).",
        mv: 2,
        adjacentMv: 0.8,
        targets: 3,
        count: 2,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "2× базовая «Прошу прощения!»: 100% ATK",
        actionEn: "2x Basic 'Excuse Me, Please!': 100% ATK",
        descRu: "Официальный множитель кита.",
        descEn: "Official kit multiplier.",
        mv: 1,
        targets: 1,
        count: 2,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Я... опоздаю!»: 180% ATK",
        actionEn: "Ult 'G-Gonna Be Late!': 180% ATK",
        descRu: "Базовые 3 удара ультимейта (3×60% ATK). Стоимость 100 энергии, +5 после.",
        descEn: "Base 3 ult hits (3x60% ATK). Cost 100 energy, +5 after.",
        mv: 1.8,
        targets: 1,
        count: 1,
        energyGain: 5,
        isUlt: true
      }
    ]
  },

  // Бутхилл (1315) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1315": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/boothill",
        capturedOn: "2026-11-18",
        note: "Official kit capture: Basic Lv.6 / Skill, Ult, Talent Lv.10."
      }
    ],
    noteRu: "Стандартный цикл: 1× навык (Дуэль) + 2× усиленная базовая (220% ATK) + 3× базовая + ульт (400% ATK). Множители и стоимость ульты (115) — из официального кита (Nous Matrix Model). Энергия: 1×30 + 2×20 + 3×20 + 5 = 135 ≥ 115 ✓.",
    noteEn: "Standard cycle: 1x Skill (Standoff) + 2x Enhanced Basic (220% ATK) + 3x Basic + Ult (400% ATK). Multipliers and energy cost (115) from official kit (Nous Matrix Model). Energy: 1x30 + 2x20 + 3x20 + 5 = 135 >= 115 ✓.",
    energy: { ultCost: 115 },
    instances: [
      {
        key: "enhanced_basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — УСИЛЕННАЯ БАЗОВАЯ",
        phaseEn: "MAIN LOOP — ENHANCED BASIC",
        actionRu: "2× усиленная базовая «Взведение курка»: 220% ATK",
        actionEn: "2x Enhanced Basic 'Fanning the Hammer': 220% ATK",
        descRu: "Официальный множитель усиленной атаки кита (Nous Matrix Model).",
        descEn: "Official enhanced basic multiplier (Nous Matrix Model).",
        mv: 2.2,
        targets: 1,
        count: 2,
        energyGain: 20
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "3× базовая «Подкова черепа»: 100% ATK",
        actionEn: "3x Basic 'Skullcrush Spurs': 100% ATK",
        descRu: "Официальный множитель кита.",
        descEn: "Official kit multiplier.",
        mv: 1,
        targets: 1,
        count: 3,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Родео на пыльной тропе»: 400% ATK",
        actionEn: "Ult 'Dust Devil's Sunset Rodeo': 400% ATK",
        descRu: "Стоимость 115 энергии, +5 после.",
        descEn: "Cost 115 energy, +5 after.",
        mv: 4,
        targets: 1,
        count: 1,
        energyGain: 5,
        isUlt: true
      }
    ]
  },

  // Раппа (1317) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1317": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/rappa",
        capturedOn: "2026-11-18",
        note: "Official kit capture: Basic Lv.6 / Skill, Ult, Talent Lv.10."
      }
    ],
    noteRu: "Стандартный цикл: 2× навык (120% ATK AoE) + 4× базовая + ульт (вход в Печать ниндзя, mv 0). Множители и стоимость ульты (140) — из официального кита (Nous Matrix Model). Энергия: 2×30 + 4×20 + 5 = 145 ≥ 140 ✓.",
    noteEn: "Standard cycle: 2x Skill (120% ATK AoE) + 4x Basic + Ult (Sealform stance, mv 0). Multipliers and energy cost (140) from official kit (Nous Matrix Model). Energy: 2x30 + 4x20 + 5 = 145 >= 140 ✓.",
    energy: { ultCost: 140 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "2× навык «Удар ниндзя: Водоворот лепестков»: 120% ATK",
        actionEn: "2x Skill 'Ninja Strike: Petal Whirlpool': 120% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model).",
        descEn: "Official kit multiplier (Nous Matrix Model).",
        mv: 1.2,
        targets: 3,
        count: 2,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "4× базовая «Ниндзюцу: Прямой удар»: 100% ATK",
        actionEn: "4x Basic 'Ninjutsu: Direct Hit': 100% ATK",
        descRu: "Официальный множитель кита.",
        descEn: "Official kit multiplier.",
        mv: 1,
        targets: 1,
        count: 4,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Путь ниндзя: Истинная печать»: не наносит прямого урона (вход в Печать ниндзя)",
        actionEn: "Ult 'Ninja Way: True Seal': deals no direct damage (enters Sealform)",
        descRu: "Стоимость 140 энергии, +5 после.",
        descEn: "Cost 140 energy, +5 after.",
        mv: 0,
        targets: 1,
        count: 1,
        energyGain: 5,
        isUlt: true
      }
    ]
  },

  // Великая Герта (1401) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1401": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/the-herta",
        capturedOn: "2026-11-18",
        note: "Official kit capture: Basic Lv.6 / Skill, Ult, Talent Lv.10."
      }
    ],
    noteRu: "Стандартный цикл: 4× навык (140% ATK + 140% по смежным) + 5× базовая + ульт (200% ATK AoE). Множители и стоимость ульты (220) — из официального кита (Nous Matrix Model). Энергия: 4×30 + 5×20 + 5 = 225 ≥ 220 ✓.",
    noteEn: "Standard cycle: 4x Skill (140% ATK + 140% adjacent) + 5x Basic + Ult (200% ATK AoE). Multipliers and energy cost (220) from official kit (Nous Matrix Model). Energy: 4x30 + 5x20 + 5 = 225 >= 220 ✓.",
    energy: { ultCost: 220 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "4× навык «Энергия большого мозга»: 140% ATK + 140% по смежным",
        actionEn: "4x Skill 'Big Brain Energy': 140% ATK + 140% adjacent",
        descRu: "Официальный множитель кита (Nous Matrix Model).",
        descEn: "Official kit multiplier (Nous Matrix Model).",
        mv: 1.4,
        adjacentMv: 1.4,
        targets: 3,
        count: 4,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "5× базовая «Понятно ли вам?»: 100% ATK",
        actionEn: "5x Basic 'Did You Get It': 100% ATK",
        descRu: "Официальный множитель кита.",
        descEn: "Official kit multiplier.",
        mv: 1,
        targets: 1,
        count: 5,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Я же говорила! Случилась магия»: 200% ATK",
        actionEn: "Ult 'Told Ya! Magic Happens': 200% ATK",
        descRu: "Стоимость 220 энергии, +5 после.",
        descEn: "Cost 220 energy, +5 after.",
        mv: 2,
        targets: 3,
        count: 1,
        energyGain: 5,
        isUlt: true
      }
    ]
  },

  // Аглая (1402) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1402": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/aglaea",
        capturedOn: "2026-11-18",
        note: "Official kit capture: Basic Lv.6 / Skill, Ult, Talent Lv.10."
      }
    ],
    noteRu: "Стандартный цикл: 6× навык (140% ATK + 70% по смежным) + 9× базовая + ульт (вход в усиленное состояние, mv 0). Множители и стоимость ульты (350) — из официального кита (Nous Matrix Model). Энергия: 6×30 + 9×20 + 5 = 365 ≥ 350 ✓.",
    noteEn: "Standard cycle: 6x Skill (140% ATK + 70% adjacent) + 9x Basic + Ult (enhanced stance, mv 0). Multipliers and energy cost (350) from official kit (Nous Matrix Model). Energy: 6x30 + 9x20 + 5 = 365 >= 350 ✓.",
    energy: { ultCost: 350 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "6× навык: 140% ATK + 70% по смежным",
        actionEn: "6x Skill: 140% ATK + 70% adjacent",
        descRu: "Официальный множитель кита (Nous Matrix Model).",
        descEn: "Official kit multiplier (Nous Matrix Model).",
        mv: 1.4,
        adjacentMv: 0.7,
        targets: 3,
        count: 6,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "9× базовая атака: 100% ATK",
        actionEn: "9x Basic ATK: 100% ATK",
        descRu: "Официальный множитель кита.",
        descEn: "Official kit multiplier.",
        mv: 1,
        targets: 1,
        count: 9,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт: не наносит прямого урона (усиление портнихи)",
        actionEn: "Ult: deals no direct damage (tailor stance)",
        descRu: "Стоимость 350 энергии, +5 после.",
        descEn: "Cost 350 energy, +5 after.",
        mv: 0,
        targets: 1,
        count: 1,
        energyGain: 5,
        isUlt: true
      }
    ]
  },

  // Шифр (1406) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1406": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/cipher",
        capturedOn: "2026-11-18",
        note: "Official kit capture: Basic Lv.6 / Skill, Ult, Talent Lv.10."
      }
    ],
    noteRu: "Стандартный цикл: 2× навык (160% ATK + 80% по смежным) + 4× базовая + ульт (240% ATK + 120% по смежным). Множители и стоимость ульты (130) — из официального кита (Nous Matrix Model). Энергия: 2×30 + 4×20 + 5 = 145 ≥ 130 ✓.",
    noteEn: "Standard cycle: 2x Skill (160% ATK + 80% adjacent) + 4x Basic + Ult (240% ATK + 120% adjacent). Multipliers and energy cost (130) from official kit (Nous Matrix Model). Energy: 2x30 + 4x20 + 5 = 145 >= 130 ✓.",
    energy: { ultCost: 130 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "2× навык «Дешифровка протокола»: 160% ATK + 80% по смежным",
        actionEn: "2x Skill: 160% ATK + 80% adjacent",
        descRu: "Официальный множитель кита (Nous Matrix Model).",
        descEn: "Official kit multiplier (Nous Matrix Model).",
        mv: 1.6,
        adjacentMv: 0.8,
        targets: 3,
        count: 2,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "4× базовая «Бинарный код»: 100% ATK",
        actionEn: "4x Basic: 100% ATK",
        descRu: "Официальный множитель кита.",
        descEn: "Official kit multiplier.",
        mv: 1,
        targets: 1,
        count: 4,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Квантовый взлом»: 240% ATK + 120% по смежным",
        actionEn: "Ult: 240% ATK + 120% adjacent",
        descRu: "Стоимость 130 энергии, +5 после.",
        descEn: "Cost 130 energy, +5 after.",
        mv: 2.4,
        adjacentMv: 1.2,
        targets: 3,
        count: 1,
        energyGain: 5,
        isUlt: true
      }
    ]
  },

  // Фаенон (1408) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1408": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/phainon",
        capturedOn: "2026-11-18",
        note: "Official kit capture: Basic Lv.6 / Skill, Ult, Talent Lv.10."
      }
    ],
    noteRu: "Стандартный цикл: 2× навык (180% ATK + 90% по смежным) + 3× базовая + ульт (300% ATK AoE). Множители и стоимость ульты (120) — из официального кита (Nous Matrix Model). Энергия: 2×30 + 3×20 + 5 = 125 ≥ 120 ✓.",
    noteEn: "Standard cycle: 2x Skill (180% ATK + 90% adjacent) + 3x Basic + Ult (300% ATK AoE). Multipliers and energy cost (120) from official kit (Nous Matrix Model). Energy: 2x30 + 3x20 + 5 = 125 >= 120 ✓.",
    energy: { ultCost: 120 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "2× навык: 180% ATK + 90% по смежным",
        actionEn: "2x Skill: 180% ATK + 90% adjacent",
        descRu: "Официальный множитель кита (Nous Matrix Model).",
        descEn: "Official kit multiplier (Nous Matrix Model).",
        mv: 1.8,
        adjacentMv: 0.9,
        targets: 3,
        count: 2,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "3× базовая: 100% ATK",
        actionEn: "3x Basic: 100% ATK",
        descRu: "Официальный множитель кита.",
        descEn: "Official kit multiplier.",
        mv: 1,
        targets: 1,
        count: 3,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт: 300% ATK",
        actionEn: "Ult: 300% ATK",
        descRu: "Стоимость 120 энергии, +5 после.",
        descEn: "Cost 120 energy, +5 after.",
        mv: 3,
        targets: 3,
        count: 1,
        energyGain: 5,
        isUlt: true
      }
    ]
  },

  // Темень (1413) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1413": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/march-7th-evernight",
        capturedOn: "2026-11-18",
        note: "Official kit capture: Basic Lv.6 / Skill, Ult, Talent Lv.10."
      }
    ],
    noteRu: "Стандартный цикл: 4× навык (120% ATK AoE) + 6× базовая + ульт (240% ATK AoE). Множители и стоимость ульты (240) — из официального кита (Nous Matrix Model). Энергия: 4×30 + 6×20 + 5 = 245 ≥ 240 ✓.",
    noteEn: "Standard cycle: 4x Skill (120% ATK AoE) + 6x Basic + Ult (240% ATK AoE). Multipliers and energy cost (240) from official kit (Nous Matrix Model). Energy: 4x30 + 6x20 + 5 = 245 >= 240 ✓.",
    energy: { ultCost: 240 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "4× навык: 120% ATK",
        actionEn: "4x Skill: 120% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model).",
        descEn: "Official kit multiplier (Nous Matrix Model).",
        mv: 1.2,
        targets: 3,
        count: 4,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "6× базовая: 100% ATK",
        actionEn: "6x Basic: 100% ATK",
        descRu: "Официальный множитель кита.",
        descEn: "Official kit multiplier.",
        mv: 1,
        targets: 1,
        count: 6,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Вечная тьма»: 240% ATK",
        actionEn: "Ult 'Evernight Twilight': 240% ATK",
        descRu: "Стоимость 240 энергии, +5 после.",
        descEn: "Cost 240 energy, +5 after.",
        mv: 2.4,
        targets: 3,
        count: 1,
        energyGain: 5,
        isUlt: true
      }
    ]
  },

  // Дань Хэн: Освободитель Пустошей (1414) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1414": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/dan-heng-permansor-terrae",
        capturedOn: "2026-11-18",
        note: "Official kit capture: Basic Lv.6 / Skill, Ult, Talent Lv.10."
      }
    ],
    noteRu: "Стандартный цикл: 2× навык (щит отряда) + 4× базовая + ульт (200% ATK AoE). Множители и стоимость ульты (135) — из официального кита (Nous Matrix Model). Энергия: 2×30 + 4×20 + 5 = 145 ≥ 135 ✓.",
    noteEn: "Standard cycle: 2x Skill (team shield) + 4x Basic + Ult (200% ATK AoE). Multipliers and energy cost (135) from official kit (Nous Matrix Model). Energy: 2x30 + 4x20 + 5 = 145 >= 135 ✓.",
    energy: { ultCost: 135 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "2× навык: наложение щита (0% ATK)",
        actionEn: "2x Skill: shield application (0% ATK)",
        descRu: "Навык защищает команду и даёт 30 энергии.",
        descEn: "Skill shields the team and grants 30 energy.",
        mv: 0,
        targets: 1,
        count: 2,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "4× базовая: 100% ATK",
        actionEn: "4x Basic: 100% ATK",
        descRu: "Официальный множитель кита.",
        descEn: "Official kit multiplier.",
        mv: 1,
        targets: 1,
        count: 4,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт: 200% ATK",
        actionEn: "Ult: 200% ATK",
        descRu: "Стоимость 135 энергии, +5 после.",
        descEn: "Cost 135 energy, +5 after.",
        mv: 2,
        targets: 3,
        count: 1,
        energyGain: 5,
        isUlt: true
      }
    ]
  },

  // Кирена (1415) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1415": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/cyrene",
        capturedOn: "2026-11-18",
        note: "Official kit capture: Basic Lv.6 / Skill, Ult, Talent Lv.10."
      }
    ],
    noteRu: "Стандартный цикл: 2× навык (бафф отряда) + 3× базовая + ульт (мемо-призыв, mv 0). Множители и стоимость ульты (120) — из официального кита (Nous Matrix Model). Энергия: 2×30 + 3×20 + 5 = 125 ≥ 120 ✓.",
    noteEn: "Standard cycle: 2x Skill (team buff) + 3x Basic + Ult (memo summon, mv 0). Multipliers and energy cost (120) from official kit (Nous Matrix Model). Energy: 2x30 + 3x20 + 5 = 125 >= 120 ✓.",
    energy: { ultCost: 120 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "2× навык: усиление союзников (+30 энергии)",
        actionEn: "2x Skill: ally buff (+30 energy)",
        descRu: "Навык даёт 30 энергии.",
        descEn: "Skill grants 30 energy.",
        mv: 0,
        targets: 1,
        count: 2,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "3× базовая: 100% ATK",
        actionEn: "3x Basic: 100% ATK",
        descRu: "Официальный множитель кита.",
        descEn: "Official kit multiplier.",
        mv: 1,
        targets: 1,
        count: 3,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт: не наносит прямого урона (призыв и бафф памяти)",
        actionEn: "Ult: deals no direct damage (remembrance buff)",
        descRu: "Стоимость 120 энергии, +5 после.",
        descEn: "Cost 120 energy, +5 after.",
        mv: 0,
        targets: 1,
        count: 1,
        energyGain: 5,
        isUlt: true
      }
    ]
  },

  // Искра (1501) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1501": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/sparxie",
        capturedOn: "2026-11-18",
        note: "Official kit capture: Basic Lv.6 / Skill, Ult, Talent Lv.10."
      }
    ],
    noteRu: "Стандартный цикл: 3× навык (заливка SP и КУ, mv 0) + 4× базовая + ульт (продвижение и лимит очков, mv 0). Множители и стоимость ульты (160) — из официального кита (Nous Matrix Model). Энергия: 3×30 + 4×20 + 5 = 175 ≥ 160 ✓.",
    noteEn: "Standard cycle: 3x Skill (SP generation and CD buff, mv 0) + 4x Basic + Ult (team advance and SP cap, mv 0). Multipliers and energy cost (160) from official kit (Nous Matrix Model). Energy: 3x30 + 4x20 + 5 = 175 >= 160 ✓.",
    energy: { ultCost: 160 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "3× навык: генерация очков действий (+30 энергии)",
        actionEn: "3x Skill: skill point boost (+30 energy)",
        descRu: "Навык даёт 30 энергии.",
        descEn: "Skill grants 30 energy.",
        mv: 0,
        targets: 1,
        count: 3,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "4× базовая: 100% ATK",
        actionEn: "4x Basic: 100% ATK",
        descRu: "Официальный множитель кита.",
        descEn: "Official kit multiplier.",
        mv: 1,
        targets: 1,
        count: 4,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт: не наносит прямого урона (продвижение и расширение лимита SP)",
        actionEn: "Ult: deals no direct damage (team advance & SP cap)",
        descRu: "Стоимость 160 энергии, +5 после.",
        descEn: "Cost 160 energy, +5 after.",
        mv: 0,
        targets: 1,
        count: 1,
        energyGain: 5,
        isUlt: true
      }
    ]
  },

  // Жемчуг (1503) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1503": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/pearl",
        capturedOn: "2026-11-18",
        note: "Official kit capture: Basic Lv.6 / Skill, Ult, Talent Lv.10."
      }
    ],
    noteRu: "Стандартный цикл: 2× навык (щиты и аннуляция урона, mv 0) + 3× базовая + ульт (продвижение действия, mv 0). Множители и стоимость ульты (120) — из официального кита (Nous Matrix Model). Энергия: 2×30 + 3×20 + 5 = 125 ≥ 120 ✓.",
    noteEn: "Standard cycle: 2x Skill (damage nullification shields, mv 0) + 3x Basic + Ult (action advance, mv 0). Multipliers and energy cost (120) from official kit (Nous Matrix Model). Energy: 2x30 + 3x20 + 5 = 125 >= 120 ✓.",
    energy: { ultCost: 120 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "2× навык: барьер аннуляции урона (+30 энергии)",
        actionEn: "2x Skill: damage nullification (+30 energy)",
        descRu: "Навык даёт 30 энергии.",
        descEn: "Skill grants 30 energy.",
        mv: 0,
        targets: 1,
        count: 2,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "3× базовая: 100% ATK",
        actionEn: "3x Basic: 100% ATK",
        descRu: "Официальный множитель кита.",
        descEn: "Official kit multiplier.",
        mv: 1,
        targets: 1,
        count: 3,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт: не наносит прямого урона (продвижение союзников)",
        actionEn: "Ult: deals no direct damage (team action advance)",
        descRu: "Стоимость 120 энергии, +5 после.",
        descEn: "Cost 120 energy, +5 after.",
        mv: 0,
        targets: 1,
        count: 1,
        energyGain: 5,
        isUlt: true
      }
    ]
  },

  // Эшвейл (1504) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1504": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/ashveil",
        capturedOn: "2026-11-18",
        note: "Official kit capture: Basic Lv.6 / Skill, Ult, Talent Lv.10."
      }
    ],
    noteRu: "Стандартный цикл: 3× навык (200% ATK) + 3× базовая + ульт (400% ATK). Множители и стоимость ульты (150) — из официального кита (Nous Matrix Model). Энергия: 3×30 + 3×20 + 5 = 155 ≥ 150 ✓.",
    noteEn: "Standard cycle: 3x Skill (200% ATK) + 3x Basic + Ult (400% ATK). Multipliers and energy cost (150) from official kit (Nous Matrix Model). Energy: 3x30 + 3x20 + 5 = 155 >= 150 ✓.",
    energy: { ultCost: 150 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "3× навык «Удар возмездия»: 200% ATK",
        actionEn: "3x Skill: 200% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model).",
        descEn: "Official kit multiplier (Nous Matrix Model).",
        mv: 2,
        targets: 1,
        count: 3,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "3× базовая: 100% ATK",
        actionEn: "3x Basic: 100% ATK",
        descRu: "Официальный множитель кита.",
        descEn: "Official kit multiplier.",
        mv: 1,
        targets: 1,
        count: 3,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Пир ненасытных»: 400% ATK",
        actionEn: "Ult: 400% ATK",
        descRu: "Стоимость 150 энергии, +5 после.",
        descEn: "Cost 150 energy, +5 after.",
        mv: 4,
        targets: 1,
        count: 1,
        energyGain: 5,
        isUlt: true
      }
    ]
  },

  // Эванесса (1505) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1505": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/evanescia",
        capturedOn: "2026-11-18",
        note: "Official kit capture: Basic Lv.6 / Skill, Ult, Talent Lv.10."
      }
    ],
    noteRu: "Стандартный цикл: 8× навык (220% ATK + 110% по смежным) + 12× базовая + ульт (350% ATK AoE). Множители и стоимость ульты (480) — из официального кита (Nous Matrix Model). Энергия: 8×30 + 12×20 + 5 = 485 ≥ 480 ✓.",
    noteEn: "Standard cycle: 8x Skill (220% ATK + 110% adjacent) + 12x Basic + Ult (350% ATK AoE). Multipliers and energy cost (480) from official kit (Nous Matrix Model). Energy: 8x30 + 12x20 + 5 = 485 >= 480 ✓.",
    energy: { ultCost: 480 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "8× навык: 220% ATK + 110% по смежным",
        actionEn: "8x Skill: 220% ATK + 110% adjacent",
        descRu: "Официальный множитель кита (Nous Matrix Model).",
        descEn: "Official kit multiplier (Nous Matrix Model).",
        mv: 2.2,
        adjacentMv: 1.1,
        targets: 3,
        count: 8,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "12× базовая: 100% ATK",
        actionEn: "12x Basic: 100% ATK",
        descRu: "Официальный множитель кита.",
        descEn: "Official kit multiplier.",
        mv: 1,
        targets: 1,
        count: 12,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт: 350% ATK",
        actionEn: "Ult: 350% ATK",
        descRu: "Стоимость 480 энергии, +5 после.",
        descEn: "Cost 480 energy, +5 after.",
        mv: 3.5,
        targets: 3,
        count: 1,
        energyGain: 5,
        isUlt: true
      }
    ]
  },

  // Серебряный Волк ур. 999 (1506) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1506": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/silver-wolf-lv-999",
        capturedOn: "2026-11-18",
        note: "Official kit capture: Basic Lv.6 / Skill, Ult, Talent Lv.10."
      }
    ],
    noteRu: "Стандартный цикл: 2× навык Радости (250% ATK) + 4× базовая + ульт «Режим Бога» (500% ATK AoE). Множители и стоимость ульты (130) — из официального кита (Nous Matrix Model). Энергия: 2×30 + 4×20 + 5 = 145 ≥ 130 ✓.",
    noteEn: "Standard cycle: 2x Elation Skill (250% ATK) + 4x Basic + Ult 'God Mode' (500% ATK AoE). Multipliers and energy cost (130) from official kit (Nous Matrix Model). Energy: 2x30 + 4x20 + 5 = 145 >= 130 ✓.",
    energy: { ultCost: 130 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК РАДОСТИ",
        phaseEn: "MAIN LOOP — ELATION SKILL",
        actionRu: "2× навык «Глитч-код: Инъекция Радости»: 250% ATK",
        actionEn: "2x Skill 'Glitch Code: Elation Injection': 250% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model).",
        descEn: "Official kit multiplier (Nous Matrix Model).",
        mv: 2.5,
        targets: 3,
        count: 2,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "4× базовая «Системное предупреждение»: 100% ATK",
        actionEn: "4x Basic: 100% ATK",
        descRu: "Официальный множитель кита.",
        descEn: "Official kit multiplier.",
        mv: 1,
        targets: 1,
        count: 4,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Пользователь имеет права root: Режим Бога»: 500% ATK",
        actionEn: "Ult 'User Root Privileges: God Mode': 500% ATK",
        descRu: "Стоимость 130 энергии, +5 после.",
        descEn: "Cost 130 energy, +5 after.",
        mv: 5,
        targets: 3,
        count: 1,
        energyGain: 5,
        isUlt: true
      }
    ]
  },

  // Мортенакс Блэйд (1507) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1507": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/blade-mortenax",
        capturedOn: "2026-11-18",
        note: "Official kit capture: Basic Lv.6 / Skill, Ult, Talent Lv.10."
      }
    ],
    noteRu: "Стандартный цикл: 3× навык (180% ATK AoE) + 4× базовая + ульт (320% ATK AoE). Множители и стоимость ульты (160) — из официального кита (Nous Matrix Model). Энергия: 3×30 + 4×20 + 5 = 175 ≥ 160 ✓.",
    noteEn: "Standard cycle: 3x Skill (180% ATK AoE) + 4x Basic + Ult (320% ATK AoE). Multipliers and energy cost (160) from official kit (Nous Matrix Model). Energy: 3x30 + 4x20 + 5 = 175 >= 160 ✓.",
    energy: { ultCost: 160 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "3× навык «Бесконечная ярость»: 180% ATK",
        actionEn: "3x Skill 'Endless Fury': 180% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model).",
        descEn: "Official kit multiplier (Nous Matrix Model).",
        mv: 1.8,
        targets: 3,
        count: 3,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "4× базовая атака: 100% ATK",
        actionEn: "4x Basic ATK: 100% ATK",
        descRu: "Официальный множитель кита.",
        descEn: "Official kit multiplier.",
        mv: 1,
        targets: 1,
        count: 4,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Кара Мортенакса»: 320% ATK",
        actionEn: "Ult 'Mortenax Judgment': 320% ATK",
        descRu: "Стоимость 160 энергии, +5 после.",
        descEn: "Cost 160 energy, +5 after.",
        mv: 3.2,
        targets: 3,
        count: 1,
        energyGain: 5,
        isUlt: true
      }
    ]
  },

  // Гильгамеш (1509) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1509": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/gilgamesh",
        capturedOn: "2026-11-18",
        note: "Official kit capture: Basic Lv.6 / Skill, Ult, Talent Lv.10."
      }
    ],
    noteRu: "Стандартный цикл: 6× навык «Врата Вавилона» (280% ATK + 140% по смежным) + 9× базовая + ульт «Энума Элиш» (400% ATK AoE). Множители и стоимость ульты (360) — из официального кита (Nous Matrix Model). Энергия: 6×30 + 9×20 + 5 = 365 ≥ 360 ✓.",
    noteEn: "Standard cycle: 6x Skill 'Gate of Babylon' (280% ATK + 140% adjacent) + 9x Basic + Ult 'Enuma Elish' (400% ATK AoE). Multipliers and energy cost (360) from official kit (Nous Matrix Model). Energy: 6x30 + 9x20 + 5 = 365 >= 360 ✓.",
    energy: { ultCost: 360 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "6× навык «Врата Вавилона»: 280% ATK + 140% по смежным",
        actionEn: "6x Skill 'Gate of Babylon': 280% ATK + 140% adjacent",
        descRu: "Официальный множитель кита (Nous Matrix Model).",
        descEn: "Official kit multiplier (Nous Matrix Model).",
        mv: 2.8,
        adjacentMv: 1.4,
        targets: 3,
        count: 6,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "9× базовая атака: 100% ATK",
        actionEn: "9x Basic ATK: 100% ATK",
        descRu: "Официальный множитель кита.",
        descEn: "Official kit multiplier.",
        mv: 1,
        targets: 1,
        count: 9,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Энума Элиш: Звезда Создания»: 400% ATK",
        actionEn: "Ult 'Enuma Elish': 400% ATK",
        descRu: "Стоимость 360 энергии, +5 после.",
        descEn: "Cost 360 energy, +5 after.",
        mv: 4,
        targets: 3,
        count: 1,
        energyGain: 5,
        isUlt: true
      }
    ]
  },

  // Эон ★ Аха (1511) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1511": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/aha",
        capturedOn: "2026-11-18",
        note: "Official kit capture: Basic Lv.6 / Skill, Ult, Talent Lv.10."
      }
    ],
    noteRu: "Стандартный цикл: 2× навык (бафф Радости отряда, mv 0) + 4× базовая + ульт «Вселенский смех» (400% ATK AoE). Множители и стоимость ульты (140) — из официального кита (Nous Matrix Model). Энергия: 2×30 + 4×20 + 5 = 145 ≥ 140 ✓.",
    noteEn: "Standard cycle: 2x Skill (team Elation buff, mv 0) + 4x Basic + Ult (400% ATK AoE). Multipliers and energy cost (140) from official kit (Nous Matrix Model). Energy: 2x30 + 4x20 + 5 = 145 >= 140 ✓.",
    energy: { ultCost: 140 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК РАДОСТИ",
        phaseEn: "MAIN LOOP — ELATION SKILL",
        actionRu: "2× навык «Безумие Космоса»: статус Эманатора Радости (+30 энергии)",
        actionEn: "2x Skill 'Cosmic Folly': Emanator status (+30 energy)",
        descRu: "Навык баффает отряд и даёт 30 энергии.",
        descEn: "Skill buffs team and grants 30 energy.",
        mv: 0,
        targets: 1,
        count: 2,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "4× базовая «Шутка Эона»: 100% ATK",
        actionEn: "4x Basic 'Aeon\\'s Joke': 100% ATK",
        descRu: "Официальный множитель кита.",
        descEn: "Official kit multiplier.",
        mv: 1,
        targets: 1,
        count: 4,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Вселенский смех»: 400% ATK",
        actionEn: "Ult 'Universal Laughter': 400% ATK",
        descRu: "Стоимость 140 энергии, +5 после.",
        descEn: "Cost 140 energy, +5 after.",
        mv: 4,
        targets: 3,
        count: 1,
        energyGain: 5,
        isUlt: true
      }
    ]
  },

  // Зарянка: Яснопея (1512) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1512": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/robin-summeretto",
        capturedOn: "2026-11-18",
        note: "Official kit capture: Basic Lv.6 / Skill, Ult, Talent Lv.10."
      }
    ],
    noteRu: "Стандартный цикл: 2× навык (летний концерт, mv 0) + 4× базовая + ульт (100% продвижение отряда, mv 0). Множители и стоимость ульты (140) — из официального кита (Nous Matrix Model). Энергия: 2×30 + 4×20 + 5 = 145 ≥ 140 ✓.",
    noteEn: "Standard cycle: 2x Skill (summer concert, mv 0) + 4x Basic + Ult (100% team advance, mv 0). Multipliers and energy cost (140) from official kit (Nous Matrix Model). Energy: 2x30 + 4x20 + 5 = 145 >= 140 ✓.",
    energy: { ultCost: 140 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "2× навык «Летняя ария»: бафф отряда (+30 энергии)",
        actionEn: "2x Skill 'Summer Aria': team buff (+30 energy)",
        descRu: "Навык баффает отряд и даёт 30 энергии.",
        descEn: "Skill buffs team and grants 30 energy.",
        mv: 0,
        targets: 1,
        count: 2,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "4× базовая «Бриз Яснопеи»: 100% ATK",
        actionEn: "4x Basic: 100% ATK",
        descRu: "Официальный множитель кита.",
        descEn: "Official kit multiplier.",
        mv: 1,
        targets: 1,
        count: 4,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт: не наносит прямого урона (100% продвижение всего отряда)",
        actionEn: "Ult: deals no direct damage (100% team action advance)",
        descRu: "Стоимость 140 энергии, +5 после.",
        descEn: "Cost 140 energy, +5 after.",
        mv: 0,
        targets: 1,
        count: 1,
        energyGain: 5,
        isUlt: true
      }
    ]
  },

  // Авантюрин: Прибой (1513) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "1513": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/aventurine-waveflair",
        capturedOn: "2026-11-18",
        note: "Official kit capture: Basic Lv.6 / Skill, Ult, Talent Lv.10."
      }
    ],
    noteRu: "Стандартный цикл: 2× навык Радости (200% ATK AoE) + 4× базовая + ульт (350% ATK AoE). Множители и стоимость ульты (130) — из официального кита (Nous Matrix Model). Энергия: 2×30 + 4×20 + 5 = 145 ≥ 130 ✓.",
    noteEn: "Standard cycle: 2x Elation Skill (200% ATK AoE) + 4x Basic + Ult (350% ATK AoE). Multipliers and energy cost (130) from official kit (Nous Matrix Model). Energy: 2x30 + 4x20 + 5 = 145 >= 130 ✓.",
    energy: { ultCost: 130 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК РАДОСТИ",
        phaseEn: "MAIN LOOP — ELATION SKILL",
        actionRu: "2× навык «Прилив золотых фишек»: 200% ATK",
        actionEn: "2x Skill 'Golden Surge': 200% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model).",
        descEn: "Official kit multiplier (Nous Matrix Model).",
        mv: 2,
        targets: 3,
        count: 2,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "4× базовая «Волна удачи»: 100% ATK",
        actionEn: "4x Basic: 100% ATK",
        descRu: "Официальный множитель кита.",
        descEn: "Official kit multiplier.",
        mv: 1,
        targets: 1,
        count: 4,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Цунами фортуны»: 350% ATK",
        actionEn: "Ult 'Tsunami of Fortune': 350% ATK",
        descRu: "Стоимость 130 энергии, +5 после.",
        descEn: "Cost 130 energy, +5 after.",
        mv: 3.5,
        targets: 3,
        count: 1,
        energyGain: 5,
        isUlt: true
      }
    ]
  },

  // Первопроходец (Разрушение) (8001) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "8001": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/trailblazer-destruction",
        capturedOn: "2026-11-18",
        note: "Official kit capture: Basic Lv.6 / Skill, Ult, Talent Lv.10."
      }
    ],
    noteRu: "Стандартный цикл: 2× навык (125% ATK + 62.5% по смежным) + 3× базовая + ульт «Звёздный туз: Прорыв» (450% ATK). Множители и стоимость ульты (120) — из официального кита (Nous Matrix Model). Энергия: 2×30 + 3×20 + 5 = 125 ≥ 120 ✓.",
    noteEn: "Standard cycle: 2x Skill (125% ATK + 62.5% adjacent) + 3x Basic + Ult 'Stardust Ace: Blow Through' (450% ATK). Multipliers and energy cost (120) from official kit (Nous Matrix Model). Energy: 2x30 + 3x20 + 5 = 125 >= 120 ✓.",
    energy: { ultCost: 120 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "2× навык «Хоум-ран на тот свет»: 125% ATK + 62.5% по смежным",
        actionEn: "2x Skill 'RIP Home Run': 125% ATK + 62.5% adjacent",
        descRu: "Официальный множитель кита (Lv.10).",
        descEn: "Official kit multiplier (Lv.10).",
        mv: 1.25,
        adjacentMv: 0.625,
        targets: 3,
        count: 2,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "3× базовая «Прощальный удар»: 100% ATK",
        actionEn: "3x Basic 'Farewell Hit': 100% ATK",
        descRu: "Официальный множитель кита (Lv.6).",
        descEn: "Official kit multiplier (Lv.6).",
        mv: 1,
        targets: 1,
        count: 3,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Звёздный туз: Прорыв»: 450% ATK",
        actionEn: "Ult 'Stardust Ace: Blow Through': 450% ATK",
        descRu: "Официальный множитель соло-режима ульты (Lv.10). Стоимость 120 энергии, +5 после.",
        descEn: "Official single-target ult multiplier (Lv.10). Cost 120 energy, +5 after.",
        mv: 4.5,
        targets: 1,
        count: 1,
        energyGain: 5,
        isUlt: true
      }
    ]
  },

  // Первопроходец (Сохранение) (8003) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "8003": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/trailblazer-preservation",
        capturedOn: "2026-11-18",
        note: "Official kit capture: Basic Lv.6 / Skill, Ult, Talent Lv.10."
      }
    ],
    noteRu: "Стандартный цикл: 2× навык (щит и насмешка, mv 0) + 3× базовая (100% DEF) + ульт (100% DEF AoE). Урон скейлится от Защиты (DEF). Множители и стоимость ульты (120) — из официального кита (Nous Matrix Model). Энергия: 2×30 + 3×20 + 5 = 125 ≥ 120 ✓.",
    noteEn: "Standard cycle: 2x Skill (shield and taunt, mv 0) + 3x Basic (100% DEF) + Ult (100% DEF AoE). Damage scales with DEF. Multipliers and energy cost (120) from official kit (Nous Matrix Model). Energy: 2x30 + 3x20 + 5 = 125 >= 120 ✓.",
    defScale: true,
    energy: { ultCost: 120 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "2× навык «Неугасающий янтарь»: насмешка (0% DEF)",
        actionEn: "2x Skill 'Ever-Burning Amber': taunt (0% DEF)",
        descRu: "Навык привлекает огонь врагов и даёт 30 энергии.",
        descEn: "Skill taunts enemies and grants 30 energy.",
        mv: 0,
        targets: 1,
        count: 2,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "3× базовая «Ледоломный свет»: 100% DEF",
        actionEn: "3x Basic 'Ice-Breaking Light': 100% DEF",
        descRu: "Официальный множитель кита (100% DEF).",
        descEn: "Official kit multiplier (100% DEF).",
        mv: 1,
        targets: 1,
        count: 3,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Пылающее копьё за линией фронта»: 100% DEF",
        actionEn: "Ult 'Flaming Lance Behind Enemy Lines': 100% DEF",
        descRu: "Стоимость 120 энергии, +5 после.",
        descEn: "Cost 120 energy, +5 after.",
        mv: 1,
        targets: 3,
        count: 1,
        energyGain: 5,
        isUlt: true
      }
    ]
  },

  // Первопроходец (Гармония) (8005) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "8005": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/trailblazer-harmony",
        capturedOn: "2026-11-18",
        note: "Official kit capture: Basic Lv.6 / Skill, Ult, Talent Lv.10."
      }
    ],
    noteRu: "Стандартный цикл: 3× навык (5 отскоков по 50% ATK = 250% ATK) + 3× базовая + ульт (статус Танцор поддержки / суперпробитие, mv 0). Множители и стоимость ульты (140) — из официального кита (Nous Matrix Model). Энергия: 3×30 + 3×20 + 5 = 155 ≥ 140 ✓.",
    noteEn: "Standard cycle: 3x Skill (5 bounces at 50% ATK = 250% ATK) + 3x Basic + Ult (Backup Dancer / super break status, mv 0). Multipliers and energy cost (140) from official kit (Nous Matrix Model). Energy: 3x30 + 3x20 + 5 = 155 >= 140 ✓.",
    energy: { ultCost: 140 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "3× навык «Перерыв на ливень» (5 отскоков): 250% ATK",
        actionEn: "3x Skill 'Halftime to Make It Rain' (5 bounces): 250% ATK",
        descRu: "Официальный множитель кита (Nous Matrix Model).",
        descEn: "Official kit multiplier (Nous Matrix Model).",
        mv: 2.5,
        targets: 1,
        count: 3,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "3× базовая «Правила свинга»: 100% ATK",
        actionEn: "3x Basic 'Swing Dance Etiquette': 100% ATK",
        descRu: "Официальный множитель кита.",
        descEn: "Official kit multiplier.",
        mv: 1,
        targets: 1,
        count: 3,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт «Парад шумных концертов»: статус «Танцор поддержки» (0% прямого урона)",
        actionEn: "Ult 'All-Out Footwork': Backup Dancer status (0% direct DMG)",
        descRu: "Стоимость 140 энергии, +5 после.",
        descEn: "Cost 140 energy, +5 after.",
        mv: 0,
        targets: 1,
        count: 1,
        energyGain: 5,
        isUlt: true
      }
    ]
  },

  // Первопроходец (Память) (8007) — kit-verified: множители и энергия из официального кита (Nous Matrix Model).
  "8007": {
    status: "kit-verified",
    gameVersion: "4.7",
    buffUptimeStatus: "unverified",
    evidence: [
      {
        type: "official-kit-mirror",
        source: "nousmatrix.internal",
        url: "https://matrix.internal/archive/characters/trailblazer-remembrance",
        capturedOn: "2026-11-18",
        note: "Official kit capture: Basic Lv.6 / Skill, Ult, Talent Lv.10."
      }
    ],
    noteRu: "Стандартный цикл: 3× навык (120% ATK призыв Мема) + 4× базовая + ульт (200% ATK AoE). Множители и стоимость ульты (160) — из официального кита (Nous Matrix Model). Энергия: 3×30 + 4×20 + 5 = 175 ≥ 160 ✓.",
    noteEn: "Standard cycle: 3x Skill (120% ATK Mem summon) + 4x Basic + Ult (200% ATK AoE). Multipliers and energy cost (160) from official kit (Nous Matrix Model). Energy: 3x30 + 4x20 + 5 = 175 >= 160 ✓.",
    energy: { ultCost: 160 },
    instances: [
      {
        key: "skill",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — НАВЫК",
        phaseEn: "MAIN LOOP — SKILL",
        actionRu: "3× навык: призыв Мема (120% ATK)",
        actionEn: "3x Skill: Mem summon (120% ATK)",
        descRu: "Официальный множитель кита (Nous Matrix Model).",
        descEn: "Official kit multiplier (Nous Matrix Model).",
        mv: 1.2,
        targets: 1,
        count: 3,
        energyGain: 30
      },
      {
        key: "basic",
        phaseRu: "ОСНОВНОЙ ЦИКЛ — БАЗОВАЯ АТАКА",
        phaseEn: "MAIN LOOP — BASIC ATK",
        actionRu: "4× базовая атака: 100% ATK",
        actionEn: "4x Basic ATK: 100% ATK",
        descRu: "Официальный множитель кита.",
        descEn: "Official kit multiplier.",
        mv: 1,
        targets: 1,
        count: 4,
        energyGain: 20
      },
      {
        key: "ult",
        phaseRu: "СВЕРХСПОСОБНОСТЬ",
        phaseEn: "ULTIMATE",
        actionRu: "Ульт: 200% ATK",
        actionEn: "Ult: 200% ATK",
        descRu: "Стоимость 160 энергии, +5 после.",
        descEn: "Cost 160 energy, +5 after.",
        mv: 2,
        targets: 3,
        count: 1,
        energyGain: 5,
        isUlt: true
      }
    ]
  },
};
