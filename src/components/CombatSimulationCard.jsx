import React, { useState, useMemo } from 'react';
import { runCombatSimulation } from '../utils/simulation.js';
import { CHARACTER_SQUADS, getGenericSquads, matchSquadWithShowcase } from '../utils/teamSynergy.js';
import { runFullTeamRotationSimulation } from '../utils/rotationSimulation.js';
import { iconUrl, handleImageFallback } from '../utils/audit.js';
import { SwordIcon, ShieldIcon, SparklesIcon, CheckIcon, WarnIcon } from './Icons.jsx';

export default function CombatSimulationCard({ character, audit, stats, showcase = [], lang = 'ru' }) {
  if (!character || !audit) return null;
  const isRu = lang === 'ru';
  const archetype = audit.detectedRole?.targetArchetype || 'CRIT_DPS';

  // 1. Squad archetypes for this character
  const charId = String(character.id || '');
  const squads = useMemo(() => {
    return CHARACTER_SQUADS[charId] || getGenericSquads(character, lang);
  }, [charId, character, lang]);

  const [selectedSquadIdx, setSelectedSquadIdx] = useState(0);
  const currentSquad = squads[selectedSquadIdx] || squads[0];

  // 2. Match current squad teammates against player's showcase
  const matchedTeammates = useMemo(() => {
    return matchSquadWithShowcase(currentSquad, showcase, lang);
  }, [currentSquad, showcase, lang]);

  const missingTeammates = useMemo(() => {
    return matchedTeammates.filter(tm => !tm.isEquippedInShowcase);
  }, [matchedTeammates]);

  // 3. Full Team Chronological Rotation Simulation
  const rotationSim = useMemo(() => {
    return runFullTeamRotationSimulation(character, stats || {}, currentSquad, matchedTeammates, lang);
  }, [character, stats, currentSquad, matchedTeammates, lang]);

  // 4. Standalone simulation (benchmark tier and single-character metrics)
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

  const getTeammateAvatarUrl = (tm) => {
    if (tm.matchedChar?.avatar?.icon) return iconUrl(tm.matchedChar.avatar.icon);
    if (tm.matchedChar?.icon) return iconUrl(tm.matchedChar.icon);
    if (tm.icon) return iconUrl(tm.icon);
    if (tm.id) return iconUrl(`icon/character/${tm.id}.png`);
    return null;
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
            {isRu ? 'Боевая симуляция ротации отряда' : 'Full Team Rotation Combat Simulation'}
          </h3>
        </div>
        <div className="combat-sim-tier-box">
          <span className="combat-sim-tier-label">{isRu ? 'БОЕВОЙ РАНГ' : 'COMBAT TIER'}</span>
          <span className="combat-sim-tier-val">{sim.benchmarkTier}</span>
        </div>
      </div>

      {/* 2. SQUAD SELECTOR TABS (Отряд 1 / Отряд 2) */}
      <div className="combat-squad-section">
        <div className="combat-squad-nav">
          <div className="squad-tabs-list">
            {squads.map((sq, idx) => (
              <button
                key={sq.id || idx}
                className={`squad-tab-btn ${selectedSquadIdx === idx ? 'active' : ''}`}
                onClick={() => setSelectedSquadIdx(idx)}
              >
                <span className="squad-tab-number">{idx + 1}</span>
                <span className="squad-tab-title">{isRu ? sq.nameRu : sq.nameEn}</span>
              </button>
            ))}
          </div>
        </div>

        <p className="combat-squad-desc">
          {isRu ? currentSquad.descRu : currentSquad.descEn}
        </p>

        {/* 3. SHOWCASE STATUS BANNER (Предупреждение о смене витрины для точного расчета) */}
        {missingTeammates.length > 0 ? (
          <div className="squad-showcase-alert warning">
            <div className="alert-icon-col">
              <WarnIcon size={16} />
            </div>
            <div className="alert-body-col">
              <span className="alert-title">
                {isRu
                  ? `Внимание: ${missingTeammates.length} из 3 союзников не найдены на витрине аккаунта`
                  : `Notice: ${missingTeammates.length} of 3 teammates missing from showcase`}
              </span>
              <p className="alert-text">
                {isRu
                  ? `Для расчёта точного командного урона до единицы поставьте [${missingTeammates.map(m => m.nameRu || m.characterName || m.names[0]).join(', ')}] на витрину профиля в игре и нажмите кнопку «ОБНОВИТЬ» вверху сайта. Сейчас для них применены базовые софт-капы следов.`
                  : `To calculate exact team damage down to the single digit, place [${missingTeammates.map(m => m.nameEn || m.characterName || m.names[0]).join(', ')}] on your in-game showcase and click REFRESH. Currently, baseline trace soft-caps are used.`}
              </p>
            </div>
          </div>
        ) : (
          <div className="squad-showcase-alert success">
            <div className="alert-icon-col">
              <CheckIcon size={16} />
            </div>
            <div className="alert-body-col">
              <span className="alert-title">
                {isRu
                  ? 'Все союзники отряда найдены на вашей витрине!'
                  : 'All squad teammates verified on your showcase!'}
              </span>
              <p className="alert-text">
                {isRu
                  ? 'Расчёт урона ротации выполнен с учётом РЕАЛЬНЫХ характеристик их снаряжения (КУ Sunday, ATK Robin, ЭП Жуань Мэй и т.д.) с точностью до единицы.'
                  : 'Rotation damage is computed directly using their REAL equipped stats with 100% precision.'}
              </p>
            </div>
          </div>
        )}

        {/* 4. TEAMMATES ROSTER CARDS */}
        <div className="squad-teammates-grid">
          {matchedTeammates.map((tm, tIdx) => {
            const avatarUrl = getTeammateAvatarUrl(tm);
            const tmName = tm.matchedChar?.name || (isRu ? tm.nameRu || tm.names[0] : tm.nameEn || tm.names[1] || tm.names[0]);
            const isEquipped = Boolean(tm.isEquippedInShowcase);

            return (
              <div key={tIdx} className={`teammate-card ${isEquipped ? 'equipped' : 'missing'}`}>
                <div className="teammate-top">
                  <div className="teammate-avatar-wrap">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={tmName}
                        className="teammate-avatar-img"
                        onError={(e) => handleImageFallback(e, 'avatar')}
                      />
                    ) : (
                      <div className="teammate-avatar-placeholder">?</div>
                    )}
                  </div>
                  <div className="teammate-meta">
                    <span className="teammate-name">{tmName}</span>
                    <span className="teammate-role">{isRu ? tm.roleRu : tm.roleEn}</span>
                  </div>
                </div>

                <div className="teammate-status-row">
                  {isEquipped ? (
                    <span className="teammate-badge status-on">
                      <CheckIcon size={11} />
                      <span>{isRu ? 'НА ВИТРИНЕ' : 'ON SHOWCASE'}</span>
                    </span>
                  ) : (
                    <span className="teammate-badge status-off">
                      <WarnIcon size={11} />
                      <span>{isRu ? 'НЕ НА ВИТРИНЕ' : 'NOT ON SHOWCASE'}</span>
                    </span>
                  )}
                  {isEquipped && tm.realStats && (
                    <span className="teammate-stat-pill">
                      {tm.realStats.cd > 50 && `${tm.realStats.cd}% КУ`}
                      {tm.realStats.atk > 2500 && `${tm.realStats.atk} ATK`}
                      {tm.realStats.be > 80 && `${tm.realStats.be}% ЭП`}
                      {tm.realStats.def > 2500 && `${tm.realStats.def} DEF`}
                    </span>
                  )}
                </div>

                <p className="teammate-buff-desc">
                  {isRu ? tm.dynamicBuffDescRu : tm.dynamicBuffDescEn}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. ROTATION DAMAGE HEADLINE NUMBERS */}
      {rotationSim && (
        <div className="combat-sim-metrics-grid rotation-metrics">
          <div className="combat-sim-metric-box highlight-box">
            <span className="sim-metric-label">
              {isRu ? 'СУММАРНЫЙ УРОН РОТАЦИИ' : 'FULL ROTATION TOTAL DMG'}
            </span>
            <span className="sim-metric-value text-accent big">
              {Number(rotationSim.rotationTotalDamage || 0).toLocaleString('ru-RU')}
            </span>
            <span className="sim-metric-hint">
              {isRu ? 'За полный цикл всех 4 союзников' : 'Full 4-unit sequence'}
            </span>
          </div>

          <div className="combat-sim-metric-box">
            <span className="sim-metric-label">
              {isRu ? 'ПИКОВЫЙ УДАР ПОД БАФФАМИ' : 'PEAK BUFFED BURST HIT'}
            </span>
            <span className="sim-metric-value">
              {Number(rotationSim.peakHitDamage || 0).toLocaleString('ru-RU')}
            </span>
            <span className="sim-metric-hint">
              {isRu ? 'Главный ультимейт / взрыв' : 'Max single ability impact'}
            </span>
          </div>

          <div className="combat-sim-metric-box">
            <span className="sim-metric-label">
              {isRu ? 'DPS ЗА ЦИКЛ 100 AV' : 'CYCLE DPS (100 AV)'}
            </span>
            <span className="sim-metric-value">
              {Number(rotationSim.teamCycleDps || 0).toLocaleString('ru-RU')}
            </span>
            <span className="sim-metric-hint">
              {isRu ? 'Скорость закрытия волн MoC' : 'Wave clear tempo'}
            </span>
          </div>
        </div>
      )}

      {/* 6. CHRONOLOGICAL ACTION TIMELINE (Последовательность кнопок всего отряда) */}
      {rotationSim && rotationSim.steps && rotationSim.steps.length > 0 && (
        <div className="combat-rotation-timeline-section">
          <div className="combat-section-header">
            <span className="combat-section-icon"><SwordIcon size={13} /></span>
            <span className="combat-section-title">
              {isRu
                ? 'ХРОНОЛОГИЧЕСКАЯ ПОСЛЕДОВАТЕЛЬНОСТЬ ДЕЙСТВИЙ И КНОПОК'
                : 'CHRONOLOGICAL ROTATION SEQUENCE & DAMAGE BREAKDOWN'}
            </span>
          </div>

          <div className="rotation-steps-list">
            {rotationSim.steps.map((st, sIdx) => {
              const isDmg = Boolean(st.isDamageAction);
              return (
                <div key={sIdx} className={`rotation-step-item ${isDmg ? 'dmg-step' : 'buff-step'}`}>
                  <div className="step-num-col">
                    <span className="step-num-badge">#{st.stepNumber}</span>
                  </div>

                  <div className="step-main-col">
                    <div className="step-top-line">
                      <span className="step-phase-tag">{st.phase}</span>
                      <span className="step-actor-name">{st.charName}</span>
                    </div>
                    <div className="step-action-title">
                      {isRu ? st.actionNameRu : st.actionNameEn}
                    </div>
                    <p className="step-action-desc">
                      {isRu ? st.descRu : st.descEn}
                    </p>
                  </div>

                  <div className="step-dmg-col">
                    {isDmg ? (
                      <div className="step-dmg-val-box">
                        <span className="step-dmg-number">{Number(st.damage).toLocaleString('ru-RU')}</span>
                        <span className="step-dmg-label">{isRu ? 'ЕД. УРОНА' : 'DMG'}</span>
                      </div>
                    ) : (
                      <span className="step-buff-applied">
                        {isRu ? '✓ БАФФ АКТИВИРОВАН' : '✓ BUFF ACTIVE'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. DUAL-ROLE SUB-DPS SECTION: Personal Offensive Output (for Welt, Mortenax, etc.) */}
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

      {/* 8. Summary & Methodology Footnote */}
      <div className="combat-sim-summary">
        <p className="sim-summary-text">
          {isRu ? sim.summaryRu : sim.summaryEn}
        </p>
        <span className="sim-footnote">
          {isRu
            ? 'Параметры симуляции: босс 90 уровня (MoC 12 / Апокалипсис), фактор брони 1100, базовая устойчивость 20% RES, окно хода 100 AV (150 AV в цикле 0). Для включения реальных характеристик саппортов выставите их на витрину в игре.'
            : 'Simulation parameters: Lv. 90 Boss (MoC 12 / Apocalyptic Shadow), 1100 DEF factor, 20% Base RES, 100 AV turn window. Place support teammates on your in-game showcase to pipe real equipment stats into calculations.'}
        </span>
      </div>
    </div>
  );
}
