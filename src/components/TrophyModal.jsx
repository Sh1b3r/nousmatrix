import React, { useState, useRef, useEffect } from "react";
import { getCharAvatarPath, getCharHeadIcon, handleImageFallback, iconUrl } from "../utils/audit";
import { runCombatSimulation } from "../utils/simulation";
import { formatStatName } from "../utils/i18n";
import { TrophyIcon, CopyIcon, DownloadIcon, CheckIcon, SparklesIcon } from "./Icons.jsx";

export default function TrophyModal({ isOpen, onClose, character, audit, uid, t, lang = "ru" }) {
  const [isCopying, setIsCopying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [isOpen]);

  if (!isOpen || !character || !audit) return null;

  const isRu = lang === "ru";
  const stats = audit.stats || {};
  const archetype = audit.detectedRole?.targetArchetype || "CRIT_DPS";
  const combatSim = runCombatSimulation(character, stats, archetype, lang);
  const relics = character.relics || [];
  const slotNamesRu = ["ГОЛОВА", "РУКИ", "ТЕЛО", "НОГИ", "СФЕРА", "ВЕРВЬ"];
  const slotNamesEn = ["HEAD", "HANDS", "BODY", "FEET", "SPHERE", "ROPE"];

  const generateExportCanvas = async () => {
    if (!cardRef.current) return null;
    const { default: html2canvas } = await import("html2canvas");
    return await html2canvas(cardRef.current, {
      scale: 2.5,
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#0C0814",
      logging: false,
      windowWidth: 1200,
      ignoreElements: (el) => el.classList && el.classList.contains("trophy-controls-bar"),
      onclone: (clonedDoc, clonedEl) => {
        clonedEl.style.width = "1000px";
        clonedEl.style.maxWidth = "1000px";
        clonedEl.style.minWidth = "1000px";
        const controls = clonedEl.querySelector(".trophy-controls-bar");
        if (controls) {
          controls.remove();
        }
      }
    });
  };

  const handleCopyImage = async () => {
    try {
      setIsCopying(true);
      const canvas = await generateExportCanvas();
      if (!canvas) throw new Error("Canvas rendering failed");
      const blob = await new Promise((res) => canvas.toBlob(res, "image/png"));
      if (blob && navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob })
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } else {
        handleDownloadImage();
      }
    } catch (err) {
      console.warn("Copy failed, falling back to download:", err);
      handleDownloadImage();
    } finally {
      setIsCopying(false);
    }
  };

  const handleDownloadImage = async () => {
    try {
      setIsDownloading(true);
      const canvas = await generateExportCanvas();
      if (!canvas) return;
      const src = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `NousMatrix_${character.name.replace(/\s+/g, "_")}_UID${uid}.png`;
      link.href = src;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download error:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      id="modal-trophy"
      className="trophy-modal-backdrop"
      onClick={(e) => {
        if (e.target.id === "modal-trophy") onClose();
      }}
    >
      <div className="trophy-modal-dialog">
        <div className="trophy-viewport-container">
          <div ref={cardRef} className="showcase-card">
            {/* ТУЛБАР УПРАВЛЕНИЯ ВНУТРИ КАРТОЧКИ (автоматически исключается при копировании/скачивании) */}
            <div className="trophy-controls-bar">
              <div className="trophy-controls-left">
                <span className="trophy-controls-title">
                  <TrophyIcon size={15} />
                  <span>{isRu ? "БИЛД-КАРТОЧКА NOUSMATRIX" : "NOUSMATRIX BUILD CARD"}</span>
                </span>
                <span className="trophy-controls-hint">
                  {isRu ? "Официальный верифицированный аудит сборки" : "Official verified build audit"}
                </span>
              </div>
              <div className="trophy-controls-actions">
                <button
                  className="btn-submit trophy-action-btn copy-btn"
                  onClick={handleCopyImage}
                  disabled={isCopying}
                >
                  {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
                  <span>
                    {copied
                      ? (isRu ? "СКОПИРОВАНО!" : "COPIED!")
                      : isCopying ? (isRu ? "ГЕНЕРАЦИЯ..." : "RENDERING...")
                        : (isRu ? "СКОПИРОВАТЬ" : "COPY")}
                  </span>
                </button>
                <button
                  className="btn-outline trophy-action-btn download-btn"
                  onClick={handleDownloadImage}
                  disabled={isDownloading}
                >
                  <DownloadIcon size={14} />
                  <span>{isDownloading ? "..." : (isRu ? "СКАЧАТЬ PNG" : "DOWNLOAD PNG")}</span>
                </button>
                <button className="btn-close-modal" onClick={onClose} title={isRu ? "Закрыть" : "Close"}>×</button>
              </div>
            </div>

            {/* ШАПКА: аватар + имя + путь / элемент */}
      <div className="showcase-header">
        <div className="showcase-char-identity">
          <div className="showcase-avatar-ring">
            <img
              src={getCharHeadIcon(character)}
              alt={character.name}
              className="showcase-avatar-img"
              crossOrigin="anonymous"
              onError={(e) => handleImageFallback(e, getCharAvatarPath(character))}
            />
          </div>
          <div className="showcase-name-col">
            <div className="showcase-char-title">
              <h2 className="showcase-char-name">{character.name}</h2>
              <span className="showcase-stars">{"★".repeat(character.rarity || 5)}</span>
            </div>
            <div className="showcase-pills-row">
              <span className="showcase-pill">{isRu ? "УР. " : "LV. "}{character.level}/80</span>
              <span className="showcase-pill accent">{isRu ? "Э" : "E"}{character.rank}</span>
              <span className="showcase-pill">{character.path?.name || "—"}</span>
              <span className="showcase-pill">{character.element?.name || "—"}</span>
            </div>
          </div>
        </div>

        {character.light_cone && (
          <div className="showcase-cone-box">
            <img
              src={iconUrl(character.light_cone.icon)}
              alt={character.light_cone.name}
              className="showcase-cone-img"
              crossOrigin="anonymous"
              onError={(e) => handleImageFallback(e, character.light_cone.icon)}
            />
            <div className="showcase-cone-meta">
              <span className="showcase-cone-name">{character.light_cone.name}</span>
              <span className="showcase-cone-sub">
                {isRu ? "Н" : "S"}{character.light_cone.rank} • {isRu ? "УР. " : "LV. "}{character.light_cone.level}/80
              </span>
            </div>
          </div>
        )}

        <div className="showcase-score-box">
          <div className="showcase-rank-tag">
            <TrophyIcon size={13} />
            <span>{isRu ? "ГЛОБАЛЬНЫЙ ТОП " : "GLOBAL TOP "}{audit.topPercent}{isRu ? "%" : "%"}</span>
          </div>
          <div className="showcase-score-val">
            <span className="score-num">{audit.score}</span>
            <span className="score-denom">/100</span>
          </div>
          <span className="showcase-uid">UID: {uid}</span>
        </div>
      </div>

      {/* СТАТ-БАР: 4 ключевых показателя */}
      <div className="showcase-stats-bar">
        <div className="showcase-stat-item">
          <span className="stat-label">{isRu ? "СКОРОСТЬ (SPD)" : "SPEED (SPD)"}</span>
          <span className="stat-value text-accent">{stats.spd ? stats.spd.toFixed(1) : "100.0"}</span>
          <span className="stat-sub">
            {stats.spd >= 160 ? (isRu ? "[160+ КАП]" : "[160+ CAP]")
              : stats.spd >= 145 ? (isRu ? "[145+ ЗОНА]" : "[145+ ZONE]")
                : (isRu ? "[134+ ОК]" : "[134+ OK]")}
          </span>
        </div>

        <div className="showcase-stat-item">
          <span className="stat-label">{isRu ? "КРИТМАССА (CV)" : "CRIT VALUE (CV)"}</span>
          <span className="stat-value">{stats.cv ? stats.cv.toFixed(1) : "—"}</span>
          <span className="stat-sub">
            {stats.cr ? stats.cr.toFixed(1) : 0}{isRu ? "% КШ / " : "% CR / "}
            {stats.cd ? stats.cd.toFixed(1) : 0}{isRu ? "% КУ" : "% CD"}
          </span>
        </div>

        <div className="showcase-stat-item">
          <span className="stat-label">{isRu ? "АТК / HP" : "ATK / HP"}</span>
          <span className="stat-value">
            {stats.hp > 5000 ? `${Math.round(stats.hp)} HP` : `${Math.round(stats.atk || 0)} ATK`}
          </span>
          <span className="stat-sub">
            {isRu ? "ЗАЩИТА: " : "DEF: "}{Math.round(stats.def || 0)}{isRu ? " ЗАЩ" : " DEF"}
          </span>
        </div>

        <div className="showcase-stat-item">
          <span className="stat-label">
            {stats.be > 40 ? (isRu ? "ЭФФЕКТ ПРОБИТИЯ" : "BREAK EFFECT (BE)")
              : stats.ehr > 20 ? (isRu ? "ШАНС ПОПАДАНИЯ (ШПЭ)" : "EFFECT HIT RATE (EHR)")
                : (isRu ? "ВЭ (ERR)" : "ENERGY (ERR)")}
          </span>
          <span className="stat-value text-accent">
            {stats.be > 40 ? `${stats.be.toFixed(1)}%`
              : stats.ehr > 20 ? `${stats.ehr.toFixed(1)}%`
                : `+${stats.err ? stats.err.toFixed(1) : "0"}%`}
          </span>
          <span className="stat-sub">
            {stats.be >= 180 ? (isRu ? "[180% КАП]" : "[180% CAP]")
              : stats.ehr >= 96 ? (isRu ? "[96% КАП]" : "[96% CAP]")
                : (isRu ? "[ОК]" : "[OK]")}
          </span>
        </div>
      </div>

      {/* 6 РЕЛИКВИЙ */}
      <div className="showcase-relics-grid">
        {Array.from({ length: 6 }).map((_, slotIdx) => {
          const slotNum = slotIdx + 1;
          const piece = relics.find((r) => Number(r.type ?? r.pos) === slotNum) || relics[slotIdx];
          const slotTitle = isRu ? slotNamesRu[slotIdx] : slotNamesEn[slotIdx];

          if (!piece) {
            return (
              <div key={`relic-${slotIdx}`} className="showcase-relic-card empty">
                <span className="relic-slot-tag">{slotTitle}</span>
                <span className="relic-empty-text">{isRu ? "Ожидает синхронизации" : "Awaiting sync"}</span>
              </div>
            );
          }

          const mainStatField = piece.main_affix?.field || "";
          const mainStatValue = piece.main_affix?.display || "";
          const mainStatName = piece.main_affix?.name || formatStatName(mainStatField, lang);

          return (
            <div key={`relic-${slotIdx}`} className="showcase-relic-card">
              <div className="relic-card-head">
                <div className="relic-slot-info">
                  <span className="relic-slot-tag">{slotTitle}</span>
                  <span className="relic-name-truncate">{piece.name || piece.set_name}</span>
                </div>
                <span className="relic-level-badge">+{piece.level || 15}</span>
              </div>
              <div className="relic-main-row">
                <span className="relic-main-name">
                  {piece.main_affix?.icon && (
                    <img
                      className="relic-affix-icon main"
                      src={iconUrl(piece.main_affix.icon)}
                      alt=""
                      crossOrigin="anonymous"
                      onError={(e) => handleImageFallback(e, piece.main_affix.icon)}
                    />
                  )}
                  <span>{mainStatName}</span>
                </span>
                <span className="relic-main-val text-accent">{mainStatValue}</span>
              </div>
              <div className="relic-subs-list">
                {(piece.sub_affix || []).slice(0, 4).map((sub, sIdx) => {
                  const upgrades = Math.max(0, (sub.count || 1) - 1);
                  const isKey = ["crit_rate", "crit_dmg", "spd"].includes(sub.field);
                  return (
                    <div key={`sub-${sIdx}`} className={`relic-sub-item ${isKey ? "key-sub" : ""}`}>
                      <span className="sub-name">
                        {sub.icon && (
                          <img
                            className="relic-affix-icon sub"
                            src={iconUrl(sub.icon)}
                            alt=""
                            crossOrigin="anonymous"
                            onError={(e) => handleImageFallback(e, sub.icon)}
                          />
                        )}
                        <span>{formatStatName(sub.field, lang)}</span>
                      </span>
                      <span className="sub-val">
                        <span className="relic-sub-num">{sub.display}</span>
                        <span className="roll-count-tag">{`+${upgrades}`}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* НИЖНИЙ БАННЕР: сет-бонусы + боевая симуляция */}
      <div className="showcase-bottom-banner">
        <div className="bottom-col-left">
          <div className="sets-summary-row">
            {audit.cavern?.setName && (
              <span className="showcase-set-tag">
                <CheckIcon size={12} />
                <span>4/4 {audit.cavern.setName}</span>
              </span>
            )}
            {audit.planar?.setName && (
              <span className="showcase-set-tag planar">
                <CheckIcon size={12} />
                <span>2/2 {audit.planar.setName}</span>
              </span>
            )}
          </div>
          <span className="set-condition-text">
            {audit.planar?.condition || audit.cavern?.condition || (isRu ? "Все бонусы комплектов активны в бою." : "All set bonuses are active in combat.")}
          </span>
        </div>

        {combatSim && (
          <div className="bottom-col-right">
            <div className="sim-meta-box">
              <span className="sim-tag">
                <SparklesIcon size={12} />
                <span>{isRu ? "БОЕВАЯ СИМУЛЯЦИЯ MOC 12" : "MOC 12 COMBAT SIM"}</span>
              </span>
              <span className="sim-score-text">
                {combatSim.metric1Label}: <strong>{combatSim.metric1Value}</strong>
              </span>
              <span className="sim-tier-badge">{combatSim.benchmarkTier}</span>
            </div>
          </div>
        )}
      </div>

      {/* ФУТЕР КАРТЫ */}
      <div className="showcase-footer">
        <span className="footer-brand">
          <img src="/media/NousMatrix-logo.png" alt="" className="footer-logo" />
          <span>{isRu ? "NOUSMATRIX" : "NOUSMATRIX"}</span>
        </span>
        <span className="footer-meta">
          {isRu ? "ВЕРИФИЦИРОВАННЫЙ АУДИТ • UID: " : "VERIFIED AUDIT • UID: "}{uid} • {(new Date()).toLocaleDateString(isRu ? "ru-RU" : "en-GB")}
        </span>
      </div>
    </div>
  </div>
</div>
</div>
  );
}
