import approvedTeams from "../data/approvedTeams.json";
import teamStatistics from "../data/teamStatistics.json";

const excludedTeammates = approvedTeams.excludedByCharacter || {};
const characterNamesById = {
  ...(teamStatistics.characterNamesById || {}),
  ...(approvedTeams.characterNamesById || {})
};

function normalizeName(value) {
  return String(value || "").normalize("NFKC").toLocaleLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
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

export const TEAM_DATA_BY_CHARACTER = teamStatistics.teamsByCharacter || {};
export const TEAM_STATISTICS_SOURCES = teamStatistics.sources || [];

export function rankSquadsByShowcase(squads, showcaseCharacters = []) {
  const roster = Array.isArray(showcaseCharacters) ? showcaseCharacters : [];
  if (!Array.isArray(squads) || squads.length < 2 || !roster.length) return squads || [];

  return squads
    .map((squad, sourceOrder) => {
      const rosterMatches = (squad.teammates || []).reduce((count, teammate) => {
        const hasChar = roster.some((c) => String(c.id || "") === String(teammate.id || ""));
        return hasChar ? count + 1 : count;
      }, 0);
      return { squad, rosterMatches, sourceOrder };
    })
    .sort((a, b) => b.rosterMatches - a.rosterMatches || a.sourceOrder - b.sourceOrder)
    .map(({ squad }) => squad);
}

const SUPPORT_DEFAULT_STATS = {
  "1313": { atk: 3100, def: 1400, hp: 12000, cr: 5, cd: 170, be: 0 },
  "1309": { atk: 4000, def: 1600, hp: 13000, cr: 5, cd: 130, be: 0 },
  "1512": { atk: 4000, def: 1600, hp: 13000, cr: 5, cd: 130, be: 0 },
  "1306": { atk: 3200, def: 1400, hp: 12000, cr: 5, cd: 160, be: 0 },
  "1501": { atk: 2600, def: 1400, hp: 12000, cr: 10, cd: 150, be: 0 },
  "1303": { atk: 2900, def: 1600, hp: 13000, cr: 5, cd: 100, be: 180 },
  "1304": { atk: 1500, def: 4000, hp: 14000, cr: 5, cd: 100, be: 0 },
  "1513": { atk: 3200, def: 1400, hp: 12000, cr: 80, cd: 160, be: 0 },
  "1208": { atk: 1000, def: 1800, hp: 16800, cr: 5, cd: 100, be: 0 },
  "1225": { atk: 2700, def: 1200, hp: 12000, cr: 5, cd: 100, be: 280 },
  "1403": { atk: 3000, def: 1400, hp: 14000, cr: 5, cd: 130, be: 0 },
  "1217": { atk: 2900, def: 1400, hp: 13000, cr: 5, cd: 100, be: 0 },
  "1101": { atk: 2400, def: 1400, hp: 12000, cr: 5, cd: 160, be: 0 },
  "1202": { atk: 2600, def: 1200, hp: 12000, cr: 5, cd: 100, be: 0 },
  "1110": { atk: 2000, def: 1200, hp: 12000, cr: 5, cd: 100, be: 100 },
  "1006": { atk: 2800, def: 1200, hp: 12000, cr: 10, cd: 100, be: 100, ehr: 96 },
  "1506": { atk: 3400, def: 1400, hp: 12000, cr: 100, cd: 180, be: 0 },
  "1218": { atk: 2500, def: 1200, hp: 12000, cr: 5, cd: 100, be: 0, ehr: 120 },
  "8005": { atk: 2600, def: 1200, hp: 12000, cr: 5, cd: 100, be: 220 },
  "8007": { atk: 2800, def: 1400, hp: 12000, cr: 60, cd: 130, be: 0 },
  "1314": { atk: 1800, def: 1200, hp: 12000, cr: 5, cd: 100, be: 150 },
  "1222": { atk: 2600, def: 1200, hp: 12000, cr: 5, cd: 100, be: 160 }
};

export function computeSupportBuffs(rec, stats = {}) {
  const id = String(rec.id || "");
  const buffs = { ...(rec.buffValues || {}) };
  const tag = `${rec.nameRu || ""} ${rec.nameEn || ""}`.toLowerCase();
  const num = (v) => (typeof v === "number" ? v : 0);
  let descRu = null;
  let descEn = null;

  if (id === "1313" || tag.includes("воскресенье") || tag.includes("sunday")) {
    const cd = num(stats.cd) || 170;
    const cdGrant = parseFloat((30 + cd * 0.20).toFixed(1));
    buffs.cdGrant = Math.max(num(buffs.cdGrant), cdGrant);
    buffs.dmgBoost = Math.max(num(buffs.dmgBoost), 60);
    buffs.crGrant = Math.max(num(buffs.crGrant), 20);
    descRu = `100% Продвижение, +${cdGrant}% КУ (от ${cd.toFixed(0)}% КУ), +60% Урон, +20% КШ`;
    descEn = `100% Target Advance, +${cdGrant}% Crit DMG, +60% DMG, +20% CRIT Rate`;
  } else if (id === "1309" || id === "1512" || tag.includes("зарянка") || tag.includes("robin")) {
    const atk = num(stats.atk) || 4000;
    const atkGrant = Math.round(atk * 0.228 + 200);
    buffs.atkGrant = Math.max(num(buffs.atkGrant), atkGrant);
    buffs.dmgBoost = Math.max(num(buffs.dmgBoost), 50);
    buffs.fuaCd = Math.max(num(buffs.fuaCd), 25);
    descRu = `100% Продвижение отряда, +${atkGrant} ATK, +50% Урон, +25% КУ бонус-атак`;
    descEn = `100% Team Advance, +${atkGrant} ATK, +50% DMG, +25% FUA Crit DMG`;
  } else if (id === "1306" || id === "1501" || tag.includes("искорка") || tag.includes("sparkle") || tag.includes("спаркси")) {
    const cd = num(stats.cd) || 160;
    const cdGrant = parseFloat((45 + cd * 0.24).toFixed(1));
    buffs.cdGrant = Math.max(num(buffs.cdGrant), cdGrant);
    buffs.dmgBoost = Math.max(num(buffs.dmgBoost), 48);
    buffs.atkPercent = Math.max(num(buffs.atkPercent), 15);
    descRu = `+50% Продвижение, +${cdGrant}% КУ, +48% Урон, +15% ATK`;
    descEn = `+50% Advance, +${cdGrant}% Crit DMG, +48% DMG, +15% ATK`;
  } else if (id === "1303" || tag.includes("жуань") || tag.includes("ruan")) {
    buffs.dmgBoost = Math.max(num(buffs.dmgBoost), 68);
    buffs.resPen = Math.max(num(buffs.resPen), 25);
    buffs.breakEff = Math.max(num(buffs.breakEff), 50);
    buffs.beBoost = Math.max(num(buffs.beBoost), 20);
    descRu = `+68% Урон, +25% All-Type RES PEN, +10% SPD, +50% Эффективность пробития`;
    descEn = `+68% DMG, +25% All-Type RES PEN, +10% SPD, +50% Break Efficiency`;
  } else if (id === "1110" || tag.includes("пела") || tag.includes("pela")) {
    buffs.defShred = Math.max(num(buffs.defShred), 56);
    descRu = `-56% Защита врагов (сверхспособность 40% + конус «Решимость» 16%)`;
    descEn = `-56% Enemy DEF Shred (Ultimate 40% + Resolution 16%)`;
  } else if (id === "1006" || id === "1506" || tag.includes("волк") || tag.includes("wolf")) {
    buffs.defShred = Math.max(num(buffs.defShred), 53);
    buffs.resPen = Math.max(num(buffs.resPen), 13);
    descRu = `-53% Защита (ульт 45% + дебафф 8%), +13% All-Type RES Shred`;
    descEn = `-53% DEF Shred (Ult 45% + Bug 8%), +13% All-Type RES Shred`;
  } else if (id === "1218" || tag.includes("цзяоцю") || tag.includes("jiaoqiu")) {
    buffs.allVuln = Math.max(num(buffs.allVuln), 35);
    buffs.vuln = Math.max(num(buffs.vuln), 15);
    descRu = `+35% Общая уязвимость (Ashen Roast), +15% Уязвимость сверхспособностей`;
    descEn = `+35% All-Type Vulnerability (Ashen Roast), +15% Ultimate Vulnerability`;
  } else if (id === "1202" || tag.includes("тиньюнь") || tag.includes("tingyun")) {
    buffs.atkPercent = Math.max(num(buffs.atkPercent), 50);
    buffs.dmgBoost = Math.max(num(buffs.dmgBoost), 50);
    descRu = `+50% ATK (навык), +50% Урон (ульт), +50 энергии цели`;
    descEn = `+50% ATK (Skill), +50% DMG (Ult), +50 Energy Grant`;
  } else if (id === "1101" || tag.includes("броня") || tag.includes("bronya")) {
    const cd = num(stats.cd) || 160;
    const cdGrant = parseFloat((16 + cd * 0.16).toFixed(1));
    buffs.dmgBoost = Math.max(num(buffs.dmgBoost), 66);
    buffs.cdGrant = Math.max(num(buffs.cdGrant), cdGrant);
    buffs.atkPercent = Math.max(num(buffs.atkPercent), 55);
    descRu = `100% Продвижение, +66% Урон, +${cdGrant}% КУ, +55% ATK`;
    descEn = `100% Advance, +66% DMG, +${cdGrant}% Crit DMG, +55% ATK`;
  } else if (id === "1304" || tag.includes("авантюрин") || tag.includes("aventurine")) {
    buffs.critVuln = Math.max(num(buffs.critVuln), 15);
    descRu = `+15% Крит-уязвимость врагов (ульт), +50% Сопротивление эффектам отряда`;
    descEn = `+15% Crit DMG Vulnerability (Ult), +50% Team Effect RES`;
  } else if (id === "1208" || tag.includes("фу сюань") || tag.includes("fu xuan")) {
    buffs.crGrant = Math.max(num(buffs.crGrant), 12);
    buffs.cdGrant = Math.max(num(buffs.cdGrant), 30);
    descRu = `+12% КШ, +30% КУ отряду, распределение урона матрицы`;
    descEn = `+12% CRIT Rate, +30% Crit DMG, Matrix DMG Mitigation`;
  } else if (id === "1217" || tag.includes("хохо") || tag.includes("huohuo")) {
    buffs.atkPercent = Math.max(num(buffs.atkPercent), 40);
    descRu = `+40% ATK, +20% энергии отряду, непрерывное рассеивание дебаффов`;
    descEn = `+40% ATK, +20% Team Energy, Continuous Cleanse`;
  } else if (id === "8005" || id === "8006" || tag.includes("первопроходец (гармония)") || tag.includes("trailblazer (harmony)")) {
    buffs.breakEff = Math.max(num(buffs.breakEff), 30);
    buffs.beBoost = Math.max(num(buffs.beBoost), 30);
    buffs.superBreakFactor = Math.max(num(buffs.superBreakFactor), 1.6);
    descRu = `Суперпробитие отряда (160%), +30% Эффективность пробития, передача ЭП`;
    descEn = `Team Super Break (160%), +30% Break Efficiency, BE Share`;
  } else if (id === "1225" || tag.includes("фуга") || tag.includes("fugue")) {
    buffs.defShred = Math.max(num(buffs.defShred), 40);
    buffs.breakEff = Math.max(num(buffs.breakEff), 30);
    buffs.superBreakFactor = Math.max(num(buffs.superBreakFactor), 1.0);
    descRu = `-40% DEF Shred, +30% Эффективность пробития, активация Суперпробития`;
    descEn = `-40% DEF Shred, +30% Break Efficiency, Super Break Activation`;
  } else if (id === "1403" || tag.includes("трибби") || tag.includes("tribbie")) {
    buffs.resPen = Math.max(num(buffs.resPen), 30);
    buffs.allVuln = Math.max(num(buffs.allVuln), 24);
    descRu = `+30% All-Type RES PEN, +24% Общая уязвимость врагов`;
    descEn = `+30% All-Type RES PEN, +24% All-Type Vulnerability`;
  } else if (id === "1222" || tag.includes("линша") || tag.includes("lingsha")) {
    buffs.breakVuln = Math.max(num(buffs.breakVuln), 25);
    buffs.breakEff = Math.max(num(buffs.breakEff), 50);
    descRu = `+25% Уязвимость к пробитию, +50% Эффективность пробития`;
    descEn = `+25% Break DMG Vulnerability, +50% Break Efficiency`;
  }

  return { buffs, descRu, descEn };
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

    const characterName = matchedChar?.name || fallbackName;
    const characterIcon = matchedChar?.avatar?.icon || matchedChar?.icon || rec.icon || (rec.id ? `icon/character/${rec.id}.png` : null);

    const statsForBuffs = matchedChar && !identityMismatch
      ? readProfileStats(matchedChar)
      : (SUPPORT_DEFAULT_STATS[String(rec.id || "")] || { atk: 3000, def: 1400, hp: 12000, cr: 5, cd: 120, be: 100 });

    const computed = computeSupportBuffs(rec, statsForBuffs);
    const dynamicBuffs = identityMismatch ? {} : computed.buffs;
    const isShowcase = Boolean(matchedChar) && !identityMismatch;

    const sourceTagRu = isShowcase
      ? " (статы из витрины)"
      : " (эталонная синергия отряда)";
    const sourceTagEn = isShowcase
      ? " (stats from showcase)"
      : " (squad baseline synergy)";

    return {
      ...rec,
      matchedChar: matchedChar || null,
      identityMismatch,
      characterName,
      characterIcon,
      isEquippedInShowcase: isShowcase,
      realStats: isShowcase ? statsForBuffs : null,
      dynamicBuffs,
      dynamicBuffDescRu: `${computed.descRu || rec.buffDescRu || ""}${sourceTagRu}`,
      dynamicBuffDescEn: `${computed.descEn || rec.buffDescEn || ""}${sourceTagEn}`
    };
  });
}
