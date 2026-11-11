import React from 'react';
import { getCharHeadIcon, iconUrl } from '../utils/audit';

export default function CharacterOverview({ character }) {
  if (!character) return null;

  const mainSkills = (character.skills || []).filter(s =>
    ['Normal', 'BPSkill', 'Ultra', 'Talent'].includes(s.type)
  );

  return (
    <div className="char-hero-card">
      <div className="char-hero-left">
        <div className="char-portrait-box">
          <img
            className="char-portrait-img"
            src={getCharHeadIcon(character)}
            alt={character.name}
            onError={(e) => {
              if (e.target.src !== iconUrl(character.icon)) {
                e.target.src = iconUrl(character.icon);
              }
            }}
          />
          {character.element && (
            <img
              className="char-portrait-element"
              src={iconUrl(character.element.icon)}
              alt={character.element.name}
            />
          )}
        </div>

        <div className="char-details-primary">
          <h2>
            <span>{character.name}</span>
            <span className="char-stars">{'★'.repeat(character.rarity || 5)}</span>
          </h2>

          <div className="char-tags-row">
            <span className="char-pill">Ур. {character.level}/80</span>
            <span className="char-pill accent">Эйдолоны: E{character.rank}</span>
            <span className="char-pill">Путь: {character.path?.name || '—'}</span>
            <span className="char-pill">Стихия: {character.element?.name || '—'}</span>
          </div>

          <div className="char-skills-row">
            {mainSkills.map((s) => (
              <div
                key={s.id}
                className="skill-item"
                title={`${s.type_text}: ${s.name} (Ур. ${s.level}/${s.max_level})`}
              >
                <img className="skill-icon" src={iconUrl(s.icon)} alt={s.name} />
                <span className="skill-lvl">{s.level}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {character.light_cone && (
        <div className="lightcone-box">
          <img
            className="cone-img"
            src={iconUrl(character.light_cone.icon)}
            alt={character.light_cone.name}
          />
          <div className="cone-info">
            <div className="cone-name">{character.light_cone.name}</div>
            <div className="cone-super">
              Наложение S{character.light_cone.rank} ({'★'.repeat(character.light_cone.rarity || 5)})
            </div>
            <div className="cone-level">Ур. {character.light_cone.level}/80</div>
            <div className="cone-stats">
              {(character.light_cone.attributes || []).map((a, i) => (
                <span key={i}>
                  {a.name.replace('Базовая ', '').replace('Базовое ', '')}: {a.display}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
