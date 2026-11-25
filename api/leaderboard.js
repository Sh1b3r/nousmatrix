import { Redis } from '@upstash/redis';
import { calculateCharacterAudit } from '../src/utils/audit.js';
import { runFullTeamRotationSimulation } from '../src/utils/rotationSimulation.js';
import {
  checkDamageScenarioEligibility,
  getDamageLeaderboardScenario,
  toPublicDamageScenario
} from '../src/data/damageLeaderboardScenarios.js';

// A board is deliberately scoped to one character and one calculation version.
// Do not reuse a key after changing the score formula: create the next version
// instead, so historical placements never mix incompatible measurements.
const BUILD_INDEX_SCENARIO = Object.freeze({
  gameVersion: '4.7',
  calculationVersion: 'build-index-v1',
  metric: 'nous-build-index',
  metricLabelRu: 'Индекс готовности билда NousMatrix',
  metricLabelEn: 'NousMatrix Build Readiness Index',
  methodologyRu: 'Сравниваются только сборки одного персонажа. Это рейтинг текущего индекса сборки, а не рейтинг урона фиксированной команды.',
  methodologyEn: 'Only builds of the same character are compared. This ranks the current build index, not damage in a fixed team.'
});

function getBoardScenario(characterId, requestedScenarioId = null) {
  const cleanCharacterId = String(characterId || '').trim();
  const damageScenario = getDamageLeaderboardScenario(requestedScenarioId);
  if (damageScenario && damageScenario.status === 'published' && damageScenario.characterId === cleanCharacterId) {
    return { ...toPublicDamageScenario(damageScenario), boardType: 'damage' };
  }
  return {
    ...BUILD_INDEX_SCENARIO,
    characterId: cleanCharacterId,
    id: `hsr-${BUILD_INDEX_SCENARIO.gameVersion}:char-${cleanCharacterId}:${BUILD_INDEX_SCENARIO.calculationVersion}`,
    boardType: 'build-index'
  };
}

function getLeaderboardKey(scenario) {
  return `lb:scenario:${scenario.id}`;
}

function getBuildKey(scenario, uid) {
  return `build:scenario:${scenario.id}:${uid}`;
}

async function fetchVerifiedBuild(uid, characterId) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6500);
  try {
    try {
      const response = await fetch(
        `https://api.mihomo.me/sr_info_parsed/${uid}?lang=en`,
        { headers: { 'User-Agent': 'NousMatrix/1.0 leaderboard verification' }, signal: controller.signal }
      );
      if (!response.ok) throw new Error(`Profile source returned ${response.status}`);

      const profile = await response.json();
      const character = (profile.characters || []).find((item) => String(item?.id) === String(characterId));
      if (!character) throw new Error('Character is not present in the public profile');

      const audit = calculateCharacterAudit(character, 'en');
      const score = Number(audit?.score);
      if (!Number.isFinite(score)) throw new Error('Unable to calculate a verified build score');

      return { profile, character, audit, score: Number(score.toFixed(1)) };
    } catch (cause) {
      const error = new Error(`Profile verification failed: ${cause.message}`);
      error.code = 'PROFILE_VERIFICATION_FAILED';
      throw error;
    }
  } finally {
    clearTimeout(timeout);
  }
}

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

function calculateModelPercentile(score, archetype = 'CRIT_DPS') {
  const numScore = Math.max(0, Math.min(100, Number(score) || 50));
  const dist = ARCHETYPE_DISTRIBUTIONS[archetype] || { mu: 68.5, sigma: 11.2 };
  const z = (numScore - dist.mu) / dist.sigma;
  const cdf = 0.5 * (1 + erf(z / Math.SQRT2));
  const topPercent = Math.min(99.0, Math.max(0.1, (1 - cdf) * 100));
  return {
    topPercent: parseFloat(topPercent.toFixed(1))
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
    const { characterId, uid, limit = 25, scenarioId } = req.query;

    if (!characterId) {
      return res.status(400).json({ error: 'characterId is required' });
    }

    const cleanCharId = String(characterId).trim();
    const scenario = getBoardScenario(cleanCharId, scenarioId);

    if (!redis) {
      return res.status(200).json({
        success: true,
        isLiveDatabase: false,
        characterId: cleanCharId,
        scenario,
        leaderboard: [],
        message: 'Upstash Redis credentials not configured yet. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in environment.'
      });
    }

    try {
      const lbKey = getLeaderboardKey(scenario);
      const total = (await redis.zcard(lbKey)) || 0;

      // If specific UID requested
      if (uid) {
        const cleanUid = String(uid).trim();
        const rank0 = await redis.zrevrank(lbKey, cleanUid);
        if (rank0 === null) {
          return res.status(200).json({
            success: true,
            isLiveDatabase: true,
            scenario,
            found: false,
            characterId: cleanCharId,
            uid: cleanUid
          });
        }
        const rank = rank0 + 1;
        const topPercent = total > 0 ? parseFloat(((rank / total) * 100).toFixed(1)) : 100.0;
        const rawBuild = await redis.get(getBuildKey(scenario, cleanUid));
        const build = typeof rawBuild === 'string' ? JSON.parse(rawBuild) : rawBuild;

        return res.status(200).json({
          success: true,
          isLiveDatabase: true,
          scenario,
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
        const rawBuild = await redis.get(getBuildKey(scenario, entryUid));
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
        scenario,
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
      const damageScenario = getDamageLeaderboardScenario(body.scenarioId);
      const isDamageBoard = Boolean(
        damageScenario && damageScenario.status === 'published' && damageScenario.characterId === cleanCharId
      );
      const scenario = getBoardScenario(cleanCharId, isDamageBoard ? damageScenario.id : null);
      const numScore = parseFloat(Number(score || 0).toFixed(1));

      if (!cleanUid || !cleanCharId || (!isDamageBoard && isNaN(numScore))) {
        return res.status(400).json({ error: 'Valid uid and characterId are required; index boards also require a numerical score' });
      }

      if (!redis) {
        if (isDamageBoard) {
          return res.status(503).json({ error: 'A live leaderboard database is required for damage-board submissions' });
        }
        // A model estimate must never be presented as a player placement.
        const modelEstimate = calculateModelPercentile(numScore, archetype);
        return res.status(200).json({
          success: true,
          isLiveDatabase: false,
          isModelEstimate: true,
          ...modelEstimate,
          score: numScore,
          characterId: cleanCharId,
          scenario,
          uid: cleanUid
        });
      }

      const lbKey = getLeaderboardKey(scenario);
      const buildKey = getBuildKey(scenario, cleanUid);
      const verified = await fetchVerifiedBuild(cleanUid, cleanCharId);
      const verifiedPlayer = verified.profile?.player || {};
      const verifiedCharacter = verified.character;
      let verifiedScore = verified.score;
      let verifiedRotationDmg = null;

      if (isDamageBoard) {
        const eligibility = checkDamageScenarioEligibility(verifiedCharacter, damageScenario);
        if (!eligibility.eligible) {
          return res.status(422).json({
            error: 'Build does not meet this damage leaderboard\'s standardized requirements',
            eligibility,
            scenario
          });
        }

        const standardizedTeam = damageScenario.teammates.map((teammate) => ({
          ...teammate,
          isEquippedInShowcase: false,
          characterName: teammate.nameEn,
          characterIcon: `icon/character/${teammate.id}.png`
        }));
        const rotation = runFullTeamRotationSimulation(
          verifiedCharacter,
          verified.audit.stats,
          { id: damageScenario.id, teammates: standardizedTeam },
          standardizedTeam,
          'en',
          { ...damageScenario.enemy, damageMode: 'avg', language: 'en' }
        );
        const totalDamage = Number(rotation?.rotationTotalDamage);
        if (!Number.isFinite(totalDamage) || totalDamage <= 0) {
          return res.status(422).json({ error: 'The standardized scenario could not calculate cycle damage', scenario });
        }
        verifiedScore = Number(totalDamage.toFixed(1));
        verifiedRotationDmg = verifiedScore;
      }

      // Store in the versioned board for this character and scoring method.
      await redis.zadd(lbKey, { score: verifiedScore, member: cleanUid });

      // Store full build metadata
      const buildData = {
        uid: cleanUid,
        nickname: verifiedPlayer.nickname || nickname || null,
        characterId: cleanCharId,
        scenarioId: scenario.id,
        calculationVersion: scenario.calculationVersion,
        characterName: verifiedCharacter.name || characterName || null,
        score: verifiedScore,
        rotationDmg: verifiedRotationDmg ?? (Number(rotationDmg) || null),
        archetype: verified.audit.archetype || archetype || null,
        cv: verified.audit.cv ? Number(verified.audit.cv) : (cv ? Number(cv) : null),
        spd: verified.audit.spd ? Number(verified.audit.spd) : (spd ? Number(spd) : null),
        stats: verified.audit.stats || stats || null,
        lightCone: verifiedCharacter.light_cone ? {
          name: verifiedCharacter.light_cone.name || null,
          rank: Number(verifiedCharacter.light_cone.rank) || 1,
          level: Number(verifiedCharacter.light_cone.level) || null,
          icon: verifiedCharacter.light_cone.icon || null
        } : (lightCone || null),
        relicSets: (verifiedCharacter.relic_sets || []).map((set) => set?.name).filter(Boolean),
        verifiedAt: new Date().toISOString(),
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
        score: verifiedScore,
        rotationDmg: verifiedRotationDmg,
        characterId: cleanCharId,
        scenario,
        uid: cleanUid
      });
    } catch (err) {
      console.error('Redis POST error:', err);
    if (err?.code === 'PROFILE_VERIFICATION_FAILED') {
      return res.status(502).json({ error: 'Unable to verify the public profile for leaderboard submission' });
    }
    return res.status(500).json({ error: 'Internal database error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
