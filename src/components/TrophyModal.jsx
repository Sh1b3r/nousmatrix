import React, { useState } from 'react';
import { getCharHeadIcon, iconUrl } from '../utils/audit';

export default function TrophyModal({ isOpen, onClose, character, audit, uid, t }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !character || !audit) return null;

  const baseMap = {};
  (character.attributes || []).forEach(a => { baseMap[a.field] = a; });
  const addMap = {};
  (character.additions || []).forEach(a => { addMap[a.field] = a; });

  const spd = ((baseMap['spd']?.value || 100) + (addMap['spd']?.value || 0)).toFixed(1);
  const cr = (((baseMap['crit_rate']?.value || 0.05) + (addMap['crit_rate']?.value || 0)) * 100).toFixed(1) + '%';
  const cd = (((baseMap['crit_dmg']?.value || 0.50) + (addMap['crit_dmg']?.value || 0)) * 100).toFixed(1) + '%';
  const atk = Math.round((baseMap['atk']?.value || 0) + (addMap['atk']?.value || 0)).toLocaleString();

  const rankNumber = Math.max(1, Math.floor(parseFloat(audit.topPercent) * 120));

  const handleCopy = () => {
    const text = `NousMatrix // ${character.name.toUpperCase()} | TOP ${audit.topPercent}% GLOBAL | NOUS SCORE: ${audit.score} | UID: ${uid} | VERIFIED BUILD`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      id="modal-trophy"
      style={{ display: 'flex' }}
      onClick={(e) => {
        if (e.target.id === 'modal-trophy') onClose();
      }}
    >
      <div className="trophy-card">
        <button className="btn-close" onClick={onClose}>&times;</button>

        <div className="trophy-header-row">
          <div className="trophy-avatar-box">
            <img
              className="trophy-avatar-img"
              src={getCharHeadIcon(character)}
              alt={character.name}
              onError={(e) => {
                if (e.target.src !== iconUrl(character.icon)) {
                  e.target.src = iconUrl(character.icon);
                }
              }}
            />
          </div>
          <div>
            <div className="trophy-badge">{t.verifiedBadge} {audit.topPercent}% {t.verifiedSuffix}</div>
            <div className="trophy-char">{character.name.toUpperCase()}</div>
          </div>
        </div>

        <div className="trophy-rank">
          UID: {uid} // RANK #{rankNumber} OF 14,200 BUILDS
        </div>

        <div className="trophy-stats-grid">
          <div className="trophy-stat-item">
            <div className="val">{spd}</div>
            <div className="lbl">Speed</div>
          </div>
          <div className="trophy-stat-item">
            <div className="val">{cr}</div>
            <div className="lbl">Crit Rate</div>
          </div>
          <div className="trophy-stat-item">
            <div className="val">{cd}</div>
            <div className="lbl">Crit Dmg</div>
          </div>
          <div className="trophy-stat-item">
            <div className="val">{atk}</div>
            <div className="lbl">Attack</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img
              src="/media/NousMatrix-logo.png"
              alt=""
              style={{ width: '18px', height: '18px', borderRadius: '3px' }}
            />
            {t.verifiedBy}
          </span>
          <button
            className="btn-submit"
            onClick={handleCopy}
            style={{
              background: copied ? 'var(--success)' : '',
              color: copied ? '#0C0814' : ''
            }}
          >
            {copied ? t.copied : t.copyTrophy}
          </button>
        </div>
      </div>
    </div>
  );
}
