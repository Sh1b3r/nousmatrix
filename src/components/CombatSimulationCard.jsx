import React, { useState, useMemo } from "react";
import { runCombatSimulation } from "../utils/simulation.js";
import { CHARACTER_SQUADS, TEAM_DATA_BY_CHARACTER, TEAM_STATISTICS_SOURCES, matchSquadWithShowcase, rankSquadsByShowcase } from "../utils/teamSynergy.js";
import { runFullTeamRotationSimulation } from "../utils/rotationSimulation.js";
import { scoreAgainstCombatBenchmark } from "../utils/combatBenchmark.js";
import { resolveCombatEquipmentEffects } from "../utils/combatEquipmentEffects.js";
import { iconUrl, handleImageFallback } from "../utils/audit.js";
import { SwordIcon, ShieldIcon, SparklesIcon, CheckIcon, WarnIcon } from "./Icons.jsx";

export default function CombatSimulationCard({ character, audit, stats, showcase = [], lang = "ru" }) {
  if (!character || !audit) return null;
  const isRu = lang === "ru";
  const archetype = audit.detectedRole?.targetArchetype || "CRIT_DPS";
  const charId = String(character.id || "");

  const squads = useMemo(() => {
    const list = CHARACTER_SQUADS[charId] || CHARACTER_SQUADS[String(character?.id || "")];
    return rankSquadsByShowcase(list || [], showcase);
  }, [charId, character, showcase]);

  const [selectedSquadIdx, setSelectedSquadIdx] = useState(0);
  const [enemyMode, setEnemyMode] = useState("moc");
  const currentSquad = squads[selectedSquadIdx] || squads[0] || null;
  const teamData = TEAM_DATA_BY_CHARACTER[charId] || null;
  const mocDataSource = TEAM_STATISTICS_SOURCES.find((source) => source.id === "mocdata-processed")?.datasetUrl;
  const noTeamDescription = teamData
    ? (isRu
      ? `Подтверждённая статистика не публикует для этого персонажа точную четвёрку. AstraVoy: ${teamData.pageStatus === "available" ? `${Number(teamData.observationCount || 0).toLocaleString("ru-RU")} наблюдений, командных строк — ${teamData.publishedTeamRows || 0}` : "страница персонажа с командами отсутствует"}. В MocDataProcessed 4.6.4 точных составов нет. Статистика 4.7 пока не опубликована; составы по аналогии не подставляются.`
      : `The verified statistics don't publish an exact four-character lineup for this character. AstraVoy: ${teamData.pageStatus === "available" ? `${Number(teamData.observationCount || 0).toLocaleString("en-US")} observations, team rows: ${teamData.publishedTeamRows || 0}` : "no character team page"}. MocDataProcessed 4.6.4 has no exact lineup either. Version 4.7 team data is not published yet, so no team is inferred by analogy.`)
    : (isRu
      ? "Для этого персонажа пока нет проверенной команды. Автоматические замены по Пути или общей роли отключены; показанный расчёт не включает баффы союзников."
      : "No validated team is available for this character yet. Path or broad-role substitutions are disabled; the displayed calculation does not include teammate buffs.");

  const matchedTeammates = useMemo(() => {
    return matchSquadWithShowcase(currentSquad, showcase, lang);
  }, [currentSquad, showcase, lang]);

  const missingTeammates = useMemo(() => {
    return matchedTeammates.filter((tm) => !tm.isEquippedInShowcase && !tm.identityMismatch);
  }, [matchedTeammates]);
  const identityMismatches = useMemo(() => matchedTeammates.filter((tm) => tm.identityMismatch), [matchedTeammates]);

  const rotationSim = useMemo(() => {
    return runFullTeamRotationSimulation(character, stats || {}, currentSquad, matchedTeammates, lang, { enemyMode, language: lang });
  }, [character, stats, currentSquad, matchedTeammates, lang, enemyMode]);
  const equipmentCoverage = useMemo(() => resolveCombatEquipmentEffects(character, matchedTeammates, {
    targetCount: enemyMode === "pf" ? 5 : 3
  }), [character, matchedTeammates, enemyMode]);

  const sim = runCombatSimulation(character, stats || {}, archetype, lang, { enemyMode, language: lang });
  const benchmark = useMemo(() => {
    if (!rotationSim) return null;
    const teamSignature = [
      {
        id: charId,
        eidolon: Number(character.rank) || 0,
        lightConeId: character.light_cone?.id || null,
        superimposition: character.light_cone?.rank || 1,
        lightConeLevel: character.light_cone?.level || null
      },
      ...matchedTeammates.map((teammate) => ({
        id: String(teammate.id || ""),
        eidolon: Number(teammate.matchedChar?.rank) || 0,
        lightConeId: teammate.matchedChar?.light_cone?.id || null,
        superimposition: teammate.matchedChar?.light_cone?.rank || 1,
        lightConeLevel: teammate.matchedChar?.light_cone?.level || null,
        realStats: teammate.realStats || null
      }))
    ].sort((a, b) => a.id.localeCompare(b.id));
    return scoreAgainstCombatBenchmark({
      characterId: charId,
      teamId: currentSquad?.id || null,
      teamSignature: JSON.stringify(teamSignature),
      eidolon: `E${Number(character.rank) || 0}`,
      lightConeId: character.light_cone?.id || null,
      superimposition: character.light_cone?.rank || 1,
      enemyMode,
      rotationId: charId,
      speed: Number(stats?.spd || 0)
    }, rotationSim.rotationTotalDamage);
  }, [rotationSim, charId, currentSquad, character, enemyMode, stats, matchedTeammates]);
  if (!sim) return null;

  const isDual = Boolean(sim.hasDualOutput);
  const detectedRole = String(audit.detectedRole?.role || "").toUpperCase();
  const isSupport = ["SUPPORT", "SUSTAIN"].includes(detectedRole)
    || sim.type === "SUPPORT" || sim.type === "SUSTAIN" || sim.type === "HYBRID_SUBDPS";
  const displayEnemyInfo = rotationSim?.enemyScenarioInfo || sim.enemyScenarioInfo;
  const displayEnemyTargets = rotationSim?.enemyTargets || (sim.enemyTarget ? [sim.enemyTarget] : []);
  const selectedEnemySummary = displayEnemyInfo
    ? displayEnemyTargets.map((target) => {
      const derived = target.derivedStats || {};
      const locale = isRu ? "ru-RU" : "en-US";
      const derivedSummary = target.derivedStatsStatus === "calculated-from-pinned-game-config"
        ? `; ${isRu ? "HP" : "HP"} ${Number(derived.hp || 0).toLocaleString(locale)}, ${isRu ? "СКОР" : "SPD"} ${Number(derived.speed || 0).toLocaleString(locale)}, ${isRu ? "стойкость" : "Toughness"} ${Number(derived.toughness || 0).toLocaleString(locale)}`
        : "";
      return `${target.name || target.id} (Lv. ${target.level}, ${target.resistancePercent.toFixed(0)}% RES${derivedSummary})`;
    }).join("; ")
    : null;

  const roleBadgeLabel = () => {
    if (sim.type === "HYBRID_SUBDPS") return isRu ? "Саб-ДПС и поддержка" : "Hybrid Sub-DPS & Utility";
    if (detectedRole === "SUPPORT" || sim.type === "SUPPORT") return isRu ? "Поддержка отряда (Саппорт)" : "Team Support / Buffer";
    if (detectedRole === "SUSTAIN" || sim.type === "SUSTAIN") return isRu ? "Выживание и защита (Сустейн)" : "Sustain & Mitigation";
    return isRu ? "Основной урон (Гиперкерри)" : "Main Damage Carry";
  };

  const getTeammateAvatarUrl = (tm) => {
    if (tm.matchedChar?.avatar?.icon) return iconUrl(tm.matchedChar.avatar.icon);
    if (tm.matchedChar?.icon) return iconUrl(tm.matchedChar.icon);
    if (tm.icon) return iconUrl(tm.icon);
    if (tm.id) return iconUrl(`icon/character/${tm.id}.png`);
    return null;
  };

  return (
    <div className="panel panel-combat-sim">
      <div className="panel-title">
        <span>{isRu ? "Модель боевого урона" : "Combat Damage Model"}</span>
        <div className="sim-header-controls">
          <span className="sim-provenance-tag" title={isRu ? "Базовые статы и постоянные свойства берутся из профиля; боевые эффекты конуса и эйдолонов добавляются только при наличии правила для сценария" : "Base stats and permanent properties come from the profile; battle-only Light Cone and Eidolon effects are applied when the scenario has an exact rule"}>
            {isRu ? "ДАННЫЕ ПРОФИЛЯ" : "PROFILE DATA"}
          </span>
          <select
            className="sim-mode-select"
            value={enemyMode}
            onChange={(e) => setEnemyMode(e.target.value)}
            title={isRu ? "Режим и активные данные врагов испытания" : "Mode and active challenge enemy data"}
          >
            <option value="moc">{isRu ? "MoC • Активный этаж" : "MoC • Active Floor"}</option>
            <option value="pf">{isRu ? "PF • Активный этаж" : "PF • Active Floor"}</option>
            <option value="as">{isRu ? "AS • Активный этаж" : "AS • Active Floor"}</option>
          </select>
        </div>
      </div>

      <div className="combat-sim-header">
        <div className="combat-sim-title-group">
          <div className="combat-sim-badge-row">
            <span
              className={`combat-sim-badge ${sim.type === "HYBRID_SUBDPS" ? "hybrid" : isSupport ? "support" : "dps"
                }`}
            >
              {sim.type === "HYBRID_SUBDPS" ? (
                <SparklesIcon size={12} />
              ) : isSupport ? (
                <ShieldIcon size={12} />
              ) : (
                <SwordIcon size={12} />
              )}
              <span>{roleBadgeLabel()}</span>
            </span>
            <span className="sim-provenance-tag">
              {isRu ? "Расчёт симуляции" : "Model Simulation"}
            </span>
          </div>
          <h3 className="combat-sim-heading">
            {isRu ? "Сценарная оценка урона отряда" : "Team Damage Scenario Estimate"}
          </h3>
        </div>
        <div className="combat-sim-tier-box" title={benchmark ? `${benchmark.gameVersion} • ${benchmark.source || "verified benchmark"}` : (isRu ? "Для этой конфигурации пока нет проверенного эталона" : "No validated benchmark exists for this configuration yet")}>
          <span className="combat-sim-tier-label">{isRu ? "Эталон сборки" : "Build Benchmark"}</span>
          <span className="combat-sim-tier-val">{benchmark ? `${benchmark.percent.toFixed(1)}%` : (isRu ? "Нет данных" : "No data")}</span>
        </div>
      </div>

      {/* Squad selector */}
      {currentSquad ? <div className="combat-squad-section">
        <div className="combat-squad-nav">
          <div className="squad-tabs-list">
            {squads.map((sq, idx) => (
              <button
                key={sq.id || idx}
                type="button"
                className={`squad-tab-btn ${selectedSquadIdx === idx ? "active" : ""}`}
                onClick={() => setSelectedSquadIdx(idx)}
                title={sq.sourceUrl ? `${sq.sourceCoverage || sq.sourceVersion || ""} • ${sq.sourceUpdatedAt || ""} • ${(sq.sourceUrls || [sq.sourceUrl]).join(" • ")}` : ""}
              >
                <span className="squad-tab-number">{idx + 1}</span>
                <span className="squad-tab-title">
                  {isRu ? sq.nameRu : sq.nameEn}
                  {sq.status === "historical-statistics"
                    ? <em className="squad-estimate-tag">{isRu ? sq.sourceBadgeRu : sq.sourceBadgeEn}</em>
                    : sq.isEstimate && <em className="squad-estimate-tag">{isRu ? ` оценка ${sq.sourceVersion || ""}` : ` est. ${sq.sourceVersion || ""}`}</em>}
                </span>
              </button>
            ))}
          </div>
        </div>
        <p className="combat-squad-desc">{isRu ? currentSquad.descRu : currentSquad.descEn}</p>

        {/* Teammates sync notice */}
        {missingTeammates.length > 0 || identityMismatches.length > 0 ? (
          <div className="squad-showcase-alert warning">
            <div className="alert-icon-col">
              <WarnIcon size={16} />
            </div>
            <div className="alert-body-col">
              <span className="alert-title">
                {identityMismatches.length > 0
                  ? (isRu
                    ? `Не совпал ID у ${identityMismatches.length} союзника; его статы и эффекты отключены`
                    : `${identityMismatches.length} teammate ID mismatch; their stats and effects are disabled`)
                  : (isRu
                    ? `${missingTeammates.length} из 3 союзников отсутствуют на витрине`
                    : `${missingTeammates.length} of 3 teammates missing from showcase`)}
              </span>
              <p className="alert-text">
                {identityMismatches.length > 0
                  ? (isRu
                    ? `Профиль содержит другой персонаж с этим ID: ${identityMismatches.map((m) => m.characterName).join(", ")}. Проверьте ID в данных команды; эффекты этого слота не участвуют в расчёте.`
                    : `The profile resolves this ID to a different character: ${identityMismatches.map((m) => m.characterName).join(", ")}. Check the team data; this slot is excluded from calculations.`)
                  : (isRu
                    ? `Статы ${missingTeammates.length} союзников неизвестны; используются только явно заданные в карточке отряда баффы. Чтобы загрузить витринные данные, добавьте персонажей в профиль и нажмите «ОБНОВИТЬ»: [${missingTeammates
                      .map((m) => m.nameRu || m.characterName || m.names[0])
                      .join(", ")}]`
                    : `Stats for ${missingTeammates.length} allies are unknown; only buffs explicitly configured in the team record are used. Add them to the profile and refresh to load showcase data: [${missingTeammates
                      .map((m) => m.nameEn || m.characterName || m.names[0])
                      .join(", ")}]`)}
              </p>
            </div>
          </div>
        ) : (
          <div className="squad-showcase-alert success">
            <div className="alert-icon-col">
              <CheckIcon size={16} />
            </div>
            <div className="alert-body-col">
              <span className="alert-title">
                {isRu ? "Данные всех союзников загружены из витрины" : "All teammate profiles loaded"}
              </span>
              <p className="alert-text">
                {isRu
                ? "Статы союзников загружены для просмотра, но пока не пересчитывают фиксированные баффы состава; длительность эффектов не моделируется."
                : "Teammate stats are loaded for display but do not yet recalculate the team's fixed buffs; effect uptime is not modeled."}
              </p>
            </div>
          </div>
        )}

        {/* Teammates grid */}
        <div className="squad-teammates-grid">
          {matchedTeammates.map((tm, tIdx) => {
            const avatarUrl = getTeammateAvatarUrl(tm);
            const tmName =
              tm.matchedChar?.name ||
              (isRu ? tm.nameRu || tm.names[0] : tm.nameEn || tm.names[1] || tm.names[0]);
            const isEquipped = Boolean(tm.isEquippedInShowcase);
            return (
              <div key={tIdx} className={`teammate-card ${isEquipped ? "equipped" : "missing"}`}>
                <div className="teammate-top">
                  <div className="teammate-avatar-wrap">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={tmName}
                        className="teammate-avatar-img"
                        onError={(e) => handleImageFallback(e, "avatar")}
                      />
                    ) : (
                      <div className="teammate-avatar-placeholder">?</div>
                    )}
                  </div>
                  <div className="teammate-meta">
                    <span className="teammate-name">{tmName}</span>
                    <span className="teammate-role">{isRu ? tm.roleRu : tm.roleEn}</span>
                  </div>
                </div>
                <div className="teammate-status-row">
                  {isEquipped ? (
                    <span className="teammate-badge status-on" title={isRu ? "Характеристики получены из профиля HSR" : "Stats synced from HSR"}>
                      <CheckIcon size={11} />
                      <span>{isRu ? "На витрине (HSR)" : "On Showcase (HSR)"}</span>
                    </span>
                  ) : (
                    <span className="teammate-badge status-off" title={isRu ? "Статы союзника неизвестны; используются только явно настроенные баффы" : "Ally stats are unknown; only explicitly configured buffs are used"}>
                      <WarnIcon size={11} />
                      <span>{isRu ? "Статы неизвестны" : "Stats unknown"}</span>
                    </span>
                  )}
                  {isEquipped && tm.realStats && (
                    <span className="teammate-stat-pill">
                      {tm.realStats.cd > 50 && `${tm.realStats.cd}% КУ`}
                      {tm.realStats.atk > 2500 && `${tm.realStats.atk} ATK`}
                      {tm.realStats.be > 80 && `${tm.realStats.be}% ЭП`}
                      {tm.realStats.def > 2500 && `${tm.realStats.def} DEF`}
                    </span>
                  )}
                </div>
                <p className="teammate-buff-desc">{isRu ? tm.dynamicBuffDescRu : tm.dynamicBuffDescEn}</p>
              </div>
            );
          })}
        </div>
      </div> : (
        <div className="combat-squad-section">
          <p className="combat-squad-desc">
            {noTeamDescription}
          </p>
          {teamData?.sourcePageUrl && teamData.pageStatus === "available" && (
            <p className="combat-squad-desc">
              <a href={teamData.sourcePageUrl} target="_blank" rel="noreferrer">
                {isRu ? "Страница статистики AstraVoy" : "AstraVoy statistics page"}
              </a>
            </p>
          )}
          {mocDataSource && (
            <p className="combat-squad-desc">
              <a href={mocDataSource} target="_blank" rel="noreferrer">
                {isRu ? "Проверить набор данных MocDataProcessed" : "Review the MocDataProcessed dataset"}
              </a>
            </p>
          )}
        </div>
      )}

      {/* Rotation Metrics Grid */}
      {rotationSim && (
        <>
          <div className="combat-sim-metrics-grid rotation-metrics">
            <div className="combat-sim-metric-box highlight-box">
              <span className="sim-metric-label">
                {isRu ? "Сумма заданных ударов" : "Configured Hits Total"}
              </span>
              <span className="sim-metric-value text-accent big">
                {Number(rotationSim.rotationTotalDamage || 0).toLocaleString("ru-RU")}
              </span>
              <span className="sim-metric-hint">
                {rotationSim?.teamBuffStatus === "explicit-values-assumed-full-uptime"
                  ? (isRu ? "Учтены только вручную заданные баффы; их полная длительность предполагается" : "Only explicitly configured buffs are included; full uptime is assumed")
                  : (isRu ? "Баффы команды не заданы; рассчитан только урон основного персонажа" : "No team buffs are configured; only the lead character's damage is calculated")}
              </span>
            </div>
            <div className="combat-sim-metric-box">
              <span className="sim-metric-label">
                {isRu ? "Максимальный урон действия" : "Peak Ability Damage"}
              </span>
              <span className="sim-metric-value">
                {Number(rotationSim.peakHitDamage || 0).toLocaleString("ru-RU")}
              </span>
              <span className="sim-metric-hint">
                {isRu ? "Может суммировать цели AoE" : "May sum AoE targets"}
              </span>
            </div>
          </div>
        </>
      )}

      {/* Sub-DPS section */}
      {isDual && (
        <div className="combat-sim-subdps-section">
          <div className="combat-section-header">
            <span className="combat-section-icon">
              <SwordIcon size={13} />
            </span>
            <span className="combat-section-title">
              {sim.type === "DPS"
                ? (isRu ? "Личный боевой вклад (Main DPS)" : "Personal Output (Main DPS)")
                : (isRu ? "Личный боевой вклад (Sub-DPS)" : "Personal Combat Output (Sub-DPS)")}
            </span>
          </div>
          <div className="combat-sim-metrics-grid sub-grid">
            <div className="combat-sim-metric-box sub-box">
              <span className="sim-metric-label">{sim.personalDpaLabel}</span>
              <span className="sim-metric-value highlight">
                {sim.personalDpa === null || sim.personalDpa === undefined
                  ? "—"
                  : Number(sim.personalDpa).toLocaleString("ru-RU")}
              </span>
            </div>
            <div className="combat-sim-metric-box sub-box">
              <span className="sim-metric-label">{sim.personalDpcLabel}</span>
              <span className="sim-metric-value">
                {sim.personalDpc === null || sim.personalDpc === undefined
                  ? "—"
                  : Number(sim.personalDpc).toLocaleString("ru-RU")}
              </span>
            </div>
            <div className="combat-sim-metric-box sub-box">
              <span className="sim-metric-label">{sim.personalMetric3Label}</span>
              <span className="sim-metric-value">{sim.personalMetric3Value}</span>
            </div>
          </div>
        </div>
      )}

      {/* Summary and collapsible technical parameters */}
      <div className="combat-sim-summary">
        <p className="sim-summary-text">
          {rotationSim
            ? (isRu
              ? "Сумма вручную заданных попаданий по упрощённой формуле. Это оценка сценария, а не полная боевая симуляция: порядок ходов, энергия, частота срабатываний и длительность баффов не рассчитываются."
              : "Sum of manually configured hits using a simplified formula. This is a scenario estimate, not a full combat simulation: turn order, energy, trigger frequency, and buff duration are not calculated.")
            : (isRu
              ? "Для персонажа нет сценария ударов. Доступна только черновая оценка одного удара; она не описывает ротацию или урон за бой."
              : "No action script is configured for this character. Only a draft single-hit estimate is available; it does not represent a rotation or total combat damage.")}
        </p>
        <details className="sim-params-disclosure">
          <summary className="sim-params-summary">
            <span>
              {isRu
                ? `Допущения и параметры симуляции (${enemyMode.toUpperCase()}${displayEnemyInfo ? ` / этаж ${displayEnemyInfo.floor}` : ""})`
                : `Simulation Assumptions & Parameters (${enemyMode.toUpperCase()}${displayEnemyInfo ? ` / Floor ${displayEnemyInfo.floor}` : ""})`}
            </span>
          </summary>
          <div className="sim-assumptions-list">
            <div className="assumption-item">
              <span className="assumption-bullet">•</span>
              <span>
                {displayEnemyInfo
                  ? (isRu
                    ? `Цели выбранной волны: ${selectedEnemySummary}. Данные 4.7.0: этаж ${displayEnemyInfo.floor}, сторона ${displayEnemyInfo.sideNumber}, этап ${displayEnemyInfo.stageId}, волна ${displayEnemyInfo.waveNumber}/${displayEnemyInfo.waveCount}. Бафф испытания ${displayEnemyInfo.challengeBuffId} не включён.`
                    : `Selected wave targets: ${selectedEnemySummary}. 4.7.0 data: floor ${displayEnemyInfo.floor}, side ${displayEnemyInfo.sideNumber}, stage ${displayEnemyInfo.stageId}, wave ${displayEnemyInfo.waveNumber}/${displayEnemyInfo.waveCount}. Challenge buff ${displayEnemyInfo.challengeBuffId} is excluded.`)
                  : (isRu
                    ? "Используются общие параметры режима: уровни, состав волны и сопротивления конкретных врагов не заданы."
                    : "Generic mode assumptions are used; exact enemy levels, lineup, and resistances are unavailable.")}
              </span>
            </div>
            {rotationSim && (
              <div className="assumption-item">
                <span className="assumption-bullet">•</span>
                <span>
                  {rotationSim?.enemyScenarioInfo
                    ? (isRu
                      ? `В этой волне ${rotationSim.targetCount} целей. Слабости и сопротивления применяются отдельно к каждой; состояние стойкости не задано, поэтому прямой урон считает шкалу целой (×0,9).`
                      : `This wave has ${rotationSim.targetCount} targets. Weaknesses and RES are resolved per target; break state is unknown, so direct hits assume intact Toughness (×0.9).`)
                    : (isRu
                      ? `Условное число целей: ${rotationSim.targetCount}. Сопротивление ${rotationSim.enemyResistancePercent.toFixed(0)}%; слабости и стойкость не заданы.`
                      : `Generic target count: ${rotationSim.targetCount}. RES is ${rotationSim.enemyResistancePercent.toFixed(0)}%; weakness and break state are unspecified.`)}
                </span>
              </div>
            )}
            {rotationSim?.calculationWarnings?.map((warning) => (
              <div className="assumption-item" key={warning}>
                <span className="assumption-bullet">•</span>
                <span>
                  {warning.startsWith("Super Break omitted")
                    ? isRu
                      ? "Суперпробитие не включено: задайте пробитую цель, число срабатываний, истощение стойкости и базовый урон пробития для уровня персонажа."
                      : "Super Break is omitted: configure a broken target, proc count, Toughness reduction, and level-specific base Break damage."
                    : warning}
                </span>
              </div>
            ))}
            {equipmentCoverage && (
              <div className="assumption-item">
                <span className="assumption-bullet">•</span>
                <span>
                  {isRu
                    ? `Конус и эйдолоны: статы профиля учтены; правил E/S применено: ${equipmentCoverage.applied.length}; условий вне этой модели: ${equipmentCoverage.notModeled.length}.`
                    : `Light Cone and Eidolons: profile stats are included; E/S rules applied: ${equipmentCoverage.applied.length}; conditions outside this model: ${equipmentCoverage.notModeled.length}.`}
                </span>
              </div>
            )}
            <div className="assumption-item">
              <span className="assumption-bullet">•</span>
              <span>{isRu ? "Показаны только вручную заданные попадания; порядок ходов, энергия и число повторных действий не моделируются." : "Only manually configured hits are included; turn order, energy, and repeated action counts are not simulated."}</span>
            </div>
            <div className="assumption-item">
              <span className="assumption-bullet">•</span>
              <span>
                {rotationSim?.buffTimingStatus === "verified-schedule"
                  ? (isRu ? "Баффы применены по проверенной таблице активности ударов." : "Buffs follow a verified per-hit uptime table.")
                  : rotationSim?.buffTimingStatus === "no-numeric-buffs-configured"
                    ? (isRu ? "Численные баффы союзников не заданы, поэтому в урон они не добавлены." : "No numerical ally buffs are configured, so none are added to damage.")
                    : (isRu ? "Нет проверенного таймлайна баффов: заданные бонусы считаются активными на всех ударах." : "No verified buff timeline is available; configured buffs are assumed active on every hit.")}
              </span>
            </div>
            <div className="assumption-item">
              <span className="assumption-bullet">•</span>
              <span>
                {isRu
                  ? missingTeammates.length > 0
                    ? `Союзники: ${missingTeammates.length} персонажей не найдены в витрине; их статы не подставляются, используются только фиксированные значения из данных отряда.`
                    : "Союзники: все 3 персонажа найдены в витрине — используются показанные статы, но не длительность эффектов."
                  : missingTeammates.length > 0
                    ? `Teammates: ${missingTeammates.length} allies are absent from the showcase; no stats are fabricated, only fixed team-record values are used.`
                    : "Teammates: all 3 allies are in the showcase; shown stats are used, but effect duration is not simulated."}
              </span>
            </div>
            {rotationSim?.hasUnmodeledAtkPercent && (
              <div className="assumption-item">
                <span className="assumption-bullet">•</span>
                <span>{isRu ? "Процентный бафф АТК не включён: базовая АТК отсутствует в данных профиля." : "ATK% buffs are omitted because base ATK is unavailable in the profile."}</span>
              </div>
            )}
            <div className="assumption-item">
              <span className="assumption-bullet">•</span>
              <span>{isRu ? "Назначение: стандартизированная математическая модель для сравнения сборок, а не запись живого боя." : "Purpose: standardized model for build comparison, not a recorded live run."}</span>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}
