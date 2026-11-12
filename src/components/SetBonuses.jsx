import React from 'react';
import { iconUrl } from '../utils/audit';
import { SET_DEFINITIONS, resolveRelicSetInfo } from '../utils/setDefinitions.js';

export default function SetBonuses({ character, t, lang = 'ru' }) {
  if (!character) return null;
  const isRu = (lang || (t?.lvl === 'Ур.' ? 'ru' : 'en')) === 'ru';

  const rawSets = character.relic_sets || [];
  const relics = character.relics || [];

  // 1. If character has equipped relics, compute sets strictly from the 6 slots
  // This guarantees that ghost/phantom sets (like fake 8-piece combos) can NEVER appear
  const finalSets = [];

  if (relics.length > 0) {
    // Group relics by resolved set
    const setCounts = {};
    relics.forEach((r) => {
      const info = resolveRelicSetInfo(r, isRu ? 'ru' : 'en');
      const setId = info?.def?.id || r.set_id || 'unknown';
      if (!setCounts[setId]) {
        setCounts[setId] = {
          id: setId,
          name: info?.name || r.set_name || (isRu ? 'Неизвестный сет' : 'Unknown Set'),
          def: info?.def,
          icon: info?.icon || r.icon,
          isPlanar: info?.def ? info.def.isPlanar : (r.type >= 5 || parseInt(setId) >= 300),
          count: 0
        };
      }
      setCounts[setId].count += 1;
    });

    // Add active 2-Pc and 4-Pc bonuses
    Object.values(setCounts).forEach((sc) => {
      if (sc.count >= 2) {
        const desc2 = isRu
          ? (sc.def?.desc2Ru || 'Бонус 2 предметов активен.')
          : (sc.def?.desc2En || '2-Pc set bonus active.');
        finalSets.push({
          name: sc.name,
          num: 2,
          icon: sc.icon,
          desc: desc2,
          key: `${sc.id}-2`
        });
      }
      if (sc.count >= 4) {
        const desc4 = isRu
          ? (sc.def?.desc4Ru || 'Полный бонус 4 предметов активен.')
          : (sc.def?.desc4En || '4-Pc full set bonus active.');
        finalSets.push({
          name: sc.name,
          num: 4,
          icon: sc.icon,
          desc: desc4,
          key: `${sc.id}-4`
        });
      }
    });
  } else if (rawSets.length > 0) {
    // Fallback to rawSets only if character has no relics array
    rawSets.forEach((s) => {
      finalSets.push(s);
    });
  }

  if (finalSets.length === 0) {
    return <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{t.setsEmpty}</div>;
  }

  return (
    <div>
      {finalSets.map((set, i) => (
        <div key={i} className="set-box">
          <div className="set-head">
            <img className="set-icon" src={iconUrl(set.icon)} alt={set.name} crossOrigin="anonymous" />
            <span className="set-name">{set.name}</span>
            <span className="set-num-badge">
              {set.num === 2 ? t.pc2 : (set.num === 4 ? t.pc4 : `${set.num} ${t.pc}`)}
            </span>
          </div>
          <div className="set-desc">{set.desc}</div>
        </div>
      ))}
    </div>
  );
}
