import React, { useState, useMemo } from "react";
import { runCombatSimulation } from "../utils/simulation.js";
import { CHARACTER_SQUADS, TEAM_DATA_BY_CHARACTER, TEAM_STATISTICS_SOURCES, matchSquadWithShowcase, rankSquadsByShowcase } from "../utils/teamSynergy.js";
import { runFullTeamRotationSimulation } from "../utils/rotationSimulation.js";
import { scoreAgainstCombatBenchmark, getBenchmarkReference } from "../utils/combatBenchmark.js";
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
  React.useEffect(() => {
    setSelectedSquadIdx(0);
  }, [charId]);
  const [includeTeamBuffs, setIncludeTeamBuffs] = useState(true);
  const [enemyMode, setEnemyMode] = useState("moc");
  // Явное число срабатываний Weakness Break в сценарии ротации.
  const [breakProcsInput, setBreakProcsInput] = useState("");
  const breakProcs = Math.max(0, Math.floor(Number(breakProcsInput) || 0));
  // Сумма накопленного лечения (Гиацина): урон мемо-спрайта Little Ica
  const [healingTallyInput, setHealingTallyInput] = useState("");
  const healingTally = Math.max(0, Number(healingTallyInput) || 0);
  // Число срабатываний Суперпробития кита (Светлячок, след A4)
  const [superBreakProcsInput, setSuperBreakProcsInput] = useState("");
  const superBreakProcs = Math.max(0, Math.floor(Number(superBreakProcsInput) || 0));
  const usesHealingTallyInput = charId === "1409";
  const usesSuperBreakInput = charId === "1310";
  const currentSquad = squads[selectedSquadIdx] || squads[0] || null;
  const teamData = TEAM_DATA_BY_CHARACTER[charId] || null;
  const noTeamDescription = isRu
    ? "Для данного персонажа формируется базовая конфигурация отряда. Расчёт адаптирован под текущие боевые параметры."
    : "Squad baseline is being established for this character. Calculations adapt to active combat parameters.";

  const matchedTeammates = useMemo(() => {
    return matchSquadWithShowcase(currentSquad, showcase, lang);
  }, [currentSquad, showcase, lang]);

  const missingTeammates = useMemo(() => {
    return matchedTeammates.filter((tm) => !tm.isEquippedInShowcase && !tm.identityMismatch);
  }, [matchedTeammates]);
  const identityMismatches = useMemo(() => matchedTeammates.filter((tm) => tm.identityMismatch), [matchedTeammates]);

  const activeTeammates = useMemo(() => {
    return includeTeamBuffs ? matchedTeammates : [];
  }, [includeTeamBuffs, matchedTeammates]);

  const rotationSim = useMemo(() => {
    return runFullTeamRotationSimulation(character, stats || {}, currentSquad, activeTeammates, lang, {
      enemyMode,
      language: lang,
      breakProcs,
      healingTally,
      superBreakProcs
    });
  }, [character, stats, currentSquad, activeTeammates, lang, enemyMode, breakProcs, healingTally, superBreakProcs]);
  // Референсный эталон симуляции
  const benchmarkReference = useMemo(() => getBenchmarkReference(charId), [charId]);
  const equipmentCoverage = useMemo(() => resolveCombatEquipmentEffects(character, matchedTeammates, {
    targetCount: enemyMode === "pf" ? 5 : 3
  }), [character, matchedTeammates, enemyMode]);

  const sim = runCombatSimulation(character, stats || {}, archetype, lang, { enemyMode, language: lang });
  const benchmark = useMemo(() => {
    if (rotationSim?.calculationStatus !== "verified-combat-simulation") return null;
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
  const isTimelineCalculation = rotationSim?.calculationStatus === "explicit-timeline-simulation";
  const displayEnemyInfo = isTimelineCalculation ? null : rotationSim?.enemyScenarioInfo || sim.enemyScenarioInfo;
  const displayEnemyTargets = rotationSim?.enemyTargets || (sim.enemyTarget ? [sim.enemyTarget] : []);
  const timelineActorsById = new Map((rotationSim?.combatTimeline?.actors || [])
    .map((actor) => [String(actor.id), actor.name || actor.id]));
  const formatBlockedReason = (reason) => {
    const labels = isRu
      ? { energy: "не хватает энергии", "skill-points": "не хватает ОН", hp: "недостаточно HP", "hp-state": "HP не заданы", "invalid-hp-requirement": "ошибка условия HP" }
      : { energy: "not enough Energy", "skill-points": "not enough SP", hp: "insufficient HP", "hp-state": "HP state missing", "invalid-hp-requirement": "invalid HP condition" };
    return String(reason || (isRu ? "нет ресурса" : "resource unavailable"))
      .split("+")
      .map((part) => labels[part] || part)
      .join(" + ");
  };
  const damageBreakdown = isTimelineCalculation
    ? (rotationSim.combatTimeline?.events || []).flatMap((event) => {
      if (event.status === "blocked") return [{
        key: `${event.eventIndex}:blocked`,
        phase: `AV ${event.actionValue} · ${event.actorName}`,
        actionName: event.actionName,
        status: "blocked",
        blockedBy: event.blockedBy
      }];
      return (event.damage || []).map((hit, index) => ({
        key: `${event.eventIndex}:${hit.targetId}:${index}`,
        phase: `AV ${event.actionValue} · ${event.actorName}`,
        actionName: event.actionName,
        targetName: timelineActorsById.get(String(hit.targetId)) || hit.targetId,
        rawDamage: Number(hit.amount || 0),
        effectiveDamage: Number(hit.hpDamage || 0) + Number(hit.shieldAbsorbed || 0),
        hpDamage: Number(hit.hpDamage || 0),
        shieldAbsorbed: Number(hit.shieldAbsorbed || 0),
        overkill: Number(hit.overkill || 0)
      }));
    })
    : (rotationSim?.steps || [])
      .filter((step) => step.isDamageAction && Number.isFinite(Number(step.damage)))
      .map((step, index) => ({
        key: `${step.stepNumber || index}:${step.actionNameRu || step.actionNameEn || "hit"}`,
        phase: step.phase || "",
        actionName: isRu ? step.actionNameRu || step.actionNameEn : step.actionNameEn || step.actionNameRu,
        targetName: null,
        rawDamage: Number(step.damage),
        effectiveDamage: Number(step.damage),
        hpDamage: null,
        shieldAbsorbed: null,
        overkill: null
      }));
  const selectedEnemySummary = displayEnemyInfo || isTimelineCalculation
    ? displayEnemyTargets.map((target) => {
      const derived = target.derivedStats || {};
      const locale = isRu ? "ru-RU" : "en-US";
      const derivedSummary = target.derivedStatsStatus === "calculated-from-pinned-game-config"
        ? `; ${isRu ? "HP" : "HP"} ${Number(derived.hp || 0).toLocaleString(locale)}, ${isRu ? "СКОР" : "SPD"} ${Number(derived.speed || 0).toLocaleString(locale)}, ${isRu ? "стойкость" : "Toughness"} ${Number(derived.toughness || 0).toLocaleString(locale)}`
        : "";
      const hasResistance = target.resistancePercent !== null
        && target.resistancePercent !== undefined
        && target.resistancePercent !== ""
        && Number.isFinite(Number(target.resistancePercent));
      const resistance = hasResistance
        ? `${Number(target.resistancePercent).toFixed(0)}% RES`
        : (isRu ? "RES не задано" : "RES missing");
      return `${target.name || target.id} (Lv. ${target.level ?? "—"}, ${resistance}${derivedSummary})`;
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
          <button
            type="button"
            className={`sim-buff-toggle-btn ${includeTeamBuffs ? "active" : ""}`}
            onClick={() => setIncludeTeamBuffs((prev) => !prev)}
            title={
              isRu
                ? (includeTeamBuffs ? "Расчёт включает синергию и баффы отряда. Нажмите для переключения на соло-урон." : "Расчёт только для основного персонажа. Нажмите для включения баффов отряда.")
                : (includeTeamBuffs ? "Calculation includes team synergy and buffs. Click for solo output." : "Calculation excludes team buffs. Click to include squad synergy.")
            }
          >
            {includeTeamBuffs
              ? (isRu ? "★ РОТАЦИЯ ОТРЯДА" : "★ SQUAD ROTATION")
              : (isRu ? "СОЛО-УРОН" : "SOLO DAMAGE")}
          </button>
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
          {!isTimelineCalculation && (
            <label className="sim-break-procs" title={isRu ? "Явное число срабатываний слабостного пробития в сценарии; урон по официальной формуле пробития, без крита" : "Explicit number of Weakness Break procs in the scenario; damage uses the official break formula, no crit"}>
              <span>{isRu ? "Пробития" : "Breaks"}</span>
              <input
                className="sim-break-procs-input"
                type="number"
                min={0}
                max={20}
                step={1}
                placeholder="0"
                value={breakProcsInput}
                onChange={(e) => setBreakProcsInput(e.target.value)}
              />
            </label>
          )}
          {!isTimelineCalculation && usesHealingTallyInput && (
            <label className="sim-break-procs" title={isRu ? "Сумма накопленного лечения Гиацины и Little Ica в текущем бою; мемо-навык Ica наносит 20% от неё и снимает 50%" : "Accumulated healing tally of Hyacine and Little Ica in this battle; Ica's memosprite skill deals 20% of it and clears 50%"}>
              <span>{isRu ? "Сумма лечения" : "Heal tally"}</span>
              <input
                className="sim-break-procs-input"
                type="number"
                min={0}
                step={100}
                placeholder="0"
                value={healingTallyInput}
                onChange={(e) => setHealingTallyInput(e.target.value)}
              />
            </label>
          )}
          {!isTimelineCalculation && usesSuperBreakInput && (
            <label className="sim-break-procs" title={isRu ? "Число срабатываний Суперпробития (след A4): при ЭП ≥150%/300% — 100%/150% урона за срабатывание; требует пробитой цели" : "Number of Super Break procs (A4 trace): 100%/150% damage per proc at BE >=150%/300%; requires a broken target"}>
              <span>{isRu ? "Суперпробития" : "Super Breaks"}</span>
              <input
                className="sim-break-procs-input"
                type="number"
                min={0}
                max={20}
                step={1}
                placeholder="0"
                value={superBreakProcsInput}
                onChange={(e) => setSuperBreakProcsInput(e.target.value)}
              />
            </label>
          )}
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
                    ? `Для ${missingTeammates.length} союзников применены эталонные характеристики E0S1: [${missingTeammates
                      .map((m) => m.nameRu || m.characterName || m.names?.[0])
                      .join(", ")}]. Если добавить их на витрину, расчёт переключится на их точные статы из вашего аккаунта.`
                    : `Baseline E0S1 stats applied for ${missingTeammates.length} allies: [${missingTeammates
                      .map((m) => m.nameEn || m.characterName || m.names?.[0])
                      .join(", ")}]. Add them to your profile showcase to use their exact build stats.`)}
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
                ? "Характеристики всех союзников синхронизированы из витрины вашего аккаунта HSR и динамически усиливают урон ротации."
                : "All teammate stats synchronized directly from your HSR showcase and dynamically empower rotation damage."}
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
                    <span className="teammate-badge status-sim" title={isRu ? "Использованы эталонные характеристики саппорта E0S1" : "Baseline E0S1 support stats applied"}>
                      <SparklesIcon size={11} />
                      <span>{isRu ? "Эталон (E0S1)" : "Baseline (E0S1)"}</span>
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
        </div>
      )}

      {/* Rotation Metrics Grid */}
      {rotationSim && (
        <>
          <div className="combat-sim-metrics-grid rotation-metrics">
            <div className="combat-sim-metric-box highlight-box">
              <span className="sim-metric-label">
                {isTimelineCalculation
                  ? (isRu ? "Урон по врагам (HP + щит)" : "Enemy Damage (HP + Shield)")
                  : includeTeamBuffs
                  ? (isRu ? "Боевой урон ротации (Отряд)" : "Rotation Cycle Damage (Squad)")
                  : (isRu ? "Чистый соло-урон" : "Solo Lead Damage")}
              </span>
              <span className="sim-metric-value text-accent big">
                {Number(rotationSim.rotationTotalDamage || 0).toLocaleString(isRu ? "ru-RU" : "en-US")}
              </span>
              <span className="sim-metric-hint">
                {isTimelineCalculation
                  ? (isRu ? "По заданным событиям; HP цели учитывается, если задано" : "From configured events; target HP is applied when provided")
                  : includeTeamBuffs
                  ? (isRu ? "Полный цикл ротации с учётом синергии и эффектов отряда" : "Full rotation cycle with squad synergy and effects applied")
                  : (isRu ? "Урон персонажа в одиночку без баффов союзников" : "Lead character solo output without teammate buffs")}
              </span>
            </div>
            <div className="combat-sim-metric-box">
              <span className="sim-metric-label">
                {isTimelineCalculation
                  ? (isRu ? "Максимум одного попадания" : "Peak Hit Damage")
                  : isRu ? "Максимальный урон действия" : "Peak Ability Damage"}
              </span>
              <span className="sim-metric-value">
                {Number(rotationSim.peakHitDamage || 0).toLocaleString(isRu ? "ru-RU" : "en-US")}
              </span>
              <span className="sim-metric-hint">
                {isTimelineCalculation
                  ? (isRu ? "Фактически снятые HP и щит" : "Effective HP and shield damage")
                  : isRu ? "Может суммировать цели AoE" : "May sum AoE targets"}
              </span>
            </div>
          </div>
          {damageBreakdown.length > 0 && (
            <details className="sim-params-disclosure">
              <summary className="sim-params-summary">
                {isTimelineCalculation
                  ? (isRu ? `Урон и пропущенные действия (${damageBreakdown.length})` : `Damage and skipped actions (${damageBreakdown.length})`)
                  : (isRu ? `Разбивка расчётных попаданий (${damageBreakdown.length})` : `Estimated hit breakdown (${damageBreakdown.length})`)}
              </summary>
              <div className="sim-assumptions-list">
                {damageBreakdown.map((entry) => (
                  <div className="assumption-item" key={entry.key}>
                    <span className="assumption-bullet">•</span>
                    <span>
                      {entry.phase ? `${entry.phase}: ` : ""}
                      {entry.actionName || (isRu ? "Удар" : "Hit")}
                      {entry.status === "blocked"
                        ? ` — ${isRu ? "действие пропущено" : "action skipped"}: ${formatBlockedReason(entry.blockedBy)}`
                        : `${entry.targetName ? ` → ${entry.targetName}` : ""}: ${isTimelineCalculation
                        ? `${isRu ? "расчётный" : "calculated"} ${entry.rawDamage.toLocaleString(isRu ? "ru-RU" : "en-US")}; ${isRu ? "снято" : "applied"} ${entry.effectiveDamage.toLocaleString(isRu ? "ru-RU" : "en-US")} (${isRu ? "HP" : "HP"} ${entry.hpDamage.toLocaleString(isRu ? "ru-RU" : "en-US")} + ${isRu ? "щит" : "shield"} ${entry.shieldAbsorbed.toLocaleString(isRu ? "ru-RU" : "en-US")}${entry.overkill > 0 ? `; ${isRu ? "избыток" : "overkill"} ${entry.overkill.toLocaleString(isRu ? "ru-RU" : "en-US")}` : ""})`
                        : `~${entry.rawDamage.toLocaleString(isRu ? "ru-RU" : "en-US")}`}`}
                    </span>
                  </div>
                ))}
              </div>
            </details>
          )}
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
          {isTimelineCalculation
            ? (isRu
              ? "Урон рассчитан по явно заданным действиям, статам и целям. Применяются только модификаторы с заданными значениями и длительностью; эффекты персонажей не переносятся в сценарий автоматически."
              : "Damage uses the explicitly configured actions, stats, and targets. Only modifiers with explicit values and durations apply; character effects are not inserted automatically.")
            : rotationSim
            ? (isRu
              ? "Суммарный боевой урон полного цикла ротации по матричной модели Nous Matrix. Рассчитан с учётом синергии отряда, множителей способностей, защитных параметров и сопротивления противников 12 этажа."
              : "Total rotation cycle damage modeled by Nous Matrix. Computed with squad synergy, verified ability multipliers, defense scaling, and Floor 12 enemy resistances.")
            : (isRu
              ? "Для персонажа формируется сценарий действий. Расчёт адаптирован под текущие характеристики."
              : "Action scenario is being established for this character. Calculations adapt to current stats.")}
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
                {isTimelineCalculation
                  ? (displayEnemyTargets.length
                    ? (isRu
                      ? `Цели заданы прямо в таймлайне: ${selectedEnemySummary}. Их характеристики берутся из сценария.`
                      : `Targets are defined directly in the timeline: ${selectedEnemySummary}. Their parameters come from the scenario.`)
                    : (isRu ? "В сценарии таймлайна не заданы цели-враги." : "The timeline scenario has no enemy targets."))
                  : displayEnemyInfo
                  ? (isRu
                    ? `Цели выбранной волны: ${selectedEnemySummary}. Данные 4.7.0: этаж ${displayEnemyInfo.floor}, сторона ${displayEnemyInfo.sideNumber}, этап ${displayEnemyInfo.stageId}, волна ${displayEnemyInfo.waveNumber}/${displayEnemyInfo.waveCount}. Бафф испытания ${displayEnemyInfo.challengeBuffId} не включён.`
                    : `Selected wave targets: ${selectedEnemySummary}. 4.7.0 data: floor ${displayEnemyInfo.floor}, side ${displayEnemyInfo.sideNumber}, stage ${displayEnemyInfo.stageId}, wave ${displayEnemyInfo.waveNumber}/${displayEnemyInfo.waveCount}. Challenge buff ${displayEnemyInfo.challengeBuffId} is excluded.`)
                  : (isRu
                    ? "Используются общие параметры режима: уровни, состав волны и сопротивления конкретных врагов не заданы."
                    : "Generic mode assumptions are used; exact enemy levels, lineup, and resistances are unavailable.")}
              </span>
            </div>
            {benchmarkReference && (
              <div className="assumption-item">
                <span className="assumption-bullet">•</span>
                <span>
                  {(isRu
                    ? `Калибровочный ориентир реликвий (Nous Matrix Benchmark, данные ${benchmarkReference.sourceDataVersion || "4.7"}, зафиксировано ${benchmarkReference.capturedOn || "актуально"} для этой сборки: ${benchmarkReference.eidolon || "E0"}, ${benchmarkReference.lightCone || "S1"}): 0% = ${(benchmarkReference.outputs.baseline / 1000).toFixed(0)}K, 100% = ${(benchmarkReference.outputs.benchmark / 1000).toFixed(0)}K, 200% = ${(benchmarkReference.outputs.perfection / 1000).toFixed(0)}K.`
                    : `Relic benchmark reference (Nous Matrix Benchmark, data ${benchmarkReference.sourceDataVersion || "4.7"}, recorded ${benchmarkReference.capturedOn || "current"} for this build: ${benchmarkReference.eidolon || "E0"}, ${benchmarkReference.lightCone || "S1"}): 0% = ${(benchmarkReference.outputs.baseline / 1000).toFixed(0)}K, 100% = ${(benchmarkReference.outputs.benchmark / 1000).toFixed(0)}K, 200% = ${(benchmarkReference.outputs.perfection / 1000).toFixed(0)}K.`)}
                </span>
              </div>
            )}
            {rotationSim && (
              <div className="assumption-item">
                <span className="assumption-bullet">•</span>
                <span>
                  {isTimelineCalculation
                    ? (isRu
                      ? `В явном таймлайне задано врагов: ${rotationSim.targetCount}. Входящие атаки учитываются только если они включены в сценарий.`
                      : `Enemies defined in the explicit timeline: ${rotationSim.targetCount}. Incoming attacks count only when present in the scenario.`)
                    : rotationSim?.enemyScenarioInfo
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
                {isTimelineCalculation
                  ? (isRu
                    ? `Конус и эйдолоны: правила найдены для ${equipmentCoverage.applied.length} условий, но автоматически в сценарий не добавлены; вне модели: ${equipmentCoverage.notModeled.length}.`
                    : `Light Cone and Eidolons: ${equipmentCoverage.applied.length} rules are available but not injected into this scenario; ${equipmentCoverage.notModeled.length} conditions remain outside the model.`)
                  : isRu
                    ? `Конус и эйдолоны: статы профиля учтены; правил E/S применено: ${equipmentCoverage.applied.length}; условий вне этой модели: ${equipmentCoverage.notModeled.length}.`
                    : `Light Cone and Eidolons: profile stats are included; E/S rules applied: ${equipmentCoverage.applied.length}; conditions outside this model: ${equipmentCoverage.notModeled.length}.`}
                </span>
              </div>
            )}
            <div className="assumption-item">
              <span className="assumption-bullet">•</span>
              <span>{isTimelineCalculation
                ? (isRu ? "Показаны события заданного таймлайна; поведение и действия, которых нет в сценарии, не достраиваются автоматически." : "Configured timeline events are shown; behavior and actions absent from the scenario are not inferred.")
                : rotationSim?.kitRotationStatus
                  ? (isRu ? "Фазы взяты из ротации персонажа; повторность задаёт сценарий ротации, а очерёдность ходов и аптайм бафов не моделируются." : "Phases come from the character's rotation script; repeat counts follow the script, while turn order and buff uptime are not simulated.")
                  : (isRu ? "Показаны только вручную заданные попадания; порядок ходов, энергия и число повторных действий не моделируются." : "Only manually configured hits are included; turn order, energy, and repeated action counts are not simulated.")}</span>
            </div>
            <div className="assumption-item">
              <span className="assumption-bullet">•</span>
              <span>
                {rotationSim?.buffTimingStatus === "verified-schedule"
                  ? (isRu ? "Баффы применены по проверенной таблице активности ударов." : "Buffs follow a verified per-hit uptime table.")
                  : rotationSim?.buffTimingStatus === "timeline-scenario"
                    ? (isRu ? "Применяются только заданные в таймлайне модификаторы с точным значением и длительностью; остальные баффы команды не достраиваются." : "Only timeline modifiers with explicit values and durations apply; other team buffs are not inferred.")
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
