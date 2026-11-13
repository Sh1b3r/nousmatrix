import React, { useRef } from "react";
import { getCharHeadIcon, getCharAvatarPath, iconUrl, handleImageFallback, calculateCharacterAudit } from "../utils/audit";
export default function ShowcaseRoster({ characters, activeIndex, onSelect, t, lang }) {
  const trackRef = useRef(null);
  return  React.createElement("div", { className: "roster-section" },  React.createElement("div", { className: "roster-header" },  React.createElement("div", { className: "roster-title" },  React.createElement("span", null, t.rosterTitle),  React.createElement("span", { className: "badge-count" }, t.rosterCharsSuffix(characters.length))),  React.createElement("span", { className: "roster-hint" }, t.rosterHint)),  React.createElement("div", { className: "roster-track", ref: trackRef }, characters.map((char, idx) => {
    const isActive = idx === activeIndex;
    const audit = calculateCharacterAudit(char, lang);
    return  React.createElement(
      "div",
      {
        key: char.id || idx,
        className: `roster-card ${isActive ? "active" : ""}`,
        onClick: () => onSelect(idx)
      },
       React.createElement("div", { className: "roster-avatar-wrap" },  React.createElement(
        "img",
        {
          className: "roster-avatar-img",
          src: getCharHeadIcon(char),
          alt: char.name,
          onError: (e) => handleImageFallback(e, getCharAvatarPath(char)),
          loading: "lazy"
        }
      )),
       React.createElement("div", { className: "roster-char-name", title: char.name }, char.name),
       React.createElement("div", { className: "roster-char-meta" }, t.lvl, " ", char.level, " • E", char.rank),
       React.createElement("div", { className: "roster-score-pill" }, "TOP ", audit.topPercent, "% • ", audit.score)
    );
  })));
}
