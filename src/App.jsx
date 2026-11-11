import React, { useState, useEffect } from 'react';
import ThreeBackground from './components/ThreeBackground';
import Header from './components/Header';
import HomeView from './components/HomeView';
import ShowcaseRoster from './components/ShowcaseRoster';
import CharacterOverview from './components/CharacterOverview';
import CombatStats from './components/CombatStats';
import RelicsGrid from './components/RelicsGrid';
import SetBonuses from './components/SetBonuses';
import AuditPanel from './components/AuditPanel';
import TrophyModal from './components/TrophyModal';
import { iconUrl, calculateCharacterAudit } from './utils/audit';
import presetProfiles from './data/presetProfiles.json';

export default function App() {
  const [currentProfile, setCurrentProfile] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTrophyOpen, setIsTrophyOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Keyboard navigation on PC: Left Arrow (ArrowLeft) or Escape returns to UID input
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        return;
      }

      if (e.key === 'ArrowLeft' || e.key === 'Escape') {
        if (isTrophyOpen) {
          setIsTrophyOpen(false);
        } else if (currentProfile) {
          setCurrentProfile(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentProfile, isTrophyOpen]);

  const fetchProfile = async (targetUid) => {
    const uid = targetUid.trim() || '700142890';
    setIsLoading(true);

    try {
      let data = null;

      // 1. Try Vercel Serverless API first (works seamlessly on Vercel deployment & production domain)
      try {
        const apiRes = await fetch(`/api/mihomo?uid=${uid}`);
        if (apiRes.ok) {
          data = await apiRes.json();
        }
      } catch {
        // Local or standalone fallback
      }

      // 2. Check local preset database
      if (!data && presetProfiles && presetProfiles[uid]) {
        data = presetProfiles[uid];
      }

      // 3. Try direct Mihomo API
      if (!data) {
        try {
          const directRes = await fetch(`https://api.mihomo.me/sr_info_parsed/${uid}?lang=ru`, { cache: 'no-cache' });
          if (directRes.ok) {
            data = await directRes.json();
          }
        } catch {
          // Direct fetch failed
        }
      }

      // 4. Offline fallback if UID not found
      if (!data && presetProfiles) {
        const fallbackUid = Object.keys(presetProfiles)[0] || '700142890';
        data = presetProfiles[fallbackUid];
        alert(`UID ${uid} не найден в открытой сети. Загружен проверенный профиль ${data.player?.nickname} (${fallbackUid}).`);
      }

      if (data && data.characters && data.characters.length > 0) {
        setCurrentProfile(data);
        setActiveIndex(0);
      } else {
        alert('Не удалось получить витрину персонажей. Убедитесь, что витрина открыта в игре.');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      alert('Ошибка при загрузке: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const activeChar = currentProfile?.characters?.[activeIndex] || null;
  const audit = activeChar ? calculateCharacterAudit(activeChar) : null;
  const player = currentProfile?.player || null;

  return (
    <div className="app-container">
      {/* 3D Three.js Matrix Background */}
      <ThreeBackground />

      {/* Navigation Header */}
      <Header onBackToHome={() => setCurrentProfile(null)} />

      <main>
        {!currentProfile ? (
          <HomeView onSearch={fetchProfile} isLoading={isLoading} />
        ) : (
          <section id="view-dashboard" style={{ display: 'block' }}>
            {/* Player Banner */}
            <div className="player-banner">
              <div className="player-info-left">
                {player?.avatar && (
                  <img
                    className="player-avatar"
                    src={iconUrl(player.avatar.icon)}
                    alt={player.nickname}
                  />
                )}
                <div className="player-name-block">
                  <div className="player-nickname">
                    <span>{player?.nickname || 'Первопроходец'}</span>
                    <span className="player-uid-badge">UID: {player?.uid}</span>
                    <span className="player-level-badge">Ур. {player?.level}</span>
                  </div>
                  {player?.signature && (
                    <div className="player-signature">«{player.signature}»</div>
                  )}
                </div>
              </div>

              <div className="player-actions">
                <button
                  className="btn-outline back-btn"
                  onClick={() => setCurrentProfile(null)}
                  title="Нажмите ← на клавиатуре или кнопку для смены UID"
                >
                  <span className="arrow-icon">←</span> СМЕНИТЬ UID (Стрелочка ←)
                </button>
                <button className="btn-outline" onClick={() => setIsTrophyOpen(true)}>
                  ТРОФЕЙНАЯ КАРТОЧКА (TOP 1%)
                </button>
              </div>
            </div>

            {/* Showcase Roster (Horizontal row like Akasha / Seeleland) */}
            <ShowcaseRoster
              characters={currentProfile.characters}
              activeIndex={activeIndex}
              onSelect={setActiveIndex}
            />

            {/* Character Overview Card */}
            <CharacterOverview character={activeChar} />

            {/* Main Content Grid */}
            <div className="dashboard-grid">
              {/* Left Column: Real Combat Stats & NousMatrix Audit */}
              <div className="dashboard-col-left">
                {/* 1. Real In-Game Combat Attributes Table */}
                <div className="panel" style={{ marginBottom: '24px' }}>
                  <div className="panel-title">
                    <span>БОЕВЫЕ ХАРАКТЕРИСТИКИ (ИЗ ИГРЫ)</span>
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '10px' }}>БАЗА + БОНУС</span>
                  </div>
                  <CombatStats character={activeChar} />
                </div>

                {/* 2. Audit Benchmark & Bottleneck */}
                <div className="panel">
                  <AuditPanel audit={audit} />
                </div>
              </div>

              {/* Right Column: 6 Relic Slots & Set Bonuses */}
              <div className="dashboard-col-right">
                {/* 1. 6 Relic Slots Grid */}
                <div className="panel" style={{ marginBottom: '24px' }}>
                  <div className="panel-title">
                    <span>РЕЛИКВИИ ПЕРСОНАЖА (ПОСЛОЙНЫЙ АНАЛИЗ 6 СЛОТОВ)</span>
                    <span style={{ color: 'var(--accent)' }}>АКТУАЛЬНЫЕ ДАННЫЕ</span>
                  </div>
                  <RelicsGrid character={activeChar} audit={audit} />
                </div>

                {/* 2. Active Set Bonuses */}
                <div className="panel">
                  <div className="panel-title">
                    <span>АКТИВНЫЕ НАБОРЫ РЕЛИКВИЙ</span>
                  </div>
                  <SetBonuses character={activeChar} />
                </div>
              </div>
            </div>

            {/* Trophy Modal */}
            <TrophyModal
              isOpen={isTrophyOpen}
              onClose={() => setIsTrophyOpen(false)}
              character={activeChar}
              audit={audit}
              uid={player?.uid}
            />
          </section>
        )}
      </main>
    </div>
  );
}
