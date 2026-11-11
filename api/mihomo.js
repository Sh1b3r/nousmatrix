export default async function handler(req, res) {
  const { uid, lang = 'en' } = req.query;
  const cleanUid = String(uid || '').trim().replace(/\D/g, '');

  if (!cleanUid) {
    return res.status(400).json({ error: 'Valid numerical UID is required' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const targetLang = (lang === 'ru' || lang === 'uk' || lang === 'be') ? 'ru' : 'en';
    const response = await fetch(`https://api.mihomo.me/sr_info_parsed/${cleanUid}?lang=${targetLang}`, {
      headers: {
        'User-Agent': 'NousMatrix/1.0'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Mihomo API status ${response.status}`,
        statusCode: response.status
      });
    }

    const data = await response.json();
    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate');
    return res.status(200).json(data);
  } catch (err) {
    console.error('Mihomo Serverless Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
