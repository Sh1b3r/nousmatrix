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

  const cavernRelics = relics.filter(r => r.type === 1 || r.type === 2 || r.type === 3 || r.type === 4 || (!r.type && relics.indexOf(r) < 4));
  const spherePiece = relics.find(r => r.type === 5 || r.pos === 5) || (relics.length >= 5 ? relics[4] : null);
  const ropePiece = relics.find(r => r.type === 6 || r.pos === 6) || (relics.length >= 6 ? relics[5] : null);
  const planarRelics = [spherePiece, ropePiece].filter(Boolean);

  const renderPlaceholderCard = (slotIdx, defaultTitle) => {
    const slotTitle = slots[slotIdx] || defaultTitle;
    const isSphere = slotIdx === 4;
    return (
      <div key={`placeholder-${slotIdx}`} className="relic-item-card relic-placeholder-card">
        <div className="relic-top-row">
          <div className="relic-left-meta">
            <div className="relic-icon-wrap placeholder">
              <span className="placeholder-icon">{isSphere ? '🔮' : '🔗'}</span>
              <span className="relic-lvl-badge" style={{ opacity: 0.5 }}>+0</span>
            </div>
            <div className="relic-name-col">
              <span className="relic-slot-name">{slotTitle}</span>
              <span className="relic-piece-title" style={{ opacity: 0.65, fontStyle: 'italic' }}>
                {isRu ? 'Ожидает синхронизации' : 'Awaiting sync'}
              </span>
            </div>
          </div>
          <span className="relic-cv-pill" style={{ color: 'var(--text-tertiary)', background: 'none' }}>
            {isRu ? '5★ ОРНАМЕНТ' : '5★ ORNAMENT'}
          </span>
        </div>
        <div className="relic-placeholder-body">
          <p className="relic-placeholder-hint">
            {isRu
              ? 'Если предмет надет в игре, пересохраните витрину в профиле HSR или перезайдите в игру, затем нажмите кнопку «ОБНОВИТЬ» вверху.'
              : 'If equipped in-game, re-save your showcase or relog in HSR, then click "REFRESH" above.'}
          </p>
        </div>
      </div>
    );
  };

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
                crossOrigin="anonymous"
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
                  crossOrigin="anonymous"
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

        {/* Sub Stats with Roll Counts (Excluding base roll: counts pure upgrade procs) */}
        <div className="relic-subs-list">
          {(r.sub_affix || []).map((sub, sIdx) => {
            const upgrades = Math.max(0, (sub.count || 1) - 1);
            const isEpic = upgrades >= 3;
            const isHigh = upgrades === 2;
            const tagClass = isEpic ? 'epic' : (isHigh ? 'high' : '');
            const tagText = t.rollTag ? t.rollTag(upgrades) : (upgrades > 0 ? `+${upgrades} ролл` : null);
            return (
              <div key={sIdx} className="relic-sub-row">
                <span className="relic-sub-name">
                  {sub.icon && (
                    <img
                      className="relic-affix-icon sub"
                      src={iconUrl(sub.icon)}
                      alt=""
                      crossOrigin="anonymous"
                      onError={(e) => handleImageFallback(e, sub.icon)}
                    />
                  )}
                  {formatStatName(sub.name, lang)}
                </span>
                <span className="relic-sub-val">
                  {sub.display}
                  {tagText && (
                    <span className={`roll-count-tag ${tagClass}`}>
                      {tagText}
                    </span>
                  )}
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
            {audit?.planar?.setName || planarRelics.length === 2 ? (
              <span className={`relic-group-tag ${audit?.planar?.isComplete ? 'accent' : 'broken'}`}>
                {planarTagLabel}
              </span>
            ) : planarRelics.length === 1 ? (
              <span className="relic-group-tag broken">
                {isRu ? '1/2 ЭКИПИРОВАН • ВТОРОЙ СЛОТ ОЖИДАЕТ СИНХРОНИЗАЦИИ ⚠️' : '1/2 EQUIPPED • 2ND SLOT PENDING SYNC ⚠️'}
              </span>
            ) : (
              <span className="relic-group-tag" style={{ borderStyle: 'dashed', color: 'var(--text-secondary)' }}>
                {isRu ? '⏳ 0/2 ОЖИДАЕТ СИНХРОНИЗАЦИИ В ИГРЕ' : '⏳ 0/2 AWAITING GAME SYNC'}
              </span>
            )}
          </div>
          <div className="relics-grid planar-grid">
            {spherePiece ? renderCard(spherePiece, 4) : renderPlaceholderCard(4, isRu ? 'Планарная сфера' : 'Planar Sphere')}
            {ropePiece ? renderCard(ropePiece, 5) : renderPlaceholderCard(5, isRu ? 'Соединительная вервь' : 'Link Rope')}
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
            {relics.slice(0, 4).map((r, i) => renderCard(r, i))}
            {spherePiece ? renderCard(spherePiece, 4) : renderPlaceholderCard(4, isRu ? 'Планарная сфера' : 'Planar Sphere')}
            {ropePiece ? renderCard(ropePiece, 5) : renderPlaceholderCard(5, isRu ? 'Соединительная вервь' : 'Link Rope')}
          </div>
        </div>
      )}
    </div>
  );
}
