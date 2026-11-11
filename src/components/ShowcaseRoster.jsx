import React, { useRef } from 'react';
import { getCharHeadIcon, getCharAvatarPath, iconUrl, handleImageFallback, calculateCharacterAudit } from '../utils/audit';

export default function ShowcaseRoster({ characters, activeIndex, onSelect, t, lang }) {
  const trackRef = useRef(null);

  return (
    <div className="roster-section">
      <div className="roster-header">
        <div className="roster-title">
          <span>{t.rosterTitle}</span>
          <span className="badge-count">{t.rosterCharsSuffix(characters.length)}</span>
        </div>
        <span className="roster-hint">
          {t.rosterHint}
        </span>
      </div>

      <div className="roster-track" ref={trackRef}>
        {characters.map((char, idx) => {
          const isActive = idx === activeIndex;
          const audit = calculateCharacterAudit(char, lang);

          return (
            <div
              key={char.id || idx}
              className={`roster-card ${isActive ? 'active' : ''}`}
              onClick={() => onSelect(idx)}
            >
              <div className="roster-avatar-wrap">
                <img
                  className="roster-avatar-img"
                  src={getCharHeadIcon(char)}
                  alt={char.name}
                  onError={(e) => handleImageFallback(e, getCharAvatarPath(char))}
                  loading="lazy"
                />
              </div>

              <div className="roster-char-name" title={char.name}>
                {char.name}
              </div>

              <div className="roster-char-meta">
                {t.lvl} {char.level} • E{char.rank}
              </div>

              <div className="roster-score-pill">
                TOP {audit.topPercent}% • {audit.score}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
