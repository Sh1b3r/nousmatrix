import React, { useState, useMemo } from "react";
import { runCombatSimulation } from "../utils/simulation.js";
import { CHARACTER_SQUADS, getGenericSquads, matchSquadWithShowcase } from "../utils/teamSynergy.js";
import { runFullTeamRotationSimulation } from "../utils/rotationSimulation.js";
import { iconUrl, handleImageFallback } from "../utils/audit.js";
import { SwordIcon, ShieldIcon, SparklesIcon, CheckIcon, WarnIcon } from "./Icons.jsx";
export default function CombatSimulationCard({ character, audit, stats, showcase = [], lang = "ru" }) {
  if (!character || !audit) return null;
  const isRu = lang === "ru";
  const archetype = audit.detectedRole?.targetArchetype || "CRIT_DPS";
  const charId = String(character.id || "");
  const squads = useMemo(() => {
    return CHARACTER_SQUADS[charId] || getGenericSquads(character, lang);
  }, [charId, character, lang]);
  const [selectedSquadIdx, setSelectedSquadIdx] = useState(0);
  const currentSquad = squads[selectedSquadIdx] || squads[0];
  const matchedTeammates = useMemo(() => {
    return matchSquadWithShowcase(currentSquad, showcase, lang);
  }, [currentSquad, showcase, lang]);
  const missingTeammates = useMemo(() => {
    return matchedTeammates.filter((tm) => !tm.isEquippedInShowcase);
  }, [matchedTeammates]);
  const rotationSim = useMemo(() => {
    return runFullTeamRotationSimulation(character, stats || {}, currentSquad, matchedTeammates, lang);
  }, [character, stats, currentSquad, matchedTeammates, lang]);
  const sim = runCombatSimulation(character, stats || {}, archetype, lang);
  if (!sim) return null;
  const isDual = Boolean(sim.hasDualOutput);
  const isSupport = sim.type === "SUPPORT" || sim.type === "SUSTAIN" || sim.type === "HYBRID_SUBDPS";
  const roleBadgeLabel = () => {
    if (sim.type === "HYBRID_SUBDPS") return isRu ? "САБ-ДПС И ПОДДЕРЖКА (SUB-DPS)" : "HYBRID SUB-DPS & UTILITY";
    if (sim.type === "SUPPORT") return isRu ? "ПОДДЕРЖКА ОТРЯДА (ГАРМОНИЯ)" : "TEAM HARMONY BUFFER";
    if (sim.type === "SUSTAIN") return isRu ? "ВЫЖИВАНИЕ И ЗАЩИТА (СУСТЕЙН)" : "SUSTAIN & MITIGATION";
    return isRu ? "ОСНОВНОЙ УРОН (ГИПЕРКЕРРИ)" : "MAIN DAMAGE CARRY";
  };
  const getTeammateAvatarUrl = (tm) => {
    if (tm.matchedChar?.avatar?.icon) return iconUrl(tm.matchedChar.avatar.icon);
    if (tm.matchedChar?.icon) return iconUrl(tm.matchedChar.icon);
    if (tm.icon) return iconUrl(tm.icon);
    if (tm.id) return iconUrl(`icon/character/${tm.id}.png`);
    return null;
  };
  return  React.createElement("div", { className: "panel panel-combat-sim" },  React.createElement("div", { className: "panel-title" },  React.createElement("span", null, isRu ? "БОЕВАЯ СИМУЛЯЦИЯ И РОТАЦИЯ" : "COMBAT SIMULATION & ROTATION"),  React.createElement("span", { style: { color: "var(--accent)" } }, isRu ? "MOC 12 // БОСС 90 УР." : "MOC 12 // LV.90 BOSS")),  React.createElement("div", { className: "combat-sim-header" },  React.createElement("div", { className: "combat-sim-title-group" },  React.createElement("div", { className: "combat-sim-badge-row" },  React.createElement("span", { className: `combat-sim-badge ${sim.type === "HYBRID_SUBDPS" ? "hybrid" : isSupport ? "support" : "dps"}` }, sim.type === "HYBRID_SUBDPS" ?  React.createElement(SparklesIcon, { size: 12 }) : isSupport ?  React.createElement(ShieldIcon, { size: 12 }) :  React.createElement(SwordIcon, { size: 12 }),  React.createElement("span", null, roleBadgeLabel()))),  React.createElement("h3", { className: "combat-sim-heading" }, isRu ? "Математический расчёт боевой ротации отряда" : "Mathematical Squad Combat Simulation")),  React.createElement("div", { className: "combat-sim-tier-box" },  React.createElement("span", { className: "combat-sim-tier-label" }, isRu ? "БОЕВОЙ РАНГ" : "COMBAT TIER"),  React.createElement("span", { className: "combat-sim-tier-val" }, sim.benchmarkTier))),  React.createElement("div", { className: "combat-squad-section" },  React.createElement("div", { className: "combat-squad-nav" },  React.createElement("div", { className: "squad-tabs-list" }, squads.map((sq, idx) =>  React.createElement(
    "button",
    {
      key: sq.id || idx,
      className: `squad-tab-btn ${selectedSquadIdx === idx ? "active" : ""}`,
      onClick: () => setSelectedSquadIdx(idx)
    },
     React.createElement("span", { className: "squad-tab-number" }, idx + 1),
     React.createElement("span", { className: "squad-tab-title" }, isRu ? sq.nameRu : sq.nameEn)
  )))),  React.createElement("p", { className: "combat-squad-desc" }, isRu ? currentSquad.descRu : currentSquad.descEn), missingTeammates.length > 0 ?  React.createElement("div", { className: "squad-showcase-alert warning" },  React.createElement("div", { className: "alert-icon-col" },  React.createElement(WarnIcon, { size: 16 })),  React.createElement("div", { className: "alert-body-col" },  React.createElement("span", { className: "alert-title" }, isRu ? `Внимание: ${missingTeammates.length} из 3 союзников не найдены на витрине аккаунта` : `Notice: ${missingTeammates.length} of 3 teammates missing from showcase`),  React.createElement("p", { className: "alert-text" }, isRu ? `Для расчёта точного командного урона до единицы поставьте [${missingTeammates.map((m) => m.nameRu || m.characterName || m.names[0]).join(", ")}] на витрину профиля в игре и нажмите кнопку «ОБНОВИТЬ» вверху сайта. Сейчас для них применены базовые софт-капы следов.` : `To calculate exact team damage down to the single digit, place [${missingTeammates.map((m) => m.nameEn || m.characterName || m.names[0]).join(", ")}] on your in-game showcase and click REFRESH. Currently, baseline trace soft-caps are used.`))) :  React.createElement("div", { className: "squad-showcase-alert success" },  React.createElement("div", { className: "alert-icon-col" },  React.createElement(CheckIcon, { size: 16 })),  React.createElement("div", { className: "alert-body-col" },  React.createElement("span", { className: "alert-title" }, isRu ? "Все союзники отряда найдены на вашей витрине!" : "All squad teammates verified on your showcase!"),  React.createElement("p", { className: "alert-text" }, isRu ? "Расчёт урона ротации выполнен с учётом РЕАЛЬНЫХ характеристик их снаряжения (КУ Sunday, ATK Robin, ЭП Жуань Мэй и т.д.) с точностью до единицы." : "Rotation damage is computed directly using their REAL equipped stats with 100% precision."))),  React.createElement("div", { className: "squad-teammates-grid" }, matchedTeammates.map((tm, tIdx) => {
    const avatarUrl = getTeammateAvatarUrl(tm);
    const tmName = tm.matchedChar?.name || (isRu ? tm.nameRu || tm.names[0] : tm.nameEn || tm.names[1] || tm.names[0]);
    const isEquipped = Boolean(tm.isEquippedInShowcase);
    return  React.createElement("div", { key: tIdx, className: `teammate-card ${isEquipped ? "equipped" : "missing"}` },  React.createElement("div", { className: "teammate-top" },  React.createElement("div", { className: "teammate-avatar-wrap" }, avatarUrl ?  React.createElement(
      "img",
      {
        src: avatarUrl,
        alt: tmName,
        className: "teammate-avatar-img",
        onError: (e) => handleImageFallback(e, "avatar")
      }
    ) :  React.createElement("div", { className: "teammate-avatar-placeholder" }, "?")),  React.createElement("div", { className: "teammate-meta" },  React.createElement("span", { className: "teammate-name" }, tmName),  React.createElement("span", { className: "teammate-role" }, isRu ? tm.roleRu : tm.roleEn))),  React.createElement("div", { className: "teammate-status-row" }, isEquipped ?  React.createElement("span", { className: "teammate-badge status-on" },  React.createElement(CheckIcon, { size: 11 }),  React.createElement("span", null, isRu ? "НА ВИТРИНЕ" : "ON SHOWCASE")) :  React.createElement("span", { className: "teammate-badge status-off" },  React.createElement(WarnIcon, { size: 11 }),  React.createElement("span", null, isRu ? "НЕ НА ВИТРИНЕ" : "NOT ON SHOWCASE")), isEquipped && tm.realStats &&  React.createElement("span", { className: "teammate-stat-pill" }, tm.realStats.cd > 50 && `${tm.realStats.cd}% КУ`, tm.realStats.atk > 2500 && `${tm.realStats.atk} ATK`, tm.realStats.be > 80 && `${tm.realStats.be}% ЭП`, tm.realStats.def > 2500 && `${tm.realStats.def} DEF`)),  React.createElement("p", { className: "teammate-buff-desc" }, isRu ? tm.dynamicBuffDescRu : tm.dynamicBuffDescEn));
  }))), rotationSim &&  React.createElement("div", { className: "combat-sim-metrics-grid rotation-metrics" },  React.createElement("div", { className: "combat-sim-metric-box highlight-box" },  React.createElement("span", { className: "sim-metric-label" }, isRu ? "СУММАРНЫЙ УРОН РОТАЦИИ" : "FULL ROTATION TOTAL DMG"),  React.createElement("span", { className: "sim-metric-value text-accent big" }, Number(rotationSim.rotationTotalDamage || 0).toLocaleString("ru-RU")),  React.createElement("span", { className: "sim-metric-hint" }, isRu ? "За полный цикл всех 4 союзников" : "Full 4-unit sequence")),  React.createElement("div", { className: "combat-sim-metric-box" },  React.createElement("span", { className: "sim-metric-label" }, isRu ? "ПИКОВЫЙ УДАР ПОД БАФФАМИ" : "PEAK BUFFED BURST HIT"),  React.createElement("span", { className: "sim-metric-value" }, Number(rotationSim.peakHitDamage || 0).toLocaleString("ru-RU")),  React.createElement("span", { className: "sim-metric-hint" }, isRu ? "Главный ультимейт / взрыв" : "Max single ability impact")),  React.createElement("div", { className: "combat-sim-metric-box" },  React.createElement("span", { className: "sim-metric-label" }, isRu ? "DPS ЗА ЦИКЛ 100 AV" : "CYCLE DPS (100 AV)"),  React.createElement("span", { className: "sim-metric-value" }, Number(rotationSim.teamCycleDps || 0).toLocaleString("ru-RU")),  React.createElement("span", { className: "sim-metric-hint" }, isRu ? "Скорость закрытия волн MoC" : "Wave clear tempo"))), isDual &&  React.createElement("div", { className: "combat-sim-subdps-section" },  React.createElement("div", { className: "combat-section-header" },  React.createElement("span", { className: "combat-section-icon" },  React.createElement(SwordIcon, { size: 13 })),  React.createElement("span", { className: "combat-section-title" }, isRu ? "ЛИЧНЫЙ БОЕВОЙ ВКЛАД (SUB-DPS УРОН)" : "PERSONAL COMBAT OUTPUT (SUB-DPS)")),  React.createElement("div", { className: "combat-sim-metrics-grid sub-grid" },  React.createElement("div", { className: "combat-sim-metric-box sub-box" },  React.createElement("span", { className: "sim-metric-label" }, sim.personalDpaLabel),  React.createElement("span", { className: "sim-metric-value highlight" }, Number(sim.personalDpa).toLocaleString("ru-RU"))),  React.createElement("div", { className: "combat-sim-metric-box sub-box" },  React.createElement("span", { className: "sim-metric-label" }, sim.personalDpcLabel),  React.createElement("span", { className: "sim-metric-value" }, Number(sim.personalDpc).toLocaleString("ru-RU"))),  React.createElement("div", { className: "combat-sim-metric-box sub-box" },  React.createElement("span", { className: "sim-metric-label" }, sim.personalMetric3Label),  React.createElement("span", { className: "sim-metric-value" }, sim.personalMetric3Value)))),  React.createElement("div", { className: "combat-sim-summary" },  React.createElement("p", { className: "sim-summary-text" }, isRu ? sim.summaryRu : sim.summaryEn),  React.createElement("span", { className: "sim-footnote" }, isRu ? "Параметры симуляции: босс 90 уровня (MoC 12 / Апокалипсис), фактор брони 1100, базовая устойчивость 20% RES, окно хода 100 AV (150 AV в цикле 0). Для включения реальных характеристик саппортов выставите их на витрину в игре." : "Simulation parameters: Lv. 90 Boss (MoC 12 / Apocalyptic Shadow), 1100 DEF factor, 20% Base RES, 100 AV turn window. Place support teammates on your in-game showcase to pipe real equipment stats into calculations.")));
}
