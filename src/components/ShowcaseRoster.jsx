import React, { useRef } from 'react';
import { getCharHeadIcon, iconUrl, calculateCharacterAudit } from '../utils/audit';

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
                  onError={(e) => {
                    if (e.target.src !== iconUrl(char.icon)) {
                      e.target.src = iconUrl(char.icon);
                    }
                  }}
                  loading="lazy"
                />
                {char.element && (
                  <img
                    className="roster-element-badge"
                    src={iconUrl(char.element.icon)}
                    alt={char.element.name}
                  />
                )}
                {char.path && (
                  <img
                    className="roster-path-badge"
                    src={iconUrl(char.path.icon)}
                    alt={char.path.name}
                  />
                )}
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
