import {
  calculateDefenseMultiplier,
  calculateExpectedCritMultiplier,
  calculateResistanceMultiplier,
  calculateToughnessMultiplier
} from "./damageFormula.js";

const ACTION_GAUGE = 10000;
const DEFAULT_MAX_EVENTS = 1000;
const TIMED_MODIFIER_FIELDS = new Set([
  "attackFlat", "attackPercent", "hpFlat", "hpPercent", "defenseFlat", "defensePercent",
  "critRatePercent", "critDamagePercent", "damageBonusPercent", "defenseReductionPercent",
  "resistancePenetrationPercent", "vulnerabilityPercent", "critVulnerabilityPercent"
]);

function asFiniteNumber(value, fallback = null) {
  if (value === null || value === undefined || value === "") return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function activeModifierTotal(actor, field, now) {
  return (actor.modifiers || [])
    .filter((modifier) => modifier.field === field && modifier.expiresAt > now)
    .reduce((sum, modifier) => sum + modifier.value, 0);
}

function expireActorModifiers(actor, now) {
  actor.modifiers = (actor.modifiers || []).filter((modifier) => modifier.expiresAt > now);
}

function normalizeAction(action, actorId, index) {
  if (!action || typeof action !== "object") return null;
  return {
    ...action,
    key: String(action.key || `${actorId}:action-${index + 1}`),
    energyCost: Math.max(0, asFiniteNumber(action.energyCost, 0)),
    energyGain: Math.max(0, asFiniteNumber(action.energyGain, 0)),
    skillPointCost: Math.max(0, Math.floor(asFiniteNumber(action.skillPointCost, 0))),
    skillPointGain: Math.max(0, Math.floor(asFiniteNumber(action.skillPointGain, 0)))
  };
}

function normalizeActor(raw, index, warnings) {
  const id = String(raw?.id || `actor-${index + 1}`);
  if (!raw || typeof raw !== "object") {
    warnings.push(`Actor ${id} omitted: actor input must be an object.`);
    return null;
  }
  const speed = asFiniteNumber(raw?.speed);
  const hasUsableSpeed = speed !== null && speed > 0;
  const interval = hasUsableSpeed ? ACTION_GAUGE / speed : null;
  const maxHp = asFiniteNumber(raw.maxHp);
  const currentHp = asFiniteNumber(raw.currentHp, maxHp);
  const maxToughness = asFiniteNumber(raw.maxToughness);
  const explicitCurrentToughness = asFiniteNumber(raw.currentToughness);
  const currentToughness = explicitCurrentToughness
    ?? (raw.isBroken === true ? 0 : maxToughness);
  const toughnessStateFromBar = currentToughness === null ? null : currentToughness <= 0;
  if (typeof raw.isBroken === "boolean" && toughnessStateFromBar !== null
    && raw.isBroken !== toughnessStateFromBar) {
    warnings.push(`Actor ${id}: isBroken conflicts with current Toughness; current Toughness is used.`);
  }
  const combatStats = raw.combatStats && typeof raw.combatStats === "object"
    ? raw.combatStats
    : raw.stats && typeof raw.stats === "object" ? raw.stats : {};
  const level = asFiniteNumber(raw.level ?? combatStats.level);
  const energyCap = asFiniteNumber(raw.energyCap);
  const energy = asFiniteNumber(raw.energy, 0);
  const actions = (Array.isArray(raw.actions) ? raw.actions : [])
    .map((action, actionIndex) => normalizeAction(action, id, actionIndex))
    .filter(Boolean);

  if (actions.length > 0 && !hasUsableSpeed) {
    warnings.push(`Actor ${id} omitted: scripted actions require a positive explicit speed.`);
    return null;
  }

  return {
    id,
    name: String(raw.name || id),
    kind: raw.kind === "enemy" ? "enemy" : "ally",
    level,
    combatStats,
    speed: hasUsableSpeed ? speed : null,
    interval,
    nextActionAt: actions.length > 0 ? Math.max(0, asFiniteNumber(raw.initialActionValue, interval)) : null,
    maxHp: maxHp !== null && maxHp > 0 ? maxHp : null,
    hp: maxHp !== null && maxHp > 0
      ? clamp(currentHp ?? maxHp, 0, maxHp)
      : null,
    maxToughness: maxToughness !== null && maxToughness >= 0 ? maxToughness : null,
    toughness: maxToughness !== null && maxToughness >= 0
      ? clamp(currentToughness ?? maxToughness, 0, maxToughness)
      : null,
    isBroken: toughnessStateFromBar ?? (typeof raw.isBroken === "boolean" ? raw.isBroken : null),
    weaknesses: Array.isArray(raw.weaknesses) ? raw.weaknesses : [],
    resistancesPercent: raw.resistancesPercent && typeof raw.resistancesPercent === "object"
      ? raw.resistancesPercent
      : null,
    resistanceDataComplete: raw.resistanceDataComplete === true,
    resistancePercent: asFiniteNumber(raw.resistancePercent),
    vulnerabilityPercent: asFiniteNumber(raw.vulnerabilityPercent, 0),
    critVulnerabilityPercent: asFiniteNumber(raw.critVulnerabilityPercent, 0),
    defenseReductionPercent: asFiniteNumber(raw.defenseReductionPercent, 0),
    modifiers: Array.isArray(raw.modifiers) ? raw.modifiers
      .filter((modifier) => modifier && TIMED_MODIFIER_FIELDS.has(modifier.field)
        && Number.isFinite(Number(modifier.value)) && Number.isFinite(Number(modifier.expiresAt)))
      .map((modifier) => ({
        key: String(modifier.key || "initial:" + modifier.field),
        field: modifier.field,
        value: Number(modifier.value),
        expiresAt: Number(modifier.expiresAt),
        sourceActorId: modifier.sourceActorId || null
      })) : [],
    shield: Math.max(0, asFiniteNumber(raw.shield, 0)),
    energy: Math.min(energyCap !== null && energyCap > 0 ? energyCap : Number.POSITIVE_INFINITY, Math.max(0, energy)),
    energyCap: energyCap !== null && energyCap > 0 ? energyCap : null,
    actions,
    actionIndex: 0,
    repeatActions: raw.repeatActions !== false,
    turnCount: 0,
    insertionOrder: index
  };
}

function readCombatStat(stats, ...keys) {
  for (const key of keys) {
    if (!key) continue;
    const value = asFiniteNumber(stats?.[key]);
    if (value !== null) return value;
  }
  return null;
}

function resolveTargetResistancePercent(target, element) {
  if (element && target.resistancesPercent) {
    const lowercase = String(element).toLowerCase();
    const aliases = element === "Thunder" ? ["Lightning", "thunder", "lightning"]
      : element === "Lightning" ? ["Thunder", "thunder", "lightning"] : [];
    for (const key of [element, lowercase, ...aliases]) {
      const value = asFiniteNumber(target.resistancesPercent[key]);
      if (value !== null) return value;
    }
  }
  if (element && target.resistanceDataComplete) return 0;
  if (target.resistancePercent !== null) return target.resistancePercent;
  if (element && target.weaknesses.includes(element)) return 0;
  return null;
}

function calculateDirectDamage(actor, target, effect, warnings, now) {
  const formula = effect.formula;
  const fail = (reason) => {
    warnings.push(`${effect.key || "Damage action"}: direct-damage formula omitted; ${reason}.`);
    return null;
  };
  if (!formula || formula.type !== "direct") return fail("unsupported or missing formula type");
  if (actor.kind !== "ally" || target.kind !== "enemy") {
    return fail("direct-damage formulas currently support allied attacks against enemy targets");
  }

  const scalingStat = String(formula.scalingStat || "attack");
  const resolveScaledStat = (field) => {
    const base = readCombatStat(actor.combatStats, field, field === "attack" ? "atk" : null,
      field === "defense" ? "def" : null);
    if (base === null) return null;
    const flat = activeModifierTotal(actor, field + "Flat", now);
    const percent = activeModifierTotal(actor, field + "Percent", now);
    if (percent !== 0) {
      const baseKeys = {
        attack: ["baseAttack", "baseAtk", "base_atk"],
        hp: ["baseHp", "base_hp"],
        defense: ["baseDefense", "baseDef", "base_def"]
      }[field] || [];
      const baseStat = readCombatStat(actor.combatStats, ...baseKeys);
      if (baseStat === null) return null;
      return base + flat + baseStat * percent / 100;
    }
    return base + flat;
  };
  const scalingValue = scalingStat === "attack" ? resolveScaledStat("attack")
    : scalingStat === "hp" ? resolveScaledStat("hp")
      : scalingStat === "defense" ? resolveScaledStat("defense") : null;
  const percentModifierField = scalingStat + "Percent";
  if (scalingValue === null) {
    const baseStatKeys = {
      attack: ["baseAttack", "baseAtk", "base_atk"],
      hp: ["baseHp", "base_hp"],
      defense: ["baseDefense", "baseDef", "base_def"]
    }[scalingStat] || [];
    if (activeModifierTotal(actor, percentModifierField, now) !== 0
      && readCombatStat(actor.combatStats, ...baseStatKeys) === null) {
      return fail(`attacker base ${scalingStat} is needed for the active percentage modifier`);
    }
    return fail(`attacker ${scalingStat} stat is missing`);
  }

  const attackerLevel = asFiniteNumber(formula.attackerLevel, actor.level);
  const targetLevel = asFiniteNumber(formula.targetLevel, target.level);
  if (attackerLevel === null || targetLevel === null) return fail("attacker or target level is missing");

  const element = String(formula.element || "");
  if (!element) return fail("damage element is missing");
  const resistancePercent = resolveTargetResistancePercent(target, element);
  if (resistancePercent === null) return fail(`target RES for ${element} is missing`);

  const broken = typeof target.isBroken === "boolean"
    ? target.isBroken
    : typeof formula.targetBroken === "boolean" ? formula.targetBroken : null;
  if (typeof broken !== "boolean") return fail("target Toughness state is missing");

  const canCrit = formula.canCrit !== false;
  const baseCritRate = canCrit ? readCombatStat(actor.combatStats, "critRatePercent") : 0;
  const baseCritDamage = canCrit ? readCombatStat(actor.combatStats, "critDamagePercent") : 0;
  if (canCrit && (baseCritRate === null || baseCritDamage === null)) {
    return fail("attacker CRIT Rate or CRIT DMG is missing");
  }
  const critRate = (baseCritRate || 0) + (canCrit ? activeModifierTotal(actor, "critRatePercent", now) : 0)
    + (canCrit ? asFiniteNumber(formula.critRatePercent, 0) || 0 : 0);
  const critDamage = (baseCritDamage || 0) + (canCrit ? activeModifierTotal(actor, "critDamagePercent", now) : 0)
    + (canCrit ? asFiniteNumber(formula.critDamagePercent, 0) || 0 : 0);

  const motionValue = asFiniteNumber(formula.motionValue);
  if (motionValue === null || motionValue < 0) return fail("a non-negative motion value is required");
  const damageBonusPercent = (readCombatStat(actor.combatStats, "damageBonusPercent") || 0)
    + activeModifierTotal(actor, "damageBonusPercent", now)
    + (asFiniteNumber(formula.elementDamageBonusPercent,
      asFiniteNumber(actor.combatStats.elementDamageBonuses?.[element], 0)) || 0)
    + (asFiniteNumber(formula.damageBonusPercent, 0) || 0);
  const defenseReductionPercent = (readCombatStat(actor.combatStats, "defenseReductionPercent") || 0)
    + activeModifierTotal(actor, "defenseReductionPercent", now)
    + target.defenseReductionPercent
    + activeModifierTotal(target, "defenseReductionPercent", now)
    + (asFiniteNumber(formula.defenseReductionPercent, 0) || 0);
  const resistancePenetrationPercent = (readCombatStat(actor.combatStats, "resistancePenetrationPercent") || 0)
    + activeModifierTotal(actor, "resistancePenetrationPercent", now)
    + (asFiniteNumber(formula.resistancePenetrationPercent, 0) || 0);
  const vulnerabilityPercent = (readCombatStat(actor.combatStats, "vulnerabilityPercent") || 0)
    + activeModifierTotal(actor, "vulnerabilityPercent", now)
    + (asFiniteNumber(formula.vulnerabilityPercent, 0) || 0);
  const targetVulnerability = target.vulnerabilityPercent + activeModifierTotal(target, "vulnerabilityPercent", now);
  const critVulnerabilityPercent = canCrit
    ? (readCombatStat(actor.combatStats, "critVulnerabilityPercent") || 0)
      + activeModifierTotal(actor, "critVulnerabilityPercent", now)
      + target.critVulnerabilityPercent
      + activeModifierTotal(target, "critVulnerabilityPercent", now)
      + (asFiniteNumber(formula.critVulnerabilityPercent, 0) || 0)
    : 0;

  const defenseMultiplier = calculateDefenseMultiplier(attackerLevel, targetLevel, defenseReductionPercent);
  const resistanceMultiplier = calculateResistanceMultiplier(resistancePercent / 100,
    resistancePenetrationPercent);
  const critMultiplier = canCrit
    ? calculateExpectedCritMultiplier(critRate, critDamage, critVulnerabilityPercent)
    : 1;
  const damageMultiplier = Math.max(0, 1 + damageBonusPercent / 100);
  const vulnerabilityMultiplier = Math.max(0, 1 + (vulnerabilityPercent + targetVulnerability) / 100);
  const toughnessMultiplier = calculateToughnessMultiplier(broken);
  const unroundedDamage = scalingValue * motionValue * damageMultiplier * critMultiplier
    * defenseMultiplier * resistanceMultiplier * vulnerabilityMultiplier * toughnessMultiplier;

  return {
    amount: Math.max(0, Math.round(unroundedDamage)),
    calculation: {
      type: "direct",
      element,
      scalingStat,
      scalingValue,
      motionValue,
      canCrit,
      damageBonusPercent,
      elementDamageBonusPercent: asFiniteNumber(formula.elementDamageBonusPercent,
        asFiniteNumber(actor.combatStats.elementDamageBonuses?.[element], 0)) || 0,
      critRatePercent: critRate,
      critDamagePercent: critDamage,
      defenseReductionPercent,
      resistancePercent,
      resistancePenetrationPercent,
      vulnerabilityPercent: vulnerabilityPercent + targetVulnerability,
      targetWasBroken: broken,
      damageMultiplier,
      critMultiplier,
      defenseMultiplier,
      resistanceMultiplier,
      vulnerabilityMultiplier,
      toughnessMultiplier,
      timedModifiers: {
        attacker: actor.modifiers.filter((modifier) => modifier.expiresAt > now).map((modifier) => ({ ...modifier })),
        target: target.modifiers.filter((modifier) => modifier.expiresAt > now).map((modifier) => ({ ...modifier }))
      }
    }
  };
}

function setActorSpeed(actor, newSpeed, now) {
  if (!Number.isFinite(newSpeed) || newSpeed <= 0 || newSpeed === actor.speed
    || !Number.isFinite(actor.interval) || actor.interval <= 0
    || !Number.isFinite(actor.nextActionAt)) return false;
  const oldInterval = actor.interval;
  const newInterval = ACTION_GAUGE / newSpeed;
  const remainingAt = Math.max(0, actor.nextActionAt - now);
  const progress = clamp(1 - (remainingAt / oldInterval), 0, 1);
  actor.speed = newSpeed;
  actor.interval = newInterval;
  actor.nextActionAt = now + newInterval * (1 - progress);
  return true;
}

function resolveActionForResources(actor, action, skillPoints, maxSkillPoints) {
  const lacksEnergy = actor.energy + Number.EPSILON < action.energyCost;
  const lacksSkillPoints = skillPoints < action.skillPointCost;
  if (!lacksEnergy && !lacksSkillPoints) return { action, blockedBy: null };

  const reason = [
    lacksEnergy ? "energy" : null,
    lacksSkillPoints ? "skill-points" : null
  ].filter(Boolean).join("+");
  const fallback = action.fallback && typeof action.fallback === "object"
    ? normalizeAction(action.fallback, actor.id, actor.actionIndex)
    : null;
  if (!fallback) return { action: null, blockedBy: reason };

  const fallbackCanPay = actor.energy + Number.EPSILON >= fallback.energyCost
    && skillPoints >= fallback.skillPointCost;
  return fallbackCanPay
    ? { action: fallback, blockedBy: null, fallbackFrom: action.key }
    : { action: null, blockedBy: reason };
}

function applyActionEffects(action, actor, actorsById, state) {
  const warnings = state.warnings;
  const touchedIds = new Set();
  const getTarget = (targetId, effectName) => {
    const target = actorsById.get(String(targetId || ""));
    if (!target) {
      warnings.push(`${action.key}: ${effectName} target '${targetId}' was not found.`);
      return null;
    }
    return target;
  };

  const effects = Array.isArray(action.effects)
    ? action.effects
    : [
      ...(Array.isArray(action.heals) ? action.heals.map((effect) => ({ ...effect, type: "heal" })) : []),
      ...(Array.isArray(action.hpCosts) ? action.hpCosts.map((effect) => ({ ...effect, type: "hp-cost" })) : []),
      ...(Array.isArray(action.shields) ? action.shields.map((effect) => ({ ...effect, type: "shield" })) : []),
      ...(Array.isArray(action.energyTo) ? action.energyTo.map((effect) => ({ ...effect, type: "energy" })) : []),
      ...(Array.isArray(action.speedChanges) ? action.speedChanges.map((effect) => ({ ...effect, type: "speed" })) : []),
      ...(Array.isArray(action.advances) ? action.advances.map((effect) => ({ ...effect, type: "advance" })) : []),
      ...(Array.isArray(action.delays) ? action.delays.map((effect) => ({ ...effect, type: "delay" })) : []),
      ...(Array.isArray(action.modifiers) ? action.modifiers.map((effect) => ({ ...effect, type: "modifier" })) : []),
      ...(Array.isArray(action.buffs) ? action.buffs.map((effect) => ({ ...effect, type: "modifier" })) : []),
      ...(Array.isArray(action.debuffs) ? action.debuffs.map((effect) => ({ ...effect, type: "modifier" })) : []),
      ...(Array.isArray(action.damage) ? action.damage.map((effect) => ({ ...effect, type: "damage" })) : [])
    ];

  for (const effect of effects) {
    if (!effect || typeof effect !== "object") continue;
    const targetId = effect.targetId || (effect.type === "hp-cost" ? actor.id : null);
    const target = getTarget(targetId, effect.type || "effect");
    if (!target) continue;
    const amount = asFiniteNumber(effect.amount, 0);

    if (effect.type === "heal") {
      if (target.hp === null) continue;
      target.hp = Math.min(target.maxHp, target.hp + Math.max(0, amount));
    } else if (effect.type === "hp-cost") {
      if (target.hp === null) continue;
      target.hp = Math.max(0, target.hp - Math.max(0, amount));
    } else if (effect.type === "shield") {
      target.shield += Math.max(0, amount);
    } else if (effect.type === "energy") {
      target.energy = Math.min(target.energyCap ?? Number.POSITIVE_INFINITY, target.energy + Math.max(0, amount));
    } else if (effect.type === "skill-points") {
      state.skillPoints = clamp(state.skillPoints + Math.floor(amount), 0, state.maxSkillPoints);
    } else if (effect.type === "speed") {
      const nextSpeed = effect.mode === "set" ? amount : target.speed + amount;
      if (!setActorSpeed(target, nextSpeed, state.now)) continue;
    } else if (effect.type === "advance") {
      if (!Number.isFinite(target.nextActionAt) || !Number.isFinite(target.interval)) {
        warnings.push(`${action.key}: Action Advance target '${target.id}' has no scheduled actions.`);
        continue;
      }
      const fraction = clamp(asFiniteNumber(effect.fraction, 0), 0, 1);
      target.nextActionAt = Math.max(state.now, target.nextActionAt - target.interval * fraction);
    } else if (effect.type === "delay") {
      if (!Number.isFinite(target.nextActionAt) || !Number.isFinite(target.interval)) {
        warnings.push(`${action.key}: Action Delay target '${target.id}' has no scheduled actions.`);
        continue;
      }
      const fraction = Math.max(0, asFiniteNumber(effect.fraction, 0));
      target.nextActionAt += target.interval * fraction;
    } else if (effect.type === "modifier") {
      const field = String(effect.field || "");
      const value = asFiniteNumber(effect.value);
      const duration = asFiniteNumber(effect.durationActionValue);
      if (!TIMED_MODIFIER_FIELDS.has(field) || value === null || duration === null || duration <= 0) {
        warnings.push(`${action.key}: modifier requires a supported field, finite value, and positive durationActionValue.`);
        continue;
      }
      const key = String(effect.stackingKey || `${actor.id}:${action.key}:${target.id}:${field}`);
      const stackMode = effect.stackMode === "stack" ? "stack" : "refresh";
      const existing = target.modifiers.filter((modifier) => modifier.key === key);
      if (stackMode === "refresh") {
        target.modifiers = target.modifiers.filter((modifier) => modifier.key !== key);
      } else {
        const maxStacks = Math.max(1, Math.floor(asFiniteNumber(effect.maxStacks, Number.MAX_SAFE_INTEGER)));
        if (existing.length >= maxStacks) {
          const oldest = existing.sort((left, right) => left.expiresAt - right.expiresAt)[0];
          target.modifiers = target.modifiers.filter((modifier) => modifier !== oldest);
        }
      }
      target.modifiers.push({
        key,
        field,
        value,
        expiresAt: state.now + duration,
        sourceActorId: actor.id
      });
    } else if (effect.type === "damage") {
      if (target.hp === 0) {
        warnings.push(`${action.key}: damage against defeated target '${target.id}' was skipped.`);
        continue;
      }
      const formulaResult = effect.formula ? calculateDirectDamage(actor, target, effect, warnings, state.now) : null;
      if (effect.formula && !formulaResult) continue;
      const damageAmount = formulaResult ? formulaResult.amount : Math.max(0, amount);
      let remainingDamage = damageAmount;
      const absorbed = Math.min(target.shield, remainingDamage);
      target.shield -= absorbed;
      remainingDamage -= absorbed;
      const hpDamage = target.hp === null ? remainingDamage : Math.min(target.hp, remainingDamage);
      if (target.hp !== null) target.hp = Math.max(0, target.hp - remainingDamage);
      const damageResult = {
        sourceActorId: actor.id,
        sourceActorKind: actor.kind,
        targetId: target.id,
        targetKind: target.kind,
        amount: damageAmount,
        shieldAbsorbed: absorbed,
        hpDamage,
        overkill: target.hp !== null ? Math.max(0, remainingDamage - hpDamage) : 0,
        calculation: formulaResult?.calculation || null,
        toughnessDamage: 0,
        targetWasBroken: target.isBroken,
        targetIsBroken: target.isBroken
      };

      const requestedToughnessDamage = Math.max(0, asFiniteNumber(effect.toughnessDamage, 0));
      if (requestedToughnessDamage > 0 && target.isBroken !== true) {
        const element = String(effect.element || effect.formula?.element || "");
        const canDamageToughness = effect.ignoreWeakness === true
          || element && target.weaknesses.includes(element);
        if (target.toughness === null) {
          warnings.push(`${action.key}: Toughness damage omitted because target '${target.id}' has no Toughness value.`);
        } else if (!canDamageToughness) {
          warnings.push(`${action.key}: Toughness damage omitted because target '${target.id}' is not confirmed weak to '${element || "the attack element"}'.`);
        } else {
          const toughnessBefore = target.toughness;
          target.toughness = Math.max(0, target.toughness - requestedToughnessDamage);
          target.isBroken = target.toughness <= 0;
          damageResult.toughnessDamage = Math.min(toughnessBefore, requestedToughnessDamage);
          damageResult.toughnessBefore = toughnessBefore;
          damageResult.toughnessAfter = target.toughness;
          damageResult.targetIsBroken = target.isBroken;
          damageResult.brokeTarget = damageResult.targetWasBroken !== true && target.isBroken;
        }
      }
      state.damageResults.push(damageResult);
    } else {
      warnings.push(`${action.key}: unsupported effect type '${effect.type}'.`);
      continue;
    }

    touchedIds.add(target.id);
  }

  return [...touchedIds];
}

/**
 * Runs a deterministic action-value timeline from explicit scenario inputs.
 * Speeds, action order, resource changes, damage, and effect durations are not
 * inferred from character names or team roles. `advance.fraction` and
 * `delay.fraction` are fractions of the target's current full action interval.
 * Direct damage uses `effect.formula = { type: "direct", scalingStat,
 * motionValue, element, canCrit?, critRatePercent?, critDamagePercent?, ... }`;
 * critRate/critDamage and other percentages use percentage points (e.g. 50 = 50%).
 * Actor combat stats and enemy resistance/break state are explicit inputs. Timed
 * modifiers use `effect.type = "modifier"` with a supported field, value, and
 * positive durationActionValue; percentage values are percentage points.
 */
export function simulateCombatTimeline({
  actors: rawActors = [],
  initialSkillPoints = null,
  maxSkillPoints = null,
  horizonActionValue = null,
  maxEvents = DEFAULT_MAX_EVENTS
} = {}) {
  const warnings = [];
  const actors = rawActors
    .map((actor, index) => normalizeActor(actor, index, warnings))
    .filter(Boolean);
  const actorsById = new Map(actors.map((actor) => [actor.id, actor]));
  if (actorsById.size !== actors.length) warnings.push("Duplicate actor IDs found; target effects resolve to the last matching actor.");

  const horizonInput = asFiniteNumber(horizonActionValue);
  const initialSpInput = asFiniteNumber(initialSkillPoints);
  const maxSpInput = asFiniteNumber(maxSkillPoints);
  if (horizonInput === null || horizonInput < 0 || initialSpInput === null || maxSpInput === null || maxSpInput < 0) {
    warnings.push("Explicit non-negative horizonActionValue, initialSkillPoints, and maxSkillPoints are required.");
    return {
      status: "invalid-input",
      horizonActionValue: null,
      processedEvents: 0,
      finalSkillPoints: null,
      damageTotal: 0,
      events: [],
      actors: actors.map((actor) => ({ id: actor.id, name: actor.name, kind: actor.kind })),
      assumptions: ["No combat state or game-mode defaults are inferred."],
      warnings
    };
  }
  const horizon = horizonInput;
  const eventLimit = Math.max(1, Math.floor(asFiniteNumber(maxEvents, DEFAULT_MAX_EVENTS)));
  const maxSp = Math.floor(maxSpInput);
  let skillPoints = clamp(Math.floor(initialSpInput), 0, maxSp);
  const events = [];
  let now = 0;

  while (events.length < eventLimit) {
    const actor = actors
      .filter((entry) => entry.actions.length > 0 && entry.hp !== 0)
      .sort((a, b) => a.nextActionAt - b.nextActionAt || a.insertionOrder - b.insertionOrder)[0];
    if (!actor || actor.nextActionAt > horizon) break;

    now = Math.max(now, actor.nextActionAt);
    actors.forEach((entry) => expireActorModifiers(entry, now));
    const plannedAction = actor.actions[actor.actionIndex];
    const selected = resolveActionForResources(actor, plannedAction, skillPoints, maxSp);
    const action = selected.action;
    actor.turnCount += 1;
    actor.nextActionAt = now + actor.interval;

    const event = {
      eventIndex: events.length,
      actionValue: Number(now.toFixed(6)),
      actorId: actor.id,
      actorName: actor.name,
      actorKind: actor.kind,
      actionKey: action?.key || plannedAction.key,
      actionName: action?.name || plannedAction.name || plannedAction.key,
      status: action ? (selected.fallbackFrom ? "fallback" : "executed") : "blocked",
      blockedBy: selected.blockedBy,
      turn: actor.turnCount,
      skillPointsBefore: skillPoints,
      affectedActorIds: [],
      damage: []
    };

    if (action) {
      actor.energy = Math.max(0, actor.energy - action.energyCost);
      skillPoints = Math.max(0, skillPoints - action.skillPointCost);
      actor.energy = Math.min(actor.energyCap ?? Number.POSITIVE_INFINITY, actor.energy + action.energyGain);
      skillPoints = clamp(skillPoints + action.skillPointGain, 0, maxSp);
      const effectState = { warnings, now, skillPoints, maxSkillPoints: maxSp, damageResults: [] };
      event.affectedActorIds = applyActionEffects(action, actor, actorsById, effectState);
      event.damage = effectState.damageResults;
      skillPoints = effectState.skillPoints;
      event.skillPointsAfter = skillPoints;
      event.energyAfter = actor.energy;
    } else {
      event.skillPointsAfter = skillPoints;
      event.energyAfter = actor.energy;
    }

    events.push(event);
    actor.actionIndex += 1;
    if (actor.actionIndex >= actor.actions.length) {
      if (actor.repeatActions) actor.actionIndex = 0;
      else actor.actions = [];
    }
    if (actor.hp === 0) actor.actions = [];
  }

  const reachedEventLimit = events.length >= eventLimit
    && actors.some((actor) => actor.actions.length > 0 && actor.nextActionAt <= horizon && actor.hp !== 0);
  if (reachedEventLimit) warnings.push(`Timeline stopped at the ${eventLimit}-event safety limit.`);
  const scriptsComplete = actors.every((actor) => actor.actions.length === 0 || actor.hp === 0);

  return {
    status: reachedEventLimit ? "event-limit" : scriptsComplete ? "scripts-complete" : "horizon-reached",
    horizonActionValue: horizon,
    processedEvents: events.length,
    finalSkillPoints: skillPoints,
    damageTotal: events.reduce((sum, event) => event.status === "blocked"
      ? sum
      : sum + event.damage.reduce((actionSum, hit) => actionSum + Math.max(0, asFiniteNumber(hit.amount, 0)), 0), 0),
    alliedDamageTotal: events.reduce((sum, event) => event.status === "blocked" || event.actorKind !== "ally"
      ? sum
      : sum + event.damage.filter((hit) => hit.targetKind === "enemy")
        .reduce((actionSum, hit) => actionSum + Math.max(0, asFiniteNumber(hit.amount, 0)), 0), 0),
    alliedEffectiveDamageTotal: events.reduce((sum, event) => event.status === "blocked" || event.actorKind !== "ally"
      ? sum
      : sum + event.damage.filter((hit) => hit.targetKind === "enemy")
        .reduce((actionSum, hit) => actionSum
          + Math.max(0, asFiniteNumber(hit.hpDamage, 0))
          + Math.max(0, asFiniteNumber(hit.shieldAbsorbed, 0)), 0), 0),
    enemyDamageTotal: events.reduce((sum, event) => event.status === "blocked" || event.actorKind !== "enemy"
      ? sum
      : sum + event.damage.filter((hit) => hit.targetKind === "ally")
        .reduce((actionSum, hit) => actionSum + Math.max(0, asFiniteNumber(hit.amount, 0)), 0), 0),
    enemyEffectiveDamageTotal: events.reduce((sum, event) => event.status === "blocked" || event.actorKind !== "enemy"
      ? sum
      : sum + event.damage.filter((hit) => hit.targetKind === "ally")
        .reduce((actionSum, hit) => actionSum
          + Math.max(0, asFiniteNumber(hit.hpDamage, 0))
          + Math.max(0, asFiniteNumber(hit.shieldAbsorbed, 0)), 0), 0),
    effectiveHpDamageTotal: events.reduce((sum, event) => event.status === "blocked"
      ? sum
      : sum + event.damage.reduce((actionSum, hit) => actionSum + Math.max(0, asFiniteNumber(hit.hpDamage, 0)), 0), 0),
    events,
    actors: actors.map((actor) => ({
      id: actor.id,
      name: actor.name,
      kind: actor.kind,
      level: actor.level,
      speed: actor.speed,
      resistancePercent: actor.resistancePercent,
      resistancesPercent: actor.resistancesPercent,
      weaknesses: [...actor.weaknesses],
      vulnerabilityPercent: actor.vulnerabilityPercent,
      critVulnerabilityPercent: actor.critVulnerabilityPercent,
      defenseReductionPercent: actor.defenseReductionPercent,
      nextActionValue: Number.isFinite(actor.nextActionAt) ? Number(actor.nextActionAt.toFixed(6)) : null,
      turns: actor.turnCount,
      hp: actor.hp,
      maxHp: actor.maxHp,
      toughness: actor.toughness,
      maxToughness: actor.maxToughness,
      isBroken: actor.isBroken,
      shield: actor.shield,
      energy: actor.energy,
      energyCap: actor.energyCap,
      modifiers: actor.modifiers.map((modifier) => ({ ...modifier }))
    })),
    assumptions: [
      "Only explicitly supplied actors and action scripts are simulated.",
      "Actors without action scripts remain valid as targets, but do not take turns or trigger automatic enemy behavior.",
      "Action Value uses 10000 divided by the supplied speed; the horizon is explicit and no game-mode cycle limit is inferred.",
      "Damage effects can use a direct-damage formula when attacker stats, target level and RES, element, CRIT stats, motion value, and break state are supplied; flat damage remains supported for externally validated values.",
      "Raw damage is the calculated hit amount; effective damage is limited by remaining HP and shield. Hits against already-defeated targets are skipped.",
      "Timed stat modifiers are explicit additive percentage-point effects with Action Value durations. A stackingKey refreshes one effect by default; stackMode 'stack' retains multiple stacks, optionally capped by maxStacks.",
      "When target Max HP or Toughness is supplied and current values are omitted, the timeline initializes them at full. Weakness damage only reduces Toughness for a listed weakness unless the action explicitly ignores weakness.",
      "Break damage itself is not calculated yet; a weakness break only changes target state for later actions.",
      "Timed modifiers apply only when their field, value, and Action Value duration are explicit. Ultimate quick-casts, DoT ticks, and trigger conditions are not inferred."
    ],
    warnings
  };
}
