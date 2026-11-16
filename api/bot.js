export default async function handler(req, res) {
  // Відповідаємо на GET запити для швидкої перевірки працездатності в браузері
  if (req.method === 'GET') {
    return res.status(200).send('Telegram Bot Webhook is active and waiting for POST requests.');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  if (!BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN is not defined in environment variables');
    return res.status(500).json({ error: 'TELEGRAM_BOT_TOKEN not configured' });
  }

  const { message, edited_message } = req.body || {};
  const msg = message || edited_message;

  // Якщо це не текстове повідомлення (наприклад, оновлення статусу чи реакція), просто повертаємо 200
  if (!msg || !msg.chat || !msg.chat.id) {
    return res.status(200).json({ ok: true });
  }

  const chatId = msg.chat.id;
  const rawText = (msg.text || '').trim();

  // Допоміжна функція для надсилання повідомлення в Telegram
  const sendTelegramMessage = async (text, options = {}) => {
    try {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
          ...options
        })
      });
    } catch (err) {
      console.error('Failed to send Telegram message:', err);
    }
  };

  // Команда /start або /help
  if (rawText === '/start' || rawText === '/help') {
    const welcome = `
👋 <b>Вітаю у Honkai: Star Rail боті!</b>

Надішли мені <b>UID</b> свого акаунту (наприклад: <code>700123456</code>), і я надішлю тобі:
• Рівень та статус акаунту
• Персонажів із твоєї вітрини (з ейдолонами та конусами)
• Кількість досягнень

<i>Підказка: переконайся, що в грі увімкнено показ персонажів у профілі!</i>
    `.trim();
    await sendTelegramMessage(welcome);
    return res.status(200).json({ ok: true });
  }

  // Виділяємо числовий UID (зазвичай 9-10 цифр)
  const cleanUid = rawText.replace(/\D/g, '');

  if (!cleanUid || cleanUid.length < 8 || cleanUid.length > 11) {
    await sendTelegramMessage('❌ Будь ласка, вкажи коректний <b>UID</b> (наприклад: <code>700123456</code>).');
    return res.status(200).json({ ok: true });
  }

  // Сповіщаємо користувача, що запит обробляється
  await sendTelegramMessage(`🔍 Завантажую дані для UID <code>${cleanUid}</code>...`);

  try {
    const response = await fetch(`https://api.mihomo.me/sr_info_parsed/${cleanUid}?lang=ru`, {
      headers: {
        'User-Agent': 'NousMatrixBot/1.0'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        await sendTelegramMessage(`⚠️ Акаунт із UID <code>${cleanUid}</code> не знайдено. Перевір правильність введених цифр.`);
      } else {
        await sendTelegramMessage(`⚠️ Сервіс гри повернув статус ${response.status}. Можливо, сервер перевантажений або профіль приховано.`);
      }
      return res.status(200).json({ ok: true });
    }

    const data = await response.json();
    const player = data.player || {};
    const characters = data.characters || [];

    // Форматування списку персонажів
    let charactersBlock = '<i>На вітрині немає виставлених персонажів або вони приховані в налаштуваннях гри.</i>';
    if (characters.length > 0) {
      charactersBlock = characters.map((c, index) => {
        const star = '⭐'.repeat(c.rarity || 4);
        const eidolon = `E${c.rank ?? 0}`;
        const cone = c.light_cone ? ` | 🗡 <i>${c.light_cone.name} (S${c.light_cone.rank || 1})</i>` : '';
        return `<b>${index + 1}. ${c.name}</b> [${star}]\n   • Рівень: <b>${c.level}</b> | ${eidolon}${cone}`;
      }).join('\n\n');
    }

    const nickname = player.nickname || 'Невідомий Першопроходець';
    const level = player.level || '-';
    const worldLevel = player.world_level || '-';
    const signature = player.signature ? `<i>«${player.signature}»</i>` : '<i>(без підпису)</i>';
    const achievements = player.space_info?.achievement_count || 0;

    const reply = `
👤 <b>Першопроходець:</b> <b>${nickname}</b>
🆔 <b>UID:</b> <code>${cleanUid}</code>
📊 <b>Рівень:</b> ${level} (Рівень рівноваги: ${worldLevel})
🏆 <b>Досягнень:</b> ${achievements}
💬 <b>Статус:</b> ${signature}

──────────────
👥 <b>Персонажі на вітрині:</b>
${charactersBlock}
    `.trim();

    await sendTelegramMessage(reply);
  } catch (err) {
    console.error('Error fetching player data:', err);
    await sendTelegramMessage('⚠️ Сталася помилка під час звернення до серверів гри. Спробуй ще раз через кілька хвилин.');
  }

  return res.status(200).json({ ok: true });
}
