// 5★ relic substat rolls from the game's resource data (low / mid / high).
// Mihomo exposes percentage affixes as fractions (e.g. 0.0324 = 3.24%).
// Source: StarRailRes `relic_sub_affixes.json`; values are cross-checked against
// the HSR Wiki and Prydwen's relic stat tables.
export const FIVE_STAR_SUBSTAT_ROLLS = Object.freeze({
  hp: [33.870008, 38.10376, 42.33751],
  atk: [16.935004, 19.05188, 21.168754],
  def: [16.935004, 19.05188, 21.168754],
  hp_percent: [0.03456, 0.03888, 0.0432],
  atk_percent: [0.03456, 0.03888, 0.0432],
  def_percent: [0.0432, 0.0486, 0.054],
  spd: [2, 2.3, 2.6],
  crit_rate: [0.02592, 0.02916, 0.0324],
  crit_dmg: [0.05184, 0.05832, 0.0648],
  effect_hit: [0.03456, 0.03888, 0.0432],
  effect_res: [0.03456, 0.03888, 0.0432],
  break_dmg: [0.05184, 0.05832, 0.0648]
});

function getRollTableKey(sub = {}) {
  const field = String(sub.field || "");
  if (!field) return null;
  if (["hp", "atk", "def"].includes(field)) return sub.percent ? `${field}_percent` : field;
  return field;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Measures the value of all rolls on one substat against its theoretical
 * maximum. It intentionally uses the unrounded API value and only rounds for
 * presentation, so a 5× high roll is 100%, while a 5× low roll is 80%.
 */
export function getSubstatRollQuality(sub) {
  const values = FIVE_STAR_SUBSTAT_ROLLS[getRollTableKey(sub)];
  const value = Number(sub?.value);
  const count = Math.max(1, Math.round(Number(sub?.count) || 1));
  if (!values || !Number.isFinite(value) || value <= 0) return null;

  const [low, average, high] = values;
  const rawRatio = value / (high * count);
  return {
    count,
    value,
    lowTotal: low * count,
    averageTotal: average * count,
    maxTotal: high * count,
    // API/display rounding can put a valid value marginally above the table.
    ratio: clamp(rawRatio, 0, 1),
    percent: clamp(rawRatio * 100, 0, 100)
  };
}

/** Weighted by actual number of rolls, never by the number of stat lines. */
export function getRelicRollQuality(relics = []) {
  let maxTotal = 0;
  let valueTotal = 0;
  let rolls = 0;

  relics.forEach((relic) => {
    (relic?.sub_affix || []).forEach((sub) => {
      const quality = getSubstatRollQuality(sub);
      if (!quality) return;
      maxTotal += quality.maxTotal;
      valueTotal += Math.min(quality.value, quality.maxTotal);
      rolls += quality.count;
    });
  });

  if (!maxTotal || !rolls) return null;
  return {
    percent: clamp((valueTotal / maxTotal) * 100, 0, 100),
    ratio: clamp(valueTotal / maxTotal, 0, 1),
    rolls
  };
}
