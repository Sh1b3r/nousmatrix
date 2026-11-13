import React from "react";
import { iconUrl } from "../utils/audit";
import { SET_DEFINITIONS, resolveRelicSetInfo } from "../utils/setDefinitions.js";
export default function SetBonuses({ character, t, lang = "ru" }) {
  if (!character) return null;
  const isRu = (lang || (t?.lvl === "Ур." ? "ru" : "en")) === "ru";
  const rawSets = character.relic_sets || [];
  const relics = character.relics || [];
  const finalSets = [];
  if (relics.length > 0) {
    const setCounts = {};
    relics.forEach((r) => {
      const info = resolveRelicSetInfo(r, isRu ? "ru" : "en");
      const setId = info?.def?.id || r.set_id || "unknown";
      if (!setCounts[setId]) {
        setCounts[setId] = {
          id: setId,
          name: info?.name || r.set_name || (isRu ? "Неизвестный сет" : "Unknown Set"),
          def: info?.def,
          icon: info?.icon || r.icon,
          isPlanar: info?.def ? info.def.isPlanar : r.type >= 5 || parseInt(setId) >= 300,
          count: 0
        };
      }
      setCounts[setId].count += 1;
    });
    Object.values(setCounts).forEach((sc) => {
      if (sc.count >= 2) {
        const desc2 = isRu ? sc.def?.desc2Ru || "Бонус 2 предметов активен." : sc.def?.desc2En || "2-Pc set bonus active.";
        finalSets.push({
          name: sc.name,
          num: 2,
          icon: sc.icon,
          desc: desc2,
          key: `${sc.id}-2`
        });
      }
      if (sc.count >= 4) {
        const desc4 = isRu ? sc.def?.desc4Ru || "Полный бонус 4 предметов активен." : sc.def?.desc4En || "4-Pc full set bonus active.";
        finalSets.push({
          name: sc.name,
          num: 4,
          icon: sc.icon,
          desc: desc4,
          key: `${sc.id}-4`
        });
      }
    });
  } else if (rawSets.length > 0) {
    rawSets.forEach((s) => {
      finalSets.push(s);
    });
  }
  if (finalSets.length === 0) {
    return  React.createElement("div", { style: { fontSize: "12px", color: "var(--text-tertiary)" } }, t.setsEmpty);
  }
  return  React.createElement("div", null, finalSets.map((set, i) =>  React.createElement("div", { key: i, className: "set-box" },  React.createElement("div", { className: "set-head" },  React.createElement("img", { className: "set-icon", src: iconUrl(set.icon), alt: set.name, crossOrigin: "anonymous" }),  React.createElement("span", { className: "set-name" }, set.name),  React.createElement("span", { className: "set-num-badge" }, set.num === 2 ? t.pc2 : set.num === 4 ? t.pc4 : `${set.num} ${t.pc}`)),  React.createElement("div", { className: "set-desc" }, set.desc))));
}
