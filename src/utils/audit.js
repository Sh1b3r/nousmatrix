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

export function calculateCharacterAudit(char, lang = 'en') {
  if (!char) return null;

  const isRu = lang === 'ru';

  const baseMap = {};
  (char.attributes || []).forEach(a => { baseMap[a.field] = a; });
  const addMap = {};
  (char.additions || []).forEach(a => { addMap[a.field] = a; });

  const cr = ((baseMap['crit_rate']?.value || 0.05) + (addMap['crit_rate']?.value || 0)) * 100;
  const cd = ((baseMap['crit_dmg']?.value || 0.50) + (addMap['crit_dmg']?.value || 0)) * 100;
  const cv = (cr * 2 + cd);

  const spd = ((baseMap['spd']?.value || 100) + (addMap['spd']?.value || 0));
  const be = (addMap['break_dmg']?.value || 0) * 100;
  const def = ((baseMap['def']?.value || 800) + (addMap['def']?.value || 0));

  let score = 85.0;
  let topPercent = 2.5;
  let rollEfficiency = 90.0;
  let bottleneck = "";
  const actions = [];

  const path = char.path?.id || '';
  const charName = char.name || '';

  // 1. Preservation archetype
  if (charName.includes('Авантюрин') || charName.includes('Aventurine') || path === 'Knight') {
    if (def >= 4000) {
      score = 94.6;
      topPercent = 0.6;
      rollEfficiency = 95.8;
      bottleneck = isRu
        ? `Защита ${Math.round(def)} превосходит порог пассивки (4000 DEF = +48% Крит. Шанса). Высокая прочность щитов и стабильный урон.`
        : `DEF ${Math.round(def)} exceeds talent cap (4000 DEF = +48% CRIT Rate). Strong shields and consistent sub-DPS.`;
      actions.push({
        title: isRu ? "Оптимизация: Перевод избыточной защиты в Крит. Урон" : "Optimization: Shift excess DEF to CRIT DMG / SPD",
        desc: isRu
          ? "Кап пассивной конверсии защиты достигнут. Дальнейшие роллы в Защиту дают меньший прирост, чем в Крит. Урон и Скорость."
          : "Passive conversion cap is already maxed. Further rolls in DEF provide less DPS return than CRIT DMG or SPD."
      });
    } else {
      score = 86.2;
      topPercent = 4.2;
      rollEfficiency = 88.0;
      bottleneck = isRu
        ? `Защита ${Math.round(def)} ниже рекомендованного капа 4000. Талант недополучает ${Math.round((4000 - def) * 0.024)}% бесплатного Крит. Шанса.`
        : `DEF ${Math.round(def)} is below the 4000 breakpoint. The talent is missing ${Math.round((4000 - def) * 0.024)}% free CRIT Rate.`;
      actions.push({
        title: isRu ? "Приоритет: Добрать 4000 Защиты" : "Priority: Reach 4,000 DEF threshold",
        desc: isRu
          ? `Необходимо добрать ${Math.round(4000 - def)} защиты через соединительную вервь или сабстаты.`
          : `Gain ${Math.round(4000 - def)} more DEF via link rope or substats to unlock maximum talent scaling.`
      });
    }
  } else if (charName.includes('Светлячок') || charName.includes('Firefly') || be > 200) {
    // 2. Break Effect archetype
    if (be >= 360 && spd >= 150) {
      score = 96.2;
      topPercent = 0.3;
      rollEfficiency = 97.4;
      bottleneck = isRu
        ? `Пороги 360% Эффекта Пробития и 150+ Скорости (4 действия в ультимейте) закрыты. Сборка топового ранга.`
        : `Break Effect (${be.toFixed(1)}%) and SPD (${spd.toFixed(1)}) hit all major Cycle 0 breakpoints. Top-tier build.`;
      actions.push({
        title: isRu ? "Сборка завершена (End-Game Build)" : "Build Completed (End-Game Tier)",
        desc: isRu
          ? "Все ключевые брейкпоинты достигнуты. Трата смолы на перекрафт текущих артефактов не требуется."
          : "All key threshold benchmarks are satisfied. Resin investment into recrafting is not necessary."
      });
    } else {
      score = 89.4;
      topPercent = 1.8;
      rollEfficiency = 91.2;
      bottleneck = isRu
        ? `Эффект пробития (${be.toFixed(1)}%) или Скорость (${spd.toFixed(1)}) слегка отстают от идеального тайминга полного цикла ультимейта.`
        : `Break Effect (${be.toFixed(1)}%) or SPD (${spd.toFixed(1)}) is slightly behind optimal ultimate rotation timing.`;
      actions.push({
        title: isRu ? "Приоритет: Роллы в Эффект Пробития и Скорость" : "Priority: Roll Break Effect and SPD",
        desc: isRu
          ? "Криты этому персонажу не нужны: избавьтесь от кусков с роллами в КУ/КШ в пользу чистого Пробития и Силы Атаки."
          : "Crits are not required on this kit: replace CR/CD pieces in favor of pure Break Effect, SPD and ATK%."
      });
    }
  } else {
    // 3. Standard Crit DPS
    if (cv >= 270) {
      score = 95.8;
      topPercent = 0.4;
      rollEfficiency = 96.5;
    } else if (cv >= 240) {
      score = 91.5;
      topPercent = 1.2;
      rollEfficiency = 93.0;
    } else {
      score = 84.8;
      topPercent = 4.8;
      rollEfficiency = 87.5;
    }

    if (cr < 70 && cd > 160) {
      bottleneck = isRu
        ? `Перекос баланса критов: Крит. Шанс (${cr.toFixed(1)}%) отстает от Крит. Урона (${cd.toFixed(1)}%). Ультимейт теряет стабильность, пропуская критические удары.`
        : `Imbalanced CRIT ratio: CRIT Rate (${cr.toFixed(1)}%) lags behind CRIT DMG (${cd.toFixed(1)}%). Missed crits reduce expected rotation DPA.`;
      actions.push({
        title: isRu ? "Приоритет №1: Стабилизация Крит. Шанса" : "Priority #1: Stabilize CRIT Rate",
        desc: isRu
          ? `Замена одного куска на КШ приблизит соотношение 1:2. Это увеличит урон за ротацию минимум на 4–6%.`
          : `Swapping a piece to CRIT Rate brings your ratio closer to 1:2, boosting average rotation DPA by 4–6%.`
      });
    } else if (spd < 134) {
      bottleneck = isRu
        ? `Скорость (${spd.toFixed(1)}) ниже контрольного брейкпоинта 134.0 SPD. Персонаж совершает только 1 действие в первом цикле Зала Забвения.`
        : `Speed (${spd.toFixed(1)}) is below the 134.0 SPD breakpoint. The character takes only 1 action in Cycle 0.`;
      actions.push({
        title: isRu ? "Приоритет №1: Достижение 134.0 SPD" : "Priority #1: Reach 134.0 SPD Breakpoint",
        desc: isRu
          ? "Добрав 1-2 сабстата скорости (+4-6 SPD), вы получите 2 полноценных хода в первом цикле."
          : "Rolling 1–2 speed substats (+4–6 SPD) grants 2 full actions in the first Memory of Chaos cycle."
      });
    } else {
      bottleneck = isRu
        ? `Сбалансированное распределение статов (CV ${cv.toFixed(1)}, SPD ${spd.toFixed(1)}). Ограничением являются холостые роллы в Защиту/HP на сабстатах.`
        : `Balanced stat distribution (CV ${cv.toFixed(1)}, SPD ${spd.toFixed(1)}). Bottleneck comes from dead rolls into Flat HP/DEF.`;
      actions.push({
        title: isRu ? "Оптимизация: Перекрафт слабейшего артефакта" : "Optimization: Recraft Weakest Relic",
        desc: isRu
          ? "Замените кусок с наибольшим числом мусорных роллов на реликвию с полезными атакующими статами."
          : "Replace the piece with the highest number of dead substats with offensive roll upgrades."
      });
    }
  }

  // Find weakest relic
  let weakestRelicIndex = -1;
  let lowestRelicScore = 999;

  (char.relics || []).forEach((r, idx) => {
    let pieceScore = 0;
    (r.sub_affix || []).forEach(sub => {
      const isUseful = sub.field === 'crit_rate' || sub.field === 'crit_dmg' || sub.field === 'spd' || sub.field === 'atk' || sub.field === 'break_dmg' || sub.field === 'def';
      if (isUseful) {
        pieceScore += (sub.count || 1) * 20;
      }
    });
    if (pieceScore < lowestRelicScore) {
      lowestRelicScore = pieceScore;
      weakestRelicIndex = idx;
    }
  });

  return {
    score: score.toFixed(1),
    topPercent: topPercent.toFixed(1),
    rollEfficiency: rollEfficiency.toFixed(1),
    cv: cv.toFixed(1),
    spd: spd.toFixed(1),
    bottleneck,
    actions,
    weakestRelicIndex
  };
}
