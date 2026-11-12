import React from 'react';
import { SphereIcon, CheckIcon, WarnIcon, SparklesIcon } from './Icons.jsx';

export default function RelicsAuditPanel({ audit, t, lang = 'ru' }) {
  if (!audit) return null;

  const isRu = (lang || (t?.lvl === 'Ур.' ? 'ru' : 'en')) === 'ru';
  const cavern = audit.cavern;
  const planar = audit.planar;

  return (
    <div className="relics-audit-panel">
      {/* Panel Header */}
      <div className="panel-title relics-audit-title">
        <div className="relics-title-group">
          <span className="relics-audit-dot" />
          <span>{isRu ? 'ПОДСЧЁТ РЕЛИКВИЙ И ПЛАНАРОК' : 'RELICS & PLANARS AUDIT'}</span>
        </div>
        <span className="relics-audit-badge">{isRu ? 'АУДИТ РОЛЛОВ СЕТОВ' : 'SET ROLL QUALITY'}</span>
      </div>

      <div className="relics-audit-grid">
        {/* 1. Cavern Relics Audit Section (Подсчёт пещерных реликвий 4 слота) */}
        {cavern && cavern.label ? (
          <div className="relic-audit-block cavern-block">
            <div className="relic-audit-head">
              <span className="relic-audit-tag">
                {isRu ? 'ПЕЩЕРНЫЕ РЕЛИКВИИ (4 СЛОТА)' : 'CAVERN RELICS (4 SLOTS)'}
              </span>
              <span className={`relic-set-status-pill ${cavern.isComplete ? 'active' : 'broken'}`}>
                {cavern.isComplete
                  ? (t.cavernSetComplete || (isRu ? 'КОМПЛЕКТ АКТИВЕН 4/4' : 'SET ACTIVE 4/4'))
                  : (t.cavernSetBroken || (isRu ? 'КОМБИНАЦИЯ / РАЗОРВАН' : 'BROKEN SET'))}
              </span>
            </div>

            <div className="planar-audit-box">
              <div className="planar-audit-name">
                <span className="set-name-text">{cavern.label}</span>
                <span className="planar-rolls-badge">
                  {cavern.usefulRolls}/{cavern.rollsTotal} {isRu ? 'полезных роллов' : 'useful rolls'}
                </span>
              </div>

              <div className="metric-row" style={{ marginTop: '10px' }}>
                <div className="metric-label-line">
                  <span>{t.cavernRollQuality || (isRu ? 'Качество роллов пещерных слотов' : 'Cavern Relics Roll Quality')}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent)' }}>
                    {cavern.efficiency}%
                  </span>
                </div>
                <div className="metric-bar-bg">
                  <div
                    className="metric-bar-fill accent"
                    style={{ width: `${cavern.efficiency}%` }}
                  />
                </div>
              </div>

              {parseFloat(cavern.cv) > 0 && (
                <div className="metric-row">
                  <div className="metric-label-line">
                    <span>{t.cavernCv || (isRu ? 'Крит. масса пещерных сетов (CV)' : 'Cavern Crit Value (CV)')}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>
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
            <span>{isRu ? 'Пещерные реликвии не экипированы' : 'No cavern relics equipped'}</span>
          </div>
        )}

        {/* 2. Planar Ornaments Audit Section (Подсчёт планарок 2 слота) */}
        {planar && planar.setName ? (
          <div className="relic-audit-block planar-block">
            <div className="relic-audit-head">
              <span className="relic-audit-tag">
                {isRu ? 'ПЛАНАРНЫЕ УКРАШЕНИЯ (2 СЛОТА)' : 'PLANAR ORNAMENTS (2 SLOTS)'}
              </span>
              <span className={`relic-set-status-pill ${planar.isComplete ? 'active' : 'broken'}`}>
                {planar.isComplete
                  ? (t.planarSetComplete || (isRu ? 'СЕТ АКТИВЕН 2/2' : 'SET ACTIVE 2/2'))
                  : (t.planarSetBroken || (isRu ? 'РАЗОРВАННЫЙ СЕТ' : 'BROKEN SET'))}
              </span>
            </div>

            <div className="planar-audit-box">
              <div className="planar-audit-name">
                <span className="set-name-text">{planar.setName}</span>
                <span className="planar-rolls-badge">
                  {planar.usefulRolls}/{planar.rollsTotal} {isRu ? 'полезных роллов' : 'useful rolls'}
                </span>
              </div>

              <div className="metric-row" style={{ marginTop: '10px' }}>
                <div className="metric-label-line">
                  <span>{t.planarRollQuality || (isRu ? 'Качество роллов планарных слотов' : 'Planar Roll Quality')}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent)' }}>
                    {planar.efficiency}%
                  </span>
                </div>
                <div className="metric-bar-bg">
                  <div
                    className="metric-bar-fill accent"
                    style={{ width: `${planar.efficiency}%` }}
                  />
                </div>
              </div>

              {parseFloat(planar.cv) > 0 && (
                <div className="metric-row">
                  <div className="metric-label-line">
                    <span>{t.planarCv || (isRu ? 'Крит. масса планарного сета (CV)' : 'Planar Crit Value (CV)')}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>
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
            <span>{isRu ? 'Планарные украшения ожидают синхронизации в игре' : 'Planar ornaments awaiting sync'}</span>
          </div>
        )}
      </div>
    </div>
  );
}
