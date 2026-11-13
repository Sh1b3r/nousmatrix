import React from "react";
import { getCharHeadIcon, getCharAvatarPath, iconUrl, handleImageFallback, resolveElementIcon, resolvePathIcon } from "../utils/audit";
export default function CharacterOverview({ character, t, lang = "ru" }) {
  if (!character) return null;
  const isRu = lang === "ru";
  const elemIcon = resolveElementIcon(character.element);
  const pathIcon = resolvePathIcon(character.path);
  const targetTypes = ["Normal", "BPSkill", "Ultra", "Talent", "Maze"];
  const seenTypes =  new Set();
  const coreSkills = [];
  for (const s of character.skills || []) {
    if (targetTypes.includes(s.type) && !seenTypes.has(s.type)) {
      seenTypes.add(s.type);
      coreSkills.push(s);
    }
  }
  const majorTraces = (character.skill_trees || []).filter(
    (tr) => ["Point06", "Point07", "Point08"].includes(tr.anchor)
  );
  const getSkillTypeShort = (type) => {
    switch (type) {
      case "Normal":
        return isRu ? "АТАКА" : "BASIC";
      case "BPSkill":
        return isRu ? "НАВЫК" : "SKILL";
      case "Ultra":
        return isRu ? "УЛЬТ" : "ULT";
      case "Talent":
        return isRu ? "ТАЛАНТ" : "TALENT";
      case "Maze":
        return isRu ? "ТЕХНИКА" : "TECH";
      default:
        return type;
    }
  };
  const getTraceLabel = (anchor) => {
    if (anchor === "Point06") return "A2";
    if (anchor === "Point07") return "A4";
    if (anchor === "Point08") return "A6";
    return isRu ? "СЛЕД" : "TRACE";
  };
  return  React.createElement("div", { className: "char-hero-card" },  React.createElement("div", { className: "char-hero-left" },  React.createElement("div", { className: "char-portrait-box" },  React.createElement(
    "img",
    {
      className: "char-portrait-img",
      src: getCharHeadIcon(character),
      alt: character.name,
      onError: (e) => handleImageFallback(e, getCharAvatarPath(character))
    }
  )),  React.createElement("div", { className: "char-details-primary" },  React.createElement("h2", null, character.name),  React.createElement("span", { className: "char-stars" }, "★".repeat(character.rarity || 5)),  React.createElement("div", { className: "char-tags-row" },  React.createElement("span", { className: "char-pill" }, t.lvl, " ", character.level, "/80"),  React.createElement("span", { className: "char-pill accent" }, t.eidolons, character.rank), elemIcon &&  React.createElement("span", { className: "char-pill char-icon-pill element-pill", title: character.element?.name ? `${t.combatType}${character.element.name}` : "", style: character.element?.color ? { borderColor: `${character.element.color}88` } : undefined },  React.createElement("img", { src: iconUrl(elemIcon), alt: character.element?.name || "Element", className: "char-badge-icon element-icon", crossOrigin: "anonymous", onError: (e) => handleImageFallback(e, elemIcon) })), pathIcon &&  React.createElement("span", { className: "char-pill char-icon-pill path-pill", title: character.path?.name ? `${t.path}${character.path.name}` : "" },  React.createElement("img", { src: iconUrl(pathIcon), alt: character.path?.name || "Path", className: "char-badge-icon path-icon", crossOrigin: "anonymous", onError: (e) => handleImageFallback(e, pathIcon) }))),  React.createElement("div", { className: "char-skills-row" }, coreSkills.map((s) =>  React.createElement(
    "div",
    {
      key: s.id,
      className: "skill-item",
      title: `${s.type_text || s.type}: ${s.name}
${s.simple_desc || s.desc || ""}
(${t.lvl} ${s.level}/${s.max_level})`
    },
     React.createElement("div", { className: "skill-icon-wrap" },  React.createElement(
      "img",
      {
        className: "skill-icon",
        src: iconUrl(s.icon),
        alt: s.name,
        onError: (e) => handleImageFallback(e, s.icon)
      }
    ),  React.createElement("span", { className: "skill-lvl-badge" }, s.level)),
     React.createElement("span", { className: "skill-name-label" }, getSkillTypeShort(s.type))
  )), majorTraces.map((tr) =>  React.createElement(
    "div",
    {
      key: tr.id,
      className: `skill-item trace-item ${tr.level > 0 ? "unlocked" : "locked"}`,
      title: `${getTraceLabel(tr.anchor)}: ${isRu ? "Ключевой след возвышения" : "Major Ascension Trace"} (${tr.level > 0 ? isRu ? "Разблокирован" : "Unlocked" : isRu ? "Заблокирован" : "Locked"})`
    },
     React.createElement("div", { className: "skill-icon-wrap" },  React.createElement(
      "img",
      {
        className: "skill-icon",
        src: iconUrl(tr.icon),
        alt: tr.anchor,
        onError: (e) => handleImageFallback(e, tr.icon)
      }
    ),  React.createElement("span", { className: "skill-lvl-badge trace" }, getTraceLabel(tr.anchor))),
     React.createElement("span", { className: "skill-name-label" }, getTraceLabel(tr.anchor))
  ))))), character.light_cone &&  React.createElement("div", { className: "lightcone-box" },  React.createElement(
    "img",
    {
      className: "cone-img",
      src: iconUrl(character.light_cone.icon),
      alt: character.light_cone.name,
      onError: (e) => handleImageFallback(e, character.light_cone.icon)
    }
  ),  React.createElement("div", { className: "cone-info" },  React.createElement("div", { className: "cone-name" }, character.light_cone.name),  React.createElement("div", { className: "cone-super" }, t.superimposition, character.light_cone.rank, " (", "★".repeat(character.light_cone.rarity || 5), ")"),  React.createElement("div", { className: "cone-level" }, t.lvl, " ", character.light_cone.level, "/80"),  React.createElement("div", { className: "cone-stats" }, (character.light_cone.attributes || []).map((a, i) =>  React.createElement("span", { key: i }, a.name.replace("Базовая ", "").replace("Базовое ", ""), ": ", a.display))))));
}
