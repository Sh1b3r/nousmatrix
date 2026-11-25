import React, { useState, useEffect } from "react";
import { TrophyIcon, CheckIcon, SparklesIcon } from "./Icons.jsx";
import { iconUrl, handleImageFallback, getCharHeadIcon, getCharAvatarPath } from "../utils/audit.js";
import { getDamageLeaderboardScenariosForCharacter } from "../data/damageLeaderboardScenarios.js";
import { localizeCharacterName } from "../utils/i18n.js";

export default function LeaderboardModal({ isOpen, onClose, character, uid, audit, leaderboardData, lang = "ru" }) {
  const [topList, setTopList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isLiveDb, setIsLiveDb] = useState(false);
  const [scenario, setScenario] = useState(null);
  const [selectedScenarioId, setSelectedScenarioId] = useState("build-index");
  const [currentBoardData, setCurrentBoardData] = useState(null);
  const isRu = lang === "ru";

  const charId = character?.id;
  const displayCharacterName = localizeCharacterName(character, lang);
  const damageScenarios = getDamageLeaderboardScenariosForCharacter(charId);

  useEffect(() => {
    if (!isOpen || !charId) return;
    setLoading(true);
    const scenarioParam = selectedScenarioId === "build-index" ? "" : `&scenarioId=${encodeURIComponent(selectedScenarioId)}`;
    const boardRequest = fetch(`/api/leaderboard?characterId=${charId}&limit=50${scenarioParam}`).then((res) => res.json());
    const playerRequest = uid
      ? fetch(`/api/leaderboard?characterId=${charId}&uid=${encodeURIComponent(uid)}${scenarioParam}`).then((res) => res.json())
      : Promise.resolve(null);

    Promise.all([boardRequest, playerRequest])
      .then(([data, playerData]) => {
        if (!data?.success) return;
        setTopList(data.leaderboard || []);
        setTotalCount(data.total || (leaderboardData?.total || 0));
        setIsLiveDb(Boolean(data.isLiveDatabase));
        setScenario(data.scenario || null);
        setCurrentBoardData(playerData?.success && playerData.found ? playerData : null);
      })
      .catch((err) => console.warn("Failed to fetch leaderboard table:", err))
      .finally(() => setLoading(false));
  }, [isOpen, charId, uid, leaderboardData, selectedScenarioId]);

  if (!isOpen) return null;

  const currentData = selectedScenarioId === "build-index" ? (currentBoardData || leaderboardData) : currentBoardData;
  const currentRank = currentData?.rank || null;
  const isDamageBoard = selectedScenarioId !== "build-index";
  const hasLiveRank = Boolean(isLiveDb && currentRank && (totalCount || leaderboardData?.total));
  const currentTotal = hasLiveRank ? (totalCount || currentData?.total || leaderboardData?.total) : 0;
  const currentTopPercent = hasLiveRank
    ? (currentData?.topPercent || 100.0)
    : (isDamageBoard ? null : (audit?.topPercent || 50.0));
  const boardScenario = scenario || leaderboardData?.scenario || null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content leaderboard-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-left">
            <TrophyIcon size={20} color="var(--accent)" />
            <div className="modal-title-group">
              <h3 className="modal-title">
                {isDamageBoard
                  ? (isRu ? "Стандартизированный уронный рейтинг" : "Standardized Damage Leaderboard")
                  : hasLiveRank
                  ? (isRu ? "Рейтинг сборок сообщества" : "Community Build Leaderboard")
                  : (isRu ? "Оценка сборки NousMatrix" : "NousMatrix Build Estimate")}
              </h3>
              <span className="modal-subtitle">
                {displayCharacterName} • {hasLiveRank
                  ? (isRu ? `Сборок в базе: ${currentTotal.toLocaleString()}` : `Builds in database: ${currentTotal.toLocaleString()}`)
                  : isDamageBoard
                    ? (isRu ? "Требуется точное соответствие условиям сценария" : "Exact scenario requirements are required")
                    : (isRu ? "Модельный перцентиль — не рейтинг игроков" : "Model percentile — not a player leaderboard")}
              </span>
              {boardScenario && (
                <span className="modal-subtitle" title={isRu ? boardScenario.methodologyRu : boardScenario.methodologyEn}>
                  {isRu ? `${boardScenario.metricLabelRu} • HSR ${boardScenario.gameVersion}` : `${boardScenario.metricLabelEn} • HSR ${boardScenario.gameVersion}`}
                </span>
              )}
              {damageScenarios.length > 0 && (
                <label className="modal-subtitle" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <span>{isRu ? "Доска:" : "Board:"}</span>
                  <select
                    value={selectedScenarioId}
                    onChange={(event) => setSelectedScenarioId(event.target.value)}
                    aria-label={isRu ? "Выбрать доску рейтинга" : "Select leaderboard"}
                  >
                    <option value="build-index">{isRu ? "Индекс сборки" : "Build index"}</option>
                    {damageScenarios.map((item) => (
                      <option key={item.id} value={item.id}>{isRu ? item.nameRu : item.nameEn}</option>
                    ))}
                  </select>
                </label>
              )}
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
              alt={displayCharacterName || "Character"}
              onError={(e) => handleImageFallback(e, getCharAvatarPath(character))}
            />
          </div>
          <div className="player-banner-info">
            <div className="player-banner-head">
              <span className="player-banner-name">{displayCharacterName}</span>
              <span className="player-banner-uid">UID: {uid}</span>
            </div>
            <div className="player-banner-stats">
              <span className="player-banner-score">
                {selectedScenarioId === "build-index" ? audit?.score : (currentBoardData?.score?.toLocaleString?.() || "—")}
                {selectedScenarioId === "build-index" && <span className="score-denom">/100</span>}
              </span>
              <span className="player-banner-rank-tag">
                {hasLiveRank ? (
                  <>#{currentRank.toLocaleString()} {isRu ? `из ${currentTotal.toLocaleString()}` : `of ${currentTotal.toLocaleString()}`}</>
                ) : (
                  <>{isDamageBoard ? (isRu ? "Проверка допуска" : "Eligibility check") : (isRu ? "Оценка модели" : "Model estimate")}</>
                )}
              </span>
              <span className="player-banner-pct">
                {currentTopPercent === null ? "—" : `TOP ${hasLiveRank ? "" : "≈"}${currentTopPercent}%`}
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
                  {isRu ? "★ Не входит в рейтинг игроков" : "★ Not a player ranking"}
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
            <div className="col-score">{boardScenario?.boardType === "damage" ? (isRu ? "УРОН" : "DAMAGE") : (isRu ? "ИНДЕКС" : "INDEX")}</div>
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
                    ? (isLiveDb
                      ? (isDamageBoard
                        ? "Эта доска принимает только профиль, точно совпадающий с условиями E0S1 и фиксированного сценария. После допуска сборка появится здесь."
                        : "В базе ещё нет других сборок этого персонажа. Рейтинг появится после новых проверок профилей.")
                      : "База рейтинга пока не подключена. Этот экран показывает только модельную оценку; место среди игроков не рассчитывается.")
                    : (isLiveDb
                      ? (isDamageBoard
                        ? "This board accepts only profiles that exactly match its E0S1 and fixed-scenario requirements. Eligible builds appear here."
                        : "There are no other builds for this character in the database yet. Rankings appear as profiles are audited.")
                      : "The leaderboard database is not connected yet. This screen shows only a model estimate, not a player placement.")}
                </p>
                <div className="leaderboard-current-card">
                  <span>{displayCharacterName}</span>
                  <span className="score-pill">{boardScenario?.boardType === "damage" ? (isRu ? "УРОН" : "DAMAGE") : "INDEX"} {selectedScenarioId === "build-index" ? audit?.score : "—"}{currentTopPercent === null ? "" : ` • TOP ${hasLiveRank ? "" : "≈"}${currentTopPercent}%`}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <div className="modal-footer-note">
            <SparklesIcon size={14} color="var(--accent)" />
            <span>
              {isLiveDb
                ? (isRu
                  ? `${boardScenario?.methodologyRu || "Ранг строится по сборкам, отправленным в NousMatrix."} Обновляется в реальном времени через Upstash Redis.`
                  : `${boardScenario?.methodologyEn || "Ranks are based on builds submitted to NousMatrix."} Updates in real time through Upstash Redis.`)
                : (isRu
                  ? "Для настоящего рейтинга требуется подключённая база Upstash Redis. До этого показывается только калиброванная оценка модели."
                  : "A live Upstash Redis database is required for real rankings. Until then, only the calibrated model estimate is shown.")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
