import React, { useState, useEffect, useRef, useMemo } from 'react';
import ThreeBackground from './components/ThreeBackground';
import Header from './components/Header';
import HomeView from './components/HomeView';
import ShowcaseRoster from './components/ShowcaseRoster';
import CharacterOverview from './components/CharacterOverview';
import CombatStats from './components/CombatStats';
import RelicsGrid from './components/RelicsGrid';
import SetBonuses from './components/SetBonuses';
import AuditPanel from './components/AuditPanel';
import CombatSimulationCard from './components/CombatSimulationCard';
import TrophyModal from './components/TrophyModal';
import { RefreshIcon } from './components/Icons.jsx';
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
  return (cachedPresets && cachedPresets[lang] && Object.keys(cachedPresets[lang]).length > 0)
    ? cachedPresets[lang]
    : (cachedPresets?.en || cachedPresets?.ru || cachedPresets);
}

function getInitialSessionData() {
  if (typeof window === 'undefined') {
    return { cachedMap: new Map(), initialProfile: null, initialUrlUid: null };
  }
  try {
    const params = new URLSearchParams(window.location.search);
    const urlUid = params.get('uid');
    const stored = sessionStorage.getItem('nousmatrix_cached_profiles');
    const cachedMap = new Map();
    let initialProfile = null;

    if (stored) {
      const parsed = JSON.parse(stored);
      Object.entries(parsed).forEach(([k, v]) => {
        cachedMap.set(String(k), v);
      });
      if (urlUid && parsed[urlUid]) {
        initialProfile = parsed[urlUid];
      }
    }

    return { cachedMap, initialProfile, initialUrlUid: urlUid };
  } catch {
    return { cachedMap: new Map(), initialProfile: null, initialUrlUid: null };
  }
}

export default function App() {
  const [initialData] = useState(getInitialSessionData);
  const [currentProfile, setCurrentProfile] = useState(initialData.initialProfile);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTrophyOpen, setIsTrophyOpen] = useState(false);
  const isTrophyOpenRef = useRef(false);
  const [isLoading, setIsLoading] = useState(() => Boolean(initialData.initialUrlUid && !initialData.initialProfile));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const hasInternalHomeRef = useRef(false);
  const profileCacheRef = useRef(initialData.cachedMap);
  const lastProfileRef = useRef(initialData.initialProfile);

  // Region-based automatic locale detection (Default: English 'en', Slavic: 'ru', NO manual switcher)
  const lang = getDetectedLanguage();
  const t = translations[lang] || translations.en;

  const saveToCache = (uid, data) => {
    if (!uid || !data) return;
    const strUid = String(uid);
    profileCacheRef.current.set(strUid, data);
    lastProfileRef.current = data;
    try {
      const cacheObj = {};
      let count = 0;
      for (const [k, v] of profileCacheRef.current.entries()) {
        if (count++ > 10) break;
        cacheObj[k] = v;
      }
      sessionStorage.setItem('nousmatrix_cached_profiles', JSON.stringify(cacheObj));
    } catch {
      // quota or private mode
    }
  };

  const handleOpenTrophy = () => {
    const currentUid = String(currentProfile?.player?.uid || '');
    if (window.history.state?.view !== 'trophy') {
      window.history.pushState({ view: 'trophy', uid: currentUid }, '', window.location.href);
    }
    setIsTrophyOpen(true);
    isTrophyOpenRef.current = true;
  };

  const handleCloseTrophy = () => {
    setIsTrophyOpen(false);
    isTrophyOpenRef.current = false;
    if (window.history.state?.view === 'trophy') {
      window.history.back();
    }
  };

  // Handle native browser Back / Forward navigation (popstate)
  useEffect(() => {
    const handlePopState = (e) => {
      // If modal was open, back gesture/arrow closes the modal and STAYS in the profile!
      if (isTrophyOpenRef.current) {
        setIsTrophyOpen(false);
        isTrophyOpenRef.current = false;
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const urlUid = params.get('uid') || e.state?.uid;

      if (urlUid) {
        // If currentProfile is already loaded for this UID, stay right here!
        if (currentProfile && String(currentProfile.player?.uid) === String(urlUid)) {
          return;
        }

        // Browser navigated forward or back to a profile URL!
        // Instant check in cache: if already loaded in this session, transition IMMEDIATELY without loading!
        let cached = profileCacheRef.current.get(String(urlUid));
        if (!cached && lastProfileRef.current && String(lastProfileRef.current.player?.uid) === String(urlUid)) {
          cached = lastProfileRef.current;
        }

        if (cached && cached.characters && cached.characters.length > 0) {
          setCurrentProfile(cached);
          lastProfileRef.current = cached;
          setActiveIndex(0);
          setErrorMsg('');
          setIsLoading(false);
          return;
        }

        // If not in cache yet, fetch it
        fetchProfile(urlUid, false);
      } else {
        // Browser navigated back to home (no ?uid=)
        hasInternalHomeRef.current = true;
        if (currentProfile) {
          lastProfileRef.current = currentProfile;
        }
        setCurrentProfile(null);
        setErrorMsg('');
        setIsLoading(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [lang, currentProfile]);

  // Read ?uid=... from URL on initial load & establish initial history state
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlUid = params.get('uid');
    if (urlUid) {
      window.history.replaceState({ view: 'profile', uid: urlUid }, '', window.location.href);
      if (!currentProfile || String(currentProfile.player?.uid) !== String(urlUid)) {
        fetchProfile(urlUid, false);
      }
    } else {
      hasInternalHomeRef.current = true;
      window.history.replaceState({ view: 'home' }, '', window.location.pathname);
    }
  }, []);

  const handleBackToHome = () => {
    if (isTrophyOpenRef.current) {
      handleCloseTrophy();
      return;
    }
    if (currentProfile) {
      lastProfileRef.current = currentProfile;
      if (currentProfile.player?.uid) {
        saveToCache(currentProfile.player.uid, currentProfile);
      }
    }
    setCurrentProfile(null);
    setErrorMsg('');
    setIsLoading(false);

    // If navigated from home in this session, history.back() seamlessly syncs browser buttons
    if (hasInternalHomeRef.current && window.history.state?.view === 'profile') {
      window.history.back();
    } else {
      hasInternalHomeRef.current = true;
      window.history.pushState({ view: 'home' }, '', window.location.pathname);
    }
  };

  const handleRestoreProfile = () => {
    const profileToRestore = lastProfileRef.current || Array.from(profileCacheRef.current.values())[0];
    if (profileToRestore) {
      const targetUid = String(profileToRestore.player?.uid || '');
      setCurrentProfile(profileToRestore);
      lastProfileRef.current = profileToRestore;
      setActiveIndex(0);
      setErrorMsg('');
      setIsLoading(false);
      const targetUrl = targetUid ? `?uid=${targetUid}` : '';
      window.history.pushState({ view: 'profile', uid: targetUid }, '', targetUrl);
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

  // Robust PC & Mobile navigation:
  // - Back: ArrowLeft, Escape, BrowserBack, Alt+Left, Mouse 4 returns to Home
  // - Forward: ArrowRight, BrowserForward, Alt+Right, Mouse 5 instantly restores Profile with 0 loading!
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isLeft = e.key === 'ArrowLeft' || e.code === 'ArrowLeft' || e.key === 'Left' || e.keyCode === 37;
      const isRight = e.key === 'ArrowRight' || e.code === 'ArrowRight' || e.key === 'Right' || e.keyCode === 39;
      const isEsc = e.key === 'Escape' || e.code === 'Escape' || e.key === 'Esc' || e.keyCode === 27;
      const isBrowserBack = e.key === 'BrowserBack' || e.code === 'BrowserBack' || (e.altKey && isLeft);
      const isBrowserForward = e.key === 'BrowserForward' || e.code === 'BrowserForward' || (e.altKey && isRight);

      // 1. Back navigation
      if (isLeft || isEsc || isBrowserBack) {
        if (isTrophyOpenRef.current) {
          handleCloseTrophy();
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
        return;
      }

      // 2. Forward navigation (when on home screen, instantly restores profile without loading!)
      if (isRight || isBrowserForward) {
        if (!currentProfile) {
          const isTyping = document.activeElement &&
            ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName) &&
            document.body.contains(document.activeElement) &&
            document.activeElement.value && document.activeElement.value.trim().length > 0;

          if (!isTyping) {
            const profileToRestore = lastProfileRef.current || Array.from(profileCacheRef.current.values())[0];
            if (profileToRestore) {
              e.preventDefault();
              handleRestoreProfile();
            }
          }
        }
      }
    };

    const handleMouseUp = (e) => {
      // Mouse 4 (button 3): standard Back button on gaming/desktop mice
      if (e.button === 3) {
        if (isTrophyOpenRef.current) {
          e.preventDefault();
          handleCloseTrophy();
        } else if (currentProfile) {
          e.preventDefault();
          handleBackToHome();
        }
      }

      // Mouse 5 (button 4): standard Forward button on gaming/desktop mice
      if (e.button === 4) {
        if (!currentProfile) {
          const profileToRestore = lastProfileRef.current || Array.from(profileCacheRef.current.values())[0];
          if (profileToRestore) {
            e.preventDefault();
            handleRestoreProfile();
          }
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

  const fetchProfile = async (targetUid, shouldPushHistory = true, forceRefresh = false) => {
    const cleanUid = String(targetUid || '').trim().replace(/\D/g, '');
    const uid = cleanUid || '700142890';

    // 0. INSTANT CACHE CHECK: If profile was already loaded in this session, transition IMMEDIATELY without loading!
    if (!forceRefresh) {
      let cached = profileCacheRef.current.get(uid);
      if (!cached && lastProfileRef.current && String(lastProfileRef.current.player?.uid) === uid) {
        cached = lastProfileRef.current;
      }

      if (cached && cached.characters && cached.characters.length > 0) {
        setCurrentProfile(cached);
        lastProfileRef.current = cached;
        setActiveIndex(0);
        setErrorMsg('');
        setIsLoading(false); // NO LOADING!

        const resolvedUid = String(cached.player?.uid || uid);
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
      }
    } else {
      // Force refresh requested: clear in-memory and session cache for this UID and player UID
      profileCacheRef.current.delete(uid);
      if (lastProfileRef.current?.player?.uid) {
        profileCacheRef.current.delete(String(lastProfileRef.current.player.uid));
      }
      lastProfileRef.current = null;
      try {
        const stored = sessionStorage.getItem('nousmatrix_cached_profiles');
        if (stored) {
          const parsed = JSON.parse(stored);
          delete parsed[uid];
          sessionStorage.setItem('nousmatrix_cached_profiles', JSON.stringify(parsed));
        }
      } catch {
        // ignore
      }
    }

    if (forceRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setErrorMsg('');

    try {
      let data = null;
      let lastStatus = 0;

      // 1. Try Vercel Serverless API / Local Vite Proxy
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const cacheBuster = forceRefresh ? `&is_force_update=true&force=1&_t=${Date.now()}` : '';
        const apiRes = await fetch(`/api/mihomo?uid=${uid}&lang=${lang}${cacheBuster}`, {
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

      // 2. Check local presets (if offline or preset UID entered and not force refreshing)
      if (!data && !forceRefresh) {
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
          const cacheBuster = forceRefresh ? `&is_force_update=true&_t=${Date.now()}` : '';
          const directRes = await fetch(`https://api.mihomo.me/sr_info_parsed/${uid}?lang=${lang}${cacheBuster}`, {
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
        // Ensure ornaments are merged into relics across all characters
        if (Array.isArray(data.characters)) {
          data.characters.forEach(c => {
            if (Array.isArray(c.ornaments) && c.ornaments.length > 0) {
              const currentRelics = Array.isArray(c.relics) ? c.relics : [];
              const existingIds = new Set(currentRelics.map(r => r.id || `${r.type}_${r.name}`));
              const merged = [...currentRelics];
              c.ornaments.forEach(orn => {
                if (!existingIds.has(orn.id || `${orn.type}_${orn.name}`)) {
                  merged.push(orn);
                }
              });
              c.relics = merged;
            }

            const cName = (c.name || '').toLowerCase();
            const isSW999 = (cName.includes('волк') || cName.includes('silver')) && (cName.includes('999') || cName.includes('ур') || cName.includes('lv'));
            if (isSW999 && (!c.element || c.element.id !== 'Imaginary')) {
              c.element = {
                id: 'Imaginary',
                name: (lang === 'ru' || lang === 'uk' || lang === 'be') ? 'Мнимый' : 'Imaginary',
                color: '#F4D258',
                icon: 'icon/element/Imaginary.png'
              };
            }
          });
        }

        if (data.characters && data.characters.length > 0) {
          saveToCache(uid, data);
          if (data.player?.uid) {
            saveToCache(String(data.player.uid), data);
          }
          setCurrentProfile(data);
          lastProfileRef.current = data;
          setActiveIndex(0);
          setErrorMsg('');
          setIsLoading(false);
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
      setIsRefreshing(false);
    }
  };

  const handleOpenDemo = async () => {
    try {
      const localizedPresets = await getLocalizedPresets(lang);
      const demoUid = Object.keys(localizedPresets || {})[0] || '700142890';
      if (localizedPresets && localizedPresets[demoUid]) {
        const demoData = localizedPresets[demoUid];
        saveToCache(demoUid, demoData);
        setCurrentProfile(demoData);
        lastProfileRef.current = demoData;
        setActiveIndex(0);
        setErrorMsg('');
        setIsLoading(false);
        window.history.pushState({ view: 'profile', uid: demoUid }, '', `?uid=${demoUid}`);
        return;
      }
    } catch {}
    fetchProfile('700142890', true);
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
          (isLoading && initialData.initialUrlUid) ? (
            <div className="profile-loading-screen">
              <div className="profile-loading-spinner" />
              <div className="profile-loading-text">
                {lang === 'ru' ? 'СИНХРОНИЗАЦИЯ ДАННЫХ С ИГРОВЫМИ СЕРВЕРАМИ...' : 'SYNCING PROFILE FROM GAME SERVERS...'}
              </div>
              <div className="profile-loading-sub">UID: {initialData.initialUrlUid}</div>
            </div>
          ) : (
            <HomeView
              onSearch={fetchProfile}
              isLoading={isLoading}
              errorMsg={errorMsg}
              onOpenDemo={handleOpenDemo}
              recentProfile={lastProfileRef.current}
              onRestoreProfile={handleRestoreProfile}
              t={t}
              lang={lang}
            />
          )
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
                  type="button"
                  className={`btn-outline refresh-btn ${isRefreshing ? 'loading' : ''}`}
                  onClick={() => fetchProfile(player?.uid, false, true)}
                  disabled={isRefreshing}
                  title={lang === 'ru' ? "Обновить данные из игры (обойти кэш)" : "Refresh data from game (bypass cache)"}
                >
                  <RefreshIcon size={12} className={`refresh-icon ${isRefreshing ? 'spinning' : ''}`} />{' '}
                  {isRefreshing
                    ? (lang === 'ru' ? 'ОБНОВЛЕНИЕ...' : 'REFRESHING...')
                    : (lang === 'ru' ? 'ОБНОВИТЬ' : 'REFRESH')}
                </button>
                <button
                  className="btn-outline back-btn"
                  onClick={handleBackToHome}
                  title={lang === 'ru' ? "Вернуться к смене UID (← в браузере, мышь, стрелка клавиатуры)" : "Back to UID change (← Browser, Mouse, Keyboard Arrow)"}
                >
                  <span className="arrow-icon">←</span> {t.btnBackUid}
                </button>
                <button className="btn-outline" onClick={handleOpenTrophy}>
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
                  <div className="panel-title combat-stats-title">
                    <span className="combat-title-main">{t.combatStatsTitle}</span>
                    <span className="combat-title-sub">{t.basePlusBonus}</span>
                  </div>
                  <CombatStats character={activeChar} t={t} lang={lang} />
                </div>

                {/* 2. Audit Benchmark & Bottleneck */}
                <div className="panel panel-audit">
                  <AuditPanel audit={audit} t={t} lang={lang} />
                </div>

                {/* 3. Mathematical Combat Simulation Card (MoC 12 Boss) */}
                <CombatSimulationCard
                  character={activeChar}
                  audit={audit}
                  stats={audit?.stats}
                  showcase={currentProfile?.characters || []}
                  lang={lang}
                />
              </div>

              {/* Right Column: 6 Relic Slots & Set Bonuses */}
              <div className="dashboard-col-right">
                {/* 1. 6 Relic Slots Grid */}
                <div className="panel panel-relics" style={{ marginBottom: '24px' }}>
                  <div className="panel-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{t.relicsTitle}</span>
                    <span style={{ color: 'var(--accent)' }}>{t.verifiedData}</span>
                  </div>
                  <RelicsGrid
                    character={activeChar}
                    audit={audit}
                    t={t}
                    lang={lang}
                  />
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
              onClose={handleCloseTrophy}
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
