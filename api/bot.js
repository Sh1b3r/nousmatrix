import { calculateCharacterAudit } from '../src/utils/audit.js';

// Кеш даних гравців та пасивок світлових конусів
const dataCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 хв
const userLangPreferences = new Map(); // ручне перемикання мови користувачем
const coneRanksCache = { ru: null, en: null };

// ─────────────────────────────────────────────────────────────
// МОВНА СИСТЕМА (ОФІЦІЙНІ ЛОКАЛІЗАЦІЇ ІЗ ГРИ)
// ─────────────────────────────────────────────────────────────

function detectUserLang(from, chatId) {
  // 1. Ручний вибір користувача в чаті має найвищий пріоритет
  if (chatId && userLangPreferences.has(chatId)) {
    return userLangPreferences.get(chatId);
  }

  // 2. Автоматичне визначення за регіоном (як на сайті):
  // Оскільки в грі немає офіційної української локалізації, для регіонів uk/ru/be
  // використовується офіційний переклад з клієнта гри (ru), а для решти світу — (en).
  const code = (from?.language_code || '').toLowerCase();
  if (code.startsWith('ru') || code.startsWith('uk') || code.startsWith('be')) {
    return 'ru';
  }
  return 'en';
}

const I18N = {
  ru: {
    welcomeTitle: 'Добро пожаловать в Honkai: Star Rail бота!',
    welcomeDesc: 'Отправь мне <b>UID</b> своего аккаунта (например: <code>700123456</code>).\n\nТы сможешь просматривать:\n• 👥 <b>Персонажей с витрины</b>\n• 🎯 <b>Индекс боеспособности сборки (/100) и оценку</b>\n• 📊 <b>Боевые характеристики (HP, Сила атаки, Крит. шанс/урон, Скорость)</b>\n• 🛡 <b>Реликвии (сабстаты в столбик) и бонусы наборов</b>\n• 🗡 <b>Световые конусы с полным описанием пассивного навыка</b>\n• 🔮 <b>Уровни следов и навыков</b>',
    trailblazer: 'Первопроходец',
    level: 'Уровень',
    equilibrium: 'Равновесие',
    achievements: 'Достижений',
    status: 'Статус',
    noSignature: '(без подписи)',
    noChars: 'На витрине нет открытых персонажей или они скрыты в настройках игры.',
    chooseChar: 'Выберите персонажа для просмотра:',
    refreshBtn: '🔄 Обновить данные',
    langBtn: '🌐 Язык: 🇷🇺 (Оригинал)',
    path: 'Путь',
    element: 'Стихия',
    cone: 'Световой конус',
    notEquipped: 'Не экипирован',
    activeSets: 'Бонусы наборов:',
    noSets: 'Наборы не собраны',
    chooseSection: 'Выберите раздел характеристик:',
    combatIndex: 'Индекс боеспособности:',
    rollEff: 'Эффективность роллов:',
    critValue: 'Крит. масса (CV):',
    statsBtn: '📊 Характеристики',
    relicsBtn: '🛡 Реликвии',
    coneBtn: '🗡 Световой конус',
    skillsBtn: '🔮 Следы и навыки',
    backToChars: '◀️ К списку персонажей',
    backToChar: '◀️ К персонажу',
    backToList: '👥 К списку',
    statsTitle: 'Боевые характеристики:',
    relicsTitle: 'Реликвии и наборы:',
    noRelics: 'Реликвии отсутствуют или не экипированы.',
    mainStat: 'Главный стат:',
    subStats: 'Сабстаты:',
    activeSetsBonus: 'Активные бонусы наборов:',
    coneTitle: 'Световой конус:',
    rarity: 'Редкость:',
    superimposition: 'Наложение:',
    passiveSkill: 'Пассивный навык:',
    coneBaseStats: 'Базовые показатели конуса:',
    skillsTitle: 'Следы и навыки:',
    noSkills: 'Данные о навыках недоступны.',
    lvl: 'Ур.',
    fetching: 'Загружаю данные для UID',
    notFound: 'Аккаунт с указанным UID не найден на серверах игры. Проверьте номер UID.',
    serverError: 'Произошла ошибка при обращении к серверам игры. Попробуйте снова через минуту.',
    invalidUid: 'Пожалуйста, отправьте числовой <b>UID</b> (например: <code>700123456</code>).'
  },
  en: {
    welcomeTitle: 'Welcome to Honkai: Star Rail Bot!',
    welcomeDesc: 'Send me your account <b>UID</b> (e.g. <code>700123456</code>).\n\nYou can easily inspect:\n• 👥 <b>Showcase Characters</b>\n• 🎯 <b>Combat Readiness Index (/100) & Grade</b>\n• 📊 <b>Combat Stats (HP, ATK, CRIT, Speed, etc.)</b>\n• 🛡 <b>Relics (column substats) & Set Bonuses</b>\n• 🗡 <b>Light Cones with full passive skill effect</b>\n• 🔮 <b>Trace & Skill levels</b>',
    trailblazer: 'Trailblazer',
    level: 'Level',
    equilibrium: 'Equilibrium',
    achievements: 'Achievements',
    status: 'Status',
    noSignature: '(no status)',
    noChars: 'No showcase characters available or profile is hidden in game settings.',
    chooseChar: 'Choose a character to inspect:',
    refreshBtn: '🔄 Refresh data',
    langBtn: '🌐 Lang: 🇬🇧 (Official)',
    path: 'Path',
    element: 'Combat Type',
    cone: 'Light Cone',
    notEquipped: 'Not equipped',
    activeSets: 'Active Set Bonuses:',
    noSets: 'No set bonuses active',
    chooseSection: 'Select a section below:',
    combatIndex: 'Combat Index:',
    rollEff: 'Roll Efficiency:',
    critValue: 'Crit Value (CV):',
    statsBtn: '📊 Combat Stats',
    relicsBtn: '🛡 Relics',
    coneBtn: '🗡 Light Cone',
    skillsBtn: '🔮 Traces & Skills',
    backToChars: '◀️ Back to Roster',
    backToChar: '◀️ Back to Character',
    backToList: '👥 Back to Roster',
    statsTitle: 'Combat Stats:',
    relicsTitle: 'Relics & Sets:',
    noRelics: 'No relics equipped.',
    mainStat: 'Main Stat:',
    subStats: 'Substats:',
    activeSetsBonus: 'Active Set Bonuses:',
    coneTitle: 'Light Cone:',
    rarity: 'Rarity:',
    superimposition: 'Superimposition:',
    passiveSkill: 'Passive Skill:',
    coneBaseStats: 'Light Cone Base Stats:',
    skillsTitle: 'Traces & Skills:',
    noSkills: 'Skill data is not available.',
    lvl: 'Lv.',
    fetching: 'Fetching data for UID',
    notFound: 'Account with this UID was not found on game servers. Please check your UID.',
    serverError: 'An error occurred fetching game data. Please try again shortly.',
    invalidUid: 'Please send a valid numeric <b>UID</b> (e.g. <code>700123456</code>).'
  },
  uk: {
    welcomeTitle: 'Вітаю у Honkai: Star Rail боті!',
    welcomeDesc: 'Надішли мені <b>UID</b> свого акаунту (наприклад: <code>700123456</code>).\n\nТи зможеш зручно переглядати:\n• 👥 <b>Персонажів з вітрини</b>\n• 🎯 <b>Індекс боєздатності білда (/100) та оцінку</b>\n• 📊 <b>Характеристики (HP, ATK, Крит. шанс/шкода, Швидкість)</b>\n• 🛡 <b>Реліквії (сабстати в стовпчик) та бонуси сетів</b>\n• 🗡 <b>Світлові конуси з повною пасивною навичкою</b>\n• 🔮 <b>Рівні слідів та навичок</b>',
    trailblazer: 'Першопроходець',
    level: 'Рівень',
    equilibrium: 'Рівновага',
    achievements: 'Досягнень',
    status: 'Статус',
    noSignature: '(без підпису)',
    noChars: 'На вітрині немає відкритих персонажів або вони приховані в налаштуваннях гри.',
    chooseChar: 'Оберіть персонажа для перегляду:',
    refreshBtn: '🔄 Оновити дані',
    langBtn: '🌐 Мова: 🇺🇦',
    path: 'Шлях',
    element: 'Стихія',
    cone: 'Конус',
    notEquipped: 'Не встановлено',
    activeSets: 'Бонуси сетів:',
    noSets: 'Сети не зібрано',
    chooseSection: 'Оберіть розділ характеристик нижче:',
    combatIndex: 'Індекс боєздатності:',
    rollEff: 'Ефективність ролів:',
    critValue: 'Крит-маса (CV):',
    statsBtn: '📊 Характеристики',
    relicsBtn: '🛡 Реліквії',
    coneBtn: '🗡 Світловий конус',
    skillsBtn: '🔮 Сліди та навички',
    backToChars: '◀️ До списку персонажів',
    backToChar: '◀️ До персонажа',
    backToList: '👥 До списку',
    statsTitle: 'Характеристики:',
    relicsTitle: 'Реліквії та сети:',
    noRelics: 'Реліквії відсутні або не екіпіровані.',
    mainStat: 'Головний стат:',
    subStats: 'Сабстати:',
    activeSetsBonus: 'Активні бонуси сетів:',
    coneTitle: 'Світловий конус:',
    rarity: 'Рідкість:',
    superimposition: 'Накладання:',
    passiveSkill: 'Пасивна навичка:',
    coneBaseStats: 'Базові показники конуса:',
    skillsTitle: 'Сліди та навички:',
    noSkills: 'Дані про навички недоступні.',
    lvl: 'Ур.',
    fetching: 'Завантажую дані для UID',
    notFound: 'Акаунт із вказаним UID не знайдено на серверах гри. Перевірте номер UID.',
    serverError: 'Сталася помилка при завантаженні даних з серверів гри. Спробуйте ще раз через хвилину.',
    invalidUid: 'Будь ласка, надішліть числовий <b>UID</b> (наприклад: <code>700123456</code>).'
  }
};

const SLOT_NAMES = {
  ru: { 1: '👑 Голова', 2: '🧤 Руки', 3: '👕 Тело', 4: '👟 Ноги (Сапоги)', 5: '🔮 Планарная сфера', 6: '🎗 Соединительная вервь' },
  en: { 1: '👑 Head', 2: '🧤 Hands', 3: '👕 Body', 4: '👟 Feet (Boots)', 5: '🔮 Planar Sphere', 6: '🎗 Link Rope' },
  uk: { 1: '👑 Голова', 2: '🧤 Руки', 3: '👕 Тіло', 4: '👟 Ноги (Черевики)', 5: '🔮 Планарна сфера', 6: '🎗 З\'єднувальна мотузка' }
};

// ─────────────────────────────────────────────────────────────
// ЗАВАНТАЖЕННЯ ОФІЦІЙНИХ ДАНИХ ТА ПАСИВОК ІЗ КЛІЄНТА ГРИ
// ─────────────────────────────────────────────────────────────

async function getConeRanks(lang = 'ru') {
  const target = lang === 'en' ? 'en' : 'ru';
  if (coneRanksCache[target]) return coneRanksCache[target];
  try {
    const res = await fetch(`https://cdn.jsdelivr.net/gh/Mar-7th/StarRailRes@master/index_min/${target}/light_cone_ranks.json`);
    if (res.ok) {
      coneRanksCache[target] = await res.json();
    }
  } catch (e) {
    console.error(`Failed to load ${target} cone ranks:`, e);
  }
  return coneRanksCache[target] || {};
}

function formatConeSkill(coneData, rank = 1) {
  if (!coneData || !coneData.desc) return null;
  const rankIdx = Math.min(Math.max((rank || 1) - 1, 0), (coneData.params?.length || 1) - 1);
  const params = coneData.params?.[rankIdx] || [];

  let desc = coneData.desc;
  params.forEach((val, i) => {
    const pNum = i + 1;
    desc = desc.replace(new RegExp(`#${pNum}\\[i\\]%`, 'g'), `${Math.round(val * 100)}%`);
    desc = desc.replace(new RegExp(`#${pNum}\\[f\\d+\\]%`, 'g'), `${(val * 100).toFixed(1).replace(/\.0$/, '')}%`);
    desc = desc.replace(new RegExp(`#${pNum}\\[i\\]`, 'g'), `${Math.round(val)}`);
    desc = desc.replace(new RegExp(`#${pNum}\\[f\\d+\\]`, 'g'), `${val}`);
    desc = desc.replace(new RegExp(`#${pNum}`, 'g'), `${val}`);
  });

  return {
    skill: coneData.skill || '',
    desc: desc.replace(/<[^>]+>/g, '')
  };
}

function getCombatGrade(scoreNum, lang = 'ru') {
  const s = parseFloat(scoreNum) || 0;
  const labels = {
    ru: { SSS: 'Элитный билд', SS: 'Отличный билд', S: 'Хороший билд', A: 'Рабочий билд', B: 'Базовый билд', C: 'Требует прокачки' },
    en: { SSS: 'Elite Build', SS: 'Great Build', S: 'Good Build', A: 'Decent Build', B: 'Basic Build', C: 'Needs Upgrade' },
    uk: { SSS: 'Елітний білд', SS: 'Відмінний білд', S: 'Добрий білд', A: 'Робочий білд', B: 'Базовий білд', C: 'Потребує покращення' }
  };
  const l = labels[lang] || labels.ru;
  if (s >= 92) return { grade: 'SSS', label: l.SSS, icon: '🔴' };
  if (s >= 82) return { grade: 'SS', label: l.SS, icon: '🟠' };
  if (s >= 72) return { grade: 'S', label: l.S, icon: '🟡' };
  if (s >= 60) return { grade: 'A', label: l.A, icon: '🟢' };
  if (s >= 45) return { grade: 'B', label: l.B, icon: '🔵' };
  return { grade: 'C', label: l.C, icon: '⚪' };
}

function getSafeAudit(character, lang = 'ru') {
  try {
    const auditLang = lang === 'en' ? 'en' : 'ru';
    return calculateCharacterAudit(character, auditLang);
  } catch (err) {
    console.error('Audit calculation error:', err);
    return null;
  }
}

async function fetchHsrData(uid, lang = 'ru', force = false) {
  const fetchLang = lang === 'en' ? 'en' : 'ru';
  const cacheKey = `${uid}_${fetchLang}`;

  if (!force) {
    const entry = dataCache.get(cacheKey);
    if (entry && Date.now() - entry.timestamp < CACHE_TTL_MS) {
      return entry.data;
    }
  }

  const response = await fetch(`https://api.mihomo.me/sr_info_parsed/${uid}?lang=${fetchLang}`, {
    headers: { 'User-Agent': 'NousMatrixBot/2.0' }
  });

  if (!response.ok) {
    const err = new Error(`Mihomo API error ${response.status}`);
    err.status = response.status;
    throw err;
  }

  const data = await response.json();
  dataCache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
}

// ─────────────────────────────────────────────────────────────
// ГЕНЕРАТОРИ ЕКРАНІВ ТА МЕНЮ
// ─────────────────────────────────────────────────────────────

function buildProfileScreen(data, uid, lang = 'ru') {
  const t = I18N[lang] || I18N.ru;
  const player = data.player || {};
  const characters = data.characters || [];

  const nickname = player.nickname || t.trailblazer;
  const level = player.level || '-';
  const worldLevel = player.world_level || '-';
  const achievements = player.space_info?.achievement_count || 0;
  const signature = player.signature ? `<i>«${player.signature}»</i>` : `<i>${t.noSignature}</i>`;

  let text = `
👤 <b>${t.trailblazer}:</b> <b>${nickname}</b>
🆔 <b>UID:</b> <code>${uid}</code>
📊 <b>${t.level}:</b> ${level} (${t.equilibrium}: ${worldLevel})
🏆 <b>${t.achievements}:</b> ${achievements}
💬 <b>${t.status}:</b> ${signature}
──────────────
`.trim();

  const keyboard = [];

  if (characters.length === 0) {
    text += `\n\n⚠️ <i>${t.noChars}</i>`;
  } else {
    text += `\n\n👥 <b>${t.chooseChar}</b>`;

    let row = [];
    characters.forEach((c, idx) => {
      const eidolon = `E${c.rank ?? 0}`;
      const btnText = `${c.name} (${eidolon})`;
      row.push({ text: btnText, callback_data: `c:${uid}:${idx}` });
      if (row.length === 2) {
        keyboard.push(row);
        row = [];
      }
    });
    if (row.length > 0) keyboard.push(row);
  }

  keyboard.push([
    { text: t.refreshBtn, callback_data: `ref:${uid}` },
    { text: t.langBtn, callback_data: `lang:${uid}` }
  ]);

  return { text, reply_markup: { inline_keyboard: keyboard } };
}

async function buildCharacterOverview(character, uid, charIdx, lang = 'ru') {
  const t = I18N[lang] || I18N.ru;
  const stars = '⭐'.repeat(character.rarity || 4);
  const eidolon = `E${character.rank ?? 0}`;
  const path = character.path?.name || '-';
  const element = character.element?.name || '-';

  const audit = getSafeAudit(character, lang);
  const grade = audit ? getCombatGrade(audit.score, lang) : null;

  const cone = character.light_cone;
  let coneLine = `🗡 <b>${t.cone}:</b> <i>${t.notEquipped}</i>`;
  if (cone) {
    const coneRanks = await getConeRanks(lang);
    const coneData = coneRanks[cone.id];
    const skill = formatConeSkill(coneData, cone.rank);
    const skillTitle = skill?.skill ? ` — <i>«${skill.skill}»</i>` : '';
    coneLine = `🗡 <b>${t.cone}:</b> ${cone.name} (S${cone.rank || 1}, ${t.lvl} ${cone.level})${skillTitle}`;
  }

  const sets = character.relic_sets || [];
  let setsText = '';
  if (sets.length > 0) {
    setsText = sets.map(s => `• <b>${s.name}</b> (${s.num})`).join('\n');
  } else {
    setsText = `<i>${t.noSets}</i>`;
  }

  let auditBlock = '';
  if (audit && grade) {
    auditBlock = `
🎯 <b>${t.combatIndex}</b> <b>${audit.score}/100</b> [${grade.icon} <b>${grade.grade}</b> • <i>${grade.label}</i>]
⚡ <b>${t.rollEff}</b> <b>${audit.rollEfficiency}%</b>
${audit.cv ? `🎯 <b>${t.critValue}</b> <b>${audit.cv}</b>\n` : ''}──────────────`.trim();
  }

  const text = `
${stars} <b>${character.name}</b> (${eidolon})
──────────────
📍 <b>${t.path}:</b> ${path} | <b>${t.element}:</b> ${element}
📈 <b>${t.level}:</b> ${character.level}/80

${auditBlock ? auditBlock + '\n\n' : ''}${coneLine}

🛡 <b>${t.activeSets}</b>
${setsText}

<i>${t.chooseSection}</i>
  `.trim();

  const keyboard = [
    [
      { text: t.statsBtn, callback_data: `s:${uid}:${charIdx}:stats` },
      { text: t.relicsBtn, callback_data: `s:${uid}:${charIdx}:relics` }
    ],
    [
      { text: t.coneBtn, callback_data: `s:${uid}:${charIdx}:cone` },
      { text: t.skillsBtn, callback_data: `s:${uid}:${charIdx}:skills` }
    ],
    [
      { text: t.backToChars, callback_data: `p:${uid}` }
    ]
  ];

  return { text, reply_markup: { inline_keyboard: keyboard } };
}

function buildCharacterStats(character, uid, charIdx, lang = 'ru') {
  const t = I18N[lang] || I18N.ru;
  const baseMap = {};
  (character.attributes || []).forEach(a => { baseMap[a.field] = a; });
  const addMap = {};
  (character.additions || []).forEach(a => { addMap[a.field] = a; });

  const audit = getSafeAudit(character, lang);
  const grade = audit ? getCombatGrade(audit.score, lang) : null;

  const hpBase = Math.round(baseMap.hp?.value || 0);
  const hpAdd = Math.round(addMap.hp?.value || 0);
  const hpTotal = (hpBase + hpAdd).toLocaleString();

  const atkBase = Math.round(baseMap.atk?.value || 0);
  const atkAdd = Math.round(addMap.atk?.value || 0);
  const atkTotal = (atkBase + atkAdd).toLocaleString();

  const defBase = Math.round(baseMap.def?.value || 0);
  const defAdd = Math.round(addMap.def?.value || 0);
  const defTotal = (defBase + defAdd).toLocaleString();

  const spdBase = parseFloat(baseMap.spd?.value || 0);
  const spdAdd = parseFloat(addMap.spd?.value || 0);
  const spdTotal = (spdBase + spdAdd).toFixed(1);

  const crBase = (baseMap.crit_rate?.value || 0) * 100;
  const crAdd = (addMap.crit_rate?.value || 0) * 100;
  const crTotal = (crBase + crAdd).toFixed(1) + '%';

  const cdBase = (baseMap.crit_dmg?.value || 0) * 100;
  const cdAdd = (addMap.crit_dmg?.value || 0) * 100;
  const cdTotal = (cdBase + cdAdd).toFixed(1) + '%';

  const beTotal = addMap.break_dmg ? ((addMap.break_dmg.value || 0) * 100).toFixed(1) + '%' : null;
  const errTotal = addMap.sp_rate ? (100 + (addMap.sp_rate.value || 0) * 100).toFixed(1) + '%' : null;
  const ehrTotal = addMap.effect_hit ? ((addMap.effect_hit.value || 0) * 100).toFixed(1) + '%' : null;
  const resTotal = addMap.effect_res ? ((addMap.effect_res.value || 0) * 100).toFixed(1) + '%' : null;
  const healTotal = addMap.heal_rate ? ((addMap.heal_rate.value || 0) * 100).toFixed(1) + '%' : null;

  const elemNames = {
    ru: { physical_dmg: 'Физ. урон', fire_dmg: 'Огн. урон', ice_dmg: 'Лед. урон', thunder_dmg: 'Электр. урон', wind_dmg: 'Ветр. урон', quantum_dmg: 'Квант. урон', imaginary_dmg: 'Мним. урон' },
    en: { physical_dmg: 'Physical DMG', fire_dmg: 'Fire DMG', ice_dmg: 'Ice DMG', thunder_dmg: 'Lightning DMG', wind_dmg: 'Wind DMG', quantum_dmg: 'Quantum DMG', imaginary_dmg: 'Imaginary DMG' },
    uk: { physical_dmg: 'Фіз. шкода', fire_dmg: 'Вогняна шкода', ice_dmg: 'Крижана шкода', thunder_dmg: 'Електро шкода', wind_dmg: 'Вітряна шкода', quantum_dmg: 'Квантова шкода', imaginary_dmg: 'Уявна шкода' }
  };
  const activeLangElem = elemNames[lang] || elemNames.ru;

  const elemDmgList = Object.keys(activeLangElem)
    .filter(f => addMap[f] && addMap[f].value > 0)
    .map(f => `${activeLangElem[f]}: <b>${((addMap[f].value || 0) * 100).toFixed(1)}%</b>`);

  const statLabels = {
    ru: { hp: 'HP', atk: 'Сила атаки', def: 'Защита', spd: 'Скорость', cr: 'Крит. шанс', cd: 'Крит. урон', be: 'Эффект пробития', err: 'Восст. энергии', ehr: 'Шанс попад. эфф.', res: 'Сопротивл. эфф.', heal: 'Исходящее исцел.' },
    en: { hp: 'HP', atk: 'ATK', def: 'DEF', spd: 'Speed', cr: 'CRIT Rate', cd: 'CRIT DMG', be: 'Break Effect', err: 'Energy Regen', ehr: 'Effect Hit Rate', res: 'Effect RES', heal: 'Outgoing Healing' },
    uk: { hp: 'HP', atk: 'Сила атаки', def: 'Захист', spd: 'Швидкість', cr: 'Крит. шанс', cd: 'Крит. шкода', be: 'Ефект пробиття', err: 'Відновлення енергії', ehr: 'Шанс влучання ефектів', res: 'Стійкість до ефектів', heal: 'Вихідне лікування' }
  };
  const lbl = statLabels[lang] || statLabels.ru;

  let text = `
📊 <b>${t.statsTitle} ${character.name}</b>
──────────────
`.trim();

  if (audit && grade) {
    text += `\n🎯 <b>${t.combatIndex}</b> <b>${audit.score}/100</b> [${grade.icon} <b>${grade.grade}</b> • <i>${grade.label}</i>]`;
    text += `\n⚡ <b>${t.rollEff}</b> <b>${audit.rollEfficiency}%</b>`;
    if (audit.cv) text += `\n🎯 <b>${t.critValue}</b> <b>${audit.cv}</b>`;
    text += `\n──────────────`;
  }

  text += `
❤️ <b>${lbl.hp}:</b> ${hpTotal} <i>(${hpBase} +${hpAdd})</i>
⚔️ <b>${lbl.atk}:</b> ${atkTotal} <i>(${atkBase} +${atkAdd})</i>
🛡 <b>${lbl.def}:</b> ${defTotal} <i>(${defBase} +${defAdd})</i>
👟 <b>${lbl.spd}:</b> <b>${spdTotal}</b> <i>(${spdBase.toFixed(1)} +${spdAdd.toFixed(1)})</i>

🎯 <b>${lbl.cr}:</b> <b>${crTotal}</b>
💥 <b>${lbl.cd}:</b> <b>${cdTotal}</b>
`.trim();

  if (beTotal) text += `\n⚡ <b>${lbl.be}:</b> ${beTotal}`;
  if (errTotal) text += `\n🔋 <b>${lbl.err}:</b> ${errTotal}`;
  if (ehrTotal) text += `\n🎯 <b>${lbl.ehr}:</b> ${ehrTotal}`;
  if (resTotal) text += `\n🔰 <b>${lbl.res}:</b> ${resTotal}`;
  if (healTotal) text += `\n💖 <b>${lbl.heal}:</b> ${healTotal}`;
  if (elemDmgList.length > 0) text += `\n✨ ${elemDmgList.join(', ')}`;

  const keyboard = [
    [
      { text: t.relicsBtn, callback_data: `s:${uid}:${charIdx}:relics` },
      { text: t.coneBtn, callback_data: `s:${uid}:${charIdx}:cone` },
      { text: t.skillsBtn, callback_data: `s:${uid}:${charIdx}:skills` }
    ],
    [
      { text: t.backToChar, callback_data: `c:${uid}:${charIdx}` },
      { text: t.backToList, callback_data: `p:${uid}` }
    ]
  ];

  return { text, reply_markup: { inline_keyboard: keyboard } };
}

function buildCharacterRelics(character, uid, charIdx, lang = 'ru') {
  const t = I18N[lang] || I18N.ru;
  const relics = character.relics || [];
  const typeMap = SLOT_NAMES[lang] || SLOT_NAMES.ru;

  let text = `🛡 <b>${t.relicsTitle} ${character.name}</b>\n──────────────\n`;

  if (relics.length === 0) {
    text += `<i>${t.noRelics}</i>\n`;
  } else {
    const sorted = [...relics].sort((a, b) => (Number(a.type) || 0) - (Number(b.type) || 0));

    sorted.forEach(r => {
      const typeLabel = typeMap[r.type] || `Slot ${r.type}`;
      const mainStatName = r.main_affix?.name || 'Main';
      const mainStatVal = r.main_affix?.display || '-';

      text += `\n<b>${typeLabel}</b> (+${r.level || 0})\n<i>${r.name}</i>\n`;
      text += `  • ${t.mainStat} <b>${mainStatName}: +${mainStatVal}</b>\n`;

      const subAffixes = r.sub_affix || [];
      if (subAffixes.length > 0) {
        text += `  • ${t.subStats}\n`;
        subAffixes.forEach(s => {
          const sVal = s.display?.startsWith('+') ? s.display : `+${s.display}`;
          text += `    ▫️ ${s.name}: <b>${sVal}</b>\n`;
        });
      }
    });
  }

  const sets = character.relic_sets || [];
  if (sets.length > 0) {
    text += `\n──────────────\n<b>${t.activeSetsBonus}</b>\n`;
    sets.forEach(s => {
      text += `• <b>${s.name} (${s.num})</b>\n  <i>${s.desc}</i>\n`;
    });
  }

  const keyboard = [
    [
      { text: t.statsBtn, callback_data: `s:${uid}:${charIdx}:stats` },
      { text: t.coneBtn, callback_data: `s:${uid}:${charIdx}:cone` },
      { text: t.skillsBtn, callback_data: `s:${uid}:${charIdx}:skills` }
    ],
    [
      { text: t.backToChar, callback_data: `c:${uid}:${charIdx}` },
      { text: t.backToList, callback_data: `p:${uid}` }
    ]
  ];

  return { text, reply_markup: { inline_keyboard: keyboard } };
}

async function buildCharacterCone(character, uid, charIdx, lang = 'ru') {
  const t = I18N[lang] || I18N.ru;
  const cone = character.light_cone;

  if (!cone) {
    return {
      text: `🗡 <b>${t.coneTitle} ${character.name}</b>\n\n<i>${t.notEquipped}</i>`,
      reply_markup: {
        inline_keyboard: [
          [{ text: t.backToChar, callback_data: `c:${uid}:${charIdx}` }]
        ]
      }
    };
  }

  const star = '⭐'.repeat(cone.rarity || 4);
  const path = cone.path?.name || character.path?.name || '-';
  const attributes = (cone.attributes || []).map(a => `• ${a.name}: <b>${a.display}</b>`).join('\n');

  const coneRanks = await getConeRanks(lang);
  const coneData = coneRanks[cone.id];
  const passive = formatConeSkill(coneData, cone.rank);

  let passiveBlock = '';
  if (passive && passive.desc) {
    passiveBlock = `
🔮 <b>${t.passiveSkill}</b> <b>«${passive.skill}»</b>
<i>${passive.desc}</i>
──────────────`.trim();
  }

  const text = `
🗡 <b>${t.coneTitle}</b> <b>${cone.name}</b>
──────────────
⭐ <b>${t.rarity}</b> ${star}
📍 <b>${t.path}:</b> ${path}
📈 <b>${t.level}:</b> ${cone.level}/80
⚔️ <b>${t.superimposition}:</b> <b>S${cone.rank || 1}</b>

${passiveBlock ? passiveBlock + '\n\n' : ''}<b>${t.coneBaseStats}</b>
${attributes || '—'}
  `.trim();

  const keyboard = [
    [
      { text: t.statsBtn, callback_data: `s:${uid}:${charIdx}:stats` },
      { text: t.relicsBtn, callback_data: `s:${uid}:${charIdx}:relics` },
      { text: t.skillsBtn, callback_data: `s:${uid}:${charIdx}:skills` }
    ],
    [
      { text: t.backToChar, callback_data: `c:${uid}:${charIdx}` },
      { text: t.backToList, callback_data: `p:${uid}` }
    ]
  ];

  return { text, reply_markup: { inline_keyboard: keyboard } };
}

function buildCharacterSkills(character, uid, charIdx, lang = 'ru') {
  const t = I18N[lang] || I18N.ru;
  const skills = (character.skills || []).filter(s => s.type_text && s.level > 0);

  let text = `🔮 <b>${t.skillsTitle} ${character.name}</b>\n──────────────\n\n`;

  if (skills.length === 0) {
    text += `<i>${t.noSkills}</i>`;
  } else {
    skills.forEach(s => {
      text += `• <b>${s.name}</b> (<i>${s.type_text}</i>)\n   ${t.lvl} <b>${s.level}</b>${s.max_level ? `/${s.max_level}` : ''}\n\n`;
    });
  }

  const keyboard = [
    [
      { text: t.statsBtn, callback_data: `s:${uid}:${charIdx}:stats` },
      { text: t.relicsBtn, callback_data: `s:${uid}:${charIdx}:relics` },
      { text: t.coneBtn, callback_data: `s:${uid}:${charIdx}:cone` }
    ],
    [
      { text: t.backToChar, callback_data: `c:${uid}:${charIdx}` },
      { text: t.backToList, callback_data: `p:${uid}` }
    ]
  ];

  return { text, reply_markup: { inline_keyboard: keyboard } };
}

// ─────────────────────────────────────────────────────────────
// ОСНОВНИЙ ОБРОБНИК ЗАПИТІВ VERCEL SERVERLESS
// ─────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).send('Telegram Bot Webhook is active and waiting for POST requests.');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  if (!BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN is not defined');
    return res.status(500).json({ error: 'TELEGRAM_BOT_TOKEN not configured' });
  }

  const sendTg = async (method, body) => {
    try {
      const resp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      return await resp.json();
    } catch (e) {
      console.error(`Telegram API error on ${method}:`, e);
      return null;
    }
  };

  const update = req.body || {};

  // 1. ОБРОБКА ІНЛАЙН-КНОПОК (Callback Queries)
  if (update.callback_query) {
    const cb = update.callback_query;
    const chatId = cb.message?.chat?.id;
    const messageId = cb.message?.message_id;
    const data = cb.data || '';
    const userLang = detectUserLang(cb.from, chatId);
    const t = I18N[userLang] || I18N.ru;

    await sendTg('answerCallbackQuery', { callback_query_id: cb.id });

    if (!chatId || !messageId) {
      return res.status(200).json({ ok: true });
    }

    try {
      const parts = data.split(':');
      const action = parts[0];

      // Перемикання мови по кнопці (ru -> en -> uk -> ru)
      if (action === 'lang') {
        const uid = parts[1];
        const nextLang = userLang === 'ru' ? 'en' : (userLang === 'en' ? 'uk' : 'ru');
        userLangPreferences.set(chatId, nextLang);

        const hsrData = await fetchHsrData(uid, nextLang);
        const screen = buildProfileScreen(hsrData, uid, nextLang);
        await sendTg('editMessageText', {
          chat_id: chatId,
          message_id: messageId,
          text: screen.text,
          parse_mode: 'HTML',
          reply_markup: screen.reply_markup
        });
        return res.status(200).json({ ok: true });
      }

      // Оновлення профілю
      if (action === 'ref') {
        const uid = parts[1];
        const hsrData = await fetchHsrData(uid, userLang, true);
        const screen = buildProfileScreen(hsrData, uid, userLang);
        await sendTg('editMessageText', {
          chat_id: chatId,
          message_id: messageId,
          text: screen.text,
          parse_mode: 'HTML',
          reply_markup: screen.reply_markup
        });
        return res.status(200).json({ ok: true });
      }

      // Повернення до списку персонажів
      if (action === 'p') {
        const uid = parts[1];
        const hsrData = await fetchHsrData(uid, userLang);
        const screen = buildProfileScreen(hsrData, uid, userLang);
        await sendTg('editMessageText', {
          chat_id: chatId,
          message_id: messageId,
          text: screen.text,
          parse_mode: 'HTML',
          reply_markup: screen.reply_markup
        });
        return res.status(200).json({ ok: true });
      }

      // Огляд персонажа
      if (action === 'c') {
        const uid = parts[1];
        const charIdx = parseInt(parts[2], 10);
        const hsrData = await fetchHsrData(uid, userLang);
        const char = hsrData.characters?.[charIdx];

        if (!char) {
          await sendTg('answerCallbackQuery', {
            callback_query_id: cb.id,
            text: 'Character not found',
            show_alert: true
          });
          return res.status(200).json({ ok: true });
        }

        const screen = await buildCharacterOverview(char, uid, charIdx, userLang);
        await sendTg('editMessageText', {
          chat_id: chatId,
          message_id: messageId,
          text: screen.text,
          parse_mode: 'HTML',
          reply_markup: screen.reply_markup
        });
        return res.status(200).json({ ok: true });
      }

      // Розділи характеристик
      if (action === 's') {
        const uid = parts[1];
        const charIdx = parseInt(parts[2], 10);
        const section = parts[3];

        const hsrData = await fetchHsrData(uid, userLang);
        const char = hsrData.characters?.[charIdx];

        if (!char) {
          await sendTg('answerCallbackQuery', {
            callback_query_id: cb.id,
            text: 'Character not found',
            show_alert: true
          });
          return res.status(200).json({ ok: true });
        }

        let screen;
        if (section === 'stats') {
          screen = buildCharacterStats(char, uid, charIdx, userLang);
        } else if (section === 'relics') {
          screen = buildCharacterRelics(char, uid, charIdx, userLang);
        } else if (section === 'cone') {
          screen = await buildCharacterCone(char, uid, charIdx, userLang);
        } else if (section === 'skills') {
          screen = buildCharacterSkills(char, uid, charIdx, userLang);
        }

        if (screen) {
          await sendTg('editMessageText', {
            chat_id: chatId,
            message_id: messageId,
            text: screen.text,
            parse_mode: 'HTML',
            reply_markup: screen.reply_markup
          });
        }
        return res.status(200).json({ ok: true });
      }
    } catch (err) {
      console.error('Error handling callback:', err);
    }

    return res.status(200).json({ ok: true });
  }

  // 2. ОБРОБКА ТЕКСТОВИХ ПОВІДОМЛЕНЬ
  const msg = update.message || update.edited_message;
  if (!msg || !msg.chat || !msg.chat.id) {
    return res.status(200).json({ ok: true });
  }

  const chatId = msg.chat.id;
  const rawText = (msg.text || '').trim();
  const userLang = detectUserLang(msg.from, chatId);
  const t = I18N[userLang] || I18N.ru;

  if (rawText === '/start' || rawText === '/help') {
    const welcome = `
👋 <b>${t.welcomeTitle}</b>

${t.welcomeDesc}
    `.trim();

    await sendTg('sendMessage', {
      chat_id: chatId,
      text: welcome,
      parse_mode: 'HTML'
    });
    return res.status(200).json({ ok: true });
  }

  const cleanUid = rawText.replace(/\D/g, '');
  if (!cleanUid || cleanUid.length < 8 || cleanUid.length > 11) {
    await sendTg('sendMessage', {
      chat_id: chatId,
      text: `❌ ${t.invalidUid}`,
      parse_mode: 'HTML'
    });
    return res.status(200).json({ ok: true });
  }

  await sendTg('sendMessage', {
    chat_id: chatId,
    text: `🔍 ${t.fetching} <code>${cleanUid}</code>...`,
    parse_mode: 'HTML'
  });

  try {
    const hsrData = await fetchHsrData(cleanUid, userLang, true);
    const screen = buildProfileScreen(hsrData, cleanUid, userLang);

    await sendTg('sendMessage', {
      chat_id: chatId,
      text: screen.text,
      parse_mode: 'HTML',
      reply_markup: screen.reply_markup
    });
  } catch (err) {
    console.error('Error fetching player data:', err);
    if (err.status === 404) {
      await sendTg('sendMessage', {
        chat_id: chatId,
        text: `⚠️ ${t.notFound}`,
        parse_mode: 'HTML'
      });
    } else {
      await sendTg('sendMessage', {
        chat_id: chatId,
        text: `⚠️ ${t.serverError}`,
        parse_mode: 'HTML'
      });
    }
  }

  return res.status(200).json({ ok: true });
}
