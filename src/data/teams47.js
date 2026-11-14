// Відряди мети 4.7 — «хто кому підходить» (синергія, а не просто найсильніші).
// Назви персонажів — ОФІЦІЙНА ігрова локалізація (джерело: StarRailRes index_new/ru/characters.json).
// Де точні числа бафів невідомі (нові 4.x персонажі) — вказані консервативні оцінки,
// кожне таке відрядо помічене "(оценка 4.7)".
//
// Важно: Искорка (1306) ≠ Искра (1501) — это разные персонажи.
// Воскресенье (1313), Зарянка (1309), Зарянка: Яснопея (1512), Авантюрин: Прибой (1513).

export const TEAMS_47 = {
  // Химеко: Нова — вариант отряда 4.7 с новыми саппортами (оценка)
  "1510": [
    {
      id: "himeko_nova_47_cyrene_cerydra_hyacine",
      nameRu: "Отряд 2 (4.7): Мемо-саппорты (Керидра + Кирена + Гиацина)",
      nameEn: "Team 2 (4.7): Memo Supports (Cerydra + Cyrene + Hyacine)",
      descRu: "Оценка для 4.7: Керидра усиливает ультимейт, Кирена добавляет мемо-бафы, Гиацина лечит и повышает КШ. Числа бафов — консервативная оценка.",
      descEn: "4.7 estimate: Cerydra empowers the Ultimate, Cyrene adds memo buffs, Hyacine heals and boosts CRIT. Buff numbers are a conservative estimate.",
      isEstimate: true,
      teammates: [
        {
          id: "1412",
          nameRu: "Керидра",
          nameEn: "Cerydra",
          icon: "icon/character/1412.png",
          names: ["керидра", "cerydra"],
          roleRu: "Саппорт (Мудрость / усиление ульты)",
          roleEn: "Support (Wisdom / Ult Empower)",
          buffDescRu: "Даёт Мудрость: баф КУ и урона для керри (оценка)",
          buffDescEn: "Grants Wisdom: Crit DMG and DMG buff for the carry (estimate)",
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
          buffDescRu: "Мемо-бафы и усиление урона (оценка)",
          buffDescEn: "Memo buffs and DMG amplification (estimate)",
          buffValues: { dmgBoost: 30, teamAdvance: 50 }
        },
        {
          id: "1409",
          nameRu: "Гиацина",
          nameEn: "Hyacine",
          icon: "icon/character/1409.png",
          names: ["гиацина", "hyacine"],
          roleRu: "Сохранение (Лечение и КШ)",
          roleEn: "Sustain (Heals and CR)",
          buffDescRu: "Лечение, +КШ от лечения (оценка)",
          buffDescEn: "Heals and grants CRIT Rate from healing (estimate)",
          buffValues: { crGrant: 12, energyFeed: 20 }
        }
      ]
    }
  ],

  // Арчер — отряд №1 по частоте в AA-аналитике 4.7 (0.69%)
  "1015": [
    {
      id: "archer_rin_robin_sparkie",
      nameRu: "Отряд 1: Гиперкерри (Рин Тосака + Зарянка + Искра)",
      nameEn: "Team 1: Hypercarry (Rin Tohsaka + Robin + Sparxie)",
      descRu: "Самый частый отряд Арчера в AA 4.7 (0.69% всех битв): Искра даёт True DMG и КУ, Зарянка — атаку и продвижение, Рин Тосака — энергию и монеты.",
      descEn: "Archer's most-played AA team in 4.7 (0.69% of all battles): Sparxie adds True DMG and CRIT DMG, Robin ATK and advance, Rin Tohsaka energy and coins.",
      teammates: [
        {
          id: "1501",
          nameRu: "Искра",
          nameEn: "Sparxie",
          icon: "icon/character/1501.png",
          names: ["искра", "sparxie"],
          altIds: ["1306"],
          roleRu: "Саппорт (True DMG и КУ)",
          roleEn: "Support (True DMG and CRIT DMG)",
          buffDescRu: "True DMG, баф КУ (значение — оценка)",
          buffDescEn: "True DMG, CRIT DMG buff (value estimated)",
          buffValues: { dmgBoost: 45 }
        },
        {
          id: "1309",
          nameRu: "Зарянка",
          nameEn: "Robin",
          icon: "icon/character/1309.png",
          names: ["зарянка", "робин", "robin"],
          roleRu: "Саппорт (Атака и продвижение)",
          roleEn: "Support (ATK and Advance)",
          buffDescRu: "Баф ATK от собственной атаки, продвижение всего отряда",
          buffDescEn: "ATK buff from own attack, full team advance",
          buffValues: { teamAdvance: 100, dmgBoost: 50 }
        },
        {
          id: "1508",
          nameRu: "Рин Тосака",
          nameEn: "Rin Tohsaka",
          icon: "icon/character/1508.png",
          names: ["рин тосака", "rin tohsaka"],
          roleRu: "Саппорт (Энергия и монеты)",
          roleEn: "Support (Energy and Coins)",
          buffDescRu: "Энергия, монеты, усиление урона (оценка)",
          buffDescEn: "Energy, coins, DMG boost (estimate)",
          buffValues: { energyFeed: 30, dmgBoost: 25 }
        }
      ]
    }
  ],

  // Фаенон — отряд 4.7 (Керидра + Кирена + Зарянка)
  "1408": [
    {
      id: "phainon_cerydra_cyrene_robin",
      nameRu: "Отряд 1: Лига Титанов (Керидра + Кирена + Зарянка: Яснопея)",
      nameEn: "Team 1: Titan League (Cerydra + Cyrene + Robin Summeretto)",
      descRu: "Топ-отряд Фаенона 4.7: Керидра и Кирена поддерживают ульт и мемо-механику, Яснопея даёт атаку и продвижение. Числа Керидры/Кирены — оценка.",
      descEn: "Phainon's top 4.7 team: Cerydra and Cyrene support the Ultimate and memo mechanics, Summeretto adds ATK and advance. Cerydra/Cyrene values estimated.",
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
          buffDescRu: "Мудрость: КУ + урон (оценка)",
          buffDescEn: "Wisdom: CRIT DMG + DMG (estimate)",
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
          buffDescRu: "Мемо-бафы, урон (оценка)",
          buffDescEn: "Memo buffs, DMG (estimate)",
          buffValues: { dmgBoost: 30, teamAdvance: 50 }
        },
        {
          id: "1512",
          nameRu: "Зарянка: Яснопея",
          nameEn: "Robin: Summeretto",
          icon: "icon/character/1512.png",
          names: ["яснопея", "summeretto"],
          altIds: ["1309"],
          roleRu: "Саппорт (Атака и продвижение)",
          roleEn: "Support (ATK and Advance)",
          buffDescRu: "Аналог Зарянки: ATK от собственной атаки, продвижение",
          buffDescEn: "Robin-style: ATK from own attack, advance",
          buffValues: { teamAdvance: 100, dmgBoost: 50 }
        }
      ]
    }
  ],

  // Фэйсяо — отряд 4.7 (Эшвейл + Зарянка + Мортенакс)
  "1220": [
    {
      id: "feixiao_ashwill_robin_mortenax",
      nameRu: "Отряд 2 (4.7): Бонус-атаки (Эшвейл + Зарянка + Мортенакс Блэйд)",
      nameEn: "Team 2 (4.7): Follow-Up (Ashwill + Robin + Mortenax Blade)",
      descRu: "Мета-отряд 4.7 для Фэйсяо: Эшвейл усиливает бонус-атаки и добавляет свои атаки, Зарянка — ATK и продвижение, Мортенакс держит выживание.",
      descEn: "4.7 meta team for Feixiao: Ashwill amplifies follow-ups and adds extra attacks, Robin gives ATK and advance, Mortenax sustains.",
      isEstimate: true,
      teammates: [
        {
          id: "1504",
          nameRu: "Эшвейл",
          nameEn: "Ashwill",
          icon: "icon/character/1504.png",
          names: ["эшвейл", "ashwill"],
          roleRu: "Саппорт (Усиление бонус-атак)",
          roleEn: "Support (FUA Amplify)",
          buffDescRu: "Урон бонус-атак, дополнительные атаки (оценка)",
          buffDescEn: "FUA DMG, extra attacks (estimate)",
          buffValues: { fuaVuln: 40, dmgBoost: 25 }
        },
        {
          id: "1309",
          nameRu: "Зарянка",
          nameEn: "Robin",
          icon: "icon/character/1309.png",
          names: ["зарянка", "робин", "robin"],
          roleRu: "Саппорт (Атака и продвижение)",
          roleEn: "Support (ATK and Advance)",
          buffDescRu: "Баф ATK, продвижение, КУ бонус-атак",
          buffDescEn: "ATK buff, advance, FUA Crit DMG",
          buffValues: { teamAdvance: 100, dmgBoost: 50, fuaCd: 25 }
        },
        {
          id: "1507",
          nameRu: "Мортенакс Блэйд",
          nameEn: "Mortenax Blade",
          icon: "icon/character/1507.png",
          names: ["мортенакс", "mortenax"],
          roleRu: "Сохранение (Щиты и суб-ДПС)",
          roleEn: "Sustain (Shields and Sub-DPS)",
          buffDescRu: "Щиты, собственный урон, усиление отряда",
          buffDescEn: "Shields, own damage, team amplification",
          buffValues: { defShred: 30 }
        }
      ]
    }
  ],

  // Сэйбер — отряд 4.7 (Гильгамеш + Зарянка + Хохо)
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
          roleEn: "Nihility (Sub-DPS and Debuff)",
          buffDescRu: "Дебаф урона, собственные атаки (оценка)",
          buffDescEn: "DMG debuff, own attacks (estimate)",
          buffValues: { allVuln: 20 }
        },
        {
          id: "1309",
          nameRu: "Зарянка",
          nameEn: "Robin",
          icon: "icon/character/1309.png",
          names: ["зарянка", "робин", "robin"],
          roleRu: "Саппорт (Атака и продвижение)",
          roleEn: "Support (ATK and Advance)",
          buffDescRu: "Баф ATK, продвижение всего отряда",
          buffDescEn: "ATK buff, full team advance",
          buffValues: { teamAdvance: 100, dmgBoost: 50 }
        },
        {
          id: "1217",
          nameRu: "Хохо",
          nameEn: "Huohuo",
          icon: "icon/character/1217.png",
          names: ["хохо", "huohuo"],
          roleRu: "Изобилие (Энергия и лечение)",
          roleEn: "Sustain (Energy and Healing)",
          buffDescRu: "+ATK и восстановление энергии для отряда",
          buffDescEn: "Team ATK buff and energy regeneration",
          buffValues: { atkGrant: 650, energyFeed: 20 }
        }
      ]
    }
  ],

  // Гисиленса — DoT-отряд (Кафка + Черный Лебедь + Хохо)
  "1410": [
    {
      id: "hysilens_kafka_swan_huohuo",
      nameRu: "Отряд 1: DoT-отряд (Кафка + Черный Лебедь + Хохо)",
      nameEn: "Team 1: DoT Team (Kafka + Black Swan + Huohuo)",
      descRu: "Классический DoT-отряд: Гисиленса распространяет DoT с врагов, Кафка активирует их, Черный Лебедь усиливает Эйфорию, Хохо держит выживание.",
      descEn: "Classic DoT team: Hysilens spreads DoTs, Kafka triggers them, Black Swan amplifies Elation, Huohuo sustains.",
      teammates: [
        {
          id: "1005",
          nameRu: "Кафка",
          nameEn: "Kafka",
          icon: "icon/character/1005.png",
          names: ["кафка", "kafka"],
          roleRu: "Нихилия (Активация DoT)",
          roleEn: "Nihility (DoT Trigger)",
          buffDescRu: "Мгновенная активация DoT, собственный урон",
          buffDescEn: "Instant DoT trigger, own damage",
          buffValues: { dotTrigger: true }
        },
        {
          id: "1307",
          nameRu: "Черный Лебедь",
          nameEn: "Black Swan",
          icon: "icon/character/1307.png",
          names: ["лебедь", "swan"],
          roleRu: "Нихилия (Усиление DoT)",
          roleEn: "Nihility (DoT Amplify)",
          buffDescRu: "Проникновение и урон DoT (оценка)",
          buffDescEn: "DoT penetration and damage (estimate)",
          buffValues: { defShred: 21, vuln: 25 }
        },
        {
          id: "1217",
          nameRu: "Хохо",
          nameEn: "Huohuo",
          icon: "icon/character/1217.png",
          names: ["хохо", "huohuo"],
          roleRu: "Изобилие (Энергия и лечение)",
          roleEn: "Sustain (Energy and Healing)",
          buffDescRu: "+ATK и восстановление энергии",
          buffDescEn: "ATK buff and energy regeneration",
          buffValues: { atkGrant: 650, energyFeed: 20 }
        }
      ]
    }
  ],

  // Кастория — мемо-отряд 4.7 (оценка)
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
          buffDescRu: "Усиление мемо-сущности (оценка)",
          buffDescEn: "Memosprite amplification (estimate)",
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
          buffDescEn: "+24% All-Type vulnerability",
          buffValues: { allVuln: 24 }
        },
        {
          id: "1409",
          nameRu: "Гиацина",
          nameEn: "Hyacine",
          icon: "icon/character/1409.png",
          names: ["гиацина", "hyacine"],
          roleRu: "Сохранение (Лечение и КШ)",
          roleEn: "Sustain (Heals and CR)",
          buffDescRu: "Лечение, +КШ (оценка)",
          buffDescEn: "Heals, CRIT Rate (estimate)",
          buffValues: { crGrant: 12, energyFeed: 20 }
        }
      ]
    }
  ]
};
