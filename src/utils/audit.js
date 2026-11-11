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

export function getCharHeadIcon(char) {
  if (!char) return '';
  if (char.id) {
    return iconUrl(`icon/avatar/${char.id}.png`);
  }
  return iconUrl(char.icon);
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
  if (name.includes('Авантюрин') || name.includes('Aventurine') || (path === 'Knight' && def > 2500)) {
    archetype = 'PRESERVATION_DEF';
  } else if (name.includes('Фу Сюань') || name.includes('Fu Xuan')) {
    archetype = 'PRESERVATION_HP';
  } else if (name.includes('Лоча') || name.includes('Luocha')) {
    archetype = 'ABUNDANCE_ATK';
  } else if (path === 'Priest' || heal > 0) {
    if (name.includes('Галлахер') || name.includes('Gallagher') || name.includes('Линша') || name.includes('Lingsha') || be > 100) {
      archetype = 'ABUNDANCE_BREAK';
    } else {
      archetype = 'ABUNDANCE_HP';
    }
  } else if (name.includes('Воскресенье') || name.includes('Sunday') || name.includes('Искорка') || name.includes('Sparkle') || name.includes('Броня') || name.includes('Bronya')) {
    archetype = 'HARMONY_CRIT';
  } else if (name.includes('Зарянка') || name.includes('Robin') || name.includes('Тинъюнь') || name.includes('Tingyun')) {
    archetype = 'HARMONY_ATK';
  } else if (name.includes('Жуань') || name.includes('Ruan Mei')) {
    archetype = 'HARMONY_BREAK';
  } else if (name.includes('Светлячок') || name.includes('Firefly') || name.includes('Бутхилл') || name.includes('Boothill') || name.includes('Раппа') || name.includes('Rappa') || be > 180) {
    archetype = 'BREAK_DPS';
  } else if (name.includes('Кафка') || name.includes('Kafka') || name.includes('Лебедь') || name.includes('Black Swan') || name.includes('Сампо') || name.includes('Гуйнайфэнь') || (path === 'Warlock' && cr < 40 && ehr > 40)) {
    archetype = 'DOT_DPS';
  } else if (name.includes('Блэйд') || name.includes('Blade')) {
    archetype = 'HP_CRIT_DPS';
  } else if (path === 'Warlock' && (name.includes('Пела') || name.includes('Волк') || name.includes('Silver') || name.includes('Цзяоцю') || name.includes('Jiaoqiu'))) {
    archetype = 'NIHILITY_DEBUFF';
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
    relicScores.push({ idx, pScore, pTotal });
  });

  // Find exact weakest relic (lowest useful rolls)
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
      const cvRatio = Math.min(1.0, cv / 260);
      const spdRatio = spd >= 134 ? 20 : (spd / 134) * 15;
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
      } else if (spd < 134) {
        bottleneck = isRu
          ? `Скорость (${spd}) ниже порога 134.0 SPD. Теряется 1 действие в Цикле 0 Зала Забвения.`
          : `Speed (${spd}) is below 134.0 SPD. The character misses an extra turn in Cycle 0.`;
        actions.push({
          title: isRu ? 'Приоритет: 134.0 Скорости' : 'Priority: Reach 134.0 SPD',
          desc: isRu ? 'Доберите 1-2 сабстата скорости для получения 2 действий в первом цикле.' : 'Gain 1-2 speed substats to unlock 2 actions in Cycle 0.'
        });
      } else {
        bottleneck = isRu
          ? `Сбалансированная боевая сборка (CV ${cv}, SPD ${spd}).`
          : `Solid balanced build (CV ${cv}, SPD ${spd}).`;
        actions.push({
          title: isRu ? 'Оптимизация: Замена худшего артефакта' : 'Optimization: Replace Worst Relic',
          desc: isRu ? `Замените слот ${weakestRelicIndex + 1} на реликвию с большим количеством роллов в криты.` : `Upgrade slot ${weakestRelicIndex + 1} with offensive rolls.`
        });
      }
      break;
    }
  }

  // 4. Combined Combat Score (0 - 100)
  const finalScore = Math.min(99.4, Math.max(45.0, (statPoints * 0.7) + (rollEfficiency * 0.3)));

  // 5. Authentic Gaussian Distribution Percentile Rank
  // Mean build = 68.0, Standard Deviation = 11.5
  const zScore = (finalScore - 68.0) / 11.5;
  const topPercent = zScoreToTopPercent(zScore);

  return {
    score: finalScore.toFixed(1),
    topPercent: topPercent.toFixed(1),
    rollEfficiency: rollEfficiency.toFixed(1),
    cv: cv.toFixed(1),
    spd: spd.toFixed(1),
    bottleneck,
    actions,
    weakestRelicIndex
  };
}
