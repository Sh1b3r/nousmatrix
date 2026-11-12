import React, { useState } from 'react';
import { iconUrl, handleImageFallback } from '../utils/audit';
import { formatStatName } from '../utils/i18n';

export default function RelicsGrid({ character, audit, t, lang = 'ru' }) {
  if (!character) return null;
  const isRu = lang === 'ru';

  // Toggle between sectioned layout (позначки в разных местах у сетов) and unified grid
  const [layoutMode, setLayoutMode] = useState('grouped');

  const relics = character.relics || [];
  const slots = t.relicSlots || [];

  const cavernRelics = relics.filter(r => r.type === 1 || r.type === 2 || r.type === 3 || r.type === 4);
  const planarRelics = relics.filter(r => r.type === 5 || r.type === 6);

  const renderCard = (r, idx) => {
    const isWeak = idx === audit?.weakestRelicIndex;
    const slotTitle = slots[idx] || `Слот ${idx + 1}`;

    return (
      <div key={idx} className={`relic-item-card ${isWeak ? 'weak-piece' : ''}`}>
        {/* On mobile: banner written on top */}
        {isWeak && (
          <div className="relic-worst-banner-top mobile-only">
            <span className="worst-warn-icon">⚠️</span>
            <span>{t.weakPiece}</span>
          </div>
        )}
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
            <>
              {/* On desktop: badge on the right in top row */}
              <span className="relic-cv-pill weak-pill desktop-only">
                {t.weakPiece}
              </span>
              {/* On mobile: standard rarity tag on the right since worst is on top */}
              <span className="relic-cv-pill mobile-only" style={{ color: 'var(--text-secondary)', background: 'none' }}>
                {idx >= 4 ? (isRu ? '5★ ОРНАМЕНТ' : '5★ ORNAMENT') : t.goldRelic}
              </span>
            </>
          ) : (
            <span className="relic-cv-pill" style={{ color: 'var(--text-secondary)', background: 'none' }}>
              {idx >= 4 ? (isRu ? '5★ ОРНАМЕНТ' : '5★ ORNAMENT') : t.goldRelic}
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
              <span
                className={`main-stat-badge ${r.main_eval.status}`}
                title={r.main_eval.status === 'wrong' ? (isRu ? `Рекомендуется: ${r.main_eval.recommendedRu}` : `Recommended: ${r.main_eval.recommendedEn}`) : ''}
              >
                {isRu ? r.main_eval.labelRu : r.main_eval.labelEn}
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

  const planarTagLabel = audit?.planar?.isComplete
    ? `✓ 2/2 ${audit.planar.setName || planarRelics[0]?.set_name}`
    : (isRu ? '1/2 + 1/2 РАЗОРВАННЫЙ СЕТ ⚠️' : '1/2 + 1/2 BROKEN SET ⚠️');

  return (
    <div>
      {/* View Mode Toggle: По секциям (позначки в разных местах) vs Все слоты (слитно) */}
      <div className="relic-view-toggle-row">
        <div className="relic-view-toggle">
          <button
            type="button"
            className={`toggle-btn ${layoutMode === 'grouped' ? 'active' : ''}`}
            onClick={() => setLayoutMode('grouped')}
            title={isRu ? 'Раздельные позначки у каждого сета (как в прошлых коммитах)' : 'Grouped by sections with separate tags'}
          >
            {isRu ? 'ПО СЕКЦИЯМ' : 'BY SECTIONS'}
          </button>
          <button
            type="button"
            className={`toggle-btn ${layoutMode === 'unified' ? 'active' : ''}`}
            onClick={() => setLayoutMode('unified')}
            title={isRu ? 'Единая сетка 6 слотов' : 'Unified grid of 6 slots'}
          >
            {isRu ? 'ВСЕ СЛОТЫ' : 'ALL SLOTS'}
          </button>
        </div>
      </div>

      {layoutMode === 'grouped' ? (
        /* ВАРИАНТ 1: Позначки в разных местах (у пещерных и планарных реликвий) */
        <div className="relics-grouped-container">
          {/* 1. Cavern Relics Section */}
          <div className="relic-group-header">
            <span className="relic-group-title">{t.cavernRelicsTitle}</span>
            {audit?.cavern?.label && (
              <span className={`relic-group-tag ${audit?.cavern?.isComplete ? 'accent' : (audit?.cavern ? 'broken' : '')}`}>
                {audit.cavern.label}
              </span>
            )}
          </div>
          <div className="relics-grid" style={{ marginBottom: '22px' }}>
            {relics.slice(0, 4).map((r, i) => renderCard(r, i))}
          </div>

          {/* 2. Planar Ornaments Section */}
          <div className="relic-group-header planar">
            <span className="relic-group-title">{t.planarRelicsTitle}</span>
            {(audit?.planar?.setName || planarRelics.length > 0) && (
              <span className={`relic-group-tag ${audit?.planar?.isComplete ? 'accent' : 'broken'}`}>
                {planarTagLabel}
              </span>
            )}
          </div>
          <div className="relics-grid planar-grid">
            {relics.slice(4, 6).map((r, i) => renderCard(r, i + 4))}
          </div>
        </div>
      ) : (
        /* ВАРИАНТ 2: Единая сетка 6 слотов со сводными позначками наверху */
        <div className="relics-unified-container">
          {(audit?.cavern?.label || audit?.planar?.setName) && (
            <div className="relics-sets-summary">
              {audit?.cavern?.label && (
                <span className={`relic-group-tag ${audit?.cavern?.isComplete ? 'accent' : (audit?.cavern ? 'broken' : '')}`}>
                  {audit.cavern.label}
                </span>
              )}
              {audit?.planar?.setName && (
                <span className={`relic-group-tag ${audit?.planar?.isComplete ? 'accent' : 'broken'}`}>
                  {planarTagLabel}
                </span>
              )}
            </div>
          )}
          <div className="relics-grid">
            {relics.map((r, i) => renderCard(r, i))}
          </div>
        </div>
      )}
    </div>
  );
}
