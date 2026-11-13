import React from "react";
import { RoleSvgIcon, WarnIcon, CheckIcon, SparklesIcon } from "./Icons.jsx";

function formatActionsCount(n, isRu) {
  if (!isRu) return `${n} ${n === 1 ? "recommendation" : "recommendations"}`;
  const rem10 = n % 10;
  const rem100 = n % 100;
  if (rem10 === 1 && rem100 !== 11) return `${n} рекомендация`;
  if (rem10 >= 2 && rem10 <= 4 && (rem100 < 10 || rem100 >= 20)) return `${n} рекомендации`;
  return `${n} рекомендаций`;
}

export default function OverallScorePanel({ audit, t, lang = "ru" }) {
  if (!audit) return null;
  const isRu = (lang || (t?.lvl === "Ур." ? "ru" : "en")) === "ru";
  const cvBarWidth = Math.min(100, Math.max(10, (parseFloat(audit.cv) / 320) * 100));
  const isSpdOk = parseFloat(audit.spd) >= 134;

  const getGradeTier = (score) => {
    const s = Number(score) || 0;
    if (s >= 92) return { grade: "SSS", labelRu: "Эталон билда", labelEn: "Prime Benchmark", color: "#FF4D4D" };
    if (s >= 85) return { grade: "SS", labelRu: "Превосходный", labelEn: "Excellent", color: "#00E5FF" };
    if (s >= 75) return { grade: "S", labelRu: "Отличный", labelEn: "Great", color: "#00FF88" };
    if (s >= 65) return { grade: "A", labelRu: "Хороший", labelEn: "Solid Build", color: "#FFB74D" };
    if (s >= 50) return { grade: "B", labelRu: "Требует доработки", labelEn: "Work In Progress", color: "#FFA726" };
    return { grade: "C", labelRu: "Базовый", labelEn: "Entry Level", color: "#EF5350" };
  };

  const gradeInfo = getGradeTier(audit.score);

  return (
    <div className="overall-score-panel">
      <div className="panel-title overall-panel-title">
        <div className="overall-title-group">
          <span className="overall-status-dot" />
          <span className="overall-heading-text">
            {isRu ? "Индекс боевой готовности билда" : "Combat Readiness Index"}
          </span>
        </div>
        <span className="overall-matrix-badge">{t.matrix100 || "Matrix 100"}</span>
      </div>

      <div className="score-hero-container">
        <div className="score-hero-left">
          <div className="score-number-wrap">
            <span className="score-number-main">{audit.score}</span>
            <span className="score-number-denom">/100</span>
          </div>
          <span className="score-grade-pill" style={{ color: gradeInfo.color, borderColor: gradeInfo.color }}>
            GRADE {gradeInfo.grade} • {isRu ? gradeInfo.labelRu : gradeInfo.labelEn}
          </span>
        </div>
        <div className="score-hero-right">
          <div className="score-tier-badge">
            <span className="tier-prefix">GLOBAL RANK</span>
            <span className="tier-percent">TOP {audit.topPercent}%</span>
          </div>
          <div
            className="score-verified-stamp"
            title={
              isRu
                ? "Данные получены напрямую из открытого профиля в игре через Hoyoverse API"
                : "Live profile data pulled from official Hoyoverse game servers"
            }
          >
            <CheckIcon size={12} />
            <span>{isRu ? "Синхронизировано из HSR" : "Synchronized with HSR"}</span>
          </div>
        </div>
      </div>

      {audit.detectedRole && (
        <div className={`role-badge-card role-${(audit.detectedRole.role || "dps").toLowerCase()}`}>
          <div className="role-badge-head">
            <span className="role-badge-pill">
              <span className="role-badge-icon">
                <RoleSvgIcon role={audit.detectedRole.role} iconType={audit.detectedRole.icon} size={15} />
              </span>
              <span className="role-badge-name">
                {isRu ? audit.detectedRole.labelRu : audit.detectedRole.labelEn}
              </span>
            </span>
            {audit.detectedRole.confidence && (
              <span
                className="role-confidence-tag"
                title={
                  isRu
                    ? "Степень соответствия текущего набора артефактов и характеристик данному архетипу"
                    : "Percentage alignment between equipped gear and this archetype"
                }
              >
                {isRu
                  ? `Соответствие архетипу: ${audit.detectedRole.confidence}%`
                  : `Archetype match: ${audit.detectedRole.confidence}%`}
              </span>
            )}
          </div>
          <div className="role-badge-desc">
            {isRu ? audit.detectedRole.descRu : audit.detectedRole.descEn}
          </div>
        </div>
      )}

      <div className="overall-metrics-list">
        {/* Metric 1: Roll Efficiency */}
        <div className="metric-row">
          <div className="metric-label-line">
            <span className="metric-name">
              {t.rollEfficiency || (isRu ? "Качество роллов (Roll Efficiency)" : "Roll Efficiency")}
            </span>
            <span className="metric-val">{audit.rollEfficiency}%</span>
          </div>
          <div className="metric-bar-bg">
            <div
              className={`metric-bar-fill ${Number(audit.rollEfficiency) >= 80 ? "success" : "cyan"}`}
              style={{ width: `${audit.rollEfficiency}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Primary Archetype Metric */}
        <div className="metric-row">
          <div className="metric-label-line">
            <span className="metric-name">
              {isRu
                ? audit.primaryMetric?.labelRu || t.critValue || "Крит. масса"
                : audit.primaryMetric?.labelEn || t.critValue || "Crit Value"}
            </span>
            <span className="metric-val">
              {audit.primaryMetric
                ? `${audit.primaryMetric.display} ${audit.primaryMetric.status || ""}`.trim()
                : audit.cv}
            </span>
          </div>
          <div className="metric-bar-bg">
            <div
              className="metric-bar-fill primary"
              style={{
                width: `${audit.primaryMetric ? audit.primaryMetric.percent : cvBarWidth}%`
              }}
            />
          </div>
        </div>

        {/* Metric 3: Speed Breakpoint */}
        <div className="metric-row">
          <div className="metric-label-line">
            <span className="metric-name">
              {isRu
                ? audit.secondaryMetric?.labelRu || t.speedThreshold || "Порог скорости"
                : audit.secondaryMetric?.labelEn || t.speedThreshold || "Speed Threshold"}
            </span>
            <span className="metric-val">
              {audit.secondaryMetric
                ? `${audit.secondaryMetric.display} ${audit.secondaryMetric.status || ""}`.trim()
                : `${audit.spd} SPD ${isSpdOk ? "[OK]" : "[SLOW]"}`}
            </span>
          </div>
          <div className="metric-bar-bg">
            <div
              className={`metric-bar-fill ${isSpdOk ? "success" : "warning"}`}
              style={{
                width: `${
                  audit.secondaryMetric
                    ? audit.secondaryMetric.percent
                    : Math.min(100, (parseFloat(audit.spd) / 160) * 100)
                }%`
              }}
            />
          </div>
        </div>
      </div>

      {audit.bottleneck && (
        <div className="bottleneck-panel-box">
          <div className="bottleneck-head">
            <span className="bottleneck-warn-icon">
              <WarnIcon size={13} />
            </span>
            <span className="bottleneck-title-text">
              {t.bottleneck || (isRu ? "Анализ узких мест" : "Bottleneck Analysis")}
            </span>
          </div>
          <p className="bottleneck-desc-text">{audit.bottleneck}</p>
        </div>
      )}

      {audit.actions && audit.actions.length > 0 && (
        <div className="audit-actions-section">
          <div className="panel-title sub-title">
            <span>{t.improvementPlan || (isRu ? "План улучшений" : "Action Plan")}</span>
            <span className="actions-count-pill">{formatActionsCount(audit.actions.length, isRu)}</span>
          </div>
          <div className="audit-actions-list">
            {audit.actions.map((act, i) => (
              <div key={i} className="audit-action-box">
                <div className="action-box-title">
                  <span className="action-bullet">#{i + 1}</span>
                  <span className="action-title-text">{act.title}</span>
                </div>
                <div className="action-box-desc">{act.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
