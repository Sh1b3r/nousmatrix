import React from 'react';
import { iconUrl, SLOT_NAMES } from '../utils/audit';

export default function RelicsGrid({ character, audit }) {
  if (!character) return null;

  const relics = character.relics || [];

  return (
    <div className="relics-grid">
      {relics.map((r, idx) => {
        const isWeak = idx === audit?.weakestRelicIndex;
        const slotTitle = SLOT_NAMES[idx] || `Слот ${idx + 1}`;

        return (
          <div key={idx} className={`relic-item-card ${isWeak ? 'weak-piece' : ''}`}>
            <div className="relic-top-row">
              <div className="relic-left-meta">
                <div className="relic-icon-wrap">
                  <img className="relic-icon-img" src={iconUrl(r.icon)} alt={r.name} />
                  <span className="relic-lvl-badge">+{r.level}</span>
                </div>
                <div className="relic-name-col">
                  <span className="relic-slot-name">{slotTitle}</span>
                  <span className="relic-piece-title" title={r.name}>{r.name}</span>
                </div>
              </div>
              {isWeak ? (
                <span className="relic-cv-pill">СЛАБОЕ ЗВЕНО</span>
              ) : (
                <span className="relic-cv-pill" style={{ color: 'var(--text-secondary)', background: 'none' }}>
                  5★ GOLD
                </span>
              )}
            </div>

            <div className="relic-main-stat-box">
              <span className="relic-main-label">
                <img
                  style={{ width: '16px', height: '16px', objectFit: 'contain' }}
                  src={iconUrl(r.main_affix?.icon)}
                  alt=""
                />
                {r.main_affix?.name}
              </span>
              <span className="relic-main-val">{r.main_affix?.display}</span>
            </div>

            <div className="relic-subs-list">
              {(r.sub_affix || []).map((sub, sIdx) => {
                const rolls = sub.count || 1;
                const isHigh = rolls >= 3;
                return (
                  <div key={sIdx} className="relic-sub-row">
                    <span className="relic-sub-name">
                      <img
                        style={{ width: '14px', height: '14px', objectFit: 'contain' }}
                        src={iconUrl(sub.icon)}
                        alt=""
                      />
                      {sub.name}
                    </span>
                    <span className="relic-sub-val">
                      {sub.display}
                      <span className={`roll-count-tag ${isHigh ? 'high' : ''}`}>
                        {rolls > 1 ? `${rolls} ролла` : '1 ролл'}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
