import React, { useState } from "react";
import { iconUrl, handleImageFallback } from "../utils/audit";
import { formatStatName } from "../utils/i18n";
import { resolveRelicSetInfo } from "../utils/setDefinitions";
import { SphereIcon, RopeIcon, WarnIcon, CheckIcon } from "./Icons.jsx";
export default function RelicsGrid({
  character,
  audit,
  t,
  lang = "ru",
  layoutMode: externalMode,
  onLayoutModeChange
}) {
  if (!character) return null;
  const isRu = lang === "ru";
  const [internalMode, setInternalMode] = useState("grouped");
  const layoutMode = externalMode !== undefined ? externalMode : internalMode;
  const setLayoutMode = onLayoutModeChange || setInternalMode;
  const rawRelics = character.relics || [];
  const ornaments = Array.isArray(character.ornaments) ? character.ornaments : [];
  const existingRelicIds = new Set(rawRelics.map((r) => r.id || `${r.type}_${r.name}`));
  const relics = [...rawRelics];
  ornaments.forEach((orn) => {
    if (!existingRelicIds.has(orn.id || `${orn.type}_${orn.name}`)) {
      relics.push(orn);
    }
  });

  const slots = t.relicSlots || [];
  const isSphere = (r) => {
    if (!r) return false;
    const num = Number(r.type ?? r.pos);
    if (num === 5) return true;
    const typeStr = String(r.type || r.type_name || "").toUpperCase();
    if (typeStr === "NECK" || typeStr === "SPHERE" || typeStr.includes("СФЕР")) return true;
    const idStr = String(r.id || r.tid || "");
    if ((idStr.length === 5 || idStr.length === 6) && idStr.endsWith("5")) return true;
    const nameStr = (r.name || "").toLowerCase();
    if (nameStr.includes("сфер") || nameStr.includes("сцена") || nameStr.includes("ядро") || nameStr.includes("расщелина") || nameStr.includes("stage") || nameStr.includes("sphere") || nameStr.includes("core") || nameStr.includes("fissure")) return true;
    return false;
  };
  const isRope = (r) => {
    if (!r) return false;
    const num = Number(r.type ?? r.pos);
    if (num === 6) return true;
    const typeStr = String(r.type || r.type_name || "").toUpperCase();
    if (typeStr === "OBJECT" || typeStr === "ROPE" || typeStr.includes("ВЕРВ")) return true;
    const idStr = String(r.id || r.tid || "");
    if ((idStr.length === 5 || idStr.length === 6) && idStr.endsWith("6")) return true;
    const nameStr = (r.name || "").toLowerCase();
    if (nameStr.includes("верв") || nameStr.includes("реквизит") || nameStr.includes("транслятор") || nameStr.includes("плёнка") || nameStr.includes("пленка") || nameStr.includes("prop") || nameStr.includes("rope") || nameStr.includes("relay") || nameStr.includes("film")) return true;
    return false;
  };
  const cavernRelics = relics.filter((r) => {
    const num = Number(r.type ?? r.pos);
    if (num >= 1 && num <= 4) return true;
    if (!isSphere(r) && !isRope(r) && relics.indexOf(r) < 4) return true;
    return false;
  });
  const spherePiece = relics.find(isSphere) || relics.find((r, i) => (i === 4 && relics.length >= 5) || Number(r.type ?? r.pos) === 5);
  const ropePiece = relics.find(isRope) || relics.find((r, i) => (i === 5 && relics.length >= 6) || Number(r.type ?? r.pos) === 6);
  const planarRelics = [spherePiece, ropePiece].filter(Boolean);
  const renderPlaceholderCard = (slotIdx, defaultTitle) => {
    const slotTitle = slots[slotIdx] || defaultTitle;
    const isSphere2 = slotIdx === 4;
    return  React.createElement("div", { key: `placeholder-${slotIdx}`, className: "relic-item-card relic-placeholder-card" },  React.createElement("div", { className: "relic-top-row" },  React.createElement("div", { className: "relic-left-meta" },  React.createElement("div", { className: "relic-icon-wrap placeholder" },  React.createElement("span", { className: "placeholder-icon" }, isSphere2 ?  React.createElement(SphereIcon, { size: 20 }) :  React.createElement(RopeIcon, { size: 20 })),  React.createElement("span", { className: "relic-lvl-badge", style: { opacity: 0.5 } }, "+0")),  React.createElement("div", { className: "relic-name-col" },  React.createElement("span", { className: "relic-slot-name" }, slotTitle),  React.createElement("span", { className: "relic-piece-title", style: { opacity: 0.65, fontStyle: "italic" } }, isRu ? "Ожидает синхронизации" : "Awaiting sync"))),  React.createElement("span", { className: "relic-cv-pill", style: { color: "var(--text-tertiary)", background: "none" } }, isRu ? "5★ ОРНАМЕНТ" : "5★ ORNAMENT")),  React.createElement("div", { className: "relic-placeholder-body" },  React.createElement("p", { className: "relic-placeholder-hint" }, isRu ? "Если предмет надет в игре, пересохраните витрину в профиле HSR или перезайдите в игру, затем нажмите кнопку «ОБНОВИТЬ» вверху." : 'If equipped in-game, re-save your showcase or relog in HSR, then click "REFRESH" above.')));
  };
  const renderCard = (r, idx) => {
    const isWeak = idx === audit?.weakestRelicIndex;
    const slotTitle = slots[idx] || `Слот ${idx + 1}`;
    const relicSetName = resolveRelicSetInfo(r, lang)?.name || (isRu ? "Неизвестный набор" : "Unknown Set");
    return  React.createElement("div", { key: idx, className: `relic-item-card ${isWeak ? "weak-piece" : ""}` }, isWeak &&  React.createElement("div", { className: "relic-worst-banner-top mobile-only" },  React.createElement("span", { className: "worst-warn-icon" },  React.createElement(WarnIcon, { size: 12 })),  React.createElement("span", null, t.weakPiece)),  React.createElement("div", { className: "relic-top-row" },  React.createElement("div", { className: "relic-left-meta" },  React.createElement("div", { className: "relic-icon-wrap" },  React.createElement(
      "img",
      {
        className: "relic-icon-img",
        src: iconUrl(r.icon),
        alt: r.name,
        crossOrigin: "anonymous",
        onError: (e) => handleImageFallback(e, r.icon)
      }
    ),  React.createElement("span", { className: "relic-lvl-badge" }, "+", r.level)),  React.createElement("div", { className: "relic-name-col" },  React.createElement("span", { className: "relic-slot-name" }, slotTitle),  React.createElement("span", { className: "relic-piece-title", title: relicSetName }, relicSetName))), isWeak ?  React.createElement(React.Fragment, null,  React.createElement("span", { className: "relic-cv-pill weak-pill desktop-only" }, t.weakPiece),  React.createElement("span", { className: "relic-cv-pill mobile-only", style: { color: "var(--text-secondary)", background: "none" } }, idx >= 4 ? isRu ? "5★ ОРНАМЕНТ" : "5★ ORNAMENT" : t.goldRelic)) :  React.createElement("span", { className: "relic-cv-pill", style: { color: "var(--text-secondary)", background: "none" } }, idx >= 4 ? isRu ? "5★ ОРНАМЕНТ" : "5★ ORNAMENT" : t.goldRelic)),  React.createElement("div", { className: "relic-main-stat-box" },  React.createElement("div", { className: "relic-main-left" },  React.createElement("span", { className: "relic-main-label" }, r.main_affix?.icon &&  React.createElement(
      "img",
      {
        className: "relic-affix-icon main",
        src: iconUrl(r.main_affix?.icon),
        alt: "",
        crossOrigin: "anonymous",
        onError: (e) => handleImageFallback(e, r.main_affix?.icon)
      }
    ), (formatStatName(r.main_affix?.field, lang) || formatStatName(r.main_affix?.name, lang))), r.main_eval && idx >= 2 &&  React.createElement(
      "span",
      {
        className: `main-stat-badge ${r.main_eval.status}`,
        title: r.main_eval.status === "wrong" ? isRu ? `Рекомендуется: ${r.main_eval.recommendedRu}` : `Recommended: ${r.main_eval.recommendedEn}` : ""
      },
      isRu ? r.main_eval.labelRu : r.main_eval.labelEn
    )),  React.createElement("span", { className: "relic-main-val" }, r.main_affix?.display)),  React.createElement("div", { className: "relic-subs-list" }, (r.sub_affix || []).map((sub, sIdx) => {
      const upgrades = Math.max(0, (sub.count || 1) - 1);
      const isEpic = upgrades >= 3;
      const isHigh = upgrades === 2;
      const isZero = upgrades === 0;
      const tagClass = isEpic ? "epic" : isHigh ? "high" : isZero ? "zero" : "";
      const tagText = t.rollTag ? t.rollTag(upgrades) : `+${upgrades}`;
      return  React.createElement("div", { key: sIdx, className: "relic-sub-row" },  React.createElement("span", { className: "relic-sub-name" }, sub.icon &&  React.createElement(
        "img",
        {
          className: "relic-affix-icon sub",
          src: iconUrl(sub.icon),
          alt: "",
          crossOrigin: "anonymous",
          onError: (e) => handleImageFallback(e, sub.icon)
        }
      ), (formatStatName(sub.field, lang) || formatStatName(sub.name, lang))),  React.createElement("span", { className: "relic-sub-val" },  React.createElement("span", { className: "relic-sub-num" }, sub.display),  React.createElement("span", { className: `roll-count-tag ${tagClass}` }, tagText)));
    })));
  };
  const renderPlanarTag = () => {
    if (audit?.planar?.isComplete) {
      return  React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: "5px" } },  React.createElement(CheckIcon, { size: 12 }),  React.createElement("span", null, "2/2 ", audit.planar.setName || (planarRelics[0] ? resolveRelicSetInfo(planarRelics[0], lang)?.name : "")));
    }
    return  React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: "5px" } },  React.createElement(WarnIcon, { size: 12 }),  React.createElement("span", null, isRu ? "1/2 + 1/2 РАЗОРВАННЫЙ СЕТ" : "1/2 + 1/2 BROKEN SET"));
  };
  return  React.createElement("div", null,  React.createElement("div", { className: "relic-view-toggle-row" },  React.createElement("div", { className: "relic-view-toggle" },  React.createElement(
    "button",
    {
      type: "button",
      className: `toggle-btn ${layoutMode === "grouped" ? "active" : ""}`,
      onClick: () => setLayoutMode("grouped"),
      title: isRu ? "Раздельные позначки у каждого сета (как в прошлых коммитах)" : "Grouped by sections with separate tags"
    },
    isRu ? "ПО СЕКЦИЯМ" : "BY SECTIONS"
  ),  React.createElement(
    "button",
    {
      type: "button",
      className: `toggle-btn ${layoutMode === "unified" ? "active" : ""}`,
      onClick: () => setLayoutMode("unified"),
      title: isRu ? "Единая сетка 6 слотов" : "Unified grid of 6 slots"
    },
    isRu ? "ВСЕ СЛОТЫ" : "ALL SLOTS"
  ))), layoutMode === "grouped" ? (
    
     React.createElement("div", { className: "relics-grouped-container" },  React.createElement("div", { className: "relic-group-header" },  React.createElement("span", { className: "relic-group-title" }, t.cavernRelicsTitle), audit?.cavern?.label &&  React.createElement("span", { className: `relic-group-tag ${audit?.cavern?.isComplete ? "accent" : audit?.cavern ? "broken" : ""}` }, audit.cavern.label)),  React.createElement("div", { className: "relics-grid", style: { marginBottom: "22px" } }, relics.slice(0, 4).map((r, i) => renderCard(r, i))),  React.createElement("div", { className: "relic-group-header planar" },  React.createElement("span", { className: "relic-group-title" }, t.planarRelicsTitle), audit?.planar?.setName || planarRelics.length === 2 ?  React.createElement("span", { className: `relic-group-tag ${audit?.planar?.isComplete ? "accent" : "broken"}` }, renderPlanarTag()) : planarRelics.length === 1 ?  React.createElement("span", { className: "relic-group-tag broken", style: { display: "inline-flex", alignItems: "center", gap: "5px" } },  React.createElement(WarnIcon, { size: 12 }),  React.createElement("span", null, isRu ? "1/2 ЭКИПИРОВАН • ВТОРОЙ СЛОТ ОЖИДАЕТ СИНХРОНИЗАЦИИ" : "1/2 EQUIPPED • 2ND SLOT PENDING SYNC")) :  React.createElement("span", { className: "relic-group-tag", style: { borderStyle: "dashed", color: "var(--text-secondary)" } }, isRu ? "0/2 ОЖИДАЕТ СИНХРОНИЗАЦИИ В ИГРЕ" : "0/2 AWAITING GAME SYNC")),  React.createElement("div", { className: "relics-grid planar-grid" }, spherePiece ? renderCard(spherePiece, 4) : renderPlaceholderCard(4, isRu ? "Планарная сфера" : "Planar Sphere"), ropePiece ? renderCard(ropePiece, 5) : renderPlaceholderCard(5, isRu ? "Соединительная вервь" : "Link Rope")))
  ) : (
    
     React.createElement("div", { className: "relics-unified-container" }, (audit?.cavern?.label || audit?.planar?.setName || planarRelics.length === 2) &&  React.createElement("div", { className: "relics-sets-summary" }, audit?.cavern?.label &&  React.createElement("span", { className: `relic-group-tag ${audit?.cavern?.isComplete ? "accent" : audit?.cavern ? "broken" : ""}` }, audit.cavern.label), (audit?.planar?.setName || planarRelics.length === 2) &&  React.createElement("span", { className: `relic-group-tag ${audit?.planar?.isComplete ? "accent" : "broken"}` }, renderPlanarTag())),  React.createElement("div", { className: "relics-grid" }, relics.slice(0, 4).map((r, i) => renderCard(r, i)), spherePiece ? renderCard(spherePiece, 4) : renderPlaceholderCard(4, isRu ? "Планарная сфера" : "Planar Sphere"), ropePiece ? renderCard(ropePiece, 5) : renderPlaceholderCard(5, isRu ? "Соединительная вервь" : "Link Rope")))
  ));
}
