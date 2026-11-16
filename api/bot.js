// In-memory cache для швидкої реакції на натискання кнопок у межах інстансу
const dataCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 хвилин

function getCachedData(uid) {
  const entry = dataCache.get(uid);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL_MS) {
    return entry.data;
  }
  return null;
}

function setCachedData(uid, data) {
  dataCache.set(uid, { data, timestamp: Date.now() });
  // Очищення старих записів, щоб пам'ять не переповнювалася
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

    // Кнопки персонажів (по 2 в ряд)
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

// 2. Огляд персонажа (Головна картка)
function buildCharacterOverview(character, uid, charIdx) {
  const stars = '⭐'.repeat(character.rarity || 4);
  const eidolon = `E${character.rank ?? 0}`;
  const path = character.path?.name || '-';
  const element = character.element?.name || '-';

  const cone = character.light_cone;
  const coneText = cone
    ? `🗡 <b>Конус:</b> ${cone.name} (S${cone.rank || 1}, Ур. ${cone.level})`
    : `🗡 <b>Конус:</b> <i>Не встановлено</i>`;

  // Активні сети
  const sets = character.relic_sets || [];
  let setsText = '';
  if (sets.length > 0) {
    setsText = sets.map(s => `• ${s.name} (${s.num} шт.)`).join('\n');
  } else {
    setsText = '<i>Не зібрано</i>';
  }

  const text = `
${stars} <b>${character.name}</b> (${eidolon})
──────────────
📍 <b>Шлях:</b> ${path} | <b>Стихія:</b> ${element}
📈 <b>Рівень:</b> ${character.level}/80

${coneText}

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

// 3. Розділ «Характеристики» (Combat Stats)
function buildCharacterStats(character, uid, charIdx) {
  const baseMap = {};
  (character.attributes || []).forEach(a => { baseMap[a.field] = a; });
  const addMap = {};
  (character.additions || []).forEach(a => { addMap[a.field] = a; });

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

  // Стихійний урон
  const elementFields = [
    { field: 'physical_dmg', name: 'Фіз. урон' },
    { field: 'fire_dmg', name: 'Вогняний урон' },
    { field: 'ice_dmg', name: 'Крижаний урон' },
    { field: 'thunder_dmg', name: 'Електро урон' },
    { field: 'wind_dmg', name: 'Вітряний урон' },
    { field: 'quantum_dmg', name: 'Квантовий урон' },
    { field: 'imaginary_dmg', name: 'Уявний урон' }
  ];
  const elemDmgList = elementFields
    .filter(f => addMap[f.field] && addMap[f.field].value > 0)
    .map(f => `${f.name}: <b>${((addMap[f.field].value || 0) * 100).toFixed(1)}%</b>`);

  let text = `
📊 <b>Характеристики: ${character.name}</b>
──────────────
❤️ <b>HP:</b> ${hpTotal} <i>(${hpBase} +${hpAdd})</i>
⚔️ <b>Сила атаки:</b> ${atkTotal} <i>(${atkBase} +${atkAdd})</i>
🛡 <b>Захист:</b> ${defTotal} <i>(${defBase} +${defAdd})</i>
👟 <b>Швидкість:</b> <b>${spdTotal}</b> <i>(${spdBase.toFixed(1)} +${spdAdd.toFixed(1)})</i>

🎯 <b>Крит. шанс:</b> <b>${crTotal}</b>
💥 <b>Крит. урон:</b> <b>${cdTotal}</b>
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

// 4. Розділ «Реліквії та сети»
function buildCharacterRelics(character, uid, charIdx) {
  const relics = character.relics || [];
  const typeNames = {
    1: '👑 Голова',
    2: '🧤 Руки',
    3: '👕 Тіло',
    4: '👟 Ноги',
    5: '🔮 Сфера',
    6: '🎗 Мотузка'
  };

  let text = `🛡 <b>Реліквії: ${character.name}</b>\n──────────────\n`;

  if (relics.length === 0) {
    text += `<i>Реліквії відсутні або не екіпіровані.</i>\n`;
  } else {
    // Сортуємо за типом 1..6
    const sorted = [...relics].sort((a, b) => (Number(a.type) || 0) - (Number(b.type) || 0));

    sorted.forEach(r => {
      const typeLabel = typeNames[r.type] || `Слот ${r.type}`;
      const mainStat = r.main_affix ? `<b>${r.main_affix.name}: ${r.main_affix.display}</b>` : '-';
      const subStats = (r.sub_affix || []).map(s => `${s.name} ${s.display}`).join(', ');

      text += `\n${typeLabel}: +${r.level || 0} (${r.name})\n`;
      text += `  • Головний: ${mainStat}\n`;
      if (subStats) text += `  • Сабстати: <i>${subStats}</i>\n`;
    });
  }

  // Бонуси сетів
  const sets = character.relic_sets || [];
  if (sets.length > 0) {
    text += `\n<b>Активні сети:</b>\n`;
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

// 5. Розділ «Світловий конус»
function buildCharacterCone(character, uid, charIdx) {
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
  const attributes = (cone.attributes || []).map(a => `• ${a.name}: <b>${a.display}</b>`).join('\n');

  const text = `
🗡 <b>Світловий конус:</b> <b>${cone.name}</b>
──────────────
⭐ <b>Рідкість:</b> ${star}
📈 <b>Рівень:</b> ${cone.level}/80
⚔️ <b>Накладання (Superimposition):</b> S${cone.rank || 1}

<b>Базові показники конуса:</b>
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
      text += `• <b>${s.name}</b> (<i>${s.type_text}</i>)\n   Рівень: <b>${s.level}</b>${s.max_level ? `/${s.max_level}` : ''}\n\n`;
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

    // Обов'язково відповідаємо на callback, щоб зняти анімацію завантаження
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

        const screen = buildCharacterOverview(char, uid, charIdx);
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
          screen = buildCharacterCone(char, uid, charIdx);
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

Ти зможеш зручно перемикатися кнопками між:
• 👥 <b>Персонажами з вітрини</b>
• 📊 <b>Характеристиками (HP, ATK, Крит. шанс/урон, Швидкість тощо)</b>
• 🛡 <b>Реліквіями та бонусами сетів</b>
• 🗡 <b>Світловими конусами</b>
• 🔮 <b>Рівнями слідів та навичок</b>

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
