import React, { useState, useEffect } from "react";
import { TrophyIcon, CheckIcon, SparklesIcon } from "./Icons.jsx";
import { iconUrl, handleImageFallback, getCharHeadIcon, getCharAvatarPath } from "../utils/audit.js";

export default function LeaderboardModal({ isOpen, onClose, character, uid, audit, leaderboardData, lang = "ru" }) {
  const [topList, setTopList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isLiveDb, setIsLiveDb] = useState(false);
  const isRu = lang === "ru";

  const charId = character?.id;

  useEffect(() => {
    if (!isOpen || !charId) return;
    setLoading(true);
    fetch(`/api/leaderboard?characterId=${charId}&limit=50`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTopList(data.leaderboard || []);
          setTotalCount(data.total || (leaderboardData?.total || 0));
          setIsLiveDb(Boolean(data.isLiveDatabase));
        }
      })
      .catch((err) => console.warn("Failed to fetch leaderboard table:", err))
      .finally(() => setLoading(false));
  }, [isOpen, charId, leaderboardData]);

  if (!isOpen) return null;

  const currentRank = leaderboardData?.rank || null;
  const currentTotal = totalCount || leaderboardData?.total || 1;
  const currentTopPercent = leaderboardData?.topPercent || audit?.topPercent || 50.0;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content leaderboard-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-left">
            <TrophyIcon size={20} color="var(--accent)" />
            <div className="modal-title-group">
              <h3 className="modal-title">
                {isRu ? "Глобальный лидерборд сборок" : "Global Build Leaderboards"}
              </h3>
              <span className="modal-subtitle">
                {character?.name} • {isRu ? `Всего проверено: ${currentTotal.toLocaleString()}` : `Total verified: ${currentTotal.toLocaleString()}`}
              </span>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Current Player Status Banner */}
        <div className="leaderboard-player-banner">
          <div className="player-banner-avatar">
            <img
              src={getCharHeadIcon(character)}
              alt={character?.name || "Character"}
              onError={(e) => handleImageFallback(e, getCharAvatarPath(character))}
            />
          </div>
          <div className="player-banner-info">
            <div className="player-banner-head">
              <span className="player-banner-name">{character?.name}</span>
              <span className="player-banner-uid">UID: {uid}</span>
            </div>
            <div className="player-banner-stats">
              <span className="player-banner-score">
                {audit?.score} <span className="score-denom">/100</span>
              </span>
              <span className="player-banner-rank-tag">
                {currentRank ? (
                  <>#{currentRank.toLocaleString()} {isRu ? `из ${currentTotal.toLocaleString()}` : `of ${currentTotal.toLocaleString()}`}</>
                ) : (
                  <>{isRu ? "В рейтинге" : "Ranked"}</>
                )}
              </span>
              <span className="player-banner-pct">
                TOP {currentTopPercent}%
              </span>
            </div>
          </div>
          <div className="player-banner-badge">
            <span className="badge-grade">GRADE {audit?.grade || "S"}</span>
            <span className="badge-type">
              {isLiveDb ? (
                <span style={{ color: "#00FF88", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <CheckIcon size={11} /> Upstash Redis Live
                </span>
              ) : (
                <span style={{ color: "var(--accent)" }}>
                  ★ Calibrated Percentile
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Leaderboard Table / List */}
        <div className="leaderboard-table-container">
          <div className="leaderboard-table-head">
            <div className="col-rank">{isRu ? "РАНГ" : "RANK"}</div>
            <div className="col-player">{isRu ? "ИГРОК / UID" : "PLAYER / UID"}</div>
            <div className="col-cone">{isRu ? "КОНУС" : "LIGHT CONE"}</div>
            <div className="col-cv">{isRu ? "КРИТ. МАССА" : "CRIT VALUE"}</div>
            <div className="col-spd">{isRu ? "СКОРОСТЬ" : "SPEED"}</div>
            <div className="col-score">{isRu ? "ИНДЕКС" : "INDEX"}</div>
          </div>

          <div className="leaderboard-table-body">
            {loading ? (
              <div className="leaderboard-empty-state">
                <span className="spinner" />
                <p>{isRu ? "Загрузка таблицы лидеров..." : "Loading leaderboards..."}</p>
              </div>
            ) : topList.length > 0 ? (
              topList.map((entry) => {
                const isCurrent = String(entry.uid) === String(uid);
                return (
                  <div key={entry.uid} className={`leaderboard-row ${isCurrent ? "current-player-row" : ""}`}>
                    <div className="col-rank">
                      {entry.rank === 1 && <span className="rank-crown gold">🥇 1</span>}
                      {entry.rank === 2 && <span className="rank-crown silver">🥈 2</span>}
                      {entry.rank === 3 && <span className="rank-crown bronze">🥉 3</span>}
                      {entry.rank > 3 && <span className="rank-num">#{entry.rank}</span>}
                    </div>
                    <div className="col-player">
                      <span className="player-nick">{entry.nickname}</span>
                      <span className="player-uid-sub">UID: {entry.uid ? `${entry.uid.slice(0, 3)}***${entry.uid.slice(-2)}` : "—"}</span>
                    </div>
                    <div className="col-cone">
                      <span className="cone-name">{entry.lightCone?.name || "—"}</span>
                      {entry.lightCone?.rank && (
                        <span className="cone-rank">S{entry.lightCone.rank}</span>
                      )}
                    </div>
                    <div className="col-cv">
                      <span className="stat-mono">{entry.cv ? `${entry.cv} CV` : "—"}</span>
                    </div>
                    <div className="col-spd">
                      <span className="stat-mono">{entry.spd ? `${entry.spd} SPD` : "—"}</span>
                    </div>
                    <div className="col-score">
                      <span className="score-val-mono">{entry.score}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="leaderboard-empty-state">
                <p>
                  {isRu
                    ? "Ваш билд успешно добавлен в очередь базы данных. Сборки других игроков будут появляться здесь по мере их проверки на сайте и в боте."
                    : "Your build has been registered in the database queue. Submissions will accumulate here as players audit profiles."}
                </p>
                <div className="leaderboard-current-card">
                  <span>{character?.name}</span>
                  <span className="score-pill">INDEX {audit?.score} • TOP {currentTopPercent}%</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <div className="modal-footer-note">
            <SparklesIcon size={14} color="var(--accent)" />
            <span>
              {isRu
                ? "Ранжирование обновляется в реальном времени через Upstash Redis (Sorted Sets O(log N)) по стандарту Seeleland/Akasha."
                : "Real-time ranking powered by Upstash Redis (Sorted Sets O(log N)) conforming to Seeleland/Akasha standards."}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
