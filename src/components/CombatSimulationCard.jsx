import React from 'react';
import { runCombatSimulation } from '../utils/simulation.js';
import { SwordIcon, ShieldIcon, SparklesIcon } from './Icons.jsx';

export default function CombatSimulationCard({ character, audit, stats, lang = 'ru' }) {
  if (!character || !audit) return null;
  const isRu = lang === 'ru';
  const archetype = audit.detectedRole?.targetArchetype || 'CRIT_DPS';

  const sim = runCombatSimulation(character, stats || {}, archetype, lang);
  if (!sim) return null;

  const isSupport = sim.type === 'SUPPORT' || sim.type === 'SUSTAIN';

  return (
    <div className="combat-sim-card">
      <div className="combat-sim-header">
        <div className="combat-sim-title-group">
          <span className="combat-sim-badge">
            {isSupport ? <SparklesIcon size={13} /> : <SwordIcon size={13} />}
            <span>{isRu ? 'БОЕВАЯ СИМУЛЯЦИЯ (MOC 12 BOSS)' : 'COMBAT SIMULATION (MOC 12 BOSS)'}</span>
          </span>
          <h3 className="combat-sim-heading">
            {isRu ? 'Математический расчёт боевой эффективности' : 'Mathematical Combat Performance'}
          </h3>
        </div>
        <div className="combat-sim-tier-box">
          <span className="combat-sim-tier-label">{isRu ? 'БОЕВОЙ РАНГ' : 'COMBAT TIER'}</span>
          <span className="combat-sim-tier-val">{sim.benchmarkTier}</span>
        </div>
      </div>

      <div className="combat-sim-metrics-grid">
        <div className="combat-sim-metric-box">
          <span className="sim-metric-label">{sim.metric1Label}</span>
          <span className="sim-metric-value text-accent">{sim.metric1Value}</span>
        </div>

        <div className="combat-sim-metric-box">
          <span className="sim-metric-label">{sim.metric2Label}</span>
          <span className="sim-metric-value">{sim.metric2Value}</span>
        </div>

        <div className="combat-sim-metric-box">
          <span className="sim-metric-label">{sim.metric3Label}</span>
          <span className="sim-metric-value">{sim.metric3Value}</span>
        </div>
      </div>

      <div className="combat-sim-summary">
        <p className="sim-summary-text">
          {isRu ? sim.summaryRu : sim.summaryEn}
        </p>
        <span className="sim-footnote">
          {isRu
            ? 'Параметры симуляции: босс 90 уровня (MoC 12 / Апокалипсис), фактор брони 1100, базовая устойчивость 20% RES, окно хода 100 AV (150 AV в цикле 0).'
            : 'Simulation parameters: Lv. 90 Boss (MoC 12 / Apocalyptic Shadow), 1100 DEF factor, 20% Base RES, 100 AV turn window (150 AV in Cycle 0).'}
        </span>
      </div>
    </div>
  );
}
