// Known Relic & Planar Set Definitions for Honkai: Star Rail (including 3.x and earlier)

export const SET_DEFINITIONS = [
  // 1. «Недосягаемый прорицатель» / Diviner of Distant Reach (HSR 3.x Cavern Set)
  {
    ids: ['123', '124'],
    keywords: ['прорицател', 'distant reach', 'vates', 'diviner', 'недосягаемый'],
    nameRu: 'Недосягаемый прорицатель',
    nameEn: 'Diviner of Distant Reach',
    isPlanar: false,
    icon: 'icon/relic/123.png',
    desc2Ru: 'Повышает скорость владельца на 6%.',
    desc2En: 'Increases the wearer\'s SPD by 6%.',
    desc4Ru: 'Если скорость владельца перед вступлением в бой 120/160 или выше, повышает Крит. шанс на 10%/18%. Когда владелец применяет способность Пути Радости впервые за бой, повышает эффект Радости всего отряда на 10%.',
    desc4En: 'If wearer\'s SPD before entering battle is 120/160 or higher, increases CRIT Rate by 10%/18%. When using an Elation ability for the first time in battle, increases all allies\' Elation by 10%.'
  },

  // 2. «Герой священного триумфа» / Hero of Triumphant Song (HSR 3.x Cavern Set)
  {
    ids: ['125'],
    keywords: ['триумф', 'священного триумфа', 'triumphant', 'hero of triumphant'],
    nameRu: 'Герой священного триумфа',
    nameEn: 'Hero of Triumphant Song',
    isPlanar: false,
    icon: 'icon/relic/125.png',
    desc2Ru: 'Повышает силу атаки владельца на 12%.',
    desc2En: 'Increases wearer\'s ATK by 12%.',
    desc4Ru: 'Повышает урон и Крит. урон персонажа при наличии активных усилений или призванного существа на поле боя.',
    desc4En: 'Increases DMG and CRIT DMG when buffed or when a summoned unit is active on the field.'
  },

  // 3. «Миг радости бога» / Moment of Joy (HSR 3.x Planar Set)
  {
    ids: ['319', '320', '321', '322', '323', '324', '325', '326'],
    keywords: ['миг радости бога', 'радости бога', 'миг радости', 'радост', 'вечная сцена', 'магический реквизит', 'moment of joy', 'joy', "god's moment", 'gods moment', 'eternal stage', 'magic prop'],
    nameRu: 'Миг радости бога',
    nameEn: 'Moment of Joy',
    isPlanar: true,
    icon: 'icon/relic/319.png',
    desc2Ru: 'Повышает скорость владельца на 6%. При входе в бой с Радостью действие персонажа немедленно продвигается вперёд на 40%.',
    desc2En: 'Increases wearer\'s SPD by 6%. When entering battle with Elation, advances action forward by 40%.'
  },

  // 4. «Подпространственный центр контроля аномалий» / Subspace ASC Center (HSR 3.x Planar Set)
  {
    ids: ['321', '322'],
    keywords: ['подпространственный центр', 'subspace', 'контроля аномалий', 'asc center'],
    nameRu: 'Подпространственный центр контроля аномалий',
    nameEn: 'Subspace ASC Center',
    isPlanar: true,
    icon: 'icon/relic/321.png',
    desc2Ru: 'Повышает скорость владельца на 6%. Если скорость владельца в бою 145 или выше, повышает Эффект Пробития всех союзников на 15%.',
    desc2En: 'Increases wearer\'s SPD by 6%. If wearer\'s SPD is 145 or higher, increases Break Effect of all allies by 15%.'
  },

  // 5. «Обращённый к небесам священник» / Sacerdos' Relived Ordeal
  {
    ids: ['121'],
    keywords: ['sacerdos', 'священник', 'обращённый к небесам священник', 'обращённый к небесам кузнец', 'кузнец'],
    nameRu: 'Обращённый к небесам священник',
    nameEn: 'Sacerdos\' Relived Ordeal',
    isPlanar: false,
    icon: 'icon/relic/121.png',
    desc2Ru: 'Повышает скорость владельца на 6%.',
    desc2En: 'Increases wearer\'s SPD by 6%.',
    desc4Ru: 'При применении навыка или сверхспособности к союзнику повышает его Крит. урон на 18% (складывается до 2 раз, до 36%) на 2 хода.',
    desc4En: 'When using Skill or Ultimate on an ally, increases their CRIT DMG by 18% (stacks up to 2 times, up to 36%) for 2 turns.'
  },

  // 6. «Вестник, блуждающий в хакерском пространстве» / Messenger Traversing Hackerspace
  {
    ids: ['114'],
    keywords: ['вестник', 'хакер', 'hackerspace', 'messenger'],
    nameRu: 'Вестник, блуждающий в хакерском пространстве',
    nameEn: 'Messenger Traversing Hackerspace',
    isPlanar: false,
    icon: 'icon/relic/114.png',
    desc2Ru: 'Повышает скорость владельца на 6%.',
    desc2En: 'Increases wearer\'s SPD by 6%.',
    desc4Ru: 'При применении Сверхспособности к союзнику повышает скорость всех союзников на 12% на 1 ход.',
    desc4En: 'When using Ultimate on an ally, increases SPD of all allies by 12% for 1 turn.'
  },

  // 7. «Орёл сумеречного рубежа» / Eagle of Twilight Line
  {
    ids: ['110'],
    keywords: ['орёл', 'орел', 'twilight', 'eagle'],
    nameRu: 'Орёл сумеречного рубежа',
    nameEn: 'Eagle of Twilight Line',
    isPlanar: false,
    icon: 'icon/relic/110.png',
    desc2Ru: 'Повышает ветряной урон на 10%.',
    desc2En: 'Increases Wind DMG by 10%.',
    desc4Ru: 'После применения Сверхспособности действие владельца продвигается вперёд на 25%.',
    desc4En: 'After using Ultimate, advances action forward by 25%.'
  },

  // 8. «Первооткрыватель мёртвых вод» / Pioneer Diver of Dead Waters
  {
    ids: ['117'],
    keywords: ['первооткрыватель', 'dead waters', 'pioneer'],
    nameRu: 'Первооткрыватель мёртвых вод',
    nameEn: 'Pioneer Diver of Dead Waters',
    isPlanar: false,
    icon: 'icon/relic/117.png',
    desc2Ru: 'Повышает урон по противникам с ослаблениями на 12%.',
    desc2En: 'Increases DMG dealt to enemies with debuffs by 12%.',
    desc4Ru: 'Повышает Крит. шанс на 4%. Повышает Крит. урон на 8%/12% по целям с 2/3+ дебаффами. При наложении дебаффа эффект удваивается на 1 ход.',
    desc4En: 'Increases CRIT Rate by 4%. Increases CRIT DMG by 8%/12% against enemies with 2/3+ debuffs. Effects double for 1 turn upon inflicting a debuff.'
  },

  // 9. «Железная кавалерия против мора» / Iron Cavalry Against the Scourge
  {
    ids: ['119'],
    keywords: ['кавалер', 'iron cavalry', 'scourge'],
    nameRu: 'Железная кавалерия против мора',
    nameEn: 'Iron Cavalry Against the Scourge',
    isPlanar: false,
    icon: 'icon/relic/119.png',
    desc2Ru: 'Повышает Эффект Пробития на 16%.',
    desc2En: 'Increases Break Effect by 16%.',
    desc4Ru: 'Если ЭП 150%/250%+, урон пробития игнорирует 10%/25% защиты цели.',
    desc4En: 'If Break Effect is 150%/250%+, break DMG ignores 10%/25% DEF.'
  },

  // 10. «Храбрый ветром всадник» / The Wind-Soaring Valorous
  {
    ids: ['120'],
    keywords: ['храбрый', 'доблестный', 'valorous'],
    nameRu: 'Храбрый ветром всадник',
    nameEn: 'The Wind-Soaring Valorous',
    isPlanar: false,
    icon: 'icon/relic/120.png',
    desc2Ru: 'Повышает силу атаки на 12%.',
    desc2En: 'Increases ATK by 12%.',
    desc4Ru: 'Повышает Крит. шанс на 6%. При использовании бонус-атаки повышает урон Сверхспособности на 36% на 1 ход.',
    desc4En: 'Increases CRIT Rate by 6%. When performing a follow-up attack, increases Ultimate DMG by 36% for 1 turn.'
  },

  // 11. «Живой Вонвак» / Sprightly Vonwacq (Planar)
  {
    ids: ['305'],
    keywords: ['вонвак', 'vonwacq'],
    nameRu: 'Живой Вонвак',
    nameEn: 'Sprightly Vonwacq',
    isPlanar: true,
    icon: 'icon/relic/305.png',
    desc2Ru: 'Повышает скорость восстановления энергии на 5%. Если скорость владельца 120 или выше, в начале боя действие продвигается вперёд на 40%.',
    desc2En: 'Increases wearer\'s ERR by 5%. If SPD is 120 or higher, advances action forward by 40% at battle start.'
  },

  // 12. «Русалка, затопленные берега» / Lushaka, the Sunken Seas (Planar)
  {
    ids: ['317', '318'],
    keywords: ['русалка', 'русалк', 'затопленные берега', 'лушака', 'lushaka', 'sunken seas'],
    nameRu: 'Русалка, затопленные берега',
    nameEn: 'Lushaka, the Sunken Seas',
    isPlanar: true,
    icon: 'icon/relic/317.png',
    desc2Ru: 'Повышает скорость восстановления энергии владельца на 5%. Если владелец не является первым персонажем в отряде, повышает силу атаки первого персонажа в отряде на 12%.',
    desc2En: 'Increases wearer\'s ERR by 5%. If the wearer is not the first character in the team, increases ATK of the first character in the team by 12%.'
  },

  // 13. «Сломанный киль» / Broken Keel (Planar)
  {
    ids: ['308'],
    keywords: ['киль', 'keel'],
    nameRu: 'Сломанный киль',
    nameEn: 'Broken Keel',
    isPlanar: true,
    icon: 'icon/relic/308.png',
    desc2Ru: 'Повышает Сопротивление эффектам владельца на 10%. Если Сопротивление эффектам 30% или выше, повышает Крит. урон всех союзников на 10%.',
    desc2En: 'Increases Effect RES by 10%. If Effect RES is 30% or higher, increases CRIT DMG of all allies by 10%.'
  },

  // 14. «Флот нестареющих» / Fleet of the Ageless (Planar)
  {
    ids: ['302'],
    keywords: ['флот', 'ageless'],
    nameRu: 'Флот нестареющих',
    nameEn: 'Fleet of the Ageless',
    isPlanar: true,
    icon: 'icon/relic/302.png',
    desc2Ru: 'Повышает макс. HP владельца на 12%. Если скорость 120 или выше, повышает силу атаки всех союзников на 8%.',
    desc2En: 'Increases Max HP by 12%. If SPD is 120 or higher, increases ATK of all allies by 8%.'
  },

  // 15. «Гламот, морской рубеж» / Firmament Frontline: Glamoth (Planar)
  {
    ids: ['311'],
    keywords: ['гламот', 'glamoth'],
    nameRu: 'Гламот, морской рубеж',
    nameEn: 'Firmament Frontline: Glamoth',
    isPlanar: true,
    icon: 'icon/relic/311.png',
    desc2Ru: 'Повышает силу атаки владельца на 12%. Если скорость 135/160 или выше, повышает наносимый урон на 12%/18%.',
    desc2En: 'Increases ATK by 12%. If SPD is 135/160 or higher, increases DMG by 12%/18%.'
  }
];

/**
 * Resolves standard name, definition and passive descriptions for any relic.
 */
export function resolveRelicSetInfo(r, lang = 'ru') {
  if (!r) return null;
  const isRu = lang === 'ru';
  const name = (r.name || '').toLowerCase();
  const sName = (r.set_name || '').toLowerCase();
  const sId = String(r.set_id || '');
  const combined = `${sName} ${name} ${sId}`;

  for (const def of SET_DEFINITIONS) {
    if (def.ids.includes(sId) || def.keywords.some(k => combined.includes(k))) {
      return {
        matched: true,
        name: isRu ? def.nameRu : def.nameEn,
        def,
        icon: def.icon
      };
    }
  }

  // Fallback
  return {
    matched: false,
    name: r.set_name || (isRu ? `Сет #${sId}` : `Set #${sId}`),
    def: null,
    icon: r.icon
  };
}

