import benchmarkData from "../data/combatBenchmarks.json";

function normalizedId(value) {
  return value === null || value === undefined || value === "" ? null : String(value);
}

function sameSpeed(left, right) {
  return Number.isFinite(Number(left)) && Number.isFinite(Number(right)) && Math.abs(Number(left) - Number(right)) < 0.05;
}

/**
 * Scores a rotation only against a verified profile with the same combat setup.
 * Profiles use the Fribbels-style 0 / 100 / 200 baseline interpolation.
 */
export function scoreAgainstCombatBenchmark(config, outputDamage) {
  const profiles = Array.isArray(benchmarkData.profiles) ? benchmarkData.profiles : [];
  const profile = profiles.find((candidate) => {
    if (candidate.status !== "verified" || !candidate.verified?.by || !candidate.verified?.at
      || candidate.gameVersion !== benchmarkData.gameVersion
      || candidate.verified.gameVersion !== benchmarkData.gameVersion
      || candidate.rotationStatus !== "verified"
      || candidate.buffUptimeStatus !== "verified"
      || !candidate.rotationEvidence?.length
      || !candidate.buffUptimeEvidence?.length) return false;
    return normalizedId(candidate.characterId) === normalizedId(config.characterId)
      && normalizedId(candidate.teamId) === normalizedId(config.teamId)
      && normalizedId(candidate.eidolon) === normalizedId(config.eidolon)
      && normalizedId(candidate.lightConeId) === normalizedId(config.lightConeId)
      && Number(candidate.superimposition || 1) === Number(config.superimposition || 1)
      && candidate.enemyMode === config.enemyMode
      && candidate.rotationId === config.rotationId
      && candidate.teamSignature === config.teamSignature
      && sameSpeed(candidate.speed, config.speed);
  });

  if (!profile) return null;
  const baseline = Number(profile.outputs?.baseline);
  const benchmark = Number(profile.outputs?.benchmark);
  const perfection = Number(profile.outputs?.perfection);
  const value = Number(outputDamage);
  if (![baseline, benchmark, perfection, value].every(Number.isFinite)
    || baseline < 0 || benchmark <= baseline || perfection <= benchmark || value < 0) return null;

  const percent = value < benchmark
    ? ((value - baseline) / (benchmark - baseline)) * 100
    : 100 + ((value - benchmark) / (perfection - benchmark)) * 100;

  return {
    percent,
    profileId: profile.id,
    gameVersion: profile.gameVersion,
    source: profile.source
  };
}
