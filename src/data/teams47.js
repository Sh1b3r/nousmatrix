// Відряди мети 4.7 — «хто кому підходить» (синергія, а не просто найсильніші).
// Назви персонажів — ОФІЦІЙНА ігрова локалізація (джерело: StarRailRes index_new/ru/characters.json).
// Радость (Elation), Суперпробитие (Super Break с Георгиной), Стенсы (Verdict / Decimation).

export const TEAMS_47 = {
  // Авантюрин: Прибой (1513) — ДАМАГЕР РАДОСТИ (Elation Main DPS)
  "1513": [
    {
      id: "aventurine_surging_elation_core",
      nameRu: "Отряд 1 (4.7): Ядро Радости (Аха + Яо Гуан + Жемчуг)",
      nameEn: "Team 1 (4.7): Pure Elation Core (Aha + Yao Guang + Pearl)",
      descRu: "Мета 4.7 Радости: Авантюрин Прибой в отряде Радости реализует след «Revel in Surging Waves» и сет «Миг радости бога», Аха накладывает статус «Эманатор Радости», Яо Гуан разгоняет фазу Aha Instant, Жемчуг защищает зарядами «Настоящий хит».",
      descEn: "4.7 Elation Meta: Aventurine Surging triggers Moment of Joy and Revel in Surging Waves, Aha grants Emanator of Elation status, Yao Guang drives Aha Instant, Pearl shields via Real Hit.",
      isEstimate: true,
      teammates: [
        {
          id: "1408",
          nameRu: "Яо Гуан",
          nameEn: "Yao Guang",
          icon: "icon/character/1408.png",
          names: ["яо гуан", "яо", "yao guang", "yao"],
          roleRu: "Радость (Обязательный Саппорт)",
          roleEn: "Elation (Core Support)",
          buffDescRu: "Всегда в отряде: +25% All-Type RES PEN, синхронный навык Радости, разгон фазы Aha Instant",
          buffValues: { dmgBoost: 50, resPen: 25, teamAdvance: 35 }
        },
        {
          id: "1514",
          altIds: ["1501"],
          nameRu: "Аха",
          nameEn: "Aha",
          icon: "icon/character/1514.png",
          names: ["аха", "aha", "эон радости", "aeon of elation", "искра", "спаркси"],
          roleRu: "Радость (Эон Радости / Лучший Саппорт)",
          roleEn: "Elation (Aeon of Elation / Best Support)",
          buffDescRu: "Лучше Спаркси/Искры: статус «Эманатор Радости», срез Max HP боссов, колоссальный бафф урона Радости (+65%) и уязвимость",
          buffValues: { dmgBoost: 65, resPen: 25, allVuln: 30 }
        },
        {
          id: "1503",
          altIds: ["1217"],
          nameRu: "Жемчуг",
          nameEn: "Pearl",
          icon: "icon/character/1503.png",
          names: ["жемчуг", "pearl", "хохо", "huohuo"],
          roleRu: "Радость (Лучший Сустейн)",
          roleEn: "Elation (Best Sustain)",
          buffDescRu: "Лучший сустейн Радости: заряды «Настоящий хит», блокировка урона, лечение от ЗАЩ, продвижение действий",
          buffValues: { teamShield: true, teamAdvance: 25, dmgBoost: 30 }
        }
      ]
    }
  ],

  // Серебряный Волк ур. 999 (1006 / 999) — ДАМАГЕР РАДОСТИ
  "1006": [
    {
      id: "sw999_elation_best",
      nameRu: "Отряд 1 (4.7): Абсолютная Мета Радости (Аха + Яо Гуан + Жемчуг)",
      nameEn: "Team 1 (4.7): Absolute Elation Meta (Aha + Yao Guang + Pearl)",
      descRu: "Сильнейший отряд Серебряного Волка ур. 999: Яо Гуан всегда стоит в отряде (+25% All-Type RES PEN, одновременный навык Радости), Аха — лучший саппорт Радости (лучше Спаркси/Искры: статус «Эманатор Радости», срез Max HP врагов, +65% урона), Жемчуг — лучший сустейн Радости (заряды «Настоящий хит», блокировка урона, лечение от ЗАЩ).",
      descEn: "Peak Silver Wolf LV.999 squad: Yao Guang is always in team (+25% RES PEN, simultaneous skill), Aha is premier support (superior to Sparxie/Sparkle: Emanator of Elation status, Boss Max HP shred, +65% DMG), Pearl is premier sustain (Real Hit blocks, DEF-based heals).",
      isEstimate: true,
      teammates: [
        {
          id: "1408",
          nameRu: "Яо Гуан",
          nameEn: "Yao Guang",
          icon: "icon/character/1408.png",
          names: ["яо гуан", "яо", "yao guang", "yao"],
          roleRu: "Радость (Обязательный Саппорт)",
          roleEn: "Elation (Core Support)",
          buffDescRu: "Всегда в отряде: +25% All-Type RES PEN, одновременный навык Радости для команды, быстрый вход в «Invincible Player»",
          buffValues: { dmgBoost: 50, resPen: 25, teamAdvance: 35 }
        },
        {
          id: "1514",
          altIds: ["1501"],
          nameRu: "Аха",
          nameEn: "Aha",
          icon: "icon/character/1514.png",
          names: ["аха", "aha", "эон радости", "aeon of elation", "искра", "спаркси"],
          roleRu: "Радость (Лучший Саппорт / Эон Радости)",
          roleEn: "Elation (Best Support / Aeon)",
          buffDescRu: "Лучше Спаркси/Искры: статус «Эманатор Радости», срез Max HP боссов, колоссальный бафф урона Радости (+65%) и уязвимость",
          buffValues: { dmgBoost: 65, resPen: 25, allVuln: 30 }
        },
        {
          id: "1503",
          altIds: ["1217"],
          nameRu: "Жемчуг",
          nameEn: "Pearl",
          icon: "icon/character/1503.png",
          names: ["жемчуг", "pearl", "хохо", "huohuo"],
          roleRu: "Радость (Лучший Сустейн)",
          roleEn: "Elation (Best Sustain)",
          buffDescRu: "Лучший сустейн Радости: заряды «Настоящий хит», блокировка входящего урона, лечение от ЗАЩ, продвижение действий",
          buffValues: { teamShield: true, teamAdvance: 25, dmgBoost: 30 }
        }
      ]
    },
    {
      id: "sw999_elation_alt_sparkle_huohuo",
      nameRu: "Отряд 2 (4.7): Альтернативная Радость (Искра / Спаркси + Яо Гуан + Хохо)",
      nameEn: "Team 2 (4.7): Alternative Elation (Sparkle / Sparxie + Yao Guang + Huohuo)",
      descRu: "Вторая связка: Яо Гуан остаётся ядром, Искра (Спаркси в оригинальной русской озвучке) выступает великолепной альтернативой Ахе с заливкой SP и триггерами Mystery Boxes, а Хохо — второй лучший сустейн после Жемчуг (заливка энергии ультимейтов всей команде и +40% ATK).",
      descEn: "Second configuration: Yao Guang remains core, Sparkle (Sparxie) provides excellent alternative to Aha with SP recovery & Mystery Boxes, and Huohuo is the second best sustain after Pearl (+20% team energy and +40% ATK).",
      isEstimate: true,
      teammates: [
        {
          id: "1408",
          nameRu: "Яо Гуан",
          nameEn: "Yao Guang",
          icon: "icon/character/1408.png",
          names: ["яо гуан", "яо", "yao guang", "yao"],
          roleRu: "Радость (Обязательный Саппорт)",
          roleEn: "Elation (Core Support)",
          buffDescRu: "Всегда в отряде: +25% All-Type RES PEN, синхронный навык Радости для команды, разгон шкалы Hidden Ranking",
          buffValues: { dmgBoost: 50, resPen: 25, teamAdvance: 35 }
        },
        {
          id: "1501",
          altIds: ["1514"],
          nameRu: "Искра (Спаркси)",
          nameEn: "Sparkle / Sparxie",
          icon: "icon/character/1501.png",
          names: ["искра", "спаркси", "sparxie", "sparkle", "еванесція"],
          roleRu: "Радость (Саб-ДПС и Батарейка Радости)",
          roleEn: "Elation (Sub-DPS & SP Battery)",
          buffDescRu: "Альтернатива Ахе: триггеры Mystery Boxes, конверсия Thrill в урон, генерация очков действий Радости, сет «Миг радости бога»",
          buffValues: { dmgBoost: 50, teamAdvance: 50, energyFeed: 30 }
        },
        {
          id: "1217",
          altIds: ["1503"],
          nameRu: "Хохо",
          nameEn: "Huohuo",
          icon: "icon/character/1217.png",
          names: ["хохо", "huohuo", "жемчуг", "pearl"],
          roleRu: "Изобилие (Второй Сустейн после Жемчуг)",
          roleEn: "Abundance (Second Sustain after Pearl)",
          buffDescRu: "Сустейн после Жемчуг: заливка +20% энергии ультимейтов всему отряду, бафф +40% ATK, непрерывное снятие дебаффов",
          buffValues: { energyFeed: 20, dmgBoost: 40 }
        }
      ]
    }
  ],
  "999": [
    {
      id: "sw999_elation_best_alias",
      nameRu: "Отряд 1 (4.7): Абсолютная Мета Радости (Аха + Яо Гуан + Жемчуг)",
      nameEn: "Team 1 (4.7): Absolute Elation Meta (Aha + Yao Guang + Pearl)",
      descRu: "Сильнейший отряд Серебряного Волка ур. 999: Яо Гуан всегда стоит в отряде (+25% All-Type RES PEN, одновременный навык Радости), Аха — лучший саппорт Радости (лучше Спаркси/Искры: статус «Эманатор Радости», срез Max HP врагов, +65% урона), Жемчуг — лучший сустейн Радости (заряды «Настоящий хит», блокировка урона, лечение от ЗАЩ).",
      descEn: "Peak Silver Wolf LV.999 squad: Yao Guang is always in team (+25% RES PEN, simultaneous skill), Aha is premier support (superior to Sparxie/Sparkle: Emanator of Elation status, Boss Max HP shred, +65% DMG), Pearl is premier sustain (Real Hit blocks, DEF-based heals).",
      isEstimate: true,
      teammates: [
        {
          id: "1408",
          nameRu: "Яо Гуан",
          nameEn: "Yao Guang",
          icon: "icon/character/1408.png",
          names: ["яо гуан", "яо", "yao guang", "yao"],
          roleRu: "Радость (Обязательный Саппорт)",
          roleEn: "Elation (Core Support)",
          buffDescRu: "Всегда в отряде: +25% All-Type RES PEN, одновременный навык Радости для команды, быстрый вход в «Invincible Player»",
          buffValues: { dmgBoost: 50, resPen: 25, teamAdvance: 35 }
        },
        {
          id: "1514",
          altIds: ["1501"],
          nameRu: "Аха",
          nameEn: "Aha",
          icon: "icon/character/1514.png",
          names: ["аха", "aha", "эон радости", "aeon of elation", "искра", "спаркси"],
          roleRu: "Радость (Лучший Саппорт / Эон Радости)",
          roleEn: "Elation (Best Support / Aeon)",
          buffDescRu: "Лучше Спаркси/Искры: статус «Эманатор Радости», срез Max HP боссов, колоссальный бафф урона Радости (+65%) и уязвимость",
          buffValues: { dmgBoost: 65, resPen: 25, allVuln: 30 }
        },
        {
          id: "1503",
          altIds: ["1217"],
          nameRu: "Жемчуг",
          nameEn: "Pearl",
          icon: "icon/character/1503.png",
          names: ["жемчуг", "pearl", "хохо", "huohuo"],
          roleRu: "Радость (Лучший Сустейн)",
          roleEn: "Elation (Best Sustain)",
          buffDescRu: "Лучший сустейн Радости: заряды «Настоящий хит», блокировка входящего урона, лечение от ЗАЩ, продвижение действий",
          buffValues: { teamShield: true, teamAdvance: 25, dmgBoost: 30 }
        }
      ]
    },
    {
      id: "sw999_elation_alt_sparkle_huohuo_alias",
      nameRu: "Отряд 2 (4.7): Альтернативная Радость (Искра / Спаркси + Яо Гуан + Хохо)",
      nameEn: "Team 2 (4.7): Alternative Elation (Sparkle / Sparxie + Yao Guang + Huohuo)",
      descRu: "Вторая связка: Яо Гуан остаётся ядром, Искра (Спаркси в оригинальной русской озвучке) выступает великолепной альтернативой Ахе с заливкой SP и триггерами Mystery Boxes, а Хохо — второй лучший сустейн после Жемчуг (заливка энергии ультимейтов всей команде и +40% ATK).",
      descEn: "Second configuration: Yao Guang remains core, Sparkle (Sparxie) provides excellent alternative to Aha with SP recovery & Mystery Boxes, and Huohuo is the second best sustain after Pearl (+20% team energy and +40% ATK).",
      isEstimate: true,
      teammates: [
        {
          id: "1408",
          nameRu: "Яо Гуан",
          nameEn: "Yao Guang",
          icon: "icon/character/1408.png",
          names: ["яо гуан", "яо", "yao guang", "yao"],
          roleRu: "Радость (Обязательный Саппорт)",
          roleEn: "Elation (Core Support)",
          buffDescRu: "Всегда в отряде: +25% All-Type RES PEN, синхронный навык Радости для команды, разгон шкалы Hidden Ranking",
          buffValues: { dmgBoost: 50, resPen: 25, teamAdvance: 35 }
        },
        {
          id: "1501",
          altIds: ["1514"],
          nameRu: "Искра (Спаркси)",
          nameEn: "Sparkle / Sparxie",
          icon: "icon/character/1501.png",
          names: ["искра", "спаркси", "sparxie", "sparkle", "еванесція"],
          roleRu: "Радость (Саб-ДПС и Батарейка Радости)",
          roleEn: "Elation (Sub-DPS & SP Battery)",
          buffDescRu: "Альтернатива Ахе: триггеры Mystery Boxes, конверсия Thrill в урон, генерация очков действий Радости, сет «Миг радости бога»",
          buffValues: { dmgBoost: 50, teamAdvance: 50, energyFeed: 30 }
        },
        {
          id: "1217",
          altIds: ["1503"],
          nameRu: "Хохо",
          nameEn: "Huohuo",
          icon: "icon/character/1217.png",
          names: ["хохо", "huohuo", "жемчуг", "pearl"],
          roleRu: "Изобилие (Второй Сустейн после Жемчуг)",
          roleEn: "Abundance (Second Sustain after Pearl)",
          buffDescRu: "Сустейн после Жемчуг: заливка +20% энергии ультимейтов всему отряду, бафф +40% ATK, непрерывное снятие дебаффов",
          buffValues: { energyFeed: 20, dmgBoost: 40 }
        }
      ]
    }
  ],

  // Светлячок (1310) — мета 4.7 с ГЕОРГИНОЙ (Dahlia)
  "1310": [
    {
      id: "firefly_47_dahlia_superbreak",
      nameRu: "Отряд 1 (4.7): Новое Суперпробитие (Георгина + Линша + Жуань Мэй)",
      nameEn: "Team 1 (4.7): Next-Gen Super Break (Dahlia + Lingsha + Ruan Mei)",
      descRu: "Истинная мета 4.7 для Светлячка: Георгина выступает ключевым брейк-саппортом (разгоняет пробитие и урон по сломанным целям вместо устаревшего ГГ), Линша наносит массовый урон пробития, Жуань Мэй даёт +50% эффективности пробития и All-Type RES PEN.",
      descEn: "Authentic 4.7 Firefly meta: Dahlia acts as the premier break support (massively boosting break damage instead of outdated TB), Lingsha triggers AoE breaks, Ruan Mei grants +50% break efficiency & RES PEN.",
      isEstimate: true,
      teammates: [
        {
          id: "1505",
          altIds: ["1404"],
          nameRu: "Георгина",
          nameEn: "Dahlia",
          icon: "icon/character/1505.png",
          names: ["георгина", "dahlia", "далия"],
          roleRu: "Саппорт (Специалист Пробития)",
          roleEn: "Support (Break Specialist)",
          buffDescRu: "Ключевой брейк-саппорт 4.7: разгон урона пробития, бафф эффективности стойкости",
          buffValues: { superBreakFactor: 1.8, beBoost: 60 }
        },
        {
          id: "1222",
          nameRu: "Линша",
          nameEn: "Lingsha",
          icon: "icon/character/1222.png",
          names: ["линша", "lingsha"],
          roleRu: "Изобилие (Суперпробитие)",
          roleEn: "Abundance (Super Break)",
          buffDescRu: "+25% Уязвимость к пробитию, AoE атаки кролика поджигают и лечат отряд",
          buffValues: { breakVuln: 25 }
        },
        {
          id: "1303",
          altIds: ["1404"],
          nameRu: "Жуань Мэй / Фугу",
          nameEn: "Ruan Mei / Fugue",
          icon: "icon/character/1303.png",
          names: ["руань мэй", "ruan mei", "фугу", "fugue"],
          roleRu: "Гармония (Эффективность пробития)",
          roleEn: "Harmony (Break Efficiency)",
          buffDescRu: "+50% Эффективность пробития, +25% All-Type RES PEN, задержка восстановления врагов",
          buffValues: { breakEff: 50, resPen: 25 }
        }
      ]
    },
    {
      id: "firefly_47_dahlia_fugue_meta",
      nameRu: "Отряд 2 (4.7): Экзо-Пробитие Георгины (Георгина + Фугу + Линша)",
      nameEn: "Team 2 (4.7): Dahlia Exo-Break (Dahlia + Fugue + Lingsha)",
      descRu: "Связка Фугу (Экзо-стойкость) и Георгины (экстремальный урон пробития) позволяет Светлячку мгновенно уничтожать полоску стойкости любого босса независимо от типа уязвимости.",
      descEn: "Fugue Exo-toughness + Dahlia break empowerment: Firefly dismantles any boss toughness bar unconditionally.",
      isEstimate: true,
      teammates: [
        {
          id: "1505",
          nameRu: "Георгина",
          nameEn: "Dahlia",
          icon: "icon/character/1505.png",
          names: ["георгина", "dahlia"],
          roleRu: "Саппорт (Разгон Пробития)",
          roleEn: "Support (Break Amplifier)",
          buffDescRu: "Усиление урона пробития по экзо-стойкости, +60% ЭП отряду",
          buffValues: { superBreakFactor: 1.8, beBoost: 60 }
        },
        {
          id: "1404",
          nameRu: "Фугу",
          nameEn: "Fugue",
          icon: "icon/character/1404.png",
          names: ["фугу", "fugue"],
          roleRu: "Небытие (Экзо-стойкость)",
          roleEn: "Nihility (Exo-Toughness)",
          buffDescRu: "Внедрение Экзо-стойкости, усиление суперпробития отряда",
          buffValues: { exoBreak: true, beBoost: 40 }
        },
        {
          id: "1222",
          nameRu: "Линша",
          nameEn: "Lingsha",
          icon: "icon/character/1222.png",
          names: ["линша", "lingsha"],
          roleRu: "Изобилие (Суперпробитие)",
          roleEn: "Abundance (Super Break)",
          buffDescRu: "+25% Уязвимость к пробитию, AoE лечение",
          buffValues: { breakVuln: 25 }
        }
      ]
    }
  ],

  // Ахерон (1308) — мета 4.7 БЕЗ Кирен, БЕЗ Трибби, БЕЗ Прибоя
  "1308": [
    {
      id: "acheron_47_nihility_core",
      nameRu: "Отряд 1 (4.7): Небытие (Цзяоцю + Пела + Авантюрин)",
      nameEn: "Team 1 (4.7): Nihility Core (Jiaoqiu + Pela + Aventurine)",
      descRu: "Основная рекомендация HSR Build 4.7: два союзника Небытия регулярно накладывают ослабления и ускоряют заряд сверхспособности Ахерон; Авантюрин обеспечивает сустейн без постоянного расхода очков навыков.",
      descEn: "HSR Build 4.7 primary recommendation: two Nihility allies apply debuffs to accelerate Acheron's Ultimate; Aventurine sustains with low Skill Point demand.",
      sourceVersion: "4.7",
      sourceUpdatedAt: "2026-11-08",
      sourceUrl: "https://www.hsr-build.com/best-teams/acheron",
      teammates: [
        {
          id: "1218", nameRu: "Цзяоцю", nameEn: "Jiaoqiu", icon: "icon/character/1218.png",
          roleRu: "Небытие / ослабления", roleEn: "Nihility / debuffer",
          buffDescRu: "Накладывает ослабления, помогая заряжать сверхспособность Ахерон.", buffDescEn: "Applies debuffs that help charge Acheron's Ultimate.",
          buffValues: { allVuln: 15, defShred: 15 }
        },
        {
          id: "1105", nameRu: "Пела", nameEn: "Pela", icon: "icon/character/1105.png",
          roleRu: "Небытие / срез защиты", roleEn: "Nihility / DEF shred",
          buffDescRu: "Срезает защиту и накладывает ослабления для зарядов Ахерон.", buffDescEn: "Shreds DEF and applies debuffs for Acheron stacks.",
          buffValues: { defShred: 40 }
        },
        {
          id: "1304", nameRu: "Авантюрин", nameEn: "Aventurine", icon: "icon/character/1304.png",
          roleRu: "Сустейн", roleEn: "Sustain",
          buffDescRu: "Поддерживает выживаемость команды и помогает накладывать ослабления.", buffDescEn: "Keeps the team alive and can contribute debuffs.",
          buffValues: { critVuln: 15 }
        }
      ]
    },
    {
      id: "acheron_47_ashveil_mortenax_hyacine",
      nameRu: "Отряд 2 (4.7): Ахерон + Эшвейл + Мортенакс + Гиацина",
      nameEn: "Team 2 (4.7): Acheron + Ashveil + Mortenax Blade + Hyacine",
      descRu: "Альтернативный состав HSR Build, отмеченный в 0,5% прохождений четырёх режимов в версии 4.6: Мортенакс накладывает ослабления для зарядов Ахерон, Эшвейл наносит урон бонус-атаками, Гиацина лечит.",
      descEn: "Alternative HSR Build team seen in 0.5% of clears across four modes in version 4.6: Mortenax applies Acheron-charge debuffs, Ashveil contributes follow-up damage, and Hyacine heals.",
      isEstimate: true,
      sourceVersion: "4.7",
      sourceUpdatedAt: "2026-11-08",
      sourceUrl: "https://www.hsr-build.com/best-teams/acheron",
      teammates: [
        {
          id: "1504", nameRu: "Эшвейл", nameEn: "Ashveil", icon: "icon/character/1504.png",
          roleRu: "Охота / бонус-атаки", roleEn: "Hunt / follow-up attacker",
          buffDescRu: "Добавляет частые бонус-атаки и совместную механику с Мортенаксом.", buffDescEn: "Adds frequent follow-ups and synergy with Mortenax Blade.",
          buffValues: { fuaVuln: 20 }
        },
        {
          id: "1507", nameRu: "Мортенакс Блэйд", nameEn: "Mortenax Blade", icon: "icon/character/1507.png",
          roleRu: "Небытие / ослабления", roleEn: "Nihility / debuffer",
          buffDescRu: "Накладывает ослабления, срез защиты и уязвимость.", buffDescEn: "Applies debuffs, DEF shred and vulnerability.",
          buffValues: { allVuln: 50, defShred: 30 }
        },
        {
          id: "1409", nameRu: "Гиацина", nameEn: "Hyacine", icon: "icon/character/1409.png",
          roleRu: "Сустейн / лечение", roleEn: "Sustain / healer",
          buffDescRu: "Лечит команду, в том числе компенсируя расход HP Мортенакса.", buffDescEn: "Heals the team, including Mortenax's HP consumption.",
          buffValues: { crGrant: 12, energyFeed: 20 }
        }
      ]
    }
  ],
  "1015": [
    {
      id: "archer_rin_sparkle_huohuo",
      nameRu: "Отряд 1 (4.7): Премиум Fate-Гиперкерри (Рин Тосака + Искорка + Хохо)",
      nameEn: "Team 1 (4.7): Premium Fate Hypercarry (Rin Tohsaka + Sparkle + Huohuo)",
      descRu: "Основной отряд Арчера: Рин Тосака заливает энергию ультимейтов и драгоценные камни, Искорка даёт 50% продвижение хода и лимит 7 SP, а Хохо — лучший сустейн под батарейку ультимейтов Арчера (+20% энергии команде, +40% ATK и непрерывное очищение дебаффов).",
      descEn: "Premier Archer squad: Rin Tohsaka feeds ultimate energy & gems, Sparkle provides 50% advance and expands SP cap to 7, while Huohuo acts as best sustain (+20% energy, +40% ATK, and cleanse).",
      isEstimate: true,
      teammates: [
        {
          id: "1508",
          nameRu: "Рин Тосака",
          nameEn: "Rin Tohsaka",
          icon: "icon/character/1508.png",
          names: ["рин тосака", "rin tohsaka", "рин", "tohsaka"],
          roleRu: "Fate Саппорт (Энергия и Монеты)",
          roleEn: "Fate Support (Energy & Coins)",
          buffDescRu: "Заливка энергии ультимейтов, генерация драгоценных камней и +40% урон навыка",
          buffValues: { energyFeed: 30, dmgBoost: 40 }
        },
        {
          id: "1306",
          nameRu: "Искорка",
          nameEn: "Sparkle",
          icon: "icon/character/1306.png",
          names: ["искорка", "sparkle"],
          roleRu: "Гармония (Продвижение и Лимит 7 SP)",
          roleEn: "Harmony (Advance & 7 SP Cap)",
          buffDescRu: "+50% Продвижение хода, лимит 7 SP, передача +102% КУ, +48% урон",
          buffValues: { targetAdvance: 50, cdGrant: 102, dmgBoost: 48 }
        },
        {
          id: "1217",
          altIds: ["1414"],
          nameRu: "Хохо",
          nameEn: "Huohuo",
          icon: "icon/character/1217.png",
          names: ["хохо", "huohuo", "дань хэн", "permansor"],
          roleRu: "Изобилие (Лучший Сустейн / Батарейка)",
          roleEn: "Abundance (Best Sustain / Energy Battery)",
          buffDescRu: "Лучший сустейн Арчера: заливка +20% энергии ультимейтов всему отряду, бафф +40% ATK, снятие дебаффов",
          buffValues: { energyFeed: 20, dmgBoost: 40 }
        }
      ]
    },
    {
      id: "archer_rin_sparkle_dhpt",
      nameRu: "Отряд 2 (4.7): Синергия Пустошей (Рин Тосака + Искорка + Дань Хэн • Освободитель Пустошей)",
      nameEn: "Team 2 (4.7): Wasteland Synergy (Rin Tohsaka + Sparkle + Dan Heng • Permansor Terrae)",
      descRu: "Второй вариант сустейна для Арчера: Дань Хэн • Освободитель Пустошей гарантирует монолитную выживаемость, щиты от атак и снижение входящего урона под агрессивным разгоном Искорки и Рин Тосаки.",
      descEn: "Second sustain option for Archer: Dan Heng • Permansor Terrae ensures unbreakable survivability, shields, and team damage mitigation alongside Sparkle and Rin Tohsaka.",
      isEstimate: true,
      teammates: [
        {
          id: "1508",
          nameRu: "Рин Тосака",
          nameEn: "Rin Tohsaka",
          icon: "icon/character/1508.png",
          names: ["рин тосака", "rin tohsaka", "рин", "tohsaka"],
          roleRu: "Fate Саппорт (Энергия и Монеты)",
          roleEn: "Fate Support (Energy & Coins)",
          buffDescRu: "Заливка энергии ультимейтов, генерация драгоценных камней и +40% урон навыка",
          buffValues: { energyFeed: 30, dmgBoost: 40 }
        },
        {
          id: "1306",
          nameRu: "Искорка",
          nameEn: "Sparkle",
          icon: "icon/character/1306.png",
          names: ["искорка", "sparkle"],
          roleRu: "Гармония (Продвижение и Лимит 7 SP)",
          roleEn: "Harmony (Advance & 7 SP Cap)",
          buffDescRu: "+50% Продвижение хода, лимит 7 SP, передача +102% КУ, +48% урон",
          buffValues: { targetAdvance: 50, cdGrant: 102, dmgBoost: 48 }
        },
        {
          id: "1414",
          altIds: ["1217"],
          nameRu: "Дань Хэн • Освободитель Пустошей",
          nameEn: "Dan Heng • Permansor Terrae",
          icon: "icon/character/1414.png",
          names: ["дань хэн • освободитель пустошей", "дань хэн", "dan heng", "permansor", "dhpt"],
          roleRu: "Сохранение (Второй Вариант Сустейна)",
          roleEn: "Preservation (Second Sustain Option)",
          buffDescRu: "Второй вариант сустейна: мощные командные щиты, снижение входящего урона, защита от ваншотов",
          buffValues: { teamShield: true, dmgBoost: 20 }
        }
      ]
    }
  ],

  // Химеко: Нова (1510) — Verdict-стенс
  "1510": [
    {
      id: "himeko_nova_47_sunday_ruanmei_lingsha",
      nameRu: "Отряд 1 (4.7): Химеко • Нова (Воскресенье + Жуань Мэй + Линша)",
      nameEn: "Team 1 (4.7): Himeko • Nova (Sunday + Ruan Mei + Lingsha)",
      descRu: "Основная команда HSR Build 4.7. Талант Химеко • Новы даёт союзникам Assist Skill, поэтому Воскресенье ускоряет число действий, Жуань Мэй усиливает команду, а Линша сохраняет выживаемость и помогает атаковать.",
      descEn: "HSR Build 4.7 primary team. Himeko • Nova grants allies an Assist Skill, so Sunday increases action frequency, Ruan Mei amplifies the team, and Lingsha sustains while contributing attacks.",
      sourceVersion: "4.7",
      sourceUpdatedAt: "2026-11-08",
      sourceUrl: "https://www.hsr-build.com/best-teams/himeko-nova",
      teammates: [
        {
          id: "1313", nameRu: "Воскресенье", nameEn: "Sunday", icon: "icon/character/1313.png",
          roleRu: "Продвижение действий", roleEn: "Action advance",
          buffDescRu: "Продвигает Химеко • Нову и помогает ей чаще запускать Assist Skill.", buffDescEn: "Advances Himeko • Nova so she can trigger Assist Skills more often.",
          buffValues: { targetAdvance: 100, cdGrant: 80, dmgBoost: 50, energyFeed: 40 }
        },
        {
          id: "1303", nameRu: "Жуань Мэй", nameEn: "Ruan Mei", icon: "icon/character/1303.png",
          roleRu: "Усиление команды", roleEn: "Team amplifier",
          buffDescRu: "Усиливает урон и эффективность пробития команды.", buffDescEn: "Amplifies team damage and Break efficiency.",
          buffValues: { breakEff: 50, resPen: 25, teamSpd: 10, dmgBoost: 68 }
        },
        {
          id: "1222", nameRu: "Линша", nameEn: "Lingsha", icon: "icon/character/1222.png",
          roleRu: "Сустейн / атаки", roleEn: "Sustain / attacks",
          buffDescRu: "Лечит команду и наносит частые атаки для активации Assist Skill.", buffDescEn: "Heals the team and attacks frequently to trigger Assist Skills.",
          buffValues: { breakVuln: 25 }
        }
      ]
    },
    {
      id: "himeko_nova_47_robin_welt_dhpt",
      nameRu: "Отряд 2 (4.7): Зарянка • Яснопея + Вельт + Дань Хэн • Освободитель Пустошей",
      nameEn: "Team 2 (4.7): Robin • Summeretto + Welt + Dan Heng • Permansor Terrae",
      descRu: "Альтернатива из выборки HSR Build: Зарянка продвигает Химеко • Нову и восстанавливает энергию, Вельт снижает защиту, Дань Хэн • Освободитель Пустошей защищает команду.",
      descEn: "HSR Build alternative: Robin • Summeretto advances Himeko • Nova and restores Energy, Welt shreds DEF, and Dan Heng • Permansor Terrae sustains.",
      isEstimate: true,
      sourceVersion: "4.7",
      sourceUpdatedAt: "2026-11-08",
      sourceUrl: "https://www.hsr-build.com/best-teams/himeko-nova",
      teammates: [
        {
          id: "1512", nameRu: "Зарянка • Яснопея", nameEn: "Robin • Summeretto", icon: "icon/character/1512.png",
          roleRu: "Продвижение и энергия", roleEn: "Action advance and Energy",
          buffDescRu: "Продвигает Химеко • Нову и помогает чаще использовать Assist Skill.", buffDescEn: "Advances Himeko • Nova and helps her trigger Assist Skills more often.",
          buffValues: { targetAdvance: 100, energyFeed: 40, atkGrant: 900, dmgBoost: 50 }
        },
        {
          id: "1004", nameRu: "Вельт", nameEn: "Welt", icon: "icon/character/1004.png",
          roleRu: "Ослабление врага", roleEn: "Enemy debuffer",
          buffDescRu: "Снижает защиту противника и задерживает его действия.", buffDescEn: "Shreds enemy DEF and delays its actions.",
          buffValues: { defShred: 40 }
        },
        {
          id: "1414", nameRu: "Дань Хэн • Освободитель Пустошей", nameEn: "Dan Heng • Permansor Terrae", icon: "icon/character/1414.png",
          roleRu: "Сустейн / щиты", roleEn: "Sustain / shields",
          buffDescRu: "Даёт щиты и защищает команду.", buffDescEn: "Provides shields and protects the team.",
          buffValues: { teamShield: true, atkGrant: 650 }
        }
      ]
    },
    {
      id: "himeko_nova_47_mortenax_welt_dhpt",
      nameRu: "Отряд 3 (4.7): Мортенакс + Вельт + Дань Хэн • Освободитель Пустошей",
      nameEn: "Team 3 (4.7): Mortenax Blade + Welt + Dan Heng • Permansor Terrae",
      descRu: "Альтернатива из свежей выборки: двойное ослабление защиты через Вельта и Мортенакса; Дань Хэн • Освободитель Пустошей компенсирует расход HP Мортенаксом.",
      descEn: "A current sampled alternative: Welt and Mortenax Blade both weaken enemy DEF, while Dan Heng • Permansor Terrae supports Mortenax's HP-spending playstyle.",
      isEstimate: true,
      sourceVersion: "4.7",
      sourceUpdatedAt: "2026-11-08",
      sourceUrl: "https://www.hsr-build.com/best-teams/himeko-nova",
      teammates: [
        {
          id: "1507", nameRu: "Мортенакс Блэйд", nameEn: "Mortenax Blade", icon: "icon/character/1507.png",
          roleRu: "Ослабление / саб-ДД", roleEn: "Debuffer / sub-DPS",
          buffDescRu: "Снижает защиту и уязвимость врагов.", buffDescEn: "Shreds enemy DEF and increases damage taken.",
          buffValues: { allVuln: 50, defShred: 30 }
        },
        {
          id: "1004", nameRu: "Вельт", nameEn: "Welt", icon: "icon/character/1004.png",
          roleRu: "Ослабление врага", roleEn: "Enemy debuffer",
          buffDescRu: "Снижает защиту противника и задерживает его действия.", buffDescEn: "Shreds enemy DEF and delays its actions.",
          buffValues: { defShred: 40 }
        },
        {
          id: "1414", nameRu: "Дань Хэн • Освободитель Пустошей", nameEn: "Dan Heng • Permansor Terrae", icon: "icon/character/1414.png",
          roleRu: "Сустейн / щиты", roleEn: "Sustain / shields",
          buffDescRu: "Защищает команду и поддерживает ротацию.", buffDescEn: "Protects the team and supports the rotation.",
          buffValues: { teamShield: true, atkGrant: 650 }
        }
      ]
    }
  ],
  "1408": [
    {
      id: "phainon_47_titan_league_sustain",
      nameRu: "Отряд 1 (4.7): Лига Титанов (Керидра + Кирена + Гиацина)",
      nameEn: "Team 1 (4.7): Titan League (Cerydra + Cyrene + Hyacine)",
      descRu: "Топ-отряд Фаенона 4.7: Керидра и Кирена поддерживают его уникальную механику титанов и ульт, Гиацина держит выживание и даёт +12% КШ.",
      descEn: "Phainon's top 4.7 squad: Cerydra and Cyrene empower his titan mechanics and ult, Hyacine sustains and adds +12% CR.",
      isEstimate: true,
      teammates: [
        {
          id: "1412",
          nameRu: "Керидра",
          nameEn: "Cerydra",
          icon: "icon/character/1412.png",
          names: ["керидра", "cerydra"],
          roleRu: "Саппорт (Усиление ульты)",
          roleEn: "Support (Ult Empower)",
          buffDescRu: "Мудрость: КУ + урон",
          buffValues: { dmgBoost: 40, cdGrant: 60 }
        },
        {
          id: "1415",
          nameRu: "Кирена",
          nameEn: "Cyrene",
          icon: "icon/character/1415.png",
          names: ["кирена", "cyrene"],
          roleRu: "Саппорт (Мемо-бафы)",
          roleEn: "Support (Memo Buffs)",
          buffDescRu: "Мемо-бафы, урон и продвижение",
          buffValues: { dmgBoost: 30, teamAdvance: 50 }
        },
        {
          id: "1409",
          nameRu: "Гиацина",
          nameEn: "Hyacine",
          icon: "icon/character/1409.png",
          names: ["гиацина", "hyacine"],
          roleRu: "Сохранение (Лечение и КШ)",
          roleEn: "Sustain (Heals & CR)",
          buffDescRu: "Лечение, щиты, +12% КШ",
          buffValues: { crGrant: 12, energyFeed: 20 }
        }
      ]
    }
  ],

  // Сэйбер (1014) — Fate Collab
  "1014": [
    {
      id: "saber_gilgamesh_robin_huohuo",
      nameRu: "Отряд 1: Excalibur (Гильгамеш + Зарянка + Хохо)",
      nameEn: "Team 1: Excalibur (Gilgamesh + Robin + Huohuo)",
      descRu: "Топ-отряд Сэйбер в AA 4.7: Гильгамеш — суб-ДПС и дебаф, Зарянка — баф атаки, Хохо — энергия и лечение.",
      descEn: "Saber's top AA 4.7 team: Gilgamesh as sub-DPS and debuff, Robin ATK buff, Huohuo energy and healing.",
      teammates: [
        {
          id: "1509",
          nameRu: "Гильгамеш",
          nameEn: "Gilgamesh",
          icon: "icon/character/1509.png",
          names: ["гильгамеш", "gilgamesh"],
          roleRu: "Нихилия (Суб-ДПС и дебаф)",
          roleEn: "Nihility (Sub-DPS & Debuff)",
          buffDescRu: "Дебаф урона, собственные атаки",
          buffValues: { allVuln: 20 }
        },
        {
          id: "1309",
          nameRu: "Зарянка",
          nameEn: "Robin",
          icon: "icon/character/1309.png",
          names: ["зарянка", "робин", "robin"],
          roleRu: "Саппорт (Атака и продвижение)",
          roleEn: "Support (ATK & Advance)",
          buffDescRu: "Баф ATK, продвижение всего отряда",
          buffValues: { teamAdvance: 100, dmgBoost: 50 }
        },
        {
          id: "1217",
          nameRu: "Хохо",
          nameEn: "Huohuo",
          icon: "icon/character/1217.png",
          names: ["хохо", "huohuo"],
          roleRu: "Изобилие (Энергия и лечение)",
          roleEn: "Sustain (Energy & Healing)",
          buffDescRu: "+ATK и восстановление энергии для отряда",
          buffValues: { atkGrant: 650, energyFeed: 20 }
        }
      ]
    }
  ],

  // Кастория (1407) — мемо-отряд 4.7
  "1407": [
    {
      id: "castorice_evernight_tribbie_hyacine",
      nameRu: "Отряд 1 (4.7): Мемо-отряд (Темень + Трибби + Гиацина)",
      nameEn: "Team 1 (4.7): Memo Team (Evernight + Tribbie + Hyacine)",
      descRu: "Оценка 4.7: Темень усиливает мемо-сущность, Трибби даёт уязвимость +24%, Гиацина лечит и бафит КШ.",
      descEn: "4.7 estimate: Evernight amplifies the memosprite, Tribbie grants +24% vulnerability, Hyacine heals and buffs CRIT.",
      isEstimate: true,
      teammates: [
        {
          id: "1413",
          nameRu: "Темень",
          nameEn: "Evernight",
          icon: "icon/character/1413.png",
          names: ["темень", "evernight"],
          roleRu: "Саппорт (Мемо-усиление)",
          roleEn: "Support (Memo Amplify)",
          buffDescRu: "Усиление мемо-сущности",
          buffValues: { dmgBoost: 30 }
        },
        {
          id: "1403",
          nameRu: "Трибби",
          nameEn: "Tribbie",
          icon: "icon/character/1403.png",
          names: ["трибби", "tribbie"],
          roleRu: "Саппорт (Уязвимость)",
          roleEn: "Support (Vulnerability)",
          buffDescRu: "+24% уязвимости всех типов",
          buffValues: { allVuln: 24 }
        },
        {
          id: "1409",
          nameRu: "Гиацина",
          nameEn: "Hyacine",
          icon: "icon/character/1409.png",
          names: ["гиацина", "hyacine"],
          roleRu: "Сохранение (Лечение и КШ)",
          roleEn: "Sustain (Heals & CR)",
          buffDescRu: "Лечение, +12% КШ",
          buffValues: { crGrant: 12, energyFeed: 20 }
        }
      ]
    }
  ]
};
