import React from 'react';
import { iconUrl } from '../utils/audit';
import { formatStatName } from '../utils/i18n';

export default function RelicsGrid({ character, audit, t, lang = 'ru' }) {
  if (!character) return null;

  const relics = character.relics || [];
  const slots = t.relicSlots || [];

  return (
    <div className="relics-grid">
      {relics.map((r, idx) => {
        const isWeak = idx === audit?.weakestRelicIndex;
        const slotTitle = slots[idx] || `Слот ${idx + 1}`;

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
                <span className="relic-cv-pill">{t.weakPiece}</span>
              ) : (
                <span className="relic-cv-pill" style={{ color: 'var(--text-secondary)', background: 'none' }}>
                  {t.goldRelic}
                </span>
              )}
            </div>

            {/* Main Stat */}
            <div className="relic-main-stat-box">
              <span className="relic-main-label">
                {r.main_affix?.icon && (
                  <img
                    style={{ width: '16px', height: '16px', objectFit: 'contain' }}
                    src={iconUrl(r.main_affix?.icon)}
                    alt=""
                  />
                )}
                {formatStatName(r.main_affix?.name, lang)}
              </span>
              <span className="relic-main-val">{r.main_affix?.display}</span>
            </div>

            {/* Sub Stats with Roll Counts */}
            <div className="relic-subs-list">
              {(r.sub_affix || []).map((sub, sIdx) => {
                const rolls = sub.count || 1;
                const isHigh = rolls >= 3;
                return (
                  <div key={sIdx} className="relic-sub-row">
                    <span className="relic-sub-name">
                      {sub.icon && (
                        <img
                          style={{ width: '14px', height: '14px', objectFit: 'contain' }}
                          src={iconUrl(sub.icon)}
                          alt=""
                        />
                      )}
                      {formatStatName(sub.name, lang)}
                    </span>
                    <span className="relic-sub-val">
                      {sub.display}
                      <span className={`roll-count-tag ${isHigh ? 'high' : ''}`}>
                        {t.rollTag(rolls)}
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
