import endgameEnemyData from "../data/endgameEnemyScenarios47.json";

const GENERIC_SCENARIOS = {
  moc: { level: 95, resistancePercent: 20, targetCount: 3 },
  pf: { level: 88, resistancePercent: 20, targetCount: 5 },
  as: { level: 95, resistancePercent: 20, targetCount: 3 }
};

function finiteNumber(value, fallback) {
  if (value === null || value === undefined || value === "") return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function getElementResistance(target, elementId, fallbackPercent) {
  if (target.resistancePercent !== null && target.resistancePercent !== undefined
    && Number.isFinite(Number(target.resistancePercent))) return Number(target.resistancePercent);
  if (target.allTypeResistancePercent !== null && target.allTypeResistancePercent !== undefined
    && Number.isFinite(Number(target.allTypeResistancePercent))) return Number(target.allTypeResistancePercent);

  const resistances = target.resistances;
  const elementAliases = {
    Thunder: ["Lightning", "thunder", "lightning"],
    Lightning: ["Thunder", "lightning", "thunder"]
  };
  const elementKeys = [elementId, String(elementId).toLowerCase(), ...(elementAliases[elementId] || [])];
  for (const key of elementKeys) {
    const elementResistance = resistances?.[key];
    if (elementResistance !== null && elementResistance !== undefined
      && Number.isFinite(Number(elementResistance))) return Number(elementResistance);
  }
  return fallbackPercent;
}

function hasElementResistance(target, elementId) {
  if (target.resistanceDataComplete === true) return true;
  if (target.resistancePercent !== null && target.resistancePercent !== undefined
    || target.allTypeResistancePercent !== null && target.allTypeResistancePercent !== undefined) return true;
  const aliases = elementId === "Thunder" ? ["Lightning", "thunder", "lightning"]
    : elementId === "Lightning" ? ["Thunder", "lightning", "thunder"] : [];
  const keys = [elementId, String(elementId).toLowerCase(), ...aliases];
  return keys.some((key) => {
    const value = target.resistances?.[key];
    return value !== null && value !== undefined && Number.isFinite(Number(value));
  });
}

function normalizeTarget(target = {}, index, defaults, elementId, fallbackBroken, fallbackHpPercent, fallbackDebuffCount, fallbackDebuffed) {
  const level = finiteNumber(target.level ?? target.enemyLevel, defaults.level);
  const resistancePercent = getElementResistance(target, elementId, defaults.resistancePercent);
  const currentToughness = finiteNumber(target.currentToughness ?? target.toughness, null);
  const maxToughness = finiteNumber(target.maxToughness, null);
  const inferredBroken = currentToughness !== null && currentToughness <= 0 ? true : null;
  const isBroken = typeof target.isBroken === "boolean"
    ? target.isBroken
    : typeof target.broken === "boolean"
      ? target.broken
      : inferredBroken ?? fallbackBroken;
  const currentHp = finiteNumber(target.currentHp ?? target.hp, null);
  const maxHp = finiteNumber(target.maxHp ?? target.maxHP, null);
  const explicitHpPercent = finiteNumber(target.hpPercent ?? target.healthPercent, null);
  const hpPercent = explicitHpPercent !== null
    ? explicitHpPercent
    : currentHp !== null && maxHp !== null && maxHp > 0
      ? currentHp / maxHp * 100
      : finiteNumber(fallbackHpPercent, null);
  const rawDebuffCount = finiteNumber(target.debuffCount, finiteNumber(fallbackDebuffCount, null));
  const debuffCount = rawDebuffCount === null ? null : Math.max(0, Math.floor(rawDebuffCount));
  const isDebuffed = typeof target.debuffed === "boolean"
    ? target.debuffed
    : debuffCount !== null ? debuffCount > 0
      : typeof fallbackDebuffed === "boolean" ? fallbackDebuffed : null;

  return {
    id: String(target.id || ("target-" + (index + 1))),
    name: target.name || null,
    level: Math.max(1, level),
    isLevelExplicit: target.level !== null && target.level !== undefined
      || target.enemyLevel !== null && target.enemyLevel !== undefined,
    resistancePercent: Math.max(-100, Math.min(90, resistancePercent)),
    isResistanceExplicit: hasElementResistance(target, elementId),
    resistanceDataStatus: target.resistanceDataStatus || null,
    weaknesses: Array.isArray(target.weaknesses) ? target.weaknesses : [],
    isWeaknessExplicit: Array.isArray(target.weaknesses) && target.weaknesses.length > 0,
    isBroken,
    currentHp: currentHp === null ? null : Math.max(0, currentHp),
    maxHp: maxHp === null ? null : Math.max(0, maxHp),
    hpPercent: hpPercent === null ? null : Math.max(0, Math.min(100, hpPercent)),
    isHpStateExplicit: explicitHpPercent !== null
      || currentHp !== null && maxHp !== null && maxHp > 0
      || fallbackHpPercent !== null && fallbackHpPercent !== undefined && fallbackHpPercent !== ""
        && Number.isFinite(Number(fallbackHpPercent)),
    currentToughness: currentToughness === null ? null : Math.max(0, currentToughness),
    maxToughness: maxToughness === null ? null : Math.max(0, maxToughness),
    isToughnessExplicit: currentToughness !== null,
    debuffCount,
    isDebuffed,
    isDebuffStateExplicit: target.debuffCount !== null && target.debuffCount !== undefined
      || typeof target.debuffed === "boolean"
      || fallbackDebuffCount !== null && fallbackDebuffCount !== undefined
        && Number.isFinite(Number(fallbackDebuffCount))
      || typeof fallbackDebuffed === "boolean",
    isSlowed: typeof target.isSlowed === "boolean" ? target.isSlowed : null,
    isDefenseReduced: typeof target.isDefenseReduced === "boolean" ? target.isDefenseReduced : null,
    aetherCodeActive: typeof target.aetherCodeActive === "boolean" ? target.aetherCodeActive : null,
    vulnerabilityPercent: finiteNumber(target.vulnerabilityPercent, 0),
    baseStats: target.baseStats || null,
    speed: finiteNumber(target.speed ?? target.derivedStats?.speed, null),
    derivedStats: target.derivedStats || null,
    derivedStatsStatus: target.derivedStatsStatus || "unavailable",
    sourceDetails: target.sourceDetails || null,
    isBreakStateExplicit: typeof target.isBroken === "boolean" || typeof target.broken === "boolean"
      || currentToughness !== null || typeof fallbackBroken === "boolean",
    isExplicit: Boolean(target.name || target.level || target.enemyLevel
      || target.resistancePercent !== null && target.resistancePercent !== undefined
      || target.allTypeResistancePercent !== null && target.allTypeResistancePercent !== undefined
      || target.resistances || target.weaknesses
      || target.hpPercent !== null && target.hpPercent !== undefined
      || target.healthPercent !== null && target.healthPercent !== undefined
      || target.currentHp !== null && target.currentHp !== undefined
      || target.hp !== null && target.hp !== undefined
      || target.maxHp !== null && target.maxHp !== undefined
      || target.maxHP !== null && target.maxHP !== undefined
      || typeof target.isBroken === "boolean" || typeof target.broken === "boolean"
      || currentToughness !== null || debuffCount !== null || typeof target.debuffed === "boolean"
      || typeof target.isSlowed === "boolean" || typeof target.isDefenseReduced === "boolean"
      || typeof target.aetherCodeActive === "boolean")
  };
}

function localDateKey(value) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function relativeIndex(value, length, defaultIndex = length - 1) {
  if (value === null || value === undefined || value === "") return defaultIndex;
  const parsed = Number(value);
  const index = Number.isInteger(parsed) ? (parsed < 0 ? length + parsed : parsed) : defaultIndex;
  return Math.max(0, Math.min(length - 1, index));
}

function resolveOfficialEnemyEncounter(options, mode) {
  const scenario = endgameEnemyData.scenarios?.[mode];
  if (!scenario || options.useOfficialEnemyData === false) return { targets: null, details: null, status: "unavailable" };

  const today = localDateKey(options.enemyDataReferenceDate || new Date());
  const activeStart = String(scenario.activeFrom || "").slice(0, 10);
  const activeEnd = String(scenario.activeUntil || "").slice(0, 10);
  // Avoid using a snapshot on either boundary day where the source's timezone
  // is not represented in ScheduleDataChallenge*.
  if (!today || today <= activeStart || today >= activeEnd) {
    return { targets: null, details: null, status: "outside-active-window" };
  }

  const sideNumber = Math.max(1, Math.floor(finiteNumber(options.enemySide, 1)));
  const side = scenario.sides.find((entry) => entry.sideNumber === sideNumber);
  if (!side || !side.stages.length) return { targets: null, details: null, status: "invalid-side" };
  const stageIndex = relativeIndex(options.enemyStageIndex, side.stages.length);
  const stage = side.stages[stageIndex];
  if (!stage?.waves?.length) return { targets: null, details: null, status: "stage-has-no-waves" };
  const waveIndex = relativeIndex(options.enemyWaveIndex, stage.waves.length);
  const rawTargets = stage.waves[waveIndex] || [];
  if (!rawTargets.length) return { targets: null, details: null, status: "wave-has-no-enemies" };

  const targets = rawTargets.map((enemy) => ({
    id: enemy.id,
    name: (options.language === "en" ? enemy.nameEn : enemy.nameRu) || enemy.nameRu || enemy.nameEn || enemy.monsterId,
    level: enemy.level,
    maxHp: enemy.derivedStats?.hp ?? null,
    maxToughness: enemy.derivedStats?.toughness ?? null,
    speed: enemy.derivedStats?.speed ?? null,
    weaknesses: enemy.weaknesses,
    resistances: enemy.resistancesPercent,
    resistanceDataComplete: enemy.resistanceSourceStatus === "complete-from-game-config-resistances-and-weaknesses",
    resistanceDataStatus: enemy.resistanceSourceStatus,
    baseStats: enemy.baseStats,
    monsterModifiers: enemy.monsterModifiers,
    derivedStats: enemy.derivedStats || null,
    derivedStatsStatus: enemy.derivedStatsStatus || "unavailable",
    monsterId: enemy.monsterId,
    sourceDetails: {
      stageId: stage.id,
      stageNameRu: stage.nameRu,
      stageNameEn: stage.nameEn,
      sideNumber: side.sideNumber,
      waveNumber: waveIndex + 1,
      waveCount: stage.waves.length,
      challengeId: scenario.challengeId
    }
  }));

  return {
    targets,
    status: "official-stage-targets",
    details: {
      scenarioId: scenario.id,
      mode: scenario.mode,
      groupId: scenario.groupId,
      floor: scenario.floor,
      challengeId: scenario.challengeId,
      sideNumber: side.sideNumber,
      stageIndex,
      stageId: stage.id,
      stageNameRu: stage.nameRu,
      stageNameEn: stage.nameEn,
      waveNumber: waveIndex + 1,
      waveCount: stage.waves.length,
      activeFrom: scenario.activeFrom,
      activeUntil: scenario.activeUntil,
      challengeBuffId: scenario.challengeBuffId,
      sourceSnapshotDate: endgameEnemyData.snapshotDate,
      sourceCommit: endgameEnemyData.dataSource.commit,
      sourceUrl: `${endgameEnemyData.dataSource.repository}/tree/${endgameEnemyData.dataSource.commit}`
    }
  };
}

/**
 * Resolves per-target parameters for a simulation. Explicit targets can be
 * supplied as options.enemies. During its recorded schedule, the pinned 4.7.0
 * game-data snapshot supplies the highest active floor and defaults to side 1,
 * last stage, last wave. Outside that window, legacy MoC/PF/AS values remain
 * available as generic assumptions, not as a specific stage's enemy lineup.
 */
export function resolveEnemyScenario(options = {}, requestedMode = "moc", elementId = "") {
  const mode = Object.hasOwn(GENERIC_SCENARIOS, requestedMode) ? requestedMode : "moc";
  const defaults = GENERIC_SCENARIOS[mode];
  const hasExplicitTargets = Array.isArray(options.enemies) && options.enemies.length > 0;
  const officialEncounter = hasExplicitTargets
    ? { targets: null, details: null, status: "overridden-by-explicit-targets" }
    : resolveOfficialEnemyEncounter(options, mode);
  const requestedCount = Number(options.targetCount);
  const targetCount = Number.isFinite(requestedCount) && requestedCount > 0
    ? Math.min(20, Math.floor(requestedCount))
    : defaults.targetCount;
  const fallback = {
    level: finiteNumber(options.enemyLevel, defaults.level),
    resistancePercent: finiteNumber(options.enemyResistancePercent, defaults.resistancePercent)
  };
  const fallbackBroken = typeof options.enemyBroken === "boolean" ? options.enemyBroken : null;
  const rawTargets = hasExplicitTargets
    ? options.enemies.slice(0, 20)
    : officialEncounter.targets || Array.from({ length: targetCount }, (_, index) => ({ id: "generic-" + mode + "-" + (index + 1) }));
  const resolvedTargets = Number.isFinite(requestedCount) && requestedCount > 0
    ? rawTargets.slice(0, Math.floor(requestedCount))
    : rawTargets;
  const targets = resolvedTargets.map((target, index) =>
    normalizeTarget(
      target,
      index,
      fallback,
      elementId,
      fallbackBroken,
      options.enemyHpPercent,
      options.enemyDebuffCount,
      options.enemyDebuffed
    )
  );
  const hasCustomDefaults = Number.isFinite(Number(options.enemyLevel))
    || Number.isFinite(Number(options.enemyResistancePercent))
    || Number.isFinite(Number(options.targetCount));

  return {
    mode,
    targets,
    targetCount: targets.length,
    isGenericAssumption: !hasExplicitTargets && !officialEncounter.targets && !hasCustomDefaults,
    officialEncounter: officialEncounter.details,
    officialDataStatus: officialEncounter.status,
    status: hasExplicitTargets ? "explicit-targets"
      : officialEncounter.targets ? "official-stage-targets"
        : hasCustomDefaults ? "custom-generic-targets" : "generic-preset"
  };
}
