import React from 'react';
import { iconUrl, handleImageFallback } from '../utils/audit';
import { formatStatName } from '../utils/i18n';

export default function RelicsGrid({ character, audit, t, lang = 'ru' }) {
  if (!character) return null;

  const relics = character.relics || [];
  const slots = t.relicSlots || [];

  const cavernRelics = relics.filter(r => r.type === 1 || r.type === 2 || r.type === 3 || r.type === 4);
  const planarRelics = relics.filter(r => r.type === 5 || r.type === 6);

  const renderCard = (r, idx) => {
    const isWeak = idx === audit?.weakestRelicIndex;
    const slotTitle = slots[idx] || `Слот ${idx + 1}`;

    return (
      <div key={idx} className={`relic-item-card ${isWeak ? 'weak-piece' : ''}`}>
        <div className="relic-top-row">
          <div className="relic-left-meta">
            <div className="relic-icon-wrap">
              <img
                className="relic-icon-img"
                src={iconUrl(r.icon)}
                alt={r.name}
                onError={(e) => handleImageFallback(e, r.icon)}
              />
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
          <div className="relic-main-left">
            <span className="relic-main-label">
              {r.main_affix?.icon && (
                <img
                  className="relic-affix-icon main"
                  src={iconUrl(r.main_affix?.icon)}
                  alt=""
                  onError={(e) => handleImageFallback(e, r.main_affix?.icon)}
                />
              )}
              {formatStatName(r.main_affix?.name, lang)}
            </span>
            {r.main_eval && (idx >= 2) && (
              <span className={`main-stat-badge ${r.main_eval.status}`} title={r.main_eval.status === 'wrong' ? (lang === 'ru' ? `Рекомендуется: ${r.main_eval.recommendedRu}` : `Recommended: ${r.main_eval.recommendedEn}`) : ''}>
                {lang === 'ru' ? r.main_eval.labelRu : r.main_eval.labelEn}
              </span>
            )}
          </div>
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
                      className="relic-affix-icon sub"
                      src={iconUrl(sub.icon)}
                      alt=""
                      onError={(e) => handleImageFallback(e, sub.icon)}
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
  };

  return (
    <div>
      {/* 1. Cavern Relics (4 Slots) */}
      <div className="relic-group-header">
        <span className="relic-group-title">{t.cavernRelicsTitle}</span>
        {cavernRelics.length > 0 && (
          <span className="relic-group-tag">{cavernRelics[0].set_name}</span>
        )}
      </div>
      <div className="relics-grid" style={{ marginBottom: '24px' }}>
        {relics.slice(0, 4).map((r, i) => renderCard(r, i))}
      </div>

      {/* 2. Planar Ornaments (2 Slots) */}
      <div className="relic-group-header planar">
        <span className="relic-group-title">{t.planarRelicsTitle}</span>
        {planarRelics.length > 0 && (
          <span className="relic-group-tag accent">{planarRelics[0].set_name}</span>
        )}
      </div>
      <div className="relics-grid planar-grid">
        {relics.slice(4, 6).map((r, i) => renderCard(r, i + 4))}
      </div>
    </div>
  );
}
