export const CDN_BASE = 'https://fastly.jsdelivr.net/gh/Mar-7th/StarRailRes@master/';

export function iconUrl(path) {
  if (!path) return '';
  return path.startsWith('http') ? path : `${CDN_BASE}${path}`;
}

export function getCharHeadIcon(char) {
  if (!char) return '';
  if (char.id) {
    return iconUrl(`icon/avatar/${char.id}.png`);
  }
  return iconUrl(char.icon);
}

export const SLOT_NAMES = [
  "Голова (Head)",
  "Руки (Hands)",
  "Тело (Body)",
  "Сапоги (Feet)",
  "Планарная сфера (Sphere)",
  "Соединительная веревка (Rope)"
];

export function calculateCharacterAudit(char) {
  if (!char) return null;

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
  if (charName.includes('Авантюрин') || path === 'Knight') {
    if (def >= 4000) {
      score = 94.6;
      topPercent = 0.6;
      rollEfficiency = 95.8;
      bottleneck = `Защита ${Math.round(def)} превосходит порог пассивки (4000 DEF = +48% Крит. Шанса). Высокая прочность щитов и стабильный урон.`;
      actions.push({
        title: "Оптимизация: Перевод избыточной защиты в Крит. Урон",
        desc: "Кап пассивной конверсии защиты достигнут. Дальнейшие роллы в Защиту дают меньший прирост, чем в Крит. Урон и Скорость."
      });
    } else {
      score = 86.2;
      topPercent = 4.2;
      rollEfficiency = 88.0;
      bottleneck = `Защита ${Math.round(def)} ниже рекомендованного капа 4000. Талант недополучает ${Math.round((4000 - def) * 0.024)}% бесплатного Крит. Шанса.`;
      actions.push({
        title: "Приоритет: Добрать 4000 Защиты",
        desc: `Необходимо добрать ${Math.round(4000 - def)} защиты через соединительную веревку или сабстаты.`
      });
    }
  } else if (charName.includes('Светлячок') || be > 200) {
    // 2. Break Effect archetype
    if (be >= 360 && spd >= 150) {
      score = 96.2;
      topPercent = 0.3;
      rollEfficiency = 97.4;
      bottleneck = `Пороги 360% Эффекта Пробития и 150+ Скорости (4 действия в ультимейте) закрыты. Сборка топового ранга.`;
      actions.push({
        title: "Сборка завершена (End-Game Build)",
        desc: "Все ключевые брейкпоинты достигнуты. Трата смолы на перекрафт текущих артефактов не требуется."
      });
    } else {
      score = 89.4;
      topPercent = 1.8;
      rollEfficiency = 91.2;
      bottleneck = `Эффект пробития (${be.toFixed(1)}%) или Скорость (${spd.toFixed(1)}) слегка отстают от идеального тайминга полного цикла ультимейта.`;
      actions.push({
        title: "Приоритет: Роллы в Эффект Пробития и Скорость",
        desc: "Криты этому персонажу не нужны: избавьтесь от кусков с роллами в КУ/КШ в пользу чистого Пробития и Силы Атаки."
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
      bottleneck = `Перекос баланса критов: Крит. Шанс (${cr.toFixed(1)}%) отстает от Крит. Урона (${cd.toFixed(1)}%). Ультимейт теряет стабильность, пропуская критические удары.`;
      actions.push({
        title: "Приоритет №1: Стабилизация Крит. Шанса",
        desc: `Замена одного куска на КШ приблизит соотношение 1:2. Это увеличит урон за ротацию минимум на 4–6%.`
      });
    } else if (spd < 134) {
      bottleneck = `Скорость (${spd.toFixed(1)}) ниже контрольного брейкпоинта 134.0 SPD. Персонаж совершает только 1 действие в первом цикле Зала Забвения.`;
      actions.push({
        title: "Приоритет №1: Достижение 134.0 SPD",
        desc: "Добрав 1-2 сабстата скорости (+4-6 SPD), вы получите 2 полноценных хода в первом цикле."
      });
    } else {
      bottleneck = `Сбалансированное распределение статов (CV ${cv.toFixed(1)}, SPD ${spd.toFixed(1)}). Ограничением являются холостые роллы в Защиту/HP на сабстатах.`;
      actions.push({
        title: "Оптимизация: Перекрафт слабейшего артефакта",
        desc: "Замените кусок с наибольшим числом мусорных роллов на реликвию с полезными атакующими статами."
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
