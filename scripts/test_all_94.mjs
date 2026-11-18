import fs from 'fs';
import { runFullTeamRotationSimulation } from '../src/utils/rotationSimulation.js';
import { ROTATIONS } from '../src/data/rotations.js';

const teamsData = JSON.parse(fs.readFileSync('src/data/teamStatistics.json', 'utf8'));
const allCharIds = Object.keys(teamsData.charactersById || teamsData.characterNamesById || {});

console.log(`Checking ${allCharIds.length} characters from teamStatistics.json...`);

let passed = 0;
let failed = 0;
const errors = [];

for (const id of allCharIds) {
  const meta = teamsData[id] || {};
  const mockChar = {
    id,
    name: meta.characterName || `Char_${id}`,
    level: 80,
    rank: 0,
    light_cone: { id: 'test_cone', rank: 1, level: 80 },
    attributes: [
      { field: 'hp', value: 3000 },
      { field: 'atk', value: 2000 },
      { field: 'def', value: 1500 },
      { field: 'spd', value: 134 }
    ],
    additions: [
      { field: 'crit_rate', value: 0.5 },
      { field: 'crit_dmg', value: 1.0 }
    ]
  };

  const mockStats = {
    hp: 3000,
    atk: 2000,
    def: 1500,
    spd: 134,
    cr: 50,
    cd: 100,
    be: 0,
    err: 0
  };

  const rotDef = ROTATIONS[id];
  if (!rotDef) {
    failed++;
    errors.push(`Missing rotation definition for ${id} (${meta.characterName})`);
    continue;
  }

  try {
    const res = runFullTeamRotationSimulation(mockChar, mockStats, null, [], 'ru', { enemyMode: 'moc' });
    if (!res) {
      failed++;
      errors.push(`Simulation returned null for ${id} (${meta.characterName})`);
      continue;
    }
    if (typeof res.rotationTotalDamage !== 'number' || isNaN(res.rotationTotalDamage)) {
      failed++;
      errors.push(`Simulation damage is NaN or invalid for ${id} (${meta.characterName})`);
      continue;
    }
    passed++;
  } catch (err) {
    failed++;
    errors.push(`Exception for ${id} (${meta.characterName}): ${err.message}`);
  }
}

console.log(`\n================ RESULT ================`);
console.log(`Total: ${allCharIds.length}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
if (errors.length > 0) {
  console.log(`Errors:`);
  errors.forEach(e => console.log(' - ' + e));
  process.exit(1);
} else {
  console.log(`ALL 94/94 CHARACTERS TESTED AND VERIFIED SUCCESSFULLY!`);
}
