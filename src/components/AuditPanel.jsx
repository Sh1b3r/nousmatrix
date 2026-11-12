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

        {/* Metric 2: Primary Key Stat (Самый нужный стат персонажа вместо критмассы) */}
        <div className="metric-row">
          <div className="metric-label-line">
            <span>{isRu ? (audit.primaryMetric?.labelRu || t.critValue) : (audit.primaryMetric?.labelEn || t.critValue)}</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>
              {audit.primaryMetric ? `${audit.primaryMetric.display} ${audit.primaryMetric.status || ''}`.trim() : audit.cv}
            </span>
          </div>
          <div className="metric-bar-bg">
            <div
              className="metric-bar-fill"
              style={{ width: `${audit.primaryMetric ? audit.primaryMetric.percent : cvBarWidth}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Secondary Benchmark Stat (Скорость или профильный сабстат) */}
        <div className="metric-row">
          <div className="metric-label-line">
            <span>{isRu ? (audit.secondaryMetric?.labelRu || t.speedThreshold) : (audit.secondaryMetric?.labelEn || t.speedThreshold)}</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>
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

      {/* Cavern Relics Audit Section (Подсчет пещерных реликвий) */}
      {audit.cavern && audit.cavern.label && (
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          <div className="panel-title">
            <span>{t.cavernAuditTitle || (isRu ? 'ПОДСЧЁТ ПЕЩЕРНЫХ РЕЛИКВИЙ' : 'CAVERN RELICS BREAKDOWN')}</span>
            <span style={{ color: audit.cavern.isComplete ? 'var(--accent)' : 'var(--text-tertiary)', fontSize: '10px' }}>
              {audit.cavern.isComplete ? (t.cavernSetComplete || (isRu ? 'КОМПЛЕКТ АКТИВЕН' : 'SET ACTIVE')) : (t.cavernSetBroken || (isRu ? 'РАЗОРВАННЫЙ СЕТ' : 'BROKEN SET'))}
            </span>
          </div>

          <div className="planar-audit-box">
            <div className="planar-audit-name">
              <span>{audit.cavern.label}</span>
              <span className="planar-rolls-badge">
                {audit.cavern.usefulRolls}/{audit.cavern.rollsTotal} {isRu ? 'роллов' : 'rolls'}
              </span>
            </div>

            <div className="metric-row" style={{ marginTop: '8px' }}>
              <div className="metric-label-line">
                <span>{t.cavernRollQuality || (isRu ? 'Качество роллов пещерных сетов' : 'Cavern Relics Roll Quality')}</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{audit.cavern.efficiency}%</span>
              </div>
              <div className="metric-bar-bg">
                <div
                  className="metric-bar-fill accent"
                  style={{ width: `${audit.cavern.efficiency}%` }}
                />
              </div>
            </div>

            {parseFloat(audit.cavern.cv) > 0 && (
              <div className="metric-row">
                <div className="metric-label-line">
                  <span>{t.cavernCv || (isRu ? 'Крит. масса пещерных сетов (Cavern CV)' : 'Cavern Crit Value (CV)')}</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>{audit.cavern.cv}</span>
                </div>
              </div>
            )}

            <div className="planar-condition-line">
              {audit.cavern.condition}
            </div>
          </div>
        </div>
      )}

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
