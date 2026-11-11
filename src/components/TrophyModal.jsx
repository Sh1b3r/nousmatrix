import React, { useState } from 'react';
import { getCharHeadIcon, getCharAvatarPath, iconUrl, handleImageFallback } from '../utils/audit';

export default function TrophyModal({ isOpen, onClose, character, audit, uid, t, lang = 'ru' }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !character || !audit) return null;

  const baseMap = {};
  (character.attributes || []).forEach(a => { baseMap[a.field] = a; });
  const addMap = {};
  (character.additions || []).forEach(a => { addMap[a.field] = a; });

  const getStatVal = (field) => (baseMap[field]?.value || 0) + (addMap[field]?.value || 0);

  const spd = getStatVal('spd').toFixed(1);
  const cr = (getStatVal('crit_rate') * 100).toFixed(1) + '%';
  const cd = (getStatVal('crit_dmg') * 100).toFixed(1) + '%';
  const atk = Math.round(getStatVal('atk')).toLocaleString();
  const def = Math.round(getStatVal('def')).toLocaleString();
  const hp = Math.round(getStatVal('hp')).toLocaleString();
  const be = ((addMap['break_dmg']?.value || 0) * 100).toFixed(1) + '%';
  const eres = ((addMap['effect_res']?.value || 0) * 100).toFixed(1) + '%';

  // Adaptive 4 highlight stats for the share trophy card
  let statsToShow = [
    { val: spd, lbl: t.spd },
    { val: cr, lbl: t.critRate },
    { val: cd, lbl: t.critDmg },
    { val: atk, lbl: t.atk }
  ];

  const charName = character.name || '';
  if (charName.includes('Авантюрин') || charName.includes('Aventurine') || def > 3000) {
    statsToShow = [
      { val: def, lbl: t.def },
      { val: spd, lbl: t.spd },
      { val: cr, lbl: t.critRate },
      { val: cd, lbl: t.critDmg }
    ];
  } else if (charName.includes('Светлячок') || charName.includes('Firefly') || parseFloat(be) > 180) {
    statsToShow = [
      { val: be, lbl: t.breakEffect },
      { val: spd, lbl: t.spd },
      { val: atk, lbl: t.atk },
      { val: hp, lbl: t.maxHp }
    ];
  } else if (charName.includes('Воскресенье') || charName.includes('Sunday') || charName.includes('Искорка') || charName.includes('Броня')) {
    statsToShow = [
      { val: cd, lbl: t.critDmg },
      { val: spd, lbl: t.spd },
      { val: eres, lbl: t.effectRes },
      { val: hp, lbl: t.maxHp }
    ];
  } else if (charName.includes('Блэйд') || charName.includes('Blade')) {
    statsToShow = [
      { val: hp, lbl: t.maxHp },
      { val: cr, lbl: t.critRate },
      { val: cd, lbl: t.critDmg },
      { val: spd, lbl: t.spd }
    ];
  }

  const rankNumber = Math.max(1, Math.floor(parseFloat(audit.topPercent) * 142));

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
              onError={(e) => handleImageFallback(e, getCharAvatarPath(character))}
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
          {statsToShow.map((st, i) => (
            <div key={i} className="trophy-stat-item">
              <div className="val">{st.val}</div>
              <div className="lbl">{st.lbl}</div>
            </div>
          ))}
        </div>

        <div className="trophy-card-footer">
          <span className="trophy-verified-tag">
            <img
              src="/media/NousMatrix-logo.png"
              alt=""
              className="trophy-logo-img"
            />
            {t.verifiedBy}
          </span>
          <button
            className="btn-submit trophy-copy-btn"
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
