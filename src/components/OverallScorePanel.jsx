import React from 'react';
import { RoleSvgIcon, WarnIcon, CheckIcon } from './Icons.jsx';

export default function OverallScorePanel({ audit, t, lang = 'ru' }) {
  if (!audit) return null;

  const isRu = (lang || (t?.lvl === 'Ур.' ? 'ru' : 'en')) === 'ru';
  const cvBarWidth = Math.min(100, Math.max(10, (parseFloat(audit.cv) / 320) * 100));
  const isSpdOk = parseFloat(audit.spd) >= 134;

  return (
    <div className="overall-score-panel">
      {/* Panel Title */}
      <div className="panel-title">
        <span>{isRu ? 'ОБЩАЯ ОЦЕНКА БИЛДА' : 'OVERALL BUILD EVALUATION'}</span>
        <span style={{ color: 'var(--accent)' }}>{t.matrix100 || 'MATRIX 100'}</span>
      </div>

      {/* Hero Score & Global Tier */}
      <div className="score-hero">
        <div className="score-number">
          {audit.score}<span>/100</span>
        </div>
        <div className="score-tier">TOP {audit.topPercent}% GLOBAL</div>
      </div>

      {/* Dynamic Role Classification Badge */}
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

      {/* Core Benchmark Metric Bars */}
      <div className="overall-metrics-list" style={{ marginBottom: '18px' }}>
        {/* Metric 1: Roll Efficiency */}
        <div className="metric-row">
          <div className="metric-label-line">
            <span className="metric-name">{t.rollEfficiency || (isRu ? 'Качество роллов (Roll Efficiency)' : 'Roll Efficiency')}</span>
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

        {/* Metric 3: Secondary Benchmark Stat (SPD) */}
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

      {/* Bottleneck Analysis */}
      {audit.bottleneck && (
        <div className="audit-section-divider">
          <div className="panel-title sub-title">
            <span>{t.bottleneck || (isRu ? 'АНАЛИЗ УЗКИХ МЕСТ' : 'BOTTLENECK ANALYSIS')}</span>
          </div>
          <p className="bottleneck-text">
            {audit.bottleneck}
          </p>
        </div>
      )}

      {/* Action Plan */}
      {audit.actions && audit.actions.length > 0 && (
        <div className="audit-section-divider">
          <div className="panel-title sub-title">
            <span>{t.improvementPlan || (isRu ? 'ПЛАН УЛУЧШЕНИЙ' : 'ACTION PLAN')}</span>
          </div>
          <div className="audit-actions-list">
            {audit.actions.map((act, i) => (
              <div key={i} className="audit-action-box">
                <div className="action-box-title">
                  <span className="action-bullet">#{i + 1}</span>
                  <span>{act.title}</span>
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
