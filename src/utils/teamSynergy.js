import approvedTeams from "../data/approvedTeams.json";

const excludedTeammates = approvedTeams.excludedByCharacter || {};

function satisfiesTeamRequirements(squad) {
  const teammates = squad.teammates || [];
  return (squad.requirements || []).every((requirement) => {
    if (requirement.type === "direct-heal") {
      return teammates.some((teammate) => (teammate.combatTags || []).includes("direct-heal"));
    }
    return true;
  });
}

// Only explicitly reviewed team records are eligible for recommendations.
// The separate 4.7 scratch list contained guesses and is intentionally retired.
export const CHARACTER_SQUADS = Object.fromEntries(
  Object.entries(approvedTeams.teamsByCharacter || {}).map(([characterId, squads]) => [
    characterId,
    (squads || []).filter((squad) =>
      satisfiesTeamRequirements(squad)
      && !(squad.teammates || []).some((teammate) =>
        (excludedTeammates[characterId] || []).includes(String(teammate.id || ""))
      )
    )
  ])
);

export function rankSquadsByShowcase(squads, showcaseCharacters = []) {
  const roster = Array.isArray(showcaseCharacters) ? showcaseCharacters : [];
  if (!Array.isArray(squads) || squads.length < 2 || !roster.length) return squads || [];
  const showcasedIds = new Set(roster.map((character) => String(character.id || "")));
  return squads
    .map((squad, sourceOrder) => ({
      squad,
      sourceOrder,
      rosterMatches: (squad.teammates || []).filter((teammate) => showcasedIds.has(String(teammate.id || ""))).length
    }))
    .sort((a, b) => b.rosterMatches - a.rosterMatches || a.sourceOrder - b.sourceOrder)
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
    const fallbackName = isRu
      ? rec.nameRu || rec.names?.[0] || "Союзник"
      : rec.nameEn || rec.names?.[1] || rec.names?.[0] || "Teammate";
    const dynamicBuffs = { ...(rec.buffValues || {}) };
    const characterName = matchedChar?.name || fallbackName;
    const characterIcon = matchedChar?.avatar?.icon || matchedChar?.icon || rec.icon || (rec.id ? `icon/character/${rec.id}.png` : null);
    const unknownBuildSuffix = isRu
      ? " (фиксированные эффекты из этой записи; статы и длительность баффов не рассчитываются)"
      : " (fixed effects from this team record; build stats and buff uptime are not calculated)";

    return {
      ...rec,
      matchedChar: matchedChar || null,
      characterName,
      characterIcon,
      isEquippedInShowcase: Boolean(matchedChar),
      realStats: matchedChar ? readProfileStats(matchedChar) : null,
      dynamicBuffs,
      dynamicBuffDescRu: `${rec.buffDescRu || ""}${unknownBuildSuffix}`,
      dynamicBuffDescEn: `${rec.buffDescEn || ""}${unknownBuildSuffix}`
    };
  });
}
