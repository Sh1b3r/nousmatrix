// Exact S1-S5 values come from the game's Light Cone rank descriptions;
// Eidolon effects follow the matching in-game rank descriptions.
// Data reference: https://vizualabstract.github.io/StarRailStaticAPI/db/en/light_cone_ranks.json
// and https://vizualabstract.github.io/StarRailStaticAPI/db/en/character_ranks.json
const ACHERON_CONE_EFFECTS = {
  // Values are S1-S5 values from the in-game effect descriptions.
  "23024": { // Along the Passing Shore
    mirageFizzleDamage: [24, 28, 32, 36, 40],
    ultimateDamage: [24, 28, 32, 36, 40]
  },
  "21044": { // Boundless Choreo
    conditionalCritDamage: [24, 30, 36, 42, 48]
  },
  "21001": { // Good Night and Sleep Well
    damagePerDebuff: [12, 15, 18, 21, 24]
  },
  "23007": { // Incessant Rain
    aetherCodeVulnerability: [12, 14, 16, 18, 20],
    critRateAtThreeDebuffs: [12, 14, 16, 18, 20]
  }
};

const HIMEKO_CONE_EFFECTS = {
  "23010": { // Before Dawn
    skillAndUltimateDamage: [18, 21, 24, 27, 30],
    followUpDamage: [48, 56, 64, 72, 80]
  },
  "23000": { // Night on the Milky Way
    attackPerEnemy: [9, 10.5, 12, 13.5, 15],
    damageAfterBreak: [30, 35, 40, 45, 50]
  },
  "21006": { // The Birth of the Self
    followUpDamage: [24, 30, 36, 42, 48],
    lowHpFollowUpDamage: [24, 30, 36, 42, 48]
  }
};

function superimpositionIndex(lightCone) {
  const rank = Number(lightCone?.rank);
  return Math.max(0, Math.min(4, (Number.isFinite(rank) && rank > 0 ? rank : 1) - 1));
}

function equippedConeId(character) {
  return String(character?.light_cone?.id || "");
}

function hasConfiguredEnemyDebuff(options) {
  if (typeof options.enemyDebuffed === "boolean") return options.enemyDebuffed;
  const primaryEnemy = options.enemies?.[0];
  if (typeof primaryEnemy?.isDebuffed === "boolean") return primaryEnemy.isDebuffed;
  if (primaryEnemy?.debuffCount !== null && primaryEnemy?.debuffCount !== undefined
    && Number.isFinite(Number(primaryEnemy.debuffCount))) return Number(primaryEnemy.debuffCount) > 0;
  if (options.enemyDebuffCount !== null && options.enemyDebuffCount !== undefined
    && Number.isFinite(Number(options.enemyDebuffCount))) return Number(options.enemyDebuffCount) > 0;
  return null;
}

function readEnemyDebuffCount(options) {
  if (options.enemyDebuffCount !== null && options.enemyDebuffCount !== undefined
    && Number.isFinite(Number(options.enemyDebuffCount))) {
    return Math.max(0, Math.floor(Number(options.enemyDebuffCount)));
  }
  const primaryEnemy = options.enemies?.[0];
  if (primaryEnemy?.debuffCount !== null && primaryEnemy?.debuffCount !== undefined
    && Number.isFinite(Number(primaryEnemy.debuffCount))) {
    return Math.max(0, Math.floor(Number(primaryEnemy.debuffCount)));
  }
  return null;
}

function resolveAcheronE1CritRate(options) {
  const targets = Array.isArray(options.enemies) ? options.enemies : [];
  if (targets.length > 0) {
    const critRateByTarget = {};
    let missingState = false;
    for (const target of targets) {
      const debuffed = typeof options.enemyDebuffed === "boolean"
        ? options.enemyDebuffed
        : typeof target?.isDebuffed === "boolean"
          ? target.isDebuffed
          : target?.debuffCount !== null && target?.debuffCount !== undefined
            && Number.isFinite(Number(target.debuffCount))
            ? Number(target.debuffCount) > 0
            : null;
      if (debuffed === true) critRateByTarget[String(target.id)] = 18;
      else if (debuffed === null) missingState = true;
    }
    return { critRate: 0, critRateByTarget, missingState };
  }
  const debuffed = hasConfiguredEnemyDebuff(options);
  return {
    critRate: debuffed === true ? 18 : 0,
    critRateByTarget: {},
    missingState: debuffed === null
  };
}

/**
 * Resolve battle-only LC/Eidolon effects for damage scripts that have a
 * corresponding action model. Profile attributes/additions already include
 * equipped-cone base stats and its static property bonuses; those must not be
 * added a second time here.
 */
export function resolveCombatEquipmentEffects(character, matchedTeammates = [], options = {}) {
  const characterId = String(character?.id || "");
  const eidolon = Math.max(0, Number(character?.rank) || 0);
  const coneId = equippedConeId(character);
  const sIndex = superimpositionIndex(character?.light_cone);
  const isAcheron = characterId === "1308";
  const isHimeko = characterId === "1003";
  const enemyHpPercent = options.enemyHpPercent !== null && options.enemyHpPercent !== undefined
    && Number.isFinite(Number(options.enemyHpPercent))
    ? Number(options.enemyHpPercent)
    : null;
  const targetCount = Math.max(1, Number(options.targetCount) || 1);
  const hasTargetHpData = Array.isArray(options.enemies)
    && options.enemies.some((target) => target?.hpPercent !== null && target?.hpPercent !== undefined
      && Number.isFinite(Number(target.hpPercent)));
  const hasCompleteTargetHpData = Array.isArray(options.enemies) && options.enemies.length > 0
    && options.enemies.every((target) => target?.hpPercent !== null && target?.hpPercent !== undefined
      && Number.isFinite(Number(target.hpPercent)));
  const hasExplicitBreakData = typeof options.enemyBroken === "boolean"
    || (Array.isArray(options.enemies) && options.enemies.some((target) => target?.isBreakStateExplicit));
  const hasCompleteBreakData = typeof options.enemyBroken === "boolean"
    || (Array.isArray(options.enemies) && options.enemies.length > 0
      && options.enemies.every((target) => target?.isBreakStateExplicit));

  const result = {
    profileStatsIncluded: true,
    eidolonDamage: {
      critRate: 0,
      critRateByTarget: {},
      ultimateVulnerability: 0,
      ultimateResPen: 0,
      lowHpDamage: 0,
      conditionalLowHpDamage: 0,
      extraUltimateSingleTargetRatio: 0
    },
    lightConeDamage: {
      attackPercent: 0,
      allDamage: 0,
      allDamageByTarget: {},
      skillDamage: 0,
      ultimateDamage: 0,
      followUpDamage: 0,
      followUpDamageAtLowHp: 0,
      damageAfterBreak: 0,
      mirageFizzleDamage: 0,
      critRate: 0,
      critRateByTarget: {},
      critDamage: 0,
      critDamageByTarget: {},
      vulnerability: 0,
      vulnerabilityByTarget: {}
    },
    applied: [],
    notModeled: []
  };

  if (isAcheron) {
    if (eidolon >= 1) {
      const e1CritRate = resolveAcheronE1CritRate(options);
      result.eidolonDamage.critRate += e1CritRate.critRate;
      result.eidolonDamage.critRateByTarget = e1CritRate.critRateByTarget;
      if (e1CritRate.critRate > 0 || Object.keys(e1CritRate.critRateByTarget).length > 0) {
        result.applied.push("Acheron E1: +18% CRIT Rate is applied only to debuffed targets");
      }
      if (e1CritRate.missingState) {
        result.notModeled.push("Acheron E1 CRIT Rate needs explicit debuff states for every target");
      }
    }
    if (eidolon >= 2) {
      // The rotation already assumes the 9-knot cap; E2's extra stack
      // generation changes uptime, not the damage of that capped Ultimate.
      result.applied.push("Acheron E2: Nihility requirement applied; 9-knot script is already capped");
    }
    if (eidolon >= 3) result.applied.push("Acheron E3: upgraded Ultimate multiplier read from profile skill data");
    if (eidolon >= 4) {
      result.eidolonDamage.ultimateVulnerability += 8;
      result.applied.push("Acheron E4: +8% Ultimate DMG vulnerability");
    }
    if (eidolon >= 5) result.applied.push("Acheron E5: upgraded Skill multiplier read from profile skill data");
    if (eidolon >= 6) {
      result.eidolonDamage.ultimateResPen += 20;
      result.applied.push("Acheron E6: +20% RES PEN; Skill is treated as Ultimate DMG");
      result.notModeled.push("Acheron E6 weakness-break behavior requires a toughness event timeline");
    }

    const effects = ACHERON_CONE_EFFECTS[coneId];
    if (!coneId) {
      result.notModeled.push("No Light Cone equipped");
    } else if (!effects) {
      result.notModeled.push(`Conditional Light Cone effect for ${coneId} has no action rule`);
    } else if (coneId === "23024") {
      // Skill applies Mirage Fizzle after its damage. The later Ultimate gets
      // its separate Ultimate bonus, while only marked targets get the first.
      result.lightConeDamage.mirageFizzleDamage += effects.mirageFizzleDamage[sIndex];
      result.lightConeDamage.ultimateDamage += effects.ultimateDamage[sIndex];
      result.applied.push(`Along the Passing Shore S${sIndex + 1}: marked-target and Ultimate bonuses are separated`);
    } else if (coneId === "21044") {
      if (options.enemyTargetsAreExplicit && Array.isArray(options.enemies)) {
        let missingState = false;
        for (const target of options.enemies) {
          const slowed = options.enemySlowed === true || target?.isSlowed === true;
          const defenseReduced = options.enemyDefenseReduced === true || target?.isDefenseReduced === true;
          if (slowed || defenseReduced) {
            result.lightConeDamage.critDamageByTarget[String(target.id)] =
              effects.conditionalCritDamage[sIndex];
          } else if (!(
            (options.enemySlowed === false || target?.isSlowed === false)
            && (options.enemyDefenseReduced === false || target?.isDefenseReduced === false)
          )) {
            missingState = true;
          }
        }
        if (Object.keys(result.lightConeDamage.critDamageByTarget).length > 0) {
          result.applied.push("Boundless Choreo S" + (sIndex + 1) + ": conditional CRIT DMG is evaluated per target");
        }
        if (missingState) {
          result.notModeled.push("Boundless Choreo needs each target's slowed or DEF-reduced state");
        }
      } else if (options.enemySlowed === true || options.enemyDefenseReduced === true) {
        result.lightConeDamage.critDamage += effects.conditionalCritDamage[sIndex];
        result.applied.push("Boundless Choreo S" + (sIndex + 1) + ": conditional CRIT DMG is active");
      } else {
        result.notModeled.push("Boundless Choreo requires a slowed or DEF-reduced target; supply that enemy state to apply its CRIT DMG");
      }
    } else if (coneId === "21001") {
      if (options.enemyTargetsAreExplicit && Array.isArray(options.enemies)) {
        let missingDebuffCount = false;
        for (const target of options.enemies) {
          const debuffCount = target?.debuffCount !== null && target?.debuffCount !== undefined
            && Number.isFinite(Number(target.debuffCount))
            ? Math.max(0, Math.floor(Number(target.debuffCount)))
            : null;
          if (debuffCount === null) {
            missingDebuffCount = true;
            continue;
          }
          const stacks = Math.min(3, debuffCount);
          result.lightConeDamage.allDamageByTarget[String(target.id)] =
            effects.damagePerDebuff[sIndex] * stacks;
        }
        if (missingDebuffCount) {
          result.notModeled.push("Good Night and Sleep Well needs active debuff counts for every enemy target");
        }
        if (Object.keys(result.lightConeDamage.allDamageByTarget).length > 0) {
          result.applied.push("Good Night and Sleep Well S" + (sIndex + 1) + ": bonus is evaluated per target debuff count");
        }
      } else {
        const debuffCount = readEnemyDebuffCount(options);
        if (debuffCount === null) {
          result.notModeled.push("Good Night and Sleep Well needs the target active debuff count; team role is not used as a proxy");
        } else {
          const stacks = Math.min(3, debuffCount);
          result.lightConeDamage.allDamage += effects.damagePerDebuff[sIndex] * stacks;
          result.applied.push("Good Night and Sleep Well S" + (sIndex + 1) + ": " + stacks + "/3 target debuffs");
        }
      }
    } else if (coneId === "23007") {
      if (options.enemyTargetsAreExplicit && Array.isArray(options.enemies)) {
        let missingDebuffCount = false;
        for (const target of options.enemies) {
          const debuffCount = target?.debuffCount !== null && target?.debuffCount !== undefined
            && Number.isFinite(Number(target.debuffCount))
            ? Math.max(0, Math.floor(Number(target.debuffCount)))
            : null;
          if (debuffCount === null) {
            missingDebuffCount = true;
          } else if (debuffCount >= 3) {
            result.lightConeDamage.critRateByTarget[String(target.id)] = effects.critRateAtThreeDebuffs[sIndex];
          }
        }
        if (Object.keys(result.lightConeDamage.critRateByTarget).length > 0) {
          result.applied.push("Incessant Rain S" + (sIndex + 1) + ": CRIT Rate is evaluated per target at 3+ debuffs");
        }
        if (missingDebuffCount) {
          result.notModeled.push("Incessant Rain needs active debuff counts for every target to check its 3-debuff CRIT condition");
        }
      } else {
        const debuffCount = readEnemyDebuffCount(options);
        if (debuffCount !== null && debuffCount >= 3) {
          result.lightConeDamage.critRate += effects.critRateAtThreeDebuffs[sIndex];
          result.applied.push("Incessant Rain S" + (sIndex + 1) + ": +" + effects.critRateAtThreeDebuffs[sIndex] + "% CRIT Rate at 3+ debuffs");
        } else if (debuffCount === null) {
          result.notModeled.push("Incessant Rain needs the target active debuff count to check its 3-debuff CRIT condition");
        }
      }
      if (options.enemyTargetsAreExplicit && Array.isArray(options.enemies)) {
        let missingAetherCodeState = false;
        let hasAetherCodeTarget = false;
        for (const target of options.enemies) {
          if (target?.aetherCodeActive === true) {
            result.lightConeDamage.vulnerabilityByTarget[String(target.id)] = effects.aetherCodeVulnerability[sIndex];
            hasAetherCodeTarget = true;
          } else if (target?.aetherCodeActive === null || target?.aetherCodeActive === undefined) {
            missingAetherCodeState = true;
          }
        }
        if (hasAetherCodeTarget) {
          result.applied.push("Incessant Rain S" + (sIndex + 1) + ": Aether Code vulnerability is applied to marked targets");
          if (missingAetherCodeState) {
            result.notModeled.push("Incessant Rain Aether Code state is missing for some targets");
          }
        } else if (options.aetherCodeActive === true) {
          result.lightConeDamage.vulnerability += effects.aetherCodeVulnerability[sIndex] / targetCount;
          result.applied.push("Incessant Rain S" + (sIndex + 1) + ": active Aether Code averaged across " + targetCount + " targets");
        } else if (missingAetherCodeState) {
          result.notModeled.push("Incessant Rain Aether Code needs explicit target state or a configured active state");
        }
      } else if (options.aetherCodeActive === true) {
        result.lightConeDamage.vulnerability += effects.aetherCodeVulnerability[sIndex] / targetCount;
        result.applied.push("Incessant Rain S" + (sIndex + 1) + ": active Aether Code averaged across " + targetCount + " targets");
      } else {
        result.notModeled.push("Incessant Rain Aether Code is not assumed active without a configured state");
      }
    }
  } else if (isHimeko) {
    result.notModeled.push("Himeko's trace-triggered bonuses and follow-up count need a break/action timeline");
    if (eidolon >= 1) {
      result.notModeled.push("Himeko E1 changes action frequency after a follow-up; this fixed script has no turn timeline");
    }
    if (eidolon >= 2) {
      result.eidolonDamage.conditionalLowHpDamage = 15;
      if (enemyHpPercent !== null && enemyHpPercent <= 50) {
        result.eidolonDamage.lowHpDamage += 15;
        result.applied.push("Himeko E2: +15% DMG versus targets at 50% HP or below");
      } else if (hasTargetHpData) {
        result.applied.push("Himeko E2: +15% DMG is evaluated per target HP state");
        if (!hasCompleteTargetHpData) result.notModeled.push("Himeko E2's target HP is missing for some enemies");
      } else if (enemyHpPercent === null) {
        result.notModeled.push("Himeko E2 depends on target HP; enemyHpPercent was not supplied");
      }
    }
    if (eidolon >= 3) result.applied.push("Himeko E3: upgraded Skill multiplier read from profile skill data");
    if (eidolon >= 4) result.notModeled.push("Himeko E4 adds Charge on Skill Weakness Break; the script has no break/Charge timeline");
    if (eidolon >= 5) result.applied.push("Himeko E5: upgraded Ultimate multiplier read from profile skill data");
    if (eidolon >= 6) {
      result.eidolonDamage.extraUltimateSingleTargetRatio += 0.8;
      result.applied.push("Himeko E6: two extra Ultimate hits, 40% each, added as 0.8x single-target damage");
    }

    const effects = HIMEKO_CONE_EFFECTS[coneId];
    if (!coneId) {
      result.notModeled.push("No Light Cone equipped");
    } else if (!effects) {
      result.notModeled.push(`Conditional Light Cone effect for ${coneId} has no action rule`);
    } else if (coneId === "23010") {
      result.lightConeDamage.skillDamage += effects.skillAndUltimateDamage[sIndex];
      result.lightConeDamage.ultimateDamage += effects.skillAndUltimateDamage[sIndex];
      // The configured Himeko order is Skill -> Ultimate -> Talent follow-up.
      result.lightConeDamage.followUpDamage += effects.followUpDamage[sIndex];
      result.applied.push(`Before Dawn S${sIndex + 1}: Skill/Ultimate and next follow-up bonuses`);
    } else if (coneId === "23000") {
      result.lightConeDamage.attackPercent += effects.attackPerEnemy[sIndex] * Math.min(5, targetCount);
      result.lightConeDamage.damageAfterBreak += effects.damageAfterBreak[sIndex];
      if (hasExplicitBreakData) result.applied.push("Night on the Milky Way: break-triggered DMG is evaluated per target");
      else result.notModeled.push("Night on the Milky Way's break-triggered DMG needs an explicit broken-state input");
      if (hasExplicitBreakData && !hasCompleteBreakData) {
        result.notModeled.push("Night on the Milky Way's break state is missing for some targets");
      }
      if (hasCompleteBreakData) {
        result.notModeled.push("Night on the Milky Way's one-turn DMG duration is not tracked by the fixed action script");
      }
      result.applied.push(`Night on the Milky Way S${sIndex + 1}: ATK bonus for ${Math.min(5, targetCount)} field enemies`);
    } else if (coneId === "21006") {
      result.lightConeDamage.followUpDamage += effects.followUpDamage[sIndex];
      result.lightConeDamage.followUpDamageAtLowHp += effects.lowHpFollowUpDamage[sIndex];
      if (enemyHpPercent !== null && enemyHpPercent <= 50) {
        result.lightConeDamage.followUpDamage += effects.lowHpFollowUpDamage[sIndex];
      } else if (hasTargetHpData) {
        result.applied.push("The Birth of the Self: low-HP follow-up bonus is evaluated per target");
        if (!hasCompleteTargetHpData) result.notModeled.push("The Birth of the Self's target HP is missing for some enemies");
      } else if (enemyHpPercent === null) {
        result.notModeled.push("The Birth of the Self's extra follow-up bonus depends on target HP");
      }
      result.applied.push(`The Birth of the Self S${sIndex + 1}: follow-up attack bonus`);
    }
  } else {
    result.notModeled.push(`Character-specific damage passives for ${characterId} have no exact action script`);
    if (eidolon > 0) result.notModeled.push(`E${eidolon} mechanics for character ${characterId} are not connected to this damage model`);
    if (coneId) result.notModeled.push(`Conditional Light Cone effect for ${coneId} has no action rule`);
  }

  result.coverageStatus = result.notModeled.length > 0 ? "partial" : "modeled";
  return result;
}
