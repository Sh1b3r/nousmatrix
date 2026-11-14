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
    if (CHARACTER_SQUADS[charId] && CHARACTER_SQUADS[charId].length > 0) {
      return CHARACTER_SQUADS[charId];
    }
    const name = String(character?.name || "").toLowerCase();
    if (charId === "999" || charId === "1006" || name.includes("волк") || name.includes("silver")) {
      return CHARACTER_SQUADS["1006"] || CHARACTER_SQUADS["999"] || getGenericSquads(character, lang);
    }
    if (charId === "1513" || name.includes("прибой") || name.includes("waveflair")) {
      return CHARACTER_SQUADS["1513"] || getGenericSquads(character, lang);
    }
    if (charId === "1310" || name.includes("светляч") || name.includes("firefly")) {
      return CHARACTER_SQUADS["1310"] || getGenericSquads(character, lang);
    }
    if (charId === "1308" || name.includes("ахерон") || name.includes("acheron")) {
      return CHARACTER_SQUADS["1308"] || getGenericSquads(character, lang);
    }
    if (charId === "1015" || name.includes("арчер") || name.includes("archer")) {
      return CHARACTER_SQUADS["1015"] || getGenericSquads(character, lang);
    }
    if (charId === "1510" || name.includes("нова") || name.includes("nova")) {
      return CHARACTER_SQUADS["1510"] || getGenericSquads(character, lang);
    }
    return getGenericSquads(character, lang);
  }, [charId, character, lang]);

  const [selectedSquadIdx, setSelectedSquadIdx] = useState(0);
  const [enemyMode, setEnemyMode] = useState("moc");
  const [isNormalized, setIsNormalized] = useState(false);
  const currentSquad = squads[selectedSquadIdx] || squads[0];

  const matchedTeammates = useMemo(() => {
    return matchSquadWithShowcase(currentSquad, showcase, lang);
  }, [currentSquad, showcase, lang]);

  const missingTeammates = useMemo(() => {
    return matchedTeammates.filter((tm) => !tm.isEquippedInShowcase);
  }, [matchedTeammates]);

  const rotationSim = useMemo(() => {
    return runFullTeamRotationSimulation(character, stats || {}, currentSquad, matchedTeammates, lang, { enemyMode, isNormalized });
  }, [character, stats, currentSquad, matchedTeammates, lang, enemyMode, isNormalized]);

  const sim = runCombatSimulation(character, stats || {}, archetype, lang);
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
          <button
            type="button"
            className={`sim-norm-toggle ${isNormalized ? "active" : ""}`}
            onClick={() => setIsNormalized(!isNormalized)}
            title={
              isRu
                ? "Нормализованный бенчмарк (Akasha standard): уравнивает оружие всех игроков к эталону E0S1 для объективной оценки реликвий"
                : "Normalized E0S1 Benchmark (Akasha standard): standardizes weapon power for pure relic evaluation"
            }
          >
            {isRu ? (isNormalized ? "★ ЭТАЛОН E0S1" : "КОНУС ИЗ ПРОФИЛЯ") : (isNormalized ? "★ E0S1 BENCHMARK" : "LIVE CONE")}
          </button>
          <select
            className="sim-mode-select"
            value={enemyMode}
            onChange={(e) => setEnemyMode(e.target.value)}
            title={isRu ? "Режим концовки: уровень врага и сопротивление" : "Endgame mode: enemy level and resistance"}
          >
            <option value="moc">{isRu ? "MoC • Босс 95 ур." : "MoC • Lv.95 Boss"}</option>
            <option value="pf">{isRu ? "PF • Мобы 88 ур." : "PF • Lv.88 Waves"}</option>
            <option value="as">{isRu ? "AS • Ап-босс 95 ур. (40% RES)" : "AS • Lv.95 Boss (40% RES)"}</option>
          </select>
        </div>
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
            <span className="sim-provenance-tag">
              {isRu ? "Расчёт симуляции" : "Model Simulation"}
            </span>
          </div>
          <h3 className="combat-sim-heading">
            {isRu ? "Симуляция боевой ротации отряда" : "Squad Combat Rotation Simulation"}
          </h3>
        </div>
        <div className="combat-sim-tier-box">
          <span className="combat-sim-tier-label">{isRu ? "Ранг эффективности" : "Performance Tier"}</span>
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
                <span className="squad-tab-title">
                  {isRu ? sq.nameRu : sq.nameEn}
                  {sq.isEstimate && <em className="squad-estimate-tag">{isRu ? " оценка 4.7" : " est. 4.7"}</em>}
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
                  ? `Для них используются эталонные допущения (базовые софт-капы следов). Чтобы подтянуть реальные характеристики снаряжения [${missingTeammates
                      .map((m) => m.nameRu || m.characterName || m.names[0])
                      .join(", ")}], выставьте их на витрину в игре и нажмите «ОБНОВИТЬ».`
                  : `Default baseline assumptions are used for missing allies. Place [${missingTeammates
                      .map((m) => m.nameEn || m.characterName || m.names[0])
                      .join(", ")}] on showcase for live gear calculation.`}
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
                {isRu ? "Все союзники синхронизированы с витрины HSR" : "All teammates verified from HSR showcase"}
              </span>
              <p className="alert-text">
                {isRu
                  ? "Урон ротации рассчитан с учётом реальных параметров снаряжения саппортов."
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
                    <span className="teammate-badge status-on" title={isRu ? "Характеристики получены из профиля HSR" : "Stats synced from HSR"}>
                      <CheckIcon size={11} />
                      <span>{isRu ? "На витрине (HSR)" : "On Showcase (HSR)"}</span>
                    </span>
                  ) : (
                    <span className="teammate-badge status-off" title={isRu ? "Союзника нет на витрине, применены стандартные допущения" : "Teammate missing, baseline defaults used"}>
                      <WarnIcon size={11} />
                      <span>{isRu ? "Эталон (допущение)" : "Baseline default"}</span>
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
        <>
          <div className="combat-sim-metrics-grid rotation-metrics">
            <div className="combat-sim-metric-box highlight-box">
              <span className="sim-metric-label">
                {isRu ? "Суммарный урон ротации" : "Full Rotation Total DMG"}
              </span>
              <span className="sim-metric-value text-accent big">
                {Number(rotationSim.rotationTotalDamage || 0).toLocaleString("ru-RU")}
              </span>
              <span className="sim-metric-hint">
                {isRu ? "Расчёт за полный цикл 4 союзников" : "Calculated 4-unit sequence"}
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
                {isRu ? "Главная сверхспособность / удар" : "Max single ability impact"}
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
          {rotationSim.loopFactor > 1 && (
            <div className="sim-loop-factor-notice">
              <span className="sim-loop-notice-icon">ℹ</span>
              <span className="sim-loop-notice-text">
                {isRu
                  ? `Энергетическая петля: в расчёт заложен множитель повторения ультимейта ×${rotationSim.loopFactor.toFixed(2)} за цикл (на основе СКОР и ВЭ). Это теоретическая модель темпа ротации, а не гарантированный боевой скрипт.`
                  : `Energy loop: rotation DMG factors in an ultimate recast multiplier of x${rotationSim.loopFactor.toFixed(2)} per cycle (based on SPD & ERR). This is a theoretical model assumption, not guaranteed gameplay.`}
              </span>
            </div>
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
                    ? "Цель симуляции: волны мобов 88 уровня (Чистый Вымысел), защитный фактор 1100, базовая устойчивость 20% RES."
                    : enemyMode === "as"
                    ? "Цель симуляции: ап-босс 95 уровня (Апокалипсис Постоянства), защитный фактор 1100, устойчивость 40% RES."
                    : "Цель симуляции: босс 95 уровня (Зал Забвения 12), защитный фактор 1100, базовая устойчивость 20% RES."
                  : enemyMode === "pf"
                  ? "Target: Lv. 88 mob waves (Pure Fiction), 1100 DEF factor, 20% Base RES."
                  : enemyMode === "as"
                  ? "Target: Lv. 95 Apocalyptic Shadow boss, 1100 DEF factor, 40% RES."
                  : "Target: Lv. 95 Boss (MoC 12), 1100 DEF factor, 20% Base RES."}
              </span>
            </div>
            <div className="assumption-item">
              <span className="assumption-bullet">•</span>
              <span>{isRu ? "Окно действия: 100 AV (150 AV в цикле 0)." : "Action window: 100 AV (150 AV in Cycle 0)."}</span>
            </div>
            {isNormalized && (
              <div className="assumption-item">
                <span className="assumption-bullet">•</span>
                <span className="text-accent">
                  {isRu
                    ? "Нормализация E0S1 активна: расчёт урона проведён на стандартизированном сигнатурном конусе S1 (Akasha Leaderboard standard). Оценивается чистая сила фарма реликвий независимо от наложений оружия."
                    : "E0S1 Normalization active: damage computed on standardized S1 signature weapon (Akasha Leaderboard standard). Evaluates pure relic farm quality."}
                </span>
              </div>
            )}
            {rotationSim?.loopFactor > 1 && (
              <div className="assumption-item">
                <span className="assumption-bullet">•</span>
                <span>
                  {isRu
                    ? `Энергетическая петля ×${rotationSim.loopFactor.toFixed(2)}: ультимейт успевает перезарядиться несколько раз за цикл (СКОР × ВЭ). Это допущение модели, а не точный расчёт игры.`
                    : `Energy loop x${rotationSim.loopFactor.toFixed(2)}: the ultimate recasts several times per cycle (SPD x ERR). This is a model assumption, not an exact game sim.`}
                </span>
              </div>
            )}
            <div className="assumption-item">
              <span className="assumption-bullet">•</span>
              <span>
                {isRu
                  ? missingTeammates.length > 0
                    ? `Союзники: для ${missingTeammates.length} союзников не с витрины применены стандартные эталонные уровни следов и баффов.`
                    : "Союзники: все 3 союзника найдены на витрине — расчёт использует реальные статы их реликвий."
                  : missingTeammates.length > 0
                  ? `Teammates: ${missingTeammates.length} missing allies use standard soft-cap trace assumptions.`
                  : "Teammates: all 3 allies found on showcase, using live relic stats."}
              </span>
            </div>
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
