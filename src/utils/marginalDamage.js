import { runCombatSimulation } from "./simulation.js";

// Mid-roll values for a 5-star relic, averaged from the three game-data roll tiers.
// Fractional stats are stored here as fractions and converted to the simulator's
// percentage-point representation when a simulated build is perturbed.
const AVERAGE_ROLL = {
  hpFlat: 38.10376,
  atkFlat: 19.05188,
  defFlat: 19.05188,
  hpPercent: 0.03888,
  atkPercent: 0.03888,
  defPercent: 0.0486,
  spd: 2.3,
  crit_rate: 0.02916,
  crit_dmg: 0.05832,
  effect_hit: 0.03888,
  effect_res: 0.03888,
  break_dmg: 0.05832
};

const SIMULATED_DAMAGE_ARCHETYPES = new Set([
  "CRIT_DPS", "HP_CRIT_DPS", "BREAK_DPS", "MORTENAX_HYBRID"
]);

function readBaseStat(character, field) {
  return Number((character?.attributes || []).find((entry) => entry.field === field)?.value || 0);
}

function createPerturbedStats(stats, character, substat) {
  const next = { ...stats };
  const value = Number(AVERAGE_ROLL[substat.percent ? `${substat.field}Percent` : `${substat.field}Flat`]
    ?? AVERAGE_ROLL[substat.field]);
  if (!Number.isFinite(value) || value <= 0) return null;

  if (["atk", "hp", "def"].includes(substat.field)) {
    next[substat.field] = Number(next[substat.field] || 0) + (substat.percent
      ? readBaseStat(character, substat.field) * value
      : value);
    return next;
  }

  const outputField = {
    crit_rate: "cr",
    crit_dmg: "cd",
    break_dmg: "be",
    effect_hit: "ehr",
    effect_res: "eres"
  }[substat.field] || substat.field;
  next[outputField] = Number(next[outputField] || 0) + value * 100;
  return next;
}

function rollKey(substat) {
  if (["atk", "hp", "def"].includes(substat.field)) {
    return `${substat.field}${substat.percent ? "Percent" : "Flat"}`;
  }
  return substat.field;
}

/**
 * Measure the marginal effect of one average 5-star relic roll by rerunning
 * the same character damage model with only that stat changed. This is a
 * relative stat-weight input, not a claim that the underlying hit model is exact.
 */
export function calculateMarginalDamageWeights(character, stats, archetype, lang = "ru") {
  if (!SIMULATED_DAMAGE_ARCHETYPES.has(archetype)) return null;
  const baseResult = runCombatSimulation(character, stats, archetype, lang);
  const baseDamage = Number(baseResult?.personalDpa);
  if (!Number.isFinite(baseDamage) || baseDamage <= 0) return null;

  const candidates = [
    { field: "atk", percent: false }, { field: "atk", percent: true },
    { field: "hp", percent: false }, { field: "hp", percent: true },
    { field: "def", percent: false }, { field: "def", percent: true },
    { field: "crit_rate" }, { field: "crit_dmg" }, { field: "break_dmg" }
  ];
  const gains = {};
  let maxGain = 0;
  for (const substat of candidates) {
    const perturbedStats = createPerturbedStats(stats, character, substat);
    if (!perturbedStats) continue;
    const nextDamage = Number(runCombatSimulation(character, perturbedStats, archetype, lang)?.personalDpa);
    if (!Number.isFinite(nextDamage)) continue;
    const key = rollKey(substat);
    gains[key] = Math.max(0, nextDamage - baseDamage);
    maxGain = Math.max(maxGain, gains[key]);
  }

  if (maxGain <= 0) return null;
  return Object.fromEntries(Object.entries(gains).map(([key, gain]) => [key, gain / maxGain]));
}

export function getMarginalDamageRollWeight(substat, weights) {
  if (!weights) return null;
  const key = rollKey(substat);
  return Object.hasOwn(weights, key) ? weights[key] : null;
}
