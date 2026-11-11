import React from 'react';
import { iconUrl } from '../utils/audit';

export default function SetBonuses({ character, t }) {
  if (!character) return null;

  const sets = character.relic_sets || [];
  if (sets.length === 0) {
    return <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{t.setsEmpty}</div>;
  }

  return (
    <div>
      {sets.map((set, i) => (
        <div key={i} className="set-box">
          <div className="set-head">
            <img className="set-icon" src={iconUrl(set.icon)} alt={set.name} />
            <span className="set-name">{set.name}</span>
            <span className="set-num-badge">{set.num} {t.pc}</span>
          </div>
          <div className="set-desc">{set.desc}</div>
        </div>
      ))}
    </div>
  );
}
