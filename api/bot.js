import { calculateCharacterAudit } from '../src/utils/audit.js';

// In-memory cache для швидкої реакції на кнопки
const dataCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 хвилин
let coneRanksCache = null;

// Словник перекладу термінів з російської на українську мову
const UK_DICT = {
  // Шляхи
  'Разрушение': 'Руйнування',
  'Охота': 'Полювання',
  'Эрудиция': 'Ерудиція',
  'Гармония': 'Гармонія',
  'Небытие': 'Небуття',
  'Сохранение': 'Збереження',
  'Изобилие': 'Достаток',
  'Память': 'Пам\'ять',

  // Стихії
  'Физический': 'Фізичний',
  'Огненный': 'Вогняний',
  'Ледяной': 'Крижаний',
  'Электрический': 'Електричний',
  'Ветряной': 'Вітряний',
  'Квантовый': 'Квантовий',
  'Мнимый': 'Уявний',

  // Навички
  'Базовая атака': 'Базова атака',
  'Навык': 'Навичка',
  'Сверхспособность': 'Надздібність (Ультимейт)',
  'Талант': 'Талант',
  'Техника': 'Техніка',

  // Стати та характеристики
  'НР': 'HP',
  'Базовое НР': 'Базове HP',
  'Сила атаки': 'Сила атаки',
  'Базовая сила атаки': 'Базова сила атаки',
  'Защита': 'Захист',
  'Базовая защита': 'Базовий захист',
  'Скорость': 'Швидкість',
  'Крит. шанс': 'Крит. шанс',
  'Крит. урон': 'Крит. шкода',
  'Эффект пробития': 'Ефект пробиття',
  'Скорость восстановления энергии': 'Відновлення енергії',
  'Шанс попадания эффектов': 'Шанс влучання ефектів',
  'Сопротивление эффектам': 'Стійкість до ефектів',
  'Исходящее исцеление': 'Вихідне лікування',
  'Повышение урона': 'Бонус шкоди',

  // Елементальна шкода
  'Бонус физ. урона': 'Бонус фіз. шкоди',
  'Бонус огн. урона': 'Бонус вогняної шкоди',
  'Бонус лед. урона': 'Бонус крижаної шкоди',
  'Бонус электр. урона': 'Бонус електр. шкоди',
  'Бонус ветр. урона': 'Бонус вітряної шкоди',
  'Бонус квант. урона': 'Бонус квантової шкоди',
  'Бонус мним. урона': 'Бонус уявної шкоди',
  'Физический урон': 'Фізична шкода',
  'Огненный урон': 'Вогняна шкода',
  'Ледяной урон': 'Крижана шкода',
  'Электрический урон': 'Електрична шкода',
  'Ветряной урон': 'Вітряна шкода',
  'Квантовый урон': 'Квантова шкода',
  'Мнимый урон': 'Уявна шкода'
};

function translateUk(text) {
  if (!text || typeof text !== 'string') return text;
  if (UK_DICT[text]) return UK_DICT[text];
  let res = text;
  for (const [ru, uk] of Object.entries(UK_DICT)) {
    if (res.includes(ru)) {
      res = res.replaceAll(ru, uk);
    }
  }
  return res;
}

// Завантаження пасивних навичок світлових конусів
async function getConeRanks() {
  if (coneRanksCache) return coneRanksCache;
  try {
    const res = await fetch('https://cdn.jsdelivr.net/gh/Mar-7th/StarRailRes@master/index_min/ru/light_cone_ranks.json');
    if (res.ok) {
      coneRanksCache = await res.json();
    }
  } catch (e) {
    console.error('Failed to load cone ranks:', e);
  }
  return coneRanksCache || {};
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
    skill: translateUk(coneData.skill || 'Пасивна навичка'),
    desc: translateUk(desc.replace(/<[^>]+>/g, ''))
  };
}

// Розрахунок грейду для Індексу боєздатності
function getCombatGrade(scoreNum) {
  const s = parseFloat(scoreNum) || 0;
  if (s >= 92) return { grade: 'SSS', label: 'Елітний білд', icon: '🔴' };
  if (s >= 82) return { grade: 'SS', label: 'Відмінний білд', icon: '🟠' };
  if (s >= 72) return { grade: 'S', label: 'Добрий білд', icon: '🟡' };
  if (s >= 60) return { grade: 'A', label: 'Робочий білд', icon: '🟢' };
  if (s >= 45) return { grade: 'B', label: 'Базовий білд', icon: '🔵' };
  return { grade: 'C', label: 'Потребує покращення', icon: '⚪' };
}

function getSafeAudit(character) {
  try {
    return calculateCharacterAudit(character, 'ru');
  } catch (err) {
    console.error('Audit calculation error:', err);
    return null;
  }
}

function getCachedData(uid) {
  const entry = dataCache.get(uid);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL_MS) {
    return entry.data;
  }
  return null;
}

function setCachedData(uid, data) {
  dataCache.set(uid, { data, timestamp: Date.now() });
  if (dataCache.size > 200) {
    const oldestKey = dataCache.keys().next().value;
    dataCache.delete(oldestKey);
  }
}

async function fetchHsrData(uid, force = false) {
  if (!force) {
    const cached = getCachedData(uid);
    if (cached) return cached;
  }

  const response = await fetch(`https://api.mihomo.me/sr_info_parsed/${uid}?lang=ru`, {
    headers: { 'User-Agent': 'NousMatrixBot/2.0' }
  });

  if (!response.ok) {
    const err = new Error(`Mihomo API error ${response.status}`);
    err.status = response.status;
    throw err;
  }

  const data = await response.json();
  setCachedData(uid, data);
  return data;
}

// ─────────────────────────────────────────────────────────────
// ГЕНЕРАТОРИ ЕКРАНІВ ТА МЕНЮ (HTML + Inline Keyboard)
// ─────────────────────────────────────────────────────────────

// 1. Головне меню профілю зі списком персонажів
function buildProfileScreen(data, uid) {
  const player = data.player || {};
  const characters = data.characters || [];

  const nickname = player.nickname || 'Невідомий';
  const level = player.level || '-';
  const worldLevel = player.world_level || '-';
  const achievements = player.space_info?.achievement_count || 0;
  const signature = player.signature ? `<i>«${player.signature}»</i>` : '<i>(без підпису)</i>';

  let text = `
👤 <b>Першопроходець:</b> <b>${nickname}</b>
🆔 <b>UID:</b> <code>${uid}</code>
📊 <b>Рівень:</b> ${level} (Рівновага: ${worldLevel})
🏆 <b>Досягнень:</b> ${achievements}
💬 <b>Статус:</b> ${signature}
──────────────
`.trim();

  const keyboard = [];

  if (characters.length === 0) {
    text += `\n\n⚠️ <i>На вітрині немає відкритих персонажів або вони приховані в налаштуваннях гри.</i>`;
  } else {
    text += `\n\n👥 <b>Оберіть персонажа для перегляду:</b>`;

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
    { text: '🔄 Оновити дані', callback_data: `ref:${uid}` }
  ]);

  return { text, reply_markup: { inline_keyboard: keyboard } };
}

// 2. Огляд персонажа (Головна картка з індексом боєздатності)
async function buildCharacterOverview(character, uid, charIdx) {
  const stars = '⭐'.repeat(character.rarity || 4);
  const eidolon = `E${character.rank ?? 0}`;
  const path = translateUk(character.path?.name || '-');
  const element = translateUk(character.element?.name || '-');

  // Розрахунок індексу боєздатності
  const audit = getSafeAudit(character);
  const grade = audit ? getCombatGrade(audit.score) : null;

  // Отримуємо конус та його пасивку
  const cone = character.light_cone;
  let coneLine = `🗡 <b>Конус:</b> <i>Не встановлено</i>`;
  if (cone) {
    const coneRanks = await getConeRanks();
    const coneData = coneRanks[cone.id];
    const skill = formatConeSkill(coneData, cone.rank);
    const skillTitle = skill?.skill ? ` — <i>«${skill.skill}»</i>` : '';
    coneLine = `🗡 <b>Конус:</b> ${cone.name} (S${cone.rank || 1}, Ур. ${cone.level})${skillTitle}`;
  }

  // Бонуси сетів
  const sets = character.relic_sets || [];
  let setsText = '';
  if (sets.length > 0) {
    setsText = sets.map(s => `• <b>${s.name}</b> (${s.num} шт.)`).join('\n');
  } else {
    setsText = '<i>Сети не зібрано</i>';
  }

  // Блок індексу боєздатності
  let auditBlock = '';
  if (audit && grade) {
    auditBlock = `
🎯 <b>Індекс боєздатності:</b> <b>${audit.score}/100</b> [${grade.icon} <b>${grade.grade}</b> • <i>${grade.label}</i>]
⚡ <b>Ефективність ролів:</b> <b>${audit.rollEfficiency}%</b>
${audit.cv ? `🎯 <b>Крит-маса (CV):</b> <b>${audit.cv}</b>\n` : ''}──────────────`.trim();
  }

  const text = `
${stars} <b>${character.name}</b> (${eidolon})
──────────────
📍 <b>Шлях:</b> ${path} | <b>Стихія:</b> ${element}
📈 <b>Рівень:</b> ${character.level}/80

${auditBlock ? auditBlock + '\n\n' : ''}${coneLine}

🛡 <b>Бонуси сетів:</b>
${setsText}

<i>Оберіть розділ характеристик нижче:</i>
  `.trim();

  const keyboard = [
    [
      { text: '📊 Характеристики', callback_data: `s:${uid}:${charIdx}:stats` },
      { text: '🛡 Реліквії', callback_data: `s:${uid}:${charIdx}:relics` }
    ],
    [
      { text: '🗡 Світловий конус', callback_data: `s:${uid}:${charIdx}:cone` },
      { text: '🔮 Сліди та навички', callback_data: `s:${uid}:${charIdx}:skills` }
    ],
    [
      { text: '◀️ До списку персонажів', callback_data: `p:${uid}` }
    ]
  ];

  return { text, reply_markup: { inline_keyboard: keyboard } };
}

// 3. Розділ «Характеристики» (Combat Stats + Індекс боєздатності)
function buildCharacterStats(character, uid, charIdx) {
  const baseMap = {};
  (character.attributes || []).forEach(a => { baseMap[a.field] = a; });
  const addMap = {};
  (character.additions || []).forEach(a => { addMap[a.field] = a; });

  const audit = getSafeAudit(character);
  const grade = audit ? getCombatGrade(audit.score) : null;

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

  const elementFields = [
    { field: 'physical_dmg', name: 'Фіз. шкода' },
    { field: 'fire_dmg', name: 'Вогняна шкода' },
    { field: 'ice_dmg', name: 'Крижана шкода' },
    { field: 'thunder_dmg', name: 'Електро шкода' },
    { field: 'wind_dmg', name: 'Вітряна шкода' },
    { field: 'quantum_dmg', name: 'Квантова шкода' },
    { field: 'imaginary_dmg', name: 'Уявна шкода' }
  ];
  const elemDmgList = elementFields
    .filter(f => addMap[f.field] && addMap[f.field].value > 0)
    .map(f => `${f.name}: <b>${((addMap[f.field].value || 0) * 100).toFixed(1)}%</b>`);

  let text = `
📊 <b>Характеристики: ${character.name}</b>
──────────────
`.trim();

  if (audit && grade) {
    text += `\n🎯 <b>Індекс боєздатності:</b> <b>${audit.score}/100</b> [${grade.icon} <b>${grade.grade}</b> • <i>${grade.label}</i>]`;
    text += `\n⚡ <b>Ефективність ролів:</b> <b>${audit.rollEfficiency}%</b>`;
    if (audit.cv) text += `\n🎯 <b>Крит-маса (CV):</b> <b>${audit.cv}</b>`;
    text += `\n──────────────`;
  }

  text += `
❤️ <b>HP:</b> ${hpTotal} <i>(${hpBase} +${hpAdd})</i>
⚔️ <b>Сила атаки:</b> ${atkTotal} <i>(${atkBase} +${atkAdd})</i>
🛡 <b>Захист:</b> ${defTotal} <i>(${defBase} +${defAdd})</i>
👟 <b>Швидкість:</b> <b>${spdTotal}</b> <i>(${spdBase.toFixed(1)} +${spdAdd.toFixed(1)})</i>

🎯 <b>Крит. шанс:</b> <b>${crTotal}</b>
💥 <b>Крит. шкода:</b> <b>${cdTotal}</b>
`.trim();

  if (beTotal) text += `\n⚡ <b>Ефект пробиття:</b> ${beTotal}`;
  if (errTotal) text += `\n🔋 <b>Відновлення енергії:</b> ${errTotal}`;
  if (ehrTotal) text += `\n🎯 <b>Шанс влучання ефектів:</b> ${ehrTotal}`;
  if (resTotal) text += `\n🔰 <b>Стійкість до ефектів:</b> ${resTotal}`;
  if (healTotal) text += `\n💖 <b>Вихідне лікування:</b> ${healTotal}`;
  if (elemDmgList.length > 0) text += `\n✨ ${elemDmgList.join(', ')}`;

  const keyboard = [
    [
      { text: '🛡 Реліквії', callback_data: `s:${uid}:${charIdx}:relics` },
      { text: '🗡 Конус', callback_data: `s:${uid}:${charIdx}:cone` },
      { text: '🔮 Навички', callback_data: `s:${uid}:${charIdx}:skills` }
    ],
    [
      { text: '◀️ До персонажа', callback_data: `c:${uid}:${charIdx}` },
      { text: '👥 До списку', callback_data: `p:${uid}` }
    ]
  ];

  return { text, reply_markup: { inline_keyboard: keyboard } };
}

// 4. Розділ «Реліквії та сети» (сабстати виведені в колонку)
function buildCharacterRelics(character, uid, charIdx) {
  const relics = character.relics || [];
  const typeNames = {
    1: '👑 Голова',
    2: '🧤 Руки',
    3: '👕 Тіло',
    4: '👟 Ноги (Черевики)',
    5: '🔮 Планарна сфера',
    6: '🎗 З\'єднувальна мотузка'
  };

  let text = `🛡 <b>Реліквії: ${character.name}</b>\n──────────────\n`;

  if (relics.length === 0) {
    text += `<i>Реліквії відсутні або не екіпіровані.</i>\n`;
  } else {
    const sorted = [...relics].sort((a, b) => (Number(a.type) || 0) - (Number(b.type) || 0));

    sorted.forEach(r => {
      const typeLabel = typeNames[r.type] || `Слот ${r.type}`;
      const mainStatName = translateUk(r.main_affix?.name || 'Головний');
      const mainStatVal = r.main_affix?.display || '-';

      text += `\n<b>${typeLabel}</b> (+${r.level || 0})\n<i>${r.name}</i>\n`;
      text += `  • Головний стат: <b>${mainStatName}: +${mainStatVal}</b>\n`;

      const subAffixes = r.sub_affix || [];
      if (subAffixes.length > 0) {
        text += `  • Сабстати:\n`;
        subAffixes.forEach(s => {
          const sName = translateUk(s.name);
          const sVal = s.display?.startsWith('+') ? s.display : `+${s.display}`;
          text += `    ▫️ ${sName}: <b>${sVal}</b>\n`;
        });
      }
    });
  }

  // Бонуси сетів
  const sets = character.relic_sets || [];
  if (sets.length > 0) {
    text += `\n──────────────\n<b>Активні бонуси сетів:</b>\n`;
    sets.forEach(s => {
      text += `• <b>${s.name} (${s.num} шт.)</b>\n  <i>${s.desc}</i>\n`;
    });
  }

  const keyboard = [
    [
      { text: '📊 Характеристики', callback_data: `s:${uid}:${charIdx}:stats` },
      { text: '🗡 Конус', callback_data: `s:${uid}:${charIdx}:cone` },
      { text: '🔮 Навички', callback_data: `s:${uid}:${charIdx}:skills` }
    ],
    [
      { text: '◀️ До персонажа', callback_data: `c:${uid}:${charIdx}` },
      { text: '👥 До списку', callback_data: `p:${uid}` }
    ]
  ];

  return { text, reply_markup: { inline_keyboard: keyboard } };
}

// 5. Розділ «Світловий конус» (з повною пасивною навичкою)
async function buildCharacterCone(character, uid, charIdx) {
  const cone = character.light_cone;

  if (!cone) {
    return {
      text: `🗡 <b>Світловий конус: ${character.name}</b>\n\n<i>Конус не екіпіровано.</i>`,
      reply_markup: {
        inline_keyboard: [
          [{ text: '◀️ До персонажа', callback_data: `c:${uid}:${charIdx}` }]
        ]
      }
    };
  }

  const star = '⭐'.repeat(cone.rarity || 4);
  const path = translateUk(cone.path?.name || character.path?.name || '-');
  const attributes = (cone.attributes || []).map(a => `• ${translateUk(a.name)}: <b>${a.display}</b>`).join('\n');

  // Отримуємо пасивну навичку з бази даних
  const coneRanks = await getConeRanks();
  const coneData = coneRanks[cone.id];
  const passive = formatConeSkill(coneData, cone.rank);

  let passiveBlock = '';
  if (passive) {
    passiveBlock = `
🔮 <b>Пасивна навичка:</b> <b>«${passive.skill}»</b>
<i>${passive.desc}</i>
──────────────`.trim();
  }

  const text = `
🗡 <b>Світловий конус:</b> <b>${cone.name}</b>
──────────────
⭐ <b>Рідкість:</b> ${star}
📍 <b>Шлях:</b> ${path}
📈 <b>Рівень:</b> ${cone.level}/80
⚔️ <b>Накладання (Superimposition):</b> <b>S${cone.rank || 1}</b>

${passiveBlock ? passiveBlock + '\n\n' : ''}<b>Базові показники конуса:</b>
${attributes || '—'}
  `.trim();

  const keyboard = [
    [
      { text: '📊 Характеристики', callback_data: `s:${uid}:${charIdx}:stats` },
      { text: '🛡 Реліквії', callback_data: `s:${uid}:${charIdx}:relics` },
      { text: '🔮 Навички', callback_data: `s:${uid}:${charIdx}:skills` }
    ],
    [
      { text: '◀️ До персонажа', callback_data: `c:${uid}:${charIdx}` },
      { text: '👥 До списку', callback_data: `p:${uid}` }
    ]
  ];

  return { text, reply_markup: { inline_keyboard: keyboard } };
}

// 6. Розділ «Сліди та навички»
function buildCharacterSkills(character, uid, charIdx) {
  const skills = (character.skills || []).filter(s => s.type_text && s.level > 0);

  let text = `🔮 <b>Сліди та навички: ${character.name}</b>\n──────────────\n\n`;

  if (skills.length === 0) {
    text += `<i>Дані про навички недоступні.</i>`;
  } else {
    skills.forEach(s => {
      const typeText = translateUk(s.type_text);
      text += `• <b>${s.name}</b> (<i>${typeText}</i>)\n   Рівень: <b>${s.level}</b>${s.max_level ? `/${s.max_level}` : ''}\n\n`;
    });
  }

  const keyboard = [
    [
      { text: '📊 Характеристики', callback_data: `s:${uid}:${charIdx}:stats` },
      { text: '🛡 Реліквії', callback_data: `s:${uid}:${charIdx}:relics` },
      { text: '🗡 Конус', callback_data: `s:${uid}:${charIdx}:cone` }
    ],
    [
      { text: '◀️ До персонажа', callback_data: `c:${uid}:${charIdx}` },
      { text: '👥 До списку', callback_data: `p:${uid}` }
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

  // 1. ОБРОБКА НАТИСКАННЯ НА ІНЛАЙН-КНОПКИ (Callback Queries)
  if (update.callback_query) {
    const cb = update.callback_query;
    const chatId = cb.message?.chat?.id;
    const messageId = cb.message?.message_id;
    const data = cb.data || '';

    await sendTg('answerCallbackQuery', { callback_query_id: cb.id });

    if (!chatId || !messageId) {
      return res.status(200).json({ ok: true });
    }

    try {
      const parts = data.split(':');
      const action = parts[0];

      // Оновлення профілю
      if (action === 'ref') {
        const uid = parts[1];
        const hsrData = await fetchHsrData(uid, true);
        const screen = buildProfileScreen(hsrData, uid);
        await sendTg('editMessageText', {
          chat_id: chatId,
          message_id: messageId,
          text: screen.text,
          parse_mode: 'HTML',
          reply_markup: screen.reply_markup
        });
        return res.status(200).json({ ok: true });
      }

      // Повернення до профілю (списку персонажів)
      if (action === 'p') {
        const uid = parts[1];
        const hsrData = await fetchHsrData(uid);
        const screen = buildProfileScreen(hsrData, uid);
        await sendTg('editMessageText', {
          chat_id: chatId,
          message_id: messageId,
          text: screen.text,
          parse_mode: 'HTML',
          reply_markup: screen.reply_markup
        });
        return res.status(200).json({ ok: true });
      }

      // Перегляд головної картки персонажа
      if (action === 'c') {
        const uid = parts[1];
        const charIdx = parseInt(parts[2], 10);
        const hsrData = await fetchHsrData(uid);
        const char = hsrData.characters?.[charIdx];

        if (!char) {
          await sendTg('answerCallbackQuery', {
            callback_query_id: cb.id,
            text: 'Персонажа не знайдено',
            show_alert: true
          });
          return res.status(200).json({ ok: true });
        }

        const screen = await buildCharacterOverview(char, uid, charIdx);
        await sendTg('editMessageText', {
          chat_id: chatId,
          message_id: messageId,
          text: screen.text,
          parse_mode: 'HTML',
          reply_markup: screen.reply_markup
        });
        return res.status(200).json({ ok: true });
      }

      // Перегляд конкретного розділу характеристик
      if (action === 's') {
        const uid = parts[1];
        const charIdx = parseInt(parts[2], 10);
        const section = parts[3];

        const hsrData = await fetchHsrData(uid);
        const char = hsrData.characters?.[charIdx];

        if (!char) {
          await sendTg('answerCallbackQuery', {
            callback_query_id: cb.id,
            text: 'Персонажа не знайдено',
            show_alert: true
          });
          return res.status(200).json({ ok: true });
        }

        let screen;
        if (section === 'stats') {
          screen = buildCharacterStats(char, uid, charIdx);
        } else if (section === 'relics') {
          screen = buildCharacterRelics(char, uid, charIdx);
        } else if (section === 'cone') {
          screen = await buildCharacterCone(char, uid, charIdx);
        } else if (section === 'skills') {
          screen = buildCharacterSkills(char, uid, charIdx);
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

  // 2. ОБРОБКА ЗВИЧАЙНИХ ТЕКСТОВИХ ПОВІДОМЛЕНЬ
  const msg = update.message || update.edited_message;
  if (!msg || !msg.chat || !msg.chat.id) {
    return res.status(200).json({ ok: true });
  }

  const chatId = msg.chat.id;
  const rawText = (msg.text || '').trim();

  if (rawText === '/start' || rawText === '/help') {
    const welcome = `
👋 <b>Вітаю у Honkai: Star Rail боті!</b>

Надішли мені <b>UID</b> свого акаунту (наприклад: <code>700123456</code>).

Ти зможеш зручно переглядати:
• 👥 <b>Персонажів з вітрини</b>
• 🎯 <b>Індекс боєздатності білда (/100) та оцінку</b>
• 📊 <b>Характеристики (HP, ATK, Крит. шанс/шкода, Швидкість)</b>
• 🛡 <b>Реліквії (сабстати в зручну колонку) та бонуси сетів</b>
• 🗡 <b>Світлові конуси з повною пасивною навичкою</b>
• 🔮 <b>Рівні слідів та навичок</b>

<i>Переконайся, що в налаштуваннях профілю в грі увімкнено показ персонажів!</i>
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
      text: '❌ Будь ласка, надішли числовий <b>UID</b> (наприклад: <code>700123456</code>).',
      parse_mode: 'HTML'
    });
    return res.status(200).json({ ok: true });
  }

  await sendTg('sendMessage', {
    chat_id: chatId,
    text: `🔍 Завантажую дані для UID <code>${cleanUid}</code>...`,
    parse_mode: 'HTML'
  });

  try {
    const hsrData = await fetchHsrData(cleanUid, true);
    const screen = buildProfileScreen(hsrData, cleanUid);

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
        text: `⚠️ Акаунт із UID <code>${cleanUid}</code> не знайдено. Перевір правильність введених цифр.`,
        parse_mode: 'HTML'
      });
    } else {
      await sendTg('sendMessage', {
        chat_id: chatId,
        text: '⚠️ Сталася помилка при завантаженні даних з сервера гри. Спробуй ще раз через хвилину.',
        parse_mode: 'HTML'
      });
    }
  }

  return res.status(200).json({ ok: true });
}
