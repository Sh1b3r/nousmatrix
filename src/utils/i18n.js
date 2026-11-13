export function getDetectedLanguage() {
  if (typeof window === "undefined" || !window.navigator) return "en";
  const langs = window.navigator.languages || [window.navigator.language || "en"];
  for (const l of langs) {
    const lower = (l || "").toLowerCase();
    if (lower.startsWith("ru") || lower.startsWith("uk") || lower.startsWith("be")) {
      return "ru";
    }
  }
  return "en";
}
export function formatStatName(rawName, lang = "en") {
  if (!rawName) return "";
  const isRu = lang === "ru";
  const s = String(rawName).trim();
  // Enka/MiHoMo expose stable machine identifiers in relic fields. Translate
  // those before trying the human-readable labels returned by the API.
  const field = s.toLowerCase().replace(/[\s-]+/g, "_");
  const fieldLabels = {
    atk: ["Сила атаки (АТК)", "ATK"], hp: ["Макс. HP (HP)", "HP"],
    def: ["Защита (ЗАЩ)", "DEF"], spd: ["Скорость (СКОР)", "Speed (SPD)"],
    crit_rate: ["Крит. шанс (КШ)", "CRIT Rate (CR)"],
    crit_dmg: ["Крит. урон (КУ)", "CRIT DMG (CD)"],
    break_dmg: ["Эфф. пробития (ЭП)", "Break Effect (BE)"],
    break_effect: ["Эфф. пробития (ЭП)", "Break Effect (BE)"],
    sp_rate: ["Восст. энергии (ВЭ)", "Energy Regen (ERR)"],
    energy_regen_rate: ["Восст. энергии (ВЭ)", "Energy Regen (ERR)"],
    effect_hit: ["Шанс попад. эфф. (ШПЭ)", "Effect Hit (EHR)"],
    effect_res: ["Сопротивл. эфф. (СЭ)", "Effect RES (RES)"],
    heal: ["Исходящее исцел.", "Outgoing Healing"],
    heal_rate: ["Исходящее исцел.", "Outgoing Healing"],
    physical_dmg: ["Физ. урон", "Physical DMG"],
    fire_dmg: ["Огн. урон", "Fire DMG"],
    ice_dmg: ["Лед. урон", "Ice DMG"],
    thunder_dmg: ["Электр. урон", "Lightning DMG"],
    lightning_dmg: ["Электр. урон", "Lightning DMG"],
    wind_dmg: ["Ветр. урон", "Wind DMG"],
    quantum_dmg: ["Квант. урон", "Quantum DMG"],
    imaginary_dmg: ["Мним. урон", "Imaginary DMG"],
    all_dmg: ["Бонус урона", "DMG Bonus"],
    elation: ["Веселье", "Elation"]
  };
  if (fieldLabels[field]) return fieldLabels[field][isRu ? 0 : 1];
  if (/^(Базовая сила атаки|Сила атаки|ATK|Base ATK)$/i.test(s)) {
    return isRu ? "Сила атаки (АТК)" : "ATK";
  }
  if (/^(Базовое НР|НР|HP|Base HP|Max HP)$/i.test(s)) {
    return isRu ? "Макс. HP (HP)" : "HP";
  }
  if (/^(Базовая защита|Защита|DEF|Base DEF)$/i.test(s)) {
    return isRu ? "Защита (ЗАЩ)" : "DEF";
  }
  if (/^(Скорость|SPD|Speed)$/i.test(s)) {
    return isRu ? "Скорость (СКОР)" : "Speed (SPD)";
  }
  if (/^(Крит\.?\s*шанс|CRIT Rate|Critical Chance)$/i.test(s)) {
    return isRu ? "Крит. шанс (КШ)" : "CRIT Rate (CR)";
  }
  if (/^(Крит\.?\s*урон|CRIT DMG|Critical Damage)$/i.test(s)) {
    return isRu ? "Крит. урон (КУ)" : "CRIT DMG (CD)";
  }
  if (/^(Эффект пробития|Break Effect)$/i.test(s)) {
    return isRu ? "Эфф. пробития (ЭП)" : "Break Effect (BE)";
  }
  if (/^(Скорость восстановления энергии|Восст\.?\s*энергии|Energy Regen Rate|Energy Recovery)$/i.test(s)) {
    return isRu ? "Восст. энергии (ВЭ)" : "Energy Regen (ERR)";
  }
  if (/^(Шанс попадания эффектов|Шанс попад\.?\s*эфф\.?|Effect Hit Rate)$/i.test(s)) {
    return isRu ? "Шанс попад. эфф. (ШПЭ)" : "Effect Hit (EHR)";
  }
  if (/^(Сопротивление эффектам|Сопротивл\.?\s*эфф\.?|Effect RES|Status Resistance)$/i.test(s)) {
    return isRu ? "Сопротивл. эфф. (СЭ)" : "Effect RES (RES)";
  }
  if (/^(Бонус исцеления|Исходящее исцеление|Исцеление|Outgoing Healing Boost|Heal Ratio)$/i.test(s)) {
    return isRu ? "Исходящее исцел." : "Outgoing Healing";
  }
  if (/^(Макс\.?\s*энергия|Max Energy|Max SP)$/i.test(s)) {
    return isRu ? "Макс. энергия" : "Max Energy";
  }
  if (/физическ|physical/i.test(s)) return isRu ? "Физ. урон" : "Physical DMG";
  if (/огнен|fire/i.test(s)) return isRu ? "Огн. урон" : "Fire DMG";
  if (/ледян|ice/i.test(s)) return isRu ? "Лед. урон" : "Ice DMG";
  if (/электрическ|молни|lightning|thunder/i.test(s)) return isRu ? "Электр. урон" : "Lightning DMG";
  if (/ветрян|wind/i.test(s)) return isRu ? "Ветр. урон" : "Wind DMG";
  if (/квантов|quantum/i.test(s)) return isRu ? "Квант. урон" : "Quantum DMG";
  if (/мним|imaginary/i.test(s)) return isRu ? "Мним. урон" : "Imaginary DMG";
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
    rosterTitle: "Showcase Characters",
    rosterCharsSuffix: (count) => {
      return `${count} ${count === 1 ? "character" : "characters"}`;
    },
    rosterHint: "Select character • Press ← or Escape to return to UID",
    btnBackUid: "Change UID",
    btnTrophy: "Build Card",
    buildCardTitle: "Build Card",
    lvl: "Lv.",
    eidolons: "Eidolon E",
    path: "Path: ",
    combatType: "Type: ",
    superimposition: "Superimposition S",
    combatStatsTitle: "Combat Attributes",
    basePlusBonus: "Base + bonus = total",
    relicsTitle: "Equipped Relics (6 slots)",
    cavernRelicsTitle: "Cavern Relics (4 pieces)",
    planarRelicsTitle: "Planar Ornaments (2 pieces)",
    cavernAuditTitle: "Cavern Relics Breakdown",
    cavernSetComplete: "Set Bonus Active",
    cavernSetBroken: "Broken Cavern Set",
    cavernRollQuality: "Cavern Relics Roll Quality (Head + Hands + Body + Feet)",
    cavernCv: "Cavern Crit Value (Cavern CV)",
    planarAuditTitle: "Planar Ornaments Breakdown",
    planarSetComplete: "2/2 Set Active",
    planarSetBroken: "1/2 Broken Set",
    planarRollQuality: "Planar Roll Quality",
    planarCv: "Planar Crit Value (CV)",
    verifiedData: "Official Live Data",
    weakPiece: "Worst Relic",
    goldRelic: "5★ Gold",
    rollTag: (upgrades) => `+${upgrades || 0}`,
    setsTitle: "Active Relic Sets",
    setsEmpty: "No 2-Pc or 4-Pc bonuses active",
    pc2: "2-Pc",
    pc4: "4-Pc",
    pc: "Pc.",
    combatIndex: "Combat Efficiency Index",
    matrix100: "Matrix 100",
    rollEfficiency: "Roll Quality (Roll Efficiency)",
    critValue: "Crit Value (CV)",
    speedThreshold: "Speed Breakpoint (134.0 SPD)",
    bottleneck: "Bottleneck Analysis",
    improvementPlan: "Actionable Improvement Plan",
    copyTrophy: "Copy for Discord/TG",
    copied: "✓ Copied!",
    verifiedBadge: "Global Top",
    verifiedSuffix: "Validated",
    verifiedBy: "Verified from HSR",
    relicSlots: [
      "Head",
      "Hands",
      "Body",
      "Feet",
      "Planar Sphere",
      "Link Rope"
    ],

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

    errNotFound: (uid) => `Player with UID ${uid} was not found on official Honkai: Star Rail servers. Please check your UID.`,
    errHidden: (nickname) => `Showcase profile for ${nickname || "player"} is currently hidden or has no characters. Please enable "Show Details" in Phone → Profile Settings in-game.`,
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
    rosterTitle: "Витрина аккаунта",
    rosterCharsSuffix: (count) => {
      const rem10 = count % 10;
      const rem100 = count % 100;
      if (rem10 === 1 && rem100 !== 11) return `${count} персонаж`;
      if (rem10 >= 2 && rem10 <= 4 && (rem100 < 10 || rem100 >= 20)) return `${count} персонажа`;
      return `${count} персонажей`;
    },
    btnBackUid: "Сменить UID",
    btnTrophy: "Билд карточка",
    buildCardTitle: "Билд карточка",
    lvl: "Ур.",
    eidolons: "Эйдолон E",
    path: "Путь: ",
    combatType: "Стихия: ",
    superimposition: "Наложение S",
    combatStatsTitle: "Боевые характеристики",
    basePlusBonus: "База + бонус = итог",
    relicsTitle: "Экипированные реликвии (6 слотов)",
    cavernRelicsTitle: "Пещерные реликвии (4 предмета)",
    planarRelicsTitle: "Планарные украшения (2 предмета)",
    cavernAuditTitle: "Подсчёт пещерных реликвий",
    cavernSetComplete: "Комплект активен",
    cavernSetBroken: "Разорванный сет",
    cavernRollQuality: "Качество роллов пещерных сетов (Голова + Руки + Тело + Сапоги)",
    cavernCv: "Крит. масса пещерных сетов (Cavern CV)",
    planarAuditTitle: "Подсчёт планарок",
    planarSetComplete: "2/2 сет активен",
    planarSetBroken: "1/2 разорванный сет",
    planarRollQuality: "Качество роллов планарок (Сфера + Вервь)",
    planarCv: "Крит. масса планарок (Planar CV)",
    weakPiece: "Худший артефакт",
    goldRelic: "5★ реликвия",
    rollTag: (upgrades) => `+${upgrades || 0}`,
    setsTitle: "Активные наборы реликвий",
    setsEmpty: "Нет активных бонусов 2 или 4 предметов",
    pc2: "2 предм.",
    pc4: "4 предм.",
    pc: "предм.",
    combatIndex: "Индекс боеспособности",
    matrix100: "Матрица 100",
    rollEfficiency: "Качество роллов (Roll Efficiency)",
    critValue: "Крит. масса (Crit Value / CV)",
    speedThreshold: "Порог скорости (134.0 SPD)",
    bottleneck: "Анализ узких мест",
    improvementPlan: "План улучшений билда",
    copyTrophy: "Скопировать для Discord/TG",
    copied: "✓ Скопировано!",
    verifiedBadge: "Global Top",
    verifiedSuffix: "Validated",
    verifiedBy: "Данные из игры HSR",
    relicSlots: [
      "Голова",
      "Руки",
      "Тело",
      "Ноги",
      "Планарная сфера",
      "Соединительная вервь"
    ],

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

    errNotFound: (uid) => `Игрок с UID ${uid} не найден на официальных серверах Honkai: Star Rail. Проверьте правильность введенного UID.`,
    errHidden: (nickname) => `Витрина персонажей игрока ${nickname || ""} скрыта или пуста. Включите «Отображать подробности» в игре: Телефон → Профиль → Настройки витрины.`,
    errGeneric: "Не удалось загрузить витрину из игры. Убедитесь, что сервера доступны и витрина открыта.",
    demoBtnText: "Открыть проверенный демо-профиль (UID 700142890)"
  }
};
