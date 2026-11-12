import { SET_DEFINITIONS } from '../src/utils/setDefinitions.js';

const SETS_MAP = {};
(SET_DEFINITIONS || []).forEach(s => {
  if (s.id) SETS_MAP[String(s.id)] = s;
});

// Fallback set names and piece names for newer sets if not in json
const KNOWN_NEW_SETS = {
  '329': {
    nameRu: 'Миг радости бога',
    nameEn: "God's Moment of Joy",
    sphereRu: 'Вечная сцена Мига радости',
    sphereEn: "Moment of Joy's Eternal Stage",
    ropeRu: 'Магический реквизит Мига радости',
    ropeEn: "Moment of Joy's Magic Prop"
  },
  '330': {
    nameRu: 'Подпространственный центр контроля аномалий',
    nameEn: 'Subspace Anomaly Control Center',
    sphereRu: 'Ядро контроля аномалий',
    sphereEn: 'Anomaly Control Core',
    ropeRu: 'Транслятор аномалий',
    ropeEn: 'Anomaly Relay'
  }
};

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
    const isRu = lang === 'ru' || lang === 'uk' || lang === 'be';
    const targetLang = isRu ? 'ru' : 'en';
    const isForce = Boolean(req.query.force || req.query._t || req.query.is_force_update);
    const forceParam = isForce ? '&is_force_update=true' : '';
    const cacheBuster = isForce ? `&_t=${Date.now()}` : '';

    const outgoingHeaders = {
      'User-Agent': 'NousMatrix/1.0'
    };
    if (isForce) {
      outgoingHeaders['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      outgoingHeaders['Pragma'] = 'no-cache';
    }

    const response = await fetch(`https://api.mihomo.me/sr_info_parsed/${cleanUid}?lang=${targetLang}${forceParam}${cacheBuster}`, {
      headers: outgoingHeaders
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Mihomo API status ${response.status}`,
        statusCode: response.status
      });
    }

    const data = await response.json();

    // 1. Ensure ornaments are merged into relics if Mihomo returned them in separate arrays
    if (data && Array.isArray(data.characters)) {
      data.characters.forEach(c => {
        if (Array.isArray(c.ornaments) && c.ornaments.length > 0) {
          const currentRelics = Array.isArray(c.relics) ? c.relics : [];
          const existingIds = new Set(currentRelics.map(r => r.id || `${r.type}_${r.name}`));
          const merged = [...currentRelics];
          c.ornaments.forEach(orn => {
            if (!existingIds.has(orn.id || `${orn.type}_${orn.name}`)) {
              merged.push(orn);
            }
          });
          c.relics = merged;
        }
      });

      // 2. If any character is missing planar relics (slots 5 or 6), check raw sr_info endpoint
      const hasMissingPlanar = data.characters.some(c => {
        const relics = c.relics || [];
        const hasSphere = relics.some(r => Number(r.type ?? r.pos) === 5 || String(r.id).endsWith('5'));
        const hasRope = relics.some(r => Number(r.type ?? r.pos) === 6 || String(r.id).endsWith('6'));
        return !hasSphere || !hasRope;
      });

      if (hasMissingPlanar) {
        try {
          const rawRes = await fetch(`https://api.mihomo.me/sr_info/${cleanUid}${forceParam}${cacheBuster}`, {
            headers: outgoingHeaders
          });
          if (rawRes.ok) {
            const rawData = await rawRes.json();
            const rawAvatars = rawData.detailInfo?.avatarDetailList || [];

            data.characters.forEach(c => {
              const rawChar = rawAvatars.find(a => String(a.avatarId) === String(c.id));
              if (rawChar && Array.isArray(rawChar.relicList)) {
                c.relics = c.relics || [];
                const existingTypes = new Set(c.relics.map(r => Number(r.type ?? r.pos)));

                rawChar.relicList.forEach(rawR => {
                  const typeNum = Number(rawR.type);
                  if ((typeNum === 5 || typeNum === 6) && !existingTypes.has(typeNum)) {
                    const tid = String(rawR.tid || '');
                    const setId = tid.length >= 5 ? tid.slice(1, 4) : '';
                    const setDef = SETS_MAP[setId] || KNOWN_NEW_SETS[setId];

                    const setName = isRu
                      ? (setDef?.nameRu || 'Планарный орнамент')
                      : (setDef?.nameEn || 'Planar Ornament');

                    let pieceName = setName;
                    if (typeNum === 5) {
                      pieceName = isRu ? (KNOWN_NEW_SETS[setId]?.sphereRu || `${setName}: Сфера`) : (KNOWN_NEW_SETS[setId]?.sphereEn || `${setName}: Sphere`);
                    } else if (typeNum === 6) {
                      pieceName = isRu ? (KNOWN_NEW_SETS[setId]?.ropeRu || `${setName}: Вервь`) : (KNOWN_NEW_SETS[setId]?.ropeEn || `${setName}: Rope`);
                    }

                    c.relics.push({
                      id: tid,
                      name: pieceName,
                      set_id: setId,
                      set_name: setName,
                      rarity: Math.floor(Number(tid) / 10000) || 5,
                      type: typeNum,
                      pos: typeNum,
                      level: rawR.level || 15,
                      icon: `icon/relic/${setId}_${typeNum === 5 ? 0 : 1}.png`,
                      main_affix: {
                        type: 'MainAffix',
                        field: 'unknown',
                        name: isRu ? 'Основной стат' : 'Main Stat',
                        value: 0,
                        display: ''
                      },
                      sub_affix: []
                    });
                    existingTypes.add(typeNum);
                  }
                });
              }
            });
          }
        } catch {
          // sr_info fallback skipped
        }
      }
    }

    if (isForce) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else {
      res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate');
    }
    return res.status(200).json(data);
  } catch (err) {
    console.error('Mihomo Serverless Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
