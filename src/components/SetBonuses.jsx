import React from 'react';
import { iconUrl } from '../utils/audit';
import { SET_DEFINITIONS, resolveRelicSetInfo } from '../utils/setDefinitions.js';

export default function SetBonuses({ character, t, lang = 'ru' }) {
  if (!character) return null;
  const isRu = (lang || (t?.lvl === 'Ур.' ? 'ru' : 'en')) === 'ru';

  const rawSets = character.relic_sets || [];
  const relics = character.relics || [];

  // Group relics by set info to detect equipped 2-Pc or 4-Pc sets
  const setCounts = {};
  relics.forEach((r) => {
    const info = resolveRelicSetInfo(r, isRu ? 'ru' : 'en');
    const key = info?.def?.ids?.[0] || info?.name || r.set_id || r.set_name || 'unknown';
    if (!setCounts[key]) {
      setCounts[key] = {
        key,
        name: info?.name || r.set_name || (isRu ? 'Неизвестный сет' : 'Unknown Set'),
        def: info?.def,
        icon: info?.icon || r.icon,
        count: 0
      };
    }
    setCounts[key].count += 1;
  });

  // Synthesize bonuses for sets with >= 2 pieces
  const synthesizedSets = [];
  Object.values(setCounts).forEach((sc) => {
    if (sc.count >= 2) {
      // Check 2-Pc
      const desc2 = isRu ? (sc.def?.desc2Ru || 'Бонус 2 предметов активен.') : (sc.def?.desc2En || '2-Pc set bonus active.');
      synthesizedSets.push({
        name: sc.name,
        num: 2,
        icon: sc.icon,
        desc: desc2,
        key: `${sc.key}-2`
      });
    }
    if (sc.count >= 4) {
      // Check 4-Pc
      const desc4 = isRu ? (sc.def?.desc4Ru || 'Полный бонус 4 предметов активен.') : (sc.def?.desc4En || '4-Pc full set bonus active.');
      synthesizedSets.push({
        name: sc.name,
        num: 4,
        icon: sc.icon,
        desc: desc4,
        key: `${sc.key}-4`
      });
    }
  });

  // Combine raw sets with synthesized sets, avoiding duplicates
  const finalSets = [];
  const seenKeys = new Set();

  rawSets.forEach((s) => {
    const sName = (s.name || '').trim().toLowerCase();
    if (sName) {
      const key = `${sName}-${s.num}`;
      seenKeys.add(key);
      finalSets.push(s);
    }
  });

  synthesizedSets.forEach((s) => {
    const sName = (s.name || '').trim().toLowerCase();
    if (!sName) return;
    const key = `${sName}-${s.num}`;
    // Also check if any raw set already covers this set name
    const alreadyPresent = Array.from(seenKeys).some(k => k && (k.startsWith(sName) || k.includes(sName)));
    if (!alreadyPresent) {
      seenKeys.add(key);
      finalSets.push(s);
    }
  });

  if (finalSets.length === 0) {
    return <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{t.setsEmpty}</div>;
  }

  return (
    <div>
      {finalSets.map((set, i) => (
        <div key={i} className="set-box">
          <div className="set-head">
            <img className="set-icon" src={iconUrl(set.icon)} alt={set.name} />
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
