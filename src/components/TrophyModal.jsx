import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { getCharAvatarPath, getCharHeadIcon, handleImageFallback, iconUrl } from '../utils/audit';
import { runCombatSimulation } from '../utils/simulation';
import { formatStatName } from '../utils/i18n';
import { TrophyIcon, CopyIcon, DownloadIcon, CheckIcon, SparklesIcon } from './Icons.jsx';

export default function TrophyModal({ isOpen, onClose, character, audit, uid, t, lang = 'ru' }) {
  const [isCopying, setIsCopying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef(null);

  if (!isOpen || !character || !audit) return null;
  const isRu = lang === 'ru';
  const stats = audit.stats || {};
  const archetype = audit.detectedRole?.targetArchetype || 'CRIT_DPS';
  const combatSim = runCombatSimulation(character, stats, archetype, lang);

  const relics = character.relics || [];
  const slotNamesRu = ['ГОЛОВА', 'РУКИ', 'ТЕЛО', 'НОГИ', 'СФЕРА', 'ВЕРВЬ'];
  const slotNamesEn = ['HEAD', 'HANDS', 'BODY', 'FEET', 'SPHERE', 'ROPE'];

  const generateExportCanvas = async () => {
    if (!cardRef.current) return null;
    return await html2canvas(cardRef.current, {
      scale: 2.5,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#0F071A',
      logging: false,
    });
  };

  const handleCopyImage = async () => {
    try {
      setIsCopying(true);
      const canvas = await generateExportCanvas();
      if (!canvas) throw new Error('Canvas rendering failed');

      const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
      if (blob && navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } else {
        handleDownloadImage();
      }
    } catch (err) {
      console.warn('Copy failed, falling back to download:', err);
      handleDownloadImage();
    } finally {
      setIsCopying(false);
    }
  };

  const handleDownloadImage = async () => {
    try {
      setIsDownloading(true);
      const canvas = await generateExportCanvas();
      if (!canvas) return;

      const src = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `NousMatrix_${character.name.replace(/\s+/g, '_')}_UID${uid}.png`;
      link.href = src;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const renderCardBody = (isExport = false) => (
    <div className={`showcase-card ${isExport ? 'export-mode' : ''}`}>
      {/* 1. Header Banner */}
      <div className="showcase-header">
        <div className="showcase-char-identity">
          <div className="showcase-avatar-ring">
            <img
              src={getCharHeadIcon(character)}
              alt={character.name}
              className="showcase-avatar-img"
              crossOrigin="anonymous"
              onError={(e) => handleImageFallback(e, getCharAvatarPath(character))}
            />
          </div>
          <div className="showcase-name-col">
            <div className="showcase-char-title">
              <h2 className="showcase-char-name">{character.name}</h2>
              <span className="showcase-stars">{'★'.repeat(character.rarity || 5)}</span>
            </div>
            <div className="showcase-pills-row">
              <span className="showcase-pill">УР. {character.level}/80</span>
              <span className="showcase-pill accent">Э{character.rank}</span>
              <span className="showcase-pill">{character.path?.name || 'Путь'}</span>
              <span className="showcase-pill">{character.element?.name || 'Стихия'}</span>
            </div>
          </div>
        </div>

        {/* Light Cone Info */}
        {character.light_cone && (
          <div className="showcase-cone-box">
            <img
              src={iconUrl(character.light_cone.icon)}
              alt={character.light_cone.name}
              className="showcase-cone-img"
              crossOrigin="anonymous"
              onError={(e) => handleImageFallback(e, character.light_cone.icon)}
            />
            <div className="showcase-cone-meta">
              <span className="showcase-cone-name">{character.light_cone.name}</span>
              <span className="showcase-cone-sub">
                Н{character.light_cone.rank} • УР. {character.light_cone.level}/80
              </span>
            </div>
          </div>
        )}

        {/* Global Rating Score */}
        <div className="showcase-score-box">
          <div className="showcase-rank-tag">
            <TrophyIcon size={13} />
            <span>GLOBAL TOP {audit.topPercent}% VALIDATED</span>
          </div>
          <div className="showcase-score-val">
            <span className="score-num">{audit.score}</span>
            <span className="score-denom">/100</span>
          </div>
          <span className="showcase-uid">UID: {uid}</span>
        </div>
      </div>

      {/* 2. Key Combat Stats Bar (Large, High-Contrast Numbers) */}
      <div className="showcase-stats-bar">
        <div className="showcase-stat-item">
          <span className="stat-label">СКОРОСТЬ (SPD)</span>
          <span className="stat-value text-accent">{stats.spd ? stats.spd.toFixed(1) : '100.0'}</span>
          <span className="stat-sub">
            {stats.spd >= 160 ? '[160+ CAP]' : (stats.spd >= 145 ? '[145+ ZONE]' : '[134+ OK]')}
          </span>
        </div>

        <div className="showcase-stat-item">
          <span className="stat-label">КРИТМАССА (CV)</span>
          <span className="stat-value">{stats.cv ? stats.cv.toFixed(1) : '—'}</span>
          <span className="stat-sub">
            {stats.cr ? stats.cr.toFixed(1) : 0}% КШ / {stats.cd ? stats.cd.toFixed(1) : 0}% КУ
          </span>
        </div>

        <div className="showcase-stat-item">
          <span className="stat-label">АТК / HP</span>
          <span className="stat-value">
            {stats.hp > 5000 ? `${Math.round(stats.hp)} HP` : `${Math.round(stats.atk || 0)} ATK`}
          </span>
          <span className="stat-sub">ЗАЩИТА: {Math.round(stats.def || 0)} DEF</span>
        </div>

        <div className="showcase-stat-item">
          <span className="stat-label">
            {stats.be > 40 ? 'ЭФФЕКТ ПРОБИТИЯ' : (stats.ehr > 20 ? 'ШАНС ПОПАДАНИЯ (ШПЭ)' : 'ВЭ (ERR)')}
          </span>
          <span className="stat-value text-accent">
            {stats.be > 40 ? `${stats.be.toFixed(1)}%` : (stats.ehr > 20 ? `${stats.ehr.toFixed(1)}%` : `+${stats.err ? stats.err.toFixed(1) : '0'}%`)}
          </span>
          <span className="stat-sub">
            {stats.be >= 180 ? '[180% CAP]' : (stats.ehr >= 96 ? '[96% CAP]' : '[OK]')}
          </span>
        </div>
      </div>

      {/* 3. 6 Equipped Relic Slots Grid (Studio Crisp View) */}
      <div className="showcase-relics-grid">
        {Array.from({ length: 6 }).map((_, slotIdx) => {
          const slotNum = slotIdx + 1;
          const piece = relics.find(r => Number(r.type ?? r.pos) === slotNum) || relics[slotIdx];
          const slotTitle = isRu ? slotNamesRu[slotIdx] : slotNamesEn[slotIdx];

          if (!piece) {
            return (
              <div key={`relic-${slotIdx}`} className="showcase-relic-card empty">
                <span className="relic-slot-tag">{slotTitle}</span>
                <span className="relic-empty-text">Ожидает синхронизации</span>
              </div>
            );
          }

          const mainStatField = piece.main_affix?.field || '';
          const mainStatValue = piece.main_affix?.display || '';
          const mainStatName = piece.main_affix?.name || formatStatName(mainStatField, lang);

          return (
            <div key={`relic-${slotIdx}`} className="showcase-relic-card">
              <div className="relic-card-head">
                <div className="relic-slot-info">
                  <span className="relic-slot-tag">{slotTitle}</span>
                  <span className="relic-name-truncate">{piece.name || piece.set_name}</span>
                </div>
                <span className="relic-level-badge">+{piece.level || 15}</span>
              </div>

              <div className="relic-main-row">
                <span className="relic-main-name">{mainStatName}</span>
                <span className="relic-main-val text-accent">{mainStatValue}</span>
              </div>

              <div className="relic-subs-list">
                {(piece.sub_affix || []).slice(0, 4).map((sub, sIdx) => {
                  const upgrades = Math.max(0, (sub.count || 1) - 1);
                  const isKey = ['crit_rate', 'crit_dmg', 'spd'].includes(sub.field);
                  return (
                    <div key={`sub-${sIdx}`} className={`relic-sub-item ${isKey ? 'key-sub' : ''}`}>
                      <span className="sub-name">{formatStatName(sub.field, lang)}</span>
                      <span className="sub-val">
                        {sub.display}
                        <span className="sub-roll-tag">+{upgrades}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Combat Simulation & Set Bonuses Banner */}
      <div className="showcase-bottom-banner">
        <div className="bottom-col-left">
          <div className="sets-summary-row">
            {audit.cavern?.setName && (
              <span className="showcase-set-tag">
                <CheckIcon size={12} />
                <span>4/4 {audit.cavern.setName}</span>
              </span>
            )}
            {audit.planar?.setName && (
              <span className="showcase-set-tag planar">
                <CheckIcon size={12} />
                <span>2/2 {audit.planar.setName}</span>
              </span>
            )}
          </div>
          <span className="set-condition-text">
            {audit.planar?.condition || audit.cavern?.condition || 'Все бонусы комплектов активны в бою.'}
          </span>
        </div>

        {combatSim && (
          <div className="bottom-col-right">
            <div className="sim-meta-box">
              <span className="sim-tag">
                <SparklesIcon size={12} />
                <span>MOC 12 COMBAT SIM</span>
              </span>
              <span className="sim-score-text">
                {combatSim.metric1Label}: <strong>{combatSim.metric1Value}</strong>
              </span>
              <span className="sim-tier-badge">{combatSim.benchmarkTier}</span>
            </div>
          </div>
        )}
      </div>

      {/* 5. Footer Watermark */}
      <div className="showcase-footer">
        <span className="footer-brand">
          <img src="/media/NousMatrix-logo.png" alt="" className="footer-logo" />
          <span>NOUSMATRIX // MATHEMATICAL ZERO-SLOP PROFILER</span>
        </span>
        <span className="footer-meta">
          VERIFIED AUDIT • UID: {uid} • {new Date().toLocaleDateString('ru-RU')}
        </span>
      </div>
    </div>
  );

  return (
    <div
      id="modal-trophy"
      className="trophy-modal-backdrop"
      onClick={(e) => { if (e.target.id === 'modal-trophy') onClose(); }}
    >
      <div className="trophy-modal-dialog">
        {/* Controls Toolbar */}
        <div className="trophy-controls-bar">
          <div className="trophy-controls-left">
            <span className="trophy-controls-title">
              <TrophyIcon size={16} />
              <span>{isRu ? 'БИЛД-КАРТА В ВЫСОКОМ КАЧЕСТВЕ' : 'HIGH-RES BUILD CARD'}</span>
            </span>
            <span className="trophy-controls-hint">
              {isRu ? 'Чёткий рендеринг без сжатия и мыла для соцсетей' : 'Lossless studio rendering for Discord/Telegram'}
            </span>
          </div>

          <div className="trophy-controls-actions">
            <button
              className="btn-submit trophy-action-btn copy-btn"
              onClick={handleCopyImage}
              disabled={isCopying}
            >
              {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
              <span>{copied ? (isRu ? 'СКОПИРОВАНО!' : 'COPIED!') : (isCopying ? (isRu ? 'ГЕНЕРАЦИЯ...' : 'RENDERING...') : (isRu ? 'СКОПИРОВАТЬ ДЛЯ TG/DISCORD' : 'COPY FOR DISCORD/TG'))}</span>
            </button>

            <button
              className="btn-outline trophy-action-btn download-btn"
              onClick={handleDownloadImage}
              disabled={isDownloading}
            >
              <DownloadIcon size={14} />
              <span>{isDownloading ? '...' : (isRu ? 'СКАЧАТЬ PNG' : 'DOWNLOAD PNG')}</span>
            </button>

            <button className="btn-close-modal" onClick={onClose} title="Закрыть">
              &times;
            </button>
          </div>
        </div>

        {/* Live Vector Viewport Card (Razor-Sharp, Zero Blurring!) */}
        <div className="trophy-viewport-container">
          {renderCardBody(false)}
        </div>
      </div>

      {/* Hidden 1000px isolated node for studio-quality PNG export */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '1000px',
          height: 'auto',
          zIndex: -9999,
          pointerEvents: 'none',
          opacity: 1,
          overflow: 'hidden'
        }}
      >
        <div ref={cardRef} style={{ width: '1000px', background: '#0F071A' }}>
          {renderCardBody(true)}
        </div>
      </div>
    </div>
  );
}
