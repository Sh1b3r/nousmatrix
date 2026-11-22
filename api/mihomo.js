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

// StarRailRes republishes the client resource tables by locale. We only load
// this fallback catalog when an upstream profile omits a piece name or returns
// the set name in its place. Normal Mihomo responses already carry this name.
const relicCatalogCache = new Map();

async function getRelicCatalog(lang) {
  const targetLang = lang === 'ru' ? 'ru' : 'en';
  if (relicCatalogCache.has(targetLang)) return relicCatalogCache.get(targetLang);

  try {
    const response = await fetchWithTimeout(
      `https://cdn.jsdelivr.net/gh/Mar-7th/StarRailRes@master/index_new/${targetLang}/relics.json`,
      { headers: { 'User-Agent': 'NousMatrix/1.0' } },
      3500
    );
    const catalog = response.ok ? await response.json() : {};
    relicCatalogCache.set(targetLang, catalog);
    return catalog;
  } catch {
    return {};
  }
}

function resourceRelicName(catalog, relicId, fallback = '') {
  const exactName = catalog?.[String(relicId || '')]?.name;
  return typeof exactName === 'string' && exactName.trim() ? exactName : fallback;
}

function profileNeedsRelicCatalog(data) {
  return (data?.characters || []).some((character) =>
    [...(character.relics || []), ...(character.ornaments || [])].some((relic) => {
      const name = String(relic?.name || '').trim();
      const setName = String(relic?.set_name || '').trim();
      return !name || Boolean(setName && name === setName);
    })
  );
}

function hydrateMissingRelicNames(data, catalog) {
  if (!catalog || !data?.characters) return;
  data.characters.forEach((character) => {
    [...(character.relics || []), ...(character.ornaments || [])].forEach((relic) => {
      const name = String(relic?.name || '').trim();
      const setName = String(relic?.set_name || '').trim();
      if (!name || (setName && name === setName)) {
        relic.name = resourceRelicName(catalog, relic.id || relic.tid, name || setName);
      }
    });
  });
}

function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timeoutId));
}

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

    const response = await fetchWithTimeout(
      `https://api.mihomo.me/sr_info_parsed/${cleanUid}?lang=${targetLang}${forceParam}${cacheBuster}`,
      { headers: outgoingHeaders },
      8000
    );

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Mihomo API status ${response.status}`,
        statusCode: response.status
      });
    }

    const data = await response.json();

    // Preserve Mihomo's localized value whenever it is present. The catalog is
    // used only to repair incomplete item records, never to replace a valid
    // profile item name.
    let relicCatalog = null;
    if (profileNeedsRelicCatalog(data)) {
      relicCatalog = await getRelicCatalog(targetLang);
      hydrateMissingRelicNames(data, relicCatalog);
    }

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

      // 2. If any character is missing planar relics (slots 5 or 6), check raw sr_info endpoint and Enka Network
      let stillMissingPlanar = data.characters.some(c => {
        const relics = c.relics || [];
        const hasSphere = relics.some(r => Number(r.type ?? r.pos) === 5 || String(r.id).endsWith('5'));
        const hasRope = relics.some(r => Number(r.type ?? r.pos) === 6 || String(r.id).endsWith('6'));
        return !hasSphere || !hasRope;
      });

      if (stillMissingPlanar) {
        try {
          if (!relicCatalog) relicCatalog = await getRelicCatalog(targetLang);
          const rawRes = await fetchWithTimeout(
            `https://api.mihomo.me/sr_info/${cleanUid}${forceParam}${cacheBuster}`,
            { headers: outgoingHeaders },
            1800
          );
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

                    let pieceName = resourceRelicName(relicCatalog, tid, '');
                    if (typeNum === 5) {
                      pieceName = pieceName || (isRu ? (KNOWN_NEW_SETS[setId]?.sphereRu || `${setName}: Сфера`) : (KNOWN_NEW_SETS[setId]?.sphereEn || `${setName}: Sphere`));
                    } else if (typeNum === 6) {
                      pieceName = pieceName || (isRu ? (KNOWN_NEW_SETS[setId]?.ropeRu || `${setName}: Вервь`) : (KNOWN_NEW_SETS[setId]?.ropeEn || `${setName}: Rope`));
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

        // Re-check if any characters still need planars from Enka Network
        stillMissingPlanar = data.characters.some(c => {
          const relics = c.relics || [];
          const hasSphere = relics.some(r => Number(r.type ?? r.pos) === 5 || String(r.id).endsWith('5'));
          const hasRope = relics.some(r => Number(r.type ?? r.pos) === 6 || String(r.id).endsWith('6'));
          return !hasSphere || !hasRope;
        });

        if (stillMissingPlanar) {
          try {
            if (!relicCatalog) relicCatalog = await getRelicCatalog(targetLang);
            const enkaRes = await fetchWithTimeout(
              `https://enka.network/api/hsr/uid/${cleanUid}`,
              { headers: { 'User-Agent': 'NousMatrix/1.0' } },
              1800
            );
            if (enkaRes.ok) {
              const enkaData = await enkaRes.json();
              const enkaAvatars = enkaData.detailInfo?.avatarDetailList || [];

              data.characters.forEach(c => {
                const enkaChar = enkaAvatars.find(a => String(a.avatarId) === String(c.id));
                if (enkaChar && Array.isArray(enkaChar.relicList)) {
                  c.relics = c.relics || [];
                  const existingTypes = new Set(c.relics.map(r => Number(r.type ?? r.pos)));

                  enkaChar.relicList.forEach(rawR => {
                    const typeNum = Number(rawR.type);
                    if ((typeNum === 5 || typeNum === 6) && !existingTypes.has(typeNum)) {
                      const tid = String(rawR.tid || '');
                      const setId = tid.length >= 5 ? tid.slice(1, 4) : '';
                      const setDef = SETS_MAP[setId] || KNOWN_NEW_SETS[setId];

                      const setName = isRu
                        ? (setDef?.nameRu || 'Планарный орнамент')
                        : (setDef?.nameEn || 'Planar Ornament');

                      let pieceName = resourceRelicName(relicCatalog, tid, '');
                      if (typeNum === 5) {
                        pieceName = pieceName || (isRu ? (KNOWN_NEW_SETS[setId]?.sphereRu || `${setName}: Сфера`) : (KNOWN_NEW_SETS[setId]?.sphereEn || `${setName}: Sphere`));
                      } else if (typeNum === 6) {
                        pieceName = pieceName || (isRu ? (KNOWN_NEW_SETS[setId]?.ropeRu || `${setName}: Вервь`) : (KNOWN_NEW_SETS[setId]?.ropeEn || `${setName}: Rope`));
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
            // Enka fallback skipped
          }
        }
      }
    }

    if (isForce) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else {
      // Vercel's edge cache serves common UID lookups without invoking this
      // function; stale data is returned while the CDN refreshes it in back.
      res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');
    }
    return res.status(200).json(data);
  } catch (err) {
    console.error('Mihomo Serverless Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
