import React from 'react';
import { iconUrl } from '../utils/audit';

export default function CombatStats({ character, t }) {
  if (!character) return null;

  const baseMap = {};
  (character.attributes || []).forEach(a => { baseMap[a.field] = a; });

  const addMap = {};
  (character.additions || []).forEach(a => { addMap[a.field] = a; });

  // 1. HP
  const hpBase = baseMap['hp'] ? Math.round(baseMap['hp'].value) : 0;
  const hpAdd = addMap['hp'] ? Math.round(addMap['hp'].value) : 0;
  const hpTotal = hpBase + hpAdd;

  // 2. ATK
  const atkBase = baseMap['atk'] ? Math.round(baseMap['atk'].value) : 0;
  const atkAdd = addMap['atk'] ? Math.round(addMap['atk'].value) : 0;
  const atkTotal = atkBase + atkAdd;

  // 3. DEF
  const defBase = baseMap['def'] ? Math.round(baseMap['def'].value) : 0;
  const defAdd = addMap['def'] ? Math.round(addMap['def'].value) : 0;
  const defTotal = defBase + defAdd;

  // 4. SPD
  const spdBase = baseMap['spd'] ? Number(baseMap['spd'].value).toFixed(1) : '100.0';
  const spdAdd = addMap['spd'] ? Number(addMap['spd'].value).toFixed(1) : '0.0';
  const spdTotal = (parseFloat(spdBase) + parseFloat(spdAdd)).toFixed(1);

  // 5. Crit Rate
  const crBase = baseMap['crit_rate'] ? (baseMap['crit_rate'].value * 100) : 5.0;
  const crAdd = addMap['crit_rate'] ? (addMap['crit_rate'].value * 100) : 0.0;
  const crTotal = (crBase + crAdd).toFixed(1) + '%';

  // 6. Crit DMG
  const cdBase = baseMap['crit_dmg'] ? (baseMap['crit_dmg'].value * 100) : 50.0;
  const cdAdd = addMap['crit_dmg'] ? (addMap['crit_dmg'].value * 100) : 0.0;
  const cdTotal = (cdBase + cdAdd).toFixed(1) + '%';

  // 7. Break Effect
  const beTotal = addMap['break_dmg'] ? (addMap['break_dmg'].value * 100).toFixed(1) + '%' : null;

  // 8. Element DMG
  const elementFields = [
    { field: 'physical_dmg', icon: 'icon/property/IconPhysicalAddedRatio.png', defaultName: 'Physical DMG' },
    { field: 'fire_dmg', icon: 'icon/property/IconFireAddedRatio.png', defaultName: 'Fire DMG' },
    { field: 'ice_dmg', icon: 'icon/property/IconIceAddedRatio.png', defaultName: 'Ice DMG' },
    { field: 'thunder_dmg', icon: 'icon/property/IconThunderAddedRatio.png', defaultName: 'Lightning DMG' },
    { field: 'wind_dmg', icon: 'icon/property/IconWindAddedRatio.png', defaultName: 'Wind DMG' },
    { field: 'quantum_dmg', icon: 'icon/property/IconQuantumAddedRatio.png', defaultName: 'Quantum DMG' },
    { field: 'imaginary_dmg', icon: 'icon/property/IconImaginaryAddedRatio.png', defaultName: 'Imaginary DMG' }
  ];

  const activeElementDmgs = elementFields.filter(el => addMap[el.field] && addMap[el.field].value > 0);

  // 9. ERR
  const errTotal = addMap['sp_rate'] ? (100 + addMap['sp_rate'].value * 100).toFixed(1) + '%' : null;

  // 10. EHR
  const ehrTotal = addMap['effect_hit'] && addMap['effect_hit'].value > 0 ? (addMap['effect_hit'].value * 100).toFixed(1) + '%' : null;

  // 11. Effect RES
  const resTotal = addMap['effect_res'] && addMap['effect_res'].value > 0 ? (addMap['effect_res'].value * 100).toFixed(1) + '%' : null;

  return (
    <div className="combat-stat-table">
      {/* HP */}
      <div className="stat-entry">
        <div className="stat-left">
          <img className="stat-icon" src={iconUrl('icon/property/IconMaxHP.png')} alt="HP" />
          <span className="stat-name">{t.maxHp}</span>
        </div>
        <div className="stat-values">
          <span className="stat-calc">{hpBase} <span className="stat-bonus">+{hpAdd}</span> =</span>
          <span className="stat-total">{hpTotal.toLocaleString()}</span>
        </div>
      </div>

      {/* ATK */}
      <div className="stat-entry">
        <div className="stat-left">
          <img className="stat-icon" src={iconUrl('icon/property/IconAttack.png')} alt="ATK" />
          <span className="stat-name">{t.atk}</span>
        </div>
        <div className="stat-values">
          <span className="stat-calc">{atkBase} <span className="stat-bonus">+{atkAdd}</span> =</span>
          <span className="stat-total">{atkTotal.toLocaleString()}</span>
        </div>
      </div>

      {/* DEF */}
      <div className="stat-entry">
        <div className="stat-left">
          <img className="stat-icon" src={iconUrl('icon/property/IconDefence.png')} alt="DEF" />
          <span className="stat-name">{t.def}</span>
        </div>
        <div className="stat-values">
          <span className="stat-calc">{defBase} <span className="stat-bonus">+{defAdd}</span> =</span>
          <span className="stat-total">{defTotal.toLocaleString()}</span>
        </div>
      </div>

      {/* SPD */}
      <div className="stat-entry">
        <div className="stat-left">
          <img className="stat-icon" src={iconUrl('icon/property/IconSpeed.png')} alt="SPD" />
          <span className="stat-name">{t.spd}</span>
        </div>
        <div className="stat-values">
          <span className="stat-calc">{spdBase} <span className="stat-bonus">+{spdAdd}</span> =</span>
          <span className="stat-total">{spdTotal}</span>
        </div>
      </div>

      {/* CRIT RATE */}
      <div className="stat-entry">
        <div className="stat-left">
          <img className="stat-icon" src={iconUrl('icon/property/IconCriticalChance.png')} alt="CR" />
          <span className="stat-name">{t.critRate}</span>
        </div>
        <div className="stat-values">
          <span className="stat-total">{crTotal}</span>
        </div>
      </div>

      {/* CRIT DMG */}
      <div className="stat-entry">
        <div className="stat-left">
          <img className="stat-icon" src={iconUrl('icon/property/IconCriticalDamage.png')} alt="CD" />
          <span className="stat-name">{t.critDmg}</span>
        </div>
        <div className="stat-values">
          <span className="stat-total">{cdTotal}</span>
        </div>
      </div>

      {/* BREAK EFFECT */}
      {beTotal && (
        <div className="stat-entry">
          <div className="stat-left">
            <img className="stat-icon" src={iconUrl('icon/property/IconBreakUp.png')} alt="BE" />
            <span className="stat-name">{t.breakEffect}</span>
          </div>
          <div className="stat-values">
            <span className="stat-total">{beTotal}</span>
          </div>
        </div>
      )}

      {/* ELEMENTAL DMG */}
      {activeElementDmgs.map((el, i) => (
        <div className="stat-entry" key={i}>
          <div className="stat-left">
            <img className="stat-icon" src={iconUrl(el.icon)} alt={el.defaultName} />
            <span className="stat-name">{addMap[el.field].name || el.defaultName}</span>
          </div>
          <div className="stat-values">
            <span className="stat-total">{(addMap[el.field].value * 100).toFixed(1)}%</span>
          </div>
        </div>
      ))}

      {/* ERR */}
      {errTotal && (
        <div className="stat-entry">
          <div className="stat-left">
            <img className="stat-icon" src={iconUrl('icon/property/IconEnergyRecovery.png')} alt="ERR" />
            <span className="stat-name">{t.err}</span>
          </div>
          <div className="stat-values">
            <span className="stat-total">{errTotal}</span>
          </div>
        </div>
      )}

      {/* EHR */}
      {ehrTotal && (
        <div className="stat-entry">
          <div className="stat-left">
            <img className="stat-icon" src={iconUrl('icon/property/IconStatusProbability.png')} alt="EHR" />
            <span className="stat-name">{t.ehr}</span>
          </div>
          <div className="stat-values">
            <span className="stat-total">{ehrTotal}</span>
          </div>
        </div>
      )}

      {/* RES */}
      {resTotal && (
        <div className="stat-entry">
          <div className="stat-left">
            <img className="stat-icon" src={iconUrl('icon/property/IconStatusResistance.png')} alt="RES" />
            <span className="stat-name">{t.effectRes}</span>
          </div>
          <div className="stat-values">
            <span className="stat-total">{resTotal}</span>
          </div>
        </div>
      )}
    </div>
  );
}
