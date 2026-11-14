const ACTION_GAUGE = 10000;
const DEFAULT_MAX_EVENTS = 1000;

function asFiniteNumber(value, fallback = null) {
  if (value === null || value === undefined || value === "") return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
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
  const speed = asFiniteNumber(raw?.speed);
  if (!raw || typeof raw !== "object" || speed === null || speed <= 0) {
    warnings.push(`Actor ${id} omitted: a positive explicit speed is required.`);
    return null;
  }

  const interval = ACTION_GAUGE / speed;
  const maxHp = asFiniteNumber(raw.maxHp);
  const currentHp = asFiniteNumber(raw.currentHp, maxHp);
  const energyCap = asFiniteNumber(raw.energyCap);
  const energy = asFiniteNumber(raw.energy, 0);
  const actions = (Array.isArray(raw.actions) ? raw.actions : [])
    .map((action, actionIndex) => normalizeAction(action, id, actionIndex))
    .filter(Boolean);

  if (actions.length === 0) {
    warnings.push(`Actor ${id} omitted: at least one explicit action is required.`);
    return null;
  }

  return {
    id,
    name: String(raw.name || id),
    kind: raw.kind === "enemy" ? "enemy" : "ally",
    speed,
    interval,
    nextActionAt: Math.max(0, asFiniteNumber(raw.initialActionValue, interval)),
    maxHp: maxHp !== null && maxHp > 0 ? maxHp : null,
    hp: maxHp !== null && maxHp > 0
      ? clamp(currentHp ?? maxHp, 0, maxHp)
      : null,
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

function setActorSpeed(actor, newSpeed, now) {
  if (!Number.isFinite(newSpeed) || newSpeed <= 0 || newSpeed === actor.speed) return false;
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
      const fraction = clamp(asFiniteNumber(effect.fraction, 0), 0, 1);
      target.nextActionAt = Math.max(state.now, target.nextActionAt - target.interval * fraction);
    } else if (effect.type === "delay") {
      const fraction = Math.max(0, asFiniteNumber(effect.fraction, 0));
      target.nextActionAt += target.interval * fraction;
    } else if (effect.type === "damage") {
      let remainingDamage = Math.max(0, amount);
      const absorbed = Math.min(target.shield, remainingDamage);
      target.shield -= absorbed;
      remainingDamage -= absorbed;
      const hpDamage = target.hp === null ? remainingDamage : Math.min(target.hp, remainingDamage);
      if (target.hp !== null) target.hp = Math.max(0, target.hp - remainingDamage);
      state.damageResults.push({
        targetId: target.id,
        amount: Math.max(0, amount),
        shieldAbsorbed: absorbed,
        hpDamage,
        overkill: target.hp !== null ? Math.max(0, remainingDamage - hpDamage) : 0
      });
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
    events,
    actors: actors.map((actor) => ({
      id: actor.id,
      name: actor.name,
      kind: actor.kind,
      speed: actor.speed,
      nextActionValue: Number(actor.nextActionAt.toFixed(6)),
      turns: actor.turnCount,
      hp: actor.hp,
      maxHp: actor.maxHp,
      shield: actor.shield,
      energy: actor.energy,
      energyCap: actor.energyCap
    })),
    assumptions: [
      "Only explicitly supplied actors and action scripts are simulated.",
      "Action Value uses 10000 divided by the supplied speed; the horizon is explicit and no game-mode cycle limit is inferred.",
      "Damage amounts are supplied by the scenario; this module tracks HP/shield changes but does not calculate damage formulas.",
      "Ultimate quick-casts, buff/debuff durations, DoT ticks, and trigger conditions are not inferred; encode verified actions and effects explicitly."
    ],
    warnings
  };
}
