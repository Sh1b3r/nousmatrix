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

export function calculateExpectedCritMultiplier(critRatePercent, critDamagePercent, critDamageTakenPercent = 0) {
  const critRate = Math.min(1, Math.max(0, (Number(critRatePercent) || 0) / 100));
  const critDamage = Math.max(0, (Number(critDamagePercent) || 0) + (Number(critDamageTakenPercent) || 0));
  return 1 + critRate * critDamage / 100;
}
