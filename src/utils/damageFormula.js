/** Shared Honkai: Star Rail damage formula helpers.
 *
 * Percent inputs are expressed in percentage points (e.g. 20 means 20%),
 * except baseResistance, which is a fraction (e.g. 0.2 means 20%) to match
 * enemy profile data used by the combat simulator.
 */
export function calculateDefenseMultiplier(
  attackerLevel,
  enemyLevel,
  defenseReductionPercent = 0,
  defenseIgnorePercent = 0,
  targetDefensePercent = 0
) {
  const attackerLv = Math.max(1, Number(attackerLevel) || 1);
  const enemyLv = Math.max(1, Number(enemyLevel) || 1);
  const reduction = Math.min(1, Math.max(0, Number(defenseReductionPercent) / 100 || 0));
  const ignore = Math.min(1, Math.max(0, Number(defenseIgnorePercent) / 100 || 0));
  const targetDefense = Math.max(0, Number(targetDefensePercent) / 100 || 0);
  const effectiveDefense = Math.max(0, 1 + targetDefense - reduction - ignore);
  return (attackerLv + 20) / (attackerLv + 20 + (enemyLv + 20) * effectiveDefense);
}

export function calculateResistanceMultiplier(baseResistance, resistancePenetrationPercent = 0) {
  const resistance = Number(baseResistance) || 0;
  const penetration = Number(resistancePenetrationPercent) || 0;
  const effectiveResistance = Math.min(0.9, Math.max(-1, resistance - penetration / 100));
  // HSR's RES multiplier stays linear below zero (unlike Genshin); effective
  // target RES is capped between -100% and +90%.
  return 1 - effectiveResistance;
}

export function calculateToughnessMultiplier(enemyBroken = false) {
  return enemyBroken ? 1 : 0.9;
}

// ---------------------------------------------------------------------------
// Weakness Break damage.
//
// Sources (consistent across Combat Engine Specification official mechanic pages, Matrix Core SRL, and
// community guides): instant Break DMG = base(level) x (0.5 + maxToughness/40)
// x element coefficient x (1 + Break Effect) x DEF x RES x vulnerability x
// mitigation. Break damage cannot crit and does not use ATK or DMG% bonus.
// Base (level multiplier): Lv80 = 3767.5533, Lv70 = 2659.6406.
// Element instant coefficients: Physical/Fire 2.0, Wind 1.5, Ice/Lightning 1.0,
// Quantum/Imaginary 0.5.
// ---------------------------------------------------------------------------

export const BREAK_BASE_DAMAGE_BY_LEVEL = {
  80: 3767.5533,
  70: 2659.6406
};

export const BREAK_INSTANT_ELEMENT_MULTIPLIERS = {
  Physical: 2.0,
  Fire: 2.0,
  Wind: 1.5,
  Lightning: 1.0,
  Ice: 1.0,
  Quantum: 0.5,
  Imaginary: 0.5
};

// Weakness-break DoT applied after the initial hit (per Standard Weakness Break
// and community break guides): Fire Burn 1x/turn x2 turns, Lightning Shock 2x/turn
// x2 turns, Wind Shear 1x per stack x2 turns (3 stacks vs Elite/Boss),
// Physical Bleed 7% of Elite/Boss Max HP per turn x2 turns (per-tick cap =
// the initial break hit: 2 x base x (0.5 + maxToughness/40), x(1+BE)), Ice
// Freeze 1x once. Quantum/Imaginary breaks apply no DoT (Entanglement is
// triggered by attacks, Imprisonment only delays actions).
export const BREAK_DOT_CONFIG = {
  Fire: { perTurnMultiplier: 1, turns: 2 },
  Lightning: { perTurnMultiplier: 2, turns: 2 },
  Wind: { perTurnMultiplier: 1, turns: 2, eliteStacks: 3 },
  Physical: { bleedMaxHpPercent: 7, turns: 2, bleedCapMultiplier: 2 },
  Ice: { perTurnMultiplier: 1, turns: 1 }
};

export function calculateBreakBaseDamage(attackerLevel = 80) {
  const level = Math.floor(Number(attackerLevel) || 80);
  const table = BREAK_BASE_DAMAGE_BY_LEVEL;
  if (table[level] != null) return table[level];
  // Characters cannot exceed level 80; treat unknown levels as level 80.
  return table[80];
}

export function calculateBreakInstantDamage({
  attackerLevel = 80,
  maxToughness,
  element,
  breakEffectPercent = 0,
  defenseMultiplier = 1,
  resistanceMultiplier = 1,
  vulnerabilityMultiplier = 1,
  mitigationMultiplier = 1
}) {
  const elementMultiplier = BREAK_INSTANT_ELEMENT_MULTIPLIERS[String(element || "")];
  const toughness = Number(maxToughness);
  if (!elementMultiplier || !Number.isFinite(toughness) || toughness <= 0) return null;
  const toughnessMultiplier = 0.5 + toughness / 40;
  const beMultiplier = 1 + (Number(breakEffectPercent) || 0) / 100;
  const unrounded = calculateBreakBaseDamage(attackerLevel)
    * toughnessMultiplier * elementMultiplier * beMultiplier
    * defenseMultiplier * resistanceMultiplier * vulnerabilityMultiplier * mitigationMultiplier;
  return Math.max(0, Math.round(unrounded));
}

export function calculateExpectedCritMultiplier(critRatePercent, critDamagePercent, critDamageTakenPercent = 0) {
  const critRate = Math.min(1, Math.max(0, (Number(critRatePercent) || 0) / 100));
  const critDamage = Math.max(0, (Number(critDamagePercent) || 0) + (Number(critDamageTakenPercent) || 0));
  return 1 + critRate * critDamage / 100;
}
