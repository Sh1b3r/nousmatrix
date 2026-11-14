// Відряди мети 4.7 — «хто кому підходить» (синергія, а не просто найсильніші).
// Назви персонажів — ОФІЦІЙНА ігрова локалізація (джерело: StarRailRes index_new/ru/characters.json).
// Радость (Elation), Суперпробитие (Super Break с Георгиной), Стенсы (Verdict / Decimation).

export const TEAMS_47 = {
  // Авантюрин: Прибой (1513) — ДАМАГЕР РАДОСТИ (Elation Main DPS)
  "1513": [
    {
      id: "aventurine_surging_elation_core",
      nameRu: "Отряд 1 (4.7): Ядро Радости (Серебряный Волк ур. 999 + Зарянка + Гиацина)",
      nameEn: "Team 1 (4.7): Elation Core (Silver Wolf Lv.999 + Robin + Hyacine)",
      descRu: "Мета 4.7 Радости: Авантюрин Прибой реализует путь Радости и планарку «Миг радости бога», Серебряный Волк ур. 999 наносит взрывной урон Радости и срезает защиту, Зарянка продвигает весь отряд, Гиацина лечит и баффает КШ.",
      descEn: "4.7 Elation Meta: Aventurine Surging acts as Elation Main DPS triggering Moment of Joy, Silver Wolf Lv.999 deals Elation burst & shreds DEF, Robin advances team, Hyacine sustains.",
      isEstimate: true,
      teammates: [
        {
          id: "1006",
          nameRu: "Серебряный Волк ур. 999",
          nameEn: "Silver Wolf Lv.999",
          icon: "icon/character/1006.png",
          names: ["серебряный волк", "silver wolf", "волк", "999"],
          roleRu: "Радость (Дамагер Радости / Срез DEF)",
          roleEn: "Elation (Elation DPS & DEF Shred)",
          buffDescRu: "Взрывной урон Радости, внедрение уязвимостей и срез защиты цели",
          buffValues: { defShred: 45, allVuln: 20 }
        },
        {
          id: "1309",
          altIds: ["1512", "1313"],
          nameRu: "Зарянка",
          nameEn: "Robin",
          icon: "icon/character/1309.png",
          names: ["зарянка", "робин", "robin"],
          roleRu: "Саппорт (100% Продвижение и Атака)",
          roleEn: "Support (100% Advance & ATK)",
          buffDescRu: "100% Продвижение ВСЕГО отряда, массивный бафф силы атаки под атаки Радости",
          buffValues: { teamAdvance: 100, dmgBoost: 50 }
        },
        {
          id: "1409",
          altIds: ["1217", "1301"],
          nameRu: "Гиацина",
          nameEn: "Hyacine",
          icon: "icon/character/1409.png",
          names: ["гиацина", "hyacine"],
          roleRu: "Сохранение (Лечение и КШ)",
          roleEn: "Sustain (Heals & CR)",
          buffDescRu: "Надёжное выживание, щиты, +12% КШ команде",
          buffValues: { crGrant: 12, energyFeed: 20 }
        }
      ]
    }
  ],

  // Серебряный Волк ур. 999 (1006) — ДАМАГЕР РАДОСТИ
  "1006": [
    {
      id: "sw999_elation_hyper",
      nameRu: "Отряд 1 (4.7): Дамагер Радости (Авантюрин: Прибой + Зарянка + Гиацина)",
      nameEn: "Team 1 (4.7): Elation Hypercarry (Aventurine: Surging + Robin + Hyacine)",
      descRu: "Сборка Серебряного Волка ур. 999 как дамагера пути Радости: синергия со сетом «Миг радости бога», парные атаки Радости с Авантюрином Прибоем под продвижением Зарянки.",
      descEn: "Silver Wolf Lv.999 as dedicated Elation DPS: triggers God's Moment of Joy, paired with Aventurine Surging and Robin's whole-team advance.",
      isEstimate: true,
      teammates: [
        {
          id: "1513",
          nameRu: "Авантюрин: Прибой",
          nameEn: "Aventurine: Surging",
          icon: "icon/character/1513.png",
          names: ["авантюрин", "aventurine", "прибой"],
          roleRu: "Радость (Дамагер Радости)",
          roleEn: "Elation (Elation DPS)",
          buffDescRu: "Второй дамагер Радости: координированные атаки Радости и срез стойкости",
          buffValues: { carrySynergy: true, critVuln: 15 }
        },
        {
          id: "1309",
          altIds: ["1313"],
          nameRu: "Зарянка",
          nameEn: "Robin",
          icon: "icon/character/1309.png",
          names: ["зарянка", "робин", "robin"],
          roleRu: "Саппорт (Атака и Продвижение)",
          roleEn: "Support (ATK & Team Advance)",
          buffDescRu: "100% Продвижение отряда, бафф урона и атаки",
          buffValues: { teamAdvance: 100, dmgBoost: 50 }
        },
        {
          id: "1409",
          altIds: ["1301", "1217"],
          nameRu: "Гиацина",
          nameEn: "Hyacine",
          icon: "icon/character/1409.png",
          names: ["гиацина", "hyacine"],
          roleRu: "Сохранение (Лечение и КШ)",
          roleEn: "Sustain (Heals & CR)",
          buffDescRu: "Лечение, выживание отряда, +12% КШ",
          buffValues: { crGrant: 12, energyFeed: 20 }
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
          buffDescRu: "Срез защиты (-20%), уязвимость (+25%), быстрый набор зарядов для Ахерон",
          buffDescEn: "DEF shred (-20%), vulnerability (+25%), rapid Slash charge generator",
          buffValues: { allVuln: 25, defShred: 20 }
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

  // Арчер (1015) — СБАЛАНСИРОВАННЫЙ ОТРЯД С СУСТЕЙНОМ!
  "1015": [
    {
      id: "archer_rin_sparkle_sustain",
      nameRu: "Отряд 1 (4.7): Сбалансированный Гиперкерри (Рин Тосака + Искорка + Гиацина / Авантюрин)",
      nameEn: "Team 1 (4.7): Balanced Hypercarry (Rin Tohsaka + Sparkle + Hyacine / Aventurine)",
      descRu: "Полный жизнеспособный отряд Арчера: Рин Тосака заливает энергию и монеты, Искорка обеспечивает 7 очков действий (SP) и продвижение хода, Гиацина или Авантюрин гарантируют выживание команды.",
      descEn: "Complete viable Archer squad with sustain: Rin Tohsaka provides energy & coins, Sparkle expands SP cap to 7 with advance, Hyacine or Aventurine guarantees team survival.",
      isEstimate: true,
      teammates: [
        {
          id: "1508",
          nameRu: "Рин Тосака",
          nameEn: "Rin Tohsaka",
          icon: "icon/character/1508.png",
          names: ["рин тосака", "rin tohsaka"],
          roleRu: "Саппорт (Энергия и Монеты)",
          roleEn: "Support (Energy & Coins)",
          buffDescRu: "Заливка энергии ультимейтов, генерация монет и усиление урона",
          buffValues: { energyFeed: 30, dmgBoost: 25 }
        },
        {
          id: "1306",
          nameRu: "Искорка",
          nameEn: "Sparkle",
          icon: "icon/character/1306.png",
          names: ["искорка", "sparkle"],
          roleRu: "Гармония (Продвижение и Лимит 7 SP)",
          roleEn: "Harmony (Advance & 7 SP Cap)",
          buffDescRu: "+50% Продвижение, лимит 7 SP, передача КУ",
          buffValues: { targetAdvance: 50, cdGrant: 102, dmgBoost: 48 }
        },
        {
          id: "1409",
          altIds: ["1304", "1217"],
          nameRu: "Гиацина / Авантюрин",
          nameEn: "Hyacine / Aventurine",
          icon: "icon/character/1409.png",
          names: ["гиацина", "hyacine", "авантюрин", "aventurine", "хохо", "huohuo"],
          roleRu: "Сустейн (Щиты / Лечение)",
          roleEn: "Sustain (Shields / Healing)",
          buffDescRu: "Гарантированная защита отряда, парирование атак боссов, +КШ",
          buffValues: { crGrant: 12 }
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
