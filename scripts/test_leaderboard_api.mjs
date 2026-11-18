import handler from '../api/leaderboard.js';

console.log('Testing api/leaderboard.js...');

function createMockRes() {
  return {
    statusCode: 200,
    headers: {},
    setHeader(k, v) { this.headers[k] = v; },
    status(code) { this.statusCode = code; return this; },
    json(data) { this.body = data; return this; },
    end() { return this; }
  };
}

// 1. Test POST fallback ranking
const postReq = {
  method: 'POST',
  body: {
    uid: '700142890',
    characterId: '1102',
    characterName: 'Seele',
    score: 82.5,
    archetype: 'CRIT_DPS'
  }
};
const postRes = createMockRes();

await handler(postReq, postRes);
console.log('POST Response:', postRes.statusCode, postRes.body);

if (!postRes.body.success || !postRes.body.topPercent) {
  console.error('FAIL: POST failed');
  process.exit(1);
}

// 2. Test GET leaderboard
const getReq = {
  method: 'GET',
  query: {
    characterId: '1102'
  }
};
const getRes = createMockRes();

await handler(getReq, getRes);
console.log('GET Response:', getRes.statusCode, getRes.body);

if (!getRes.body.success) {
  console.error('FAIL: GET failed');
  process.exit(1);
}

console.log('ALL LEADERBOARD API TESTS PASSED!');
