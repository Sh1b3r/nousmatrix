import React from 'react';
import { getCharHeadIcon, iconUrl, handleImageFallback } from '../utils/audit';

export default function CharacterOverview({ character, t, lang = 'ru' }) {
  if (!character) return null;
  const isRu = lang === 'ru';

  // 1. Core Combat Skills (Normal, Skill, Ultimate, Talent, Technique)
  const coreSkills = (character.skills || []).filter(s =>
    ['Normal', 'BPSkill', 'Ultra', 'Talent', 'Maze'].includes(s.type)
  );

  // 2. Major Traces (A2, A4, A6 Ascension passives)
  const majorTraces = (character.skill_trees || []).filter(tr =>
    ['Point06', 'Point07', 'Point08'].includes(tr.anchor)
  );

  const getSkillTypeShort = (type) => {
    switch (type) {
      case 'Normal': return isRu ? 'АТАКА' : 'BASIC';
      case 'BPSkill': return isRu ? 'НАВЫК' : 'SKILL';
      case 'Ultra': return isRu ? 'УЛЬТ' : 'ULT';
      case 'Talent': return isRu ? 'ТАЛАНТ' : 'TALENT';
      case 'Maze': return isRu ? 'ТЕХНИКА' : 'TECH';
      default: return type;
    }
  };

  const getTraceLabel = (anchor) => {
    if (anchor === 'Point06') return 'A2';
    if (anchor === 'Point07') return 'A4';
    if (anchor === 'Point08') return 'A6';
    return isRu ? 'СЛЕД' : 'TRACE';
  };

  const portraitSrc = character.portrait
    ? iconUrl(character.portrait)
    : (character.preview ? iconUrl(character.preview) : getCharHeadIcon(character));

  return (
    <div className="char-hero-card">
      <div className="char-hero-left">
        <div className="char-portrait-box">
          <img
            className="char-portrait-img"
            src={portraitSrc}
            alt={character.name}
            onError={(e) => {
              if (e.target.src !== getCharHeadIcon(character)) {
                e.target.src = getCharHeadIcon(character);
              }
            }}
          />
          {character.element && (
            <img
              className="char-portrait-element"
              src={iconUrl(character.element.icon)}
              alt={character.element.name}
              title={character.element.name}
            />
          )}
        </div>

        <div className="char-details-primary">
          <h2>
            <span>{character.name}</span>
            <span className="char-stars">{'★'.repeat(character.rarity || 5)}</span>
          </h2>

          <div className="char-tags-row">
            <span className="char-pill">{t.lvl} {character.level}/80</span>
            <span className="char-pill accent">{t.eidolons}{character.rank}</span>
            <span className="char-pill">{t.path}{character.path?.name || '—'}</span>
            <span className="char-pill">{t.combatType}{character.element?.name || '—'}</span>
          </div>

          {/* Full Skills & Ascension Traces Row */}
          <div className="char-skills-row">
            {/* 5 Core Skills */}
            {coreSkills.map((s) => (
              <div
                key={s.id}
                className="skill-item"
                title={`${s.type_text || s.type}: ${s.name}\n${s.simple_desc || s.desc || ''}\n(${t.lvl} ${s.level}/${s.max_level})`}
              >
                <div className="skill-icon-wrap">
                  <img
                    className="skill-icon"
                    src={iconUrl(s.icon)}
                    alt={s.name}
                    onError={(e) => handleImageFallback(e, s.icon)}
                  />
                  <span className="skill-lvl-badge">{s.level}</span>
                </div>
                <span className="skill-name-label">{getSkillTypeShort(s.type)}</span>
              </div>
            ))}

            {/* 3 Major Ascension Traces (A2, A4, A6) */}
            {majorTraces.map((tr) => (
              <div
                key={tr.id}
                className={`skill-item trace-item ${tr.level > 0 ? 'unlocked' : 'locked'}`}
                title={`${getTraceLabel(tr.anchor)}: ${isRu ? 'Ключевой след возвышения' : 'Major Ascension Trace'} (${tr.level > 0 ? (isRu ? 'Разблокирован' : 'Unlocked') : (isRu ? 'Заблокирован' : 'Locked')})`}
              >
                <div className="skill-icon-wrap">
                  <img
                    className="skill-icon"
                    src={iconUrl(tr.icon)}
                    alt={tr.anchor}
                    onError={(e) => handleImageFallback(e, tr.icon)}
                  />
                  <span className="skill-lvl-badge trace">{getTraceLabel(tr.anchor)}</span>
                </div>
                <span className="skill-name-label">{getTraceLabel(tr.anchor)}</span>
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
            onError={(e) => handleImageFallback(e, character.light_cone.icon)}
          />
          <div className="cone-info">
            <div className="cone-name">{character.light_cone.name}</div>
            <div className="cone-super">
              {t.superimposition}{character.light_cone.rank} ({'★'.repeat(character.light_cone.rarity || 5)})
            </div>
            <div className="cone-level">{t.lvl} {character.light_cone.level}/80</div>
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
