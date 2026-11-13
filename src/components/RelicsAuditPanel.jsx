import React from "react";
import { CheckIcon, WarnIcon, SparklesIcon } from "./Icons.jsx";

export function RelicsAuditPanel({
  audit,
  t,
  lang = "ru",
  layoutMode = "grouped"
}) {
  if (!audit) return null;
  const isRu = (lang || (t?.lvl === "Ур." ? "ru" : "en")) === "ru";
  const cavern = audit.cavern;
  const planar = audit.planar;

  const cavernUseful = Number(cavern?.usefulRolls || 0);
  const cavernTotal = Number(cavern?.rollsTotal || 0);
  const planarUseful = Number(planar?.usefulRolls || 0);
  const planarTotal = Number(planar?.rollsTotal || 0);
  const totalUseful = cavernUseful + planarUseful;
  const totalRolls = cavernTotal + planarTotal;

  const cavernEff = Number(cavern?.efficiency || 0);
  const planarEff = Number(planar?.efficiency || 0);
  const combinedEfficiency = totalRolls > 0
    ? Math.round((cavernEff * cavernTotal + planarEff * planarTotal) / totalRolls)
    : (cavernEff || planarEff || 0);

  // Критмасса высчитывается и показывается ТОЛЬКО тем, кому она нужна (ДД)
  const needsCrit = Boolean(
    audit.needsCrit ?? (
      audit.archetype === "CRIT_DPS" ||
      audit.archetype === "HP_CRIT_DPS" ||
      audit.archetype === "MORTENAX_HYBRID"
    )
  );

  const cavernCvNum = needsCrit && cavern?.cv ? parseFloat(cavern.cv) : 0;
  const planarCvNum = needsCrit && planar?.cv ? parseFloat(planar.cv) : 0;
  const totalCvNum = cavernCvNum + planarCvNum;
  const totalCv = totalCvNum > 0 ? totalCvNum.toFixed(1) : null;

  const isAllComplete = Boolean(cavern?.isComplete && planar?.isComplete);
  const isAnyComplete = Boolean(cavern?.isComplete || planar?.isComplete);

  return (
    <div className="relics-audit-panel">
      <div className="panel-title relics-audit-title">
        <div className="relics-title-group">
          <span className="relics-audit-dot"></span>
          <span>{isRu ? "ПОДСЧЁТ РЕЛИКВИЙ И ПЛАНАРОК" : "RELICS & PLANARS AUDIT"}</span>
        </div>
        <span className="relics-audit-badge">{isRu ? "АУДИТ РОЛЛОВ СЕТОВ" : "SET ROLL QUALITY"}</span>
      </div>

      <div className="relics-audit-grid">
        {layoutMode === "unified" ? (
          /* ЕДИНЫЙ СЛИТНЫЙ БЛОК (СЛИПАЕТСЯ ПРИ ВЫБОРЕ «ВСЕ СЛОТЫ») */
          <div className="relic-audit-block unified-block">
            <div className="relic-audit-head">
              <span className="relic-audit-tag">
                {isRu ? "ВСЕ РЕЛИКВИИ И ПЛАНАРКИ (6 СЛОТОВ)" : "ALL RELICS & PLANARS (6 SLOTS)"}
              </span>
              <span className={`relic-set-status-pill ${isAllComplete ? "active" : isAnyComplete ? "partial" : "broken"}`}>
                {isAllComplete
                  ? (isRu ? "КОМПЛЕКТЫ АКТИВНЫ (6/6)" : "SETS ACTIVE (6/6)")
                  : isAnyComplete
                  ? (isRu ? "ЧАСТИЧНО АКТИВНЫ" : "PARTIALLY ACTIVE")
                  : (isRu ? "РАЗОРВАННЫЕ СЕТЫ" : "BROKEN SETS")}
              </span>
            </div>

            <div className="planar-audit-box">
              <div className="planar-audit-name">
                <span className="set-name-text">
                  {[cavern?.label, planar?.setName ? `2/2 ${planar.setName}` : ""].filter(Boolean).join(" • ") || (isRu ? "Комплекты экипированы" : "Equipped sets")}
                </span>
                <span className="planar-rolls-badge">
                  {totalUseful}/{totalRolls} {isRu ? "полезных роллов" : "useful rolls"}
                </span>
              </div>

              <div className="metric-row" style={{ marginTop: "10px" }}>
                <div className="metric-label-line">
                  <span>{isRu ? "Качество роллов всех слотов (6 реликвий)" : "All Relics Roll Quality (6 Relics)"}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--accent)" }}>
                    {combinedEfficiency}%
                  </span>
                </div>
                <div className="metric-bar-bg">
                  <div
                    className="metric-bar-fill accent"
                    style={{ width: `${combinedEfficiency}%` }}
                  />
                </div>
              </div>

              {needsCrit && totalCv && (
                <div className="metric-row">
                  <div className="metric-label-line">
                    <span>{isRu ? "Общая крит. масса реликвий (Total CV)" : "Total Relics Crit Value (Total CV)"}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--text-primary)" }}>
                      {totalCv}
                    </span>
                  </div>
                </div>
              )}

              {(cavern?.condition || planar?.condition) && (
                <div className="unified-conditions-wrap" style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
                  {cavern?.condition && (
                    <div className="planar-condition-line">
                      <span className="condition-bullet">⚡</span>
                      <span>{cavern.condition}</span>
                    </div>
                  )}
                  {planar?.condition && (
                    <div className="planar-condition-line">
                      <span className="condition-bullet">🔮</span>
                      <span>{planar.condition}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* РАЗДЕЛЬНЫЕ БЛОКИ (ПО СЕКЦИЯМ - КАК НА СКРИНЕ 2) */
          <>
            {cavern && cavern.label ? (
              <div className="relic-audit-block cavern-block">
                <div className="relic-audit-head">
                  <span className="relic-audit-tag">{isRu ? "ПЕЩЕРНЫЕ РЕЛИКВИИ (4 СЛОТА)" : "CAVERN RELICS (4 SLOTS)"}</span>
                  <span className={`relic-set-status-pill ${cavern.isComplete ? "active" : "broken"}`}>
                    {cavern.isComplete
                      ? (isRu ? "КОМПЛЕКТ АКТИВЕН" : "SET ACTIVE 4/4")
                      : (isRu ? "КОМБИНАЦИЯ / РАЗОРВАН" : "BROKEN SET")}
                  </span>
                </div>
                <div className="planar-audit-box">
                  <div className="planar-audit-name">
                    <span className="set-name-text">{cavern.label}</span>
                    <span className="planar-rolls-badge">
                      {cavern.usefulRolls}/{cavern.rollsTotal} {isRu ? "полезных роллов" : "useful rolls"}
                    </span>
                  </div>
                  <div className="metric-row" style={{ marginTop: "10px" }}>
                    <div className="metric-label-line">
                      <span>{isRu ? "Качество роллов пещерных сетов (Голова + Руки + Тело + Сапоги)" : "Cavern Relics Roll Quality"}</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--accent)" }}>
                        {cavern.efficiency}%
                      </span>
                    </div>
                    <div className="metric-bar-bg">
                      <div className="metric-bar-fill accent" style={{ width: `${cavern.efficiency}%` }} />
                    </div>
                  </div>
                  {needsCrit && cavern.cv && parseFloat(cavern.cv) > 0 && (
                    <div className="metric-row">
                      <div className="metric-label-line">
                        <span>{isRu ? "Крит. масса пещерных сетов (Cavern CV)" : "Cavern Crit Value (Cavern CV)"}</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--text-primary)" }}>
                          {cavern.cv}
                        </span>
                      </div>
                    </div>
                  )}
                  {cavern.condition && (
                    <div className="planar-condition-line">
                      <span className="condition-bullet">⚡</span>
                      <span>{cavern.condition}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="relic-audit-empty">
                <span>{isRu ? "Пещерные реликвии не экипированы" : "No cavern relics equipped"}</span>
              </div>
            )}

            {planar && planar.setName ? (
              <div className="relic-audit-block planar-block">
                <div className="relic-audit-head">
                  <span className="relic-audit-tag">{isRu ? "ПЛАНАРНЫЕ УКРАШЕНИЯ (2 СЛОТА)" : "PLANAR ORNAMENTS (2 SLOTS)"}</span>
                  <span className={`relic-set-status-pill ${planar.isComplete ? "active" : "broken"}`}>
                    {planar.isComplete
                      ? (isRu ? "2/2 СЕТ АКТИВЕН" : "2/2 SET ACTIVE")
                      : (isRu ? "РАЗОРВАННЫЙ СЕТ" : "BROKEN SET")}
                  </span>
                </div>
                <div className="planar-audit-box">
                  <div className="planar-audit-name">
                    <span className="set-name-text">{planar.setName}</span>
                    <span className="planar-rolls-badge">
                      {planar.usefulRolls}/{planar.rollsTotal} {isRu ? "полезных роллов" : "useful rolls"}
                    </span>
                  </div>
                  <div className="metric-row" style={{ marginTop: "10px" }}>
                    <div className="metric-label-line">
                      <span>{isRu ? "Качество роллов планарок (Сфера + Вервь)" : "Planar Roll Quality"}</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--accent)" }}>
                        {planar.efficiency}%
                      </span>
                    </div>
                    <div className="metric-bar-bg">
                      <div className="metric-bar-fill accent" style={{ width: `${planar.efficiency}%` }} />
                    </div>
                  </div>
                  {needsCrit && planar.cv && parseFloat(planar.cv) > 0 && (
                    <div className="metric-row">
                      <div className="metric-label-line">
                        <span>{isRu ? "Крит. масса планарок (Planar CV)" : "Planar Crit Value (Planar CV)"}</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--text-primary)" }}>
                          {planar.cv}
                        </span>
                      </div>
                    </div>
                  )}
                  {planar.condition && (
                    <div className="planar-condition-line">
                      <span className="condition-bullet">🔮</span>
                      <span>{planar.condition}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="relic-audit-empty">
                <span>{isRu ? "Планарные украшения ожидают синхронизации в игре" : "Planar ornaments awaiting sync"}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default RelicsAuditPanel;
