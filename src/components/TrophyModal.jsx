import React, { useState, useRef, useEffect } from "react";
import { getCharAvatarPath, getCharHeadIcon, handleImageFallback, iconUrl } from "../utils/audit";
import { runCombatSimulation } from "../utils/simulation";
import { formatStatName } from "../utils/i18n";
import { resolveRelicSetInfo } from "../utils/setDefinitions";
import { TrophyIcon, CopyIcon, DownloadIcon, CheckIcon, SparklesIcon, SphereIcon, RopeIcon, WarnIcon } from "./Icons.jsx";

const PROPERTY_ICONS = {
  hp: "icon/property/IconMaxHP.png",
  atk: "icon/property/IconAttack.png",
  def: "icon/property/IconDefence.png",
  spd: "icon/property/IconSpeed.png",
  crit_rate: "icon/property/IconCriticalChance.png",
  crit_dmg: "icon/property/IconCriticalDamage.png",
  break_dmg: "icon/property/IconBreakUp.png",
  break_effect: "icon/property/IconBreakUp.png",
  sp_rate: "icon/property/IconEnergyRecovery.png",
  energy_regen_rate: "icon/property/IconEnergyRecovery.png",
  effect_hit: "icon/property/IconStatusProbability.png",
  effect_res: "icon/property/IconStatusResistance.png",
  heal_rate: "icon/property/IconHealRatio.png",
  physical_dmg: "icon/property/IconPhysicalAddedRatio.png",
  fire_dmg: "icon/property/IconFireAddedRatio.png",
  ice_dmg: "icon/property/IconIceAddedRatio.png",
  thunder_dmg: "icon/property/IconThunderAddedRatio.png",
  lightning_dmg: "icon/property/IconThunderAddedRatio.png",
  wind_dmg: "icon/property/IconWindAddedRatio.png",
  quantum_dmg: "icon/property/IconQuantumAddedRatio.png",
  imaginary_dmg: "icon/property/IconImaginaryAddedRatio.png"
};

const ELEMENT_ICONS = {
  physical: "icon/element/Physical.png",
  fire: "icon/element/Fire.png",
  ice: "icon/element/Ice.png",
  thunder: "icon/element/Thunder.png",
  lightning: "icon/element/Thunder.png",
  wind: "icon/element/Wind.png",
  quantum: "icon/element/Quantum.png",
  imaginary: "icon/element/Imaginary.png"
};

const PATH_ICONS = {
  warrior: "icon/path/Warrior.png",
  destruction: "icon/path/Warrior.png",
  rogue: "icon/path/Rogue.png",
  hunt: "icon/path/Rogue.png",
  thehunt: "icon/path/Rogue.png",
  mage: "icon/path/Mage.png",
  erudition: "icon/path/Mage.png",
  shaman: "icon/path/Shaman.png",
  harmony: "icon/path/Harmony.png",
  warlock: "icon/path/Warlock.png",
  nihility: "icon/path/Nihility.png",
  knight: "icon/path/Knight.png",
  preservation: "icon/path/Knight.png",
  priest: "icon/path/Priest.png",
  abundance: "icon/path/Priest.png",
  memory: "icon/path/Memory.png",
  remembrance: "icon/path/Remembrance.png"
};

const resolveElementIcon = (elem) => {
  if (!elem) return null;
  if (elem.icon) return elem.icon;
  const key = String(elem.id || elem.name || "").toLowerCase().replace(/[\s-]+/g, "");
  return ELEMENT_ICONS[key] || null;
};

const resolvePathIcon = (path) => {
  if (!path) return null;
  if (path.icon) return path.icon;
  const key = String(path.id || path.name || "").toLowerCase().replace(/[\s-]+/g, "");
  return PATH_ICONS[key] || null;
};

const resolveAffixIcon = (affix) => {
  if (!affix) return null;
  if (affix.icon) return affix.icon;
  const fieldKey = String(affix.field || affix.name || "").toLowerCase().replace(/[\s-]+/g, "_");
  return PROPERTY_ICONS[fieldKey] || null;
};

export default function TrophyModal({
  isOpen,
  onClose,
  character,
  audit,
  uid,
  t,
  lang = "ru",
  layoutMode: externalLayoutMode,
  onLayoutModeChange
}) {
  const [internalLayoutMode, setInternalLayoutMode] = useState("grouped");
  const layoutMode = externalLayoutMode !== undefined ? externalLayoutMode : internalLayoutMode;
  const handleLayoutModeChange = (mode) => {
    setInternalLayoutMode(mode);
    onLayoutModeChange?.(mode);
  };
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
  const elemIcon = resolveElementIcon(character.element);
  const pathIcon = resolvePathIcon(character.path);

  const slotTitles = [
    isRu ? "ГОЛОВА" : "HEAD",
    isRu ? "КИСТИ" : "HANDS",
    isRu ? "ТЕЛО" : "BODY",
    isRu ? "НОГИ" : "FEET",
    isRu ? "ПЛАНАРНАЯ СФЕРА" : "PLANAR SPHERE",
    isRu ? "СОЕДИНИТЕЛЬНАЯ ВЕРЕВКА" : "LINK ROPE"
  ];

  const getGradeTier = (score) => {
    const s = Number(score) || 0;
    if (s >= 92) return { grade: "SSS", labelRu: "ЭТАЛОН БИЛДА", labelEn: "PRIME BENCHMARK", color: "var(--accent)" };
    if (s >= 85) return { grade: "SS", labelRu: "ПРЕВОСХОДНЫЙ", labelEn: "EXCELLENT", color: "#00E5FF" };
    if (s >= 75) return { grade: "S", labelRu: "ОТЛИЧНЫЙ", labelEn: "GREAT", color: "#00FF88" };
    if (s >= 65) return { grade: "A", labelRu: "ХОРОШИЙ", labelEn: "SOLID BUILD", color: "#FFB74D" };
    if (s >= 50) return { grade: "B", labelRu: "ТРЕБУЕТ ДОРАБОТКИ", labelEn: "WORK IN PROGRESS", color: "#FFA726" };
    return { grade: "C", labelRu: "НАЧАЛЬНЫЙ", labelEn: "ENTRY LEVEL", color: "#EF5350" };
  };
  const gradeInfo = getGradeTier(audit.score);

  // Exact base + additions calculation matching CombatStats.jsx
  const baseMap = {};
  (character.attributes || []).forEach((a) => {
    baseMap[a.field] = a;
  });
  const addMap = {};
  (character.additions || []).forEach((a) => {
    addMap[a.field] = a;
  });

  const hpBase = baseMap["hp"] ? Math.round(baseMap["hp"].value) : 0;
  const hpAdd = addMap["hp"] ? Math.round(addMap["hp"].value) : 0;
  const hpTotal = hpBase + hpAdd;

  const atkBase = baseMap["atk"] ? Math.round(baseMap["atk"].value) : 0;
  const atkAdd = addMap["atk"] ? Math.round(addMap["atk"].value) : 0;
  const atkTotal = atkBase + atkAdd;

  const defBase = baseMap["def"] ? Math.round(baseMap["def"].value) : 0;
  const defAdd = addMap["def"] ? Math.round(addMap["def"].value) : 0;
  const defTotal = defBase + defAdd;

  const spdBase = baseMap["spd"] ? Number(baseMap["spd"].value).toFixed(1) : "100.0";
  const spdAdd = addMap["spd"] ? Number(addMap["spd"].value).toFixed(1) : "0.0";
  const spdTotal = (parseFloat(spdBase) + parseFloat(spdAdd)).toFixed(1);

  const crBase = baseMap["crit_rate"] ? baseMap["crit_rate"].value * 100 : 5;
  const crAdd = addMap["crit_rate"] ? addMap["crit_rate"].value * 100 : 0;
  const crTotal = (crBase + crAdd).toFixed(1) + "%";

  const cdBase = baseMap["crit_dmg"] ? baseMap["crit_dmg"].value * 100 : 50;
  const cdAdd = addMap["crit_dmg"] ? addMap["crit_dmg"].value * 100 : 0;
  const cdTotal = (cdBase + cdAdd).toFixed(1) + "%";

  const beTotal = addMap["break_dmg"] ? (addMap["break_dmg"].value * 100).toFixed(1) + "%" : null;
  const errTotal = addMap["sp_rate"] ? (100 + addMap["sp_rate"].value * 100).toFixed(1) + "%" : null;
  const ehrTotal = addMap["effect_hit"] && addMap["effect_hit"].value > 0 ? (addMap["effect_hit"].value * 100).toFixed(1) + "%" : null;

  const elementFields = [
    { field: "physical_dmg", icon: "icon/property/IconPhysicalAddedRatio.png", nameRu: "Физ. урон", nameEn: "Physical DMG" },
    { field: "fire_dmg", icon: "icon/property/IconFireAddedRatio.png", nameRu: "Огн. урон", nameEn: "Fire DMG" },
    { field: "ice_dmg", icon: "icon/property/IconIceAddedRatio.png", nameRu: "Лед. урон", nameEn: "Ice DMG" },
    { field: "thunder_dmg", icon: "icon/property/IconThunderAddedRatio.png", nameRu: "Электр. урон", nameEn: "Lightning DMG" },
    { field: "wind_dmg", icon: "icon/property/IconWindAddedRatio.png", nameRu: "Ветр. урон", nameEn: "Wind DMG" },
    { field: "quantum_dmg", icon: "icon/property/IconQuantumAddedRatio.png", nameRu: "Квант. урон", nameEn: "Quantum DMG" },
    { field: "imaginary_dmg", icon: "icon/property/IconImaginaryAddedRatio.png", nameRu: "Мним. урон", nameEn: "Imaginary DMG" }
  ];
  const activeElem = elementFields.find((el) => addMap[el.field] && addMap[el.field].value > 0);
  const elemDmgTotal = activeElem ? (addMap[activeElem.field].value * 100).toFixed(1) + "%" : null;

  // Slot matching
  const isSphere = (r) => {
    if (!r) return false;
    const num = Number(r.type ?? r.pos);
    if (num === 5) return true;
    const typeStr = String(r.type || r.type_name || "").toUpperCase();
    if (typeStr === "NECK" || typeStr === "SPHERE" || typeStr.includes("СФЕР")) return true;
    const idStr = String(r.id || r.tid || "");
    if (idStr.length === 5 && idStr.endsWith("5")) return true;
    return false;
  };
  const isRope = (r) => {
    if (!r) return false;
    const num = Number(r.type ?? r.pos);
    if (num === 6) return true;
    const typeStr = String(r.type || r.type_name || "").toUpperCase();
    if (typeStr === "OBJECT" || typeStr === "ROPE" || typeStr.includes("ВЕРВ")) return true;
    const idStr = String(r.id || r.tid || "");
    if (idStr.length === 5 && idStr.endsWith("6")) return true;
    return false;
  };

  const getSlotPiece = (slotIdx) => {
    if (slotIdx === 4) {
      return relics.find(isSphere) || relics.find((r, i) => i === 4 && relics.length >= 5) || null;
    }
    if (slotIdx === 5) {
      return relics.find(isRope) || relics.find((r, i) => i === 5 && relics.length >= 6) || null;
    }
    const slotNum = slotIdx + 1;
    return relics.find((r) => Number(r.type ?? r.pos) === slotNum) || relics[slotIdx] || null;
  };

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
        clonedEl.style.width = "1180px";
        clonedEl.style.maxWidth = "1180px";
        clonedEl.style.minWidth = "1180px";
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
                <div className="relic-view-toggle mini trophy-layout-toggle">
                  <button
                    type="button"
                    className={`toggle-btn ${layoutMode === "grouped" ? "active" : ""}`}
                    onClick={() => handleLayoutModeChange("grouped")}
                    title={isRu ? "По секциям: пещерные (4) и планарные (2)" : "By sections: cavern (4) and planar (2)"}
                  >
                    {isRu ? "ПО СЕКЦИЯМ" : "BY SECTIONS"}
                  </button>
                  <button
                    type="button"
                    className={`toggle-btn ${layoutMode === "unified" ? "active" : ""}`}
                    onClick={() => handleLayoutModeChange("unified")}
                    title={isRu ? "Все 6 слотов слитной сеткой" : "All 6 slots unified"}
                  >
                    {isRu ? "ВСЕ СЛОТЫ" : "ALL SLOTS"}
                  </button>
                </div>
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

            {/* ШАПКА: Слева (Аватар + Имя + Иконки Пути/Стихии + Конус), Справа (Общий скор) */}
            <div className="showcase-header">
              <div className="showcase-header-left">
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
                    <h2 className="showcase-char-name">{character.name}</h2>
                    <span className="showcase-stars">{"★".repeat(character.rarity || 5)}</span>
                    <div className="showcase-pills-row">
                      <span className="showcase-pill">{isRu ? "УР. " : "LV. "}{character.level}/80</span>
                      <span className="showcase-pill accent">{isRu ? "Э" : "E"}{character.rank}</span>
                      {elemIcon && (
                        <span
                          className="showcase-pill showcase-icon-pill element-pill"
                          title={character.element?.name ? `${isRu ? "Стихия: " : "Element: "}${character.element.name}` : ""}
                          style={character.element?.color ? { borderColor: `${character.element.color}66` } : undefined}
                        >
                          <img
                            src={iconUrl(elemIcon)}
                            alt={character.element?.name || "Element"}
                            className="showcase-badge-icon element-icon"
                            crossOrigin="anonymous"
                            onError={(e) => handleImageFallback(e, elemIcon)}
                          />
                        </span>
                      )}
                      {pathIcon && (
                        <span
                          className="showcase-pill showcase-icon-pill path-pill"
                          title={character.path?.name ? `${isRu ? "Путь: " : "Path: "}${character.path.name}` : ""}
                        >
                          <img
                            src={iconUrl(pathIcon)}
                            alt={character.path?.name || "Path"}
                            className="showcase-badge-icon path-icon"
                            crossOrigin="anonymous"
                            onError={(e) => handleImageFallback(e, pathIcon)}
                          />
                        </span>
                      )}
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
                        {isRu ? "S" : "S"}{character.light_cone.rank} • {isRu ? "УР. " : "LV. "}{character.light_cone.level}/80
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="showcase-score-box">
                <div className="showcase-score-top-row">
                  <div className="showcase-rank-tag">
                    <TrophyIcon size={13} />
                    <span>{isRu ? "ГЛОБАЛЬНЫЙ ТОП " : "GLOBAL TOP "}{audit.topPercent}{isRu ? "%" : "%"}</span>
                  </div>
                  <span className="showcase-uid">UID: {uid}</span>
                </div>
                <div className="showcase-score-val">
                  <span className="score-num">{audit.score}</span>
                  <span className="score-denom">/100</span>
                </div>
                <div className="showcase-grade-row">
                  <span className="score-grade-pill" style={{ color: gradeInfo.color, borderColor: gradeInfo.color }}>
                    GRADE {gradeInfo.grade} • {isRu ? gradeInfo.labelRu : gradeInfo.labelEn}
                  </span>
                  <span className="score-verified-stamp">
                    <CheckIcon size={11} />
                    <span>{isRu ? "ВАЛИДИРОВАНО" : "VALIDATED"}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* ДВУХКОЛОНОЧНЫЙ БЛОК: СЛЕВА СТАТЫ И СИМУЛЯЦИЯ, СПРАВА РЕЛИКВИИ И СЕТЫ (КАК НА САЙТЕ) */}
            <div className="showcase-main-layout">
              {/* ЛЕВАЯ КОЛОНКА: ХАРАКТЕРИСТИКИ И СИМУЛЯЦИЯ */}
              <div className="showcase-col-left">
                {/* 1. БОЕВЫЕ ХАРАКТЕРИСТИКИ (БАЗА + БОНУС = ИТОГО) */}
                <div className="showcase-section-box">
                  <div className="showcase-section-title">
                    <span>{isRu ? "БОЕВЫЕ ХАРАКТЕРИСТИКИ" : "COMBAT STATS"}</span>
                    <span className="section-sub-tag">{isRu ? "БАЗА + БОНУС = ИТОГО" : "BASE + BONUS = TOTAL"}</span>
                  </div>

                  <div className="showcase-stat-table">
                    <div className="showcase-stat-row">
                      <div className="stat-left">
                        <img
                          className="stat-icon"
                          src={iconUrl("icon/property/IconMaxHP.png")}
                          alt="HP"
                          crossOrigin="anonymous"
                          onError={(e) => handleImageFallback(e, "icon/property/IconMaxHP.png")}
                        />
                        <span className="stat-name">{isRu ? "Макс. HP" : "Max HP"}</span>
                      </div>
                      <div className="stat-values">
                        <span className="stat-calc">{hpBase} <span className="stat-bonus">+{hpAdd}</span> =</span>
                        <span className="stat-total">{hpTotal.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="showcase-stat-row">
                      <div className="stat-left">
                        <img
                          className="stat-icon"
                          src={iconUrl("icon/property/IconAttack.png")}
                          alt="ATK"
                          crossOrigin="anonymous"
                          onError={(e) => handleImageFallback(e, "icon/property/IconAttack.png")}
                        />
                        <span className="stat-name">{isRu ? "Сила атаки" : "ATK"}</span>
                      </div>
                      <div className="stat-values">
                        <span className="stat-calc">{atkBase} <span className="stat-bonus">+{atkAdd}</span> =</span>
                        <span className="stat-total">{atkTotal.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="showcase-stat-row">
                      <div className="stat-left">
                        <img
                          className="stat-icon"
                          src={iconUrl("icon/property/IconDefence.png")}
                          alt="DEF"
                          crossOrigin="anonymous"
                          onError={(e) => handleImageFallback(e, "icon/property/IconDefence.png")}
                        />
                        <span className="stat-name">{isRu ? "Защита" : "DEF"}</span>
                      </div>
                      <div className="stat-values">
                        <span className="stat-calc">{defBase} <span className="stat-bonus">+{defAdd}</span> =</span>
                        <span className="stat-total">{defTotal.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="showcase-stat-row">
                      <div className="stat-left">
                        <img
                          className="stat-icon"
                          src={iconUrl("icon/property/IconSpeed.png")}
                          alt="SPD"
                          crossOrigin="anonymous"
                          onError={(e) => handleImageFallback(e, "icon/property/IconSpeed.png")}
                        />
                        <span className="stat-name">{isRu ? "Скорость" : "Speed"}</span>
                      </div>
                      <div className="stat-values">
                        <span className="stat-calc">{spdBase} <span className="stat-bonus">+{spdAdd}</span> =</span>
                        <span className="stat-total text-accent">{spdTotal}</span>
                      </div>
                    </div>

                    <div className="showcase-stat-row">
                      <div className="stat-left">
                        <img
                          className="stat-icon"
                          src={iconUrl("icon/property/IconCriticalChance.png")}
                          alt="CR"
                          crossOrigin="anonymous"
                          onError={(e) => handleImageFallback(e, "icon/property/IconCriticalChance.png")}
                        />
                        <span className="stat-name">{isRu ? "Крит. шанс" : "CRIT Rate"}</span>
                      </div>
                      <div className="stat-values">
                        <span className="stat-total">{crTotal}</span>
                      </div>
                    </div>

                    <div className="showcase-stat-row">
                      <div className="stat-left">
                        <img
                          className="stat-icon"
                          src={iconUrl("icon/property/IconCriticalDamage.png")}
                          alt="CD"
                          crossOrigin="anonymous"
                          onError={(e) => handleImageFallback(e, "icon/property/IconCriticalDamage.png")}
                        />
                        <span className="stat-name">{isRu ? "Крит. урон" : "CRIT DMG"}</span>
                      </div>
                      <div className="stat-values">
                        <span className="stat-total">{cdTotal}</span>
                      </div>
                    </div>

                    {beTotal && (
                      <div className="showcase-stat-row">
                        <div className="stat-left">
                          <img
                            className="stat-icon"
                            src={iconUrl("icon/property/IconBreakUp.png")}
                            alt="BE"
                            crossOrigin="anonymous"
                            onError={(e) => handleImageFallback(e, "icon/property/IconBreakUp.png")}
                          />
                          <span className="stat-name">{isRu ? "Эфф. пробития" : "Break Effect"}</span>
                        </div>
                        <div className="stat-values">
                          <span className="stat-total text-accent">{beTotal}</span>
                        </div>
                      </div>
                    )}

                    {errTotal && (
                      <div className="showcase-stat-row">
                        <div className="stat-left">
                          <img
                            className="stat-icon"
                            src={iconUrl("icon/property/IconEnergyRecovery.png")}
                            alt="ERR"
                            crossOrigin="anonymous"
                            onError={(e) => handleImageFallback(e, "icon/property/IconEnergyRecovery.png")}
                          />
                          <span className="stat-name">{isRu ? "Восст. энергии" : "Energy Regen"}</span>
                        </div>
                        <div className="stat-values">
                          <span className="stat-total">{errTotal}</span>
                        </div>
                      </div>
                    )}

                    {ehrTotal && (
                      <div className="showcase-stat-row">
                        <div className="stat-left">
                          <img
                            className="stat-icon"
                            src={iconUrl("icon/property/IconStatusProbability.png")}
                            alt="EHR"
                            crossOrigin="anonymous"
                            onError={(e) => handleImageFallback(e, "icon/property/IconStatusProbability.png")}
                          />
                          <span className="stat-name">{isRu ? "Шанс попад. эфф." : "Effect Hit"}</span>
                        </div>
                        <div className="stat-values">
                          <span className="stat-total">{ehrTotal}</span>
                        </div>
                      </div>
                    )}

                    {elemDmgTotal && (
                      <div className="showcase-stat-row">
                        <div className="stat-left">
                          <img
                            className="stat-icon"
                            src={iconUrl(activeElem.icon)}
                            alt="Elem"
                            crossOrigin="anonymous"
                            onError={(e) => handleImageFallback(e, activeElem.icon)}
                          />
                          <span className="stat-name">{isRu ? activeElem.nameRu : activeElem.nameEn}</span>
                        </div>
                        <div className="stat-values">
                          <span className="stat-total text-accent">{elemDmgTotal}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. БОЕВАЯ СИМУЛЯЦИЯ И РОТАЦИЯ */}
                {combatSim && (
                  <div className="showcase-section-box">
                    <div className="showcase-section-title">
                      <span className="sim-title-wrap">
                        <SparklesIcon size={13} />
                        <span>{isRu ? "БОЕВАЯ СИМУЛЯЦИЯ MOC 12" : "MOC 12 COMBAT SIMULATION"}</span>
                      </span>
                      <span className="sim-tier-badge">{combatSim.benchmarkTier}</span>
                    </div>
                    <div className="showcase-sim-body">
                      <div className="showcase-sim-metric-line">
                        <span className="sim-metric-name">{combatSim.metric1Label}</span>
                        <span className="sim-metric-val">{combatSim.metric1Value}</span>
                      </div>
                      {combatSim.metric2Value && (
                        <div className="showcase-sim-metric-line">
                          <span className="sim-metric-name">{combatSim.metric2Label}</span>
                          <span className="sim-metric-val">{combatSim.metric2Value}</span>
                        </div>
                      )}
                      <p className="showcase-sim-summary-text">
                        {isRu ? combatSim.summaryRu : combatSim.summaryEn}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* ПРАВАЯ КОЛОНКА: РЕЛИКВИИ И СЕТЫ */}
              <div className="showcase-col-right">
                {(() => {
                  const renderRelicCard = (slotIdx) => {
                    const piece = getSlotPiece(slotIdx);
                    const slotTitle = slotTitles[slotIdx];
                    const isSphereSlot = slotIdx === 4;
                    const isRopeSlot = slotIdx === 5;
                    const isOrnament = isSphereSlot || isRopeSlot;

                    if (!piece) {
                      return (
                        <div key={`relic-${slotIdx}`} className="showcase-relic-card empty">
                          <div className="relic-card-head">
                            <div className="showcase-relic-icon-wrap placeholder">
                              {isSphereSlot ? <SphereIcon size={18} /> : isRopeSlot ? <RopeIcon size={18} /> : <span>★</span>}
                            </div>
                            <div className="relic-slot-info">
                              <span className="relic-slot-tag">{slotTitle}</span>
                              <span className="relic-empty-text">{isRu ? "Ожидает синхронизации" : "Awaiting sync"}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    const mainStatField = piece.main_affix?.field || "";
                    const mainStatValue = piece.main_affix?.display || "";
                    const mainStatName = formatStatName(mainStatField, lang) || formatStatName(piece.main_affix?.name, lang);
                    const mainStatIcon = resolveAffixIcon(piece.main_affix);

                    const relicSetInfo = resolveRelicSetInfo(piece, lang);
                    const relicSetName = relicSetInfo?.name || (isRu ? "Неизвестный набор" : "Unknown Set");

                    return (
                      <div key={`relic-${slotIdx}`} className="showcase-relic-card">
                        <div className="relic-card-head">
                          <div className="showcase-relic-icon-wrap">
                            {piece.icon ? (
                              <img
                                className="showcase-relic-icon-img"
                                src={iconUrl(piece.icon)}
                                alt={piece.name || relicSetName}
                                crossOrigin="anonymous"
                                onError={(e) => handleImageFallback(e, piece.icon)}
                              />
                            ) : (
                              <span className="placeholder-icon">
                                {isSphereSlot ? <SphereIcon size={18} /> : isRopeSlot ? <RopeIcon size={18} /> : "★"}
                              </span>
                            )}
                            <span className="relic-lvl-badge">+{piece.level ?? 15}</span>
                          </div>
                          <div className="relic-slot-info">
                            <div className="relic-slot-header-row">
                              <span className="relic-slot-tag">{slotTitle}</span>
                              <span className="relic-rarity-tag">{isOrnament ? (isRu ? "5★ ОРНАМЕНТ" : "5★ ORNAMENT") : (isRu ? "5★ РЕЛИКВИЯ" : "5★ RELIC")}</span>
                            </div>
                            <span className="relic-name-truncate" title={relicSetName}>{relicSetName}</span>
                          </div>
                        </div>

                        <div className="relic-main-row">
                          <span className="relic-main-name">
                            {mainStatIcon && (
                              <img
                                className="relic-affix-icon main"
                                src={iconUrl(mainStatIcon)}
                                alt=""
                                crossOrigin="anonymous"
                                onError={(e) => handleImageFallback(e, mainStatIcon)}
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
                            const subIcon = resolveAffixIcon(sub);
                            return (
                              <div key={`sub-${sIdx}`} className={`relic-sub-item ${isKey ? "key-sub" : ""}`}>
                                <span className="sub-name">
                                  {subIcon && (
                                    <img
                                      className="relic-affix-icon sub"
                                      src={iconUrl(subIcon)}
                                      alt=""
                                      crossOrigin="anonymous"
                                      onError={(e) => handleImageFallback(e, subIcon)}
                                    />
                                  )}
                                  <span>{formatStatName(sub.field, lang) || formatStatName(sub.name, lang)}</span>
                                </span>
                                <span className="sub-val">
                                  <span className="relic-sub-num">{sub.display}</span>
                                  {upgrades > 0 && <span className="sub-roll-tag">{`+${upgrades}`}</span>}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  };

                  if (layoutMode === "grouped") {
                    return (
                      <>
                        {/* 1. ПЕЩЕРНЫЕ РЕЛИКВИИ (4 ПРЕДМЕТА) СО СВОИМ ТЕГОМ СВЕРХУ */}
                        <div className="showcase-section-box">
                          <div className="showcase-section-title">
                            <span>{isRu ? "ПЕЩЕРНЫЕ РЕЛИКВИИ (4 ПРЕДМЕТА)" : "CAVERN RELICS (4 PIECES)"}</span>
                            {audit.cavern?.setName && (
                              <span className="showcase-set-tag">
                                <CheckIcon size={12} />
                                <span>4/4 {audit.cavern.setName}</span>
                              </span>
                            )}
                          </div>
                          <div className="showcase-relics-grid">
                            {[0, 1, 2, 3].map((slotIdx) => renderRelicCard(slotIdx))}
                          </div>
                        </div>

                        {/* 2. ПЛАНАРНЫЕ УКРАШЕНИЯ (2 ПРЕДМЕТА) СО СВОИМ ТЕГОМ СВЕРХУ */}
                        <div className="showcase-section-box">
                          <div className="showcase-section-title">
                            <span>{isRu ? "ПЛАНАРНЫЕ УКРАШЕНИЯ (2 ПРЕДМЕТА)" : "PLANAR ORNAMENTS (2 PIECES)"}</span>
                            {audit.planar?.setName && (
                              <span className="showcase-set-tag">
                                <CheckIcon size={12} />
                                <span>2/2 {audit.planar.setName}</span>
                              </span>
                            )}
                          </div>
                          <div className="showcase-relics-grid">
                            {[4, 5].map((slotIdx) => renderRelicCard(slotIdx))}
                          </div>
                        </div>

                        {/* 3. УСЛОВИЯ И БОНУСЫ СЕТОВ В БОЮ */}
                        {(audit.planar?.condition || audit.cavern?.condition) && (
                          <div className="showcase-section-box">
                            <div className="showcase-section-title">
                              <span>{isRu ? "БОНУСЫ КОМПЛЕКТОВ В БОЮ" : "SET COMBAT BONUSES"}</span>
                              <span className="section-sub-tag text-accent">{isRu ? "АКТИВИРОВАНО" : "ACTIVE"}</span>
                            </div>
                            <div className="showcase-sets-content">
                              <span className="set-condition-text">
                                {[audit.cavern?.condition, audit.planar?.condition].filter(Boolean).join(" • ")}
                              </span>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  }

                  return (
                    <>
                      {/* 1. БЛОК АКТИВИРОВАННЫХ НАБОРОВ (СВЕРХУ РЕЛИКВИЙ!) */}
                      <div className="showcase-section-box">
                        <div className="showcase-section-title">
                          <span>{isRu ? "АКТИВНЫЕ НАБОРЫ РЕЛИКВИЙ" : "ACTIVE SET BONUSES"}</span>
                          <span className="section-sub-tag text-accent">{isRu ? "АКТИВИРОВАНО" : "ACTIVE"}</span>
                        </div>
                        <div className="showcase-sets-content">
                          <div className="sets-summary-row">
                            {audit.cavern?.setName && (
                              <span className="showcase-set-tag">
                                <CheckIcon size={12} />
                                <span>4/4 {audit.cavern.setName}</span>
                              </span>
                            )}
                            {audit.planar?.setName && (
                              <span className="showcase-set-tag">
                                <CheckIcon size={12} />
                                <span>2/2 {audit.planar.setName}</span>
                              </span>
                            )}
                          </div>
                          <span className="set-condition-text">
                            {audit.planar?.condition || audit.cavern?.condition || (isRu ? "Все бонусы комплектов активны в бою." : "All set bonuses are active in combat.")}
                          </span>
                        </div>
                      </div>

                      {/* 2. ВСЕ 6 РЕЛИКВИЙ СЛИТНО (СЛИПАЮТСЯ) */}
                      <div className="showcase-section-box">
                        <div className="showcase-section-title">
                          <span>{isRu ? "ЭКИПИРОВАННЫЕ РЕЛИКВИИ (6 СЛОТОВ)" : "EQUIPPED RELICS (6 SLOTS)"}</span>
                          <span className="section-sub-tag text-accent">{isRu ? "ДАННЫЕ ВЕРИФИЦИРОВАНЫ" : "VERIFIED DATA"}</span>
                        </div>
                        <div className="showcase-relics-grid">
                          {[0, 1, 2, 3, 4, 5].map((slotIdx) => renderRelicCard(slotIdx))}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* ФУТЕР КАРТЫ */}
            <div className="showcase-footer">
              <span className="footer-brand">
                <img src="/media/NousMatrix-logo.png" alt="" className="footer-logo" />
                <span>{isRu ? "NOUSMATRIX // COMBAT READINESS AUDIT" : "NOUSMATRIX // COMBAT READINESS AUDIT"}</span>
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
