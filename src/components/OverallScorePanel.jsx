import React from 'react';
import { RoleSvgIcon, WarnIcon, CheckIcon, SparklesIcon } from './Icons.jsx';

export default function OverallScorePanel({ audit, t, lang = 'ru' }) {
  if (!audit) return null;

  const isRu = (lang || (t?.lvl === 'Ур.' ? 'ru' : 'en')) === 'ru';
  const cvBarWidth = Math.min(100, Math.max(10, (parseFloat(audit.cv) / 320) * 100));
  const isSpdOk = parseFloat(audit.spd) >= 134;

  const getGradeTier = (score) => {
    const s = Number(score) || 0;
    if (s >= 92) return { grade: 'SSS', labelRu: 'ЭТАЛОН БИЛДА', labelEn: 'PRIME BENCHMARK', color: 'var(--accent)' };
    if (s >= 85) return { grade: 'SS', labelRu: 'ПРЕВОСХОДНЫЙ', labelEn: 'EXCELLENT', color: '#00E5FF' };
    if (s >= 75) return { grade: 'S', labelRu: 'ОТЛИЧНЫЙ', labelEn: 'GREAT', color: '#00FF88' };
    if (s >= 65) return { grade: 'A', labelRu: 'ХОРОШИЙ', labelEn: 'SOLID BUILD', color: '#FFB74D' };
    if (s >= 50) return { grade: 'B', labelRu: 'ТРЕБУЕТ ДОРАБОТКИ', labelEn: 'WORK IN PROGRESS', color: '#FFA726' };
    return { grade: 'C', labelRu: 'НАЧАЛЬНЫЙ', labelEn: 'ENTRY LEVEL', color: '#EF5350' };
  };

  const gradeInfo = getGradeTier(audit.score);

  return (
    <div className="overall-score-panel">
      {/* 1. Header with Title & Verification tag */}
      <div className="panel-title overall-panel-title">
        <div className="overall-title-group">
          <span className="overall-status-dot" />
          <span className="overall-heading-text">
            {isRu ? 'ИНДЕКС ДЕЕСПОСОБНОСТИ БИЛДА' : 'COMBAT READINESS INDEX'}
          </span>
        </div>
        <span className="overall-matrix-badge">
          {t.matrix100 || 'MATRIX 100'}
        </span>
      </div>

      {/* 2. Stylized Score Hero Box */}
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
          <div className="score-verified-stamp">
            <CheckIcon size={12} />
            <span>{isRu ? 'ВАЛИДИРОВАНО NOUSMATRIX' : 'NOUSMATRIX VALIDATED'}</span>
          </div>
        </div>
      </div>

      {/* 3. Active Role Classification Badge */}
      {audit.detectedRole && (
        <div className={`role-badge-card role-${(audit.detectedRole.role || 'dps').toLowerCase()}`}>
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
              <span className="role-confidence-tag">
                {isRu ? `Совпадение: ${audit.detectedRole.confidence}%` : `Match: ${audit.detectedRole.confidence}%`}
              </span>
            )}
          </div>
          <div className="role-badge-desc">
            {isRu ? audit.detectedRole.descRu : audit.detectedRole.descEn}
          </div>
        </div>
      )}

      {/* 4. Core Benchmark Metric Progress Bars */}
      <div className="overall-metrics-list">
        {/* Metric 1: Roll Efficiency */}
        <div className="metric-row">
          <div className="metric-label-line">
            <span className="metric-name">
              {t.rollEfficiency || (isRu ? 'Качество роллов (Roll Efficiency)' : 'Roll Efficiency')}
            </span>
            <span className="metric-val">{audit.rollEfficiency}%</span>
          </div>
          <div className="metric-bar-bg">
            <div className="metric-bar-fill accent" style={{ width: `${audit.rollEfficiency}%` }} />
          </div>
        </div>

        {/* Metric 2: Primary Key Stat */}
        <div className="metric-row">
          <div className="metric-label-line">
            <span className="metric-name">
              {isRu ? (audit.primaryMetric?.labelRu || t.critValue || 'Крит. масса') : (audit.primaryMetric?.labelEn || t.critValue || 'Crit Value')}
            </span>
            <span className="metric-val">
              {audit.primaryMetric ? `${audit.primaryMetric.display} ${audit.primaryMetric.status || ''}`.trim() : audit.cv}
            </span>
          </div>
          <div className="metric-bar-bg">
            <div
              className="metric-bar-fill accent"
              style={{ width: `${audit.primaryMetric ? audit.primaryMetric.percent : cvBarWidth}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Secondary Benchmark Stat (SPD Breakpoint) */}
        <div className="metric-row">
          <div className="metric-label-line">
            <span className="metric-name">
              {isRu ? (audit.secondaryMetric?.labelRu || t.speedThreshold || 'Порог скорости') : (audit.secondaryMetric?.labelEn || t.speedThreshold || 'Speed Threshold')}
            </span>
            <span className="metric-val">
              {audit.secondaryMetric ? `${audit.secondaryMetric.display} ${audit.secondaryMetric.status || ''}`.trim() : `${audit.spd} SPD ${isSpdOk ? '[OK]' : '[SLOW]'}`}
            </span>
          </div>
          <div className="metric-bar-bg">
            <div
              className="metric-bar-fill accent"
              style={{ width: `${audit.secondaryMetric ? audit.secondaryMetric.percent : Math.min(100, (parseFloat(audit.spd) / 160) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 5. Bottleneck Analysis Box */}
      {audit.bottleneck && (
        <div className="bottleneck-panel-box">
          <div className="bottleneck-head">
            <span className="bottleneck-warn-icon">
              <WarnIcon size={13} />
            </span>
            <span className="bottleneck-title-text">
              {t.bottleneck || (isRu ? 'АНАЛИЗ УЗКИХ МЕСТ' : 'BOTTLENECK ANALYSIS')}
            </span>
          </div>
          <p className="bottleneck-desc-text">
            {audit.bottleneck}
          </p>
        </div>
      )}

      {/* 6. Actionable Improvement Plan */}
      {audit.actions && audit.actions.length > 0 && (
        <div className="audit-actions-section">
          <div className="panel-title sub-title">
            <span>{t.improvementPlan || (isRu ? 'ПЛАН УЛУЧШЕНИЙ' : 'ACTION PLAN')}</span>
            <span className="actions-count-pill">{audit.actions.length} {isRu ? 'пункта' : 'steps'}</span>
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
