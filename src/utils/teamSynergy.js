export const CHARACTER_SQUADS = {



  "1510": [
    {
      id: "himeko_nova_sparkle_sunday_dhpt",
      nameRu: "Отряд 1: Verdict-гиперкерри (Искорка + Воскресенье + Дань Хэн • Освободитель Пустошей)",
      nameEn: "Team 1: Verdict Hypercarry (Sparkle + Sunday + Dan Heng • Permansor Terrae)",
      descRu: "Самый частый состав в выборке AstraVoy за версии 4.4–4.6: Искорка усиливает керри, Воскресенье даёт продвижение и энергию, а Дань Хэн • Освободитель Пустошей обеспечивает защиту и поддерживает Verdict.",
      descEn: "The most observed team in AstraVoy’s versions 4.4–4.6 sample: Sparkle amplifies the carry, Sunday provides action advance and Energy, and Dan Heng • Permansor Terrae sustains the team and supports Verdict.",
      teammates: [
        {
          id: "1306",
          nameRu: "Искорка",
          nameEn: "Sparkle",
          icon: "icon/character/1306.png",
          names: ["искорка", "sparkle"],
          roleRu: "Саппорт (Усиление керри)",
          roleEn: "Harmony (Carry Support)",
          buffDescRu: "Продвижение действия и усиление критического урона Химеко • Новы",
          buffDescEn: "Action advance and CRIT DMG buffs for Himeko • Nova",
          buffValues: { targetAdvance: 50, spBurst: 4 }
        },
        {
          id: "1313",
          nameRu: "Воскресенье",
          nameEn: "Sunday",
          icon: "icon/character/1313.png",
          names: ["воскресенье", "sunday"],
          roleRu: "Саппорт (Продвижение и энергия)",
          roleEn: "Harmony (Action Advance and Energy)",
          buffDescRu: "Продвигает Химеко • Нову, восстанавливает ей энергию и активирует Verdict",
          buffDescEn: "Advances Himeko • Nova, restores her Energy and enables Verdict",
          buffValues: { targetAdvance: 100, energyFeed: true }
        },
        {
          id: "1414",
          nameRu: "Дань Хэн • Освободитель Пустошей",
          nameEn: "Dan Heng • Permansor Terrae",
          icon: "icon/character/1414.png",
          names: ["дань хэн • Освободитель Пустошей", "dan heng • permansor terrae", "permansor terrae"],
          roleRu: "Сохранение (Щиты и усиление)",
          roleEn: "Preservation (Shield and Buff)",
          buffDescRu: "Даёт щиты, усиливает атаку и также активирует Verdict",
          buffDescEn: "Provides shields, buffs ATK and also enables Verdict",
          buffValues: { teamShield: true, atkGrant: 650 }
        }
      ]
    },
    {
      id: "himeko_nova_welt_sunday_dhpt",
      nameRu: "Отряд 2: Смешанный Verdict / Decimation (Вельт + Воскресенье + Дань Хэн • Освободитель Пустошей)",
      nameEn: "Team 2: Verdict / Decimation (Welt + Sunday + Dan Heng • Permansor Terrae)",
      descRu: "Второй по частоте состав в выборке AstraVoy за версии 4.4–4.6. Вельт даёт доступ к Decimation и ослабляет врагов; Воскресенье и Дань Хэн • Освободитель Пустошей поддерживают Verdict и дают продвижение, энергию и щиты.",
      descEn: "The second most observed team in AstraVoy’s versions 4.4–4.6 sample. Welt enables Decimation and weakens enemies; Sunday and Dan Heng • Permansor Terrae support Verdict with action advance, Energy and shields.",
      teammates: [
        {
          id: "1004",
          nameRu: "Вельт",
          nameEn: "Welt",
          icon: "icon/character/1004.png",
          names: ["вельт", "welt"],
          roleRu: "Небытие (Decimation / Ослабление)",
          roleEn: "Nihility (Decimation / Debuffer)",
          buffDescRu: "Активирует Decimation, снижает защиту и задерживает действия врагов",
          buffDescEn: "Enables Decimation, reduces enemy DEF and delays their actions",
          buffValues: { defShred: 40 }
        },
        {
          id: "1313",
          nameRu: "Воскресенье",
          nameEn: "Sunday",
          icon: "icon/character/1313.png",
          names: ["воскресенье", "sunday"],
          roleRu: "Саппорт (Продвижение и энергия)",
          roleEn: "Harmony (Action Advance and Energy)",
          buffDescRu: "Продвигает Химеко • Нову и помогает чаще использовать её сверхспособность",
          buffDescEn: "Advances Himeko • Nova and helps her use her Ultimate more often",
          buffValues: { targetAdvance: 100, energyFeed: true }
        },
        {
          id: "1414",
          nameRu: "Дань Хэн • Освободитель Пустошей",
          nameEn: "Dan Heng • Permansor Terrae",
          icon: "icon/character/1414.png",
          names: ["дань хэн • Освободитель Пустошей", "dan heng • permansor terrae", "permansor terrae"],
          roleRu: "Сохранение (Щиты)",
          roleEn: "Preservation (Shield Sustain)",
          buffDescRu: "Даёт щиты и усиливает Химеко • Нову; союзник-компаньон также поддерживает ротацию Assist Skill",
          buffDescEn: "Shields and buffs Himeko • Nova; this Companion also supports her Assist Skill rotation",
          buffValues: { teamShield: true, atkGrant: 650 }
        }
      ]
    },
    {
      id: "himeko_nova_welt_robin_dhpt",
      nameRu: "Отряд 3: Decimation с Зарянка • Яснопея (Вельт + Дань Хэн • Освободитель Пустошей)",
      nameEn: "Team 3: Decimation with Robin • Summeretto (Welt + Dan Heng • Permansor Terrae)",
      descRu: "Зафиксированная альтернативная команда: Вельт открывает Decimation, Зарянка • Яснопея усиливает частые атаки и помогает с энергией, Дань Хэн • Освободитель Пустошей даёт защиту. Зарянка требует аккуратного тайминга Assist Skill.",
      descEn: "An observed alternative: Welt enables Decimation, Robin • Summeretto amplifies frequent attacks and helps with Energy, while Dan Heng • Permansor Terrae sustains. Robin requires careful Assist Skill timing.",
      teammates: [
        {
          id: "1004",
          nameRu: "Вельт",
          nameEn: "Welt",
          icon: "icon/character/1004.png",
          names: ["вельт", "welt"],
          roleRu: "Небытие (Decimation / Ослабление)",
          roleEn: "Nihility (Decimation / Debuffer)",
          buffDescRu: "Активирует Decimation, снижает защиту и задерживает действия врагов",
          buffDescEn: "Enables Decimation, reduces enemy DEF and delays their actions",
          buffValues: { defShred: 40 }
        },
        {
          id: "1512",
          nameRu: "Зарянка • Яснопея",
          nameEn: "Robin • Summeretto",
          icon: "icon/character/1512.png",
          names: ["Зарянка • Яснопея", "robin • summeretto", "Зарянка Яснопея", "robin summeretto"],
          roleRu: "Память (Продвижение и энергия)",
          roleEn: "Remembrance (Action Advance and Energy)",
          buffDescRu: "Продвигает Химеко • Нову и помогает ей получать энергию; требует планировать Assist Skill",
          buffDescEn: "Advances Himeko • Nova and helps her gain Energy; Assist Skill timing needs planning",
          buffValues: { targetAdvance: 100, energyFeed: true }
        },
        {
          id: "1414",
          nameRu: "Дань Хэн • Освободитель Пустошей",
          nameEn: "Dan Heng • Permansor Terrae",
          icon: "icon/character/1414.png",
          names: ["дань хэн • Освободитель Пустошей", "dan heng • permansor terrae", "permansor terrae"],
          roleRu: "Сохранение (Щиты и усиление)",
          roleEn: "Preservation (Shield and Buff)",
          buffDescRu: "Даёт щиты, усиливает атаку и поддерживает выживаемость",
          buffDescEn: "Provides shields, buffs ATK and sustains the team",
          buffValues: { teamShield: true, atkGrant: 650 }
        }
      ]
    }
  ],

  "1003": [
    {
      id: "himeko_superbreak",
      nameRu: "Отряд 1: Огненное Суперпробитие (Super Break)",
      nameEn: "Team 1: Fire Super Break",
      descRu: "Максимальный урон против боссов с уязвимостью к огню. Позволяет наносить гигантский урон при каждом истощении стойкости.",
      descEn: "Dominates fire-weak encounters with massive Super Break hits upon toughness breaks.",
      teammates: [
        {
          id: "1303",
          nameRu: "Жуань Мэй",
          nameEn: "Ruan Mei",
          icon: "icon/character/1303.png",
          names: ["руань мэй", "ruan mei", "ruan"],
          roleRu: "Саппорт (Пробитие)",
          roleEn: "Harmony (Break)",
          buffDescRu: "+50% Эффективность пробития, +25% Пробитие всех RES, +10% SPD, +68% Урон",
          buffDescEn: "+50% Break Efficiency, +25% All-Type RES PEN, +10% SPD, +68% DMG",
          buffValues: { breakEff: 50, resPen: 25, teamSpd: 10, dmgBoost: 68 }
        },
        {
          id: "8005",
          altIds: ["8006", "1404"],
          nameRu: "Первопроходец (Гармония)",
          nameEn: "Trailblazer (Harmony)",
          icon: "icon/character/8005.png",
          names: ["первопроходец", "trailblazer", "фугу", "fugue"],
          roleRu: "Саппорт (Суперпробитие)",
          roleEn: "Harmony (Super Break)",
          buffDescRu: "Наложение статуса Суперпробития (160% множитель урона), +30% ЭП отряду",
          buffDescEn: "Super Break trigger (160% multiplier), +30% BE to team",
          buffValues: { superBreakFactor: 1.6, beBoost: 30 }
        },
        {
          id: "1301",
          altIds: ["1222"],
          nameRu: "Галлахер",
          nameEn: "Gallagher",
          icon: "icon/character/1301.png",
          names: ["галлахер", "gallagher", "линша", "lingsha"],
          roleRu: "Изобилие (Сустейн / Пробитие)",
          roleEn: "Abundance (Sustain / Break)",
          buffDescRu: "+12.0% - 25.0% Уязвимость к пробитию, истощение огненной стойкости босса",
          buffDescEn: "+12-25% Break Vulnerability, rapid Fire toughness reduction",
          buffValues: { breakVuln: 18 }
        }
      ]
    },
    {
      id: "himeko_fua_hyper",
      nameRu: "Отряд 2: Победный кураж (Бонус-атаки и Продвижение)",
      nameEn: "Team 2: Victory Rush Follow-up Hypercarry",
      descRu: "Частые бонус-атаки с массовым продвижением отряда и колоссальным усилением критического урона.",
      descEn: "Maximizes Victory Rush follow-up attacks through whole-team action advance and heavy Crit buffs.",
      teammates: [
        {
          id: "1309",
          nameRu: "Зарянка",
          nameEn: "Robin",
          icon: "icon/character/1309.png",
          names: ["Зарянка", "robin"],
          roleRu: "Саппорт (100% Продвижение)",
          roleEn: "Harmony (100% Advance)",
          buffDescRu: "100% Продвижение ВСЕГО отряда, +1100 ATK, +50% Урон, +25% КУ бонус-атак",
          buffDescEn: "100% Team Advance, +1100 ATK, +50% DMG, +25% FUA Crit DMG",
          buffValues: { teamAdvance: 100, atkGrant: 1100, dmgBoost: 50, fuaCd: 25 }
        },
        {
          id: "1313",
          altIds: ["1306", "1112"],
          nameRu: "Воскресенье",
          nameEn: "Sunday",
          icon: "icon/character/1313.png",
          names: ["воскресенье", "sunday", "искорка", "sparkle", "топаз", "topaz"],
          roleRu: "Саппорт (Крит. урон и Заливка)",
          roleEn: "Harmony (Crit & Energy Feed)",
          buffDescRu: "100% Продвижение хода, передача +78% КУ от базы, +50% Урон цели, +40 EP",
          buffDescEn: "100% Target Advance, +78% Crit DMG transfer, +50% DMG, +40 EP",
          buffValues: { targetAdvance: 100, cdGrant: 78, dmgBoost: 50, energyFeed: 40 }
        },
        {
          id: "1304",
          nameRu: "Авантюрин",
          nameEn: "Aventurine",
          icon: "icon/character/1304.png",
          names: ["авантюрин", "aventurine"],
          roleRu: "Сохранение (Щиты / Саб-ДПС)",
          roleEn: "Preservation (Shield & Sub-DPS)",
          buffDescRu: "+15.0% Крит. уязвимость врага, +50% Effect RES отряду, общие бонус-атаки",
          buffDescEn: "+15.0% Crit Vulnerability, +50% Effect RES, co-op follow-up attacks",
          buffValues: { critVuln: 15, teamEffectRes: 50 }
        }
      ]
    }
  ],

  "1308": [
    {
      id: "acheron_meta_pela_sunday_gallagher",
      nameRu: "Отряд 1: Актуальная Мета (Пела + Воскресенье + Галлахер)",
      nameEn: "Team 1: Modern Meta (Pela + Sunday + Gallagher)",
      descRu: "Актуальный соревновательный отряд Ахерон: Пела даёт постоянный AoE срез защиты (-42% DEF) и заряды Слэша, Воскресенье заливает 100% продвижение и КУ, Галлахер накладывает дебаффы Ошеломления и генерирует SP без расхода очков.",
      descEn: "Contemporary Acheron meta setup: Pela ensures 100% uptime AoE DEF shred (-42%) and Slash charge feeds, Sunday provides 100% action advance and Crit DMG, while Gallagher inflicts Besotted debuffs and prints SP.",
      teammates: [
        {
          id: "1105",
          nameRu: "Пела",
          nameEn: "Pela",
          icon: "icon/character/1105.png",
          names: ["пела", "pela"],
          roleRu: "Небытие (AoE Срез Защиты)",
          roleEn: "Nihility (AoE DEF Shred)",
          buffDescRu: "-42.0% Защиты всем врагам с ультимейта каждые 2 хода (с конусом «Решимость»), стабильная заливка Багровых узлов",
          buffDescEn: "-42% AoE DEF shred every 2 turns, stable Crimson Knot generator",
          buffValues: { defShred: 42, allVuln: 16 }
        },
        {
          id: "1313",
          altIds: ["1306"],
          nameRu: "Воскресенье",
          nameEn: "Sunday",
          icon: "icon/character/1313.png",
          names: ["воскресенье", "sunday", "искорка", "sparkle"],
          roleRu: "Саппорт (100% Продвижение и КУ)",
          roleEn: "Support (100% Advance & Crit)",
          buffDescRu: "100% Продвижение хода, заливка энергии, передача +70-100% КУ и +50% общего урона",
          buffDescEn: "100% Action Advance, +70-100% Crit DMG transfer, and +50% DMG boost",
          buffValues: { targetAdvance: 100, cdGrant: 80, dmgBoost: 50 }
        },
        {
          id: "1301",
          altIds: ["1208", "1217"],
          nameRu: "Галлахер",
          nameEn: "Gallagher",
          icon: "icon/character/1301.png",
          names: ["галлахер", "gallagher", "фу сюань", "fu xuan", "хохо", "huohuo"],
          roleRu: "Изобилие (Дебаффы и Генератор SP)",
          roleEn: "Abundance (Debuffs & SP Engine)",
          buffDescRu: "Статус «Ошеломление» (+12% входящего урона пробития), дебафф атаки с усиленной базовой атаки, даёт 2 заряда Ахерон за связку Ульт+Базовая",
          buffDescEn: "Besotted status, ATK debuff on enhanced basic, feeds 2 Crimson Knots via Ult + Enhanced Basic combo",
          buffValues: { allVuln: 12, breakVuln: 12 }
        }
      ]
    },
    {
      id: "acheron_dual_nihility_classic",
      nameRu: "Отряд 2: Чистое Небытие (Пела + Черный Лебедь / Гуйнайфэнь + Фу Сюань)",
      nameEn: "Team 2: Pure Nihility Core (Pela + Black Swan / Guinaifen + Fu Xuan)",
      descRu: "Активация полного следа «Бездна» (160% множитель урона за 2 персонажей Небытия): Пела + второй дебаффер накладывают статус уязвимости и срез защиты, обеспечивая гарантированную заливку ультимейта без просадок по выживанию.",
      descEn: "Full Abyss trace activation (160% damage multiplier for 2 Nihility allies): Pela + secondary debuffer ensure steady Crimson Knot feeds and maximum DEF reduction.",
      teammates: [
        {
          id: "1105",
          nameRu: "Пела",
          nameEn: "Pela",
          icon: "icon/character/1105.png",
          names: ["пела", "pela"],
          roleRu: "Небытие (Срез защиты)",
          roleEn: "Nihility (DEF Shred)",
          buffDescRu: "-42% Защиты всем целям, наложение дебаффов каждым действием",
          buffDescEn: "-42% AoE DEF shred, feeds charges on every action",
          buffValues: { defShred: 42 }
        },
        {
          id: "1307",
          altIds: ["1210"],
          nameRu: "Чёрный Лебедь / Гуйнайфэнь",
          nameEn: "Black Swan / Guinaifen",
          icon: "icon/character/1307.png",
          names: ["чёрный лебедь", "black swan", "гуйнайфэнь", "guinaifen"],
          roleRu: "Небытие (Дебаффы и Уязвимость)",
          roleEn: "Nihility (Debuffs & Vulnerability)",
          buffDescRu: "До +20.8% входящего урона (Арканы/Огненный поцелуй), -20.8% защиты цели, стабильные заряды ультимейта Ахерон",
          buffDescEn: "Up to +20.8% Vulnerability (Arcana / Fire Kiss), -20.8% DEF, constant Knot procs",
          buffValues: { allVuln: 20.8, defShred: 20.8 }
        },
        {
          id: "1208",
          altIds: ["1301", "1203"],
          nameRu: "Фу Сюань",
          nameEn: "Fu Xuan",
          icon: "icon/character/1208.png",
          names: ["фу сюань", "fu xuan", "галлахер", "gallagher", "лоча", "luocha"],
          roleRu: "Сохранение (Крит. Шанс и Защита)",
          roleEn: "Preservation (Crit Rate & Matrix)",
          buffDescRu: "+12.0% Крит. шанс всей команде, блокировка контроля, поглощение 65% урона отряда (с «Трендом» — наложение горения)",
          buffDescEn: "+12% CRIT Rate to team, CC block, absorbs 65% team damage",
          buffValues: { crGrant: 12 }
        }
      ]
    }
  ],

  "1006": [
    {
      id: "sw_quantum_mono",
      nameRu: "Отряд 1: Моно-Квант (Зеле + Искорка + Фу Сюань)",
      nameEn: "Team 1: Mono-Quantum (Seele + Sparkle + Fu Xuan)",
      descRu: "Классический моно-квантовый отряд: Серебряный Волк гарантированно внедряет квантовую уязвимость (100%), снимает до 53% защиты цели со сверхспособности и таланта, разгоняя гиперкерри Зеле.",
      descEn: "Classic Mono-Quantum: Silver Wolf guarantees 100% Quantum weakness implant, shreds up to 53% DEF via Ultimate and bugs, propelling Seele to max output.",
      teammates: [
        {
          id: "1102",
          altIds: ["1211"],
          nameRu: "Зеле / Цинцюэ",
          nameEn: "Seele / Qingque",
          icon: "icon/character/1102.png",
          names: ["зеле", "seele", "цинцюэ", "qingque"],
          roleRu: "Квантовый Керри",
          roleEn: "Quantum Main Carry",
          buffDescRu: "Реализует внедрённую квантовую уязвимость и срез защиты Волка",
          buffValues: { carrySynergy: true }
        },
        {
          id: "1306",
          nameRu: "Искорка",
          nameEn: "Sparkle",
          icon: "icon/character/1306.png",
          names: ["искорка", "sparkle"],
          roleRu: "Саппорт (Продвижение и КУ)",
          roleEn: "Harmony (Advance & Crit DMG)",
          buffDescRu: "+50% Продвижение хода, передача +102% КУ, +48% Урон отряду",
          buffValues: { targetAdvance: 50, cdGrant: 102, dmgBoost: 48 }
        },
        {
          id: "1208",
          nameRu: "Фу Сюань",
          nameEn: "Fu Xuan",
          icon: "icon/character/1208.png",
          names: ["фу сюань", "fu xuan"],
          roleRu: "Сохранение (Матрица Прорицания)",
          roleEn: "Preservation (Crit Rate & Matrix)",
          buffDescRu: "+12.0% Крит. шанс команде, поглощение входящего урона",
          buffValues: { crGrant: 12 }
        }
      ]
    },
    {
      id: "sw_ratio_hyper",
      nameRu: "Отряд 2: Дебафф-Гиперкерри (Д-р Рацио + Воскресенье + Авантюрин)",
      nameEn: "Team 2: Debuff Hypercarry (Dr. Ratio + Sunday + Aventurine)",
      descRu: "Серебряный Волк в одиночку мгновенно накладывает 5 различных дебаффов (уязвимость, срез защиты, баги на атаку, скорость и защиту), гарантируя 100% шанс бонус-атак Доктора Рацио и максимальный крит-бонус.",
      descEn: "Silver Wolf single-handedly inflicts up to 5 unique debuffs, guaranteeing 100% Dr. Ratio follow-up triggers and max talent damage stacks.",
      teammates: [
        {
          id: "1305",
          nameRu: "Д-р Рацио",
          nameEn: "Dr. Ratio",
          icon: "icon/character/1305.png",
          names: ["рацио", "ratio", "д-р рацио", "dr. ratio"],
          roleRu: "Охота (Главный ДПС)",
          roleEn: "Hunt (Main Carry)",
          buffDescRu: "Наносит частые бонус-атаки с максимальным бонусом урона от дебаффов Волка",
          buffValues: { carrySynergy: true }
        },
        {
          id: "1313",
          altIds: ["1306", "1309"],
          nameRu: "Воскресенье",
          nameEn: "Sunday",
          icon: "icon/character/1313.png",
          names: ["воскресенье", "sunday", "искорка", "sparkle", "Зарянка", "robin"],
          roleRu: "Саппорт (Продвижение и КУ)",
          roleEn: "Harmony (Advance & Crit)",
          buffDescRu: "100% Продвижение хода, передача КУ и энергии",
          buffValues: { targetAdvance: 100, cdGrant: 75, dmgBoost: 50 }
        },
        {
          id: "1304",
          altIds: ["1301", "1208"],
          nameRu: "Авантюрин",
          nameEn: "Aventurine",
          icon: "icon/character/1304.png",
          names: ["авантюрин", "aventurine", "галлахер", "gallagher", "фу сюань", "fu xuan"],
          roleRu: "Сохранение (Щиты и Крит. Уязвимость)",
          roleEn: "Preservation (Shields & Crit Vuln)",
          buffDescRu: "Щиты отряду, +15% Крит. уязвимость врага",
          buffValues: { critVuln: 15 }
        }
      ]
    }
  ],
  "1310": [
    {
      id: "firefly_break_meta",
      nameRu: "Отряд 1: Абсолютное Суперпробитие (Жуань Мэй + ГГ)",
      nameEn: "Team 1: Premier Super Break Meta",
      descRu: "Бис-команда Светлячка: максимальное истощение стойкости и непрерывный урон суперпробития.",
      descEn: "Firefly absolute best-in-slot squad: extreme toughness depletion and Super Break burst.",
      teammates: [
        {
          id: "1303",
          nameRu: "Жуань Мэй",
          nameEn: "Ruan Mei",
          icon: "icon/character/1303.png",
          names: ["руань мэй", "ruan mei"],
          roleRu: "Саппорт (Пробитие)",
          roleEn: "Harmony (Break)",
          buffDescRu: "+50% Эффективность пробития, +25% All-Type RES PEN, +10% SPD, задержка восстановления",
          buffValues: { breakEff: 50, resPen: 25, teamSpd: 10 }
        },
        {
          id: "8005",
          altIds: ["8006"],
          nameRu: "Первопроходец (Гармония)",
          nameEn: "Trailblazer (Harmony)",
          icon: "icon/character/8005.png",
          names: ["первопроходец", "trailblazer", "гармония"],
          roleRu: "Саппорт (Суперпробитие)",
          roleEn: "Harmony (Super Break)",
          buffDescRu: "Урон суперпробития от стойкости (160% множитель), +30% ЭП",
          buffValues: { superBreakFactor: 1.6, beBoost: 30 }
        },
        {
          id: "1301",
          altIds: ["1222"],
          nameRu: "Галлахер",
          nameEn: "Gallagher",
          icon: "icon/character/1301.png",
          names: ["галлахер", "gallagher", "линша", "lingsha"],
          roleRu: "Изобилие (Огненный Сустейн)",
          roleEn: "Abundance (Fire Sustain)",
          buffDescRu: "+12-25% Уязвимость к пробитию, быстрая зачистка огненной стойкости",
          buffValues: { breakVuln: 18 }
        }
      ]
    },
    {
      id: "firefly_fugue_variant",
      nameRu: "Отряд 2: Новая Эра (Фугу + Линша)",
      nameEn: "Team 2: Advanced Break Wave",
      descRu: "Вариант с экзотической стойкостью Фугу для пробития врагов без ожидания естественной уязвимости.",
      descEn: "Utilizes Fugue cloud-pinned toughness mechanics to destroy enemies independent of innate weaknesses.",
      teammates: [
        {
          id: "1404",
          nameRu: "Фугу",
          nameEn: "Fugue",
          icon: "icon/character/1404.png",
          names: ["фугу", "fugue"],
          roleRu: "Дебаффер / Саппорт (Экзо-стойкость)",
          roleEn: "Nihility / Harmony",
          buffDescRu: "Внедрение Экзо-стойкости, усиление суперпробития всего отряда",
          buffValues: { exoBreak: true, beBoost: 40 }
        },
        {
          id: "1303",
          nameRu: "Жуань Мэй",
          nameEn: "Ruan Mei",
          icon: "icon/character/1303.png",
          names: ["руань мэй", "ruan mei"],
          roleRu: "Саппорт (Пробитие)",
          roleEn: "Harmony (Break)",
          buffDescRu: "+50% Эффективность пробития, +25% All-Type RES PEN",
          buffValues: { breakEff: 50, resPen: 25 }
        },
        {
          id: "1222",
          nameRu: "Линша",
          nameEn: "Lingsha",
          icon: "icon/character/1222.png",
          names: ["линша", "lingsha"],
          roleRu: "Изобилие (Суперпробитие)",
          roleEn: "Abundance (Super Break)",
          buffDescRu: "+25.0% Уязвимость к пробитию, AoE лечение при каждом ходе зайца",
          buffValues: { breakVuln: 25 }
        }
      ]
    }
  ],

  "1507": [
    {
      id: "mortenax_hypercarry",
      nameRu: "Отряд 1: Бесконечная Ярость (Сандей + Зарянка)",
      nameEn: "Team 1: Infinite Fury Hypercarry",
      descRu: "Гиперкерри через максимальный запас HP: Сандей и Зарянка удваивают действия Мортенакса до истечения Зоны 70 SPD.",
      descEn: "Maximizes personal Fire HP damage before the 70 SPD zone expires via double action advances.",
      teammates: [
        {
          id: "1313",
          nameRu: "Воскресенье",
          nameEn: "Sunday",
          icon: "icon/character/1313.png",
          names: ["воскресенье", "sunday"],
          roleRu: "Саппорт (100% Продвижение)",
          roleEn: "Harmony (100% Advance)",
          buffDescRu: "100% Продвижение хода, передача КУ от базы, +50% Урон цели, +40 EP",
          buffValues: { targetAdvance: 100, cdGrant: 78, dmgBoost: 50 }
        },
        {
          id: "1309",
          altIds: ["1303"],
          nameRu: "Зарянка",
          nameEn: "Robin",
          icon: "icon/character/1309.png",
          names: ["Зарянка", "robin", "жуань мэй", "ruan mei"],
          roleRu: "Саппорт (Командный Урон)",
          roleEn: "Harmony (Team Damage)",
          buffDescRu: "100% Продвижение отряда, +50% Урон, накладывает Узы гибели атаками Концерта",
          buffValues: { teamAdvance: 100, dmgBoost: 50 }
        },
        {
          id: "1304",
          altIds: ["1203"],
          nameRu: "Авантюрин",
          nameEn: "Aventurine",
          icon: "icon/character/1304.png",
          names: ["авантюрин", "aventurine", "лоча", "luocha"],
          roleRu: "Сустейн (Щиты / Авто-отхил)",
          roleEn: "Sustain (Shield / Heal)",
          buffDescRu: "Атаки активируют дебаффы Мортенакса, щиты/хил компенсируют трату HP",
          buffValues: { teamEffectRes: 50 }
        }
      ]
    },
    {
      id: "mortenax_subdps_carry",
      nameRu: "Отряд 2: Синергия 4.7 (Химеко Нова + Воскресенье + Первопроходец Памяти)",
      nameEn: "Team 2: 4.7 Synergy (Himeko Nova + Sunday + Remembrance Trailblazer)",
      descRu: "Ведущая синергия 4.7: Мортенакс Блэйд обеспечивает дебаффы и поддерживает оба стенса (Verdict/Decimation) Химеко Новы, Воскресенье заливает ходы, а Первопроходец Памяти наносит True DMG.",
      descEn: "Top 4.7 synergy: Mortenax Blade provides debuffs supporting both Himeko Nova stances, Sunday feeds turns, and Remembrance Trailblazer procs True DMG.",
      teammates: [
        {
          id: "1510",
          nameRu: "Химеко: Нова",
          nameEn: "Himeko: Nova",
          icon: "icon/character/1510.png",
          names: ["химеко", "himeko", "нова", "nova"],
          roleRu: "Основной ДПС (Verdict-стенс)",
          roleEn: "Main DPS (Verdict Stance)",
          buffDescRu: "Наносит колоссальный урон по дебаффам Мортенакса через Assist Skills",
          buffValues: { carrySynergy: true }
        },
        {
          id: "1313",
          altIds: ["1309"],
          nameRu: "Воскресенье",
          nameEn: "Sunday",
          icon: "icon/character/1313.png",
          names: ["воскресенье", "sunday", "Зарянка", "robin"],
          roleRu: "Саппорт (100% Продвижение и КУ)",
          roleEn: "Harmony (100% Advance & Crit)",
          buffDescRu: "100% Продвижение хода, передача КУ и энергии для постоянных действий",
          buffValues: { targetAdvance: 100, cdGrant: 80, dmgBoost: 50 }
        },
        {
          id: "8007",
          altIds: ["8008", "1301"],
          nameRu: "Первопроходец (Память)",
          nameEn: "Trailblazer (Remembrance)",
          icon: "icon/character/8007.png",
          names: ["первопроходец", "trailblazer", "галлахер", "gallagher"],
          roleRu: "Память (True DMG и Продвижение)",
          roleEn: "Remembrance (True DMG & Advance)",
          buffDescRu: "Ключевой союзник: даёт True DMG и быстрое продвижение ходов",
          buffValues: { teamAdvance: 100, dmgBoost: 24 }
        }
      ]
    }
  ],

  "1220": [
    {
      id: "feixiao_premium_fua",
      nameRu: "Отряд 1: Премиум Бонус-атаки (FUA Meta)",
      nameEn: "Team 1: Premium FUA Meta",
      descRu: "Максимальная скорость накопления Ультимейта за счёт частых совместных атак Топаз, Зарянки и Авантюрина.",
      descEn: "Fastest Flying Aureus ultimate charging via rapid follow-ups from Topaz, Robin & Aventurine.",
      teammates: [
        {
          id: "1309",
          nameRu: "Зарянка",
          nameEn: "Robin",
          icon: "icon/character/1309.png",
          names: ["Зарянка", "robin"],
          roleRu: "Саппорт (100% Продвижение)",
          roleEn: "Harmony (100% Advance)",
          buffDescRu: "100% Продвижение отряда, +1100 ATK, +50% Урон, +25% КУ бонус-атак",
          buffValues: { teamAdvance: 100, atkGrant: 1100, dmgBoost: 50, fuaCd: 25 }
        },
        {
          id: "1112",
          altIds: ["1224", "1223"],
          nameRu: "Топаз",
          nameEn: "Topaz",
          icon: "icon/character/1112.png",
          names: ["топаз", "topaz", "март 7", "march 7th", "модзэ", "moze"],
          roleRu: "Охота (Уязвимость Бонус-атак)",
          roleEn: "Hunt (FUA Vulnerability)",
          buffDescRu: "+50.0% Урона бонус-атак по цели, непрерывные атаки для зарядов Фэйсяо",
          buffValues: { fuaVuln: 50 }
        },
        {
          id: "1304",
          nameRu: "Авантюрин",
          nameEn: "Aventurine",
          icon: "icon/character/1304.png",
          names: ["авантюрин", "aventurine"],
          roleRu: "Сохранение (Щиты / Бонус-атаки)",
          roleEn: "Preservation (FUA Shielder)",
          buffDescRu: "+15.0% Крит. уязвимость, совместные атаки накапливают стаки ульты",
          buffValues: { critVuln: 15 }
        }
      ]
    },
    {
      id: "feixiao_sunday_hyper",
      nameRu: "Отряд 2: Небесное Ускорение (Сандей + Топаз)",
      nameEn: "Team 2: Heavenly Advance Hyper",
      descRu: "Сандей продвигает действия Фэйсяо на 100% и передаёт огромную крит-массу.",
      descEn: "Sunday directly advances Feixiao by 100% and feeds massive Crit DMG.",
      teammates: [
        {
          id: "1313",
          nameRu: "Воскресенье",
          nameEn: "Sunday",
          icon: "icon/character/1313.png",
          names: ["воскресенье", "sunday"],
          roleRu: "Саппорт (100% Продвижение)",
          roleEn: "Harmony (100% Advance)",
          buffDescRu: "100% Продвижение хода, передача КУ от базы, +50% Урон цели",
          buffValues: { targetAdvance: 100, cdGrant: 78, dmgBoost: 50 }
        },
        {
          id: "1112",
          altIds: ["1224"],
          nameRu: "Топаз",
          nameEn: "Topaz",
          icon: "icon/character/1112.png",
          names: ["топаз", "topaz", "март 7", "march 7th"],
          roleRu: "Охота (FUA Бафф)",
          roleEn: "Hunt (FUA Buff)",
          buffDescRu: "+50% Урона бонус-атак по боссу",
          buffValues: { fuaVuln: 50 }
        },
        {
          id: "1304",
          nameRu: "Авантюрин",
          nameEn: "Aventurine",
          icon: "icon/character/1304.png",
          names: ["авантюрин", "aventurine"],
          roleRu: "Сохранение (Танк)",
          roleEn: "Preservation (Tank)",
          buffDescRu: "Щиты отряда, +15% Крит. уязвимость",
          buffValues: { critVuln: 15 }
        }
      ]
    }
  ],

  "1212": [
    {
      id: "jingliu_hyper",
      nameRu: "Отряд 1: Трансмиграция Лунного Света (Броня/Сандей + Пела)",
      nameEn: "Team 1: Spectral Transmigration Hypercarry",
      descRu: "Мгновенный вход в стойку Трансмиграции через 100% продвижение Брони или Сандея и срез защиты Пелы.",
      descEn: "Instant entry into Transmigration via action advances paired with DEF shred.",
      teammates: [
        {
          id: "1101",
          altIds: ["1313"],
          nameRu: "Броня",
          nameEn: "Bronya",
          icon: "icon/character/1101.png",
          names: ["броня", "bronya", "воскресенье", "sunday"],
          roleRu: "Саппорт (100% Продвижение)",
          roleEn: "Harmony (100% Advance)",
          buffDescRu: "100% Продвижение хода, +66% Урон, +55% КУ, +55% ATK",
          buffValues: { targetAdvance: 100, dmgBoost: 66, cdGrant: 55, atkGrant: 600 }
        },
        {
          id: "1105",
          altIds: ["1303"],
          nameRu: "Пела",
          nameEn: "Pela",
          icon: "icon/character/1105.png",
          names: ["пела", "pela", "руань мэй", "ruan mei"],
          roleRu: "Небытие (AoE DEF Shred)",
          roleEn: "Nihility (DEF Shred)",
          buffDescRu: "-42% Срез защиты всех врагов (Капли пота -16% DEF)",
          buffValues: { defShred: 58 }
        },
        {
          id: "1203",
          altIds: ["1217", "1208"],
          nameRu: "Лоча",
          nameEn: "Luocha",
          icon: "icon/character/1203.png",
          names: ["лоча", "luocha", "хохо", "huohuo"],
          roleRu: "Изобилие (Авто-хил)",
          roleEn: "Abundance (Auto-Heal)",
          buffDescRu: "Бесплатное поле исцеления, компенсирующее поглощение HP союзников",
          buffValues: { teamEffectRes: 30 }
        }
      ]
    },
    {
      id: "jingliu_blade_dual",
      nameRu: "Отряд 2: Двойной ДПС (Цзинлю + Блейд)",
      nameEn: "Team 2: Dual Carry Syzygy (Jingliu + Blade)",
      descRu: "Цзинлю при каждой атаке поглощает HP Блейда, непрерывно заряжая его шкалу таланта для совместных контратак.",
      descEn: "Jingliu drains Blade HP on each attack, feeding his talent stacks for frequent follow-ups.",
      teammates: [
        {
          id: "1205",
          nameRu: "Блейд",
          nameEn: "Blade",
          icon: "icon/character/1205.png",
          names: ["блейд", "blade"],
          roleRu: "Разрушение (Саб-ДПС)",
          roleEn: "Destruction (Sub-DPS)",
          buffDescRu: "Частые бонус-атаки при потере HP, мощный второй урон по стойкости",
          buffValues: { carrySynergy: true }
        },
        {
          id: "1303",
          nameRu: "Жуань Мэй",
          nameEn: "Ruan Mei",
          icon: "icon/character/1303.png",
          names: ["руань мэй", "ruan mei"],
          roleRu: "Саппорт (Командный бафф)",
          roleEn: "Harmony (Dual Buffer)",
          buffDescRu: "+68% Урон обоим керри, +25% All-Type RES PEN, +10% SPD",
          buffValues: { dmgBoost: 68, resPen: 25, teamSpd: 10 }
        },
        {
          id: "1203",
          nameRu: "Лоча",
          nameEn: "Luocha",
          icon: "icon/character/1203.png",
          names: ["лоча", "luocha"],
          roleRu: "Изобилие (Сустейн)",
          roleEn: "Abundance (Sustain)",
          buffDescRu: "Пассивный отхил без траты очков действий",
          buffValues: { teamEffectRes: 30 }
        }
      ]
    }
  ],

  "1213": [
    {
      id: "dhil_sparkle_premium",
      nameRu: "Отряд 1: Вспышка Ярости 3-SP (Искорка + Тинъюнь)",
      nameEn: "Team 1: 3-SP Fulgurant Leap Meta (Sparkle + Tingyun)",
      descRu: "Искорка обеспечивает неограниченный запас очков навыков (лимит 7 SP), позволяя ДХПЛ бить усиленным навыком 3 уровня каждый ход.",
      descEn: "Sparkle expands SP to 7 and generates SP rapidly so DHIL casts 3-SP attacks every single turn.",
      teammates: [
        {
          id: "1306",
          nameRu: "Искорка",
          nameEn: "Sparkle",
          icon: "icon/character/1306.png",
          names: ["искорка", "sparkle"],
          roleRu: "Саппорт (Батарейка SP и КУ)",
          roleEn: "Harmony (SP Battery & Crit)",
          buffDescRu: "+50% Продвижение, передача +102% КУ, +48% Урон, запас 7 SP",
          buffValues: { targetAdvance: 50, cdGrant: 102, dmgBoost: 48 }
        },
        {
          id: "1202",
          altIds: ["1313"],
          nameRu: "Тинъюнь",
          nameEn: "Tingyun",
          icon: "icon/character/1202.png",
          names: ["тинъюнь", "tingyun", "воскресенье", "sunday"],
          roleRu: "Саппорт (Заливка 50 EP и ATK)",
          roleEn: "Harmony (50 Energy & ATK)",
          buffDescRu: "+50 Энергии ультимейта (быстрый чешуйчатый щит), +55% ATK, +50% Урон",
          buffValues: { atkGrant: 750, dmgBoost: 50, energyFeed: 50 }
        },
        {
          id: "1304",
          altIds: ["1301", "1217"],
          nameRu: "Авантюрин",
          nameEn: "Aventurine",
          icon: "icon/character/1304.png",
          names: ["авантюрин", "aventurine", "галлахер", "gallagher"],
          roleRu: "Сохранение (SP-позитивный танк)",
          roleEn: "Preservation (SP Positive)",
          buffDescRu: "+15% Крит. уязвимость врага, щиты без расхода очков действий",
          buffValues: { critVuln: 15 }
        }
      ]
    },
    {
      id: "dhil_sunday_advance",
      nameRu: "Отряд 2: Двойное Продвижение (Сандей + Зарянка)",
      nameEn: "Team 2: Absolute Advance Wave",
      descRu: "Сандей передаёт максимальный КУ и заливает 40 энергии для постоянного запаса Чешуи Дракона.",
      descEn: "Sunday directly advances DHIL and feeds 40 EP to sustain Dragon Scales.",
      teammates: [
        {
          id: "1313",
          nameRu: "Воскресенье",
          nameEn: "Sunday",
          icon: "icon/character/1313.png",
          names: ["воскресенье", "sunday"],
          roleRu: "Саппорт (100% Продвижение)",
          roleEn: "Harmony (100% Advance)",
          buffDescRu: "100% Продвижение хода, передача КУ от базы, +50% Урон цели, +40 EP",
          buffValues: { targetAdvance: 100, cdGrant: 78, dmgBoost: 50, energyFeed: 40 }
        },
        {
          id: "1309",
          nameRu: "Зарянка",
          nameEn: "Robin",
          icon: "icon/character/1309.png",
          names: ["Зарянка", "robin"],
          roleRu: "Саппорт (Концерт)",
          roleEn: "Harmony (Concerto)",
          buffDescRu: "100% Продвижение отряда, +1100 ATK, +50% Урон",
          buffValues: { teamAdvance: 100, atkGrant: 1100, dmgBoost: 50 }
        },
        {
          id: "1301",
          nameRu: "Галлахер",
          nameEn: "Gallagher",
          icon: "icon/character/1301.png",
          names: ["галлахер", "gallagher"],
          roleRu: "Изобилие (SP генератор)",
          roleEn: "Abundance (SP Battery)",
          buffDescRu: "Генерирует 3 очка действий за ход через ульт и продвижение",
          buffValues: { breakVuln: 15 }
        }
      ]
    }
  ],

  "1005": [
    {
      id: "kafka_dot_premier",
      nameRu: "Отряд 1: Премиум ДоТ (Чёрный Лебедь + Жуань Мэй)",
      nameEn: "Team 1: Premier DoT Squad",
      descRu: "Золотой стандарт Небытия: Кафка детонирует Арканы Чёрного Лебедя и Шок при каждом навыке и ультимейте.",
      descEn: "The DoT pinnacle: Kafka detonates Black Swan Arcana and Shock stacks on every action.",
      teammates: [
        {
          id: "1307",
          nameRu: "Чёрный Лебедь",
          nameEn: "Black Swan",
          icon: "icon/character/1307.png",
          names: ["чёрный лебедь", "black swan", "лебедь"],
          roleRu: "Небытие (Арканы и -20% DEF)",
          roleEn: "Nihility (Arcana & DEF Shred)",
          buffDescRu: "Эпифания: +25% входящий урон в ход врага, -20.8% Защиты цели, стаки Арканов",
          buffValues: { defShred: 21, vuln: 25, dotEnabler: true }
        },
        {
          id: "1303",
          nameRu: "Жуань Мэй",
          nameEn: "Ruan Mei",
          icon: "icon/character/1303.png",
          names: ["руань мэй", "ruan mei"],
          roleRu: "Саппорт (Пробитие и RES PEN)",
          roleEn: "Harmony (RES PEN)",
          buffDescRu: "+68% Урон ДоТов, +25% All-Type RES PEN, +10% SPD, задержка восстановления стойкости",
          buffValues: { dmgBoost: 68, resPen: 25, teamSpd: 10 }
        },
        {
          id: "1217",
          altIds: ["1301"],
          nameRu: "Хохо",
          nameEn: "Huohuo",
          icon: "icon/character/1217.png",
          names: ["хохо", "huohuo", "галлахер", "gallagher"],
          roleRu: "Изобилие (Заливка энергии и ATK)",
          roleEn: "Abundance (Energy & ATK)",
          buffDescRu: "+20% Энергии отряду, +40% ATK, непрерывное очищение дебаффов",
          buffValues: { atkGrant: 650, energyFeed: 20 }
        }
      ]
    },
    {
      id: "kafka_robin_dot",
      nameRu: "Отряд 2: Скоростной ДоТ с Зарянка (Двойной Концерт)",
      nameEn: "Team 2: Hyperspeed DoT with Robin",
      descRu: "Зарянка продвигает всю ДоТ-команду на 100%, давая Кафке возможность детонировать стаки дважды за цикл.",
      descEn: "Robin advances the entire DoT squad by 100%, enabling back-to-back detonations.",
      teammates: [
        {
          id: "1307",
          nameRu: "Чёрный Лебедь",
          nameEn: "Black Swan",
          icon: "icon/character/1307.png",
          names: ["чёрный лебедь", "black swan"],
          roleRu: "Небытие (Арканы)",
          roleEn: "Nihility (Arcana)",
          buffDescRu: "Стаки Арканов + срез защиты",
          buffValues: { defShred: 21, vuln: 25 }
        },
        {
          id: "1309",
          nameRu: "Зарянка",
          nameEn: "Robin",
          icon: "icon/character/1309.png",
          names: ["Зарянка", "robin"],
          roleRu: "Саппорт (100% Продвижение)",
          roleEn: "Harmony (Advance)",
          buffDescRu: "100% Продвижение отряда, +1100 ATK для масштабирования ДоТов, +50% Урон",
          buffValues: { teamAdvance: 100, atkGrant: 1100, dmgBoost: 50 }
        },
        {
          id: "1301",
          nameRu: "Галлахер",
          nameEn: "Gallagher",
          icon: "icon/character/1301.png",
          names: ["галлахер", "gallagher"],
          roleRu: "Изобилие (Сустейн)",
          roleEn: "Abundance (Sustain)",
          buffDescRu: "+12% Уязвимость к пробитию, быстрое пробитие огненной стойкости",
          buffValues: { breakVuln: 12 }
        }
      ]
    }
  ],

  "1307": [
    {
      id: "swan_kafka_core",
      nameRu: "Отряд 1: Симфония Небытия (Кафка + Жуань Мэй)",
      nameEn: "Team 1: Symphony of Nihility (Kafka + Ruan Mei)",
      descRu: "Кафка непрерывно активирует Арканы Чёрного Лебедя, разгоняя множитель урона свыше 50 стаков.",
      descEn: "Kafka rapidly triggers Arcana stacks to push damage scaling past 50 stacks.",
      teammates: [
        {
          id: "1005",
          nameRu: "Кафка",
          nameEn: "Kafka",
          icon: "icon/character/1005.png",
          names: ["кафка", "kafka"],
          roleRu: "Небытие (Детонатор ДоТов)",
          roleEn: "Nihility (DoT Trigger)",
          buffDescRu: "Детонация 75% урона Арканов с навыка и 100% со сверхспособности, наложение Шока",
          buffValues: { dotTrigger: true }
        },
        {
          id: "1303",
          nameRu: "Жуань Мэй",
          nameEn: "Ruan Mei",
          icon: "icon/character/1303.png",
          names: ["руань мэй", "ruan mei"],
          roleRu: "Саппорт (RES PEN)",
          roleEn: "Harmony (RES PEN)",
          buffDescRu: "+68% Урон ДоТов, +25% All-Type RES PEN, +10% SPD",
          buffValues: { dmgBoost: 68, resPen: 25, teamSpd: 10 }
        },
        {
          id: "1217",
          nameRu: "Хохо",
          nameEn: "Huohuo",
          icon: "icon/character/1217.png",
          names: ["хохо", "huohuo"],
          roleRu: "Изобилие (Батарейка)",
          roleEn: "Abundance (Battery)",
          buffDescRu: "+20% Энергии отряду, +40% ATK для ДоТов",
          buffValues: { atkGrant: 650, energyFeed: 20 }
        }
      ]
    },
    {
      id: "swan_acheron_dual",
      nameRu: "Отряд 2: Двойное Небытие Ахерон (Ахерон + Авантюрин)",
      nameEn: "Team 2: Acheron Dual Nihility",
      descRu: "Арканы и дебаффы Чёрного Лебедя заряжают Слэши Ахерон при каждом появлении или ходе врага.",
      descEn: "Arcana applications grant Slashed Dream charges to Acheron constantly.",
      teammates: [
        {
          id: "1308",
          nameRu: "Ахерон",
          nameEn: "Acheron",
          icon: "icon/character/1308.png",
          names: ["ахерон", "acheron"],
          roleRu: "Основной ДПС (Гиперкерри)",
          roleEn: "Main DPS Carry",
          buffDescRu: "Реализует -20.8% среза защиты Лебедя в гигантские ультимейты",
          buffValues: { carrySynergy: true }
        },
        {
          id: "1218",
          altIds: ["1006", "1105"],
          nameRu: "Цзяоцю",
          nameEn: "Jiaoqiu",
          icon: "icon/character/1218.png",
          names: ["цзяоцю", "jiaoqiu", "пела", "pela"],
          roleRu: "Небытие (Уязвимость)",
          roleEn: "Nihility (Vuln)",
          buffDescRu: "+35% Урон ультимейтов, срез защиты",
          buffValues: { ultVuln: 35, defShred: 40 }
        },
        {
          id: "1304",
          nameRu: "Авантюрин",
          nameEn: "Aventurine",
          icon: "icon/character/1304.png",
          names: ["авантюрин", "aventurine"],
          roleRu: "Сохранение (Танк)",
          roleEn: "Preservation (Tank)",
          buffDescRu: "+15% Крит. уязвимость, щиты отряду",
          buffValues: { critVuln: 15 }
        }
      ]
    }
  ],

  "1315": [
    {
      id: "boothill_break_premier",
      nameRu: "Отряд 1: Одиночная Дуэль Пробития (Жуань Мэй + ГГ)",
      nameEn: "Team 1: Standoff Break Duel",
      descRu: "Бутхилл наносит колоссальный физический урон пробития (до 170% ретриггер шкалы стойкости в дуэли).",
      descEn: "Boothill triggers massive Physical Break retriggers during Standoff.",
      teammates: [
        {
          id: "1303",
          nameRu: "Жуань Мэй",
          nameEn: "Ruan Mei",
          icon: "icon/character/1303.png",
          names: ["руань мэй", "ruan mei"],
          roleRu: "Саппорт (Пробитие)",
          roleEn: "Harmony (Break)",
          buffDescRu: "+50% Эффективность пробития, +25% All-Type RES PEN, +10% SPD",
          buffValues: { breakEff: 50, resPen: 25, teamSpd: 10 }
        },
        {
          id: "1101",
          altIds: ["1313"],
          nameRu: "Броня",
          nameEn: "Bronya",
          icon: "icon/character/1101.png",
          names: ["броня", "bronya", "воскресенье", "sunday"],
          roleRu: "Саппорт (100% Продвижение)",
          roleEn: "Harmony (100% Advance)",
          buffDescRu: "100% Продвижение хода для удвоения выстрелов дуэли",
          buffValues: { targetAdvance: 100, dmgBoost: 66 }
        },
        {
          id: "1301",
          nameRu: "Галлахер",
          nameEn: "Gallagher",
          icon: "icon/character/1301.png",
          names: ["галлахер", "gallagher"],
          roleRu: "Изобилие (Сустейн)",
          roleEn: "Abundance (Sustain)",
          buffDescRu: "+12% Уязвимость к пробитию, SP-батарейка",
          buffValues: { breakVuln: 12 }
        }
      ]
    },
    {
      id: "boothill_fugue_meta",
      nameRu: "Отряд 2: Экзо-Стойкость (Фугу + Линша)",
      nameEn: "Team 2: Exo-Toughness Surge",
      descRu: "Фугу добавляет экзо-стойкость, позволяя Бутхиллу активировать Карманные фокусы даже против целей без физической уязвимости.",
      descEn: "Fugue exo-toughness enables Boothill Pocket Trickshots against non-physical bosses.",
      teammates: [
        {
          id: "1404",
          nameRu: "Фугу",
          nameEn: "Fugue",
          icon: "icon/character/1404.png",
          names: ["фугу", "fugue"],
          roleRu: "Дебаффер / Саппорт",
          roleEn: "Nihility / Harmony",
          buffDescRu: "Экзо-стойкость, +40% ЭП, срез защиты",
          buffValues: { exoBreak: true, beBoost: 40, defShred: 20 }
        },
        {
          id: "1303",
          nameRu: "Жуань Мэй",
          nameEn: "Ruan Mei",
          icon: "icon/character/1303.png",
          names: ["руань мэй", "ruan mei"],
          roleRu: "Саппорт (Пробитие)",
          roleEn: "Harmony (Break)",
          buffDescRu: "+50% Эффективность пробития, +25% RES PEN",
          buffValues: { breakEff: 50, resPen: 25 }
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

  "1317": [
    {
      id: "rappa_break_meta",
      nameRu: "Отряд 1: Ниндзюцу Пробитие (Жуань Мэй + Фугу)",
      nameEn: "Team 1: Premier Ninjutsu Break",
      descRu: "Раппа входит в стойку Ниндзюцу и наносит массовый урон пробития по всем врагам независимо от уязвимостей.",
      descEn: "Rappa enters Ninjutsu seal form to annihilate waves with rainbow toughness shred.",
      teammates: [
        {
          id: "1303",
          nameRu: "Жуань Мэй",
          nameEn: "Ruan Mei",
          icon: "icon/character/1303.png",
          names: ["руань мэй", "ruan mei"],
          roleRu: "Саппорт (Пробитие)",
          roleEn: "Harmony (Break)",
          buffDescRu: "+50% Эффективность пробития, +25% All-Type RES PEN, +10% SPD",
          buffValues: { breakEff: 50, resPen: 25, teamSpd: 10 }
        },
        {
          id: "1404",
          altIds: ["8005"],
          nameRu: "Фугу",
          nameEn: "Fugue",
          icon: "icon/character/1404.png",
          names: ["фугу", "fugue", "первопроходец", "trailblazer"],
          roleRu: "Дебаффер / Саппорт",
          roleEn: "Nihility / Harmony",
          buffDescRu: "Внедрение Экзо-стойкости, усиление суперпробития на 160%",
          buffValues: { superBreakFactor: 1.6, beBoost: 30 }
        },
        {
          id: "1222",
          nameRu: "Линша",
          nameEn: "Lingsha",
          icon: "icon/character/1222.png",
          names: ["линша", "lingsha"],
          roleRu: "Изобилие (Суперпробитие)",
          roleEn: "Abundance (Super Break)",
          buffDescRu: "+25% Уязвимость к пробитию, AoE снятие стойкости",
          buffValues: { breakVuln: 25 }
        }
      ]
    },
    {
      id: "rappa_harmony_tb",
      nameRu: "Отряд 2: Классическое Суперпробитие (Гармония ГГ + Галлахер)",
      nameEn: "Team 2: Classic Harmony TB Break",
      descRu: "Классический сетап с Гармонией ГГ и Галлахером для максимального суперпробития по сломанным боссам.",
      descEn: "Classic super break core with Harmony Trailblazer and Gallagher.",
      teammates: [
        {
          id: "8005",
          nameRu: "Первопроходец (Гармония)",
          nameEn: "Trailblazer (Harmony)",
          icon: "icon/character/8005.png",
          names: ["первопроходец", "trailblazer"],
          roleRu: "Саппорт (Суперпробитие)",
          roleEn: "Harmony (Super Break)",
          buffDescRu: "Суперпробитие стойкости отряда (160%), +30% ЭП",
          buffValues: { superBreakFactor: 1.6, beBoost: 30 }
        },
        {
          id: "1303",
          nameRu: "Жуань Мэй",
          nameEn: "Ruan Mei",
          icon: "icon/character/1303.png",
          names: ["руань мэй", "ruan mei"],
          roleRu: "Саппорт (Пробитие)",
          roleEn: "Harmony (Break)",
          buffDescRu: "+50% Эффективность пробития, +25% RES PEN",
          buffValues: { breakEff: 50, resPen: 25 }
        },
        {
          id: "1301",
          nameRu: "Галлахер",
          nameEn: "Gallagher",
          icon: "icon/character/1301.png",
          names: ["галлахер", "gallagher"],
          roleRu: "Изобилие (Сустейн)",
          roleEn: "Abundance (Sustain)",
          buffDescRu: "+12% Уязвимость к пробитию, высокий брейк стойкости",
          buffValues: { breakVuln: 12 }
        }
      ]
    }
  ],

  "1102": [
    {
      id: "seele_mono_quantum",
      nameRu: "Отряд 1: Моно-Квант Ресургент (Искорка + Волк + Фу Сюань)",
      nameEn: "Team 1: Mono Quantum Resurgence",
      descRu: "Классический моно-квант: 100% внедрение квантовой уязвимости, 100% DEF shred и постоянный статус Повторного хода.",
      descEn: "Guaranteed Quantum weakness implant with massive DEF shred for endless Resurgence extra turns.",
      teammates: [
        {
          id: "1306",
          nameRu: "Искорка",
          nameEn: "Sparkle",
          icon: "icon/character/1306.png",
          names: ["искорка", "sparkle"],
          roleRu: "Саппорт (Продвижение и КУ)",
          roleEn: "Harmony (Advance & Crit)",
          buffDescRu: "+50% Продвижение, передача +102% КУ, +48% Урон, запас 7 SP",
          buffValues: { targetAdvance: 50, cdGrant: 102, dmgBoost: 48 }
        },
        {
          id: "1006",
          nameRu: "Серебряный Волк",
          nameEn: "Silver Wolf",
          icon: "icon/character/1006.png",
          names: ["серебряный волк", "silver wolf"],
          roleRu: "Небытие (Срез защиты и Уязвимость)",
          roleEn: "Nihility (DEF Shred)",
          buffDescRu: "-45% Защиты цели, -20% Квантового RES, внедрение Квантовой уязвимости",
          buffValues: { defShred: 45, resPen: 20 }
        },
        {
          id: "1208",
          nameRu: "Фу Сюань",
          nameEn: "Fu Xuan",
          icon: "icon/character/1208.png",
          names: ["фу сюань", "fu xuan"],
          roleRu: "Сохранение (Матрица прорицания)",
          roleEn: "Preservation (Matrix)",
          buffDescRu: "+12% Крит. шанс отряду, поглощение 65% входящего урона",
          buffValues: { crGrant: 12 }
        }
      ]
    },
    {
      id: "seele_sunday_hyper",
      nameRu: "Отряд 2: Небесный Квант (Сандей + Тинъюнь)",
      nameEn: "Team 2: Heavenly Quantum Hypercarry",
      descRu: "Сандей продвигает Зеле на 100% и заливает энергию для непрерывных ультимейтов в статусе Усиления.",
      descEn: "Sunday advances Seele by 100% and feeds energy for buffed-state ultimate bursts.",
      teammates: [
        {
          id: "1313",
          nameRu: "Воскресенье",
          nameEn: "Sunday",
          icon: "icon/character/1313.png",
          names: ["воскресенье", "sunday"],
          roleRu: "Саппорт (100% Продвижение)",
          roleEn: "Harmony (100% Advance)",
          buffDescRu: "100% Продвижение хода, передача КУ от базы, +50% Урон цели, +40 EP",
          buffValues: { targetAdvance: 100, cdGrant: 78, dmgBoost: 50, energyFeed: 40 }
        },
        {
          id: "1202",
          nameRu: "Тинъюнь",
          nameEn: "Tingyun",
          icon: "icon/character/1202.png",
          names: ["тинъюнь", "tingyun"],
          roleRu: "Саппорт (50 EP & ATK)",
          roleEn: "Harmony (50 Energy & ATK)",
          buffDescRu: "+50 Энергии ультимейта, +55% ATK, +50% Урон",
          buffValues: { atkGrant: 750, dmgBoost: 50, energyFeed: 50 }
        },
        {
          id: "1304",
          nameRu: "Авантюрин",
          nameEn: "Aventurine",
          icon: "icon/character/1304.png",
          names: ["авантюрин", "aventurine"],
          roleRu: "Сохранение (Танк)",
          roleEn: "Preservation (Tank)",
          buffDescRu: "+15% Крит. уязвимость, щиты отряду",
          buffValues: { critVuln: 15 }
        }
      ]
    }
  ],

  "1305": [
    {
      id: "ratio_premium_fua",
      nameRu: "Отряд 1: Премиум FUA Мета (Топаз + Зарянка + Авантюрин)",
      nameEn: "Team 1: Premium FUA IPC Core",
      descRu: "Золотой стандарт бонус-атак: гарантированный 100% шанс броска мела за счёт 3+ дебаффов Топаз и Авантюрина.",
      descEn: "Guaranteed 100% chalk throw probability via Topaz and Aventurine debuffs.",
      teammates: [
        {
          id: "1309",
          nameRu: "Зарянка",
          nameEn: "Robin",
          icon: "icon/character/1309.png",
          names: ["Зарянка", "robin"],
          roleRu: "Саппорт (100% Продвижение)",
          roleEn: "Harmony (100% Advance)",
          buffDescRu: "100% Продвижение отряда, +1100 ATK, +50% Урон, +25% КУ бонус-атак",
          buffValues: { teamAdvance: 100, atkGrant: 1100, dmgBoost: 50, fuaCd: 25 }
        },
        {
          id: "1112",
          nameRu: "Топаз",
          nameEn: "Topaz",
          icon: "icon/character/1112.png",
          names: ["топаз", "topaz"],
          roleRu: "Охота (FUA Уязвимость)",
          roleEn: "Hunt (FUA Vuln)",
          buffDescRu: "+50% Урона бонус-атак по боссу, дебафф Справки о задолженности",
          buffValues: { fuaVuln: 50 }
        },
        {
          id: "1304",
          nameRu: "Авантюрин",
          nameEn: "Aventurine",
          icon: "icon/character/1304.png",
          names: ["авантюрин", "aventurine"],
          roleRu: "Сохранение (Танк)",
          roleEn: "Preservation (Tank)",
          buffDescRu: "+15% Крит. уязвимость, щиты отряду, совместные бонус-атаки",
          buffValues: { critVuln: 15 }
        }
      ]
    },
    {
      id: "ratio_silverwolf_hyper",
      nameRu: "Отряд 2: Дебафф Гиперкерри (Серебряный Волк + Сандей)",
      nameEn: "Team 2: Silver Wolf Debuff Hypercarry",
      descRu: "Волк накладывает до 5 дебаффов одновременно, максимизируя урон мела и крит. шансы Рацио.",
      descEn: "Silver Wolf applies up to 5 debuffs to max out Ratio bonus crit stats instantly.",
      teammates: [
        {
          id: "1006",
          nameRu: "Серебряный Волк",
          nameEn: "Silver Wolf",
          icon: "icon/character/1006.png",
          names: ["серебряный волк", "silver wolf"],
          roleRu: "Небытие (Дебаффы и Срез)",
          roleEn: "Nihility (Debuffs)",
          buffDescRu: "-45% Защиты, внедрение уязвимости, 5 дебаффов для 100% шанса мела",
          buffValues: { defShred: 45, resPen: 20 }
        },
        {
          id: "1313",
          altIds: ["1306"],
          nameRu: "Воскресенье",
          nameEn: "Sunday",
          icon: "icon/character/1313.png",
          names: ["воскресенье", "sunday", "искорка", "sparkle"],
          roleRu: "Саппорт (100% Продвижение)",
          roleEn: "Harmony (100% Advance)",
          buffDescRu: "100% Продвижение хода, передача КУ от базы, +50% Урон",
          buffValues: { targetAdvance: 100, cdGrant: 78, dmgBoost: 50 }
        },
        {
          id: "1304",
          nameRu: "Авантюрин",
          nameEn: "Aventurine",
          icon: "icon/character/1304.png",
          names: ["авантюрин", "aventurine"],
          roleRu: "Сохранение (Танк)",
          roleEn: "Preservation (Tank)",
          buffDescRu: "+15% Крит. уязвимость, щиты отряду",
          buffValues: { critVuln: 15 }
        }
      ]
    }
  ],

  "1221": [
    {
      id: "yunli_counter_premier",
      nameRu: "Отряд 1: Контратаки Интуиции (Зарянка + Сандей + Хохо)",
      nameEn: "Team 1: Intuition Cull Counter Meta",
      descRu: "Юньли провоцирует врагов на атаку и парирует удары сильнейшим ударом Интуиции: Кульминация (до 720% урона).",
      descEn: "Yunli taunts enemies and parries with massive Intuition: Cull counter hits.",
      teammates: [
        {
          id: "1309",
          nameRu: "Зарянка",
          nameEn: "Robin",
          icon: "icon/character/1309.png",
          names: ["Зарянка", "robin"],
          roleRu: "Саппорт (100% Продвижение)",
          roleEn: "Harmony (100% Advance)",
          buffDescRu: "100% Продвижение отряда, +1100 ATK, +50% Урон, +25% КУ контратак",
          buffValues: { teamAdvance: 100, atkGrant: 1100, dmgBoost: 50, fuaCd: 25 }
        },
        {
          id: "1313",
          altIds: ["1202"],
          nameRu: "Воскресенье",
          nameEn: "Sunday",
          icon: "icon/character/1313.png",
          names: ["воскресенье", "sunday", "тинъюнь", "tingyun"],
          roleRu: "Саппорт (Крит и Энергия)",
          roleEn: "Harmony (Crit & Energy)",
          buffDescRu: "100% Продвижение хода, передача КУ, +50% Урон, +40 EP",
          buffValues: { targetAdvance: 100, cdGrant: 78, dmgBoost: 50, energyFeed: 40 }
        },
        {
          id: "1217",
          nameRu: "Хохо",
          nameEn: "Huohuo",
          icon: "icon/character/1217.png",
          names: ["хохо", "huohuo"],
          roleRu: "Изобилие (Батарейка)",
          roleEn: "Abundance (Battery)",
          buffDescRu: "+20% Энергии отряду для постоянной готовности стойки Парирования, +40% ATK",
          buffValues: { atkGrant: 650, energyFeed: 20 }
        }
      ]
    },
    {
      id: "yunli_topaz_fua",
      nameRu: "Отряд 2: Двойные Бонус-атаки (Топаз + Зарянка + Авантюрин)",
      nameEn: "Team 2: Dual FUA Synergy (Topaz + Robin)",
      descRu: "Каждая контратака Юньли продвигает Чумби Топаз, создавая непрерывный шквал совместных ударов.",
      descEn: "Each counter attack from Yunli advances Numby for non-stop co-op strikes.",
      teammates: [
        {
          id: "1112",
          nameRu: "Топаз",
          nameEn: "Topaz",
          icon: "icon/character/1112.png",
          names: ["топаз", "topaz"],
          roleRu: "Охота (FUA Уязвимость)",
          roleEn: "Hunt (FUA Vuln)",
          buffDescRu: "+50% Урона бонус-атак по боссу",
          buffValues: { fuaVuln: 50 }
        },
        {
          id: "1309",
          nameRu: "Зарянка",
          nameEn: "Robin",
          icon: "icon/character/1309.png",
          names: ["Зарянка", "robin"],
          roleRu: "Саппорт (Концерт)",
          roleEn: "Harmony (Concerto)",
          buffDescRu: "100% Продвижение отряда, +1100 ATK, +50% Урон",
          buffValues: { teamAdvance: 100, atkGrant: 1100, dmgBoost: 50 }
        },
        {
          id: "1304",
          nameRu: "Авантюрин",
          nameEn: "Aventurine",
          icon: "icon/character/1304.png",
          names: ["авантюрин", "aventurine"],
          roleRu: "Сохранение (Танк)",
          roleEn: "Preservation (Tank)",
          buffDescRu: "+15% Крит. уязвимость, щиты отряду",
          buffValues: { critVuln: 15 }
        }
      ]
    }
  ],

  "1313": [
    {
      id: "sunday_premier_carry",
      nameRu: "Отряд 1: Премиум Гиперкерри (Сандей баффает керри)",
      nameEn: "Team 1: Premier Hypercarry Enabler",
      descRu: "Сандей выступает ядром отряда, передавая свой критический урон и 100% продвижение главному керри.",
      descEn: "Sunday acts as the team engine, transferring his Crit DMG and 100% action advance to the primary carry.",
      teammates: [
        {
          id: "1212",
          altIds: ["1213", "1220"],
          nameRu: "Цзинлю",
          nameEn: "Jingliu",
          icon: "icon/character/1212.png",
          names: ["цзинлю", "jingliu", "дань хэн", "dan heng", "фэйсяо", "feixiao"],
          roleRu: "Главный ДПС (Поддерживаемый керри)",
          roleEn: "Main DPS (Empowered Carry)",
          buffDescRu: "Получает 100% продвижение хода, +78% КУ и +50% Урона от Сандея",
          buffValues: { carrySynergy: true }
        },
        {
          id: "1309",
          altIds: ["1303", "1105"],
          nameRu: "Зарянка",
          nameEn: "Robin",
          icon: "icon/character/1309.png",
          names: ["Зарянка", "robin", "жуань мэй", "ruan mei", "пела", "pela"],
          roleRu: "Саппорт (Второй буфер)",
          roleEn: "Harmony (Secondary Buffer)",
          buffDescRu: "100% Продвижение отряда, +1100 ATK, +50% Урон",
          buffValues: { teamAdvance: 100, atkGrant: 1100, dmgBoost: 50 }
        },
        {
          id: "1304",
          altIds: ["1203", "1217"],
          nameRu: "Авантюрин",
          nameEn: "Aventurine",
          icon: "icon/character/1304.png",
          names: ["авантюрин", "aventurine", "лоча", "luocha", "хохо", "huohuo"],
          roleRu: "Сохранение (Танк)",
          roleEn: "Preservation (Tank)",
          buffDescRu: "+15% Крит. уязвимость, непробиваемый щит",
          buffValues: { critVuln: 15 }
        }
      ]
    },
    {
      id: "sunday_energy_battery",
      nameRu: "Отряд 2: Бесконечная Энергия (Сандей + Тинъюнь + Хохо)",
      nameEn: "Team 2: Endless Ultimate Cycle",
      descRu: "Тройная заливка энергии: Сандей (+40 EP), Тинъюнь (+50 EP) и Хохо (+20%) обеспечивают ульт каждый цикл.",
      descEn: "Triple energy battery setup providing ultimates every single turn.",
      teammates: [
        {
          id: "1302",
          altIds: ["1204", "1102"],
          nameRu: "Аргенти",
          nameEn: "Argenti",
          icon: "icon/character/1302.png",
          names: ["аргенти", "argenti", "цзин юань", "jing yuan", "зеле", "seele"],
          roleRu: "Главный ДПС (Спамер ультимейтов)",
          roleEn: "Main DPS (Ult Spammer)",
          buffDescRu: "Реализует постоянную заливку энергии в максимальные ультимейты",
          buffValues: { carrySynergy: true }
        },
        {
          id: "1202",
          nameRu: "Тинъюнь",
          nameEn: "Tingyun",
          icon: "icon/character/1202.png",
          names: ["тинъюнь", "tingyun"],
          roleRu: "Саппорт (50 EP & ATK)",
          roleEn: "Harmony (50 Energy & ATK)",
          buffDescRu: "+50 Энергии, +55% ATK, +50% Урон",
          buffValues: { atkGrant: 750, dmgBoost: 50, energyFeed: 50 }
        },
        {
          id: "1217",
          nameRu: "Хохо",
          nameEn: "Huohuo",
          icon: "icon/character/1217.png",
          names: ["хохо", "huohuo"],
          roleRu: "Изобилие (Батарейка)",
          roleEn: "Abundance (Battery)",
          buffDescRu: "+20% Энергии отряду, +40% ATK",
          buffValues: { atkGrant: 650, energyFeed: 20 }
        }
      ]
    }
  ],

  "1304": [
    {
      id: "aventurine_fua_core",
      nameRu: "Отряд 1: FUA Двойной Саб-ДПС (Фэйсяо + Топаз + Зарянка)",
      nameEn: "Team 1: Premier Follow-up Shielder Core",
      descRu: "Авантюрин накапливает стаки Слепого пари от атак союзников, непрерывно нанося собственный DEF-урон и защищая команду.",
      descEn: "Aventurine stacks Blind Bet from ally hits, providing frequent DEF damage and team shields.",
      teammates: [
        {
          id: "1220",
          altIds: ["1305"],
          nameRu: "Фэйсяо",
          nameEn: "Feixiao",
          icon: "icon/character/1220.png",
          names: ["фэйсяо", "feixiao", "рацио", "ratio"],
          roleRu: "Главный ДПС (Бонус-атаки)",
          roleEn: "Main DPS (FUA)",
          buffDescRu: "Частые атаки разгоняют стаки Авантюрина для контратак Слепого пари",
          buffValues: { carrySynergy: true }
        },
        {
          id: "1112",
          nameRu: "Топаз",
          nameEn: "Topaz",
          icon: "icon/character/1112.png",
          names: ["топаз", "topaz"],
          roleRu: "Охота (FUA Уязвимость)",
          roleEn: "Hunt (FUA Vuln)",
          buffDescRu: "+50% Урона бонус-атак по цели",
          buffValues: { fuaVuln: 50 }
        },
        {
          id: "1309",
          nameRu: "Зарянка",
          nameEn: "Robin",
          icon: "icon/character/1309.png",
          names: ["Зарянка", "robin"],
          roleRu: "Саппорт (100% Продвижение)",
          roleEn: "Harmony (100% Advance)",
          buffDescRu: "100% Продвижение отряда, +1100 ATK, +50% Урон, +25% КУ бонус-атак",
          buffValues: { teamAdvance: 100, atkGrant: 1100, dmgBoost: 50, fuaCd: 25 }
        }
      ]
    },
    {
      id: "aventurine_acheron_core",
      nameRu: "Отряд 2: Защитник Ахерон (Ахерон + Цзяоцю + Волк)",
      nameEn: "Team 2: Acheron Shield Enabler",
      descRu: "Авантюрин с конусом Тренда накладывает дебаффы при каждом ударе врагов, генерируя ультимейты Ахерон в два раза быстрее.",
      descEn: "Aventurine with Trend light cone feeds Slashed Dream charges on incoming attacks.",
      teammates: [
        {
          id: "1308",
          nameRu: "Ахерон",
          nameEn: "Acheron",
          icon: "icon/character/1308.png",
          names: ["ахерон", "acheron"],
          roleRu: "Главный ДПС (Сверхспособность)",
          roleEn: "Main DPS (Ultimate)",
          buffDescRu: "Реализует +15% крит. уязвимости от ультимейта Авантюрина",
          buffValues: { carrySynergy: true }
        },
        {
          id: "1218",
          nameRu: "Цзяоцю",
          nameEn: "Jiaoqiu",
          icon: "icon/character/1218.png",
          names: ["цзяоцю", "jiaoqiu"],
          roleRu: "Небытие (Уязвимость)",
          roleEn: "Nihility (Vuln)",
          buffDescRu: "+35% Урон ультимейтов, срез защиты",
          buffValues: { ultVuln: 35, defShred: 40 }
        },
        {
          id: "1006",
          altIds: ["1105"],
          nameRu: "Серебряный Волк",
          nameEn: "Silver Wolf",
          icon: "icon/character/1006.png",
          names: ["серебряный волк", "silver wolf", "пела", "pela"],
          roleRu: "Небытие (Срез защиты)",
          roleEn: "Nihility (DEF Shred)",
          buffDescRu: "-45% Защиты цели, внедрение уязвимости",
          buffValues: { defShred: 45, resPen: 20 }
        }
      ]
    }
  ]
};

// Мета-відряди 4.7: пріоритетні відряди («хто кому підходить у 4.7»).
// Для персонажів з мети 4.7 (1308, 1310, 1006, 1513, 1015, 1510) — нові відряди повністю
// замінюють застарілі 1.x-2.x гайди, щоб користувач бачив актуальну соревновательну мету.
import { TEAMS_47 } from "../data/teams47.js";
Object.entries(TEAMS_47).forEach(([ddId, squads]) => {
  CHARACTER_SQUADS[ddId] = squads;
});

export function getGenericSquads(char, lang = "ru") {
  const isRu = lang === "ru";
  const pathId = String(char?.path?.id || "").toLowerCase();
  const pathName = String(char?.path?.name || "").toLowerCase();
  if (pathId === "shaman" || pathName.includes("harmony") || pathName.includes("гармон")) {
    return [
      {
        id: "generic_harmony_carry",
        nameRu: "Отряд 1: Классический Гиперкерри (Усиление лучшего ДПС)",
        nameEn: "Team 1: Classic Carry Empowerment",
        descRu: "Ваш саппорт объединяется со вторым буфером для разгона главного гиперкерри отряда.",
        descEn: "Your buffer teams up with a second amplifier to hypercharge the primary carry.",
        teammates: [
          {
            id: "1308",
            altIds: ["1220", "1310", "1212"],
            nameRu: "Ахерон / Фэйсяо",
            nameEn: "Acheron / Feixiao",
            icon: "icon/character/1308.png",
            names: ["ахерон", "acheron", "фэйсяо", "feixiao", "цзинлю", "jingliu"],
            roleRu: "Главный ДПС (Керри)",
            roleEn: "Main DPS Carry",
            buffDescRu: "Получает баффы вашего персонажа и конвертирует их в урон",
            buffValues: { carrySynergy: true }
          },
          {
            id: "1309",
            altIds: ["1313", "1303"],
            nameRu: "Зарянка / Сандей",
            nameEn: "Robin / Sunday",
            icon: "icon/character/1309.png",
            names: ["Зарянка", "robin", "воскресенье", "sunday", "руань мэй", "ruan mei"],
            roleRu: "Саппорт (Второй буфер)",
            roleEn: "Harmony (Dual Buffer)",
            buffDescRu: "100% Продвижение отряда, +1100 ATK, +50% Урон",
            buffValues: { teamAdvance: 100, atkGrant: 1100, dmgBoost: 50 }
          },
          {
            id: "1304",
            altIds: ["1203", "1301"],
            nameRu: "Авантюрин",
            nameEn: "Aventurine",
            icon: "icon/character/1304.png",
            names: ["авантюрин", "aventurine", "лоча", "luocha", "галлахер", "gallagher"],
            roleRu: "Сохранение / Изобилие",
            roleEn: "Sustain (Tank / Heal)",
            buffDescRu: "Щиты отряда, +15% Крит. уязвимость врага",
            buffValues: { critVuln: 15 }
          }
        ]
      },
      {
        id: "generic_harmony_dual",
        nameRu: "Отряд 2: Двойной ДПС (Синхронный разгон двух керри)",
        nameEn: "Team 2: Dual Carry Amplification",
        descRu: "Сборка под одновременную работу двух атакующих персонажей.",
        descEn: "Empowering dual carry archetypes simultaneously.",
        teammates: [
          {
            id: "1220",
            nameRu: "Фэйсяо",
            nameEn: "Feixiao",
            icon: "icon/character/1220.png",
            names: ["фэйсяо", "feixiao"],
            roleRu: "Основной ДПС 1",
            roleEn: "Main DPS 1",
            buffDescRu: "Бонус-атаки и ультимейты",
            buffValues: { carrySynergy: true }
          },
          {
            id: "1112",
            nameRu: "Топаз",
            nameEn: "Topaz",
            icon: "icon/character/1112.png",
            names: ["топаз", "topaz"],
            roleRu: "Основной ДПС 2 (Саб-ДПС)",
            roleEn: "Main DPS 2 (Sub-DPS)",
            buffDescRu: "+50% Урон бонус-атак по боссу",
            buffValues: { fuaVuln: 50 }
          },
          {
            id: "1304",
            nameRu: "Авантюрин",
            nameEn: "Aventurine",
            icon: "icon/character/1304.png",
            names: ["авантюрин", "aventurine"],
            roleRu: "Сохранение",
            roleEn: "Preservation",
            buffDescRu: "+15% Крит. уязвимость врага",
            buffValues: { critVuln: 15 }
          }
        ]
      }
    ];
  }
  if (pathId === "knight" || pathId === "priest" || pathName.includes("preservation") || pathName.includes("abundance") || pathName.includes("сохран") || pathName.includes("изобил")) {
    return [
      {
        id: "generic_sustain_hyper",
        nameRu: "Отряд 1: Премиум Защита Гиперкерри",
        nameEn: "Team 1: Premier Carry Protection",
        descRu: "Ваш сустейн обеспечивает выживание и защиту топовому гиперкерри под двумя буферами.",
        descEn: "Your sustain protects a hypercarry empowered by dual offensive buffers.",
        teammates: [
          {
            id: "1308",
            altIds: ["1220", "1212", "1003"],
            nameRu: "Ахерон / Фэйсяо",
            nameEn: "Acheron / Feixiao",
            icon: "icon/character/1308.png",
            names: ["ахерон", "acheron", "фэйсяо", "feixiao", "химеко", "himeko"],
            roleRu: "Главный ДПС (Керри)",
            roleEn: "Main DPS Carry",
            buffDescRu: "Наносит основной урон под вашей защитой",
            buffValues: { carrySynergy: true }
          },
          {
            id: "1313",
            altIds: ["1306", "1101"],
            nameRu: "Воскресенье / Искорка",
            nameEn: "Sunday / Sparkle",
            icon: "icon/character/1313.png",
            names: ["воскресенье", "sunday", "искорка", "sparkle", "броня", "bronya"],
            roleRu: "Саппорт (Продвижение и КУ)",
            roleEn: "Harmony (Advance & Crit)",
            buffDescRu: "100% Продвижение хода, передача КУ, +50% Урон",
            buffValues: { targetAdvance: 100, cdGrant: 78, dmgBoost: 50 }
          },
          {
            id: "1309",
            altIds: ["1303", "1105"],
            nameRu: "Зарянка / Жуань Мэй",
            nameEn: "Robin / Ruan Mei",
            icon: "icon/character/1309.png",
            names: ["Зарянка", "robin", "руань мэй", "ruan mei", "пела", "pela"],
            roleRu: "Саппорт / Дебаффер",
            roleEn: "Harmony / Nihility",
            buffDescRu: "100% Продвижение отряда, +1100 ATK, +50% Урон или срез защиты",
            buffValues: { teamAdvance: 100, atkGrant: 1100, dmgBoost: 50, defShred: 40 }
          }
        ]
      },
      {
        id: "generic_sustain_break",
        nameRu: "Отряд 2: Защита Отряда Суперпробития",
        nameEn: "Team 2: Super Break Shielding",
        descRu: "Защита отряда суперпробития во главе со Светлячком или Бутхиллом.",
        descEn: "Protecting super break teams led by Firefly or Boothill.",
        teammates: [
          {
            id: "1310",
            nameRu: "Светлячок",
            nameEn: "Firefly",
            icon: "icon/character/1310.png",
            names: ["светлячок", "firefly"],
            roleRu: "Главный ДПС (Суперпробитие)",
            roleEn: "Main DPS (Super Break)",
            buffDescRu: "Колоссальный урон суперпробития по сломанным боссам",
            buffValues: { carrySynergy: true }
          },
          {
            id: "1303",
            nameRu: "Жуань Мэй",
            nameEn: "Ruan Mei",
            icon: "icon/character/1303.png",
            names: ["руань мэй", "ruan mei"],
            roleRu: "Саппорт (Пробитие)",
            roleEn: "Harmony (Break)",
            buffDescRu: "+50% Эффективность пробития, +25% All-Type RES PEN",
            buffValues: { breakEff: 50, resPen: 25 }
          },
          {
            id: "8005",
            nameRu: "Первопроходец (Гармония)",
            nameEn: "Trailblazer (Harmony)",
            icon: "icon/character/8005.png",
            names: ["первопроходец", "trailblazer"],
            roleRu: "Саппорт (Суперпробитие)",
            roleEn: "Harmony (Super Break)",
            buffDescRu: "Наложение статуса Суперпробития отряду (160%)",
            buffValues: { superBreakFactor: 1.6, beBoost: 30 }
          }
        ]
      }
    ];
  }
  return [
    {
      id: "generic_hypercarry",
      nameRu: "Отряд 1: Классический Гиперкерри (Гармония + Срез Защиты)",
      nameEn: "Team 1: Classic Hypercarry (Harmony + DEF Shred)",
      descRu: "Максимизация урона через удвоение ходов, заливку критического урона и срез защиты босса.",
      descEn: "Maximizes carry damage via action advances, Crit DMG buffs and defense shred.",
      teammates: [
        {
          id: "1313",
          altIds: ["1306", "1101"],
          nameRu: "Воскресенье / Искорка",
          nameEn: "Sunday / Sparkle",
          icon: "icon/character/1313.png",
          names: ["воскресенье", "sunday", "искорка", "sparkle", "броня", "bronya"],
          roleRu: "Саппорт (Продвижение и КУ)",
          roleEn: "Harmony (Advance & Crit)",
          buffDescRu: "50-100% Продвижение хода, передача +60-80% КУ, +50% Урон цели",
          buffValues: { targetAdvance: 100, cdGrant: 70, dmgBoost: 50 }
        },
        {
          id: "1309",
          altIds: ["1303", "1105"],
          nameRu: "Зарянка / Пела",
          nameEn: "Robin / Pela",
          icon: "icon/character/1309.png",
          names: ["Зарянка", "robin", "жуань мэй", "ruan mei", "пела", "pela"],
          roleRu: "Саппорт / Дебаффер",
          roleEn: "Harmony / Nihility",
          buffDescRu: "100% Продвижение отряда / +25% RES PEN / -42% Срез защиты",
          buffValues: { dmgBoost: 50, resPen: 25, defShred: 42 }
        },
        {
          id: "1304",
          altIds: ["1208", "1203", "1217", "1301"],
          nameRu: "Авантюрин / Лоча",
          nameEn: "Aventurine / Luocha",
          icon: "icon/character/1304.png",
          names: ["авантюрин", "aventurine", "фу сюань", "fu xuan", "лоча", "luocha", "хохо", "huohuo", "галлахер", "gallagher"],
          roleRu: "Сустейн (Защита и Баффы)",
          roleEn: "Sustain (Shield & Buffs)",
          buffDescRu: "Полное выживание команды, +15% КУ уязвимость или +12% КШ пассивно",
          buffValues: { critVuln: 15, teamEffectRes: 50 }
        }
      ]
    },
    {
      id: "generic_dual_dps",
      nameRu: "Отряд 2: Двойной ДПС с Универсальным Буфером",
      nameEn: "Team 2: Dual DPS with Universal Buffer",
      descRu: "Сборка под одновременную работу двух атакующих персонажей под аурами Жуань Мэй или Зарянка.",
      descEn: "Dual carry setup amplified by whole-party auras from Ruan Mei or Robin.",
      teammates: [
        {
          id: "1303",
          altIds: ["1309"],
          nameRu: "Жуань Мэй / Зарянка",
          nameEn: "Ruan Mei / Robin",
          icon: "icon/character/1303.png",
          names: ["руань мэй", "ruan mei", "Зарянка", "robin"],
          roleRu: "Саппорт (Аура отряда)",
          roleEn: "Harmony (Party Aura)",
          buffDescRu: "+68% Урон всем союзникам, +25% All-Type RES PEN, +10% SPD",
          buffValues: { dmgBoost: 68, resPen: 25, teamSpd: 10 }
        },
        {
          id: "1112",
          altIds: ["1220", "1308"],
          nameRu: "Топаз / Второй Керри",
          nameEn: "Topaz / Second Carry",
          icon: "icon/character/1112.png",
          names: ["топаз", "topaz", "фэйсяо", "feixiao", "ахерон", "acheron"],
          roleRu: "Охота (Саб-ДПС)",
          roleEn: "Hunt (Sub-DPS)",
          buffDescRu: "Совместные атаки, +50% Урон бонус-атак или срез стойкости",
          buffValues: { fuaVuln: 50 }
        },
        {
          id: "1304",
          altIds: ["1301", "1222"],
          nameRu: "Авантюрин / Галлахер",
          nameEn: "Aventurine / Gallagher",
          icon: "icon/character/1304.png",
          names: ["авантюрин", "aventurine", "галлахер", "gallagher", "линша", "lingsha"],
          roleRu: "Сустейн (Танк / Хил)",
          roleEn: "Sustain (Tank / Heal)",
          buffDescRu: "Защитные барьеры и дополнительный саб-ДПС вклад в цикл",
          buffValues: { critVuln: 15 }
        }
      ]
    }
  ];
}
// Типові E0S1 кінцеві стати саппортів мети 4.7 — використовуються, коли союзника немає у витрині,
// щоб відряд все одно отримував реалістичні бафи (замість нулів).
const SUPPORT_DEFAULT_STATS = {
  "1313": { atk: 3100, def: 1400, hp: 12000, cr: 5, cd: 170, be: 0 },   // Воскресенье
  "1309": { atk: 3300, def: 1600, hp: 13000, cr: 5, cd: 130, be: 0 },   // Зарянка
  "1306": { atk: 3200, def: 1400, hp: 12000, cr: 5, cd: 150, be: 0 },   // Искорка
  "1303": { atk: 2900, def: 1600, hp: 13000, cr: 5, cd: 100, be: 160 }, // Жуань Мэй
  "1304": { atk: 1500, def: 3200, hp: 14000, cr: 5, cd: 100, be: 0 },   // Авантюрин
  "1208": { atk: 1000, def: 1800, hp: 16800, cr: 5, cd: 100, be: 0 },   // Фу Сюань
  "1225": { atk: 2700, def: 1200, hp: 12000, cr: 5, cd: 100, be: 280 }, // Фуга
  "1403": { atk: 3000, def: 1400, hp: 14000, cr: 5, cd: 130, be: 0 },   // Трибби
  "1512": { atk: 3300, def: 1600, hp: 13000, cr: 5, cd: 130, be: 0 },   // Зарянка: Яснопея
  "1217": { atk: 2900, def: 1400, hp: 13000, cr: 5, cd: 100, be: 0 },   // Хохо
  "1414": { atk: 2400, def: 2000, hp: 14000, cr: 5, cd: 100, be: 0 },   // Дань Хэн • Освободитель Пустошей
  "1409": { atk: 2600, def: 1500, hp: 13500, cr: 5, cd: 110, be: 0 },   // Гиацина
  "1513": { atk: 3200, def: 1400, hp: 12000, cr: 80, cd: 160, be: 0 },   // Авантюрин: Прибой
  "1408": { atk: 2800, def: 1400, hp: 12000, cr: 70, cd: 140, be: 0 },   // Яо Гуан
  "1501": { atk: 2600, def: 1400, hp: 12000, cr: 10, cd: 150, be: 0 },   // Искра (Спаркси)
  "1514": { atk: 3300, def: 1400, hp: 12000, cr: 60, cd: 160, be: 0 },   // Аха (Aha)
  "1503": { atk: 1200, def: 3200, hp: 13000, cr: 10, cd: 100, be: 0 },   // Жемчуг (Pearl)
  "8007": { atk: 2800, def: 1400, hp: 12000, cr: 60, cd: 130, be: 0 },   // Первопроходец: Радость
  "1006": { atk: 3400, def: 1400, hp: 12000, cr: 100, cd: 180, be: 0 }   // Серебряный Волк ур. 999
};

// Stat-dependent бафы саппорта: считаются от реальных статов из витрины,
// а при отсутствии союзника в витрине — от SUPPORT_DEFAULT_STATS (типичный E0S1).
function computeSupportBuffs(rec, s = {}) {
  const id = String(rec.id || "");
  const buffs = { ...rec.buffValues };
  const tag = `${rec.nameRu || ""} ${rec.nameEn || ""}`.toLowerCase();
  let descRu = null;
  let descEn = null;
  const num = (v) => (typeof v === "number" ? v : 0);

  if (id === "1514" || tag.includes("аха") || tag.includes("aha")) {
    buffs.dmgBoost = Math.max(num(buffs.dmgBoost), 65);
    buffs.resPen = Math.max(num(buffs.resPen), 25);
    buffs.allVuln = Math.max(num(buffs.allVuln), 30);
    descRu = `Эон Радости 4.7 (Аха): статус «Эманатор Радости», срез Max HP боссов, +65% урон Радости, +30% уязвимость`;
    descEn = `4.7 Elation Aeon (Aha): «Emanator of Elation» status, Boss Max HP reduction, +65% Elation DMG, +30% Vuln`;
  } else if (id === "1503" || tag.includes("жемчуг") || tag.includes("pearl")) {
    buffs.teamShield = true;
    buffs.teamAdvance = Math.max(num(buffs.teamAdvance), 25);
    buffs.dmgBoost = Math.max(num(buffs.dmgBoost), 30);
    descRu = `Лучший сустейн Радости (Жемчуг): заряды «Настоящий хит», блокировка урона, лечение от ЗАЩ, продвижение действий`;
    descEn = `Best 4.7 Elation Sustain (Pearl): «Real Hit» stacks, incoming DMG block, DEF-based heals, action advance`;
  } else if (id === "1513" || tag.includes("прибой") || tag.includes("waveflair")) {
    buffs.critVuln = Math.max(num(buffs.critVuln), 15);
    buffs.dmgBoost = Math.max(num(buffs.dmgBoost), 40);
    buffs.elationBuff = 100;
    descRu = `Радость 4.7: комбо-атаки Радости, след «Revel in Surging Waves» (+100% статов Радости), +15% крит. уязвимости цели, фаза Aha Instant`;
    descEn = `4.7 Elation: coordinated Elation strikes, «Revel in Surging Waves» (+100% Elation stats), +15% Crit Vuln, Aha Instant phase`;
  } else if (id === "1408" || tag.includes("яо") || tag.includes("yao")) {
    buffs.dmgBoost = Math.max(num(buffs.dmgBoost), 50);
    buffs.resPen = Math.max(num(buffs.resPen), 25);
    buffs.teamAdvance = Math.max(num(buffs.teamAdvance), 35);
    descRu = `Премиум Саппорт Радости 4.7: +25% All-Type RES PEN, синхронный навык Радости, мгновенный вход в Invincible Player`;
    descEn = `Premier 4.7 Elation Support: +25% All-Type RES PEN, simultaneous team Elation skill, instant Invincible Player charge`;
  } else if (id === "1501" || tag.includes("спаркси") || tag.includes("sparxie") || (tag.includes("искра") && !tag.includes("искорка"))) {
    buffs.dmgBoost = Math.max(num(buffs.dmgBoost), 50);
    buffs.teamAdvance = Math.max(num(buffs.teamAdvance), 50);
    buffs.energyFeed = Math.max(num(buffs.energyFeed), 30);
    descRu = `Саппорт Радости 4.7: триггер Mystery Boxes, механика Thrill, генерация SP Радости, сет «Миг радости бога», +50% урон`;
    descEn = `4.7 Elation Support: Mystery Box procs, Thrill mechanic, Elation SP battery, Moment of Joy synergy, +50% DMG`;
  } else if (id === "8007" || id === "8008" || tag.includes("гг") || tag.includes("первопроходец") || tag.includes("trailblazer")) {
    buffs.dmgBoost = Math.max(num(buffs.dmgBoost), 50);
    buffs.teamAdvance = Math.max(num(buffs.teamAdvance), 30);
    descRu = `Радость 4.7: статус «Certified Banger», генерация Панчлайнов, +50% урон Радости всему отряду`;
    descEn = `4.7 Elation: «Certified Banger» status, Punchline generation, +50% team Elation DMG`;
  } else if (id === "1313" || tag.includes("воскресенье") || tag.includes("sunday")) {
    const cd = num(s.cd) || 170;
    const cdGrant = parseFloat((12 + cd * 0.3).toFixed(1));
    buffs.cdGrant = cdGrant;
    buffs.dmgBoost = Math.max(num(buffs.dmgBoost), 50);
    buffs.energyFeed = Math.max(num(buffs.energyFeed), 40);
    descRu = `100% Продвижение, передача +${cdGrant}% КУ (от реальных ${cd.toFixed(1)}% КУ), +50% Урон, +40 энергии`;
    descEn = `100% Target Advance, +${cdGrant}% Crit DMG transfer (from ${cd.toFixed(1)}% CD), +50% DMG, +40 Energy`;
  } else if (id === "1309" || id === "1512" || tag.includes("Зарянка") || tag.includes("зарянка") || tag.includes("robin")) {
    const atk = num(s.atk) || 3300;
    const atkGrant = Math.round(atk * 0.228 + 200);
    buffs.atkGrant = atkGrant;
    buffs.dmgBoost = Math.max(num(buffs.dmgBoost), 50);
    buffs.fuaCd = Math.max(num(buffs.fuaCd), 25);
    descRu = `100% Продвижение всего отряда, +${atkGrant} ATK (от реальных ${atk} ATK), +50% Урон, +25% КУ бонус-атак`;
    descEn = `100% Team Advance, +${atkGrant} ATK (from ${atk} ATK), +50% DMG, +25% FUA Crit DMG`;
  } else if (id === "1306" || tag.includes("искорка") || tag.includes("sparkle")) {
    const cd = num(s.cd) || 150;
    const cdGrant = parseFloat((45 + cd * 0.24).toFixed(1));
    buffs.cdGrant = cdGrant;
    buffs.dmgBoost = Math.max(num(buffs.dmgBoost), 48);
    descRu = `+50% Продвижение, передача +${cdGrant}% КУ (от реальных ${cd.toFixed(1)}% КУ), +48% Урон, лимит 7 SP`;
    descEn = `+50% Advance, +${cdGrant}% Crit DMG transfer (from ${cd.toFixed(1)}% CD), +48% DMG, max 7 SP`;
  } else if (id === "1303" || tag.includes("жуань") || tag.includes("ruan")) {
    const be = num(s.be) || 160;
    const dmg = be >= 180 ? 68 : Math.round(36 + (be / 180) * 32);
    buffs.dmgBoost = dmg;
    buffs.resPen = Math.max(num(buffs.resPen), 25);
    buffs.beBoost = Math.max(num(buffs.beBoost), num(buffs.breakEff), 50);
    descRu = `+50% Эффективность пробития, +25% All-Type RES PEN, +10% SPD, +${dmg}% Урон (${be.toFixed(0)}% ЭП)`;
    descEn = `+50% Break Efficiency, +25% All-Type RES PEN, +10% SPD, +${dmg}% DMG (${be.toFixed(0)}% BE)`;
  } else if ((id === "1304" || tag.includes("авантюрин")) && id !== "1513" && !tag.includes("прибой") && !tag.includes("waveflair")) {
    const def = num(s.def) || 3200;
    const crGrant = Math.min(48, Math.max(0, Math.round((def - 1600) * 0.02)));
    buffs.crGrant = crGrant;
    descRu = `Щиты отряда, +${crGrant}% КШ (от реальных ${def} ЗАЩ, пассивка «Транзитный поток»)`;
    descEn = `Team shields, +${crGrant}% CRIT Rate (from ${def} DEF, «Transit Flow» trace)`;
  } else if (id === "1208" || tag.includes("фу сюань")) {
    buffs.crGrant = Math.max(num(buffs.crGrant), 12);
    descRu = `Матрица Предзнаменования: +12% КШ всем союзникам, снижение входящего урона`;
    descEn = `Matrix of Prescience: +12% CRIT Rate to all allies, incoming DMG reduction`;
  } else if (id === "1225" || tag.includes("фуга")) {
    buffs.beBoost = Math.max(num(buffs.beBoost), 50);
    descRu = `+50% Эффективность пробития отряда, Экзо-пробитие (снижение стойкости)`;
    descEn = `+50% team Break Effect, Exo-Toughness (toughness reduction)`;
  } else if (id === "1403" || tag.includes("трибби")) {
    buffs.allVuln = Math.max(num(buffs.allVuln), 24);
    descRu = `+24% получаемого урона всеми типами (Королева Барбели), -10% DEF при ЭП-пробитии`;
    descEn = `+24% All-Type vulnerability (Queen Barbel), -10% DEF on BE break`;
  } else if (id === "1505" || tag.includes("георгина") || tag.includes("dahlia")) {
    buffs.superBreakFactor = 1.8;
    buffs.beBoost = Math.max(num(buffs.beBoost), 60);
    buffs.breakEff = Math.max(num(buffs.breakEff), 50);
    descRu = `Ключевой брейк-саппорт 4.7: разгон суперпробития (1.8×), +${buffs.beBoost}% ЭП отряду, +50% эффективность стойкости`;
    descEn = `Premier 4.7 Break Support: Super Break multiplier (1.8×), +${buffs.beBoost}% BE to team, +50% Break Efficiency`;
  } else if (id === "1409" || tag.includes("гиацина") || tag.includes("hyacine")) {
    buffs.crGrant = Math.max(num(buffs.crGrant), 12);
    buffs.teamShield = true;
    buffs.energyFeed = Math.max(num(buffs.energyFeed), 20);
    descRu = `Сохранение 4.7: надёжные щиты, исцеление, +12% КШ команде, +20 энергии`;
    descEn = `4.7 Sustain: reliable shields, heals, +12% CRIT Rate to team, +20 energy`;
  } else if (id === "1217" || tag.includes("хохо") || tag.includes("huohuo")) {
    buffs.energyFeed = Math.max(num(buffs.energyFeed), 20);
    buffs.atkGrant = Math.max(num(buffs.atkGrant), 1200);
    descRu = `Сустейн (Хохо): заливка +20% энергии отряду, бафф +40% ATK, непрерывное снятие ослаблений`;
    descEn = `Sustain (Huohuo): +20% team energy regen, +40% ATK boost, continuous cleanse`;
  } else if (id === "1414" || tag.includes("освободитель") || tag.includes("permansor")) {
    buffs.teamShield = true;
    buffs.dmgBoost = Math.max(num(buffs.dmgBoost), 20);
    descRu = `Сохранение 4.7 (Дань Хэн • Освободитель Пустошей): мощные командные щиты, снижение входящего урона, защита от ваншотов`;
    descEn = `4.7 Preservation (Dan Heng • Permansor Terrae): strong team shields, damage reduction, one-shot protection`;
  } else if (id === "1507" || tag.includes("мортенакс") || tag.includes("mortenax")) {
    buffs.allVuln = Math.max(num(buffs.allVuln), 50);
    buffs.defShred = Math.max(num(buffs.defShred), 30);
    descRu = `Нихилия 4.7 (Зона Balefire Bind): +50% уязвимости всех типов, -30% DEF, генератор зарядов при действии каждого союзника`;
    descEn = `4.7 Nihility (Balefire Bind Zone): +50% All-Type vulnerability, -30% DEF, charge generator on every ally action`;
  } else if (id === "1508" || tag.includes("рин тосака") || tag.includes("rin tohsaka")) {
    buffs.energyFeed = Math.max(num(buffs.energyFeed), 30);
    buffs.dmgBoost = Math.max(num(buffs.dmgBoost), 40);
    descRu = `Fate Саппорт: заливка +30 энергии, генерация монет, +40% урон навички`;
    descEn = `Fate Support: +30 energy feed, coins, +40% Skill DMG`;
  } else if (id === "1006" || tag.includes("999")) {
    buffs.defShred = Math.max(num(buffs.defShred), 45);
    buffs.allVuln = Math.max(num(buffs.allVuln), 20);
    descRu = `Радость 4.7: взрывной урон Радости, -45% DEF, +20% уязвимости, механика Топового лутбокса`;
    descEn = `4.7 Elation: Elation burst, -45% DEF, +20% Vuln, Top Loot Box mechanics`;
  }
  return { buffs, descRu, descEn };
}

export function matchSquadWithShowcase(squad, showcaseCharacters = [], lang = "ru") {
  if (!squad || !Array.isArray(squad.teammates)) return [];
  const distinctVersions = [
    new Set(["1003", "1510"]),

    new Set(["1309", "1512"]),

    new Set(["1304", "1513"])

  ];
  return squad.teammates.map((rec) => {
    const matchedChar = (showcaseCharacters || []).find((c) => {
      const cId = String(c.id || "");
      const cName = (c.name || "").toLowerCase();
      const recId = String(rec.id || "");
      if (cId === recId) return true;
      if (distinctVersions.some((group) => group.has(cId) && group.has(recId) && cId !== recId)) return false;
      if (rec.altIds && rec.altIds.includes(cId)) return true;
      if (rec.names && rec.names.some((n) => cName.includes(n))) return true;
      return false;
    });
    const isRu = lang === "ru";
    const fallbackName = isRu ? rec.nameRu || rec.names?.[0] || "Союзник" : rec.nameEn || rec.names?.[1] || rec.names?.[0] || "Teammate";
    const characterName = matchedChar?.name || fallbackName;
    const characterIcon = matchedChar?.avatar?.icon || matchedChar?.icon || rec.icon || (rec.id ? `icon/character/${rec.id}.png` : null);
    if (matchedChar) {
      const baseMap = {};
      (matchedChar.attributes || []).forEach((a) => {
        baseMap[a.field] = a;
      });
      const addMap = {};
      (matchedChar.additions || []).forEach((a) => {
        addMap[a.field] = a;
      });
      const getStat = (field) => (baseMap[field]?.value || 0) + (addMap[field]?.value || 0);
      const realHp = Math.round(getStat("hp"));
      const realAtk = Math.round(getStat("atk"));
      const realDef = Math.round(getStat("def"));
      const realSpd = parseFloat(getStat("spd").toFixed(1));
      const realCr = parseFloat((getStat("crit_rate") * 100).toFixed(1));
      const realCd = parseFloat((getStat("crit_dmg") * 100).toFixed(1));
      const realBe = parseFloat(((addMap["break_dmg"]?.value || 0) * 100).toFixed(1));
      const realEhr = parseFloat(((addMap["effect_hit"]?.value || 0) * 100).toFixed(1));
      const computed = computeSupportBuffs(rec, {
        atk: realAtk, def: realDef, hp: realHp, spd: realSpd, cr: realCr, cd: realCd, be: realBe, ehr: realEhr
      });
      const dynamicBuffs = { ...computed.buffs };
      let dynamicBuffDescRu = computed.descRu || rec.buffDescRu;
      let dynamicBuffDescEn = computed.descEn || rec.buffDescEn;

      // Проверка планарного сета 329 («Миг радости бога») на союзнике из витрины
      const hasSet329 = (matchedChar.relic_sets || []).some(
        (rs) => rs.id === "329" || /Миг радости|Moment of Joy|329/i.test(rs.name || "")
      );
      if (hasSet329) {
        dynamicBuffs.teamAdvance = Math.max(Number(dynamicBuffs.teamAdvance) || 0, 40);
        dynamicBuffs.teamSpd = (Number(dynamicBuffs.teamSpd) || 0) + 6;
        dynamicBuffDescRu += isRu ? " • Сет 329: +6% СКОР, 40% продвижение действия" : " • Set 329: +6% SPD, 40% action advance";
        dynamicBuffDescEn += " • Set 329: +6% SPD, 40% action advance";
      }
      return {
        ...rec,
        matchedChar,
        characterName,
        characterIcon,
        isEquippedInShowcase: true,
        realStats: {
          hp: realHp,
          atk: realAtk,
          def: realDef,
          spd: realSpd,
          cr: realCr,
          cd: realCd,
          be: realBe,
          ehr: realEhr
        },
        dynamicBuffs,
        dynamicBuffDescRu,
        dynamicBuffDescEn
      };
    }
    const defaults = SUPPORT_DEFAULT_STATS[String(rec.id || "")];
    const defaultStats = defaults || { atk: 3000, def: 1600, hp: 13000, cr: 5, cd: 120, be: 100 };
    const computed = computeSupportBuffs(rec, defaultStats);
    return {
      ...rec,
      matchedChar: null,
      characterName,
      characterIcon,
      isEquippedInShowcase: false,
      realStats: null,
      defaultStats,
      dynamicBuffs: computed.buffs,
      dynamicBuffDescRu: (computed.descRu || rec.buffDescRu) + (lang === "ru" ? " (типовые E0S1, союзник не у витрины)" : " (typical E0S1, teammate not in showcase)"),
      dynamicBuffDescEn: (computed.descEn || rec.buffDescEn) + " (typical E0S1, teammate not in showcase)"
    };
  });
}
