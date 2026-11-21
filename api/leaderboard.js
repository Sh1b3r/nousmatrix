import { Redis } from '@upstash/redis';

const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

let redis = null;
if (redisUrl && redisToken) {
  try {
    redis = new Redis({ url: redisUrl, token: redisToken });
  } catch (err) {
    console.error('Failed to initialize Redis client:', err);
  }
}

function erf(x) {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);
  const t = 1 / (1 + p * absX);
  const y = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
  return sign * y;
}

const ARCHETYPE_DISTRIBUTIONS = {
  CRIT_DPS: { mu: 68.5, sigma: 11.2 },
  HP_CRIT_DPS: { mu: 67.5, sigma: 11.0 },
  BREAK_DPS: { mu: 66.0, sigma: 10.8 },
  DOT_DPS: { mu: 65.5, sigma: 10.5 },
  HARMONY_SPD: { mu: 65.0, sigma: 10.0 },
  HARMONY_ATK: { mu: 65.0, sigma: 10.2 },
  HARMONY_CRIT: { mu: 66.5, sigma: 10.5 },
  NIHILITY_DEBUFF: { mu: 64.5, sigma: 10.2 },
  PRESERVATION_DEF: { mu: 64.0, sigma: 10.0 },
  PRESERVATION_HP: { mu: 64.0, sigma: 10.0 },
  ABUNDANCE_ATK: { mu: 64.0, sigma: 10.0 },
  ABUNDANCE_HP: { mu: 63.5, sigma: 9.8 }
};

function calculateFallbackRanking(score, archetype = 'CRIT_DPS', baseSample = 2480) {
  const numScore = Math.max(0, Math.min(100, Number(score) || 50));
  const dist = ARCHETYPE_DISTRIBUTIONS[archetype] || { mu: 68.5, sigma: 11.2 };
  const z = (numScore - dist.mu) / dist.sigma;
  const cdf = 0.5 * (1 + erf(z / Math.SQRT2));
  const topPercent = Math.min(99.0, Math.max(0.1, (1 - cdf) * 100));
  const rank = Math.max(1, Math.round((topPercent / 100) * baseSample));
  return {
    rank,
    total: baseSample,
    topPercent: parseFloat(topPercent.toFixed(1)),
    isLiveDatabase: false
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. GET: Fetch leaderboard or query rank
  if (req.method === 'GET') {
    const { characterId, uid, limit = 25 } = req.query;

    if (!characterId) {
      return res.status(400).json({ error: 'characterId is required' });
    }

    const cleanCharId = String(characterId).trim();

    if (!redis) {
      return res.status(200).json({
        success: true,
        isLiveDatabase: false,
        characterId: cleanCharId,
        leaderboard: [],
        message: 'Upstash Redis credentials not configured yet. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in environment.'
      });
    }

    try {
      const lbKey = `lb:char:${cleanCharId}`;
      const total = (await redis.zcard(lbKey)) || 0;

      // If specific UID requested
      if (uid) {
        const cleanUid = String(uid).trim();
        const rank0 = await redis.zrevrank(lbKey, cleanUid);
        if (rank0 === null) {
          return res.status(200).json({
            success: true,
            isLiveDatabase: true,
            found: false,
            characterId: cleanCharId,
            uid: cleanUid
          });
        }
        const rank = rank0 + 1;
        const topPercent = total > 0 ? parseFloat(((rank / total) * 100).toFixed(1)) : 100.0;
        const rawBuild = await redis.get(`build:${cleanCharId}:${cleanUid}`);
        const build = typeof rawBuild === 'string' ? JSON.parse(rawBuild) : rawBuild;

        return res.status(200).json({
          success: true,
          isLiveDatabase: true,
          found: true,
          rank,
          total,
          topPercent,
          build
        });
      }

      // Fetch top N players
      const maxLimit = Math.min(100, Math.max(1, Number(limit) || 25));
      const topEntries = await redis.zrevrange(lbKey, 0, maxLimit - 1, { withScores: true });

      const leaderboard = [];
      for (let i = 0; i < topEntries.length; i += 2) {
        const entryUid = topEntries[i];
        const entryScore = Number(topEntries[i + 1]);
        const rank = Math.floor(i / 2) + 1;
        const rawBuild = await redis.get(`build:${cleanCharId}:${entryUid}`);
        const build = typeof rawBuild === 'string' ? JSON.parse(rawBuild) : rawBuild;

        leaderboard.push({
          rank,
          uid: entryUid,
          score: entryScore,
          nickname: build?.nickname || `UID ${entryUid.slice(0, 3)}***${entryUid.slice(-2)}`,
          rotationDmg: build?.rotationDmg || null,
          lightCone: build?.lightCone || null,
          cv: build?.cv || null,
          spd: build?.spd || null,
          stats: build?.stats || null,
          relicSets: build?.relicSets || []
        });
      }

      return res.status(200).json({
        success: true,
        isLiveDatabase: true,
        characterId: cleanCharId,
        total,
        leaderboard
      });
    } catch (err) {
      console.error('Redis GET error:', err);
      return res.status(500).json({ error: 'Internal database error', details: err.message });
    }
  }

  // 2. POST: Submit or update build
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const {
        uid,
        characterId,
        characterName,
        nickname,
        score,
        rotationDmg,
        archetype,
        cv,
        spd,
        stats,
        lightCone,
        relicSets
      } = body;

      const cleanUid = String(uid || '').trim().replace(/\D/g, '');
      const cleanCharId = String(characterId || '').trim();
      const numScore = parseFloat(Number(score || 0).toFixed(1));

      if (!cleanUid || !cleanCharId || isNaN(numScore)) {
        return res.status(400).json({ error: 'Valid uid, characterId, and numerical score are required' });
      }

      if (!redis) {
        // Fallback calculation when Redis is not yet connected
        const fallback = calculateFallbackRanking(numScore, archetype);
        return res.status(200).json({
          success: true,
          ...fallback,
          score: numScore,
          characterId: cleanCharId,
          uid: cleanUid
        });
      }

      const lbKey = `lb:char:${cleanCharId}`;
      const buildKey = `build:${cleanCharId}:${cleanUid}`;

      // Store in Redis Sorted Set: ZADD lb:char:{id} score uid
      await redis.zadd(lbKey, { score: numScore, member: cleanUid });

      // Store full build metadata
      const buildData = {
        uid: cleanUid,
        nickname: nickname || null,
        characterId: cleanCharId,
        characterName: characterName || null,
        score: numScore,
        rotationDmg: Number(rotationDmg) || null,
        archetype: archetype || null,
        cv: cv ? Number(cv) : null,
        spd: spd ? Number(spd) : null,
        stats: stats || null,
        lightCone: lightCone || null,
        relicSets: relicSets || [],
        updatedAt: new Date().toISOString()
      };

      await redis.set(buildKey, JSON.stringify(buildData));

      // Query live ranking
      const rank0 = await redis.zrevrank(lbKey, cleanUid);
      const total = await redis.zcard(lbKey);
      const rank = (rank0 !== null ? rank0 : 0) + 1;
      const topPercent = total > 0 ? parseFloat(((rank / total) * 100).toFixed(1)) : 100.0;

      return res.status(200).json({
        success: true,
        isLiveDatabase: true,
        rank,
        total,
        topPercent,
        score: numScore,
        characterId: cleanCharId,
        uid: cleanUid
      });
    } catch (err) {
      console.error('Redis POST error:', err);
      return res.status(500).json({ error: 'Internal database error', details: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
