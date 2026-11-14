import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const DATA_COMMIT = "dad9155eb00fdeda31fb8456507c53590d49071f";
const SNAPSHOT_DATE = "2026-11-15";
const REPOSITORY = "https://github.com/DimbreathBot/TurnBasedGameData";
const RAW_ROOT = `https://raw.githubusercontent.com/DimbreathBot/TurnBasedGameData/${DATA_COMMIT}`;
const OUTPUT_PATH = resolve(dirname(fileURLToPath(import.meta.url)), "../src/data/endgameEnemyScenarios47.json");
const DAMAGE_TYPES = ["Physical", "Fire", "Ice", "Thunder", "Wind", "Quantum", "Imaginary"];
function parseGameJson(raw) {
  // Preserve 64-bit text-map hashes as strings instead of rounding them to JS numbers.
  return JSON.parse(raw.replace(/("Hash"\s*:\s*)(\d+)/g, "$1\"$2\""));
}

async function fetchJson(path) {
  const response = await fetch(`${RAW_ROOT}/${path}`);
  if (!response.ok) throw new Error(`Could not fetch ${path}: HTTP ${response.status}`);
  return parseGameJson(await response.text());
}

function valueOf(entry) {
  const value = entry?.Value?.Value ?? entry?.Value;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function buildTextLookup(...maps) {
  return (hash) => {
    if (hash === null || hash === undefined) return null;
    for (const map of maps) {
      const value = map?.[String(hash)];
      if (typeof value === "string" && value.trim()) return value;
    }
    return null;
  };
}

function mapBy(rows, key) {
  return new Map(rows.map((row) => [String(row[key]), row]));
}

function rawHardLevelFactors(rows, groupId, level) {
  const row = rows.find((entry) => Number(entry.HardLevelGroup) === Number(groupId)
    && Number(entry.Level) === Number(level));
  if (!row) return null;
  return {
    attack: valueOf(row.AttackRatio),
    defense: valueOf(row.DefenceRatio),
    hp: valueOf(row.HPRatio),
    speed: valueOf(row.SpeedRatio),
    toughness: valueOf(row.StanceRatio),
    statusResistance: valueOf(row.StatusResistance)
  };
}

function rawEliteGroupFactors(rows, groupId) {
  const row = rows.find((entry) => Number(entry.EliteGroup) === Number(groupId));
  if (!row) return null;
  return {
    attack: valueOf(row.AttackRatio),
    defense: valueOf(row.DefenceRatio),
    hp: valueOf(row.HPRatio),
    speed: valueOf(row.SpeedRatio),
    toughness: valueOf(row.StanceRatio)
  };
}

function scaledProduct(base, ...factors) {
  const values = [base, ...factors];
  if (!values.every((value) => Number.isFinite(value))) return null;
  return values.reduce((product, value) => product * value, 1);
}

function scaledStat(base, ...factors) {
  const value = scaledProduct(base, ...factors);
  return value === null ? null : Math.round(value);
}

function deriveCombatStats(baseStats, monsterModifiers, eliteFactors, hardLevelFactors, waveHpMultiplier = 0) {
  const stat = (key, extraFactor = 1) => scaledStat(
    baseStats[key],
    monsterModifiers[key],
    eliteFactors?.[key],
    hardLevelFactors?.[key],
    extraFactor
  );
  const baseStatusResistance = baseStats.statusResistance;
  const hardStatusResistance = hardLevelFactors?.statusResistance;
  const rawToughness = scaledProduct(
    baseStats.toughness,
    monsterModifiers.toughness,
    eliteFactors?.toughness,
    hardLevelFactors?.toughness
  );
  return {
    attack: stat("attack"),
    defense: stat("defense"),
    hp: stat("hp", 1 + waveHpMultiplier),
    speed: stat("speed"),
    // The endgame stat processor reports toughness in thirds.
    toughness: rawToughness === null ? null : Math.round(rawToughness / 3),
    statusResistance: Number.isFinite(baseStatusResistance) && Number.isFinite(hardStatusResistance)
      ? baseStatusResistance + hardStatusResistance
      : null
  };
}

function makeEnemy(monsterId, stage, waveNumber, slot, data) {
  const monster = data.monstersById.get(String(monsterId));
  if (!monster) throw new Error(`Stage ${stage.StageID} references missing MonsterConfig ID ${monsterId}`);
  const template = data.templatesById.get(String(monster.MonsterTemplateID));
  if (!template) throw new Error(`Monster ${monsterId} references missing template ${monster.MonsterTemplateID}`);

  const nameHash = monster.MonsterName?.Hash ?? template.MonsterName?.Hash ?? null;
  const weaknesses = Array.isArray(monster.StanceWeakList) ? monster.StanceWeakList : [];
  const configuredResistances = Object.fromEntries((monster.DamageTypeResistance || [])
    .map((entry) => [String(entry.DamageType), valueOf(entry.Value) * 100])
    .filter(([, value]) => Number.isFinite(value)));
  const missingResistances = DAMAGE_TYPES.filter((type) => !Object.hasOwn(configuredResistances, type)
    && !weaknesses.includes(type));
  const overlappingWeaknesses = weaknesses.filter((type) => Object.hasOwn(configuredResistances, type));
  const resistanceCoverageIsComplete = missingResistances.length === 0 && overlappingWeaknesses.length === 0;
  const resistancesPercent = Object.fromEntries(DAMAGE_TYPES
    .map((type) => [type, Object.hasOwn(configuredResistances, type)
      ? configuredResistances[type]
      : weaknesses.includes(type) ? 0 : null])
    .filter(([, value]) => value !== null));
  const monsterHardLevelGroup = Number(monster.HardLevelGroup);
  const stageHardLevelGroup = Number(stage.HardLevelGroup);
  const eliteGroup = Number(monster.EliteGroup);
  const eliteGroupFactors = rawEliteGroupFactors(data.eliteGroups, eliteGroup);
  const stageHardLevelFactors = rawHardLevelFactors(data.hardLevels, stageHardLevelGroup, stage.Level);
  // StageConfig's enemy waves do not carry a wave HP override. Match the
  // endgame processor's missing-field default of zero, and keep the assumption
  // explicit in the generated record.
  const waveHpMultiplier = 0;
  const baseStats = {
    attack: valueOf(template.AttackBase),
    hp: valueOf(template.HPBase),
    defense: valueOf(template.DefenceBase),
    speed: valueOf(template.SpeedBase),
    toughness: valueOf(template.StanceBase),
    statusResistance: valueOf(template.StatusResistanceBase),
    initialDelayRatio: valueOf(template.InitialDelayRatio)
  };
  const monsterModifiers = {
    attack: valueOf(monster.AttackModifyRatio),
    hp: valueOf(monster.HPModifyRatio),
    defense: valueOf(monster.DefenceModifyRatio),
    speed: valueOf(monster.SpeedModifyRatio),
    toughness: valueOf(monster.StanceModifyRatio)
  };
  const derivedStats = deriveCombatStats(
    baseStats, monsterModifiers, eliteGroupFactors, stageHardLevelFactors, waveHpMultiplier
  );

  return {
    id: `monster-${monsterId}-w${waveNumber}-${slot.toLowerCase()}`,
    monsterId: String(monsterId),
    templateId: String(monster.MonsterTemplateID),
    nameHash: nameHash === null ? null : String(nameHash),
    nameEn: data.getEnText(nameHash),
    nameRu: data.getRuText(nameHash),
    level: Number(stage.Level),
    weaknesses,
    resistancesPercent,
    resistanceSourceStatus: resistanceCoverageIsComplete
      ? "complete-from-game-config-resistances-and-weaknesses"
      : "partial-game-config-data",
    missingResistanceTypes: missingResistances,
    overlappingWeaknesses,
    baseStats,
    monsterModifiers,
    derivedStats,
    derivedStatsStatus: Object.values(derivedStats).every((value) => Number.isFinite(value))
      ? "calculated-from-pinned-game-config"
      : "incomplete-source-fields",
    waveHpMultiplier,
    eliteGroup,
    monsterHardLevelGroup,
    stageHardLevelGroup,
    eliteGroupFactors,
    hardLevelFactors: {
      monsterGroup: rawHardLevelFactors(data.hardLevels, monsterHardLevelGroup, stage.Level),
      stageGroup: stageHardLevelFactors
    },
    debuffResistances: Object.fromEntries((monster.DebuffResist || [])
      .map((entry) => [String(entry.Key), valueOf(entry.Value)])
      .filter(([, value]) => Number.isFinite(value))),
    summonIds: Array.isArray(monster.SummonIDList) ? monster.SummonIDList.map(String) : [],
    sourcePosition: { wave: waveNumber, slot }
  };
}

function makeStage(stageId, sideNumber, stageIndex, data) {
  const stage = data.stagesById.get(String(stageId));
  if (!stage) throw new Error(`Challenge references missing StageConfig ID ${stageId}`);

  const waves = (stage.MonsterList || []).map((wave, index) => Object.entries(wave)
    .map(([slot, monsterId]) => makeEnemy(monsterId, stage, index + 1, slot, data)));

  return {
    id: String(stage.StageID),
    nameEn: data.getEnText(stage.StageName?.Hash),
    nameRu: data.getRuText(stage.StageName?.Hash),
    level: Number(stage.Level),
    stageHardLevelGroup: Number(stage.HardLevelGroup),
    stageAbilities: Array.isArray(stage.StageAbilityConfig) ? stage.StageAbilityConfig : [],
    waves
  };
}

function selectHighestChallenge(mode, rows, schedule, snapshotDate) {
  const snapshotTime = `${snapshotDate} 12:00:00`;
  const activeSchedules = schedule.filter((entry) => entry.BeginTime <= snapshotTime && entry.EndTime > snapshotTime);
  if (activeSchedules.length !== 1) {
    throw new Error(`${mode}: expected one active schedule on ${snapshotDate}, found ${activeSchedules.length}`);
  }
  const activeSchedule = activeSchedules[0];
  const groupId = Number(activeSchedule.ID) % 100000;
  const groupRows = rows.filter((entry) => Number(entry.GroupID) === groupId);
  if (!groupRows.length) throw new Error(`${mode}: no challenge entries for active group ${groupId}`);

  const selected = groupRows.sort((left, right) => {
    const leftRank = mode === "moc" ? Number(left.ID) : Number(left.Floor);
    const rightRank = mode === "moc" ? Number(right.ID) : Number(right.Floor);
    return rightRank - leftRank;
  })[0];

  return {
    activeSchedule,
    groupId,
    floor: mode === "moc" ? Number(selected.ID) % 100 : Number(selected.Floor),
    challenge: selected
  };
}

const [monsterRows, templateRows, eliteGroups, hardLevels, stages, mocRows, pfRows, asRows,
  mocSchedule, pfSchedule, asSchedule, textEn, textRu0, textRu1] = await Promise.all([
  fetchJson("ExcelOutput/MonsterConfig.json"),
  fetchJson("ExcelOutput/MonsterTemplateConfig.json"),
  fetchJson("ExcelOutput/EliteGroup.json"),
  fetchJson("ExcelOutput/HardLevelGroup.json"),
  fetchJson("ExcelOutput/StageConfig.json"),
  fetchJson("ExcelOutput/ChallengeMazeConfig.json"),
  fetchJson("ExcelOutput/ChallengeStoryMazeConfig.json"),
  fetchJson("ExcelOutput/ChallengeBossMazeConfig.json"),
  fetchJson("ExcelOutput/ScheduleDataChallengeMaze.json"),
  fetchJson("ExcelOutput/ScheduleDataChallengeStory.json"),
  fetchJson("ExcelOutput/ScheduleDataChallengeBoss.json"),
  fetchJson("TextMap/TextMapEN.json"),
  fetchJson("TextMap/TextMapRU_0.json"),
  fetchJson("TextMap/TextMapRU_1.json")
]);

const getEnText = buildTextLookup(textEn);
const getRuText = buildTextLookup(textRu0, textRu1);
const sharedData = {
  monstersById: mapBy(monsterRows, "MonsterID"),
  templatesById: mapBy(templateRows, "MonsterTemplateID"),
  eliteGroups,
  stagesById: mapBy(stages, "StageID"),
  hardLevels,
  getEnText,
  getRuText
};

const modes = [
  { key: "moc", challengeRows: mocRows, scheduleRows: mocSchedule },
  { key: "pf", challengeRows: pfRows, scheduleRows: pfSchedule },
  { key: "as", challengeRows: asRows, scheduleRows: asSchedule }
];

const scenarios = {};
for (const mode of modes) {
  const selected = selectHighestChallenge(mode.key, mode.challengeRows, mode.scheduleRows, SNAPSHOT_DATE);
  const challenge = selected.challenge;
  const sideStageIds = [challenge.EventIDList1 || [], challenge.EventIDList2 || []];
  const sides = sideStageIds.map((ids, sideIndex) => ({
    id: `side-${sideIndex + 1}`,
    sideNumber: sideIndex + 1,
    npcMonsterIds: ((sideIndex === 0 ? challenge.NpcMonsterIDList1 : challenge.NpcMonsterIDList2) || []).map(String),
    stages: ids.map((stageId, stageIndex) => makeStage(stageId, sideIndex + 1, stageIndex, sharedData))
  })).filter((side) => side.stages.length > 0);

  scenarios[mode.key] = {
    id: `${mode.key}-group-${selected.groupId}-floor-${selected.floor}`,
    mode: mode.key,
    groupId: selected.groupId,
    floor: selected.floor,
    challengeId: String(challenge.ID),
    nameEn: getEnText(challenge.Name?.Hash),
    nameRu: getRuText(challenge.Name?.Hash),
    activeFrom: selected.activeSchedule.BeginTime,
    activeUntil: selected.activeSchedule.EndTime,
    challengeBuffId: String(challenge.MazeBuffID),
    sides
  };
}

const output = {
  schemaVersion: 1,
  gameVersion: "4.7.0",
  snapshotDate: SNAPSHOT_DATE,
  dataSource: {
    repository: REPOSITORY,
    commit: DATA_COMMIT,
    commitMessage: "OSPRODWin4.7.0_D17180467_A17176203_L17175930",
    rawRoot: RAW_ROOT,
    textMapLanguages: ["EN", "RU"]
  },
  interpretation: {
    selectedContent: "Active challenge group and highest configured floor/tier on snapshotDate.",
    scenarioLayout: "Both sides and all stages/waves are preserved separately; do not flatten different waves into one AoE target group.",
    resistance: "Explicit MonsterConfig DamageTypeResistance entries are converted to percent points; an unlisted element is set to 0 only when the same config lists it as a weakness. Incomplete coverage stays flagged.",
    enemyStats: "Derived combat stats use Base x MonsterModifyRatio x EliteGroupRatio x StageHardLevelGroupRatio; wave HP multiplier defaults to 0 because no override is present in StageConfig. Toughness is divided by 3 and status resistance adds the stage hard-level value, following the referenced endgame stat processor. Raw factors remain alongside derived values.",
    enemyStatFormulaSource: "https://github.com/seriaati/hakushin-py/blob/main/hakushin/clients/hsr.py",
    unmodeledChallengeBuff: "challengeBuffId is retained as source data but its effects are not applied by this catalog."
  },
  scenarios
};

await mkdir(dirname(OUTPUT_PATH), { recursive: true });
await writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`Wrote ${OUTPUT_PATH}`);
for (const scenario of Object.values(scenarios)) {
  const waveCount = scenario.sides.reduce((total, side) => total + side.stages.reduce((sum, stage) => sum + stage.waves.length, 0), 0);
  const enemyCount = scenario.sides.reduce((total, side) => total + side.stages.reduce((sum, stage) => sum + stage.waves.flat().length, 0), 0);
  console.log(`${scenario.mode}: group ${scenario.groupId}, floor ${scenario.floor}, ${scenario.sides.length} sides, ${waveCount} waves, ${enemyCount} enemy slots`);
}
