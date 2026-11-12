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

/**
 * Format raw stat names into official in-game terminology with standard abbreviations.
 */
export function formatStatName(rawName, lang = 'en') {
  if (!rawName) return '';
  const isRu = lang === 'ru';
  const s = String(rawName).trim();

  // ATK
  if (/^(Базовая сила атаки|Сила атаки|ATK|Base ATK)$/i.test(s)) {
    return isRu ? 'Сила атаки (АТК)' : 'ATK';
  }
  // HP
  if (/^(Базовое НР|НР|HP|Base HP|Max HP)$/i.test(s)) {
    return isRu ? 'Макс. HP (HP)' : 'HP';
  }
  // DEF
  if (/^(Базовая защита|Защита|DEF|Base DEF)$/i.test(s)) {
    return isRu ? 'Защита (ЗАЩ)' : 'DEF';
  }
  // SPD
  if (/^(Скорость|SPD|Speed)$/i.test(s)) {
    return isRu ? 'Скорость (СКОР)' : 'Speed (SPD)';
  }
  // CRIT Rate
  if (/^(Крит\.?\s*шанс|CRIT Rate|Critical Chance)$/i.test(s)) {
    return isRu ? 'Крит. шанс (КШ)' : 'CRIT Rate (CR)';
  }
  // CRIT DMG
  if (/^(Крит\.?\s*урон|CRIT DMG|Critical Damage)$/i.test(s)) {
    return isRu ? 'Крит. урон (КУ)' : 'CRIT DMG (CD)';
  }
  // Break Effect
  if (/^(Эффект пробития|Break Effect)$/i.test(s)) {
    return isRu ? 'Эфф. пробития (ЭП)' : 'Break Effect (BE)';
  }
  // Energy Regen Rate
  if (/^(Скорость восстановления энергии|Восст\.?\s*энергии|Energy Regen Rate|Energy Recovery)$/i.test(s)) {
    return isRu ? 'Восст. энергии (ВЭ)' : 'Energy Regen (ERR)';
  }
  // Effect Hit Rate
  if (/^(Шанс попадания эффектов|Шанс попад\.?\s*эфф\.?|Effect Hit Rate)$/i.test(s)) {
    return isRu ? 'Шанс попад. эфф. (ШПЭ)' : 'Effect Hit (EHR)';
  }
  // Effect RES
  if (/^(Сопротивление эффектам|Сопротивл\.?\s*эфф\.?|Effect RES|Status Resistance)$/i.test(s)) {
    return isRu ? 'Сопротивл. эфф. (СЭ)' : 'Effect RES (RES)';
  }
  // Outgoing Healing
  if (/^(Бонус исцеления|Исходящее исцеление|Исцеление|Outgoing Healing Boost|Heal Ratio)$/i.test(s)) {
    return isRu ? 'Исходящее исцел.' : 'Outgoing Healing';
  }
  // Max Energy
  if (/^(Макс\.?\s*энергия|Max Energy|Max SP)$/i.test(s)) {
    return isRu ? 'Макс. энергия' : 'Max Energy';
  }

  // Elements
  if (/физическ|physical/i.test(s)) return isRu ? 'Физ. урон' : 'Physical DMG';
  if (/огнен|fire/i.test(s)) return isRu ? 'Огн. урон' : 'Fire DMG';
  if (/ледян|ice/i.test(s)) return isRu ? 'Лед. урон' : 'Ice DMG';
  if (/электрическ|молни|lightning|thunder/i.test(s)) return isRu ? 'Электр. урон' : 'Lightning DMG';
  if (/ветрян|wind/i.test(s)) return isRu ? 'Ветр. урон' : 'Wind DMG';
  if (/квантов|quantum/i.test(s)) return isRu ? 'Квант. урон' : 'Quantum DMG';
  if (/мним|imaginary/i.test(s)) return isRu ? 'Мним. урон' : 'Imaginary DMG';

  return s;
}

export const translations = {
  en: {
    heroTitle: "NousMatrix",
    inputPlaceholder: "Enter 9-digit account UID (e.g. 700142890)",
    btnAnalyze: "ANALYZE PROFILE",
    btnAnalyzing: "FETCHING GAME DATA...",
    guideHeading: "How in-game showcase data works & how to refresh:",
    guideStep1Title: "1. Public In-game Showcase",
    guideStep1Desc: "Data is queried live from official Hoyoverse game servers. Open Phone → Profile → Showcase Settings, place your characters and ensure 'Show Details' is turned ON.",
    guideStep2Title: "2. Server Sync Latency",
    guideStep2Desc: "Game servers cache showcases for 5–15 minutes. After equipping new relics or changing characters, teleport to another map and restart your game before re-analyzing.",
    rosterTitle: "SHOWCASE CHARACTERS",
    rosterCharsSuffix: (count) => {
      return `${count} ${count === 1 ? 'CHARACTER' : 'CHARACTERS'}`;
    },
    rosterHint: "Select character • Press ← or Escape to return to UID",
    btnBackUid: "CHANGE UID (← Arrow)",
    btnTrophy: "BUILD CARD",
    buildCardTitle: "BUILD CARD",
    lvl: "Lv.",
    eidolons: "Eidolon E",
    path: "Path: ",
    combatType: "Type: ",
    superimposition: "Superimposition S",
    combatStatsTitle: "IN-GAME COMBAT ATTRIBUTES",
    basePlusBonus: "BASE + BONUS = TOTAL",
    relicsTitle: "EQUIPPED RELICS (6 SLOTS)",
    cavernRelicsTitle: "CAVERN RELICS (4 PIECES)",
    planarRelicsTitle: "PLANAR ORNAMENTS (2 PIECES)",
    cavernAuditTitle: "CAVERN RELICS BREAKDOWN",
    cavernSetComplete: "SET BONUS ACTIVE",
    cavernSetBroken: "BROKEN CAVERN SET",
    cavernRollQuality: "Cavern Relics Roll Quality (Head + Hands + Body + Feet)",
    cavernCv: "Cavern Crit Value (Cavern CV)",
    planarAuditTitle: "PLANAR ORNAMENTS BREAKDOWN",
    planarSetComplete: "2/2 SET ACTIVE",
    planarSetBroken: "1/2 BROKEN SET",
    planarRollQuality: "Planar Roll Quality",
    planarCv: "Planar Crit Value (CV)",
    verifiedData: "OFFICIAL LIVE DATA",
    weakPiece: "WORST RELIC",
    goldRelic: "5★ GOLD",
    rollTag: (upgrades) => `+${upgrades || 0}`,
    setsTitle: "ACTIVE RELIC SETS",
    setsEmpty: "No 2-Pc or 4-Pc bonuses active",
    pc2: "2-Pc",
    pc4: "4-Pc",
    pc: "Pc.",
    combatIndex: "COMBAT EFFICIENCY INDEX",
    matrix100: "MATRIX 100",
    rollEfficiency: "Roll Quality (Roll Efficiency)",
    critValue: "Crit Value (CV)",
    speedThreshold: "Speed Breakpoint (134.0 SPD)",
    bottleneck: "BOTTLENECK ANALYSIS",
    improvementPlan: "ACTIONABLE IMPROVEMENT PLAN",
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
    // Stats
    maxHp: "Max HP (HP)",
    atk: "ATK",
    def: "DEF",
    spd: "Speed (SPD)",
    critRate: "CRIT Rate (CR)",
    critDmg: "CRIT DMG (CD)",
    breakEffect: "Break Effect (BE)",
    healRate: "Outgoing Healing",
    maxEnergy: "Max Energy",
    err: "Energy Regen (ERR)",
    ehr: "Effect Hit (EHR)",
    effectRes: "Effect RES (RES)",
    // Errors & Notices
    errNotFound: (uid) => `Player with UID ${uid} was not found on official Honkai: Star Rail servers. Please check your UID.`,
    errHidden: (nickname) => `Showcase profile for ${nickname || 'player'} is currently hidden or has no characters. Please enable "Show Details" in Phone → Profile Settings in-game.`,
    errGeneric: "Unable to retrieve showcase. Ensure game servers are accessible and your profile is public.",
    demoBtnText: "View Demo Profile (UID 700142890)"
  },
  ru: {
    heroTitle: "NousMatrix",
    inputPlaceholder: "Введите 9-значный UID аккаунта",
    btnAnalyze: "АНАЛИЗИРОВАТЬ",
    btnAnalyzing: "ЗАГРУЗКА ИЗ ИГРЫ...",
    guideHeading: "Как работает внутриигровая витрина и как обновить сборку:",
    guideStep1Title: "1. Открытая витрина в игре",
    guideStep1Desc: "Данные поступают напрямую с официальных игровых серверов Hoyoverse. Откройте Телефон → Профиль → Настройки витрины, выставьте персонажей и включите тумблер «Отображать подробности».",
    guideStep2Title: "2. Задержка обновления серверов",
    guideStep2Desc: "Сервера игры кэшируют витрину с задержкой 5–15 минут. После смены реликвий телепортируйтесь в другую локацию и перезапустите игру, прежде чем обновлять страницу.",
    rosterTitle: "ВИТРИНА АККАУНТА",
    rosterCharsSuffix: (count) => {
      const rem10 = count % 10;
      const rem100 = count % 100;
      if (rem10 === 1 && rem100 !== 11) return `${count} ПЕРСОНАЖ`;
      if (rem10 >= 2 && rem10 <= 4 && (rem100 < 10 || rem100 >= 20)) return `${count} ПЕРСОНАЖА`;
      return `${count} ПЕРСОНАЖЕЙ`;
    },
    btnBackUid: "СМЕНИТЬ UID",
    btnTrophy: "БИЛД-КАРТА",
    buildCardTitle: "БИЛД-КАРТОЧКА",
    lvl: "Ур.",
    eidolons: "Эйдолон E",
    path: "Путь: ",
    combatType: "Стихия: ",
    superimposition: "Наложение S",
    combatStatsTitle: "БОЕВЫЕ ХАРАКТЕРИСТИКИ (ИЗ ИГРЫ)",
    basePlusBonus: "БАЗА + БОНУС = ИТОГО",
    relicsTitle: "ЭКИПИРОВАННЫЕ РЕЛИКВИИ (6 СЛОТОВ)",
    cavernRelicsTitle: "ПЕЩЕРНЫЕ РЕЛИКВИИ (4 ПРЕДМЕТА)",
    planarRelicsTitle: "ПЛАНАРНЫЕ УКРАШЕНИЯ (2 ПРЕДМЕТА)",
    cavernAuditTitle: "ПОДСЧЁТ ПЕЩЕРНЫХ РЕЛИКВИЙ",
    cavernSetComplete: "КОМПЛЕКТ АКТИВЕН",
    cavernSetBroken: "РАЗОРВАННЫЙ СЕТ",
    cavernRollQuality: "Качество роллов пещерных сетов (Голова + Руки + Тело + Сапоги)",
    cavernCv: "Крит. масса пещерных сетов (Cavern CV)",
    planarAuditTitle: "ПОДСЧЁТ ПЛАНАРОК",
    planarSetComplete: "2/2 СЕТ АКТИВЕН",
    planarSetBroken: "1/2 РАЗОРВАННЫЙ СЕТ",
    planarRollQuality: "Качество роллов планарок (Сфера + Вервь)",
    planarCv: "Крит. масса планарок (Planar CV)",
    weakPiece: "ХУДШИЙ АРТЕФАКТ",
    goldRelic: "5★ РЕЛИКВИЯ",
    rollTag: (upgrades) => `+${upgrades || 0}`,
    setsTitle: "АКТИВНЫЕ НАБОРЫ РЕЛИКВИЙ",
    setsEmpty: "Нет активных бонусов 2 или 4 предметов",
    pc2: "2 предм.",
    pc4: "4 предм.",
    pc: "предм.",
    combatIndex: "ИНДЕКС БОЕСПОСОБНОСТИ",
    matrix100: "МАТРИЦА 100",
    rollEfficiency: "Качество роллов (Roll Efficiency)",
    critValue: "Крит. масса (Crit Value / CV)",
    speedThreshold: "Порог скорости (134.0 SPD)",
    bottleneck: "АНАЛИЗ УЗКИХ МЕСТ (BOTTLENECK)",
    improvementPlan: "МАТЕМАТИЧЕСКИЙ ПЛАН УЛУЧШЕНИЙ",
    copyTrophy: "СКОПИРОВАТЬ ДЛЯ DISCORD/TG",
    copied: "✓ СКОПИРОВАНО!",
    verifiedBadge: "GLOBAL TOP",
    verifiedSuffix: "VALIDATED",
    verifiedBy: "VERIFIED BY NOUSMATRIX",
    relicSlots: [
      "Голова",
      "Руки",
      "Тело",
      "Ноги",
      "Планарная сфера",
      "Соединительная вервь"
    ],
    // Stats
    maxHp: "Макс. HP (HP)",
    atk: "Сила атаки (АТК)",
    def: "Защита (ЗАЩ)",
    spd: "Скорость (СКОР)",
    critRate: "Крит. шанс (КШ)",
    critDmg: "Крит. урон (КУ)",
    breakEffect: "Эфф. пробития (ЭП)",
    healRate: "Исходящее исцел.",
    maxEnergy: "Макс. энергия",
    err: "Восст. энергии (ВЭ)",
    ehr: "Шанс попад. эфф. (ШПЭ)",
    effectRes: "Сопротивл. эфф. (СЭ)",
    // Errors & Notices
    errNotFound: (uid) => `Игрок с UID ${uid} не найден на официальных серверах Honkai: Star Rail. Проверьте правильность введенного UID.`,
    errHidden: (nickname) => `Витрина персонажей игрока ${nickname || ''} скрыта или пуста. Включите «Отображать подробности» в игре: Телефон → Профиль → Настройки витрины.`,
    errGeneric: "Не удалось загрузить витрину из игры. Убедитесь, что сервера доступны и витрина открыта.",
    demoBtnText: "Открыть проверенный демо-профиль (UID 700142890)"
  }
};
