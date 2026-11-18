// Round 4 tests: run the engine over every generated kit-verified rotation.
// Checks: pipeline engaged (kit-verified warning), finite positive damage,
// and the energy cycle closes without ally energy.
import { runFullTeamRotationSimulation } from "../src/utils/rotationSimulation.js";
import { ROTATIONS } from "../src/data/rotations.js";

const NEW_IDS = ["1001", "1002", "1003", "1005", "1006", "1008", "1013", "1101", "1103", "1104", "1105", "1106", "1109", "1110", "1202", "1203", "1206", "1207", "1208", "1209", "1210", "1211", "1214", "1215", "1217", "1218", "1221", "1223", "1225", "1301", "1302", "1303", "1305", "1306", "1307", "1309", "1313", "1314", "1321", "1403", "1410", "1412", "1502", "1508", "8009"];

let pass = 0, fail = 0;
for (const id of NEW_IDS) {
  const rot = ROTATIONS[id];
  const label = `${id}`;
  if (!rot || rot.status !== "kit-verified") { console.log(`FAIL ${label}: rotation missing/not kit-verified`); fail++; continue; }
  const mainChar = { id, name: id, element: { id: "physical" }, avatar: null, path: null, rarity: 5, level: 80 };
  const mainStats = {
    atk: 2000, hp: 6000, cr: 60, cd: 150, spd: 120,
    be: 0, dmg_boost: 0, sp_rate: 0, def: 1200, ehr: 10, res: 10
  };
  try {
    const res = runFullTeamRotationSimulation(mainChar, mainStats, [], [], "en", {});
    if (!res) { console.log(`FAIL ${label}: null result`); fail++; continue; }
    const warns = res.calculationWarnings || [];
    const kitPipe = warns.some((w) => /official kit multipliers/.test(w));
    const energyWarn = warns.some((w) => /does not close without ally energy/.test(w));
    const dmg = Number(res.rotationTotalDamage);
    const finite = Number.isFinite(dmg) && dmg > 0;
    const problems = [];
    if (!kitPipe) problems.push("kit pipeline warning missing");
    if (energyWarn) problems.push("energy cycle does not close");
    if (!finite) problems.push(`damage not finite/positive: ${dmg}`);
    if (problems.length) { console.log(`FAIL ${label}: ${problems.join("; ")}`); fail++; }
    else { console.log(`PASS ${label}: dmg=${Math.round(dmg)}, steps=${(res.steps || []).length}, warnings=${warns.length}`); pass++; }
  } catch (e) {
    console.log(`FAIL ${label}: exception ${e.message}`); fail++;
  }
}
console.log(`\n${pass}/${pass + fail} PASS`);
if (fail) process.exit(1);
