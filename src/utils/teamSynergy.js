/**
 * NousMatrix Team Synergy & BiS Squad Database
 * Official Honkai: Star Rail team comps, stat transfers, and showcase matching.
 */

// Database of BiS squads for characters
export const CHARACTER_SQUADS = {
  // 1. HIMEKO / HIMEKO NOVA (1003)
  '1003': [
    {
      id: 'himeko_superbreak',
      nameRu: 'Отряд 1: Огненное Суперпробитие (Super Break)',
      nameEn: 'Team 1: Fire Super Break',
      descRu: 'Максимальный урон против боссов с уязвимостью к огню. Позволяет наносить гигантский урон при каждом истощении стойкости.',
      descEn: 'Dominates fire-weak encounters with massive Super Break hits upon toughness breaks.',
      teammates: [
        {
          id: '1303',
          nameRu: 'Жуань Мэй',
          nameEn: 'Ruan Mei',
          icon: 'icon/character/1303.png',
          names: ['руань мэй', 'ruan mei', 'ruan'],
          roleRu: 'Гармония (Пробитие)',
          roleEn: 'Harmony (Break)',
          buffDescRu: '+50% Эффективность пробития, +25% Пробитие всех RES, +10% SPD, +68% Урон',
          buffDescEn: '+50% Break Efficiency, +25% All-Type RES PEN, +10% SPD, +68% DMG',
          buffValues: { breakEff: 50, resPen: 25, teamSpd: 10, dmgBoost: 68 }
        },
        {
          id: '8005',
          altIds: ['8006', '1404'],
          nameRu: 'Первопроходец (Гармония)',
          nameEn: 'Trailblazer (Harmony)',
          icon: 'icon/character/8005.png',
          names: ['первопроходец', 'trailblazer', 'фугу', 'fugue'],
          roleRu: 'Гармония (Суперпробитие)',
          roleEn: 'Harmony (Super Break)',
          buffDescRu: 'Наложение статуса Суперпробития (160% множитель урона), +30% ЭП отряду',
          buffDescEn: 'Super Break trigger (160% multiplier), +30% BE to team',
          buffValues: { superBreakFactor: 1.6, beBoost: 30 }
        },
        {
          id: '1301',
          altIds: ['1222'],
          nameRu: 'Галлахер',
          nameEn: 'Gallagher',
          icon: 'icon/character/1301.png',
          names: ['галлахер', 'gallagher', 'линша', 'lingsha'],
          roleRu: 'Изобилие (Сустейн / Пробитие)',
          roleEn: 'Abundance (Sustain / Break)',
          buffDescRu: '+12.0% - 25.0% Уязвимость к пробитию, истощение огненной стойкости босса',
          buffDescEn: '+12-25% Break Vulnerability, rapid Fire toughness reduction',
          buffValues: { breakVuln: 18 }
        }
      ]
    },
    {
      id: 'himeko_fua_hyper',
      nameRu: 'Отряд 2: Победный кураж (Бонус-атаки и Продвижение)',
      nameEn: 'Team 2: Victory Rush Follow-up Hypercarry',
      descRu: 'Частые бонус-атаки с массовым продвижением отряда и колоссальным усилением критического урона.',
      descEn: 'Maximizes Victory Rush follow-up attacks through whole-team action advance and heavy Crit buffs.',
      teammates: [
        {
          id: '1309',
          nameRu: 'Робин',
          nameEn: 'Robin',
          icon: 'icon/character/1309.png',
          names: ['робин', 'robin'],
          roleRu: 'Гармония (100% Продвижение)',
          roleEn: 'Harmony (100% Advance)',
          buffDescRu: '100% Продвижение ВСЕГО отряда, +1100 ATK, +50% Урон, +25% КУ бонус-атак',
          buffDescEn: '100% Team Advance, +1100 ATK, +50% DMG, +25% FUA Crit DMG',
          buffValues: { teamAdvance: 100, atkGrant: 1100, dmgBoost: 50, fuaCd: 25 }
        },
        {
          id: '1313',
          altIds: ['1306', '1112'],
          nameRu: 'Воскресенье',
          nameEn: 'Sunday',
          icon: 'icon/character/1313.png',
          names: ['воскресенье', 'sunday', 'искорка', 'sparkle', 'топаз', 'topaz'],
          roleRu: 'Гармония (Крит. урон и Заливка)',
          roleEn: 'Harmony (Crit & Energy Feed)',
          buffDescRu: '100% Продвижение хода, передача +78% КУ от базы, +50% Урон цели, +40 EP',
          buffDescEn: '100% Target Advance, +78% Crit DMG transfer, +50% DMG, +40 EP',
          buffValues: { targetAdvance: 100, cdGrant: 78, dmgBoost: 50, energyFeed: 40 }
        },
        {
          id: '1304',
          nameRu: 'Авантюрин',
          nameEn: 'Aventurine',
          icon: 'icon/character/1304.png',
          names: ['авантюрин', 'aventurine'],
          roleRu: 'Сохранение (Щиты / Саб-ДПС)',
          roleEn: 'Preservation (Shield & Sub-DPS)',
          buffDescRu: '+15.0% Крит. уязвимость врага, +50% Effect RES отряду, общие бонус-атаки',
          buffDescEn: '+15.0% Crit Vulnerability, +50% Effect RES, co-op follow-up attacks',
          buffValues: { critVuln: 15, teamEffectRes: 50 }
        }
      ]
    }
  ],

  // 2. ACHERON (1308)
  '1308': [
    {
      id: 'acheron_nihility_bis',
      nameRu: 'Отряд 1: Премиум Двойное Небытие (Цзяоцю + Волк)',
      nameEn: 'Team 1: Premium Dual Nihility',
      descRu: 'Золотой стандарт Ахерон: непрерывная генерация зарядов Слэша при каждом ходе любого врага и максимальный срез защиты.',
      descEn: 'The undisputed gold standard for Acheron: feeds Slashed Dream charges on enemy turns and shreds defense.',
      teammates: [
        {
          id: '1218',
          nameRu: 'Цзяоцю',
          nameEn: 'Jiaoqiu',
          icon: 'icon/character/1218.png',
          names: ['цзяоцю', 'jiaoqiu'],
          roleRu: 'Небытие (Уязвимость Ульт)',
          roleEn: 'Nihility (Ult Vulnerability)',
          buffDescRu: '+35.0% Урон ультимейтов, +15.0% Входящий урон, генерация зарядов каждый ход врага',
          buffDescEn: '+35% Ult DMG taken, +15% All DMG taken, charge feed on enemy actions',
          buffValues: { ultVuln: 35, allVuln: 15, slashFeed: true }
        },
        {
          id: '1006',
          altIds: ['1105'],
          nameRu: 'Серебряный Волк',
          nameEn: 'Silver Wolf',
          icon: 'icon/character/1006.png',
          names: ['серебряный волк', 'silver wolf', 'волк', 'пела', 'pela'],
          roleRu: 'Небытие (Срез защиты)',
          roleEn: 'Nihility (DEF Shred)',
          buffDescRu: '-45.0% Защиты цели со Сверхспособности, -20.0% RES внедрённого элемента',
          buffDescEn: '-45% DEF Shred from Ult, -20% Elemental RES reduction',
          buffValues: { defShred: 45, resPen: 20 }
        },
        {
          id: '1304',
          altIds: ['1301', '1208'],
          nameRu: 'Авантюрин',
          nameEn: 'Aventurine',
          icon: 'icon/character/1304.png',
          names: ['авантюрин', 'aventurine', 'галлахер', 'gallagher', 'фу сюань', 'fu xuan'],
          roleRu: 'Сохранение (Тренд / Дебаффы)',
          roleEn: 'Preservation (Trend / Debuffs)',
          buffDescRu: 'Щиты отряда, +15% Крит. уязвимость, наложение дебаффов для зарядов Ахерон',
          buffValues: { critVuln: 15, debuffProcs: true }
        }
      ]
    },
    {
      id: 'acheron_sparkle_e2',
      nameRu: 'Отряд 2: Гиперкерри с Продвижением (Искорка/Сандей)',
      nameEn: 'Team 2: Action Advance Hypercarry',
      descRu: 'Для Э2+ Ахерон или ротаций через гиперскоростных буферов действий для частых ультимейтов.',
      descEn: 'Optimized for E2+ Acheron or hyperspeed buffer rotations for rapid ultimate cycles.',
      teammates: [
        {
          id: '1306',
          altIds: ['1313'],
          nameRu: 'Искорка',
          nameEn: 'Sparkle',
          icon: 'icon/character/1306.png',
          names: ['искорка', 'sparkle', 'воскресенье', 'sunday'],
          roleRu: 'Гармония (Продвижение и КУ)',
          roleEn: 'Harmony (Advance & Crit)',
          buffDescRu: '+50% Продвижение, передача +102% КУ, +48% Урон, расширение до 7 SP',
          buffValues: { targetAdvance: 50, cdGrant: 102, dmgBoost: 48, spBurst: 4 }
        },
        {
          id: '1218',
          altIds: ['1105'],
          nameRu: 'Цзяоцю',
          nameEn: 'Jiaoqiu',
          icon: 'icon/character/1218.png',
          names: ['цзяоцю', 'jiaoqiu', 'пела', 'pela'],
          roleRu: 'Небытие (Срез / Уязвимость)',
          roleEn: 'Nihility (Shred & Vuln)',
          buffDescRu: '+35% Урон ультимейтов или -42% Срез защиты AoE',
          buffValues: { ultVuln: 35, defShred: 42 }
        },
        {
          id: '1304',
          nameRu: 'Авантюрин',
          nameEn: 'Aventurine',
          icon: 'icon/character/1304.png',
          names: ['авантюрин', 'aventurine'],
          roleRu: 'Сохранение (Танк)',
          roleEn: 'Preservation (Tank)',
          buffDescRu: 'Щиты, +15% Крит. уязвимость босса',
          buffValues: { critVuln: 15 }
        }
      ]
    }
  ],

  // 3. FIREFLY (1310)
  '1310': [
    {
      id: 'firefly_break_meta',
      nameRu: 'Отряд 1: Абсолютное Суперпробитие (Жуань Мэй + ГГ)',
      nameEn: 'Team 1: Premier Super Break Meta',
      descRu: 'Бис-команда Светлячка: максимальное истощение стойкости и непрерывный урон суперпробития.',
      descEn: 'Firefly absolute best-in-slot squad: extreme toughness depletion and Super Break burst.',
      teammates: [
        {
          id: '1303',
          nameRu: 'Жуань Мэй',
          nameEn: 'Ruan Mei',
          icon: 'icon/character/1303.png',
          names: ['руань мэй', 'ruan mei'],
          roleRu: 'Гармония (Пробитие)',
          roleEn: 'Harmony (Break)',
          buffDescRu: '+50% Эффективность пробития, +25% All-Type RES PEN, +10% SPD, задержка восстановления',
          buffValues: { breakEff: 50, resPen: 25, teamSpd: 10 }
        },
        {
          id: '8005',
          altIds: ['8006'],
          nameRu: 'Первопроходец (Гармония)',
          nameEn: 'Trailblazer (Harmony)',
          icon: 'icon/character/8005.png',
          names: ['первопроходец', 'trailblazer', 'гармония'],
          roleRu: 'Гармония (Суперпробитие)',
          roleEn: 'Harmony (Super Break)',
          buffDescRu: 'Урон суперпробития от стойкости (160% множитель), +30% ЭП',
          buffValues: { superBreakFactor: 1.6, beBoost: 30 }
        },
        {
          id: '1301',
          altIds: ['1222'],
          nameRu: 'Галлахер',
          nameEn: 'Gallagher',
          icon: 'icon/character/1301.png',
          names: ['галлахер', 'gallagher', 'линша', 'lingsha'],
          roleRu: 'Изобилие (Огненный Сустейн)',
          roleEn: 'Abundance (Fire Sustain)',
          buffDescRu: '+12-25% Уязвимость к пробитию, быстрая зачистка огненной стойкости',
          buffValues: { breakVuln: 18 }
        }
      ]
    },
    {
      id: 'firefly_fugue_variant',
      nameRu: 'Отряд 2: Новая Эра (Фугу + Линша)',
      nameEn: 'Team 2: Advanced Break Wave',
      descRu: 'Вариант с экзотической стойкостью Фугу для пробития врагов без ожидания естественной уязвимости.',
      descEn: 'Utilizes Fugue cloud-pinned toughness mechanics to destroy enemies independent of innate weaknesses.',
      teammates: [
        {
          id: '1404',
          nameRu: 'Фугу',
          nameEn: 'Fugue',
          icon: 'icon/character/1404.png',
          names: ['фугу', 'fugue'],
          roleRu: 'Небытие / Гармония (Экзо-стойкость)',
          roleEn: 'Nihility / Harmony',
          buffDescRu: 'Внедрение Экзо-стойкости, усиление суперпробития всего отряда',
          buffValues: { exoBreak: true, beBoost: 40 }
        },
        {
          id: '1303',
          nameRu: 'Жуань Мэй',
          nameEn: 'Ruan Mei',
          icon: 'icon/character/1303.png',
          names: ['руань мэй', 'ruan mei'],
          roleRu: 'Гармония (Пробитие)',
          roleEn: 'Harmony (Break)',
          buffDescRu: '+50% Эффективность пробития, +25% All-Type RES PEN',
          buffValues: { breakEff: 50, resPen: 25 }
        },
        {
          id: '1222',
          nameRu: 'Линша',
          nameEn: 'Lingsha',
          icon: 'icon/character/1222.png',
          names: ['линша', 'lingsha'],
          roleRu: 'Изобилие (Суперпробитие)',
          roleEn: 'Abundance (Super Break)',
          buffDescRu: '+25.0% Уязвимость к пробитию, AoE лечение при каждом ходе зайца',
          buffValues: { breakVuln: 25 }
        }
      ]
    }
  ],

  // 4. MORTENAX BLADE (1507)
  '1507': [
    {
      id: 'mortenax_hypercarry',
      nameRu: 'Отряд 1: Бесконечная Ярость (Сандей + Робин)',
      nameEn: 'Team 1: Infinite Fury Hypercarry',
      descRu: 'Гиперкерри через максимальный запас HP: Сандей и Робин удваивают действия Мортенакса до истечения Зоны 70 SPD.',
      descEn: 'Maximizes personal Fire HP damage before the 70 SPD zone expires via double action advances.',
      teammates: [
        {
          id: '1313',
          nameRu: 'Воскресенье',
          nameEn: 'Sunday',
          icon: 'icon/character/1313.png',
          names: ['воскресенье', 'sunday'],
          roleRu: 'Гармония (100% Продвижение)',
          roleEn: 'Harmony (100% Advance)',
          buffDescRu: '100% Продвижение хода, передача КУ от базы, +50% Урон цели, +40 EP',
          buffValues: { targetAdvance: 100, cdGrant: 78, dmgBoost: 50 }
        },
        {
          id: '1309',
          altIds: ['1303'],
          nameRu: 'Робин',
          nameEn: 'Robin',
          icon: 'icon/character/1309.png',
          names: ['робин', 'robin', 'руань мэй', 'ruan mei'],
          roleRu: 'Гармония (Командный Урон)',
          roleEn: 'Harmony (Team Damage)',
          buffDescRu: '100% Продвижение отряда, +50% Урон, накладывает Узы гибели атаками Концерта',
          buffValues: { teamAdvance: 100, dmgBoost: 50 }
        },
        {
          id: '1304',
          altIds: ['1203'],
          nameRu: 'Авантюрин',
          nameEn: 'Aventurine',
          icon: 'icon/character/1304.png',
          names: ['авантюрин', 'aventurine', 'лоча', 'luocha'],
          roleRu: 'Сустейн (Щиты / Авто-отхил)',
          roleEn: 'Sustain (Shield / Heal)',
          buffDescRu: 'Атаки активируют дебаффы Мортенакса, щиты/хил компенсируют трату HP',
          buffValues: { teamEffectRes: 50 }
        }
      ]
    },
    {
      id: 'mortenax_subdps_carry',
      nameRu: 'Отряд 2: Синхронизированный Саб-ДПС (Двойной Керри)',
      nameEn: 'Team 2: Dual Carry Synergy',
      descRu: 'Мортенакс работает как саб-ДПС: срезает -30% DEF и даёт +50% уязвимости для второго основного ДПС (Ахерон/Фэйсяо).',
      descEn: 'Mortenax provides -30% DEF shred & +50% vulnerability enabling a second main carry.',
      teammates: [
        {
          id: '1308',
          altIds: ['1220'],
          nameRu: 'Ахерон',
          nameEn: 'Acheron',
          icon: 'icon/character/1308.png',
          names: ['ахерон', 'acheron', 'фэйсяо', 'feixiao'],
          roleRu: 'Основной ДПС (Гиперкерри)',
          roleEn: 'Main DPS Carry',
          buffDescRu: 'Утилизирует командный срез защиты -30% DEF и уязвимость +50% Мортенакса',
          buffValues: { carrySynergy: true }
        },
        {
          id: '1218',
          altIds: ['1105', '1303'],
          nameRu: 'Цзяоцю',
          nameEn: 'Jiaoqiu',
          icon: 'icon/character/1218.png',
          names: ['цзяоцю', 'jiaoqiu', 'пела', 'pela', 'руань мэй', 'ruan mei'],
          roleRu: 'Небытие / Гармония',
          roleEn: 'Nihility / Harmony',
          buffDescRu: 'Суммирует срез защиты до капа 100% DEF Shred и даёт дополнительную уязвимость',
          buffValues: { defShred: 40, vuln: 15 }
        },
        {
          id: '1304',
          nameRu: 'Авантюрин',
          nameEn: 'Aventurine',
          icon: 'icon/character/1304.png',
          names: ['авантюрин', 'aventurine'],
          roleRu: 'Сохранение (Танк)',
          roleEn: 'Preservation (Tank)',
          buffDescRu: '+15% Крит. уязвимость, совместные атаки накапливают заряды обоим керри',
          buffValues: { critVuln: 15 }
        }
      ]
    }
  ],

  // 5. FEIXIAO (1220)
  '1220': [
    {
      id: 'feixiao_premium_fua',
      nameRu: 'Отряд 1: Премиум Бонус-атаки (FUA Meta)',
      nameEn: 'Team 1: Premium FUA Meta',
      descRu: 'Максимальная скорость накопления Ультимейта за счёт частых совместных атак Топаз, Робин и Авантюрина.',
      descEn: 'Fastest Flying Aureus ultimate charging via rapid follow-ups from Topaz, Robin & Aventurine.',
      teammates: [
        {
          id: '1309',
          nameRu: 'Робин',
          nameEn: 'Robin',
          icon: 'icon/character/1309.png',
          names: ['робин', 'robin'],
          roleRu: 'Гармония (100% Продвижение)',
          roleEn: 'Harmony (100% Advance)',
          buffDescRu: '100% Продвижение отряда, +1100 ATK, +50% Урон, +25% КУ бонус-атак',
          buffValues: { teamAdvance: 100, atkGrant: 1100, dmgBoost: 50, fuaCd: 25 }
        },
        {
          id: '1112',
          altIds: ['1224', '1223'],
          nameRu: 'Топаз',
          nameEn: 'Topaz',
          icon: 'icon/character/1112.png',
          names: ['топаз', 'topaz', 'март 7', 'march 7th', 'модзэ', 'moze'],
          roleRu: 'Охота (Уязвимость Бонус-атак)',
          roleEn: 'Hunt (FUA Vulnerability)',
          buffDescRu: '+50.0% Урона бонус-атак по цели, непрерывные атаки для зарядов Фэйсяо',
          buffValues: { fuaVuln: 50 }
        },
        {
          id: '1304',
          nameRu: 'Авантюрин',
          nameEn: 'Aventurine',
          icon: 'icon/character/1304.png',
          names: ['авантюрин', 'aventurine'],
          roleRu: 'Сохранение (Щиты / Бонус-атаки)',
          roleEn: 'Preservation (FUA Shielder)',
          buffDescRu: '+15.0% Крит. уязвимость, совместные атаки накапливают стаки ульты',
          buffValues: { critVuln: 15 }
        }
      ]
    },
    {
      id: 'feixiao_sunday_hyper',
      nameRu: 'Отряд 2: Небесное Ускорение (Сандей + Топаз)',
      nameEn: 'Team 2: Heavenly Advance Hyper',
      descRu: 'Сандей продвигает действия Фэйсяо на 100% и передаёт огромную крит-массу.',
      descEn: 'Sunday directly advances Feixiao by 100% and feeds massive Crit DMG.',
      teammates: [
        {
          id: '1313',
          nameRu: 'Воскресенье',
          nameEn: 'Sunday',
          icon: 'icon/character/1313.png',
          names: ['воскресенье', 'sunday'],
          roleRu: 'Гармония (100% Продвижение)',
          roleEn: 'Harmony (100% Advance)',
          buffDescRu: '100% Продвижение хода, передача КУ от базы, +50% Урон цели',
          buffValues: { targetAdvance: 100, cdGrant: 78, dmgBoost: 50 }
        },
        {
          id: '1112',
          altIds: ['1224'],
          nameRu: 'Топаз',
          nameEn: 'Topaz',
          icon: 'icon/character/1112.png',
          names: ['топаз', 'topaz', 'март 7', 'march 7th'],
          roleRu: 'Охота (FUA Бафф)',
          roleEn: 'Hunt (FUA Buff)',
          buffDescRu: '+50% Урона бонус-атак по боссу',
          buffValues: { fuaVuln: 50 }
        },
        {
          id: '1304',
          nameRu: 'Авантюрин',
          nameEn: 'Aventurine',
          icon: 'icon/character/1304.png',
          names: ['авантюрин', 'aventurine'],
          roleRu: 'Сохранение (Танк)',
          roleEn: 'Preservation (Tank)',
          buffDescRu: 'Щиты отряда, +15% Крит. уязвимость',
          buffValues: { critVuln: 15 }
        }
      ]
    }
  ]
};

// Generic Fallback Squads for any other DPS
export function getGenericSquads(char, lang = 'ru') {
  const isRu = lang === 'ru';
  return [
    {
      id: 'generic_hypercarry',
      nameRu: 'Отряд 1: Классический Гиперкерри (Гармония + Срез Защиты)',
      nameEn: 'Team 1: Classic Hypercarry (Harmony + DEF Shred)',
      descRu: 'Максимизация урона через удвоение ходов, заливку критического урона и срез защиты босса.',
      descEn: 'Maximizes carry damage via action advances, Crit DMG buffs and defense shred.',
      teammates: [
        {
          id: '1313',
          altIds: ['1306', '1101'],
          names: ['воскресенье', 'sunday', 'искорка', 'sparkle', 'броня', 'bronya'],
          roleRu: 'Гармония (Продвижение и КУ)',
          roleEn: 'Harmony (Advance & Crit)',
          buffDescRu: '50-100% Продвижение хода, передача +60-80% КУ, +50% Урон цели',
          buffValues: { targetAdvance: 100, cdGrant: 70, dmgBoost: 50 }
        },
        {
          id: '1309',
          altIds: ['1303', '1105'],
          names: ['робин', 'robin', 'руань мэй', 'ruan mei', 'пела', 'pela'],
          roleRu: 'Гармония / Небытие',
          roleEn: 'Harmony / Nihility',
          buffDescRu: '100% Продвижение отряда / +25% RES PEN / -42% Срез защиты',
          buffValues: { dmgBoost: 50, resPen: 25, defShred: 42 }
        },
        {
          id: '1304',
          altIds: ['1208', '1203', '1217'],
          names: ['авантюрин', 'aventurine', 'фу сюань', 'fu xuan', 'лоча', 'luocha', 'хохо', 'huohuo'],
          roleRu: 'Сустейн (Защита и Баффы)',
          roleEn: 'Sustain (Shield & Buffs)',
          buffDescRu: 'Полное выживание команды, +15% КУ уязвимость или +12% КШ пассивно',
          buffValues: { critVuln: 15, teamEffectRes: 50 }
        }
      ]
    },
    {
      id: 'generic_dual_dps',
      nameRu: 'Отряд 2: Двойной ДПС с Универсальным Буфером',
      nameEn: 'Team 2: Dual DPS with Universal Buffer',
      descRu: 'Сборка под одновременную работу двух атакующих персонажей под аурами Жуань Мэй или Робин.',
      descEn: 'Dual carry setup amplified by whole-party auras from Ruan Mei or Robin.',
      teammates: [
        {
          id: '1303',
          altIds: ['1309'],
          names: ['руань мэй', 'ruan mei', 'робин', 'robin'],
          roleRu: 'Гармония (Аура Отряда)',
          roleEn: 'Harmony (Team Aura)',
          buffDescRu: '+50% Пробитие, +25% RES PEN, +10% SPD, +68% Общий урон',
          buffValues: { breakEff: 50, resPen: 25, dmgBoost: 68 }
        },
        {
          id: '1105',
          altIds: ['1006', '1218'],
          names: ['пела', 'pela', 'серебряный волк', 'silver wolf', 'цзяоцю', 'jiaoqiu'],
          roleRu: 'Небытие (Дебаффы)',
          roleEn: 'Nihility (Debuffs)',
          buffDescRu: 'Массовый срез защиты -42% DEF AoE или точечные ослабления',
          buffValues: { defShred: 42 }
        },
        {
          id: '1304',
          altIds: ['1301', '1222'],
          names: ['авантюрин', 'aventurine', 'галлахер', 'gallagher', 'линша', 'lingsha'],
          roleRu: 'Сустейн (Танк / Хил)',
          roleEn: 'Sustain (Tank / Heal)',
          buffDescRu: 'Защитные барьеры и дополнительный саб-ДПС вклад в цикл',
          buffValues: { critVuln: 15 }
        }
      ]
    }
  ];
}

/**
 * Matches recommended teammates against the player's showcase characters.
 * If found, extracts real equipment stats to compute 100% exact live numbers.
 */
export function matchSquadWithShowcase(squad, showcaseCharacters = [], lang = 'ru') {
  if (!squad || !Array.isArray(squad.teammates)) return [];

  return squad.teammates.map(rec => {
    // 1. Look for matching character in the player's 8 showcase slots
    const matchedChar = (showcaseCharacters || []).find(c => {
      const cId = String(c.id || '');
      const cName = (c.name || '').toLowerCase();
      if (cId === rec.id) return true;
      if (rec.altIds && rec.altIds.includes(cId)) return true;
      if (rec.names && rec.names.some(n => cName.includes(n))) return true;
      return false;
    });

    if (matchedChar) {
      // Character is PRESENT in showcase! Extract REAL stats from equipment
      const baseMap = {};
      (matchedChar.attributes || []).forEach(a => { baseMap[a.field] = a; });
      const addMap = {};
      (matchedChar.additions || []).forEach(a => { addMap[a.field] = a; });
      const getStat = (field) => (baseMap[field]?.value || 0) + (addMap[field]?.value || 0);

      const realHp = Math.round(getStat('hp'));
      const realAtk = Math.round(getStat('atk'));
      const realDef = Math.round(getStat('def'));
      const realSpd = parseFloat(getStat('spd').toFixed(1));
      const realCr = parseFloat((getStat('crit_rate') * 100).toFixed(1));
      const realCd = parseFloat((getStat('crit_dmg') * 100).toFixed(1));
      const realBe = parseFloat(((addMap['break_dmg']?.value || 0) * 100).toFixed(1));
      const realEhr = parseFloat(((addMap['effect_hit']?.value || 0) * 100).toFixed(1));

      // Calculate dynamic buff based on their actual build
      const dynamicBuffs = { ...rec.buffValues };
      let dynamicBuffDescRu = rec.buffDescRu;
      let dynamicBuffDescEn = rec.buffDescEn;

      // Special dynamic calculations:
      // Sunday: 12% + 30% of Sunday's actual CD
      if (rec.id === '1313' || (matchedChar.name || '').toLowerCase().includes('воскресенье') || (matchedChar.name || '').toLowerCase().includes('sunday')) {
        const exactCdGrant = (12 + realCd * 0.30).toFixed(1);
        dynamicBuffs.cdGrant = parseFloat(exactCdGrant);
        dynamicBuffDescRu = `100% Продвижение, передача +${exactCdGrant}% КУ (от реальных ${realCd.toFixed(1)}% КУ), +50% Урон, +40 EP`;
        dynamicBuffDescEn = `100% Target Advance, +${exactCdGrant}% Crit DMG transfer (from ${realCd.toFixed(1)}% CD), +50% DMG, +40 EP`;
      }

      // Robin: 22.8% of Robin's actual ATK + 200
      if (rec.id === '1309' || (matchedChar.name || '').toLowerCase().includes('робин') || (matchedChar.name || '').toLowerCase().includes('robin')) {
        const exactAtkGrant = Math.round(realAtk * 0.228 + 200);
        dynamicBuffs.atkGrant = exactAtkGrant;
        dynamicBuffDescRu = `100% Продвижение всего отряда, +${exactAtkGrant} ATK (от реальных ${realAtk} ATK), +50% Урон, +25% КУ бонус-атак`;
        dynamicBuffDescEn = `100% Team Advance, +${exactAtkGrant} ATK (from ${realAtk} ATK), +50% DMG, +25% FUA Crit DMG`;
      }

      // Sparkle: 24% of Sparkle's actual CD + 45%
      if (rec.id === '1306' || (matchedChar.name || '').toLowerCase().includes('искорка') || (matchedChar.name || '').toLowerCase().includes('sparkle')) {
        const exactCdGrant = (45 + realCd * 0.24).toFixed(1);
        dynamicBuffs.cdGrant = parseFloat(exactCdGrant);
        dynamicBuffDescRu = `+50% Продвижение, передача +${exactCdGrant}% КУ (от реальных ${realCd.toFixed(1)}% КУ), +48% Урон, лимит 7 SP`;
        dynamicBuffDescEn = `+50% Advance, +${exactCdGrant}% Crit DMG transfer (from ${realCd.toFixed(1)}% CD), +48% DMG, max 7 SP`;
      }

      // Ruan Mei: 68% DMG if BE >= 180
      if (rec.id === '1303' || (matchedChar.name || '').toLowerCase().includes('руань') || (matchedChar.name || '').toLowerCase().includes('ruan')) {
        const dmg = realBe >= 180 ? 68 : Math.round(36 + (realBe / 180) * 32);
        dynamicBuffs.dmgBoost = dmg;
        dynamicBuffDescRu = `+50% Эффективность пробития, +25% All-Type RES PEN, +10% SPD, +${dmg}% Урон (${realBe.toFixed(0)}% ЭП)`;
        dynamicBuffDescEn = `+50% Break Efficiency, +25% All-Type RES PEN, +10% SPD, +${dmg}% DMG (${realBe.toFixed(0)}% BE)`;
      }

      return {
        ...rec,
        matchedChar,
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

    // Character is NOT in showcase
    return {
      ...rec,
      matchedChar: null,
      isEquippedInShowcase: false,
      realStats: null,
      dynamicBuffs: rec.buffValues,
      dynamicBuffDescRu: rec.buffDescRu,
      dynamicBuffDescEn: rec.buffDescEn
    };
  });
}
