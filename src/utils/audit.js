import { resolveRelicSetInfo } from './setDefinitions.js';

export const CDN_MIRRORS = [
  'https://fastly.jsdelivr.net/gh/Mar-7th/StarRailRes@master/',
  'https://cdn.jsdelivr.net/gh/Mar-7th/StarRailRes@master/',
  'https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/',
  'https://raw.gitmirror.com/Mar-7th/StarRailRes/master/'
];

export const CDN_BASE = CDN_MIRRORS[0];

export function iconUrl(path) {
  if (!path) return '';
  return path.startsWith('http') ? path : `${CDN_BASE}${path}`;
}

export function handleImageFallback(e, originalPath) {
  if (!e || !e.target || !originalPath) return;
  const currentSrc = e.target.src || '';
  const tryIndex = parseInt(e.target.dataset.tryIndex || '0', 10);

  if (tryIndex + 1 < CDN_MIRRORS.length) {
    const nextMirror = CDN_MIRRORS[tryIndex + 1];
    e.target.dataset.tryIndex = String(tryIndex + 1);
    e.target.src = `${nextMirror}${originalPath}`;
  }
}

export function getCharAvatarPath(char) {
  if (!char) return '';
  if (char.id) {
    return `icon/avatar/${char.id}.png`;
  }
  return char.icon || '';
}

export function getCharHeadIcon(char) {
  if (!char) return '';
  return iconUrl(getCharAvatarPath(char));
}

// Archetype-aware main stat validation and scoring
export function evaluateRelicMainStat(relic, archetype, char) {
  if (!relic || !relic.main_affix) {
    return { status: 'optimal', scoreBonus: 0, labelRu: 'ВЕРНЫЙ СТАТ', labelEn: 'OPTIMAL' };
  }

  const slotType = Number(relic.type);
  const field = relic.main_affix.field || '';
  const charElemId = (char?.element?.id || '').toLowerCase(); // 'physical', 'fire', 'ice', 'thunder', 'wind', 'quantum', 'imaginary'
  const charElemField = charElemId ? `${charElemId}_dmg` : '';

  // Slot 1 (Head) & Slot 2 (Hands) are fixed main stats in HSR (Flat HP and Flat ATK)
  if (slotType === 1 || slotType === 2) {
    return {
      status: 'optimal',
      scoreBonus: 2,
      labelRu: 'ВЕРНЫЙ СТАТ',
      labelEn: 'OPTIMAL'
    };
  }

  // Slot 3: Body (Тело)
  if (slotType === 3) {
    switch (archetype) {
      case 'CRIT_DPS':
        if (field === 'crit_rate' || field === 'crit_dmg') {
          return { status: 'optimal', scoreBonus: 3, labelRu: 'ВЕРНЫЙ СТАТ (КРИТЫ)', labelEn: 'OPTIMAL (CRIT)' };
        }
        if (field === 'atk') {
          return { status: 'viable', scoreBonus: 0, labelRu: 'ДОПУСТИМЫЙ (АТК%)', labelEn: 'VIABLE (ATK%)', recommendedRu: 'Крит. Шанс / Крит. Урон', recommendedEn: 'CRIT Rate / CRIT DMG' };
        }
        return {
          status: 'wrong',
          scoreBonus: -18,
          labelRu: 'НЕПОДХОДЯЩИЙ СТАТ',
          labelEn: 'WRONG MAIN STAT',
          recommendedRu: 'Крит. Шанс или Крит. Урон',
          recommendedEn: 'CRIT Rate or CRIT DMG'
        };

      case 'HP_CRIT_DPS':
        if (field === 'crit_rate' || field === 'crit_dmg') {
          return { status: 'optimal', scoreBonus: 3.5, labelRu: 'ВЕРНЫЙ СТАТ (КРИТЫ)', labelEn: 'OPTIMAL (CRIT)' };
        }
        if (field === 'hp') {
          return { status: 'optimal', scoreBonus: 2.5, labelRu: 'ВЕРНЫЙ СТАТ (HP%)', labelEn: 'OPTIMAL (HP%)' };
        }
        return {
          status: 'wrong',
          scoreBonus: -18,
          labelRu: 'НЕПОДХОДЯЩИЙ СТАТ',
          labelEn: 'WRONG MAIN STAT',
          recommendedRu: 'Крит. Шанс, Крит. Урон или HP%',
          recommendedEn: 'CRIT Rate, CRIT DMG or HP%'
        };

      case 'BREAK_DPS':
        if (field === 'atk' || field === 'hp' || field === 'def' || field === 'crit_rate' || field === 'crit_dmg') {
          return { status: 'optimal', scoreBonus: 3, labelRu: 'ВЕРНЫЙ СТАТ', labelEn: 'OPTIMAL' };
        }
        return {
          status: 'wrong',
          scoreBonus: -18,
          labelRu: 'НЕПОДХОДЯЩИЙ СТАТ',
          labelEn: 'WRONG MAIN STAT',
          recommendedRu: 'Сила атаки% или HP%',
          recommendedEn: 'ATK% or HP%'
        };

      case 'DOT_DPS':
        if (field === 'atk' || field === 'effect_hit') {
          return { status: 'optimal', scoreBonus: 3, labelRu: 'ВЕРНЫЙ СТАТ', labelEn: 'OPTIMAL' };
        }
        if (field === 'hp' || field === 'def') {
          return { status: 'viable', scoreBonus: 0, labelRu: 'ДОПУСТИМЫЙ', labelEn: 'VIABLE', recommendedRu: 'АТК% или ШПЭ', recommendedEn: 'ATK% or EHR' };
        }
        return {
          status: 'wrong',
          scoreBonus: -18,
          labelRu: 'НЕПОДХОДЯЩИЙ СТАТ',
          labelEn: 'WRONG MAIN STAT',
          recommendedRu: 'Сила атаки% или Шанс попадания эффектов',
          recommendedEn: 'ATK% or Effect Hit Rate'
        };

      case 'HARMONY_CRIT':
        if (field === 'crit_dmg') {
          return { status: 'optimal', scoreBonus: 4, labelRu: 'ВЕРНЫЙ СТАТ (КУ)', labelEn: 'OPTIMAL (CD)' };
        }
        if (field === 'hp' || field === 'def') {
          return { status: 'viable', scoreBonus: 0, labelRu: 'ДОПУСТИМЫЙ (ВЫЖИВАЕМОСТЬ)', labelEn: 'VIABLE (SURVIVAL)', recommendedRu: 'Крит. Урон', recommendedEn: 'CRIT DMG' };
        }
        return {
          status: 'wrong',
          scoreBonus: -18,
          labelRu: 'НЕПОДХОДЯЩИЙ СТАТ',
          labelEn: 'WRONG MAIN STAT',
          recommendedRu: 'Крит. Урон (бафф союзников масштабируется от КУ)',
          recommendedEn: 'CRIT DMG (buff scales off character CD)'
        };

      case 'HARMONY_ATK':
        if (field === 'atk') {
          return { status: 'optimal', scoreBonus: 3, labelRu: 'ВЕРНЫЙ СТАТ (АТК%)', labelEn: 'OPTIMAL (ATK%)' };
        }
        if (field === 'hp' || field === 'def') {
          return { status: 'viable', scoreBonus: 0, labelRu: 'ДОПУСТИМЫЙ', labelEn: 'VIABLE', recommendedRu: 'Сила атаки%', recommendedEn: 'ATK%' };
        }
        return {
          status: 'wrong',
          scoreBonus: -18,
          labelRu: 'НЕПОДХОДЯЩИЙ СТАТ',
          labelEn: 'WRONG MAIN STAT',
          recommendedRu: 'Сила атаки%',
          recommendedEn: 'ATK%'
        };

      case 'HARMONY_BREAK':
        if (field === 'hp' || field === 'def') {
          return { status: 'optimal', scoreBonus: 3, labelRu: 'ВЕРНЫЙ СТАТ', labelEn: 'OPTIMAL' };
        }
        if (field === 'atk') {
          return { status: 'viable', scoreBonus: 0, labelRu: 'ДОПУСТИМЫЙ', labelEn: 'VIABLE' };
        }
        return {
          status: 'wrong',
          scoreBonus: -18,
          labelRu: 'НЕПОДХОДЯЩИЙ СТАТ',
          labelEn: 'WRONG MAIN STAT',
          recommendedRu: 'HP% или Защита%',
          recommendedEn: 'HP% or DEF%'
        };

      case 'PRESERVATION_DEF':
        if (field === 'def' || field === 'crit_dmg') {
          return { status: 'optimal', scoreBonus: 3, labelRu: 'ВЕРНЫЙ СТАТ', labelEn: 'OPTIMAL' };
        }
        if (field === 'crit_rate' || field === 'hp') {
          return { status: 'viable', scoreBonus: 0, labelRu: 'ДОПУСТИМЫЙ', labelEn: 'VIABLE' };
        }
        return {
          status: 'wrong',
          scoreBonus: -18,
          labelRu: 'НЕПОДХОДЯЩИЙ СТАТ',
          labelEn: 'WRONG MAIN STAT',
          recommendedRu: 'Защита% (или Крит. Урон для Авантюрина)',
          recommendedEn: 'DEF% (or CRIT DMG for Aventurine)'
        };

      case 'PRESERVATION_HP':
        if (field === 'hp' || field === 'def') {
          return { status: 'optimal', scoreBonus: 3, labelRu: 'ВЕРНЫЙ СТАТ', labelEn: 'OPTIMAL' };
        }
        return {
          status: 'wrong',
          scoreBonus: -18,
          labelRu: 'НЕПОДХОДЯЩИЙ СТАТ',
          labelEn: 'WRONG MAIN STAT',
          recommendedRu: 'HP% или Защита%',
          recommendedEn: 'HP% or DEF%'
        };

      case 'ABUNDANCE_HP':
      case 'ABUNDANCE_BREAK':
        if (field === 'heal_rate' || field === 'hp') {
          return { status: 'optimal', scoreBonus: 3, labelRu: 'ВЕРНЫЙ СТАТ (ИСЦЕЛЕНИЕ)', labelEn: 'OPTIMAL (HEAL)' };
        }
        if (field === 'def' || (archetype === 'ABUNDANCE_BREAK' && field === 'atk')) {
          return { status: 'viable', scoreBonus: 0, labelRu: 'ДОПУСТИМЫЙ', labelEn: 'VIABLE' };
        }
        return {
          status: 'wrong',
          scoreBonus: -18,
          labelRu: 'НЕПОДХОДЯЩИЙ СТАТ',
          labelEn: 'WRONG MAIN STAT',
          recommendedRu: 'Исходящее исцеление или HP%',
          recommendedEn: 'Outgoing Healing Boost or HP%'
        };

      case 'ABUNDANCE_ATK':
        if (field === 'heal_rate' || field === 'atk') {
          return { status: 'optimal', scoreBonus: 3, labelRu: 'ВЕРНЫЙ СТАТ', labelEn: 'OPTIMAL' };
        }
        if (field === 'hp') {
          return { status: 'viable', scoreBonus: 0, labelRu: 'ДОПУСТИМЫЙ', labelEn: 'VIABLE' };
        }
        return {
          status: 'wrong',
          scoreBonus: -18,
          labelRu: 'НЕПОДХОДЯЩИЙ СТАТ',
          labelEn: 'WRONG MAIN STAT',
          recommendedRu: 'Исходящее исцеление или Сила атаки%',
          recommendedEn: 'Outgoing Healing or ATK%'
        };

      case 'NIHILITY_DEBUFF':
        if (field === 'effect_hit' || field === 'crit_rate' || field === 'crit_dmg') {
          return { status: 'optimal', scoreBonus: 3, labelRu: 'ВЕРНЫЙ СТАТ (ШПЭ)', labelEn: 'OPTIMAL (EHR)' };
        }
        if (field === 'hp' || field === 'def' || field === 'atk') {
          return { status: 'viable', scoreBonus: 0, labelRu: 'ДОПУСТИМЫЙ', labelEn: 'VIABLE' };
        }
        return {
          status: 'wrong',
          scoreBonus: -18,
          labelRu: 'НЕПОДХОДЯЩИЙ СТАТ',
          labelEn: 'WRONG MAIN STAT',
          recommendedRu: 'Шанс попадания эффектов (ШПЭ)',
          recommendedEn: 'Effect Hit Rate'
        };

      default:
        return { status: 'optimal', scoreBonus: 0, labelRu: 'ВЕРНЫЙ СТАТ', labelEn: 'OPTIMAL' };
    }
  }

  // Slot 4: Feet (Сапоги)
  if (slotType === 4) {
    if (field === 'spd') {
      return { status: 'optimal', scoreBonus: 3, labelRu: 'ВЕРНЫЙ СТАТ (СКОР)', labelEn: 'OPTIMAL (SPD)' };
    }

    if (archetype === 'CRIT_DPS' || archetype === 'BREAK_DPS' || archetype === 'DOT_DPS') {
      if (field === 'atk') {
        return { status: 'optimal', scoreBonus: 2, labelRu: 'ВЕРНЫЙ СТАТ (АТК%)', labelEn: 'OPTIMAL (ATK%)' };
      }
      return {
        status: 'wrong',
        scoreBonus: -18,
        labelRu: 'НЕПОДХОДЯЩИЙ СТАТ',
        labelEn: 'WRONG MAIN STAT',
        recommendedRu: 'Скорость или Сила атаки%',
        recommendedEn: 'Speed or ATK%'
      };
    }

    if (archetype === 'HP_CRIT_DPS') {
      if (field === 'hp') {
        return { status: 'optimal', scoreBonus: 2, labelRu: 'ВЕРНЫЙ СТАТ (HP%)', labelEn: 'OPTIMAL (HP%)' };
      }
      return {
        status: 'wrong',
        scoreBonus: -18,
        labelRu: 'НЕПОДХОДЯЩИЙ СТАТ',
        labelEn: 'WRONG MAIN STAT',
        recommendedRu: 'Скорость или HP%',
        recommendedEn: 'Speed or HP%'
      };
    }

    if (archetype === 'HARMONY_ATK') {
      if (field === 'atk') {
        return { status: 'optimal', scoreBonus: 2, labelRu: 'ВЕРНЫЙ СТАТ (АТК%)', labelEn: 'OPTIMAL (ATK%)' };
      }
      return {
        status: 'wrong',
        scoreBonus: -18,
        labelRu: 'НЕПОДХОДЯЩИЙ СТАТ',
        labelEn: 'WRONG MAIN STAT',
        recommendedRu: 'Скорость или Сила атаки%',
        recommendedEn: 'Speed or ATK%'
      };
    }

    if (archetype === 'PRESERVATION_DEF') {
      if (field === 'def') {
        return { status: 'optimal', scoreBonus: 2, labelRu: 'ВЕРНЫЙ СТАТ (ЗАЩ%)', labelEn: 'OPTIMAL (DEF%)' };
      }
      return {
        status: 'wrong',
        scoreBonus: -18,
        labelRu: 'НЕПОДХОДЯЩИЙ СТАТ',
        labelEn: 'WRONG MAIN STAT',
        recommendedRu: 'Скорость или Защита%',
        recommendedEn: 'Speed or DEF%'
      };
    }

    if (archetype === 'PRESERVATION_HP' || archetype === 'ABUNDANCE_HP') {
      if (field === 'hp') {
        return { status: 'optimal', scoreBonus: 2, labelRu: 'ВЕРНЫЙ СТАТ (HP%)', labelEn: 'OPTIMAL (HP%)' };
      }
      return {
        status: 'wrong',
        scoreBonus: -18,
        labelRu: 'НЕПОДХОДЯЩИЙ СТАТ',
        labelEn: 'WRONG MAIN STAT',
        recommendedRu: 'Скорость или HP%',
        recommendedEn: 'Speed or HP%'
      };
    }

    if (field === 'hp' || field === 'def') {
      return { status: 'viable', scoreBonus: 0, labelRu: 'ДОПУСТИМЫЙ', labelEn: 'VIABLE', recommendedRu: 'Скорость', recommendedEn: 'Speed' };
    }
    return {
      status: 'wrong',
      scoreBonus: -18,
      labelRu: 'НЕПОДХОДЯЩИЙ СТАТ',
      labelEn: 'WRONG MAIN STAT',
      recommendedRu: 'Скорость',
      recommendedEn: 'Speed'
    };
  }

  // Slot 5: Planar Sphere (Планарная сфера)
  if (slotType === 5) {
    const isMatchingElement = charElemField && field === charElemField;
    const isOtherElement = field.endsWith('_dmg') && !isMatchingElement;

    if (isOtherElement) {
      return {
        status: 'wrong',
        scoreBonus: -20,
        labelRu: 'ЧУЖАЯ СТИХИЯ',
        labelEn: 'WRONG ELEMENT',
        recommendedRu: 'Бонус стихийного урона персонажа или АТК%',
        recommendedEn: 'Matching Element DMG or ATK%'
      };
    }

    if (archetype === 'CRIT_DPS' || archetype === 'BREAK_DPS' || archetype === 'DOT_DPS') {
      if (isMatchingElement) {
        return { status: 'optimal', scoreBonus: 3, labelRu: 'ВЕРНЫЙ СТАТ (СТИХИЯ)', labelEn: 'OPTIMAL (ELEM)' };
      }
      if (field === 'atk') {
        return { status: 'optimal', scoreBonus: 2, labelRu: 'ВЕРНЫЙ СТАТ (АТК%)', labelEn: 'OPTIMAL (ATK%)' };
      }
      return {
        status: 'wrong',
        scoreBonus: -18,
        labelRu: 'НЕПОДХОДЯЩИЙ СТАТ',
        labelEn: 'WRONG MAIN STAT',
        recommendedRu: 'Бонус урона стихии или Сила атаки%',
        recommendedEn: 'Elemental DMG Boost or ATK%'
      };
    }

    if (archetype === 'HP_CRIT_DPS') {
      if (isMatchingElement || field === 'hp') {
        return { status: 'optimal', scoreBonus: 3, labelRu: 'ВЕРНЫЙ СТАТ', labelEn: 'OPTIMAL' };
      }
      return {
        status: 'wrong',
        scoreBonus: -18,
        labelRu: 'НЕПОДХОДЯЩИЙ СТАТ',
        labelEn: 'WRONG MAIN STAT',
        recommendedRu: 'Бонус стихийного урона или HP%',
        recommendedEn: 'Elemental DMG or HP%'
      };
    }

    if (archetype === 'HARMONY_ATK') {
      if (isMatchingElement || field === 'atk') {
        return { status: 'optimal', scoreBonus: 3, labelRu: 'ВЕРНЫЙ СТАТ', labelEn: 'OPTIMAL' };
      }
      if (field === 'hp' || field === 'def') {
        return { status: 'viable', scoreBonus: 0, labelRu: 'ДОПУСТИМЫЙ', labelEn: 'VIABLE' };
      }
      return {
        status: 'wrong',
        scoreBonus: -18,
        labelRu: 'НЕПОДХОДЯЩИЙ СТАТ',
        labelEn: 'WRONG MAIN STAT',
        recommendedRu: 'Сила атаки% или HP%/ЗАЩ%',
        recommendedEn: 'ATK% or HP%/DEF%'
      };
    }

    if (archetype === 'PRESERVATION_DEF') {
      if (field === 'def' || isMatchingElement) {
        return { status: 'optimal', scoreBonus: 3, labelRu: 'ВЕРНЫЙ СТАТ (ЗАЩ%)', labelEn: 'OPTIMAL (DEF%)' };
      }
      if (field === 'hp') {
        return { status: 'viable', scoreBonus: 0, labelRu: 'ДОПУСТИМЫЙ', labelEn: 'VIABLE' };
      }
      return {
        status: 'wrong',
        scoreBonus: -18,
        labelRu: 'НЕПОДХОДЯЩИЙ СТАТ',
        labelEn: 'WRONG MAIN STAT',
        recommendedRu: 'Защита%',
        recommendedEn: 'DEF%'
      };
    }

    if (archetype === 'PRESERVATION_HP' || archetype === 'ABUNDANCE_HP') {
      if (field === 'hp') {
        return { status: 'optimal', scoreBonus: 3, labelRu: 'ВЕРНЫЙ СТАТ (HP%)', labelEn: 'OPTIMAL (HP%)' };
      }
      if (field === 'def') {
        return { status: 'viable', scoreBonus: 0, labelRu: 'ДОПУСТИМЫЙ', labelEn: 'VIABLE' };
      }
      return {
        status: 'wrong',
        scoreBonus: -18,
        labelRu: 'НЕПОДХОДЯЩИЙ СТАТ',
        labelEn: 'WRONG MAIN STAT',
        recommendedRu: 'HP%',
        recommendedEn: 'HP%'
      };
    }

    if (archetype === 'ABUNDANCE_ATK') {
      if (field === 'atk') {
        return { status: 'optimal', scoreBonus: 3, labelRu: 'ВЕРНЫЙ СТАТ (АТК%)', labelEn: 'OPTIMAL (ATK%)' };
      }
      if (field === 'hp') {
        return { status: 'viable', scoreBonus: 0, labelRu: 'ДОПУСТИМЫЙ', labelEn: 'VIABLE' };
      }
      return {
        status: 'wrong',
        scoreBonus: -18,
        labelRu: 'НЕПОДХОДЯЩИЙ СТАТ',
        labelEn: 'WRONG MAIN STAT',
        recommendedRu: 'Сила атаки%',
        recommendedEn: 'ATK%'
      };
    }

    if (field === 'hp' || field === 'def' || isMatchingElement) {
      return { status: 'optimal', scoreBonus: 2, labelRu: 'ВЕРНЫЙ СТАТ', labelEn: 'OPTIMAL' };
    }
    if (field === 'atk') {
      return { status: 'viable', scoreBonus: 0, labelRu: 'ДОПУСТИМЫЙ', labelEn: 'VIABLE' };
    }
    return {
      status: 'wrong',
      scoreBonus: -18,
      labelRu: 'НЕПОДХОДЯЩИЙ СТАТ',
      labelEn: 'WRONG MAIN STAT',
      recommendedRu: 'HP% или Защита%',
      recommendedEn: 'HP% or DEF%'
    };
  }

  // Slot 6: Link Rope (Соединительная вервь)
  if (slotType === 6) {
    if (archetype.startsWith('HARMONY') || archetype.startsWith('ABUNDANCE') || archetype === 'NIHILITY_DEBUFF') {
      if (field === 'sp_rate') {
        return { status: 'optimal', scoreBonus: 4, labelRu: 'ВЕРНЫЙ СТАТ (ВЭ)', labelEn: 'OPTIMAL (ERR)' };
      }
      if (archetype === 'HARMONY_BREAK' && field === 'break_dmg') {
        return { status: 'optimal', scoreBonus: 3, labelRu: 'ВЕРНЫЙ СТАТ (ЭП)', labelEn: 'OPTIMAL (BE)' };
      }
      if (archetype === 'ABUNDANCE_BREAK' && field === 'break_dmg') {
        return { status: 'optimal', scoreBonus: 3, labelRu: 'ВЕРНЫЙ СТАТ (ЭП)', labelEn: 'OPTIMAL (BE)' };
      }
      if (archetype === 'ABUNDANCE_ATK' && field === 'atk') {
        return { status: 'optimal', scoreBonus: 3, labelRu: 'ВЕРНЫЙ СТАТ (АТК%)', labelEn: 'OPTIMAL (ATK%)' };
      }
      if (archetype === 'ABUNDANCE_HP' && field === 'hp') {
        return { status: 'optimal', scoreBonus: 3, labelRu: 'ВЕРНЫЙ СТАТ (HP%)', labelEn: 'OPTIMAL (HP%)' };
      }
      if (field === 'hp' || field === 'def' || field === 'atk') {
        return {
          status: 'viable',
          scoreBonus: 0,
          labelRu: 'ДОПУСТИМЫЙ',
          labelEn: 'VIABLE',
          recommendedRu: 'Восстановление энергии (ВЭ)',
          recommendedEn: 'Energy Regeneration Rate (ERR)'
        };
      }
      return {
        status: 'wrong',
        scoreBonus: -18,
        labelRu: 'НЕПОДХОДЯЩИЙ СТАТ',
        labelEn: 'WRONG MAIN STAT',
        recommendedRu: 'Восстановление энергии (ВЭ)',
        recommendedEn: 'Energy Regeneration Rate (ERR)'
      };
    }

    if (archetype === 'PRESERVATION_DEF') {
      if (field === 'def' || field === 'sp_rate') {
        return { status: 'optimal', scoreBonus: 3, labelRu: 'ВЕРНЫЙ СТАТ', labelEn: 'OPTIMAL' };
      }
      if (field === 'hp') {
        return { status: 'viable', scoreBonus: 0, labelRu: 'ДОПУСТИМЫЙ', labelEn: 'VIABLE' };
      }
      return {
        status: 'wrong',
        scoreBonus: -18,
        labelRu: 'НЕПОДХОДЯЩИЙ СТАТ',
        labelEn: 'WRONG MAIN STAT',
        recommendedRu: 'Защита% или ВЭ',
        recommendedEn: 'DEF% or ERR'
      };
    }

    if (archetype === 'PRESERVATION_HP') {
      if (field === 'hp' || field === 'sp_rate') {
        return { status: 'optimal', scoreBonus: 3, labelRu: 'ВЕРНЫЙ СТАТ', labelEn: 'OPTIMAL' };
      }
      if (field === 'def') {
        return { status: 'viable', scoreBonus: 0, labelRu: 'ДОПУСТИМЫЙ', labelEn: 'VIABLE' };
      }
      return {
        status: 'wrong',
        scoreBonus: -18,
        labelRu: 'НЕПОДХОДЯЩИЙ СТАТ',
        labelEn: 'WRONG MAIN STAT',
        recommendedRu: 'HP% или ВЭ',
        recommendedEn: 'HP% or ERR'
      };
    }

    if (archetype === 'BREAK_DPS') {
      if (field === 'break_dmg') {
        return { status: 'optimal', scoreBonus: 4, labelRu: 'ВЕРНЫЙ СТАТ (ЭП)', labelEn: 'OPTIMAL (BE)' };
      }
      if (field === 'atk') {
        return { status: 'viable', scoreBonus: 1, labelRu: 'ДОПУСТИМЫЙ (АТК%)', labelEn: 'VIABLE (ATK%)', recommendedRu: 'Эффект пробития (ЭП)', recommendedEn: 'Break Effect (BE)' };
      }
      return {
        status: 'wrong',
        scoreBonus: -18,
        labelRu: 'НЕПОДХОДЯЩИЙ СТАТ',
        labelEn: 'WRONG MAIN STAT',
        recommendedRu: 'Эффект пробития (ЭП)',
        recommendedEn: 'Break Effect (BE)'
      };
    }

    if (archetype === 'HP_CRIT_DPS') {
      if (field === 'hp' || field === 'sp_rate') {
        return { status: 'optimal', scoreBonus: 3, labelRu: 'ВЕРНЫЙ СТАТ', labelEn: 'OPTIMAL' };
      }
      return {
        status: 'wrong',
        scoreBonus: -18,
        labelRu: 'НЕПОДХОДЯЩИЙ СТАТ',
        labelEn: 'WRONG MAIN STAT',
        recommendedRu: 'HP% или ВЭ',
        recommendedEn: 'HP% or ERR'
      };
    }

    if (archetype === 'DOT_DPS') {
      if (field === 'atk' || field === 'sp_rate') {
        return { status: 'optimal', scoreBonus: 3, labelRu: 'ВЕРНЫЙ СТАТ', labelEn: 'OPTIMAL' };
      }
      return {
        status: 'wrong',
        scoreBonus: -18,
        labelRu: 'НЕПОДХОДЯЩИЙ СТАТ',
        labelEn: 'WRONG MAIN STAT',
        recommendedRu: 'Сила атаки% или ВЭ',
        recommendedEn: 'ATK% or ERR'
      };
    }

    // Default: CRIT_DPS
    if (field === 'atk') {
      return { status: 'optimal', scoreBonus: 3, labelRu: 'ВЕРНЫЙ СТАТ (АТК%)', labelEn: 'OPTIMAL (ATK%)' };
    }
    if (field === 'sp_rate') {
      return { status: 'viable', scoreBonus: 1, labelRu: 'ДОПУСТИМЫЙ (ВЭ)', labelEn: 'VIABLE (ERR)' };
    }
    if (field === 'break_dmg') {
      return { status: 'viable', scoreBonus: 0, labelRu: 'ДОПУСТИМЫЙ (ЭП)', labelEn: 'VIABLE (BE)' };
    }
    return {
      status: 'wrong',
      scoreBonus: -18,
      labelRu: 'НЕПОДХОДЯЩИЙ СТАТ',
      labelEn: 'WRONG MAIN STAT',
      recommendedRu: 'Сила атаки%',
      recommendedEn: 'ATK%'
    };
  }

  return { status: 'optimal', scoreBonus: 0, labelRu: 'ВЕРНЫЙ СТАТ', labelEn: 'OPTIMAL' };
}

// Approximation of the standard normal error function erf(x)
function erf(x) {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);
  const t = 1.0 / (1.0 + p * absX);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
  return sign * y;
}

// Calculate Top % from Z-Score (1 - CDF)
function zScoreToTopPercent(z) {
  const cdf = 0.5 * (1.0 + erf(z / Math.SQRT2));
  const top = (1.0 - cdf) * 100;
  return Math.min(99.0, Math.max(0.2, top));
}

/**
 * Determine the exact character-specific key benchmark metrics
 * replacing the rigid crit mass (CV) with the most essential stat for the character
 * (e.g., Speed for Yao Guang & Silver Wolf, Crits for Acheron, Break Effect for Firefly, DEF for Aventurine, etc.)
 */
export function determineCharacterMetrics(char, archetype, stats) {
  const { hp, atk, def, spd, cr, cd, cv, be, ehr, eres, heal, err } = stats;
  const name = char?.name || '';
  const lowerName = name.toLowerCase();
  const charId = String(char?.id || '');

  // 1. Silver Wolf Lv 999 (Серебряный Волк ур. 999 / Silver Wolf LV.999) & Crit Sub-DPS Wolf - Speed is primary, Crits are secondary!
  const isWolf = charId === '1006' || lowerName.includes('волк') || lowerName.includes('silver');
  const isSW999 = isWolf && (lowerName.includes('999') || lowerName.includes('ур') || lowerName.includes('lv'));

  if (isSW999 || (isWolf && cv >= 140)) {
    const spdStatus = spd >= 160 ? '[160+ CAP ✓]' : (spd >= 145 ? '[145+ OK]' : (spd >= 134 ? '[134+ OK]' : '[SLOW]'));
    const cvStatus = cv >= 240 ? '[ELITE]' : (cv >= 200 ? '[TOP]' : (cv >= 160 ? '[OK]' : '[LOW]'));

    return {
      primary: {
        labelRu: 'СКОРОСТЬ (SPD)',
        labelEn: 'SPEED (SPD)',
        display: `${spd.toFixed(1)} SPD`,
        percent: Math.min(100, (spd / 160) * 100),
        status: spdStatus
      },
      secondary: {
        labelRu: 'КРИТ. МАССА (CV)',
        labelEn: 'CRIT VALUE (CV)',
        display: `${cv.toFixed(1)} CV`,
        percent: Math.min(100, Math.max(10, (cv / 260) * 100)),
        status: cvStatus
      }
    };
  }

  // Standard Debuffer Silver Wolf / Pela / Jiaoqiu (NIHILITY_DEBUFF) - Speed is primary, EHR is secondary
  if (archetype === 'NIHILITY_DEBUFF' || isWolf) {
    const isJiaoqiu = lowerName.includes('цзяоцю') || lowerName.includes('jiaoqiu');
    const targetEhr = isJiaoqiu ? 140 : (isWolf ? 96 : 67);
    const spdStatus = spd >= 160 ? '[160+ CAP ✓]' : (spd >= 145 ? '[145+ OK]' : (spd >= 134 ? '[134+ OK]' : '[SLOW]'));
    const ehrStatus = ehr >= targetEhr ? `[${targetEhr}% CAP ✓]` : `[${ehr.toFixed(0)}% / ${targetEhr}%]`;

    return {
      primary: {
        labelRu: 'СКОРОСТЬ (SPD)',
        labelEn: 'SPEED (SPD)',
        display: `${spd.toFixed(1)} SPD`,
        percent: Math.min(100, (spd / 160) * 100),
        status: spdStatus
      },
      secondary: {
        labelRu: 'ШАНС ПОПАДАНИЯ ЭФФЕКТОВ',
        labelEn: 'EFFECT HIT RATE (EHR)',
        display: `${ehr.toFixed(1)}% EHR`,
        percent: Math.min(100, (ehr / targetEhr) * 100),
        status: ehrStatus
      }
    };
  }

  // 2. Yao Guang / HARMONY_SPD - Speed is primary, Crits/ERR are secondary
  const isYaoGuang = lowerName.includes('яо') || lowerName.includes('yao') || lowerName.includes('гуан') || lowerName.includes('guang') || lowerName.includes('爻光');
  if (archetype === 'HARMONY_SPD' || isYaoGuang) {
    const spdStatus = spd >= 160 ? '[160+ CAP ✓]' : (spd >= 145 ? '[145+ OK]' : (spd >= 134 ? '[134+ OK]' : '[SLOW]'));
    const crStatus = cr >= 50 ? `[${cr.toFixed(1)}% CR ✓]` : `[${cr.toFixed(1)}% CR]`;

    return {
      primary: {
        labelRu: 'СКОРОСТЬ (SPD)',
        labelEn: 'SPEED (SPD)',
        display: `${spd.toFixed(1)} SPD`,
        percent: Math.min(100, (spd / 160) * 100),
        status: spdStatus
      },
      secondary: {
        labelRu: isYaoGuang ? 'КРИТ. ШАНС (ПАССИВКА 160+ СКОР)' : 'ВОССТАНОВЛЕНИЕ ЭНЕРГИИ',
        labelEn: isYaoGuang ? 'CRIT RATE (160+ SPD PASSIVE)' : 'ENERGY REGENERATION (ERR)',
        display: isYaoGuang ? `${cr.toFixed(1)}% CR` : (err > 0 ? `+${err.toFixed(1)}% ERR` : '100% (БАЗА)'),
        percent: isYaoGuang ? Math.min(100, (cr / 70) * 100) : Math.min(100, Math.max(20, (err / 24.4) * 100)),
        status: isYaoGuang ? crStatus : (err >= 19.4 ? '[ВЕРВЬ ВЭ ✓]' : '[НУЖНА ВЭ]')
      }
    };
  }

  // 3. Sparkle / Sunday / Bronya (HARMONY_CRIT) - Speed is primary, Crit DMG is secondary
  if (archetype === 'HARMONY_CRIT') {
    const spdStatus = spd >= 160 ? '[160+ HYPER]' : (spd >= 134 ? '[134+ TUNED]' : '[SLOW]');
    const cdStatus = cd >= 200 ? '[200%+ ELITE]' : (cd >= 160 ? '[160%+ OK]' : '[LOW]');

    return {
      primary: {
        labelRu: 'СКОРОСТЬ (SPD)',
        labelEn: 'SPEED (SPD)',
        display: `${spd.toFixed(1)} SPD`,
        percent: Math.min(100, (spd / 160) * 100),
        status: spdStatus
      },
      secondary: {
        labelRu: 'КРИТ. УРОН (СКАЛЕЙЛЕР)',
        labelEn: 'CRIT DMG (BUFF SCALE)',
        display: `${cd.toFixed(1)}% CD`,
        percent: Math.min(100, (cd / 220) * 100),
        status: cdStatus
      }
    };
  }

  // 4. Firefly / Boothill / Rappa (BREAK_DPS) - Break Effect is primary, Speed is secondary
  if (archetype === 'BREAK_DPS') {
    const beStatus = be >= 360 ? '[360%+ ELITE]' : (be >= 250 ? '[250%+ READY]' : '[LOW]');
    const spdStatus = spd >= 154 ? '[154+ OK]' : (spd >= 145 ? '[145+ OK]' : '[SLOW]');

    return {
      primary: {
        labelRu: 'ЭФФЕКТ ПРОБИТИЯ (BE)',
        labelEn: 'BREAK EFFECT (BE)',
        display: `${be.toFixed(1)}% BE`,
        percent: Math.min(100, (be / 360) * 100),
        status: beStatus
      },
      secondary: {
        labelRu: 'ПОРОГ СКОРОСТИ',
        labelEn: 'SPEED BREAKPOINT',
        display: `${spd.toFixed(1)} SPD`,
        percent: Math.min(100, (spd / 160) * 100),
        status: spdStatus
      }
    };
  }

  // 5. Ruan Mei (HARMONY_BREAK) - Break Effect (180% cap) is primary, Speed is secondary
  if (archetype === 'HARMONY_BREAK') {
    const beStatus = be >= 180 ? '[180% CAP ✓]' : `[-${Math.max(0, Math.round(180 - be))}% ДО КАПА]`;
    const spdStatus = spd >= 145 ? '[145+ TALIA]' : (spd >= 134 ? '[134+ OK]' : '[SLOW]');

    return {
      primary: {
        labelRu: 'ЭФФЕКТ ПРОБИТИЯ (BE)',
        labelEn: 'BREAK EFFECT (BE)',
        display: `${be.toFixed(1)}% BE`,
        percent: Math.min(100, (be / 180) * 100),
        status: beStatus
      },
      secondary: {
        labelRu: 'ПОРОГ СКОРОСТИ',
        labelEn: 'SPEED BREAKPOINT',
        display: `${spd.toFixed(1)} SPD`,
        percent: Math.min(100, (spd / 160) * 100),
        status: spdStatus
      }
    };
  }

  // 6. Robin / Tingyun (HARMONY_ATK)
  if (archetype === 'HARMONY_ATK') {
    const isTingyun = lowerName.includes('тинъюнь') || lowerName.includes('tingyun');
    if (isTingyun) {
      return {
        primary: {
          labelRu: 'СКОРОСТЬ (SPD)',
          labelEn: 'SPEED (SPD)',
          display: `${spd.toFixed(1)} SPD`,
          percent: Math.min(100, (spd / 160) * 100),
          status: spd >= 160 ? '[160+ CAP ✓]' : (spd >= 145 ? '[145+ OK]' : '[SLOW]')
        },
        secondary: {
          labelRu: 'СИЛА АТАКИ (ATK)',
          labelEn: 'ATTACK (ATK CAP)',
          display: `${Math.round(atk)} ATK`,
          percent: Math.min(100, (atk / 2600) * 100),
          status: atk >= 2600 ? '[2600 CAP ✓]' : `[-${Math.max(0, Math.round(2600 - atk))} ДО КАПА]`
        }
      };
    }
    // Robin does not need speed (remains at ~120 SPD for Vonwacq). Primary is ATK, Secondary is ERR!
    return {
      primary: {
        labelRu: 'СИЛА АТАКИ (ATK)',
        labelEn: 'ATTACK POWER (ATK)',
        display: `${Math.round(atk)} ATK`,
        percent: Math.min(100, (atk / 4200) * 100),
        status: atk >= 4000 ? '[4000+ CAP ✓]' : (atk >= 3500 ? '[3500+ OK]' : '[LOW]')
      },
      secondary: {
        labelRu: 'ВОССТАНОВЛЕНИЕ ЭНЕРГИИ',
        labelEn: 'ENERGY REGENERATION (ERR)',
        display: err > 0 ? `+${err.toFixed(1)}% ERR` : '100% (БАЗА)',
        percent: Math.min(100, Math.max(20, (err / 24.4) * 100)),
        status: err >= 19.4 ? '[ВЕРВЬ ВЭ ✓]' : '[НУЖНА ВЭ]'
      }
    };
  }

  // 7. Black Swan / Kafka (DOT_DPS)
  if (archetype === 'DOT_DPS') {
    const isBlackSwan = lowerName.includes('лебедь') || lowerName.includes('black swan');
    if (isBlackSwan) {
      return {
        primary: {
          labelRu: 'ШАНС ПОПАДАНИЯ ЭФФЕКТОВ',
          labelEn: 'EFFECT HIT RATE (EHR)',
          display: `${ehr.toFixed(1)}% EHR`,
          percent: Math.min(100, (ehr / 120) * 100),
          status: ehr >= 120 ? '[120% CAP ✓]' : `[-${Math.max(0, (120 - ehr)).toFixed(1)}% ДО КАПА]`
        },
        secondary: {
          labelRu: 'ПОРОГ СКОРОСТИ',
          labelEn: 'SPEED BREAKPOINT',
          display: `${spd.toFixed(1)} SPD`,
          percent: Math.min(100, (spd / 160) * 100),
          status: spd >= 134 ? '[134+ OK]' : '[SLOW]'
        }
      };
    }
    // Kafka / DoT
    return {
      primary: {
        labelRu: 'СИЛА АТАКИ (ATK)',
        labelEn: 'ATTACK POWER (ATK)',
        display: `${Math.round(atk)} ATK`,
        percent: Math.min(100, (atk / 4000) * 100),
        status: atk >= 3800 ? '[3800+ TOP]' : (atk >= 3400 ? '[3400+ OK]' : '[LOW]')
      },
      secondary: {
        labelRu: 'ПОРОГ СКОРОСТИ',
        labelEn: 'SPEED BREAKPOINT',
        display: `${spd.toFixed(1)} SPD`,
        percent: Math.min(100, (spd / 160) * 100),
        status: spd >= 146 ? '[146+ OK]' : (spd >= 134 ? '[134+ OK]' : '[SLOW]')
      }
    };
  }

  // 8. Aventurine / Gepard (PRESERVATION_DEF) - DEF (4000 cap) is primary
  if (archetype === 'PRESERVATION_DEF') {
    return {
      primary: {
        labelRu: 'ЗАЩИТА (DEF)',
        labelEn: 'DEFENCE (DEF)',
        display: `${Math.round(def)} DEF`,
        percent: Math.min(100, (def / 4000) * 100),
        status: def >= 4000 ? '[4000 CAP ✓]' : `[-${Math.max(0, 4000 - Math.round(def))} ДО КАПА]`
      },
      secondary: {
        labelRu: 'ПОРОГ СКОРОСТИ',
        labelEn: 'SPEED BREAKPOINT',
        display: `${spd.toFixed(1)} SPD`,
        percent: Math.min(100, (spd / 160) * 100),
        status: spd >= 134 ? '[134+ OK]' : '[SLOW]'
      }
    };
  }

  // 9. Fu Xuan (PRESERVATION_HP) - HP is primary
  if (archetype === 'PRESERVATION_HP') {
    return {
      primary: {
        labelRu: 'МАКС. HP',
        labelEn: 'MAX HP',
        display: `${Math.round(hp)} HP`,
        percent: Math.min(100, (hp / 8500) * 100),
        status: hp >= 7500 ? '[7500+ OK]' : '[LOW]'
      },
      secondary: {
        labelRu: 'ПОРОГ СКОРОСТИ',
        labelEn: 'SPEED BREAKPOINT',
        display: `${spd.toFixed(1)} SPD`,
        percent: Math.min(100, (spd / 160) * 100),
        status: spd >= 134 ? '[134+ OK]' : '[SLOW]'
      }
    };
  }

  // 10. Gallagher / Lingsha (ABUNDANCE_BREAK) - BE is primary
  if (archetype === 'ABUNDANCE_BREAK') {
    return {
      primary: {
        labelRu: 'ЭФФЕКТ ПРОБИТИЯ (BE)',
        labelEn: 'BREAK EFFECT (BE)',
        display: `${be.toFixed(1)}% BE`,
        percent: Math.min(100, (be / 150) * 100),
        status: be >= 150 ? '[150% CAP ✓]' : `[-${Math.max(0, Math.round(150 - be))}% ДО КАПА]`
      },
      secondary: {
        labelRu: 'ПОРОГ СКОРОСТИ',
        labelEn: 'SPEED BREAKPOINT',
        display: `${spd.toFixed(1)} SPD`,
        percent: Math.min(100, (spd / 160) * 100),
        status: spd >= 145 ? '[145+ OK]' : (spd >= 134 ? '[134+ OK]' : '[SLOW]')
      }
    };
  }

  // 11. Luocha (ABUNDANCE_ATK) - ATK is primary
  if (archetype === 'ABUNDANCE_ATK') {
    return {
      primary: {
        labelRu: 'СИЛА АТАКИ (ATK)',
        labelEn: 'ATTACK POWER (ATK)',
        display: `${Math.round(atk)} ATK`,
        percent: Math.min(100, (atk / 3000) * 100),
        status: atk >= 2800 ? '[2800+ OK]' : '[LOW]'
      },
      secondary: {
        labelRu: 'ПОРОГ СКОРОСТИ',
        labelEn: 'SPEED BREAKPOINT',
        display: `${spd.toFixed(1)} SPD`,
        percent: Math.min(100, (spd / 160) * 100),
        status: spd >= 134 ? '[134+ OK]' : '[SLOW]'
      }
    };
  }

  // 12. Huohuo / Bailu / Lynx (ABUNDANCE_HP) - HP is primary
  if (archetype === 'ABUNDANCE_HP') {
    return {
      primary: {
        labelRu: 'МАКС. HP',
        labelEn: 'MAX HP',
        display: `${Math.round(hp)} HP`,
        percent: Math.min(100, (hp / 7500) * 100),
        status: hp >= 6500 ? '[6500+ OK]' : '[LOW]'
      },
      secondary: {
        labelRu: 'ПОРОГ СКОРОСТИ',
        labelEn: 'SPEED BREAKPOINT',
        display: `${spd.toFixed(1)} SPD`,
        percent: Math.min(100, (spd / 160) * 100),
        status: spd >= 134 ? '[134+ OK]' : '[SLOW]'
      }
    };
  }

  // 13. Blade / Castorice (HP_CRIT_DPS) - Crits & HP scaling
  if (archetype === 'HP_CRIT_DPS') {
    const isCastorice = lowerName.includes('castorice') || lowerName.includes('касторице') || charId === '1407';
    const hpTarget = isCastorice ? 9500 : 7500;
    const hpMinOk = isCastorice ? 8500 : 7000;

    return {
      primary: {
        labelRu: 'КРИТ. МАССА (CV)',
        labelEn: 'CRIT VALUE (CV)',
        display: `${cv.toFixed(1)} CV`,
        percent: Math.min(100, Math.max(10, (cv / 260) * 100)),
        status: cv >= 230 ? '[ELITE]' : (cv >= 180 ? '[TOP]' : '[LOW]')
      },
      secondary: {
        labelRu: 'МАКС. HP (СКАЛЕЙЛЕР)',
        labelEn: 'MAX HP (SCALING)',
        display: `${Math.round(hp)} HP`,
        percent: Math.min(100, (hp / hpTarget) * 100),
        status: hp >= hpMinOk ? '[OK]' : '[LOW]'
      }
    };
  }

  // 14. CRIT_DPS: Distinguish characters who do NOT need speed (Acheron, Himeko, Himeko Nova, Clara, Yunli, or ATK boots hypercarries)
  // For them, the two critical stats are strictly CRITS and ATK! Speed is not needed.
  const isNoSpeedDps =
    lowerName.includes('ахерон') || lowerName.includes('acheron') || charId === '1308' ||
    lowerName.includes('химеко') || lowerName.includes('himeko') || lowerName.includes('нова') || lowerName.includes('nova') ||
    lowerName.includes('клара') || lowerName.includes('clara') ||
    lowerName.includes('юньли') || lowerName.includes('yunli') ||
    spd < 115; // Any DPS running ATK boots with uninvested base speed (< 115)

  if (isNoSpeedDps) {
    const isAcheron = lowerName.includes('ахерон') || lowerName.includes('acheron') || charId === '1308';
    const isHimeko = lowerName.includes('химеко') || lowerName.includes('himeko') || lowerName.includes('нова') || lowerName.includes('nova');
    const atkTarget = isAcheron ? 3800 : (isHimeko ? 3200 : 3400);
    const atkStatus = atk >= atkTarget ? `[${atkTarget}+ TOP ✓]` : (atk >= (atkTarget - 400) ? '[OK]' : '[LOW]');
    const cvStatus = cv >= 240 ? '[ELITE]' : (cv >= 200 ? '[TOP]' : (cv >= 160 ? '[OK]' : '[LOW]'));

    return {
      primary: {
        labelRu: 'КРИТ. МАССА (CV)',
        labelEn: 'CRIT VALUE (CV)',
        display: `${cv.toFixed(1)} CV`,
        percent: Math.min(100, Math.max(10, (cv / 260) * 100)),
        status: cvStatus
      },
      secondary: {
        labelRu: 'СИЛА АТАКИ (ATK)',
        labelEn: 'ATTACK POWER (ATK)',
        display: `${Math.round(atk)} ATK`,
        percent: Math.min(100, (atk / atkTarget) * 100),
        status: atkStatus
      }
    };
  }

  // Speed-scaling Crit DPS who explicitly build and need 134+ SPD (Feixiao, Seele, etc.)
  return {
    primary: {
      labelRu: 'КРИТ. МАССА (CV)',
      labelEn: 'CRIT VALUE (CV)',
      display: `${cv.toFixed(1)} CV`,
      percent: Math.min(100, Math.max(10, (cv / 260) * 100)),
      status: cv >= 240 ? '[ELITE]' : (cv >= 200 ? '[TOP]' : (cv >= 160 ? '[OK]' : '[LOW]'))
    },
    secondary: {
      labelRu: 'ПОРОГ СКОРОСТИ',
      labelEn: 'SPEED BREAKPOINT',
      display: `${spd.toFixed(1)} SPD`,
      percent: Math.min(100, (spd / 160) * 100),
      status: spd >= 134 ? '[134+ OK]' : '[SLOW]'
    }
  };
}

/**
 * Mathematically rigorous character audit & percentile ranking.
 * Differentiates 12 kit archetypes:
 * - Crit DPS / Hypercarry
 * - Break DPS / Super Break
 * - DoT DPS
 * - HP-scaling DPS (Blade)
 * - Preservation DEF (Aventurine, Gepard)
 * - Preservation HP (Fu Xuan)
 * - Abundance ATK (Luocha)
 * - Abundance HP (Huohuo, Bailu, Natasha, Lynx)
 * - Abundance Break (Gallagher, Lingsha)
 * - Harmony Crit (Sunday, Sparkle, Bronya)
 * - Harmony ATK (Robin, Tingyun)
 * - Harmony Break (Ruan Mei)
 * - Nihility Debuffers (Pela, Silver Wolf, Jiaoqiu)
 */
export function calculateCharacterAudit(char, lang = 'ru') {
  if (!char) return null;

  const isRu = lang === 'ru';
  const name = char.name || '';
  const path = char.path?.id || '';

  const baseMap = {};
  (char.attributes || []).forEach(a => { baseMap[a.field] = a; });
  const addMap = {};
  (char.additions || []).forEach(a => { addMap[a.field] = a; });

  const getStat = (field) => (baseMap[field]?.value || 0) + (addMap[field]?.value || 0);
  const hp = Math.round(getStat('hp'));
  const atk = Math.round(getStat('atk'));
  const def = Math.round(getStat('def'));
  const spd = parseFloat(getStat('spd').toFixed(1));
  const cr = parseFloat((getStat('crit_rate') * 100).toFixed(1));
  const cd = parseFloat((getStat('crit_dmg') * 100).toFixed(1));
  const cv = parseFloat((cr * 2 + cd).toFixed(1));
  const be = parseFloat(((addMap['break_dmg']?.value || 0) * 100).toFixed(1));
  const ehr = parseFloat(((addMap['effect_hit']?.value || 0) * 100).toFixed(1));
  const eres = parseFloat(((addMap['effect_res']?.value || 0) * 100).toFixed(1));
  const heal = parseFloat(((addMap['heal_rate']?.value || 0) * 100).toFixed(1));
  const err = parseFloat((((addMap['sp_rate']?.value || 0)) * 100).toFixed(1));

  // 1. Determine Archetype
  let archetype = 'CRIT_DPS';
  const charId = String(char.id || '');
  const lowerName = name.toLowerCase();

  // EXPLICIT CHARACTER OVERRIDES FIRST (Guarantees Blade, Castorice, Wolf 999, Yao Guang, Silver Wolf, Acheron, etc. are never misidentified)
  const isWolfChar = charId === '1006' || lowerName.includes('волк') || lowerName.includes('silver');
  const isWolf999 = isWolfChar && (lowerName.includes('999') || lowerName.includes('ур') || lowerName.includes('lv'));
  const isYaoGuang = lowerName.includes('яо') || lowerName.includes('yao') || lowerName.includes('гуан') || lowerName.includes('guang') || lowerName.includes('爻光');

  if (charId === '1205' || lowerName.includes('блэйд') || lowerName.includes('blade') || charId === '1407' || lowerName.includes('касторице') || lowerName.includes('castorice')) {
    archetype = 'HP_CRIT_DPS';
  } else if (isWolf999 || (isWolfChar && cv >= 150)) {
    archetype = 'CRIT_DPS';
  } else if (isYaoGuang) {
    archetype = 'HARMONY_SPD';
  } else if (isWolfChar) {
    archetype = 'NIHILITY_DEBUFF';
  } else if (charId === '1308' || lowerName.includes('ахерон') || lowerName.includes('acheron')) {
    archetype = 'CRIT_DPS';
  } else if (charId === '1304' || lowerName.includes('авантюрин') || lowerName.includes('aventurine') || (path === 'Knight' && def > 2500)) {
    archetype = 'PRESERVATION_DEF';
  } else if (charId === '1208' || lowerName.includes('фу сюань') || lowerName.includes('fu xuan')) {
    archetype = 'PRESERVATION_HP';
  } else if (charId === '1203' || lowerName.includes('лоча') || lowerName.includes('luocha')) {
    archetype = 'ABUNDANCE_ATK';
  } else if (charId === '1313' || lowerName.includes('воскресенье') || lowerName.includes('sunday') || lowerName.includes('искорка') || lowerName.includes('sparkle') || lowerName.includes('броня') || lowerName.includes('bronya')) {
    archetype = 'HARMONY_CRIT';
  } else if (charId === '1309' || lowerName.includes('зарянка') || lowerName.includes('robin') || lowerName.includes('тинъюнь') || lowerName.includes('tingyun')) {
    archetype = 'HARMONY_ATK';
  } else if (charId === '1307' || lowerName.includes('жуань') || lowerName.includes('ruan mei')) {
    archetype = 'HARMONY_BREAK';
  } else if (charId === '1310' || lowerName.includes('светлячок') || lowerName.includes('firefly') || lowerName.includes('бутхилл') || lowerName.includes('boothill') || lowerName.includes('раппа') || lowerName.includes('rappa') || be > 180) {
    archetype = 'BREAK_DPS';
  } else if (charId === '1005' || lowerName.includes('кафка') || lowerName.includes('kafka') || lowerName.includes('лебедь') || lowerName.includes('black swan') || lowerName.includes('сампо') || lowerName.includes('sampo') || lowerName.includes('гуйнайфэнь') || lowerName.includes('guinaifen') || (path === 'Warlock' && cr < 40 && ehr > 40 && !lowerName.includes('blade') && charId !== '1205')) {
    archetype = 'DOT_DPS';
  } else if (path === 'Warlock' && (lowerName.includes('пела') || lowerName.includes('pela') || lowerName.includes('волк') || lowerName.includes('silver') || lowerName.includes('цзяоцю') || lowerName.includes('jiaoqiu'))) {
    archetype = 'NIHILITY_DEBUFF';
  } else if (path === 'Priest' || heal > 0) {
    if (lowerName.includes('галлахер') || lowerName.includes('gallagher') || lowerName.includes('линша') || lowerName.includes('lingsha') || be > 100) {
      archetype = 'ABUNDANCE_BREAK';
    } else {
      archetype = 'ABUNDANCE_HP';
    }
  }

  // 2. Calculate Weighted Roll Efficiency for each relic
  let totalRollsCount = 0;
  let usefulRollsSum = 0;
  let relicScores = [];

  (char.relics || []).forEach((rel, idx) => {
    let pScore = 0;
    let pTotal = 0;
    (rel.sub_affix || []).forEach(sub => {
      const cnt = sub.count || 1;
      pTotal += cnt;
      totalRollsCount += cnt;
      const f = sub.field || '';

      let weight = 0;
      switch (archetype) {
        case 'PRESERVATION_DEF':
          if (f === 'def') weight = 1.0;
          else if (f === 'crit_dmg' || f === 'crit_rate' || f === 'spd') weight = 0.9;
          else if (f === 'effect_res') weight = 0.7;
          else if (f === 'hp') weight = 0.3;
          break;
        case 'PRESERVATION_HP':
          if (f === 'hp') weight = 1.0;
          else if (f === 'def' || f === 'spd') weight = 0.9;
          else if (f === 'effect_res') weight = 0.8;
          break;
        case 'ABUNDANCE_ATK':
          if (f === 'atk' || f === 'spd') weight = 1.0;
          else if (f === 'effect_res') weight = 0.8;
          else if (f === 'hp' || f === 'def') weight = 0.5;
          break;
        case 'ABUNDANCE_HP':
          if (f === 'hp' || f === 'spd') weight = 1.0;
          else if (f === 'effect_res') weight = 0.8;
          else if (f === 'def') weight = 0.6;
          break;
        case 'ABUNDANCE_BREAK':
          if (f === 'break_dmg' || f === 'spd') weight = 1.0;
          else if (f === 'effect_res' || f === 'atk') weight = 0.7;
          else if (f === 'hp' || f === 'def') weight = 0.5;
          break;
        case 'HARMONY_CRIT':
          if (f === 'crit_dmg' || f === 'spd') weight = 1.0;
          else if (f === 'effect_res') weight = 0.7;
          else if (f === 'hp' || f === 'def') weight = 0.5;
          break;
        case 'HARMONY_SPD':
          if (f === 'spd') weight = 1.0;
          else if (f === 'effect_res') weight = 0.85;
          else if (f === 'hp' || f === 'def') weight = 0.7;
          break;
        case 'HARMONY_ATK':
          if (f === 'atk' || f === 'spd') weight = 1.0;
          else if (f === 'hp' || f === 'def' || f === 'effect_res') weight = 0.6;
          break;
        case 'HARMONY_BREAK':
          if (f === 'break_dmg' || f === 'spd') weight = 1.0;
          else if (f === 'hp' || f === 'def' || f === 'effect_res') weight = 0.6;
          break;
        case 'BREAK_DPS':
          if (f === 'break_dmg' || f === 'spd') weight = 1.0;
          else if (f === 'atk') weight = 0.85;
          break;
        case 'DOT_DPS':
          if (f === 'atk' || f === 'spd') weight = 1.0;
          else if (f === 'effect_hit') weight = 0.9;
          else if (f === 'break_dmg') weight = 0.6;
          break;
        case 'HP_CRIT_DPS':
          if (f === 'crit_rate' || f === 'crit_dmg') weight = 1.0;
          else if (f === 'hp') weight = 0.95;
          else if (f === 'spd') weight = 0.8;
          break;
        case 'NIHILITY_DEBUFF':
          if (f === 'effect_hit' || f === 'spd') weight = 1.0;
          else if (f === 'effect_res' || f === 'hp' || f === 'def') weight = 0.6;
          break;
        default: // CRIT_DPS
          if (f === 'crit_rate' || f === 'crit_dmg') weight = 1.0;
          else if (f === 'atk' || f === 'spd') weight = 0.85;
          else if (f === 'break_dmg') weight = 0.3;
          break;
      }
      pScore += cnt * weight;
      usefulRollsSum += cnt * weight;
    });

    // Archetype-aware Main Stat Evaluation
    const mainEval = evaluateRelicMainStat(rel, archetype, char);
    rel.main_eval = mainEval;
    pScore += mainEval.scoreBonus;

    relicScores.push({ idx, pScore, pTotal, mainEval });
  });

  // Find exact weakest relic (lowest useful rolls + main stat penalty)
  let weakestRelicIndex = 0;
  let minScore = 999;
  relicScores.forEach(r => {
    if (r.pScore < minScore) {
      minScore = r.pScore;
      weakestRelicIndex = r.idx;
    }
  });

  const rollEfficiency = totalRollsCount > 0 ? (usefulRollsSum / totalRollsCount) * 100 : 75;

  // 3. Archetype Combat Benchmark Scoring
  let statPoints = 0;
  let bottleneck = '';
  let actions = [];

  switch (archetype) {
    case 'PRESERVATION_DEF': {
      const defRatio = Math.min(1.0, def / 4000);
      const spdBonus = spd >= 134 ? 12 : (spd / 134) * 8;
      const cvBonus = Math.min(15, (cv / 180) * 15);
      statPoints = (defRatio * 73) + spdBonus + cvBonus;
      if (def >= 4000) {
        bottleneck = isRu
          ? `Защита (${def}) закрывает максимальный порог таланта (+48% КШ). Билд полностью оптимизирован.`
          : `DEF (${def}) reaches the 4000 talent cap (+48% CRIT Rate). Build is highly optimized.`;
        actions.push({
          title: isRu ? 'Сборка завершена (End-Game Tier)' : 'Build Complete (End-Game Tier)',
          desc: isRu ? 'Избыточную защиту можно безопасно перевести в Крит. Урон и Скорость.' : 'Excess DEF rolls can be shifted to CRIT DMG and SPD.'
        });
      } else {
        bottleneck = isRu
          ? `Защита (${def}) ниже капа 4000. Талант недополучает ${Math.round((4000 - def) * 0.024)}% бесплатного Крит. Шанса.`
          : `DEF (${def}) is below the 4000 cap, losing ${Math.round((4000 - def) * 0.024)}% free CRIT Rate.`;
        actions.push({
          title: isRu ? 'Приоритет: 4000 Защиты' : 'Priority: Reach 4,000 DEF',
          desc: isRu ? `Доберите ${4000 - def} защиты через соединительную вервь или сабстаты.` : `Gain ${4000 - def} more DEF on link rope or substats.`
        });
      }
      break;
    }
    case 'HARMONY_CRIT': {
      const cdRatio = Math.min(1.0, cd / 200);
      const spdRatio = spd >= 160 ? 30 : (spd >= 134 ? 24 : (spd / 134) * 18);
      const errBonus = err >= 19 ? 15 : 5;
      const resBonus = Math.min(10, (eres / 30) * 10);
      statPoints = (cdRatio * 45) + spdRatio + errBonus + resBonus;
      if (spd < 134) {
        bottleneck = isRu
          ? `Скорость (${spd}) ниже брейкпоинта 134.0 SPD (не хватает ${(134 - spd).toFixed(1)}). Теряется ход в первом цикле.`
          : `Speed (${spd}) is below 134.0 SPD by ${(134 - spd).toFixed(1)}, losing an action in Cycle 0.`;
        actions.push({
          title: isRu ? 'Приоритет: 134.0 Скорости' : 'Priority: Reach 134.0 SPD',
          desc: isRu ? 'Добрав 1-2 сабстата скорости, вы получите дополнительное продвижение союзника в первом цикле.' : 'Gain 1-2 speed substats for an immediate Cycle 0 action advance.'
        });
      } else if (cd < 180) {
        bottleneck = isRu
          ? `Крит. урон (${cd}%) можно увеличить до 200%+, чтобы усилить передаваемый бафф союзнику.`
          : `CRIT DMG (${cd}%) can be pushed to 200%+ to maximize the active buff transfer.`;
        actions.push({
          title: isRu ? 'Приоритет: Крит. Урон' : 'Priority: Scale CRIT DMG',
          desc: isRu ? 'Каждые 10% КУ прямо увеличивают урон вашего гиперкерри.' : 'Every 10% CD directly boosts your main carry damage.'
        });
      } else {
        bottleneck = isRu
          ? `Сбалансированная сборка Гармонии (${cd}% КУ, ${spd} СКОР, ${err}% ВЭ).`
          : `High tier Harmony build (${cd}% CD, ${spd} SPD, ${err}% ERR).`;
        actions.push({
          title: isRu ? 'Оптимизация: Замена худшего артефакта' : 'Optimization: Replace Worst Relic',
          desc: isRu ? `Замените слот ${weakestRelicIndex + 1} на реликвию с большим количеством полезных роллов.` : `Replace slot ${weakestRelicIndex + 1} with higher roll value.`
        });
      }
      break;
    }
    case 'HARMONY_SPD': {
      const spdRatio = spd >= 160 ? 55 : (spd >= 145 ? 45 : (spd / 145) * 35);
      const errBonus = err >= 19.4 ? 25 : (err > 0 ? 15 : 5);
      const survBonus = Math.min(20, (hp / 4500) * 10 + (def / 1200) * 10);
      statPoints = spdRatio + errBonus + survBonus;
      if (spd < 145) {
        bottleneck = isRu
          ? `Скорость (${spd}) ниже ключевого брейкпоинта 145-160 SPD. Саппорту необходима максимальная скорость для ротации.`
          : `Speed (${spd}) is below the key 145-160 SPD breakpoint. High SPD is essential for turn advance.`;
        actions.push({
          title: isRu ? 'Приоритет: 160.0 Скорости' : 'Priority: Push to 160.0 SPD',
          desc: isRu ? 'Установите сапоги на Скорость и доберите сабстаты скорости.' : 'Equip SPD boots and prioritize speed substats.'
        });
      } else if (err < 19.4) {
        bottleneck = isRu
          ? `Отсутствует вервь на Восстановление энергии (+19.4% ВЭ). Ультимейт заряжается медленнее.`
          : `Missing Energy Regeneration Rate rope (+19.4% ERR). Ultimate uptime is delayed.`;
        actions.push({
          title: isRu ? 'Приоритет: Вервь ВЭ' : 'Priority: ERR Link Rope',
          desc: isRu ? 'Используйте вервь со статом Восстановление энергии.' : 'Equip an Energy Regeneration Rate main stat rope.'
        });
      } else {
        bottleneck = isRu
          ? `Отличная скоростная сборка саппорта (${spd} СКОР, +${err}% ВЭ). Закрывает все ротации.`
          : `High-speed support build (${spd} SPD, +${err}% ERR). Full rotation capability.`;
        actions.push({
          title: isRu ? 'Сборка готова к эндгейму' : 'Endgame Ready',
          desc: isRu ? 'Скорость и ротации полностью оптимизированы.' : 'Speed and rotations are fully optimized.'
        });
      }
      break;
    }
    case 'ABUNDANCE_ATK': {
      const atkRatio = Math.min(1.0, atk / 3000);
      const spdRatio = spd >= 134 ? 25 : (spd / 134) * 20;
      const healBonus = heal >= 30 ? 20 : 10;
      const resBonus = Math.min(15, (eres / 50) * 15);
      statPoints = (atkRatio * 40) + spdRatio + healBonus + resBonus;
      if (spd < 134) {
        bottleneck = isRu
          ? `Скорость (${spd}) ниже 134 SPD. Замедляет ротацию авто-хила и авто-снятие дебаффов.`
          : `Speed (${spd}) is below 134 SPD, slowing automatic healing triggers and cleanse.`;
        actions.push({
          title: isRu ? 'Приоритет: 134.0 Скорости' : 'Priority: Reach 134.0 SPD',
          desc: isRu ? 'Скоростные сапоги позволят быстрее активировать поле исцеления.' : 'Speed boots ensure faster field refresh.'
        });
      } else if (atk < 2600) {
        bottleneck = isRu
          ? `Сила атаки (${atk}) ниже оптимальных 2800+. Исходящее лечение снижено.`
          : `ATK (${atk}) is below optimal 2800+ benchmark. Passive healing output is reduced.`;
        actions.push({
          title: isRu ? 'Приоритет: Сила Атаки%' : 'Priority: ATK% Scaling',
          desc: isRu ? 'Доберите АТК% на соединительной верви или планарной сфере.' : 'Gain ATK% on rope or planar sphere.'
        });
      } else {
        bottleneck = isRu
          ? `Отличная сборка (${atk} АТК, ${heal}% исцеления, ${spd} СКОР). Закрывает весь хай-энд контент.`
          : `Solid ATK-scaling healer build (${atk} ATK, ${heal}% heal, ${spd} SPD).`;
        actions.push({
          title: isRu ? 'Сборка завершена' : 'Build Complete',
          desc: isRu ? 'Ротация и исцеление полностью соответствуют эндовым активностям.' : 'Fully endgame ready.'
        });
      }
      break;
    }
    case 'BREAK_DPS': {
      const beRatio = Math.min(1.0, be / 360);
      const spdRatio = spd >= 150 ? 35 : (spd / 150) * 28;
      const atkBonus = Math.min(15, (atk / 2500) * 15);
      statPoints = (beRatio * 50) + spdRatio + atkBonus;
      if (be < 300) {
        bottleneck = isRu
          ? `Эффект пробития (${be}%) отстает от нормы 360% для Супер-пробития.`
          : `Break Effect (${be}%) is below the 360% super break threshold.`;
        actions.push({
          title: isRu ? 'Приоритет: Эффект Пробития' : 'Priority: Break Effect',
          desc: isRu ? 'Криты не нужны: замените куски с роллами в КУ/КШ на чистое Пробитие и Скорость.' : 'Crits are useless: swap to pure Break Effect and SPD.'
        });
      } else {
        bottleneck = isRu
          ? `Эффект пробития (${be}%) и Скорость (${spd}) закрывают тайминги ультимейта.`
          : `Break Effect (${be}%) and SPD (${spd}) satisfy all Cycle 0 breakpoints.`;
        actions.push({
          title: isRu ? 'Сборка завершена' : 'Build Complete',
          desc: isRu ? 'Топовый ранг супер-пробития.' : 'Top tier break build.'
        });
      }
      break;
    }
    default: { // CRIT_DPS, HP_CRIT_DPS & general
      const isSlowDps =
        lowerName.includes('ахерон') || lowerName.includes('acheron') || charId === '1308' ||
        lowerName.includes('химеко') || lowerName.includes('himeko') || lowerName.includes('нова') || lowerName.includes('nova') ||
        lowerName.includes('клара') || lowerName.includes('clara') ||
        lowerName.includes('юньли') || lowerName.includes('yunli') ||
        archetype === 'HP_CRIT_DPS' || spd < 115;

      const cvRatio = Math.min(1.0, cv / 260);
      const spdRatio = isSlowDps ? 20 : (spd >= 134 ? 20 : (spd / 134) * 15);
      const atkRatio = archetype === 'HP_CRIT_DPS'
        ? Math.min(15, (hp / 7500) * 15)
        : Math.min(15, (atk / 2800) * 15);
      statPoints = (cvRatio * 65) + spdRatio + atkRatio;

      if (cr < 70 && cd > 160) {
        bottleneck = isRu
          ? `Дисбаланс критов: Крит. Шанс (${cr}%) отстает от Крит. Урона (${cd}%). Теряется стабильность ротации.`
          : `Imbalanced CRIT ratio: CRIT Rate (${cr}%) lags behind CRIT DMG (${cd}%).`;
        actions.push({
          title: isRu ? 'Приоритет: Стабилизация Крит. Шанса' : 'Priority: Stabilize CRIT Rate',
          desc: isRu ? 'Соотношение 1:2 дает наибольшую среднюю ротацию урона.' : 'Target 1:2 ratio to maximize expected damage per rotation.'
        });
      } else if (!isSlowDps && spd < 134) {
        bottleneck = isRu
          ? `Скорость (${spd}) ниже порога 134.0 SPD. Теряется 1 действие в Цикле 0 Зала Забвения.`
          : `Speed (${spd}) is below 134.0 SPD. The character misses an extra turn in Cycle 0.`;
        actions.push({
          title: isRu ? 'Приоритет: 134.0 Скорости' : 'Priority: Reach 134.0 SPD',
          desc: isRu ? 'Доберите 1-2 сабстата скорости для получения 2 действий в первом цикле.' : 'Gain 1-2 speed substats to unlock 2 actions in Cycle 0.'
        });
      } else if (isSlowDps && archetype !== 'HP_CRIT_DPS' && atk < 3000) {
        bottleneck = isRu
          ? `Сила атаки (${atk}) ниже рекомендуемой для гиперкерри (3200+ АТК). Сборка ориентирована на чистый урон без затрат на скорость.`
          : `ATK (${atk}) is below recommended hypercarry benchmark (3200+ ATK). Focus on pure damage without speed investment.`;
        actions.push({
          title: isRu ? 'Приоритет: Сила Атаки%' : 'Priority: Scale ATK%',
          desc: isRu ? 'Сапоги на Силу атаки% максимизируют урон атак и ультимейта.' : 'ATK% boots maximize skill and ultimate damage.'
        });
      } else {
        bottleneck = isRu
          ? (isSlowDps ? `Сбалансированная сборка на максимальный урон (CV ${cv}, ${archetype === 'HP_CRIT_DPS' ? `${hp} HP` : `${atk} АТК`}). Скорость не требуется.` : `Сбалансированная боевая сборка (CV ${cv}, SPD ${spd}).`)
          : (isSlowDps ? `Optimal max-damage build (CV ${cv}, ${archetype === 'HP_CRIT_DPS' ? `${hp} HP` : `${atk} ATK`}). No speed required.` : `Solid balanced build (CV ${cv}, SPD ${spd}).`);
        actions.push({
          title: isRu ? 'Оптимизация: Замена худшего артефакта' : 'Optimization: Replace Worst Relic',
          desc: isRu ? `Замените слот ${weakestRelicIndex + 1} на реликвию с большим количеством роллов в криты.` : `Upgrade slot ${weakestRelicIndex + 1} with offensive rolls.`
        });
      }
      break;
    }
  }

  // Factor in Main Stat validity into overall score and bottlenecks
  const slotNamesRu = ['Голова', 'Руки', 'Тело', 'Сапоги', 'Планарная сфера', 'Соединительная вервь'];
  const slotNamesEn = ['Head', 'Hands', 'Body', 'Feet', 'Planar Sphere', 'Link Rope'];
  const wrongMainRelics = relicScores.filter(r => r.mainEval?.status === 'wrong');

  if (wrongMainRelics.length > 0) {
    const worstMain = wrongMainRelics[0];
    const sName = isRu ? (slotNamesRu[worstMain.idx] || `Слот ${worstMain.idx + 1}`) : (slotNamesEn[worstMain.idx] || `Slot ${worstMain.idx + 1}`);
    const recText = isRu ? worstMain.mainEval.recommendedRu : worstMain.mainEval.recommendedEn;

    actions.unshift({
      title: isRu ? `Критично: Неверный главный стат (${sName})` : `Critical: Wrong Main Stat (${sName})`,
      desc: isRu
        ? `На реликвии «${sName}» активен неподходящий главный стат. Для вашего архетипа необходимо заменить на: ${recText}.`
        : `Slot "${sName}" has incompatible main stat. For this archetype, switch to: ${recText}.`
    });

    bottleneck = isRu
      ? `Критическая потеря урона/эффективности: ${sName} имеет неподходящий главный стат. Срочно замените на: ${recText}.`
      : `Critical efficiency loss: ${sName} has incompatible main stat. Priority replacement: ${recText}.`;
  }

  // Deduct main stat penalties from statPoints (14 pts per wrong main stat, 2 pts per non-optimal viable)
  let mainStatPenalty = 0;
  relicScores.forEach(r => {
    if (r.mainEval?.status === 'wrong') mainStatPenalty += 14;
    else if (r.mainEval?.status === 'viable') mainStatPenalty += 2;
  });
  statPoints = Math.max(15, statPoints - mainStatPenalty);

  // 4. Planar Ornaments Calculation & Synergy Bonus (Подсчет планарок)
  const planarRelics = (char.relics || []).filter(r => r.type === 5 || r.type === 6);
  let planarRollsTotal = 0;
  let planarUsefulRolls = 0;
  let planarCv = 0;

  planarRelics.forEach(r => {
    (r.sub_affix || []).forEach(sub => {
      const cnt = sub.count || 1;
      planarRollsTotal += cnt;
      if (sub.field === 'crit_rate') {
        planarCv += (sub.value || 0) * 200;
        planarUsefulRolls += cnt;
      } else if (sub.field === 'crit_dmg') {
        planarCv += (sub.value || 0) * 100;
        planarUsefulRolls += cnt;
      } else if (['spd', 'atk', 'def', 'hp', 'break_dmg', 'effect_hit', 'effect_res'].includes(sub.field)) {
        planarUsefulRolls += cnt * 0.9;
      }
    });
  });

  const pInfo0 = planarRelics.length > 0 ? resolveRelicSetInfo(planarRelics[0], isRu ? 'ru' : 'en') : null;
  const pInfo1 = planarRelics.length > 1 ? resolveRelicSetInfo(planarRelics[1], isRu ? 'ru' : 'en') : null;
  const planarSet = pInfo0?.name || (planarRelics.length > 0 ? (planarRelics[0].set_name || '') : '');
  const isPlanarSetComplete = planarRelics.length === 2 && (
    planarRelics[0].set_id === planarRelics[1].set_id ||
    (pInfo0?.name && pInfo0.name === pInfo1?.name)
  );
  const planarEfficiency = planarRollsTotal > 0 ? Math.round((planarUsefulRolls / planarRollsTotal) * 100) : 75;

  let planarCondition = "";
  let isConditionMet = true;

  // Comprehensive check for all existing + upcoming 3.x planar sets
  if (/Салсотто|Salsotto/i.test(planarSet)) {
    isConditionMet = cr >= 50;
    planarCondition = isConditionMet
      ? (isRu ? `50%+ КШ выполнено (${cr}% ✓) • Бонус +15% к ульту/бонус-атаке активен` : `50%+ CR achieved (${cr}% ✓) • +15% Ult/FUA DMG active`)
      : (isRu ? `Требуется 50% КШ (текущий: ${cr}% ⚠️) • Бонус сета не активирован!` : `Requires 50% CR (current: ${cr}% ⚠️) • Inactive!`);
  } else if (/Гламот|Glamoth/i.test(planarSet)) {
    if (spd >= 160) {
      isConditionMet = true;
      planarCondition = isRu ? `160+ СКОР выполнено (${spd} ✓) • Максимальный бонус +18% урона активен` : `160+ SPD achieved (${spd} ✓) • Max +18% DMG active`;
    } else if (spd >= 135) {
      isConditionMet = true;
      planarCondition = isRu ? `135+ СКОР выполнено (${spd} ✓) • Бонус +12% урона активен` : `135+ SPD achieved (${spd} ✓) • +12% DMG active`;
    } else {
      isConditionMet = false;
      planarCondition = isRu ? `Требуется 135 СКОР (текущая: ${spd} ⚠️) • Бонус урона не активирован!` : `Requires 135 SPD (current: ${spd} ⚠️) • Inactive!`;
    }
  } else if (/Арена|Rutilant/i.test(planarSet)) {
    isConditionMet = cr >= 70;
    planarCondition = isConditionMet
      ? (isRu ? `70%+ КШ выполнено (${cr}% ✓) • Бонус +20% к базовой атаке и навыку активен` : `70%+ CR achieved (${cr}% ✓) • +20% Basic/Skill DMG active`)
      : (isRu ? `Требуется 70% КШ (текущий: ${cr}% ⚠️) • Бонус урона не активирован!` : `Requires 70% CR (current: ${cr}% ⚠️) • Inactive!`);
  } else if (/Киль|Keel/i.test(planarSet)) {
    isConditionMet = eres >= 30;
    planarCondition = isConditionMet
      ? (isRu ? `30%+ СЭ выполнено (${eres}% ✓) • Бонус отряда +10% Крит. Урона активен` : `30%+ E-RES achieved (${eres}% ✓) • Team +10% CD active`)
      : (isRu ? `Требуется 30% СЭ (текущее: ${eres}% ⚠️) • Бонус критов не активирован!` : `Requires 30% E-RES (current: ${eres}% ⚠️) • Inactive!`);
  } else if (/Герта|Space Sealing|Запечатывающ/i.test(planarSet)) {
    isConditionMet = spd >= 120;
    planarCondition = isConditionMet
      ? (isRu ? `120+ СКОР выполнено (${spd} ✓) • Дополнительные +12% Силы Атаки активны` : `120+ SPD achieved (${spd} ✓) • Extra +12% ATK active`)
      : (isRu ? `Требуется 120 СКОР (текущая: ${spd} ⚠️) • Доп. атака не активирована!` : `Requires 120 SPD (current: ${spd} ⚠️) • Inactive!`);
  } else if (/Флот|Ageless/i.test(planarSet)) {
    isConditionMet = spd >= 120;
    planarCondition = isConditionMet
      ? (isRu ? `120+ СКОР выполнено (${spd} ✓) • Бонус отряда +8% Силы Атаки активен` : `120+ SPD achieved (${spd} ✓) • Team +8% ATK active`)
      : (isRu ? `Требуется 120 СКОР (текущая: ${spd} ⚠️) • Бафф отряда не активирован!` : `Requires 120 SPD (current: ${spd} ⚠️) • Inactive!`);
  } else if (/Калпаги|Kalpagni/i.test(planarSet)) {
    isConditionMet = spd >= 145;
    planarCondition = isConditionMet
      ? (isRu ? `145+ СКОР выполнено (${spd} ✓) • +40% Эффекта Пробития по огненной уязвимости` : `145+ SPD achieved (${spd} ✓) • +40% BE on Fire weakness`)
      : (isRu ? `Требуется 145 СКОР (текущая: ${spd} ⚠️)` : `Requires 145 SPD (current: ${spd} ⚠️)`);
  } else if (/Талия|Talia/i.test(planarSet)) {
    isConditionMet = spd >= 145;
    planarCondition = isConditionMet
      ? (isRu ? `145+ СКОР выполнено (${spd} ✓) • Максимальный бонус +36% Эффекта Пробития активен` : `145+ SPD achieved (${spd} ✓) • Max +36% Break Effect active`)
      : (isRu ? `Требуется 145 СКОР (текущая: ${spd} ⚠️) • Доп. +20% ЭП не активированы!` : `Requires 145 SPD (current: ${spd} ⚠️) • Inactive!`);
  } else if (/Вонвак|Vonwacq/i.test(planarSet)) {
    isConditionMet = spd >= 120;
    planarCondition = isConditionMet
      ? (isRu ? `120+ СКОР выполнено (${spd} ✓) • +5% ВЭ и продвижение действия на 40% активно` : `120+ SPD achieved (${spd} ✓) • +5% ERR & 40% Action Advance active`)
      : (isRu ? `Требуется 120 СКОР (текущая: ${spd} ⚠️)` : `Requires 120 SPD (current: ${spd} ⚠️)`);
  } else if (/Белобог|Belobog/i.test(planarSet)) {
    isConditionMet = ehr >= 50;
    planarCondition = isConditionMet
      ? (isRu ? `50%+ ШПЭ выполнено (${ehr}% ✓) • Максимальный бонус +30% Защиты активен` : `50%+ EHR achieved (${ehr}% ✓) • Max +30% DEF active`)
      : (isRu ? `Требуется 50% ШПЭ (текущий: ${ehr}% ⚠️) • Доп. +15% ЗАЩ не активированы!` : `Requires 50% EHR (current: ${ehr}% ⚠️) • Inactive!`);
  } else if (/Дифференциатор|Differentiator/i.test(planarSet)) {
    isConditionMet = cd >= 120;
    planarCondition = isConditionMet
      ? (isRu ? `120%+ КУ выполнено (${cd}% ✓) • +16% КУ и +60% КШ на первую атаку активны` : `120%+ CD achieved (${cd}% ✓) • +16% CD & +60% CR on 1st hit active`)
      : (isRu ? `Требуется 120% КУ (текущий: ${cd}% ⚠️)` : `Requires 120% CD (current: ${cd}% ⚠️)`);
  } else if (/Кост|Останков|Bone Collection/i.test(planarSet)) {
    isConditionMet = hp >= 5000;
    planarCondition = isConditionMet
      ? (isRu ? `5000+ HP выполнено (${hp} ✓) • +12% HP и +28% Крит. Урона владельцу и миньонам активно` : `5000+ HP achieved (${hp} ✓) • +12% HP & +28% CD active`)
      : (isRu ? `Требуется 5000 HP (текущее: ${hp} ⚠️)` : `Requires 5000 HP (current: ${hp} ⚠️)`);
  } else if (/Древо|Giant Tree/i.test(planarSet)) {
    isConditionMet = spd >= 135;
    planarCondition = isConditionMet
      ? (isRu ? `135+ СКОР выполнено (${spd} ✓) • +6% СКОР и максимальный бафф активен` : `135+ SPD achieved (${spd} ✓) • +6% SPD & max buff active`)
      : (isRu ? `Требуется 135 СКОР (текущая: ${spd} ⚠️)` : `Requires 135 SPD (current: ${spd} ⚠️)`);
  } else if (/Банан|Banan/i.test(planarSet)) {
    isConditionMet = true;
    planarCondition = isRu
      ? '+16% Крит. Урона активно • Дополнительно +32% КУ при наличии призванного существа ✓'
      : '+16% CRIT DMG active • +32% extra CD when summons present ✓';
  } else if (/Лушака|Русалка|Lushaka/i.test(planarSet)) {
    isConditionMet = true;
    planarCondition = isRu ? '+5% ВЭ и +12% Силы Атаки первому союзнику в отряде ✓' : '+5% ERR & +12% ATK to 1st slot ally ✓';
  } else if (/Пенакони|Penacony/i.test(planarSet)) {
    isConditionMet = true;
    planarCondition = isRu ? '+5% ВЭ и +10% урона союзникам той же стихии ✓' : '+5% ERR & +10% DMG to same-element allies ✓';
  } else if (/Пангалакти|Pan-Cosmic/i.test(planarSet)) {
    isConditionMet = true;
    planarCondition = isRu ? `+10% ШПЭ и +${Math.min(25, Math.round(ehr * 0.25))}% Силы Атаки от ШПЭ ✓` : `+10% EHR & +${Math.min(25, Math.round(ehr * 0.25))}% ATK from EHR ✓`;
  } else if (/Сигони|Sigonia/i.test(planarSet)) {
    isConditionMet = true;
    planarCondition = isRu ? '+4% КШ и до +40% Крит. Урона за поверженных врагов' : '+4% CR & up to +40% CD on enemy defeated';
  } else if (/Изум|Идзумо|Izumo/i.test(planarSet)) {
    isConditionMet = true;
    planarCondition = isRu ? '+12% Силы Атаки и +12% КШ при наличии союзника того же пути' : '+12% ATK & +12% CR with same-path ally';
  } else if (/Дуран|Duran/i.test(planarSet)) {
    isConditionMet = true;
    planarCondition = isRu ? 'До 5 стаков: +25% к бонус-атакам и +25% Крит. Урона' : 'Up to 5 stacks: +25% FUA DMG & +25% CD';
  } else if (/Миг радости бога|радости бога|Moment of Joy/i.test(planarSet)) {
    isConditionMet = true;
    planarCondition = isRu
      ? '+6% Скорости активно • Действие продвигается вперёд на 40% при входе в бой с Радостью ✓'
      : '+6% SPD active • 40% Action Advance at battle start with Elation ✓';
  } else if (/Подпространственный центр|контроля аномалий|Subspace ASC Center/i.test(planarSet)) {
    isConditionMet = spd >= 145;
    planarCondition = isConditionMet
      ? (isRu ? `145+ СКОР выполнено (${spd} ✓) • +6% СКОР и +15% Эффекта Пробития всем союзникам активны ✓` : `145+ SPD achieved (${spd} ✓) • +6% SPD & +15% Break Effect for all allies active ✓`)
      : (isRu ? `Требуется 145 СКОР (текущая: ${spd} ⚠️) • Бонус команды не активирован!` : `Requires 145 SPD (current: ${spd} ⚠️) • Team bonus inactive!`);
  } else if (/Tengoku|Тэнгоку|Стрим/i.test(planarSet)) {
    isConditionMet = true;
    planarCondition = isRu ? '+8% КШ активно • Дополнительно +24% Крит. Урона при наличии спутника/призыва ✓' : '+8% CR active • +24% CRIT DMG with summon/servant ✓';
  } else if (/Amphoreus|Амфореус/i.test(planarSet)) {
    isConditionMet = true;
    planarCondition = isRu ? '+12% HP и усиление урона союзников активно ✓' : '+12% HP & team DMG amplification active ✓';
  } else if (/Punklorde|Панклорд/i.test(planarSet)) {
    isConditionMet = true;
    planarCondition = isRu ? '+6% Скорости и бонус атаки от ШПЭ активны ✓' : '+6% SPD & ATK bonus from EHR active ✓';
  } else {
    // Universal Smart Fallback for any future or unlisted planar set
    // Check if the set bonus description has a speed, HP, CR, or EHR threshold
    const matchingSet = (char.relic_sets || []).find(s => s.name === planarSet || (planarSet && s.name && planarSet.includes(s.name)));
    const setDesc = matchingSet?.desc || '';

    if (/\b160\b/.test(setDesc)) {
      isConditionMet = spd >= 160;
      planarCondition = isConditionMet
        ? (isRu ? `160+ СКОР выполнено (${spd} ✓) • Полный бонус сета активен` : `160+ SPD achieved (${spd} ✓) • Full set bonus active`)
        : (isRu ? `Требуется 160 СКОР (текущая: ${spd} ⚠️)` : `Requires 160 SPD (current: ${spd} ⚠️)`);
    } else if (/\b145\b/.test(setDesc)) {
      isConditionMet = spd >= 145;
      planarCondition = isConditionMet
        ? (isRu ? `145+ СКОР выполнено (${spd} ✓) • Бонус сета активен` : `145+ SPD achieved (${spd} ✓) • Set bonus active`)
        : (isRu ? `Требуется 145 СКОР (текущая: ${spd} ⚠️)` : `Requires 145 SPD (current: ${spd} ⚠️)`);
    } else if (/\b135\b/.test(setDesc)) {
      isConditionMet = spd >= 135;
      planarCondition = isConditionMet
        ? (isRu ? `135+ СКОР выполнено (${spd} ✓) • Бонус сета активен` : `135+ SPD achieved (${spd} ✓) • Set bonus active`)
        : (isRu ? `Требуется 135 СКОР (текущая: ${spd} ⚠️)` : `Requires 135 SPD (current: ${spd} ⚠️)`);
    } else if (/\b120\b/.test(setDesc)) {
      isConditionMet = spd >= 120;
      planarCondition = isConditionMet
        ? (isRu ? `120+ СКОР выполнено (${spd} ✓) • Бонус сета активен` : `120+ SPD achieved (${spd} ✓) • Set bonus active`)
        : (isRu ? `Требуется 120 СКОР (текущая: ${spd} ⚠️)` : `Requires 120 SPD (current: ${spd} ⚠️)`);
    } else if (/\b5000\b/.test(setDesc)) {
      isConditionMet = hp >= 5000;
      planarCondition = isConditionMet
        ? (isRu ? `5000+ HP выполнено (${hp} ✓) • Бонус сета активен` : `5000+ HP achieved (${hp} ✓) • Set bonus active`)
        : (isRu ? `Требуется 5000 HP (текущее: ${hp} ⚠️)` : `Requires 5000 HP (current: ${hp} ⚠️)`);
    } else if (/\b70%\b/.test(setDesc) && /крит|crit/i.test(setDesc)) {
      isConditionMet = cr >= 70;
      planarCondition = isConditionMet
        ? (isRu ? `70%+ КШ выполнено (${cr}% ✓) • Бонус сета активен` : `70%+ CR achieved (${cr}% ✓) • Set bonus active`)
        : (isRu ? `Требуется 70% КШ (текущий: ${cr}% ⚠️)` : `Requires 70% CR (current: ${cr}% ⚠️)`);
    } else if (/\b50%\b/.test(setDesc) && /крит|crit/i.test(setDesc)) {
      isConditionMet = cr >= 50;
      planarCondition = isConditionMet
        ? (isRu ? `50%+ КШ выполнено (${cr}% ✓) • Бонус сета активен` : `50%+ CR achieved (${cr}% ✓) • Set bonus active`)
        : (isRu ? `Требуется 50% КШ (текущий: ${cr}% ⚠️)` : `Requires 50% CR (current: ${cr}% ⚠️)`);
    } else {
      isConditionMet = true;
      planarCondition = isRu
        ? (isPlanarSetComplete ? `Сет «${planarSet}» активен (2/2) ✓` : `Разорванный планарный сет ⚠️`)
        : (isPlanarSetComplete ? `Set "${planarSet}" active (2/2) ✓` : `Broken planar set ⚠️`);
    }
  }

  // Calculate Planar Synergy Bonus to factor directly into Gaussian Global Top
  let planarSynergyBonus = 0;
  if (isPlanarSetComplete) {
    planarSynergyBonus += 3.5; // Complete 2/2 set synergy
    if (isConditionMet) {
      planarSynergyBonus += 3.0; // Condition fulfilled bonus
    } else {
      planarSynergyBonus -= 2.5; // Inactive condition penalty
      actions.push({
        title: isRu ? 'Условие планарного сета не активировано' : 'Planar Set Condition Inactive',
        desc: planarCondition
      });
    }
  } else if (planarRelics.length === 2) {
    planarSynergyBonus -= 5.0; // Broken 1/2 + 1/2 planar set penalty
    actions.push({
      title: isRu ? 'Разорванный планарный сет (1/2 + 1/2)' : 'Broken Planar Set (1/2 + 1/2)',
      desc: isRu
        ? `На персонаже надеты планарки из разных наборов («${planarRelics[0].set_name}» и «${planarRelics[1].set_name}»). Соберите 2 предмета одного сета для получения пассивного бонуса.`
        : `Equipped planars are from different sets. Equip 2 pieces of the same set to activate 2-Pc passive.`
    });
  }

  // 4b. Cavern Relic Sets Calculation & Synergy Bonus (Подсчет пещерных сетов)
  const cavernRelics = (char.relics || []).filter(r => r.type >= 1 && r.type <= 4);
  let cavernRollsTotal = 0;
  let cavernUsefulRolls = 0;
  let cavernCv = 0;

  cavernRelics.forEach(r => {
    (r.sub_affix || []).forEach(sub => {
      const cnt = sub.count || 1;
      cavernRollsTotal += cnt;
      if (sub.field === 'crit_rate') {
        cavernCv += (sub.value || 0) * 200;
        cavernUsefulRolls += cnt;
      } else if (sub.field === 'crit_dmg') {
        cavernCv += (sub.value || 0) * 100;
        cavernUsefulRolls += cnt;
      } else if (['spd', 'atk', 'def', 'hp', 'break_dmg', 'effect_hit', 'effect_res'].includes(sub.field)) {
        cavernUsefulRolls += cnt * 0.9;
      }
    });
  });

  const cavernEfficiency = cavernRollsTotal > 0 ? Math.round((cavernUsefulRolls / cavernRollsTotal) * 100) : 75;

  const cavernSetCounts = {};
  cavernRelics.forEach(r => {
    const info = resolveRelicSetInfo(r, isRu ? 'ru' : 'en');
    const sId = info?.def?.ids?.[0] || info?.name || r.set_id || r.set_name || 'unknown';
    const sName = info?.name || r.set_name || (isRu ? `Сет #${sId}` : `Set #${sId}`);
    cavernSetCounts[sId] = cavernSetCounts[sId] || { count: 0, name: sName };
    cavernSetCounts[sId].count += 1;
  });

  const cavernGroups = Object.values(cavernSetCounts).sort((a, b) => b.count - a.count);
  let cavernSynergyBonus = 0;
  let cavernSetLabel = '';
  let cavernStatusText = '';
  let isCavernComplete = false;

  if (cavernGroups.length > 0 && cavernGroups[0].count >= 4) {
    isCavernComplete = true;
    cavernSynergyBonus = 4.0;
    cavernSetLabel = `✓ 4/4 ${cavernGroups[0].name}`;
    cavernStatusText = isRu
      ? `Полный комплект 4/4 активен («${cavernGroups[0].name}») • Бонус сета активирован ✓`
      : `Full 4/4 set active ("${cavernGroups[0].name}") • Set passive unlocked ✓`;
  } else if (cavernGroups.length >= 2 && cavernGroups[0].count >= 2 && cavernGroups[1].count >= 2) {
    isCavernComplete = true;
    cavernSynergyBonus = 3.0;
    cavernSetLabel = `✓ 2/4 ${cavernGroups[0].name} + 2/4 ${cavernGroups[1].name}`;
    cavernStatusText = isRu
      ? `Комбинация 2/4 + 2/4 активна • Получены два 2-Pc бонуса сетов ✓`
      : `Combination 2/4 + 2/4 active • Two 2-Pc set bonuses unlocked ✓`;
  } else if (cavernGroups.length > 0 && cavernGroups[0].count >= 2) {
    isCavernComplete = false;
    cavernSynergyBonus = 0.5;
    cavernSetLabel = isRu
      ? `2/4 ${cavernGroups[0].name} (1/4 + 1/4 Разорван ⚠️)`
      : `2/4 ${cavernGroups[0].name} (1/4 + 1/4 Broken ⚠️)`;
    cavernStatusText = isRu
      ? `Активирован только 2-Pc бонус («${cavernGroups[0].name}»). Две реликвии надеты без сета ⚠️`
      : `Only 2-Pc bonus active ("${cavernGroups[0].name}"). 2 pieces are off-set ⚠️`;
    actions.push({
      title: isRu ? 'Неполный пещерный комплект (2/4)' : 'Incomplete Cavern Set (2/4)',
      desc: isRu
        ? `Активирован только 2-Pc бонус («${cavernGroups[0].name}»). Соберите 4 предмета или второй 2-Pc сет для значительного усиления.`
        : `Only 2-Pc bonus active. Equip 4 pieces or a second 2-Pc set for major stat amplification.`
    });
  } else if (cavernRelics.length === 4) {
    isCavernComplete = false;
    cavernSynergyBonus = -4.0;
    cavernSetLabel = isRu ? 'РАЗОРВАННЫЙ ПЕЩЕРНЫЙ СЕТ ⚠️' : 'BROKEN CAVERN SET ⚠️';
    cavernStatusText = isRu
      ? `Все 4 пещерные реликвии надеты из разных наборов. Бонусы сетов не действуют ⚠️`
      : `All 4 cavern relics are from mismatched sets with 0 active set passives ⚠️`;
    actions.push({
      title: isRu ? 'Разорванный пещерный сет (0 бонусов)' : 'Broken Cavern Relics (0 set bonuses)',
      desc: isRu
        ? 'Все 4 пещерные реликвии надеты из разных сетов без активных бонусов наборов. Соберите 4 предмета одного сета или 2+2.'
        : 'All 4 cavern relics are from mismatched sets with 0 active set passives. Equip a full 4-Pc or 2+2 set.'
    });
  }

  statPoints = Math.max(15, statPoints + planarSynergyBonus + cavernSynergyBonus);

  // 5. Combined Combat Score (0 - 100)
  const finalScore = Math.min(99.4, Math.max(45.0, (statPoints * 0.7) + (rollEfficiency * 0.3)));

  // 6. Authentic Gaussian Distribution Percentile Rank
  // Mean build = 68.0, Standard Deviation = 11.5
  const zScore = (finalScore - 68.0) / 11.5;
  const topPercent = zScoreToTopPercent(zScore);

  // Dynamic Key Benchmark Metrics (Самый нужный стат у персонажа вместо критмассы)
  const characterMetrics = determineCharacterMetrics(char, archetype, {
    hp,
    atk,
    def,
    spd,
    cr,
    cd,
    cv,
    be,
    ehr,
    eres,
    heal,
    err
  });

  return {
    score: finalScore.toFixed(1),
    topPercent: topPercent.toFixed(1),
    rollEfficiency: rollEfficiency.toFixed(1),
    cv: cv.toFixed(1),
    spd: spd.toFixed(1),
    archetype,
    primaryMetric: characterMetrics.primary,
    secondaryMetric: characterMetrics.secondary,
    bottleneck,
    actions,
    weakestRelicIndex,
    cavern: {
      label: cavernSetLabel,
      setName: cavernGroups.length > 0 ? cavernGroups[0].name : '',
      isComplete: isCavernComplete,
      efficiency: cavernEfficiency,
      cv: cavernCv.toFixed(1),
      condition: cavernStatusText,
      rollsTotal: cavernRollsTotal,
      usefulRolls: Math.round(cavernUsefulRolls),
      groups: cavernGroups
    },
    planar: {
      setName: planarSet,
      isComplete: isPlanarSetComplete,
      efficiency: planarEfficiency,
      cv: planarCv.toFixed(1),
      condition: planarCondition,
      rollsTotal: planarRollsTotal,
      usefulRolls: Math.round(planarUsefulRolls)
    }
  };
}
