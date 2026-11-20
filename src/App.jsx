import React, { useState, useEffect, useRef, useMemo } from "react";
import Header from "./components/Header";
import HomeView from "./components/HomeView";
import ShowcaseRoster from "./components/ShowcaseRoster";
import CharacterOverview from "./components/CharacterOverview";
import CombatStats from "./components/CombatStats";
import RelicsGrid from "./components/RelicsGrid";
import SetBonuses from "./components/SetBonuses";
import AuditPanel from "./components/AuditPanel";
import OverallScorePanel from "./components/OverallScorePanel";
import RelicsAuditPanel from "./components/RelicsAuditPanel.jsx";
import CombatSimulationCard from "./components/CombatSimulationCard";
import DashboardNav from "./components/DashboardNav.jsx";
import TrophyModal from "./components/TrophyModal";
import LeaderboardModal from "./components/LeaderboardModal";
import { RefreshIcon } from "./components/Icons.jsx";
import { iconUrl, handleImageFallback, calculateCharacterAudit } from "./utils/audit";
import { getDetectedLanguage, translations } from "./utils/i18n";
let cachedPresets = null;
async function getLocalizedPresets(lang) {
  if (!cachedPresets) {
    try {
      const mod = await import("./data/presetProfiles.json");
      cachedPresets = mod.default || mod;
    } catch {
      return null;
    }
  }
  return cachedPresets && cachedPresets[lang] && Object.keys(cachedPresets[lang]).length > 0 ? cachedPresets[lang] : cachedPresets?.en || cachedPresets?.ru || cachedPresets;
}
function getInitialSessionData() {
  if (typeof window === "undefined") {
    return { cachedMap: new Map(), initialProfile: null, initialUrlUid: null };
  }
  try {
    const params = new URLSearchParams(window.location.search);
    const urlUid = params.get("uid");
    const stored = sessionStorage.getItem("nousmatrix_cached_profiles");
    const cachedMap = new Map();
    let initialProfile = null;
    if (stored) {
      const parsed = JSON.parse(stored);
      Object.entries(parsed).forEach(([k, v]) => {
        if (v && Array.isArray(v.characters)) {
          v.characters.forEach((c) => {
            if (Array.isArray(c.ornaments) && c.ornaments.length > 0) {
              const currentRelics = Array.isArray(c.relics) ? c.relics : [];
              const existingIds = new Set(currentRelics.map((r) => r.id || `${r.type ?? r.pos}_${r.name}`));
              const existingTypes = new Set(currentRelics.map((r) => Number(r.type ?? r.pos)).filter(Boolean));
              const merged = [...currentRelics];
              c.ornaments.forEach((orn) => {
                const typeNum = Number(orn.type ?? orn.pos);
                const ornId = orn.id || `${typeNum}_${orn.name}`;
                if (!existingIds.has(ornId) && (!typeNum || !existingTypes.has(typeNum))) {
                  merged.push(orn);
                  existingIds.add(ornId);
                  if (typeNum) existingTypes.add(typeNum);
                }
              });
              c.relics = merged;
            }
          });
        }
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

function getSavedCharacterPreference(uid) {
  if (typeof window === "undefined") return null;
  try {
    if (uid) {
      const perUid = localStorage.getItem(`nousmatrix_selected_char_${uid}`);
      if (perUid) return JSON.parse(perUid);
    }
    const globalLast = localStorage.getItem("nousmatrix_last_selected_char");
    if (globalLast) return JSON.parse(globalLast);
  } catch {}
  return null;
}

function saveCharacterPreference(uid, char) {
  if (typeof window === "undefined" || !char) return;
  try {
    const payload = JSON.stringify({
      id: String(char.id || ""),
      name: char.name || ""
    });
    if (uid) {
      localStorage.setItem(`nousmatrix_selected_char_${uid}`, payload);
    }
    localStorage.setItem("nousmatrix_last_selected_char", payload);
  } catch {}
}

function findCharacterIndex(characters, preferred) {
  if (!Array.isArray(characters) || characters.length === 0) return 0;
  if (!preferred) return 0;
  const targetId = String(preferred.id || "").trim();
  const targetName = String(preferred.name || "").trim().toLowerCase();

  if (targetId) {
    const idx = characters.findIndex((c) => String(c.id || "").trim() === targetId);
    if (idx !== -1) return idx;
  }
  if (targetName) {
    const idx = characters.findIndex((c) => String(c.name || "").trim().toLowerCase() === targetName);
    if (idx !== -1) return idx;
  }
  return 0;
}

export default function App() {
  const [initialData] = useState(getInitialSessionData);
  const [currentProfile, setCurrentProfile] = useState(initialData.initialProfile);
  const [activeIndex, setActiveIndex] = useState(() => {
    if (initialData.initialProfile?.characters?.length) {
      const uid = initialData.initialProfile.player?.uid || initialData.initialUrlUid;
      const pref = getSavedCharacterPreference(uid);
      return findCharacterIndex(initialData.initialProfile.characters, pref);
    }
    return 0;
  });
  const lastSelectedCharRef = useRef(null);
  const [isTrophyOpen, setIsTrophyOpen] = useState(false);
  const isTrophyOpenRef = useRef(false);
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [relicsLayoutMode, setRelicsLayoutMode] = useState(() => {
    try {
      return localStorage.getItem("nousmatrix_relics_layout_mode") || "grouped";
    } catch {
      return "grouped";
    }
  });
  const handleRelicsLayoutModeChange = (mode) => {
    setRelicsLayoutMode(mode);
    try {
      localStorage.setItem("nousmatrix_relics_layout_mode", mode);
    } catch {
    }
  };
  const [isLoading, setIsLoading] = useState(() => Boolean(initialData.initialUrlUid && !initialData.initialProfile));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const hasInternalHomeRef = useRef(false);
  const profileCacheRef = useRef(initialData.cachedMap);
  const lastProfileRef = useRef(initialData.initialProfile);
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
      sessionStorage.setItem("nousmatrix_cached_profiles", JSON.stringify(cacheObj));
    } catch {
    }
  };
  const handleOpenTrophy = () => {
    const currentUid = String(currentProfile?.player?.uid || "");
    if (window.history.state?.view !== "trophy") {
      window.history.pushState({ view: "trophy", uid: currentUid }, "", window.location.href);
    }
    setIsTrophyOpen(true);
    isTrophyOpenRef.current = true;
  };
  const handleCloseTrophy = () => {
    setIsTrophyOpen(false);
    isTrophyOpenRef.current = false;
    if (window.history.state?.view === "trophy") {
      window.history.back();
    }
  };
  useEffect(() => {
    const handlePopState = (e) => {
      if (isTrophyOpenRef.current) {
        setIsTrophyOpen(false);
        isTrophyOpenRef.current = false;
        return;
      }
      const params = new URLSearchParams(window.location.search);
      const urlUid = params.get("uid") || e.state?.uid;
      if (urlUid) {
        if (currentProfile && String(currentProfile.player?.uid) === String(urlUid)) {
          return;
        }
        let cached = profileCacheRef.current.get(String(urlUid));
        if (!cached && lastProfileRef.current && String(lastProfileRef.current.player?.uid) === String(urlUid)) {
          cached = lastProfileRef.current;
        }
        if (cached && cached.characters && cached.characters.length > 0) {
          const isSame = currentProfile?.player?.uid && String(currentProfile.player.uid) === String(urlUid);
          const pref = isSame && lastSelectedCharRef.current
            ? lastSelectedCharRef.current
            : getSavedCharacterPreference(urlUid);
          setCurrentProfile(cached);
          lastProfileRef.current = cached;
          setActiveIndex(findCharacterIndex(cached.characters, pref));
          setErrorMsg("");
          setIsLoading(false);
          return;
        }
        fetchProfile(urlUid, false);
      } else {
        hasInternalHomeRef.current = true;
        if (currentProfile) {
          lastProfileRef.current = currentProfile;
        }
        setCurrentProfile(null);
        setErrorMsg("");
        setIsLoading(false);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [lang, currentProfile]);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlUid = params.get("uid");
    if (urlUid) {
      window.history.replaceState({ view: "profile", uid: urlUid }, "", window.location.href);
      if (!currentProfile || String(currentProfile.player?.uid) !== String(urlUid)) {
        fetchProfile(urlUid, false);
      }
    } else {
      hasInternalHomeRef.current = true;
      window.history.replaceState({ view: "home" }, "", window.location.pathname);
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
    setErrorMsg("");
    setIsLoading(false);
    if (hasInternalHomeRef.current && window.history.state?.view === "profile") {
      window.history.back();
    } else {
      hasInternalHomeRef.current = true;
      window.history.pushState({ view: "home" }, "", window.location.pathname);
    }
  };
  const handleRestoreProfile = () => {
    const profileToRestore = lastProfileRef.current || Array.from(profileCacheRef.current.values())[0];
    if (profileToRestore) {
      const targetUid = String(profileToRestore.player?.uid || "");
      const pref = lastSelectedCharRef.current || getSavedCharacterPreference(targetUid);
      setCurrentProfile(profileToRestore);
      lastProfileRef.current = profileToRestore;
      setActiveIndex(findCharacterIndex(profileToRestore.characters, pref));
      setErrorMsg("");
      setIsLoading(false);
      const targetUrl = targetUid ? `?uid=${targetUid}` : "";
      window.history.pushState({ view: "profile", uid: targetUid }, "", targetUrl);
    }
  };
  useEffect(() => {
    if (currentProfile) {
      if (document.activeElement && typeof document.activeElement.blur === "function") {
        document.activeElement.blur();
      }
      window.focus();
    }
  }, [currentProfile]);
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isLeft = e.key === "ArrowLeft" || e.code === "ArrowLeft" || e.key === "Left" || e.keyCode === 37;
      const isRight = e.key === "ArrowRight" || e.code === "ArrowRight" || e.key === "Right" || e.keyCode === 39;
      const isEsc = e.key === "Escape" || e.code === "Escape" || e.key === "Esc" || e.keyCode === 27;
      const isBrowserBack = e.key === "BrowserBack" || e.code === "BrowserBack" || e.altKey && isLeft;
      const isBrowserForward = e.key === "BrowserForward" || e.code === "BrowserForward" || e.altKey && isRight;
      if (isLeft || isEsc || isBrowserBack) {
        if (isTrophyOpenRef.current) {
          handleCloseTrophy();
          e.preventDefault();
          return;
        }
        if (currentProfile) {
          const isTyping = document.activeElement && ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName) && document.body.contains(document.activeElement);
          if (!isTyping) {
            e.preventDefault();
            handleBackToHome();
          }
        }
        return;
      }
      if (isRight || isBrowserForward) {
        if (!currentProfile) {
          const isTyping = document.activeElement && ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName) && document.body.contains(document.activeElement) && document.activeElement.value && document.activeElement.value.trim().length > 0;
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
      if (e.button === 3) {
        if (isTrophyOpenRef.current) {
          e.preventDefault();
          handleCloseTrophy();
        } else if (currentProfile) {
          e.preventDefault();
          handleBackToHome();
        }
      }
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
    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("mouseup", handleMouseUp, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("mouseup", handleMouseUp, true);
    };
  }, [currentProfile, isTrophyOpen]);
  const fetchProfile = async (targetUid, shouldPushHistory = true, forceRefresh = false) => {
    const cleanUid = String(targetUid || "").trim().replace(/\D/g, "");
    const uid = cleanUid || "700142890";
    if (!forceRefresh) {
      let cached = profileCacheRef.current.get(uid);
      if (!cached && lastProfileRef.current && String(lastProfileRef.current.player?.uid) === uid) {
        cached = lastProfileRef.current;
      }
      if (cached && cached.characters && cached.characters.length > 0) {
        const isSame = currentProfile?.player?.uid && String(currentProfile.player.uid) === String(cached.player?.uid || uid);
        const pref = isSame && lastSelectedCharRef.current
          ? lastSelectedCharRef.current
          : getSavedCharacterPreference(cached.player?.uid || uid);
        setCurrentProfile(cached);
        lastProfileRef.current = cached;
        setActiveIndex(findCharacterIndex(cached.characters, pref));
        setErrorMsg("");
        setIsLoading(false);
        const resolvedUid = String(cached.player?.uid || uid);
        const targetUrl = `?uid=${resolvedUid}`;
        if (shouldPushHistory) {
          const currentParams = new URLSearchParams(window.location.search);
          if (currentParams.get("uid") !== resolvedUid) {
            window.history.pushState({ view: "profile", uid: resolvedUid }, "", targetUrl);
          } else {
            window.history.replaceState({ view: "profile", uid: resolvedUid }, "", targetUrl);
          }
        } else {
          window.history.replaceState({ view: "profile", uid: resolvedUid }, "", targetUrl);
        }
        return;
      }
    } else {
      profileCacheRef.current.delete(uid);
      if (lastProfileRef.current?.player?.uid) {
        profileCacheRef.current.delete(String(lastProfileRef.current.player.uid));
      }
      lastProfileRef.current = null;
      try {
        const stored = sessionStorage.getItem("nousmatrix_cached_profiles");
        if (stored) {
          const parsed = JSON.parse(stored);
          delete parsed[uid];
          sessionStorage.setItem("nousmatrix_cached_profiles", JSON.stringify(parsed));
        }
      } catch {
      }
    }
    if (forceRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setErrorMsg("");
    try {
      let data = null;
      let lastStatus = 0;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12e3);
        const cacheBuster = forceRefresh ? `&is_force_update=true&force=1&_t=${Date.now()}` : "";
        const fetchHeaders = forceRefresh ? { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' } : {};
        const apiRes = await fetch(`/api/mihomo?uid=${uid}&lang=${lang}${cacheBuster}`, {
          signal: controller.signal,
          headers: fetchHeaders
        });
        clearTimeout(timeoutId);
        lastStatus = apiRes.status;
        if (apiRes.ok) {
          data = await apiRes.json();
        }
      } catch (err) {
        console.warn("API fetch warning:", err);
      }
      if (!data && !forceRefresh) {
        const localizedPresets = await getLocalizedPresets(lang);
        if (localizedPresets && localizedPresets[uid]) {
          data = localizedPresets[uid];
        }
      }
      if (!data && lastStatus !== 404) {
        try {
          const directController = new AbortController();
          const dTimeout = setTimeout(() => directController.abort(), 1e4);
          const cacheBuster = forceRefresh ? `&is_force_update=true&_t=${Date.now()}` : "";
          const directHeaders = forceRefresh ? { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' } : {};
          const directRes = await fetch(`https://api.mihomo.me/sr_info_parsed/${uid}?lang=${lang}${cacheBuster}`, {
            signal: directController.signal,
            headers: directHeaders
          });
          clearTimeout(dTimeout);
          if (directRes.ok) {
            data = await directRes.json();
          }
        } catch {
        }
      }
      if (data) {
        if (Array.isArray(data.characters)) {
          data.characters.forEach((c) => {
            if (Array.isArray(c.ornaments) && c.ornaments.length > 0) {
              const currentRelics = Array.isArray(c.relics) ? c.relics : [];
              const existingIds = new Set(currentRelics.map((r) => r.id || `${r.type}_${r.name}`));
              const merged = [...currentRelics];
              c.ornaments.forEach((orn) => {
                if (!existingIds.has(orn.id || `${orn.type}_${orn.name}`)) {
                  merged.push(orn);
                }
              });
              c.relics = merged;
            }
            const cName = (c.name || "").toLowerCase();
            const isSW999 = (cName.includes("волк") || cName.includes("silver")) && (cName.includes("999") || cName.includes("ур") || cName.includes("lv"));
            if (isSW999 && (!c.element || c.element.id !== "Imaginary")) {
              c.element = {
                id: "Imaginary",
                name: lang === "ru" || lang === "uk" || lang === "be" ? "Мнимый" : "Imaginary",
                color: "#F4D258",
                icon: "icon/element/Imaginary.png"
              };
            }
          });
        }
        if (data.characters && data.characters.length > 0) {
          saveToCache(uid, data);
          if (data.player?.uid) {
            saveToCache(String(data.player.uid), data);
          }
          const resolvedUid = String(data.player?.uid || uid);
          const isSame = currentProfile?.player?.uid && String(currentProfile.player.uid) === resolvedUid;
          const pref = isSame && lastSelectedCharRef.current
            ? lastSelectedCharRef.current
            : getSavedCharacterPreference(resolvedUid);
          setCurrentProfile(data);
          lastProfileRef.current = data;
          setActiveIndex(findCharacterIndex(data.characters, pref));
          setErrorMsg("");
          setIsLoading(false);
          const targetUrl = `?uid=${resolvedUid}`;
          if (shouldPushHistory) {
            const currentParams = new URLSearchParams(window.location.search);
            if (currentParams.get("uid") !== resolvedUid) {
              window.history.pushState({ view: "profile", uid: resolvedUid }, "", targetUrl);
            } else {
              window.history.replaceState({ view: "profile", uid: resolvedUid }, "", targetUrl);
            }
          } else {
            window.history.replaceState({ view: "profile", uid: resolvedUid }, "", targetUrl);
          }
          return;
        } else if (data.player) {
          setErrorMsg(t.errHidden(data.player.nickname));
          return;
        }
      }
      if (lastStatus === 404) {
        setErrorMsg(t.errNotFound(uid));
      } else {
        setErrorMsg(t.errGeneric);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setErrorMsg(t.errGeneric);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  const handleOpenDemo = async () => {
    try {
      const localizedPresets = await getLocalizedPresets(lang);
      const demoUid = Object.keys(localizedPresets || {})[0] || "700142890";
      if (localizedPresets && localizedPresets[demoUid]) {
        const demoData = localizedPresets[demoUid];
        saveToCache(demoUid, demoData);
        const pref = getSavedCharacterPreference(demoUid);
        setCurrentProfile(demoData);
        lastProfileRef.current = demoData;
        setActiveIndex(findCharacterIndex(demoData.characters, pref));
        setErrorMsg("");
        setIsLoading(false);
        window.history.pushState({ view: "profile", uid: demoUid }, "", `?uid=${demoUid}`);
        return;
      }
    } catch {
    }
    fetchProfile("700142890", true);
  };

  // Background Auto-Sync: автоматическое обновление витрины в фоновом режиме каждые 30 секунд
  // Если игрок сменил реликвию или конус в игре и вернулся на вкладку браузера — сайт обновится автоматически
  useEffect(() => {
    const activeUid = currentProfile?.player?.uid;
    if (!activeUid) return;

    const intervalId = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        fetchProfile(String(activeUid), false, true);
      }
    }, 28000);

    return () => clearInterval(intervalId);
  }, [currentProfile?.player?.uid]);

  // Window Focus listener: при переключении из окна игры обратно в браузер — мгновенная тихая сверка
  useEffect(() => {
    const handleWindowFocus = () => {
      const activeUid = currentProfile?.player?.uid;
      if (activeUid && !isRefreshing && !isLoading) {
        fetchProfile(String(activeUid), false, true);
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("focus", handleWindowFocus);
      return () => window.removeEventListener("focus", handleWindowFocus);
    }
  }, [currentProfile?.player?.uid, isRefreshing, isLoading]);

  const handleSelectCharacter = (idx) => {
    setActiveIndex(idx);
    const char = currentProfile?.characters?.[idx];
    const uid = currentProfile?.player?.uid;
    if (char) {
      lastSelectedCharRef.current = {
        id: String(char.id || ""),
        name: char.name || ""
      };
      saveCharacterPreference(uid, char);
    }
  };

  const activeChar = currentProfile?.characters?.[activeIndex] || currentProfile?.characters?.[0] || null;
  const audit = activeChar ? calculateCharacterAudit(activeChar, lang) : null;
  const player = currentProfile?.player || null;

  useEffect(() => {
    if (activeChar) {
      lastSelectedCharRef.current = {
        id: String(activeChar.id || ""),
        name: activeChar.name || ""
      };
      const uid = currentProfile?.player?.uid;
      saveCharacterPreference(uid, activeChar);
    }
  }, [activeChar, currentProfile?.player?.uid]);

  useEffect(() => {
    if (!activeChar || !audit || !currentProfile?.player?.uid) return;
    const uid = String(currentProfile.player.uid);
    const charId = String(activeChar.id);
    let isCancelled = false;

    fetch("/api/leaderboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid,
        nickname: currentProfile.player.nickname || null,
        characterId: charId,
        characterName: activeChar.name,
        score: audit.score,
        archetype: audit.archetype,
        cv: audit.cv,
        spd: audit.spd,
        stats: audit.stats,
        lightCone: activeChar.light_cone ? {
          name: activeChar.light_cone.name,
          rank: activeChar.light_cone.rank,
          level: activeChar.light_cone.level,
          icon: activeChar.light_cone.icon
        } : null,
        relicSets: (activeChar.relic_sets || []).map(rs => rs.name)
      })
    })
      .then(res => {
        if (!res.ok) return null;
        return res.json().catch(() => null);
      })
      .then(data => {
        if (!isCancelled && data && data.success) {
          setLeaderboardData(data);
        }
      })
      .catch(err => console.warn("Leaderboard sync warning:", err));

    return () => {
      isCancelled = true;
    };
  }, [activeChar?.id, currentProfile?.player?.uid, audit?.score]);
  return (
    <div className="app-container">
      <Header onBackToHome={handleBackToHome} />
      <main>
        {!currentProfile ? (
          isLoading && initialData.initialUrlUid ? (
            <div className="profile-loading-screen">
              <div className="profile-loading-spinner" />
              <div className="profile-loading-text">
                {lang === "ru"
                  ? "СИНХРОНИЗАЦИЯ ДАННЫХ С ИГРОВЫМИ СЕРВЕРАМИ..."
                  : "SYNCING PROFILE FROM GAME SERVERS..."}
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
          <section id="view-dashboard" style={{ display: "block" }}>
            <div className="player-banner">
              <div className="player-info-left">
                {player?.avatar && (
                  <img
                    className="player-avatar"
                    src={iconUrl(player.avatar.icon)}
                    alt={player.nickname}
                    onError={(e) => handleImageFallback(e, player.avatar.icon)}
                  />
                )}
                <div className="player-name-block">
                  <div className="player-nickname">
                    <span>{player?.nickname || (lang === "ru" ? "Первопроходец" : "Trailblazer")}</span>
                    <span className="player-uid-badge">UID: {player?.uid}</span>
                    <span className="player-level-badge">
                      {t.lvl} {player?.level}
                    </span>
                  </div>
                  {player?.signature && (
                    <div className="player-signature">«{player.signature}»</div>
                  )}
                </div>
              </div>

              <div className="player-actions">
                <div className="auto-refresh-indicator" title={lang === "ru" ? "Авто-синхронизация активна: обновляет профиль при смене фокуса из игры и каждые 28 сек" : "Auto-sync active: refreshes upon window focus & every 28s"}>
                  <span className="auto-refresh-dot" />
                  <span>{lang === "ru" ? "АВТО-СИНХРОНИЗАЦИЯ" : "AUTO-SYNC"}</span>
                </div>
                <button
                  type="button"
                  className={`btn-outline refresh-btn ${isRefreshing ? "loading" : ""}`}
                  onClick={() => fetchProfile(player?.uid, false, true)}
                  disabled={isRefreshing}
                  title={
                    lang === "ru"
                      ? "Принудительно запросить свежие данные из игры прямо сейчас"
                      : "Force fetch fresh game data immediately"
                  }
                >
                  <RefreshIcon size={12} className={`refresh-icon ${isRefreshing ? "spinning" : ""}`} />{" "}
                  {isRefreshing
                    ? lang === "ru"
                      ? "ОБНОВЛЕНИЕ..."
                      : "REFRESHING..."
                    : lang === "ru"
                      ? "ОБНОВИТЬ"
                      : "REFRESH"}
                </button>
                <button
                  type="button"
                  className="btn-outline back-btn"
                  onClick={handleBackToHome}
                  title={
                    lang === "ru"
                      ? "Вернуться к смене UID (← в браузере, мышь, стрелка клавиатуры)"
                      : "Back to UID change (← Browser, Mouse, Keyboard Arrow)"
                  }
                >
                  <span className="arrow-icon">←</span> {t.btnBackUid}
                </button>
                <button type="button" className="btn-outline" onClick={handleOpenTrophy}>
                  {t.btnTrophy}
                </button>
              </div>
            </div>

            <ShowcaseRoster
              characters={currentProfile.characters}
              activeIndex={activeIndex}
              onSelect={handleSelectCharacter}
              t={t}
              lang={lang}
            />

            <DashboardNav lang={lang} />

            <div id="section-overview">
              <CharacterOverview character={activeChar} audit={audit} t={t} lang={lang} />
            </div>

            <div className="dashboard-grid">
              <div className="dashboard-col-left">
                <div id="section-score" className="panel panel-overall-score" style={{ marginBottom: "24px" }}>
                  <OverallScorePanel
                    audit={audit}
                    t={t}
                    lang={lang}
                    leaderboardData={leaderboardData}
                    onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
                  />
                </div>
                <div id="section-stats" className="panel panel-combat-stats" style={{ marginBottom: "24px" }}>
                  <div className="panel-title combat-stats-title">
                    <span className="combat-title-main">{t.combatStatsTitle}</span>
                    <span className="combat-title-sub">{t.basePlusBonus}</span>
                  </div>
                  <CombatStats character={activeChar} t={t} lang={lang} />
                </div>
                <div className="panel panel-relics-audit">
                  <RelicsAuditPanel audit={audit} t={t} lang={lang} layoutMode={relicsLayoutMode} />
                </div>
              </div>

              <div className="dashboard-col-right">
                <div id="section-relics" className="panel panel-relics" style={{ marginBottom: "24px" }}>
                  <div
                    className="panel-title"
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                  >
                    <span>{t.relicsTitle}</span>
                    <span className="badge-sync-hsr">{t.verifiedData}</span>
                  </div>
                  <RelicsGrid
                    character={activeChar}
                    audit={audit}
                    t={t}
                    lang={lang}
                    layoutMode={relicsLayoutMode}
                    onLayoutModeChange={handleRelicsLayoutModeChange}
                  />
                </div>
                <div className="panel panel-sets" style={{ marginBottom: "24px" }}>
                  <div className="panel-title">
                    <span>{t.setsTitle}</span>
                  </div>
                  <SetBonuses character={activeChar} t={t} lang={lang} />
                </div>
                <div id="section-simulation">
                  <CombatSimulationCard
                    character={activeChar}
                    audit={audit}
                    stats={audit?.stats}
                    showcase={currentProfile?.characters || []}
                    lang={lang}
                  />
                </div>
              </div>
            </div>

            <TrophyModal
              isOpen={isTrophyOpen}
              onClose={handleCloseTrophy}
              character={activeChar}
              audit={audit}
              uid={player?.uid}
              t={t}
              lang={lang}
              layoutMode={relicsLayoutMode}
              onLayoutModeChange={handleRelicsLayoutModeChange}
            />

            <LeaderboardModal
              isOpen={isLeaderboardOpen}
              onClose={() => setIsLeaderboardOpen(false)}
              character={activeChar}
              uid={player?.uid}
              audit={audit}
              leaderboardData={leaderboardData}
              lang={lang}
            />
          </section>
        )}
      </main>
    </div>
  );
}
