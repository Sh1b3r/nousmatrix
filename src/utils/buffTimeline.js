const DYNAMIC_BUFF_KEYS = new Set([
  "atkGrant", "atkPercent", "cdGrant", "crGrant", "dmgBoost", "resPen", "defShred",
  "allVuln", "vuln", "critVuln", "breakVuln", "beBoost", "breakEff",
  "superBreakFactor", "fuaCd"
]);

function sumBuffSources(matchedTeammates, selectedSources = null) {
  const total = {};
  for (const teammate of matchedTeammates || []) {
    const id = String(teammate.id || "");
    const selectedKeys = selectedSources?.[id];
    if (selectedSources && !Array.isArray(selectedKeys)) continue;
    for (const [key, rawValue] of Object.entries(teammate.dynamicBuffs || {})) {
      if (!DYNAMIC_BUFF_KEYS.has(key)) continue;
      if (selectedSources && !selectedKeys.includes(key)) continue;
      if (typeof rawValue === "number") total[key] = (total[key] || 0) + rawValue;
      else if (typeof rawValue === "boolean" && rawValue) total[key] = true;
    }
  }
  return total;
}

/**
 * Resolve the teammate buffs for one damage event. A verified schedule maps
 * action keys to teammate IDs and the exact buff fields active on that hit.
 * Without a verified schedule, preserve the legacy full-uptime estimate and
 * report it explicitly so it cannot silently masquerade as a timed simulation.
 */
export function getTeamBuffsForAction(squad, matchedTeammates, actionKey) {
  const profile = squad?.buffUptime;
  const verifiedSchedule = profile?.status === "verified"
    && profile.verified?.by
    && profile.verified?.at
    && profile.verified?.gameVersion === squad?.sourceVersion
    && profile.evidence?.some((entry) => entry?.sourceUrl && entry?.gameVersion === squad?.sourceVersion)
    && profile.actions && typeof profile.actions === "object";

  if (!verifiedSchedule) {
    const buffs = sumBuffSources(matchedTeammates);
    return {
      buffs,
      status: Object.keys(buffs).length ? "assumed-full-uptime" : "no-numeric-buffs-configured"
    };
  }

  const activeSources = profile.actions[actionKey] || {};
  return {
    buffs: sumBuffSources(matchedTeammates, activeSources),
    status: "verified-schedule"
  };
}
