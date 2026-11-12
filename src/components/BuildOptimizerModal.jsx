import React, { useState, useMemo } from 'react';
import { SET_DEFINITIONS } from '../utils/setDefinitions.js';
import { getDefaultRecommendedSets, collectAccountRelicsPool, optimizeCharacterBuild } from '../utils/optimizer.js';
import { iconUrl } from '../utils/audit.js';
import { CheckIcon, SparklesIcon, SwapIcon } from './Icons.jsx';

export default function BuildOptimizerModal({
  isOpen,
  onClose,
  character,
  audit,
  profile,
  onApplyOptimizedBuild,
  lang = 'ru'
}) {
  if (!isOpen || !character) return null;
  const isRu = lang === 'ru';
  const archetype = audit?.detectedRole?.targetArchetype || 'CRIT_DPS';

  const defaultSets = useMemo(() => getDefaultRecommendedSets(character, archetype), [character, archetype]);

  const [selectedCavern, setSelectedCavern] = useState(defaultSets.cavernId);
  const [selectedPlanar, setSelectedPlanar] = useState(defaultSets.planarId);
  const [priority, setPriority] = useState('FULL_SETS'); // 'FULL_SETS' | 'SPEED' | 'CRIT'

  const accountPool = useMemo(() => collectAccountRelicsPool(profile), [profile]);

  const cavernOptions = useMemo(() => {
    return (SET_DEFINITIONS || []).filter(s => !s.isPlanar);
  }, []);

  const planarOptions = useMemo(() => {
    return (SET_DEFINITIONS || []).filter(s => s.isPlanar);
  }, []);

  const optimizationResult = useMemo(() => {
    return optimizeCharacterBuild(
      character,
      character.relics || [],
      accountPool,
      {
        targetCavernSetId: selectedCavern,
        targetPlanarSetId: selectedPlanar,
        priority,
        archetype
      }
    );
  }, [character, accountPool, selectedCavern, selectedPlanar, priority, archetype]);

  const slotNamesRu = ['Голова', 'Руки', 'Тело', 'Ноги', 'Сфера', 'Вервь'];
  const slotNamesEn = ['Head', 'Hands', 'Body', 'Boots', 'Sphere', 'Rope'];

  return (
    <div className="optimizer-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="optimizer-modal-card">
        {/* Header */}
        <div className="optimizer-header">
          <div className="optimizer-title-col">
            <span className="optimizer-tag">
              <SparklesIcon size={13} />
              <span>{isRu ? 'ИНТЕЛЛЕКТУАЛЬНЫЙ ПОДБОР' : 'AI SMART OPTIMIZER'}</span>
            </span>
            <h2 className="optimizer-title">
              {isRu ? `Оптимизация сборки: ${character.name}` : `Optimize Build: ${character.name}`}
            </h2>
            <div className="optimizer-sub">
              {isRu
                ? 'Сканирование всех артефактов аккаунта с упором на завершённые фул-сеты (4/4 + 2/2) и верные главные статы.'
                : 'Scans account relics inventory prioritizing complete full-sets (4/4 + 2/2) with correct main stats.'}
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}>&times;</button>
        </div>

        {/* Filter Controls (как в игре) */}
        <div className="optimizer-controls-grid">
          <div className="optimizer-control-box">
            <label className="optimizer-label">
              {isRu ? 'Целевой пещерный сет (4 предмета):' : 'Target Cavern Set (4-pc):'}
            </label>
            <select
              className="optimizer-select"
              value={selectedCavern}
              onChange={(e) => setSelectedCavern(e.target.value)}
            >
              {cavernOptions.map(s => (
                <option key={s.id} value={s.id}>
                  {isRu ? s.nameRu : s.nameEn} {s.id === defaultSets.cavernId ? (isRu ? '★ (РЕКОМЕНДОВАНО)' : '★ (RECOMMENDED)') : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="optimizer-control-box">
            <label className="optimizer-label">
              {isRu ? 'Целевой планарный сет (2 предмета):' : 'Target Planar Set (2-pc):'}
            </label>
            <select
              className="optimizer-select"
              value={selectedPlanar}
              onChange={(e) => setSelectedPlanar(e.target.value)}
            >
              {planarOptions.map(s => (
                <option key={s.id} value={s.id}>
                  {isRu ? s.nameRu : s.nameEn} {s.id === defaultSets.planarId ? (isRu ? '★ (РЕКОМЕНДОВАНО)' : '★ (RECOMMENDED)') : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="optimizer-control-box">
            <label className="optimizer-label">
              {isRu ? 'Приоритет характеристик:' : 'Stat Priority Focus:'}
            </label>
            <div className="optimizer-pills">
              <button
                type="button"
                className={`optimizer-pill ${priority === 'FULL_SETS' ? 'active' : ''}`}
                onClick={() => setPriority('FULL_SETS')}
              >
                {isRu ? 'Фулл-сеты (4/4 + 2/2)' : 'Full Sets (4/4 + 2/2)'}
              </button>
              <button
                type="button"
                className={`optimizer-pill ${priority === 'SPEED' ? 'active' : ''}`}
                onClick={() => setPriority('SPEED')}
              >
                {isRu ? 'Макс. Скорость (SPD)' : 'Max Speed (SPD)'}
              </button>
              <button
                type="button"
                className={`optimizer-pill ${priority === 'CRIT' ? 'active' : ''}`}
                onClick={() => setPriority('CRIT')}
              >
                {isRu ? 'Макс. Критмасса (CV)' : 'Max Crit Value'}
              </button>
            </div>
          </div>
        </div>

        {/* Summary Banner */}
        <div className="optimizer-summary-box">
          <div className="summary-col">
            <span className="summary-label">{isRu ? 'Потенциал улучшения' : 'Improvement Gain'}</span>
            <span className="summary-val text-accent">+{optimizationResult.improvementScore}%</span>
          </div>
          <div className="summary-col">
            <span className="summary-label">{isRu ? 'Замен артефактов' : 'Pieces to Swap'}</span>
            <span className="summary-val">{optimizationResult.changesCount} / 6</span>
          </div>
          <div className="summary-col">
            <span className="summary-label">{isRu ? 'Комплектность сетов' : 'Set Completion'}</span>
            <span className="summary-val">
              {optimizationResult.isFullCavernSet ? '4/4 Пещерный ✓' : '2+2 Микс'} • {optimizationResult.isFullPlanarSet ? '2/2 Планарный ✓' : '1/2'}
            </span>
          </div>
        </div>

        {/* Slots List */}
        <div className="optimizer-slots-grid">
          {optimizationResult.pieces.map((p, idx) => {
            const slotName = isRu ? slotNamesRu[idx] : slotNamesEn[idx];
            return (
              <div key={`opt-${idx}`} className={`optimizer-slot-card ${p.isSwapped ? 'swapped' : 'kept'}`}>
                <div className="slot-head">
                  <span className="slot-idx-title">{slotName}</span>
                  {p.isSwapped ? (
                    <span className="slot-action-tag swap">
                      <SwapIcon size={12} />
                      <span>{p.fromCharName ? (isRu ? `Снять с ${p.fromCharName}` : `Take from ${p.fromCharName}`) : (isRu ? 'Из инвентаря' : 'From Inventory')}</span>
                    </span>
                  ) : (
                    <span className="slot-action-tag kept">
                      <CheckIcon size={12} />
                      <span>{isRu ? 'Оставить текущий' : 'Keep Current'}</span>
                    </span>
                  )}
                </div>

                <div className="slot-body">
                  <img
                    src={iconUrl(p.icon)}
                    alt={p.name}
                    className="slot-relic-img"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <div className="slot-meta">
                    <span className="slot-relic-name">{p.name || p.set_name}</span>
                    <span className="slot-relic-stat">
                      +{p.level || 15} • {p.set_name}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions Footer */}
        <div className="optimizer-footer">
          <span className="optimizer-hint">
            {isRu
              ? '💡 Нажмите «Применить в симуляторе», чтобы виртуально надеть эту сборку и сравнить урон и рейтинг.'
              : '💡 Click "Apply in Simulator" to equip these relics virtually and inspect updated combat ratings.'}
          </span>
          <div className="optimizer-actions">
            <button className="btn-outline" onClick={onClose}>
              {isRu ? 'ОТМЕНА' : 'CANCEL'}
            </button>
            <button
              className="btn-submit"
              onClick={() => {
                if (onApplyOptimizedBuild) {
                  onApplyOptimizedBuild(optimizationResult.pieces);
                }
                onClose();
              }}
            >
              <SparklesIcon size={14} />
              <span>{isRu ? 'ПРИМЕНИТЬ В СИМУЛЯТОРЕ' : 'APPLY IN SIMULATOR'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
