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
import { getDetectedLanguage, translations } from './utils/i18n';

let cachedPresets = null;
async function getLocalizedPresets(lang) {
  if (!cachedPresets) {
    try {
      const mod = await import('./data/presetProfiles.json');
      cachedPresets = mod.default || mod;
    } catch {
      return null;
    }
  }
  return (cachedPresets && cachedPresets[lang])
    ? cachedPresets[lang]
    : (cachedPresets?.en || cachedPresets?.ru || cachedPresets);
}

export default function App() {
  const [currentProfile, setCurrentProfile] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTrophyOpen, setIsTrophyOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Region-based automatic locale detection (Default: English 'en', Slavic: 'ru', NO manual switcher)
  const lang = getDetectedLanguage();
  const t = translations[lang] || translations.en;

  // Read ?uid=... from URL on initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlUid = params.get('uid');
    if (urlUid) {
      fetchProfile(urlUid);
    }
  }, []);

  const handleBackToHome = () => {
    setCurrentProfile(null);
    setErrorMsg('');
    window.history.replaceState({}, '', window.location.pathname);
  };

  // When profile is opened, blur any previous input and ensure window focus
  useEffect(() => {
    if (currentProfile) {
      if (document.activeElement && typeof document.activeElement.blur === 'function') {
        document.activeElement.blur();
      }
      window.focus();
    }
  }, [currentProfile]);

  // Robust PC keyboard navigation: Left Arrow (ArrowLeft) or Escape returns to UID input
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isLeft = e.key === 'ArrowLeft' || e.code === 'ArrowLeft' || e.key === 'Left' || e.keyCode === 37;
      const isEsc = e.key === 'Escape' || e.code === 'Escape' || e.key === 'Esc' || e.keyCode === 27;

      if (!isLeft && !isEsc) return;

      if (isTrophyOpen) {
        setIsTrophyOpen(false);
        e.preventDefault();
        return;
      }

      if (currentProfile) {
        const isTyping = document.activeElement &&
          ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName) &&
          document.body.contains(document.activeElement);

        if (!isTyping) {
          e.preventDefault();
          handleBackToHome();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [currentProfile, isTrophyOpen]);

  const fetchProfile = async (targetUid) => {
    const cleanUid = String(targetUid || '').trim().replace(/\D/g, '');
    const uid = cleanUid || '700142890';

    setIsLoading(true);
    setErrorMsg('');

    try {
      let data = null;
      let lastStatus = 0;

      // 1. Try Vercel Serverless API / Local Vite Proxy
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const apiRes = await fetch(`/api/mihomo?uid=${uid}&lang=${lang}`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        lastStatus = apiRes.status;
        if (apiRes.ok) {
          data = await apiRes.json();
        }
      } catch (err) {
        console.warn('API fetch warning:', err);
      }

      // 2. Check local presets (if offline or preset UID entered)
      if (!data) {
        const localizedPresets = await getLocalizedPresets(lang);
        if (localizedPresets && localizedPresets[uid]) {
          data = localizedPresets[uid];
        }
      }

      // 3. Try direct Mihomo endpoint if not running through proxy
      if (!data && lastStatus !== 404) {
        try {
          const directController = new AbortController();
          const dTimeout = setTimeout(() => directController.abort(), 10000);
          const directRes = await fetch(`https://api.mihomo.me/sr_info_parsed/${uid}?lang=${lang}`, {
            signal: directController.signal
          });
          clearTimeout(dTimeout);
          if (directRes.ok) {
            data = await directRes.json();
          }
        } catch {
          // Direct fetch failed (CORS or network)
        }
      }

      // Process loaded data
      if (data) {
        if (data.characters && data.characters.length > 0) {
          setCurrentProfile(data);
          setActiveIndex(0);
          setErrorMsg('');
          window.history.replaceState({}, '', `?uid=${data.player?.uid || uid}`);
          return;
        } else if (data.player) {
          // Profile exists on server, but characters showcase is hidden/empty
          setErrorMsg(t.errHidden(data.player.nickname));
          return;
        }
      }

      // If we reached here, no valid character showcase was retrieved
      if (lastStatus === 404) {
        setErrorMsg(t.errNotFound(uid));
      } else {
        setErrorMsg(t.errGeneric);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setErrorMsg(t.errGeneric);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDemo = async () => {
    setIsLoading(true);
    try {
      const localizedPresets = await getLocalizedPresets(lang);
      const demoUid = Object.keys(localizedPresets || {})[0] || '700142890';
      if (localizedPresets && localizedPresets[demoUid]) {
        setCurrentProfile(localizedPresets[demoUid]);
        setActiveIndex(0);
        setErrorMsg('');
        window.history.replaceState({}, '', `?uid=${demoUid}`);
      } else {
        fetchProfile('700142890');
      }
    } catch {
      fetchProfile('700142890');
    } finally {
      setIsLoading(false);
    }
  };

  const activeChar = currentProfile?.characters?.[activeIndex] || null;
  const audit = activeChar ? calculateCharacterAudit(activeChar, lang) : null;
  const player = currentProfile?.player || null;

  return (
    <div className="app-container">
      {/* 3D Three.js Matrix Background */}
      <ThreeBackground />

      {/* Navigation Header */}
      <Header onBackToHome={handleBackToHome} />

      <main>
        {!currentProfile ? (
          <HomeView
            onSearch={fetchProfile}
            isLoading={isLoading}
            errorMsg={errorMsg}
            onOpenDemo={handleOpenDemo}
            t={t}
          />
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
                    <span>{player?.nickname || (lang === 'ru' ? 'Первопроходец' : 'Trailblazer')}</span>
                    <span className="player-uid-badge">UID: {player?.uid}</span>
                    <span className="player-level-badge">{t.lvl} {player?.level}</span>
                  </div>
                  {player?.signature && (
                    <div className="player-signature">«{player.signature}»</div>
                  )}
                </div>
              </div>

              <div className="player-actions">
                <button
                  className="btn-outline back-btn"
                  onClick={handleBackToHome}
                  title={lang === 'ru' ? "Нажмите ← на клавиатуре или кнопку для смены UID" : "Press ← on keyboard or click to change UID"}
                >
                  <span className="arrow-icon">←</span> {t.btnBackUid}
                </button>
                <button className="btn-outline" onClick={() => setIsTrophyOpen(true)}>
                  {t.btnTrophy}
                </button>
              </div>
            </div>

            {/* Showcase Roster (Horizontal row like Akasha / Seeleland) */}
            <ShowcaseRoster
              characters={currentProfile.characters}
              activeIndex={activeIndex}
              onSelect={setActiveIndex}
              t={t}
              lang={lang}
            />

            {/* Character Overview Card */}
            <CharacterOverview character={activeChar} t={t} lang={lang} />

            {/* Main Content Grid */}
            <div className="dashboard-grid">
              {/* Left Column: Real Combat Stats & NousMatrix Audit */}
              <div className="dashboard-col-left">
                {/* 1. Real In-Game Combat Attributes Table */}
                <div className="panel" style={{ marginBottom: '24px' }}>
                  <div className="panel-title">
                    <span>{t.combatStatsTitle}</span>
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '10px' }}>{t.basePlusBonus}</span>
                  </div>
                  <CombatStats character={activeChar} t={t} lang={lang} />
                </div>

                {/* 2. Audit Benchmark & Bottleneck */}
                <div className="panel">
                  <AuditPanel audit={audit} t={t} lang={lang} />
                </div>
              </div>

              {/* Right Column: 6 Relic Slots & Set Bonuses */}
              <div className="dashboard-col-right">
                {/* 1. 6 Relic Slots Grid */}
                <div className="panel" style={{ marginBottom: '24px' }}>
                  <div className="panel-title">
                    <span>{t.relicsTitle}</span>
                    <span style={{ color: 'var(--accent)' }}>{t.verifiedData}</span>
                  </div>
                  <RelicsGrid character={activeChar} audit={audit} t={t} lang={lang} />
                </div>

                {/* 2. Active Set Bonuses */}
                <div className="panel">
                  <div className="panel-title">
                    <span>{t.setsTitle}</span>
                  </div>
                  <SetBonuses character={activeChar} t={t} />
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
              t={t}
              lang={lang}
            />
          </section>
        )}
      </main>
    </div>
  );
}
