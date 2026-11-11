import React from 'react';

export default function AuditPanel({ audit, t, lang = 'ru' }) {
  if (!audit) return null;

  const isRu = (lang || (t?.lvl === 'Ур.' ? 'ru' : 'en')) === 'ru';
  const cvBarWidth = Math.min(100, Math.max(10, (parseFloat(audit.cv) / 320) * 100));
  const isSpdOk = parseFloat(audit.spd) >= 134;

  return (
    <div>
      <div className="panel-title">
        <span>{t.combatIndex}</span>
        <span>{t.matrix100}</span>
      </div>

      <div className="score-hero">
        <div className="score-number">
          {audit.score}<span>/100</span>
        </div>
        <div className="score-tier">TOP {audit.topPercent}% GLOBAL</div>
      </div>

      <div style={{ marginBottom: '18px' }}>
        <div className="metric-row">
          <div className="metric-label-line">
            <span>{t.rollEfficiency}</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>{audit.rollEfficiency}%</span>
          </div>
          <div className="metric-bar-bg">
            <div className="metric-bar-fill accent" style={{ width: `${audit.rollEfficiency}%` }} />
          </div>
        </div>

        <div className="metric-row">
          <div className="metric-label-line">
            <span>{t.critValue}</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>{audit.cv}</span>
          </div>
          <div className="metric-bar-bg">
            <div className="metric-bar-fill" style={{ width: `${cvBarWidth}%` }} />
          </div>
        </div>

        <div className="metric-row">
          <div className="metric-label-line">
            <span>{t.speedThreshold}</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>
              {audit.spd} SPD {isSpdOk ? '[OK]' : '[SLOW]'}
            </span>
          </div>
          <div className="metric-bar-bg">
            <div
              className="metric-bar-fill accent"
              style={{ width: `${Math.min(100, (parseFloat(audit.spd) / 160) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Planar Ornaments Audit Section (Подсчет планарок) */}
      {audit.planar && audit.planar.setName && (
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          <div className="panel-title">
            <span>{t.planarAuditTitle}</span>
            <span style={{ color: audit.planar.isComplete ? 'var(--accent)' : 'var(--text-tertiary)', fontSize: '10px' }}>
              {audit.planar.isComplete ? t.planarSetComplete : t.planarSetBroken}
            </span>
          </div>

          <div className="planar-audit-box">
            <div className="planar-audit-name">
              <span>{audit.planar.setName}</span>
              <span className="planar-rolls-badge">
                {audit.planar.usefulRolls}/{audit.planar.rollsTotal} {isRu ? 'роллов' : 'rolls'}
              </span>
            </div>

            <div className="metric-row" style={{ marginTop: '8px' }}>
              <div className="metric-label-line">
                <span>{t.planarRollQuality}</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{audit.planar.efficiency}%</span>
              </div>
              <div className="metric-bar-bg">
                <div
                  className="metric-bar-fill accent"
                  style={{ width: `${audit.planar.efficiency}%` }}
                />
              </div>
            </div>

            {parseFloat(audit.planar.cv) > 0 && (
              <div className="metric-row">
                <div className="metric-label-line">
                  <span>{t.planarCv}</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>{audit.planar.cv}</span>
                </div>
              </div>
            )}

            <div className="planar-condition-line">
              {audit.planar.condition}
            </div>
          </div>
        </div>
      )}

      {/* Bottleneck Analysis */}
      <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="panel-title">{t.bottleneck}</div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
          {audit.bottleneck}
        </p>
      </div>

      {/* Action Plan */}
      <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="panel-title">{t.improvementPlan}</div>
        {audit.actions.map((act, i) => (
          <div key={i} className="audit-action-box">
            <b>{act.title}</b>
            <div>{act.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
