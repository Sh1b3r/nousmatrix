/**
 * Auto-detect locale based on user's region.
 * Default is English ('en'). Russian is used for Slavic locales ('ru', 'uk', 'be').
 * No manual language switcher (as requested).
 */
export function getDetectedLanguage() {
  if (typeof window === 'undefined' || !window.navigator) return 'en';
  const langs = window.navigator.languages || [window.navigator.language || 'en'];
  for (const l of langs) {
    const lower = (l || '').toLowerCase();
    if (lower.startsWith('ru') || lower.startsWith('uk') || lower.startsWith('be')) {
      return 'ru';
    }
  }
  return 'en';
}

export const translations = {
  en: {
    heroLabel: "Rigorous Stat Profiler",
    heroTitle: "Mathematical build validation without visual noise.",
    inputPlaceholder: "Enter account UID (e.g. 700142890)",
    btnAnalyze: "ANALYZE",
    btnAnalyzing: "ANALYZING...",
    guideHeading: "How character showcases work & how to refresh:",
    guideStep1Title: "1. In-game Showcase",
    guideStep1Desc: "Data is parsed directly from your public in-game profile. Go to Phone → Profile → Showcase Settings and select your character. Ensure 'Show Details' is turned ON.",
    guideStep2Title: "2. Server Cache Latency",
    guideStep2Desc: "Game servers refresh showcases with a 5–15 minute delay. After equipping new relics, teleport to another location and fully restart the game before re-analyzing.",
    rosterTitle: "ACCOUNT SHOWCASE (ROSTER)",
    rosterCharsSuffix: (count) => `${count} CHARACTER${count === 1 ? '' : 'S'}`,
    rosterHint: "Select character • Press ← on keyboard to return",
    btnBackUid: "← CHANGE UID (← Arrow)",
    btnTrophy: "TROPHY CARD (TOP 1%)",
    lvl: "Lv.",
    eidolons: "Eidolons: E",
    path: "Path: ",
    combatType: "Combat Type: ",
    superimposition: "Superimposition S",
    combatStatsTitle: "COMBAT ATTRIBUTES (IN-GAME)",
    basePlusBonus: "BASE + BONUS",
    relicsTitle: "EQUIPPED RELICS (6 SLOTS BREAKDOWN)",
    verifiedData: "VERIFIED IN-GAME DATA",
    weakPiece: "WEAKEST LINK",
    goldRelic: "5★ GOLD",
    rollSingle: "1 roll",
    rollsMulti: (count) => `${count} rolls`,
    setsTitle: "ACTIVE SET BONUSES",
    setsEmpty: "No active set bonuses",
    pc: "PC.",
    combatIndex: "COMBAT EFFICIENCY INDEX",
    matrix100: "MATRIX 100",
    rollEfficiency: "Roll Efficiency",
    critValue: "Crit Value (CV)",
    speedThreshold: "Speed Threshold (Action Value)",
    bottleneck: "BOTTLENECK",
    improvementPlan: "MATHEMATICAL IMPROVEMENT PLAN",
    copyTrophy: "COPY FOR DISCORD/TG",
    copied: "✓ COPIED!",
    verifiedBadge: "GLOBAL TOP",
    verifiedSuffix: "VALIDATED",
    verifiedBy: "VERIFIED BY NOUSMATRIX",
    relicSlots: [
      "Head",
      "Hands",
      "Body",
      "Feet",
      "Planar Sphere",
      "Link Rope"
    ],
    maxHp: "Max HP",
    atk: "ATK",
    def: "DEF",
    spd: "Speed (SPD)",
    critRate: "CRIT Rate",
    critDmg: "CRIT DMG",
    breakEffect: "Break Effect",
    err: "Energy Regen Rate",
    ehr: "Effect Hit Rate",
    effectRes: "Effect RES",
    fallbackAlert: (uid, nickname, fallbackUid) =>
      `UID ${uid} could not be resolved directly. Loaded verified showcase profile ${nickname} (${fallbackUid}).`,
    errorNoShowcase: "Could not retrieve character showcase. Please ensure showcase details are set to public in-game."
  },
  ru: {
    heroLabel: "Строгий аудит характеристик",
    heroTitle: "Математическая валидация билда без визуального шума.",
    inputPlaceholder: "Введите UID аккаунта (например: 700142890)",
    btnAnalyze: "АНАЛИЗИРОВАТЬ",
    btnAnalyzing: "АНАЛИЗ...",
    guideHeading: "Откуда берутся персонажи и как обновить сборку:",
    guideStep1Title: "1. Внутриигровая витрина (Showcase)",
    guideStep1Desc: "Данные считываются строго из открытого профиля в игре. Зайдите в Телефон → Профиль → Настройки витрины и выставьте нужных персонажей. Обязательно включите тумблер Показывать детали.",
    guideStep2Title: "2. Очистка серверного кэша",
    guideStep2Desc: "Сервера игры обновляют витрину с задержкой 5–15 минут. После экипировки нового сета телепортируйтесь в другую локацию и полностью перезапустите игру, прежде чем запускать повторный анализ.",
    rosterTitle: "ВИТРИНА АККАУНТА (SHOWCASE ROSTER)",
    rosterCharsSuffix: (count) => `${count} ПЕРСОНАЖ${count > 4 ? 'ЕЙ' : 'А'}`,
    rosterHint: "Выберите персонажа • Используйте ← на клавиатуре для возврата",
    btnBackUid: "← СМЕНИТЬ UID (Стрелочка ←)",
    btnTrophy: "ТРОФЕЙНАЯ КАРТОЧКА (TOP 1%)",
    lvl: "Ур.",
    eidolons: "Эйдолоны: E",
    path: "Путь: ",
    combatType: "Стихия: ",
    superimposition: "Наложение S",
    combatStatsTitle: "БОЕВЫЕ ХАРАКТЕРИСТИКИ (ИЗ ИГРЫ)",
    basePlusBonus: "БАЗА + БОНУС",
    relicsTitle: "РЕЛИКВИИ ПЕРСОНАЖА (ПОСЛОЙНЫЙ АНАЛИЗ 6 СЛОТОВ)",
    verifiedData: "АКТУАЛЬНЫЕ ДАННЫЕ",
    weakPiece: "СЛАБОЕ ЗВЕНО",
    goldRelic: "5★ GOLD",
    rollSingle: "1 ролл",
    rollsMulti: (count) => `${count} ролла`,
    setsTitle: "АКТИВНЫЕ НАБОРЫ РЕЛИКВИЙ",
    setsEmpty: "Наборы не активированы",
    pc: "ПРЕДМ.",
    combatIndex: "ИНДЕКС БОЕСПОСОБНОСТИ",
    matrix100: "МАТРИЦА 100",
    rollEfficiency: "Качество роллов (Roll Efficiency)",
    critValue: "Крит. масса (Crit Value / CV)",
    speedThreshold: "Скоростной порог (Action Value)",
    bottleneck: "УЗКОЕ МЕСТО (BOTTLENECK)",
    improvementPlan: "МАТЕМАТИЧЕСКИЙ ПЛАН УЛУЧШЕНИЙ",
    copyTrophy: "СКОПИРОВАТЬ ДЛЯ DISCORD/TG",
    copied: "✓ СКОПИРОВАНО!",
    verifiedBadge: "GLOBAL TOP",
    verifiedSuffix: "VALIDATED",
    verifiedBy: "VERIFIED BY NOUSMATRIX",
    relicSlots: [
      "Голова (Head)",
      "Руки (Hands)",
      "Тело (Body)",
      "Сапоги (Feet)",
      "Планарная сфера (Sphere)",
      "Соединительная веревка (Rope)"
    ],
    maxHp: "Макс. HP",
    atk: "Сила атаки",
    def: "Защита",
    spd: "Скорость (SPD)",
    critRate: "Крит. шанс",
    critDmg: "Крит. урон",
    breakEffect: "Эффект пробития",
    err: "Восст. энергии (ERR)",
    ehr: "Шанс попад. эффектов",
    effectRes: "Сопротивление эффектам",
    fallbackAlert: (uid, nickname, fallbackUid) =>
      `UID ${uid} не найден в открытой сети. Загружен проверенный профиль ${nickname} (${fallbackUid}).`,
    errorNoShowcase: "Не удалось получить витрину персонажей. Убедитесь, что витрина открыта в игре."
  }
};
