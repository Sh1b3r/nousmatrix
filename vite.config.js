import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { SET_DEFINITIONS } from './src/utils/setDefinitions.js';

const SETS_MAP = {};
(SET_DEFINITIONS || []).forEach(s => {
  if (s.id) SETS_MAP[String(s.id)] = s;
});

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

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'mihomo-dev-proxy',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url && req.url.startsWith('/api/mihomo')) {
            try {
              const url = new URL(req.url, 'http://localhost:3000');
              const uid = url.searchParams.get('uid');
              const lang = url.searchParams.get('lang') || 'en';
              const isRu = lang === 'ru' || lang === 'uk' || lang === 'be';
              const targetLang = isRu ? 'ru' : 'en';

              if (!uid) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'UID is required' }));
                return;
              }

              const isForce = Boolean(url.searchParams.get('force') || url.searchParams.get('_t') || url.searchParams.get('is_force_update'));
              const forceParam = isForce ? '&is_force_update=true' : '';
              const cacheBuster = isForce ? `&_t=${Date.now()}` : '';

              const upstream = await fetch(`https://api.mihomo.me/sr_info_parsed/${uid}?lang=${targetLang}${forceParam}${cacheBuster}`, {
                headers: {
                  'User-Agent': 'NousMatrix/1.0',
                  ...(isForce ? { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' } : {})
                }
              });

              if (!upstream.ok) {
                res.statusCode = upstream.status;
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Access-Control-Allow-Origin', '*');
                const text = await upstream.text();
                res.end(text);
                return;
              }

              const data = await upstream.json();

              // Merge ornaments if present
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

                // Check raw sr_info fallback if planar relics are missing
                const hasMissingPlanar = data.characters.some(c => {
                  const relics = c.relics || [];
                  const hasSphere = relics.some(r => Number(r.type ?? r.pos) === 5 || String(r.id).endsWith('5'));
                  const hasRope = relics.some(r => Number(r.type ?? r.pos) === 6 || String(r.id).endsWith('6'));
                  return !hasSphere || !hasRope;
                });

                if (hasMissingPlanar) {
                  try {
                    const rawRes = await fetch(`https://api.mihomo.me/sr_info/${uid}${forceParam}${cacheBuster}`, {
                      headers: {
                        'User-Agent': 'NousMatrix/1.0',
                        ...(isForce ? { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' } : {})
                      }
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
                    // ignore dev fallback error
                  }
                }
              }

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              if (isForce) {
                res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
              }
              res.end(JSON.stringify(data));
              return;
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
              return;
            }
          }
          next();
        });
      }
    }
  ],
  server: {
    port: 3000
  }
});
