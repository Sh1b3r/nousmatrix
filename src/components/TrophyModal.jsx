import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { toBlob, toPng } from 'html-to-image';
import { getCharHeadIcon, getCharAvatarPath, iconUrl, handleImageFallback } from '../utils/audit';
import CombatStats from './CombatStats';
import SetBonuses from './SetBonuses';
import RelicsGrid from './RelicsGrid';

function waitForImages(element) {
  if (!element) return Promise.resolve();
  const imgs = Array.from(element.querySelectorAll('img'));
  return Promise.all(
    imgs.map(img => {
      if (img.complete && img.naturalWidth !== 0) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
        setTimeout(resolve, 2500);
      });
    })
  );
}

export default function TrophyModal({ isOpen, onClose, character, audit, uid, t, lang = 'ru' }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [imageBlob, setImageBlob] = useState(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [isCopying, setIsCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef(null);

  const isRu = lang === 'ru';

  useEffect(() => {
    if (!isOpen || !character || !audit) {
      setImageSrc(null);
      setImageBlob(null);
      setIsGenerating(true);
      return;
    }

    let isMounted = true;
    setIsGenerating(true);

    const generate = async () => {
      try {
        if (!cardRef.current) return;
        await waitForImages(cardRef.current);
        await new Promise(r => setTimeout(r, 180));
        if (!isMounted || !cardRef.current) return;

        let dataUrl = null;
        let blob = null;

        try {
          const canvas = await html2canvas(cardRef.current, {
            scale: 2,
            useCORS: true,
            allowTaint: false,
            backgroundColor: '#12081C',
            width: 1180,
            windowWidth: 1200,
            scrollX: 0,
            scrollY: 0,
            x: 0,
            y: 0,
            logging: false,
          });

          dataUrl = canvas.toDataURL('image/png');
          blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
        } catch (h2cErr) {
          console.warn('html2canvas attempt failed, falling back to html-to-image:', h2cErr);
          dataUrl = await toPng(cardRef.current, {
            pixelRatio: 2,
            skipFonts: true,
            cacheBust: false,
            backgroundColor: '#12081C',
          });
          blob = await toBlob(cardRef.current, {
            pixelRatio: 2,
            skipFonts: true,
            cacheBust: false,
            backgroundColor: '#12081C',
          });
        }

        if (isMounted && dataUrl) {
          setImageSrc(dataUrl);
          setImageBlob(blob);
        }
      } catch (err) {
        console.error('Build card generation error:', err);
      } finally {
        if (isMounted) {
          setIsGenerating(false);
        }
      }
    };

    const timer = setTimeout(generate, 80);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isOpen, character, audit]);

  if (!isOpen || !character || !audit) return null;

  const handleCopyImage = async () => {
    try {
      setIsCopying(true);
      let blob = imageBlob;

      if (!blob && cardRef.current) {
        const canvas = await html2canvas(cardRef.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#12081C',
          width: 1180,
          logging: false
        });
        blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
      }

      if (!blob) throw new Error('Blob creation failed');

      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } else {
        handleDownloadImage();
      }
    } catch (err) {
      console.warn('Clipboard write error, falling back to download:', err);
      handleDownloadImage();
    } finally {
      setIsCopying(false);
    }
  };

  const handleDownloadImage = async () => {
    try {
      let src = imageSrc;
      if (!src && cardRef.current) {
        const canvas = await html2canvas(cardRef.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#12081C',
          width: 1180,
          logging: false
        });
        src = canvas.toDataURL('image/png');
      }
      if (!src) return;
      const link = document.createElement('a');
      link.download = `${character.name || 'Character'}_BuildCard_${uid || 'HSR'}.png`;
      link.href = src;
      link.click();
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const renderCardContent = () => (
    <>
      {/* 1. HERO HEADER: Character + Light Cone + Rank & Score Badge */}
      <div className="trophy-header-row">
        {/* Character Identity */}
        <div className="trophy-char-identity">
          <div className="trophy-avatar-box">
            <img
              className="trophy-avatar-img"
              src={getCharHeadIcon(character)}
              alt={character.name}
              crossOrigin="anonymous"
              onError={(e) => handleImageFallback(e, getCharAvatarPath(character))}
            />
          </div>
          <div className="trophy-char-col">
            <div className="trophy-char-title-row">
              <h2 className="trophy-char">{character.name}</h2>
              <div className="trophy-stars">{'★'.repeat(character.rarity || 5)}</div>
            </div>
            <div className="trophy-pills-row">
              <span className="char-pill">{t.lvl} {character.level}/80</span>
              <span className="char-pill accent">{t.eidolons}{character.rank}</span>
              <span className="char-pill">{t.path}{character.path?.name || '—'}</span>
              <span className="char-pill">{t.combatType}{character.element?.name || '—'}</span>
            </div>
          </div>
        </div>

        {/* Light Cone Meta */}
        {character.light_cone && (
          <div className="trophy-cone-box">
            <img
              className="trophy-cone-img"
              src={iconUrl(character.light_cone.icon)}
              alt={character.light_cone.name}
              crossOrigin="anonymous"
              onError={(e) => handleImageFallback(e, character.light_cone.icon)}
            />
            <div className="trophy-cone-meta">
              <div className="trophy-cone-name">{character.light_cone.name}</div>
              <div className="trophy-cone-rank">
                {t.superimposition}{character.light_cone.rank} • {t.lvl} {character.light_cone.level}/80
              </div>
            </div>
          </div>
        )}

        {/* Score & Benchmark Badge */}
        <div className="trophy-score-box">
          <div className="trophy-badge">{t.verifiedBadge} {audit.topPercent}% {t.verifiedSuffix}</div>
          <div className="trophy-score-val">
            {audit.score}<span>/100</span>
          </div>
          <div className="trophy-uid-tag">UID: {uid}</div>
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN DASHBOARD GRID */}
      <div className="trophy-dashboard-grid">
        {/* Left Column: Combat Attributes & Set Bonuses */}
        <div className="trophy-col-left">
          <div className="panel" style={{ marginBottom: '20px' }}>
            <div className="panel-title">
              <span>{t.combatStatsTitle}</span>
              <span style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>{t.basePlusBonus}</span>
            </div>
            <CombatStats character={character} t={t} lang={lang} />
          </div>

          <div className="panel">
            <div className="panel-title">
              <span>{t.setsTitle}</span>
            </div>
            <SetBonuses character={character} t={t} />
          </div>
        </div>

        {/* Right Column: 6 Equipped Relics Grid */}
        <div className="trophy-col-right">
          <div className="panel">
            <div className="panel-title">
              <span>{t.relicsTitle}</span>
              <span style={{ color: 'var(--accent)' }}>{t.verifiedData}</span>
            </div>
            <RelicsGrid character={character} audit={audit} t={t} lang={lang} />
          </div>
        </div>
      </div>

      {/* 3. FOOTER */}
      <div className="trophy-card-footer">
        <span className="trophy-verified-tag">
          <img
            src="/media/NousMatrix-logo.png"
            alt=""
            className="trophy-logo-img"
          />
          {t.verifiedBy} // {t.buildCardTitle || 'BUILD CARD'}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-tertiary)' }}>
          NOUSMATRIX VERIFIED AUDIT • UID {uid}
        </span>
      </div>
    </>
  );

  return (
    <div
      id="modal-trophy"
      onClick={(e) => {
        if (e.target.id === 'modal-trophy') onClose();
      }}
    >
      <div className="trophy-modal-wrapper">
        {/* Floating Top Controls Bar */}
        <div className="trophy-controls-bar">
          <div className="trophy-controls-left">
            <span className="trophy-controls-title">
              {isRu ? '🏆 БИЛД-КАРТА' : '🏆 BUILD CARD'}
            </span>
            <span className="trophy-controls-hint">
              {isRu ? 'Картинку можно скопировать кнопкой или через ПКМ' : 'Click button or right-click image to copy'}
            </span>
          </div>

          <div className="trophy-controls-actions">
            <button
              className="btn-submit trophy-action-btn copy-btn"
              onClick={handleCopyImage}
              disabled={isGenerating || isCopying}
              style={{
                background: copied ? 'var(--success)' : '',
                color: copied ? '#0C0814' : ''
              }}
            >
              {copied
                ? (isRu ? '✓ КАРТИНКА СКОПИРОВАНА!' : '✓ IMAGE COPIED!')
                : (isCopying
                  ? (isRu ? 'КОПИРОВАНИЕ...' : 'COPYING...')
                  : (isRu ? '📋 СКОПИРОВАТЬ КАРТИНКУ' : '📋 COPY IMAGE')
                )}
            </button>
            <button
              className="btn-outline trophy-action-btn download-btn"
              onClick={handleDownloadImage}
              disabled={isGenerating}
            >
              {isRu ? '💾 СКАЧАТЬ PNG' : '💾 DOWNLOAD PNG'}
            </button>
            <button className="btn-close-modal" onClick={onClose} title={isRu ? 'Закрыть' : 'Close'}>
              &times;
            </button>
          </div>
        </div>

        {/* Viewport Image Showcase or Fallback Live Card */}
        <div className="trophy-image-container">
          {isGenerating ? (
            <div className="trophy-loading-box">
              <div className="trophy-spinner"></div>
              <div className="trophy-loading-title">
                {isRu ? 'Создание билд-карты в высоком разрешении...' : 'Generating high-res build card image...'}
              </div>
              <div className="trophy-loading-desc">
                {isRu ? 'Рендеринг артефактов, характеристик и оценки' : 'Rendering stats, relics and benchmark ratings'}
              </div>
            </div>
          ) : imageSrc ? (
            <img
              src={imageSrc}
              alt={`${character.name} Build Card`}
              className="trophy-card-img"
              title={isRu ? 'ПКМ -> Копировать изображение' : 'Right-click -> Copy image'}
            />
          ) : (
            <div className="trophy-card" style={{ width: '100%', maxWidth: '1180px', margin: '0 auto' }}>
              {renderCardContent()}
            </div>
          )}
        </div>
      </div>

      {/* Hidden compilation node positioned at (0, 0) behind the backdrop with full opacity */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '1180px',
          height: 'auto',
          zIndex: -1,
          pointerEvents: 'none',
          opacity: 1,
          visibility: 'visible',
          overflow: 'hidden',
        }}
      >
        <div
          ref={cardRef}
          className="trophy-card trophy-card-render-source"
          style={{
            width: '1180px',
            minWidth: '1180px',
            maxWidth: '1180px',
            margin: 0,
            background: '#12081C',
            boxSizing: 'border-box'
          }}
        >
          {renderCardContent()}
        </div>
      </div>
    </div>
  );
}
