import React, { useState, useEffect, useRef } from 'react';
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
  const hasInternalHomeRef = useRef(false);

  // Region-based automatic locale detection (Default: English 'en', Slavic: 'ru', NO manual switcher)
  const lang = getDetectedLanguage();
  const t = translations[lang] || translations.en;

  // Handle native browser Back / Forward navigation (popstate)
  useEffect(() => {
    const handlePopState = () => {
      setIsTrophyOpen(false);

      const params = new URLSearchParams(window.location.search);
      const urlUid = params.get('uid');

      if (urlUid) {
        // Browser navigated forward or back to a profile URL
        fetchProfile(urlUid, false);
      } else {
        // Browser navigated back to home (no ?uid=)
        hasInternalHomeRef.current = true;
        setCurrentProfile(null);
        setErrorMsg('');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [lang]);

  // Read ?uid=... from URL on initial load & establish initial history state
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlUid = params.get('uid');
    if (urlUid) {
      window.history.replaceState({ view: 'profile', uid: urlUid }, '', window.location.href);
      fetchProfile(urlUid, false);
    } else {
      hasInternalHomeRef.current = true;
      window.history.replaceState({ view: 'home' }, '', window.location.pathname);
    }
  }, []);

  const handleBackToHome = () => {
    if (isTrophyOpen) {
      setIsTrophyOpen(false);
    }
    setCurrentProfile(null);
    setErrorMsg('');

    // If navigated from home in this session, history.back() seamlessly syncs browser buttons
    if (hasInternalHomeRef.current && window.history.state?.view === 'profile') {
      window.history.back();
    } else {
      hasInternalHomeRef.current = true;
      window.history.pushState({ view: 'home' }, '', window.location.pathname);
    }
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

  // Robust PC navigation: Browser Back, Left Arrow (ArrowLeft), Escape, Alt+Left, or Mouse 4 returns to UID input
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isLeft = e.key === 'ArrowLeft' || e.code === 'ArrowLeft' || e.key === 'Left' || e.keyCode === 37;
      const isEsc = e.key === 'Escape' || e.code === 'Escape' || e.key === 'Esc' || e.keyCode === 27;
      const isBrowserBack = e.key === 'BrowserBack' || e.code === 'BrowserBack' || (e.altKey && isLeft);

      if (!isLeft && !isEsc && !isBrowserBack) return;

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

    const handleMouseUp = (e) => {
      // Mouse 4 (button 3) is standard Back button on gaming/desktop mice
      if (e.button === 3) {
        if (isTrophyOpen) {
          e.preventDefault();
          setIsTrophyOpen(false);
        } else if (currentProfile) {
          e.preventDefault();
          handleBackToHome();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('mouseup', handleMouseUp, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('mouseup', handleMouseUp, true);
    };
  }, [currentProfile, isTrophyOpen]);

  const fetchProfile = async (targetUid, shouldPushHistory = true) => {
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
          const resolvedUid = String(data.player?.uid || uid);
          const targetUrl = `?uid=${resolvedUid}`;

          if (shouldPushHistory) {
            const currentParams = new URLSearchParams(window.location.search);
            if (currentParams.get('uid') !== resolvedUid) {
              window.history.pushState({ view: 'profile', uid: resolvedUid }, '', targetUrl);
            } else {
              window.history.replaceState({ view: 'profile', uid: resolvedUid }, '', targetUrl);
            }
          } else {
            window.history.replaceState({ view: 'profile', uid: resolvedUid }, '', targetUrl);
          }
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
        window.history.pushState({ view: 'profile', uid: demoUid }, '', `?uid=${demoUid}`);
      } else {
        fetchProfile('700142890', true);
      }
    } catch {
      fetchProfile('700142890', true);
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
                  title={lang === 'ru' ? "Вернуться к смене UID (← в браузере, мышь, стрелка клавиатуры)" : "Back to UID change (← Browser, Mouse, Keyboard Arrow)"}
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
                <div className="panel panel-combat-stats" style={{ marginBottom: '24px' }}>
                  <div className="panel-title">
                    <span>{t.combatStatsTitle}</span>
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '10px' }}>{t.basePlusBonus}</span>
                  </div>
                  <CombatStats character={activeChar} t={t} lang={lang} />
                </div>

                {/* 2. Audit Benchmark & Bottleneck */}
                <div className="panel panel-audit">
                  <AuditPanel audit={audit} t={t} lang={lang} />
                </div>
              </div>

              {/* Right Column: 6 Relic Slots & Set Bonuses */}
              <div className="dashboard-col-right">
                {/* 1. 6 Relic Slots Grid */}
                <div className="panel panel-relics" style={{ marginBottom: '24px' }}>
                  <div className="panel-title">
                    <span>{t.relicsTitle}</span>
                    <span style={{ color: 'var(--accent)' }}>{t.verifiedData}</span>
                  </div>
                  <RelicsGrid character={activeChar} audit={audit} t={t} lang={lang} />
                </div>

                {/* 2. Active Set Bonuses */}
                <div className="panel panel-sets">
                  <div className="panel-title">
                    <span>{t.setsTitle}</span>
                  </div>
                  <SetBonuses character={activeChar} t={t} lang={lang} />
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
