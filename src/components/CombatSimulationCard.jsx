import React, { useState, useMemo } from "react";
import { runCombatSimulation } from "../utils/simulation.js";
import { CHARACTER_SQUADS, getGenericSquads, matchSquadWithShowcase } from "../utils/teamSynergy.js";
import { runFullTeamRotationSimulation } from "../utils/rotationSimulation.js";
import { iconUrl, handleImageFallback } from "../utils/audit.js";
import { SwordIcon, ShieldIcon, SparklesIcon, CheckIcon, WarnIcon } from "./Icons.jsx";

export default function CombatSimulationCard({ character, audit, stats, showcase = [], lang = "ru" }) {
  if (!character || !audit) return null;
  const isRu = lang === "ru";
  const archetype = audit.detectedRole?.targetArchetype || "CRIT_DPS";
  const charId = String(character.id || "");

  const squads = useMemo(() => {
    return CHARACTER_SQUADS[charId] || getGenericSquads(character, lang);
  }, [charId, character, lang]);

  const [selectedSquadIdx, setSelectedSquadIdx] = useState(0);
  const currentSquad = squads[selectedSquadIdx] || squads[0];

  const matchedTeammates = useMemo(() => {
    return matchSquadWithShowcase(currentSquad, showcase, lang);
  }, [currentSquad, showcase, lang]);

  const missingTeammates = useMemo(() => {
    return matchedTeammates.filter((tm) => !tm.isEquippedInShowcase);
  }, [matchedTeammates]);

  const rotationSim = useMemo(() => {
    return runFullTeamRotationSimulation(character, stats || {}, currentSquad, matchedTeammates, lang);
  }, [character, stats, currentSquad, matchedTeammates, lang]);

  const sim = runCombatSimulation(character, stats || {}, archetype, lang);
  if (!sim) return null;

  const isDual = Boolean(sim.hasDualOutput);
  const isSupport = sim.type === "SUPPORT" || sim.type === "SUSTAIN" || sim.type === "HYBRID_SUBDPS";

  const roleBadgeLabel = () => {
    if (sim.type === "HYBRID_SUBDPS") return isRu ? "Саб-ДПС и поддержка" : "Hybrid Sub-DPS & Utility";
    if (sim.type === "SUPPORT") return isRu ? "Поддержка отряда (Гармония)" : "Team Harmony Buffer";
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
        <span>{isRu ? "Боевая симуляция и ротация" : "Combat Simulation & Rotation"}</span>
        <span className="sim-boss-badge">{isRu ? "MoC 12 // Босс 90 ур." : "MoC 12 // Lv. 90 Boss"}</span>
      </div>

      <div className="combat-sim-header">
        <div className="combat-sim-title-group">
          <div className="combat-sim-badge-row">
            <span
              className={`combat-sim-badge ${
                sim.type === "HYBRID_SUBDPS" ? "hybrid" : isSupport ? "support" : "dps"
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
          </div>
          <h3 className="combat-sim-heading">
            {isRu ? "Математический расчёт боевой ротации отряда" : "Mathematical Squad Combat Simulation"}
          </h3>
        </div>
        <div className="combat-sim-tier-box">
          <span className="combat-sim-tier-label">{isRu ? "Боевой ранг" : "Combat Tier"}</span>
          <span className="combat-sim-tier-val">{sim.benchmarkTier}</span>
        </div>
      </div>

      {/* Squad selector */}
      <div className="combat-squad-section">
        <div className="combat-squad-nav">
          <div className="squad-tabs-list">
            {squads.map((sq, idx) => (
              <button
                key={sq.id || idx}
                type="button"
                className={`squad-tab-btn ${selectedSquadIdx === idx ? "active" : ""}`}
                onClick={() => setSelectedSquadIdx(idx)}
              >
                <span className="squad-tab-number">{idx + 1}</span>
                <span className="squad-tab-title">{isRu ? sq.nameRu : sq.nameEn}</span>
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
                  ? `${missingTeammates.length} из 3 союзников не выставлены на витрине`
                  : `${missingTeammates.length} of 3 teammates missing from showcase`}
              </span>
              <p className="alert-text">
                {isRu
                  ? `Для расчёта с реальными статами выставьте [${missingTeammates
                      .map((m) => m.nameRu || m.characterName || m.names[0])
                      .join(", ")}] на витрину в игре и нажмите «ОБНОВИТЬ». Сейчас применены эталонные софт-капы.`
                  : `For calculations with exact stats, place [${missingTeammates
                      .map((m) => m.nameEn || m.characterName || m.names[0])
                      .join(", ")}] on your in-game showcase. Standard soft-caps are used currently.`}
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
                {isRu ? "Все союзники синхронизированы с витрины" : "All teammates verified from showcase"}
              </span>
              <p className="alert-text">
                {isRu
                  ? "Урон ротации рассчитан с учётом реальных характеристик снаряжения саппортов."
                  : "Rotation damage is calculated using live equipped teammate gear."}
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
                    <span className="teammate-badge status-on">
                      <CheckIcon size={11} />
                      <span>{isRu ? "На витрине" : "On Showcase"}</span>
                    </span>
                  ) : (
                    <span className="teammate-badge status-off">
                      <WarnIcon size={11} />
                      <span>{isRu ? "Эталонный" : "Preset"}</span>
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
      </div>

      {/* Rotation Metrics Grid */}
      {rotationSim && (
        <div className="combat-sim-metrics-grid rotation-metrics">
          <div className="combat-sim-metric-box highlight-box">
            <span className="sim-metric-label">
              {isRu ? "Суммарный урон ротации" : "Full Rotation Total DMG"}
            </span>
            <span className="sim-metric-value text-accent big">
              {Number(rotationSim.rotationTotalDamage || 0).toLocaleString("ru-RU")}
            </span>
            <span className="sim-metric-hint">
              {isRu ? "За полный цикл 4 союзников" : "Full 4-unit sequence"}
            </span>
          </div>
          <div className="combat-sim-metric-box">
            <span className="sim-metric-label">
              {isRu ? "Пиковый удар под баффами" : "Peak Buffed Burst"}
            </span>
            <span className="sim-metric-value">
              {Number(rotationSim.peakHitDamage || 0).toLocaleString("ru-RU")}
            </span>
            <span className="sim-metric-hint">
              {isRu ? "Главная ульта / взрыв" : "Max single ability impact"}
            </span>
          </div>
          <div className="combat-sim-metric-box">
            <span className="sim-metric-label">
              {isRu ? "DPS за цикл (100 AV)" : "Cycle DPS (100 AV)"}
            </span>
            <span className="sim-metric-value">
              {Number(rotationSim.teamCycleDps || 0).toLocaleString("ru-RU")}
            </span>
            <span className="sim-metric-hint">
              {isRu ? "Скорость закрытия волн MoC" : "Wave clear tempo"}
            </span>
          </div>
        </div>
      )}

      {/* Sub-DPS section */}
      {isDual && (
        <div className="combat-sim-subdps-section">
          <div className="combat-section-header">
            <span className="combat-section-icon">
              <SwordIcon size={13} />
            </span>
            <span className="combat-section-title">
              {isRu ? "Личный боевой вклад (Sub-DPS)" : "Personal Combat Output (Sub-DPS)"}
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
        <p className="sim-summary-text">{isRu ? sim.summaryRu : sim.summaryEn}</p>
        <details className="sim-params-disclosure">
          <summary className="sim-params-summary">
            <span>
              {isRu
                ? "Параметры симуляции (MoC 12 / Босс 90 ур.)"
                : "Simulation Parameters (MoC 12 / Lv.90 Boss)"}
            </span>
          </summary>
          <p className="sim-footnote">
            {isRu
              ? "Условия расчёта: босс 90 уровня (MoC 12 / Апокалипсис), фактор брони 1100, базовая устойчивость 20% RES, окно действия 100 AV (150 AV в цикле 0). Для подтягивания реальных статов саппортов выставьте их на витрину в игре."
              : "Conditions: Lv. 90 Boss (MoC 12 / Apocalyptic Shadow), 1100 DEF factor, 20% Base RES, 100 AV turn window. Place support teammates on your in-game showcase to pipe real equipment stats into calculations."}
          </p>
        </details>
      </div>
    </div>
  );
}
