import approvedTeams from "../data/approvedTeams.json";
import teamStatistics from "../data/teamStatistics.json";

const excludedTeammates = approvedTeams.excludedByCharacter || {};
const characterNamesById = {
  ...(teamStatistics.characterNamesById || {}),
  ...(approvedTeams.characterNamesById || {})
};
const trustedEvidenceClasses = new Set([
  "verified-statistics",
  "verified-guide",
  "official-creator-guide"
]);
const trustedStatisticsHosts = new Set(["astravoy.net", "huggingface.co"]);

function normalizeName(value) {
  return String(value || "").normalize("NFKC").toLocaleLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
}

function hasValidCharacterIds(squad) {
  return (squad.teammates || []).every((teammate) => {
    const identity = characterNamesById[String(teammate.id || "")];
    return Boolean(identity?.en) && normalizeName(teammate.nameEn) === normalizeName(identity.en);
  });
}

function satisfiesTeamRequirements(squad) {
  const teammates = squad.teammates || [];
  return (squad.requirements || []).every((requirement) => {
    if (requirement.type === "direct-heal") {
      return teammates.some((teammate) => (teammate.combatTags || []).includes("direct-heal"));
    }
    return true;
  });
}

function hasTrustedEvidence(squad) {
  return (squad.evidence || []).some((entry) =>
    entry.source === "user-confirmed"
    || (trustedEvidenceClasses.has(entry.trustClass)
      && entry.sourceUrl
      && entry.gameVersion === approvedTeams.gameVersion)
  );
}

function hasTrustedHistoricalStatistics(squad) {
  return (squad.evidence || []).some((entry) => {
    if (entry.trustClass !== "verified-statistics" || !entry.sourceUrl) return false;

    try {
      const sourceUrl = new URL(entry.sourceUrl);
      const isAstraVoy = sourceUrl.hostname === "astravoy.net"
        && sourceUrl.pathname.startsWith("/hsr/team-comps/");
      const isMocData = sourceUrl.hostname === "huggingface.co"
        && sourceUrl.pathname.startsWith("/datasets/LvlUrArti/MocDataProcessed/");
      return trustedStatisticsHosts.has(sourceUrl.hostname)
        && (isAstraVoy || isMocData)
        && entry.gameVersion === squad.sourceVersion;
    } catch {
      return false;
    }
  });
}

function compareVersions(left, right) {
  const leftParts = String(left || "").split(".").map(Number);
  const rightParts = String(right || "").split(".").map(Number);
  const length = Math.max(leftParts.length, rightParts.length);

  for (let index = 0; index < length; index += 1) {
    const difference = (leftParts[index] || 0) - (rightParts[index] || 0);
    if (difference) return difference;
  }

  return 0;
}

function isReviewedCurrentTeam(squad) {
  const reviewedStatuses = new Set(["verified", "guide-supported", "user-confirmed"]);
  const currentVersion = approvedTeams.gameVersion;
  return reviewedStatuses.has(squad.status)
    && squad.sourceVersion === currentVersion
    && hasValidCharacterIds(squad)
    && hasTrustedEvidence(squad)
    && (squad.evidence || []).some((entry) =>
      entry.gameVersion === currentVersion || entry.source === "user-confirmed"
    );
}

function formatPercent(value) {
  return Number(value || 0).toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function formatModeResult(source) {
  if (source.averageResult === null || source.averageResult === undefined) return "";
  if (source.mode === "pf") return `avg score ${Math.round(source.averageResult).toLocaleString("en-US")}`;
  return `avg ${Number(source.averageResult).toFixed(2)} cycles`;
}

function buildHistoricalSquad(characterId, record, index) {
  const teammateIds = (record.characterIds || []).filter((id) => String(id) !== String(characterId));
  if (teammateIds.length !== 3) return null;

  const teammates = teammateIds.map((id) => {
    const identity = characterNamesById[String(id)];
    if (!identity?.en) return null;
    return {
      id: String(id),
      nameRu: identity.ru || identity.en,
      nameEn: identity.en,
      icon: `icon/character/${id}.png`,
      roleRu: "Союзник в статистической четвёрке",
      roleEn: "Observed teammate",
      dataSourceType: "observed-team-statistics",
      buffDescRu: "Источник подтверждает совместный состав, но баффы и их длительность не входят в расчёт.",
      buffDescEn: "The source records this lineup; ally buffs and their uptime are not included in the calculation."
    };
  });
  if (teammates.some((teammate) => !teammate)) return null;

  const sources = record.sources || [];
  const astraVoy = sources.find((source) => source.sourceId === "astravoy-team-comp-finder");
  const modeSources = sources.filter((source) => source.sourceId === "mocdata-processed");
  const statsVersion = modeSources.length ? "4.6.4" : (astraVoy?.gameVersion || "4.6");
  const sourceCoverage = astraVoy
    ? "4.6 / 4.5 / 4.4"
    : [...new Set(modeSources.map((source) => source.gameVersion))].join(", ");
  const nameRu = teammates.map((teammate) => teammate.nameRu).join(" + ");
  const nameEn = teammates.map((teammate) => teammate.nameEn).join(" + ");
  const sourceSummaryRu = [];
  const sourceSummaryEn = [];

  if (astraVoy) {
    sourceSummaryRu.push(`AstraVoy ${sourceCoverage}: ${Number(astraVoy.observations).toLocaleString("ru-RU")} наблюдений (${formatPercent(astraVoy.usagePct)}%) из ${Number(astraVoy.characterObservationCount).toLocaleString("ru-RU")} по персонажу; ${astraVoy.contextCount} контекстов.`);
    sourceSummaryEn.push(`AstraVoy ${sourceCoverage}: ${Number(astraVoy.observations).toLocaleString("en-US")} observations (${formatPercent(astraVoy.usagePct)}%) out of ${Number(astraVoy.characterObservationCount).toLocaleString("en-US")} for this character across ${astraVoy.contextCount} contexts.`);
  }

  for (const source of modeSources) {
    const result = formatModeResult(source);
    sourceSummaryRu.push(`${source.modeName} ${source.gameVersion}: использование ${formatPercent(source.usagePct)}%; место в исходной таблице ${source.rank}${result ? `, ${result}` : ", средний результат не опубликован"}.`);
    sourceSummaryEn.push(`${source.modeName} ${source.gameVersion}: ${formatPercent(source.usagePct)}% usage; source table rank ${source.rank}${result ? `, ${result}` : ", average result not published"}.`);
  }

  const caveatRu = "Частота показывает зарегистрированное использование, а не рекомендацию или доказательство лучшей силы. Данные относятся к версиям до 4.7 и не ограничены E0; MocDataProcessed не указывает число наблюдений каждой четвёрки. Баффы этой статистической команды в симулятор не подставляются.";
  const caveatEn = "Usage frequency records what appeared in the data; it is not a recommendation or proof of team strength. These records predate 4.7 and are not E0-filtered; MocDataProcessed does not publish a sample count for every lineup. The simulator does not apply buffs for this statistical lineup.";
  const firstSource = sources[0];

  return {
    id: `observed_${characterId}_${index + 1}`,
    nameRu,
    nameEn,
    descRu: `${sourceSummaryRu.join(" ")} ${caveatRu}`,
    descEn: `${sourceSummaryEn.join(" ")} ${caveatEn}`,
    sourceVersion: statsVersion,
    sourceCoverage,
    sourceUpdatedAt: teamStatistics.statisticsSources?.[0]?.retrievedAt || teamStatistics.statisticsSources?.[1]?.retrievedAt || null,
    sourceUrl: firstSource?.sourceUrl || firstSource?.sourceFileUrl || null,
    sourceUrls: sources.map((source) => source.sourceFileUrl || source.sourceUrl).filter(Boolean),
    sourceBadgeRu: astraVoy
      ? `статистика ${astraVoy.gameVersion} · ${Number(astraVoy.observations).toLocaleString("ru-RU")}`
      : `статистика ${statsVersion} · ${modeSources.length} режим${modeSources.length === 1 ? "" : modeSources.length < 5 ? "а" : "ов"}`,
    sourceBadgeEn: astraVoy
      ? `stats ${astraVoy.gameVersion} · ${Number(astraVoy.observations).toLocaleString("en-US")}`
      : `stats ${statsVersion} · ${modeSources.length} mode${modeSources.length === 1 ? "" : "s"}`,
    sourceType: "observed-team-statistics",
    status: "historical-statistics",
    isEstimate: true,
    assumptions: { eidolon: "unknown", mode: "historical-observations" },
    evidence: sources.map((source) => ({
      source: source.sourceName,
      sourceUrl: source.sourceUrl,
      gameVersion: source.gameVersion,
      retrievedAt: teamStatistics.statisticsSources?.find((item) => item.id === source.sourceId)?.retrievedAt || null,
      metric: source.metric,
      trustClass: "verified-statistics",
      note: source.sourceId === "astravoy-team-comp-finder"
        ? `${source.observations} team observations; ${formatPercent(source.usagePct)}% of this character's ${source.characterObservationCount} recorded teams; version coverage ${source.coveredVersions.join(", ")}.`
        : `${source.modeName} ${source.gameVersion}: ${formatPercent(source.usagePct)}% usage, source rank ${source.rank}, average result ${source.averageResult ?? "unavailable"}. Underlying dataset is MocData.`
    })),
    isUserConfirmed: false,
    teammates
  };
}

function isReviewedHistoricalTeam(squad) {
  return squad.status === "historical-statistics"
    && compareVersions(squad.sourceVersion, approvedTeams.gameVersion) < 0
    && hasValidCharacterIds(squad)
    && hasTrustedHistoricalStatistics(squad);
}

const characterIds = new Set([
  ...Object.keys(approvedTeams.teamsByCharacter || {}),
  ...Object.keys(teamStatistics.charactersById || {})
]);

function getTeamSignature(characterId, squad) {
  return [characterId, ...(squad.teammates || []).map((teammate) => String(teammate.id || ""))]
    .sort()
    .join("|");
}

// Statistical records are kept separate from current or user-confirmed lineups
// and remain visibly marked with their actual source version.
export const CHARACTER_SQUADS = Object.fromEntries(
  [...characterIds].map((characterId) => {
    const currentTeams = (approvedTeams.teamsByCharacter?.[characterId] || [])
      .filter((squad) => isReviewedCurrentTeam(squad));
    const currentSignatures = new Set(currentTeams.map((squad) => getTeamSignature(characterId, squad)));
    const historicalTeams = (teamStatistics.teamsByCharacter?.[characterId] || [])
      .map((record, index) => buildHistoricalSquad(characterId, record, index))
      .filter((squad) => squad
        && isReviewedHistoricalTeam(squad)
        && !currentSignatures.has(getTeamSignature(characterId, squad)));
    const allowedTeams = [...currentTeams, ...historicalTeams].filter((squad) =>
      satisfiesTeamRequirements(squad)
      && !(squad.teammates || []).some((teammate) =>
        (excludedTeammates[characterId] || []).includes(String(teammate.id || ""))
      )
    );
    return [characterId, allowedTeams];
  })
);

export const TEAM_DATA_BY_CHARACTER = teamStatistics.charactersById || {};
export const TEAM_STATISTICS_SOURCES = teamStatistics.statisticsSources || [];

export function rankSquadsByShowcase(squads, showcaseCharacters = []) {
  const roster = Array.isArray(showcaseCharacters) ? showcaseCharacters : [];
  if (!Array.isArray(squads) || squads.length < 2 || !roster.length) return squads || [];
  const showcasedIds = new Set(roster.map((character) => String(character.id || "")));
  return squads
    .map((squad, sourceOrder) => ({
      squad,
      sourceOrder,
      userConfirmed: squad.status === "user-confirmed" ? 1 : 0,
      rosterMatches: (squad.teammates || []).filter((teammate) => showcasedIds.has(String(teammate.id || ""))).length
    }))
    .sort((a, b) => b.userConfirmed - a.userConfirmed || b.rosterMatches - a.rosterMatches || a.sourceOrder - b.sourceOrder)
    .map(({ squad }) => squad);
}

function readProfileStats(character) {
  const base = Object.fromEntries((character.attributes || []).map((attribute) => [attribute.field, Number(attribute.value) || 0]));
  const additions = Object.fromEntries((character.additions || []).map((addition) => [addition.field, Number(addition.value) || 0]));
  const get = (field) => (base[field] || 0) + (additions[field] || 0);
  return {
    hp: Math.round(get("hp")),
    atk: Math.round(get("atk")),
    def: Math.round(get("def")),
    spd: Number(get("spd").toFixed(1)),
    cr: Number((get("crit_rate") * 100).toFixed(1)),
    cd: Number((get("crit_dmg") * 100).toFixed(1)),
    be: Number(((additions.break_dmg || 0) * 100).toFixed(1)),
    ehr: Number(((additions.effect_hit || 0) * 100).toFixed(1))
  };
}

export function matchSquadWithShowcase(squad, showcaseCharacters = [], lang = "ru") {
  if (!squad || !Array.isArray(squad.teammates)) return [];
  const isRu = lang === "ru";

  return squad.teammates.map((rec) => {
    const matchedChar = (showcaseCharacters || []).find((character) => String(character.id || "") === String(rec.id || ""));
    const canonicalIdentity = characterNamesById[String(rec.id || "")];
    const acceptedNames = [rec.nameEn, rec.nameRu, canonicalIdentity?.en, canonicalIdentity?.ru]
      .map(normalizeName)
      .filter(Boolean);
    const identityMismatch = Boolean(matchedChar?.name)
      && !acceptedNames.includes(normalizeName(matchedChar.name));
    const fallbackName = isRu
      ? rec.nameRu || rec.names?.[0] || "Союзник"
      : rec.nameEn || rec.names?.[1] || rec.names?.[0] || "Teammate";
    const dynamicBuffs = identityMismatch ? {} : { ...(rec.buffValues || {}) };
    const characterName = matchedChar?.name || fallbackName;
    const characterIcon = matchedChar?.avatar?.icon || matchedChar?.icon || rec.icon || (rec.id ? `icon/character/${rec.id}.png` : null);
    const unknownBuildSuffix = rec.dataSourceType === "observed-team-statistics"
      ? (isRu
        ? " (в статистике зафиксирован состав, но баффы и их активность не рассчитываются)"
        : " (the statistics record the lineup; ally buffs and their uptime are not calculated)")
      : (isRu
        ? " (фиксированные эффекты из этой записи; статы и длительность баффов не рассчитываются)"
        : " (fixed effects from this team record; build stats and buff uptime are not calculated)");
    const identityMismatchSuffix = isRu
      ? " ID персонажа и имя из профиля не совпали; союзник исключён из расчёта."
      : " Profile name does not match this character ID; this ally is excluded from calculations.";

    return {
      ...rec,
      matchedChar: matchedChar || null,
      identityMismatch,
      characterName,
      characterIcon,
      isEquippedInShowcase: Boolean(matchedChar) && !identityMismatch,
      realStats: matchedChar && !identityMismatch ? readProfileStats(matchedChar) : null,
      dynamicBuffs,
      dynamicBuffDescRu: `${rec.buffDescRu || ""}${identityMismatch ? identityMismatchSuffix : unknownBuildSuffix}`,
      dynamicBuffDescEn: `${rec.buffDescEn || ""}${identityMismatch ? identityMismatchSuffix : unknownBuildSuffix}`
    };
  });
}
