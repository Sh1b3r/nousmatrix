import React, { useState, useMemo } from "react";
import { runCombatSimulation } from "../utils/simulation.js";
import { CHARACTER_SQUADS, matchSquadWithShowcase, rankSquadsByShowcase } from "../utils/teamSynergy.js";
import { runFullTeamRotationSimulation } from "../utils/rotationSimulation.js";
import { scoreAgainstCombatBenchmark } from "../utils/combatBenchmark.js";
import { iconUrl, handleImageFallback } from "../utils/audit.js";
import { SwordIcon, ShieldIcon, SparklesIcon, CheckIcon, WarnIcon } from "./Icons.jsx";

export default function CombatSimulationCard({ character, audit, stats, showcase = [], lang = "ru" }) {
  if (!character || !audit) return null;
  const isRu = lang === "ru";
  const archetype = audit.detectedRole?.targetArchetype || "CRIT_DPS";
  const charId = String(character.id || "");

  const squads = useMemo(() => {
    const list = CHARACTER_SQUADS[charId] || CHARACTER_SQUADS[String(character?.id || "")];
    if (list && list.length > 0) return rankSquadsByShowcase(list, showcase);
    const name = String(character?.name || "").toLowerCase();
    if (charId === "999" || charId === "1006" || name.includes("волк") || name.includes("silver")) {
      return rankSquadsByShowcase(CHARACTER_SQUADS["1006"] || CHARACTER_SQUADS["999"] || [], showcase);
    }
    return rankSquadsByShowcase(CHARACTER_SQUADS[charId] || [], showcase);
  }, [charId, character, showcase]);

  const [selectedSquadIdx, setSelectedSquadIdx] = useState(0);
  const [enemyMode, setEnemyMode] = useState("moc");
  const currentSquad = squads[selectedSquadIdx] || squads[0] || null;

  const matchedTeammates = useMemo(() => {
    return matchSquadWithShowcase(currentSquad, showcase, lang);
  }, [currentSquad, showcase, lang]);

  const missingTeammates = useMemo(() => {
    return matchedTeammates.filter((tm) => !tm.isEquippedInShowcase);
  }, [matchedTeammates]);

  const rotationSim = useMemo(() => {
    return runFullTeamRotationSimulation(character, stats || {}, currentSquad, matchedTeammates, lang, { enemyMode });
  }, [character, stats, currentSquad, matchedTeammates, lang, enemyMode]);

  const sim = runCombatSimulation(character, stats || {}, archetype, lang);
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
  const isSupport = sim.type === "SUPPORT" || sim.type === "SUSTAIN" || sim.type === "HYBRID_SUBDPS";

  const roleBadgeLabel = () => {
    if (sim.type === "HYBRID_SUBDPS") return isRu ? "Саб-ДПС и поддержка" : "Hybrid Sub-DPS & Utility";
    if (sim.type === "SUPPORT") return isRu ? "Поддержка отряда (Саппорт)" : "Team Support / Buffer";
    if (sim.type === "SUSTAIN") return isRu ? "Выживание и защита (Сустейн)" : "Sustain & Mitigation";
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
        <span>{isRu ? "Боевая симуляция ротации" : "Combat Rotation Simulation"}</span>
        <div className="sim-header-controls">
          <span className="sim-provenance-tag" title={isRu ? "Расчёт использует оружие и характеристики из профиля" : "Calculation uses the profile's light cone and stats"}>
            {isRu ? "ДАННЫЕ ПРОФИЛЯ" : "PROFILE DATA"}
          </span>
          <select
            className="sim-mode-select"
            value={enemyMode}
            onChange={(e) => setEnemyMode(e.target.value)}
            title={isRu ? "Режим концовки: уровень врага и сопротивление" : "Endgame mode: enemy level and resistance"}
          >
            <option value="moc">{isRu ? "MoC • Босс 95 ур." : "MoC • Lv.95 Boss"}</option>
            <option value="pf">{isRu ? "PF • Мобы 88 ур." : "PF • Lv.88 Waves"}</option>
            <option value="as">{isRu ? "AS • Босс 95 ур. (20% баз. RES)" : "AS • Lv.95 Boss (20% base RES)"}</option>
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
            {isRu ? "Симуляция боевой ротации отряда" : "Squad Combat Rotation Simulation"}
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
                title={sq.sourceUrl ? `${sq.sourceVersion || ""} • ${sq.sourceUpdatedAt || ""} • ${sq.sourceUrl}` : ""}
              >
                <span className="squad-tab-number">{idx + 1}</span>
                <span className="squad-tab-title">
                  {isRu ? sq.nameRu : sq.nameEn}
                  {sq.isEstimate && <em className="squad-estimate-tag">{isRu ? ` оценка ${sq.sourceVersion || ""}` : ` est. ${sq.sourceVersion || ""}`}</em>}
                </span>
              </button>
            ))}
          </div>
        </div>
        <p className="combat-squad-desc">{isRu ? currentSquad.descRu : currentSquad.descEn}</p>

        {/* Teammates sync notice */}
        {missingTeammates.length > 0 ? (
          <div className="squad-showcase-alert warning">
            <div className="alert-icon-col">
              <WarnIcon size={16} />
            </div>
            <div className="alert-body-col">
              <span className="alert-title">
                {isRu
                  ? `${missingTeammates.length} из 3 союзников отсутствуют на витрине`
                  : `${missingTeammates.length} of 3 teammates missing from showcase`}
              </span>
              <p className="alert-text">
                {isRu
                  ? `Статы ${missingTeammates.length} союзников неизвестны; используются только явно заданные в карточке отряда баффы. Чтобы загрузить витринные данные, добавьте персонажей в профиль и нажмите «ОБНОВИТЬ»: [${missingTeammates
                    .map((m) => m.nameRu || m.characterName || m.names[0])
                    .join(", ")}]`
                  : `Stats for ${missingTeammates.length} allies are unknown; only buffs explicitly configured in the team record are used. Add them to the profile and refresh to load showcase data: [${missingTeammates
                    .map((m) => m.nameEn || m.characterName || m.names[0])
                    .join(", ")}]`}
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
                  ? "Реальные статы доступны для тех баффов, которые настроены с зависимостью от профиля; длительность эффектов не моделируется."
                  : "Real stats are available for buffs configured to scale from profile data; effect duration is not simulated."}
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
            {isRu
              ? "Для этого персонажа пока нет проверенной команды. Автоматические замены по Пути или общей роли отключены; показанный расчёт не включает баффы союзников."
              : "No validated team is available for this character yet. Path or broad-role substitutions are disabled; the displayed calculation does not include teammate buffs."}
          </p>
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
                {currentSquad
                  ? (isRu ? "Ручная оценка для выбранного состава" : "Manual estimate for selected squad")
                  : (isRu ? "Без баффов союзников" : "No teammate buffs applied")}
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
                {Number(sim.personalDpa).toLocaleString("ru-RU")}
              </span>
            </div>
            <div className="combat-sim-metric-box sub-box">
              <span className="sim-metric-label">{sim.personalDpcLabel}</span>
              <span className="sim-metric-value">
                {Number(sim.personalDpc).toLocaleString("ru-RU")}
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
                ? enemyMode === "pf"
                  ? "Допущения и параметры симуляции (PF / Мобы 88 ур.)"
                  : enemyMode === "as"
                    ? "Допущения и параметры симуляции (AS / Ап-босс 95 ур.)"
                    : "Допущения и параметры симуляции (MoC 12 / Босс 95 ур.)"
                : enemyMode === "pf"
                  ? "Simulation Assumptions & Parameters (PF / Lv.88 Waves)"
                  : enemyMode === "as"
                    ? "Simulation Assumptions & Parameters (AS / Lv.95 Boss)"
                    : "Simulation Assumptions & Parameters (MoC 12 / Lv.95 Boss)"}
            </span>
          </summary>
          <div className="sim-assumptions-list">
            <div className="assumption-item">
              <span className="assumption-bullet">•</span>
              <span>
                {isRu
                  ? enemyMode === "pf"
                    ? "Цель: волны мобов 88 уровня, базовое сопротивление 20%; защита считается по уровням персонажа и врага."
                    : enemyMode === "as"
                    ? "Цель: условный босс 95 уровня, базовое сопротивление 20%; индивидуальные сопротивления и слабости врага не заданы."
                      : "Цель: босс 95 уровня, базовое сопротивление 20%; защита считается по уровням персонажа и врага."
                  : enemyMode === "pf"
                    ? "Target: Lv. 88 waves, 20% base RES; DEF multiplier uses character and enemy levels."
                    : enemyMode === "as"
                    ? "Target: generic Lv. 95 boss, 20% base RES; enemy-specific resistances and weaknesses are not specified."
                      : "Target: Lv. 95 boss, 20% base RES; DEF multiplier uses character and enemy levels."}
              </span>
            </div>
            {rotationSim && (
              <div className="assumption-item">
                <span className="assumption-bullet">•</span>
                <span>
                  {isRu
                    ? `Для суммарного AoE-урона задано целей: ${rotationSim.targetCount} (PF — 5, MoC/AS — 3). Слабость стихии и сопротивления конкретного врага не учитываются. Обычные удары считают активную стойкость (×0,9); суперпробитие — уже сломанную.`
                    : `AoE totals use ${rotationSim.targetCount} targets (PF: 5, MoC/AS: 3). Elemental weakness and enemy-specific resistance are not modeled. Direct hits assume active Toughness (×0.9); Super Break assumes the target is broken.`}
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
