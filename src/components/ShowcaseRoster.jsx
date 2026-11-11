import React, { useRef } from 'react';
import { getCharHeadIcon, iconUrl, calculateCharacterAudit } from '../utils/audit';

export default function ShowcaseRoster({ characters, activeIndex, onSelect }) {
  const trackRef = useRef(null);

  return (
    <div className="roster-section">
      <div className="roster-header">
        <div className="roster-title">
          <span>ВИТРИНА АККАУНТА (SHOWCASE ROSTER)</span>
          <span className="badge-count">{characters.length} ПЕРСОНАЖ{characters.length > 4 ? 'ЕЙ' : 'А'}</span>
        </div>
        <span className="roster-hint">
          Выберите персонажа • Используйте <code>←</code> на клавиатуре для возврата
        </span>
      </div>

      <div className="roster-track" ref={trackRef}>
        {characters.map((char, idx) => {
          const isActive = idx === activeIndex;
          const audit = calculateCharacterAudit(char);

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
                Ур. {char.level} • E{char.rank}
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
