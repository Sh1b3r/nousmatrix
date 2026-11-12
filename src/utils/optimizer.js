import { SET_DEFINITIONS, resolveRelicSetInfo } from './setDefinitions.js';
import { evaluateRelicMainStat } from './audit.js';

// Default recommended sets by character / archetype
export function getDefaultRecommendedSets(char, archetype) {
  const name = (char?.name || '').toLowerCase();
  const charId = String(char?.id || '');

  // 1. Specific Hero Recommendations
  if (name.includes('яо') || name.includes('yao') || name.includes('гуан')) {
    return {
      cavernId: '126', // Недосягаемый прорицатель (The Unreachable Diviner)
      cavernNameRu: 'Недосягаемый прорицатель',
      cavernNameEn: 'The Unreachable Diviner',
      planarId: '329', // Миг радости бога
      planarNameRu: 'Миг радости бога',
      planarNameEn: "God's Moment of Joy"
    };
  }

  if (charId === '1507' || name.includes('мортенакс') || name.includes('mortenax')) {
    if (archetype === 'MORTENAX_SUPPORT') {
      return {
        cavernId: '110', // Орёл сумеречного рубежа (Eagle of Twilight Line)
        cavernNameRu: 'Орёл сумеречного рубежа',
        cavernNameEn: 'Eagle of Twilight Line',
        planarId: '308', // Живой Вонвак (Sprightly Vonwacq)
        planarNameRu: 'Живой Вонвак',
        planarNameEn: 'Sprightly Vonwacq'
      };
    }
    return {
      cavernId: '125', // Кузнец палящего пламени / Долгоживущий ученик
      cavernNameRu: 'Долгоживущий ученик',
      cavernNameEn: 'Longevous Disciple',
      planarId: '306', // Замершее Салсотто
      planarNameRu: 'Замершее Салсотто',
      planarNameEn: 'Inert Salsotto'
    };
  }

  if (name.includes('ахерон') || name.includes('acheron') || charId === '1308') {
    return {
      cavernId: '118', // Первооткрыватель мёртвых вод
      cavernNameRu: 'Первооткрыватель мёртвых вод',
      cavernNameEn: 'Pioneer Diver of Dead Waters',
      planarId: '313', // Мир Идзумо
      planarNameRu: 'Мир Идзумо и Царство Такама',
      planarNameEn: 'Izumo Gensei and Takama Divine Realm'
    };
  }

  if (name.includes('светлячок') || name.includes('firefly') || charId === '1310') {
    return {
      cavernId: '120', // Железная кавалерия
      cavernNameRu: 'Железная кавалерия против мора',
      cavernNameEn: 'Iron Cavalry Against the Scourge',
      planarId: '314', // Кальпаги
      planarNameRu: 'Бессмертный фонарь Кальпаги',
      planarNameEn: 'Forge of the Kalpagni Lantern'
    };
  }

  if (name.includes('жуань') || name.includes('ruan') || charId === '1303') {
    return {
      cavernId: '117', // Часовщик озорных махинаций
      cavernNameRu: 'Часовщик озорных махинаций',
      cavernNameEn: 'Watchmaker, Master of Dream Machinations',
      planarId: '308', // Живой Вонвак
      planarNameRu: 'Живой Вонвак',
      planarNameEn: 'Sprightly Vonwacq'
    };
  }

  if (name.includes('авантюрин') || name.includes('aventurine') || charId === '1304') {
    return {
      cavernId: '103', // Рыцарь дворца чистоты
      cavernNameRu: 'Рыцарь дворца чистоты',
      cavernNameEn: 'Knight of Purity Palace',
      planarId: '306', // Замершее Салсотто
      planarNameRu: 'Замершее Салсотто',
      planarNameEn: 'Inert Salsotto'
    };
  }

  if (name.includes('воскресенье') || name.includes('sunday') || charId === '1313') {
    return {
      cavernId: '110', // Орёл сумеречного рубежа
      cavernNameRu: 'Орёл сумеречного рубежа',
      cavernNameEn: 'Eagle of Twilight Line',
      planarId: '317', // Славные сокровища Лушань
      planarNameRu: 'Славные сокровища Лушань',
      planarNameEn: 'Lushaka, the Sunken Seas'
    };
  }

  // 2. Archetype Fallbacks
  switch (archetype) {
    case 'HARMONY_SPD':
    case 'HARMONY_ATK':
    case 'HARMONY_CRIT':
      return {
        cavernId: '110',
        cavernNameRu: 'Орёл сумеречного рубежа',
        cavernNameEn: 'Eagle of Twilight Line',
        planarId: '308',
        planarNameRu: 'Живой Вонвак',
        planarNameEn: 'Sprightly Vonwacq'
      };

    case 'BREAK_DPS':
    case 'HARMONY_BREAK':
      return {
        cavernId: '120',
        cavernNameRu: 'Железная кавалерия против мора',
        cavernNameEn: 'Iron Cavalry Against the Scourge',
        planarId: '314',
        planarNameRu: 'Бессмертный фонарь Кальпаги',
        planarNameEn: 'Forge of the Kalpagni Lantern'
      };

    case 'DOT_DPS':
    case 'NIHILITY_DEBUFF':
      return {
        cavernId: '116',
        cavernNameRu: 'Пленник глубокого заключения',
        cavernNameEn: 'Prisoner in Deep Confinement',
        planarId: '302',
        planarNameRu: 'Пангалактическое коммерческое предприятие',
        planarNameEn: 'Pan-Cosmic Commercial Enterprise'
      };

    case 'PRESERVATION_DEF':
      return {
        cavernId: '103',
        cavernNameRu: 'Рыцарь дворца чистоты',
        cavernNameEn: 'Knight of Purity Palace',
        planarId: '304',
        planarNameRu: 'Белобог Архитекторов',
        planarNameEn: 'Belobog of the Architects'
      };

    case 'ABUNDANCE_HEAL':
      return {
        cavernId: '101',
        cavernNameRu: 'Скиталец блуждающего облака',
        cavernNameEn: 'Passerby of Wandering Cloud',
        planarId: '302',
        planarNameRu: 'Флот нестареющих',
        planarNameEn: 'Fleet of the Ageless'
      };

    default: // CRIT_DPS
      return {
        cavernId: '118',
        cavernNameRu: 'Первооткрыватель мёртвых вод',
        cavernNameEn: 'Pioneer Diver of Dead Waters',
        planarId: '313',
        planarNameRu: 'Мир Идзумо и Царство Такама',
        planarNameEn: 'Izumo Gensei and Takama Divine Realm'
      };
  }
}

/**
 * Gather all available relics on the account across showcase characters
 */
export function collectAccountRelicsPool(profile) {
  const pool = [];
  if (!profile || !Array.isArray(profile.characters)) return pool;

  profile.characters.forEach(char => {
    (char.relics || []).forEach(r => {
      pool.push({
        ...r,
        sourceCharName: char.name,
        sourceCharIcon: char.icon,
        sourceCharId: char.id
      });
    });
  });

  return pool;
}

/**
 * Optimize build prioritizing:
 * 1. 4-pc Cavern Set + 2-pc Planar Set (or chosen sets)
 * 2. Optimal main stats on slots 3, 4, 5, 6
 * 3. Best substat quality
 */
export function optimizeCharacterBuild(char, currentRelics, accountPool, options = {}) {
  const {
    targetCavernSetId = null,
    targetPlanarSetId = null,
    priority = 'FULL_SETS', // 'FULL_SETS' | 'SPEED' | 'CRIT'
    archetype = 'CRIT_DPS'
  } = options;

  const defaults = getDefaultRecommendedSets(char, archetype);
  const preferredCavernId = targetCavernSetId || defaults.cavernId;
  const preferredPlanarId = targetPlanarSetId || defaults.planarId;

  // Pool includes current relics + all account relics
  const allRelics = [...accountPool];
  currentRelics.forEach(r => {
    if (!allRelics.some(existing => existing.id === r.id)) {
      allRelics.push({
        ...r,
        sourceCharName: char.name,
        sourceCharId: char.id
      });
    }
  });

  // Group relics by slot (1..6)
  const bySlot = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
  allRelics.forEach(r => {
    const slot = Number(r.type ?? r.pos);
    if (slot >= 1 && slot <= 6) {
      bySlot[slot].push(r);
    }
  });

  // Score an individual relic for this character
  const scorePiece = (r) => {
    if (!r) return 0;
    let score = (r.level || 0) * 1.5;

    // Check main stat validity
    const mainEval = evaluateRelicMainStat(r, archetype, char);
    if (mainEval.status === 'optimal') score += 25;
    else if (mainEval.status === 'viable') score += 10;
    else if (mainEval.status === 'wrong') score -= 25;

    // Set matching bonus
    const setId = String(r.set_id || (r.id ? String(r.id).slice(1, 4) : ''));
    const isPlanarSlot = Number(r.type ?? r.pos) >= 5;
    if (isPlanarSlot && setId === preferredPlanarId) {
      score += 35; // Strong preference for full 2-pc planar set
    } else if (!isPlanarSlot && setId === preferredCavernId) {
      score += 25; // Strong preference for full 4-pc cavern set
    }

    // Substats quality
    (r.sub_affix || []).forEach(sub => {
      const upgrades = Math.max(0, (sub.count || 1) - 1);
      if (priority === 'SPEED' && sub.field === 'spd') {
        score += 15 + upgrades * 10;
      } else if (priority === 'CRIT' && (sub.field === 'crit_rate' || sub.field === 'crit_dmg')) {
        score += 12 + upgrades * 8;
      } else if (['crit_rate', 'crit_dmg', 'spd'].includes(sub.field)) {
        score += 8 + upgrades * 5;
      } else if (['atk', 'hp', 'def', 'break_dmg', 'effect_hit'].includes(sub.field)) {
        score += 3 + upgrades * 2;
      }
    });

    return score;
  };

  // Pick best relic for each slot
  const optimizedPieces = [];
  let changesCount = 0;

  for (let slot = 1; slot <= 6; slot++) {
    const candidates = bySlot[slot] || [];
    const currentPiece = currentRelics.find(r => Number(r.type ?? r.pos) === slot);

    // Sort candidates by score
    candidates.sort((a, b) => scorePiece(b) - scorePiece(a));

    const bestPiece = candidates[0] || currentPiece;
    if (bestPiece) {
      const isChanged = !currentPiece || bestPiece.id !== currentPiece.id;
      if (isChanged) changesCount++;

      optimizedPieces.push({
        ...bestPiece,
        isSwapped: isChanged,
        fromCharName: bestPiece.sourceCharName && bestPiece.sourceCharName !== char.name ? bestPiece.sourceCharName : null
      });
    }
  }

  // Count set completion on optimized
  const cavernSets = {};
  const planarSets = {};
  optimizedPieces.forEach(r => {
    const slot = Number(r.type ?? r.pos);
    const sId = String(r.set_id || (r.id ? String(r.id).slice(1, 4) : ''));
    if (slot <= 4) cavernSets[sId] = (cavernSets[sId] || 0) + 1;
    else planarSets[sId] = (planarSets[sId] || 0) + 1;
  });

  const isFullCavernSet = Object.values(cavernSets).some(c => c >= 4);
  const isFullPlanarSet = Object.values(planarSets).some(c => c >= 2);

  return {
    pieces: optimizedPieces,
    changesCount,
    isFullCavernSet,
    isFullPlanarSet,
    recommendedCavernName: defaults.cavernNameRu,
    recommendedPlanarName: defaults.planarNameRu,
    improvementScore: Math.min(100, Math.round(changesCount * 8.5 + (isFullCavernSet ? 15 : 0) + (isFullPlanarSet ? 10 : 0)))
  };
}
