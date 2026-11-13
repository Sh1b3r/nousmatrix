import React, { useRef, useState, useEffect } from "react";
import {
  getCharHeadIcon,
  getCharAvatarPath,
  iconUrl,
  handleImageFallback,
  calculateCharacterAudit
} from "../utils/audit";

export default function ShowcaseRoster({ characters, activeIndex, onSelect, t, lang }) {
  const trackRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const isRu = lang === "ru";

  const checkScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = trackRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll, { passive: true });
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      if (el) el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [characters]);

  const scrollByDelta = (delta) => {
    if (trackRef.current) {
      trackRef.current.scrollBy({ left: delta, behavior: "smooth" });
    }
  };

  return (
    <div className="roster-section">
      <div className="roster-header">
        <div className="roster-title">
          <span>{t.rosterTitle}</span>
          <span className="badge-count">{t.rosterCharsSuffix(characters.length)}</span>
        </div>
        <div className="roster-header-right">
          <span className="roster-hint desktop-only">{t.rosterHint}</span>
          <span className="roster-swipe-badge mobile-only">
            {isRu ? "← Листайте витрину →" : "← Swipe showcase →"}
          </span>
        </div>
      </div>

      <div className={`roster-scroll-wrapper ${canScrollLeft ? "can-scroll-left" : ""} ${canScrollRight ? "can-scroll-right" : ""}`}>
        {canScrollLeft && (
          <button
            type="button"
            className="roster-nav-arrow left"
            onClick={() => scrollByDelta(-200)}
            aria-label="Scroll left"
          >
            ‹
          </button>
        )}

        <div className="roster-track" ref={trackRef}>
          {characters.map((char, idx) => {
            const isActive = idx === activeIndex;
            const audit = calculateCharacterAudit(char, lang);
            return (
              <div
                key={char.id || idx}
                className={`roster-card ${isActive ? "active" : ""}`}
                onClick={() => onSelect(idx)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(idx);
                  }
                }}
              >
                <div className="roster-avatar-wrap">
                  <img
                    className="roster-avatar-img"
                    src={getCharHeadIcon(char)}
                    alt={char.name}
                    onError={(e) => handleImageFallback(e, getCharAvatarPath(char))}
                    loading="lazy"
                  />
                </div>
                <div className="roster-char-name" title={char.name}>
                  {char.name}
                </div>
                <div className="roster-char-meta">
                  {t.lvl} {char.level} • E{char.rank}
                </div>
                <div className="roster-score-pill">
                  TOP {audit.topPercent}% • {audit.score}
                </div>
              </div>
            );
          })}
        </div>

        {canScrollRight && (
          <button
            type="button"
            className="roster-nav-arrow right"
            onClick={() => scrollByDelta(200)}
            aria-label="Scroll right"
          >
            ›
          </button>
        )}
      </div>
    </div>
  );
}
