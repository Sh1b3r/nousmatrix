import React from "react";
import { iconUrl, handleImageFallback } from "../utils/audit";
import { formatStatName } from "../utils/i18n";
export default function CombatStats({ character, t, lang = "ru" }) {
  if (!character) return null;
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
  const healTotal = addMap["heal_rate"] && addMap["heal_rate"].value > 0 ? (addMap["heal_rate"].value * 100).toFixed(1) + "%" : null;
  const elementFields = [
    { field: "physical_dmg", icon: "icon/property/IconPhysicalAddedRatio.png", rawName: "Физический урон" },
    { field: "fire_dmg", icon: "icon/property/IconFireAddedRatio.png", rawName: "Огненный урон" },
    { field: "ice_dmg", icon: "icon/property/IconIceAddedRatio.png", rawName: "Ледяной урон" },
    { field: "thunder_dmg", icon: "icon/property/IconThunderAddedRatio.png", rawName: "Электрический урон" },
    { field: "wind_dmg", icon: "icon/property/IconWindAddedRatio.png", rawName: "Ветряной урон" },
    { field: "quantum_dmg", icon: "icon/property/IconQuantumAddedRatio.png", rawName: "Квантовый урон" },
    { field: "imaginary_dmg", icon: "icon/property/IconImaginaryAddedRatio.png", rawName: "Мнимый урон" }
  ];
  const activeElementDmgs = elementFields.filter((el) => addMap[el.field] && addMap[el.field].value > 0);
  const errTotal = addMap["sp_rate"] ? (100 + addMap["sp_rate"].value * 100).toFixed(1) + "%" : null;
  const ehrTotal = addMap["effect_hit"] && addMap["effect_hit"].value > 0 ? (addMap["effect_hit"].value * 100).toFixed(1) + "%" : null;
  const resTotal = addMap["effect_res"] && addMap["effect_res"].value > 0 ? (addMap["effect_res"].value * 100).toFixed(1) + "%" : null;
  const maxSp = baseMap["max_sp"] ? Math.round(baseMap["max_sp"].value) : null;
  return  React.createElement("div", { className: "combat-stat-table" },  React.createElement("div", { className: "stat-entry" },  React.createElement("div", { className: "stat-left" },  React.createElement(
    "img",
    {
      className: "stat-icon",
      crossOrigin: "anonymous",
      src: iconUrl("icon/property/IconMaxHP.png"),
      alt: "HP",
      onError: (e) => handleImageFallback(e, "icon/property/IconMaxHP.png")
    }
  ),  React.createElement("span", { className: "stat-name" }, t.maxHp)),  React.createElement("div", { className: "stat-values" },  React.createElement("span", { className: "stat-calc" }, hpBase, " ",  React.createElement("span", { className: "stat-bonus" }, "+", hpAdd), " ="),  React.createElement("span", { className: "stat-total" }, hpTotal.toLocaleString()))),  React.createElement("div", { className: "stat-entry" },  React.createElement("div", { className: "stat-left" },  React.createElement(
    "img",
    {
      className: "stat-icon",
      crossOrigin: "anonymous",
      src: iconUrl("icon/property/IconAttack.png"),
      alt: "ATK",
      onError: (e) => handleImageFallback(e, "icon/property/IconAttack.png")
    }
  ),  React.createElement("span", { className: "stat-name" }, t.atk)),  React.createElement("div", { className: "stat-values" },  React.createElement("span", { className: "stat-calc" }, atkBase, " ",  React.createElement("span", { className: "stat-bonus" }, "+", atkAdd), " ="),  React.createElement("span", { className: "stat-total" }, atkTotal.toLocaleString()))),  React.createElement("div", { className: "stat-entry" },  React.createElement("div", { className: "stat-left" },  React.createElement(
    "img",
    {
      className: "stat-icon",
      crossOrigin: "anonymous",
      src: iconUrl("icon/property/IconDefence.png"),
      alt: "DEF",
      onError: (e) => handleImageFallback(e, "icon/property/IconDefence.png")
    }
  ),  React.createElement("span", { className: "stat-name" }, t.def)),  React.createElement("div", { className: "stat-values" },  React.createElement("span", { className: "stat-calc" }, defBase, " ",  React.createElement("span", { className: "stat-bonus" }, "+", defAdd), " ="),  React.createElement("span", { className: "stat-total" }, defTotal.toLocaleString()))),  React.createElement("div", { className: "stat-entry" },  React.createElement("div", { className: "stat-left" },  React.createElement(
    "img",
    {
      className: "stat-icon",
      crossOrigin: "anonymous",
      src: iconUrl("icon/property/IconSpeed.png"),
      alt: "SPD",
      onError: (e) => handleImageFallback(e, "icon/property/IconSpeed.png")
    }
  ),  React.createElement("span", { className: "stat-name" }, t.spd)),  React.createElement("div", { className: "stat-values" },  React.createElement("span", { className: "stat-calc" }, spdBase, " ",  React.createElement("span", { className: "stat-bonus" }, "+", spdAdd), " ="),  React.createElement("span", { className: "stat-total" }, spdTotal))),  React.createElement("div", { className: "stat-entry" },  React.createElement("div", { className: "stat-left" },  React.createElement(
    "img",
    {
      className: "stat-icon",
      crossOrigin: "anonymous",
      src: iconUrl("icon/property/IconCriticalChance.png"),
      alt: "CR",
      onError: (e) => handleImageFallback(e, "icon/property/IconCriticalChance.png")
    }
  ),  React.createElement("span", { className: "stat-name" }, t.critRate)),  React.createElement("div", { className: "stat-values" },  React.createElement("span", { className: "stat-total" }, crTotal))),  React.createElement("div", { className: "stat-entry" },  React.createElement("div", { className: "stat-left" },  React.createElement(
    "img",
    {
      className: "stat-icon",
      crossOrigin: "anonymous",
      src: iconUrl("icon/property/IconCriticalDamage.png"),
      alt: "CD",
      onError: (e) => handleImageFallback(e, "icon/property/IconCriticalDamage.png")
    }
  ),  React.createElement("span", { className: "stat-name" }, t.critDmg)),  React.createElement("div", { className: "stat-values" },  React.createElement("span", { className: "stat-total" }, cdTotal))), beTotal &&  React.createElement("div", { className: "stat-entry" },  React.createElement("div", { className: "stat-left" },  React.createElement(
    "img",
    {
      className: "stat-icon",
      crossOrigin: "anonymous",
      src: iconUrl("icon/property/IconBreakUp.png"),
      alt: "BE",
      onError: (e) => handleImageFallback(e, "icon/property/IconBreakUp.png")
    }
  ),  React.createElement("span", { className: "stat-name" }, t.breakEffect)),  React.createElement("div", { className: "stat-values" },  React.createElement("span", { className: "stat-total" }, beTotal))), healTotal &&  React.createElement("div", { className: "stat-entry" },  React.createElement("div", { className: "stat-left" },  React.createElement(
    "img",
    {
      className: "stat-icon",
      crossOrigin: "anonymous",
      src: iconUrl("icon/property/IconHealRatio.png"),
      alt: "Heal",
      onError: (e) => handleImageFallback(e, "icon/property/IconHealRatio.png")
    }
  ),  React.createElement("span", { className: "stat-name" }, t.healRate)),  React.createElement("div", { className: "stat-values" },  React.createElement("span", { className: "stat-total" }, healTotal))), activeElementDmgs.map((el, i) =>  React.createElement("div", { className: "stat-entry", key: i },  React.createElement("div", { className: "stat-left" },  React.createElement(
    "img",
    {
      className: "stat-icon",
      crossOrigin: "anonymous",
      src: iconUrl(el.icon),
      alt: "Element",
      onError: (e) => handleImageFallback(e, el.icon)
    }
  ),  React.createElement("span", { className: "stat-name" }, formatStatName(addMap[el.field].name || el.rawName, lang))),  React.createElement("div", { className: "stat-values" },  React.createElement("span", { className: "stat-total" }, (addMap[el.field].value * 100).toFixed(1), "%")))), errTotal &&  React.createElement("div", { className: "stat-entry" },  React.createElement("div", { className: "stat-left" },  React.createElement(
    "img",
    {
      className: "stat-icon",
      crossOrigin: "anonymous",
      src: iconUrl("icon/property/IconEnergyRecovery.png"),
      alt: "ERR",
      onError: (e) => handleImageFallback(e, "icon/property/IconEnergyRecovery.png")
    }
  ),  React.createElement("span", { className: "stat-name" }, t.err)),  React.createElement("div", { className: "stat-values" },  React.createElement("span", { className: "stat-total" }, errTotal))), ehrTotal &&  React.createElement("div", { className: "stat-entry" },  React.createElement("div", { className: "stat-left" },  React.createElement(
    "img",
    {
      className: "stat-icon",
      crossOrigin: "anonymous",
      src: iconUrl("icon/property/IconStatusProbability.png"),
      alt: "EHR",
      onError: (e) => handleImageFallback(e, "icon/property/IconStatusProbability.png")
    }
  ),  React.createElement("span", { className: "stat-name" }, t.ehr)),  React.createElement("div", { className: "stat-values" },  React.createElement("span", { className: "stat-total" }, ehrTotal))), resTotal &&  React.createElement("div", { className: "stat-entry" },  React.createElement("div", { className: "stat-left" },  React.createElement(
    "img",
    {
      className: "stat-icon",
      crossOrigin: "anonymous",
      src: iconUrl("icon/property/IconStatusResistance.png"),
      alt: "RES",
      onError: (e) => handleImageFallback(e, "icon/property/IconStatusResistance.png")
    }
  ),  React.createElement("span", { className: "stat-name" }, t.effectRes)),  React.createElement("div", { className: "stat-values" },  React.createElement("span", { className: "stat-total" }, resTotal))), maxSp &&  React.createElement("div", { className: "stat-entry" },  React.createElement("div", { className: "stat-left" },  React.createElement(
    "img",
    {
      className: "stat-icon",
      crossOrigin: "anonymous",
      src: iconUrl("icon/property/IconEnergyLimit.png"),
      alt: "Max SP",
      onError: (e) => handleImageFallback(e, "icon/property/IconEnergyLimit.png")
    }
  ),  React.createElement("span", { className: "stat-name" }, t.maxEnergy)),  React.createElement("div", { className: "stat-values" },  React.createElement("span", { className: "stat-total" }, maxSp))));
}
