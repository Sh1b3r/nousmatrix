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
// selected from the full combat BE, uncapped — per hsrzone the 360% cap applies
// only to the enhanced-skill BE coefficient), atkBeBonus { atkThreshold, bePer10 }
// (Firefly A6: +0.8% BE per 10 ATK above 1800, condition checked against the
// profile's combat ATK), spdHpBonus { spdThreshold, hpPercent } (Hyacine A6:
// +20% Max HP while SPD >200, condition checked against the profile's SPD),
// critRateFromHp { hpThreshold, crPer100, capHp } (Mydei A6: +1.2% CR per 100
// excess HP above 4000, capped at 4000 excess — condition checked against the
// profile's combat HP).

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
        source: "prydwen.gg",
        url: "https://www.prydwen.gg/star-rail/characters/imbibitor-lunae/",
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
        capturedOn: "2026-11-16",
        note: "Enhanced Skill (0.2xBE+200%) primary, (0.1xBE+100%) adjacent; Enhanced Basic 150%; base Skill 200%, +60% Max Energy; Ult costs 240; Talent: start with >=50% energy; A2: +25% BE in Complete Combustion; A6: +0.8% BE per 10 ATK above 1800."
      }
    ],
    noteRu: "Цикл: ульт (240 энергии; талант даёт старт ≥50%) → окно Complete Combustion: 2 усиленных навыка (200% + 0.2×ЭП по главной, 100% + 0.1×ЭП по смежным) + 1 усиленная базовая (150%) → 1 обычный навык (+144 энергии = 60% от макс). Энергия: 144 + 120 (старт) = 264 ≥ 240. Длина окна CC (2 навыка + 1 базовая) — допущение по таймеру SPD 70. Суперпробитие (след A4, HoYoWiki-формула): при пробитой цели и ЭП ≥150%/300% каждый удар конвертирует истощение (30 + 15×смежные) в 100%/150% Super Break урона — число срабатываний задаётся явным вводом «Суперпробития», коэффициент выбирается по полному боевому ЭП без капа (по hsrzone кап 360% действует только на коэффициент ЭП усиленного навыка); формула без крита, ATK и DMG%. Учтены следы: A2 (+25% ЭП в состоянии CC — всё окно проходит в CC, аптайм гарантирован) и A6 (+0.8% ЭП за каждые 10 АТК свыше 1800, по боевой АТК профиля — безусловный след). Кап ЭП 360% применяется к коэффициенту усиленного навыка (beScale). Не включено: +50% эффективности пробития и +20% Break DMG ульты (действуют только на удар, наносящий пробитие; не входят в модельные удары), траты HP.",
    noteEn: "Cycle: ult (240 energy; Talent grants >=50% start) -> Complete Combustion window: 2 enhanced skills (200% + 0.2xBE primary, 100% + 0.1xBE adjacent) + 1 enhanced basic (150%) -> 1 base skill (+144 energy = 60% of Max). Energy: 144 + 120 (start) = 264 >= 240. The CC window length (2 skills + 1 basic) assumes the SPD 70 countdown. Super Break (A4 trace, HoYoWiki formula): against a broken target at BE >=150%/300% each hit converts its toughness reduction (30 + 15x adjacent) into 100%/150% Super Break DMG — the proc count is set by the explicit Super Break input, and the coefficient is selected from the full combat BE uncapped (per hsrzone the 360% cap applies only to the enhanced-skill BE coefficient); no crit, ATK, or DMG% in the formula. Traces counted: A2 (+25% BE inside the CC state — the whole window happens in CC, uptime guaranteed) and A6 (+0.8% BE per 10 ATK above 1800, from the profile's combat ATK — unconditional). The 360% BE cap applies to the enhanced-skill coefficient (beScale). Excluded: the ult's +50% Break Efficiency and +20% Break DMG (apply only to the attack that inflicts the break; none of the modeled hits are that attack), HP costs.",
    hpScale: false,
    beCapPercent: 360,
    // След A2 «Module α: Antilag Outburst»: +25% ЭП в состоянии Complete
    // Combustion. Всё окно CC — именно в этом состоянии, аптайм гарантирован.
    beBonusPercent: 25,
    // След A6 «Module γ: Gilded Passing»: +0.8% ЭП за каждые 10 АТК свыше
    // 1800. Безусловный след; условие проверяется по боевой АТК профиля.
    atkBeBonus: { atkThreshold: 1800, bePer10: 0.8 },
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
        source: "prydwen.gg",
        url: "https://www.prydwen.gg/star-rail/characters/jingliu/",
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
        source: "prydwen.gg",
        url: "https://www.prydwen.gg/star-rail/characters/blade/",
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
        source: "prydwen.gg",
        url: "https://www.prydwen.gg/star-rail/characters/mydei/",
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
        source: "prydwen.gg",
        url: "https://www.prydwen.gg/star-rail/characters/anaxa/",
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
  }
};
