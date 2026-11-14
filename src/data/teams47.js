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
      id: "acheron_47_mortenax_sunday_sustain",
      nameRu: "Отряд 1 (4.7): Дебафф-Гиперкерри (Мортенакс Блэйд + Воскресенье + Гиацина)",
      nameEn: "Team 1 (4.7): Debuff Hypercarry (Mortenax Blade + Sunday + Hyacine)",
      descRu: "Мета 4.7: Мортенакс Блэйд выступает топовым суб-ДПС и дебаффером Ахерон (быстрый набор Слэша при каждом действии), Воскресенье продвигает ход на 100% и заливает КУ, Гиацина обеспечивает выживание и баффает КШ.",
      descEn: "4.7 meta: Mortenax Blade acts as premier Sub-DPS and debuffer for Acheron (fast Slash charging), Sunday gives 100% advance and Crit DMG, Hyacine sustains and buffs CRIT.",
      isEstimate: true,
      teammates: [
        {
          id: "1507",
          nameRu: "Мортенакс Блэйд",
          nameEn: "Mortenax Blade",
          icon: "icon/character/1507.png",
          names: ["мортенакс", "mortenax"],
          roleRu: "Нихилия (Дебафы и суб-ДПС)",
          roleEn: "Nihility (Debuffs & Sub-DPS)",
          buffDescRu: "Зона Balefire Bind: срез защиты (-30%), уязвимость (+50%), набор зарядов Слеша при каждом действии союзников",
          buffDescEn: "Balefire Bind Zone: DEF shred (-30%), vulnerability (+50%), Knot charge feeds on all ally actions",
          buffValues: { allVuln: 50, defShred: 30 }
        },
        {
          id: "1313",
          nameRu: "Воскресенье",
          nameEn: "Sunday",
          icon: "icon/character/1313.png",
          names: ["воскресенье", "sunday"],
          roleRu: "Гармония (100% Продвижение и КУ)",
          roleEn: "Harmony (100% Advance & Crit)",
          buffDescRu: "100% Продвижение хода, передача КУ и энергии",
          buffValues: { targetAdvance: 100, cdGrant: 80, dmgBoost: 50 }
        },
        {
          id: "1409",
          altIds: ["1301", "1208"],
          nameRu: "Гиацина",
          nameEn: "Hyacine",
          icon: "icon/character/1409.png",
          names: ["гиацина", "hyacine", "галлахер", "gallagher"],
          roleRu: "Сохранение (Лечение и КШ)",
          roleEn: "Sustain (Heals & CR)",
          buffDescRu: "Надёжное выживание, щиты, +12% КШ отряду",
          buffValues: { crGrant: 12, energyFeed: 20 }
        }
      ]
    }
  ],

  // Арчер (1015) — Fate Квантовая Охота
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
      id: "himeko_nova_47_mortenax_sunday_rmc",
      nameRu: "Отряд 1 (4.7): Verdict-стенс (Мортенакс Блэйд + Воскресенье + Первопроходец (Память))",
      nameEn: "Team 1 (4.7): Verdict Stance (Mortenax Blade + Sunday + Remembrance Trailblazer)",
      descRu: "Синергия 4.7: Мортенакс Блэйд даёт сильные дебафы и поддерживает оба стенса, Воскресенье — энергию и быстрые ходы для частых Assist Skills, Первопроходец Памяти — главный Verdict-союзник (True DMG и ходы).",
      descEn: "4.7 synergy: Mortenax Blade provides strong debuffs supporting both stances, Sunday gives energy & turns for Assist Skills, Remembrance TB deals True DMG.",
      isEstimate: true,
      teammates: [
        {
          id: "1507",
          nameRu: "Мортенакс Блэйд",
          nameEn: "Mortenax Blade",
          icon: "icon/character/1507.png",
          names: ["мортенакс", "mortenax"],
          roleRu: "Нихилия (Дебафы и атаки)",
          roleEn: "Nihility (Debuffs and Attacks)",
          buffDescRu: "Сильные дебафы для Химеко Новы, поддержка обоих стенсов",
          buffValues: { allVuln: 25, defShred: 20 }
        },
        {
          id: "1313",
          nameRu: "Воскресенье",
          nameEn: "Sunday",
          icon: "icon/character/1313.png",
          names: ["воскресенье", "sunday"],
          roleRu: "Гармония (Энергия и продвижение)",
          roleEn: "Harmony (Energy and Advance)",
          buffDescRu: "Энергия и быстрые ходы подряд — чаще срабатывают Assist Skills",
          buffValues: { targetAdvance: 100 }
        },
        {
          id: "8007",
          altIds: ["8008"],
          nameRu: "Первопроходец (Память)",
          nameEn: "Trailblazer (Remembrance)",
          icon: "icon/character/8007.png",
          names: ["первопроходец", "trailblazer"],
          roleRu: "Память (Verdict-стенс, True DMG)",
          roleEn: "Remembrance (Verdict Stance, True DMG)",
          buffDescRu: "Главный Verdict-союзник: True DMG и abundance ходов",
          buffValues: { teamAdvance: 100, dmgBoost: 24 }
        }
      ]
    }
  ],

  // Фаенон (1408) — мета 4.7 (Лига Титанов с сустейном)
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
