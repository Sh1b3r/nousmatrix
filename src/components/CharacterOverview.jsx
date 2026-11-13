import React from "react";
import {
  getCharHeadIcon,
  getCharAvatarPath,
  iconUrl,
  handleImageFallback,
  resolveElementIcon,
  resolvePathIcon
} from "../utils/audit";
import { SparklesIcon, WarnIcon, CheckIcon } from "./Icons.jsx";

export default function CharacterOverview({ character, audit, t, lang = "ru" }) {
  if (!character) return null;
  const isRu = lang === "ru";
  const elemIcon = resolveElementIcon(character.element);
  const pathIcon = resolvePathIcon(character.path);

  const targetTypes = ["Normal", "BPSkill", "Ultra", "Talent", "Maze"];
  const seenTypes = new Set();
  const coreSkills = [];
  for (const s of character.skills || []) {
    if (targetTypes.includes(s.type) && !seenTypes.has(s.type)) {
      seenTypes.add(s.type);
      coreSkills.push(s);
    }
  }

  const majorTraces = (character.skill_trees || []).filter((tr) =>
    ["Point06", "Point07", "Point08"].includes(tr.anchor)
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

  const handleJumpToPlan = () => {
    const el = document.getElementById("section-score");
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const topStrength = audit?.strengths?.[0] || null;
  const topAction = audit?.actions?.[0] || null;

  return (
    <div className="char-hero-card">
      <div className="char-hero-main-row">
        <div className="char-hero-left">
          <div className="char-portrait-box">
            <img
              className="char-portrait-img"
              src={getCharHeadIcon(character)}
              alt={character.name}
              onError={(e) => handleImageFallback(e, getCharAvatarPath(character))}
            />
          </div>
          <div className="char-details-primary">
            <h2>{character.name}</h2>
            <span className="char-stars">{"★".repeat(character.rarity || 5)}</span>
            <div className="char-tags-row">
              <span className="char-pill">
                {t.lvl} {character.level}/80
              </span>
              <span className="char-pill accent">
                {t.eidolons}
                {character.rank}
              </span>
              {elemIcon && (
                <span
                  className="char-pill char-icon-pill element-pill"
                  title={character.element?.name ? `${t.combatType}${character.element.name}` : ""}
                  style={character.element?.color ? { borderColor: `${character.element.color}88` } : undefined}
                >
                  <img
                    src={iconUrl(elemIcon)}
                    alt={character.element?.name || "Element"}
                    className="char-badge-icon element-icon"
                    crossOrigin="anonymous"
                    onError={(e) => handleImageFallback(e, elemIcon)}
                  />
                </span>
              )}
              {pathIcon && (
                <span
                  className="char-pill char-icon-pill path-pill"
                  title={character.path?.name ? `${t.path}${character.path.name}` : ""}
                >
                  <img
                    src={iconUrl(pathIcon)}
                    alt={character.path?.name || "Path"}
                    className="char-badge-icon path-icon"
                    crossOrigin="anonymous"
                    onError={(e) => handleImageFallback(e, pathIcon)}
                  />
                </span>
              )}
            </div>

            <div className="char-skills-row">
              {coreSkills.map((s) => (
                <div
                  key={s.id}
                  className="skill-item"
                  title={`${s.type_text || s.type}: ${s.name}\n${s.simple_desc || s.desc || ""}\n(${t.lvl} ${s.level}/${s.max_level})`}
                >
                  <div className="skill-icon-wrap">
                    <img
                      className="skill-icon"
                      src={iconUrl(s.icon)}
                      alt={s.name}
                      onError={(e) => handleImageFallback(e, s.icon)}
                    />
                    <span className="skill-lvl-badge">{s.level}</span>
                  </div>
                  <span className="skill-name-label">{getSkillTypeShort(s.type)}</span>
                </div>
              ))}
              {majorTraces.map((tr) => (
                <div
                  key={tr.id}
                  className={`skill-item trace-item ${tr.level > 0 ? "unlocked" : "locked"}`}
                  title={`${getTraceLabel(tr.anchor)}: ${
                    isRu ? "Ключевой след возвышения" : "Major Ascension Trace"
                  } (${tr.level > 0 ? (isRu ? "Разблокирован" : "Unlocked") : isRu ? "Заблокирован" : "Locked"})`}
                >
                  <div className="skill-icon-wrap">
                    <img
                      className="skill-icon"
                      src={iconUrl(tr.icon)}
                      alt={tr.anchor}
                      onError={(e) => handleImageFallback(e, tr.icon)}
                    />
                    <span className="skill-lvl-badge trace">{getTraceLabel(tr.anchor)}</span>
                  </div>
                  <span className="skill-name-label">{getTraceLabel(tr.anchor)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {character.light_cone && (
          <div className="lightcone-box">
            <img
              className="cone-img"
              src={iconUrl(character.light_cone.icon)}
              alt={character.light_cone.name}
              onError={(e) => handleImageFallback(e, character.light_cone.icon)}
            />
            <div className="cone-info">
              <div className="cone-name">{character.light_cone.name}</div>
              <div className="cone-super">
                {t.superimposition}
                {character.light_cone.rank} ({"★".repeat(character.light_cone.rarity || 5)})
              </div>
              <div className="cone-level">
                {t.lvl} {character.light_cone.level}/80
              </div>
              <div className="cone-stats">
                {(character.light_cone.attributes || []).map((a, i) => (
                  <span key={i}>
                    {a.name.replace("Базовая ", "").replace("Базовое ", "")}: {a.display}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {audit && (
        <div className="char-hero-verdict-bar">
          <div className="verdict-score-block">
            <span className="verdict-score-pill">
              GRADE {audit.grade || "S"} • {audit.score}/100
            </span>
            <span className="verdict-rank-pill">TOP {audit.topPercent}%</span>
          </div>

          <div className="verdict-takeaways-group">
            {topStrength && (
              <div className="verdict-takeaway-item strength">
                <span className="takeaway-label">
                  <CheckIcon size={12} />
                  <span>{isRu ? "Сильная сторона:" : "Key Strength:"}</span>
                </span>
                <span className="takeaway-text" title={topStrength}>
                  {topStrength}
                </span>
              </div>
            )}

            {topAction && (
              <div className="verdict-takeaway-item action" onClick={handleJumpToPlan}>
                <span className="takeaway-label">
                  <SparklesIcon size={12} />
                  <span>{isRu ? "Главный совет:" : "Next Priority:"}</span>
                </span>
                <span className="takeaway-text clickable" title={topAction.desc}>
                  {topAction.title}
                </span>
                <span className="takeaway-jump-arrow">→</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
