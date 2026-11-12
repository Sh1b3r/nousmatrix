import React from 'react';
import { runCombatSimulation } from '../utils/simulation.js';
import { SwordIcon, ShieldIcon, SparklesIcon, CheckIcon, WarnIcon } from './Icons.jsx';

export default function CombatSimulationCard({ character, audit, stats, lang = 'ru' }) {
  if (!character || !audit) return null;
  const isRu = lang === 'ru';
  const archetype = audit.detectedRole?.targetArchetype || 'CRIT_DPS';

  const sim = runCombatSimulation(character, stats || {}, archetype, lang);
  if (!sim) return null;

  const isDual = Boolean(sim.hasDualOutput);
  const isSupport = sim.type === 'SUPPORT' || sim.type === 'SUSTAIN' || sim.type === 'HYBRID_SUBDPS';

  const roleBadgeLabel = () => {
    if (sim.type === 'HYBRID_SUBDPS') return isRu ? 'САБ-ДПС И ПОДДЕРЖКА (SUB-DPS)' : 'HYBRID SUB-DPS & UTILITY';
    if (sim.type === 'SUPPORT') return isRu ? 'ПОДДЕРЖКА ОТРЯДА (ГАРМОНИЯ)' : 'TEAM HARMONY BUFFER';
    if (sim.type === 'SUSTAIN') return isRu ? 'ВЫЖИВАНИЕ И ЗАЩИТА (СУСТЕЙН)' : 'SUSTAIN & MITIGATION';
    return isRu ? 'ОСНОВНОЙ УРОН (ГИПЕРКЕРРИ)' : 'MAIN DAMAGE CARRY';
  };

  return (
    <div className="combat-sim-card">
      {/* 1. Header with Role & Tier */}
      <div className="combat-sim-header">
        <div className="combat-sim-title-group">
          <div className="combat-sim-badge-row">
            <span className={`combat-sim-badge ${sim.type === 'HYBRID_SUBDPS' ? 'hybrid' : isSupport ? 'support' : 'dps'}`}>
              {sim.type === 'HYBRID_SUBDPS' ? <SparklesIcon size={12} /> : isSupport ? <ShieldIcon size={12} /> : <SwordIcon size={12} />}
              <span>{roleBadgeLabel()}</span>
            </span>
            <span className="combat-sim-subtag">
              {isRu ? 'MOC 12 • БОСС 90 УР.' : 'MOC 12 • LV.90 BOSS'}
            </span>
          </div>
          <h3 className="combat-sim-heading">
            {isRu ? 'Математический расчёт боевой эффективности' : 'Mathematical Combat Performance'}
          </h3>
        </div>
        <div className="combat-sim-tier-box">
          <span className="combat-sim-tier-label">{isRu ? 'БОЕВОЙ РАНГ' : 'COMBAT TIER'}</span>
          <span className="combat-sim-tier-val">{sim.benchmarkTier}</span>
        </div>
      </div>

      {/* 2. Top-level Core 3 Metric Highlights */}
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

      {/* 3. DUAL-ROLE SUB-DPS SECTION: Personal Offensive Output */}
      {isDual && (
        <div className="combat-sim-subdps-section">
          <div className="combat-section-header">
            <span className="combat-section-icon"><SwordIcon size={13} /></span>
            <span className="combat-section-title">
              {isRu ? 'ЛИЧНЫЙ БОЕВОЙ ВКЛАД (SUB-DPS УРОН)' : 'PERSONAL COMBAT OUTPUT (SUB-DPS)'}
            </span>
          </div>
          <div className="combat-sim-metrics-grid sub-grid">
            <div className="combat-sim-metric-box sub-box">
              <span className="sim-metric-label">{sim.personalDpaLabel}</span>
              <span className="sim-metric-value highlight">{Number(sim.personalDpa).toLocaleString('ru-RU')}</span>
            </div>
            <div className="combat-sim-metric-box sub-box">
              <span className="sim-metric-label">{sim.personalDpcLabel}</span>
              <span className="sim-metric-value">{Number(sim.personalDpc).toLocaleString('ru-RU')}</span>
            </div>
            <div className="combat-sim-metric-box sub-box">
              <span className="sim-metric-label">{sim.personalMetric3Label}</span>
              <span className="sim-metric-value">{sim.personalMetric3Value}</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. TEAM UTILITY & BUFFS/DEBUFFS BREAKDOWN */}
      {sim.teamUtilityBadges && sim.teamUtilityBadges.length > 0 && (
        <div className="combat-sim-utility-section">
          <div className="combat-section-header">
            <span className="combat-section-icon"><SparklesIcon size={13} /></span>
            <span className="combat-section-title">
              {isRu ? 'КОМАНДНЫЙ ИМПАКТ (БАФФЫ, ДЕБАФФЫ И СИНЕРГИЯ)' : 'TEAM IMPACT (BUFFS, DEBUFFS & SYNERGY)'}
            </span>
            {sim.teamDpsAmp && (
              <span className="combat-amp-tag">
                {isRu ? `Усиление урона отряда: ${sim.teamDpsAmp}` : `Team Amp: ${sim.teamDpsAmp}`}
              </span>
            )}
          </div>

          <div className="combat-utility-grid">
            {sim.teamUtilityBadges.map((badge, idx) => (
              <div key={idx} className="combat-utility-item">
                <div className="utility-item-header">
                  <span className="utility-label">{badge.label}</span>
                  <span className="utility-value">{badge.value}</span>
                </div>
                <p className="utility-desc">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Summary & Methodology Footnote */}
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
