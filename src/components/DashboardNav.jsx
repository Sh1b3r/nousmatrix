import React, { useState, useEffect } from "react";
import { TrophyIcon, SparklesIcon } from "./Icons.jsx";

export default function DashboardNav({ lang = "ru" }) {
  const isRu = lang === "ru";
  const [activeSection, setActiveSection] = useState("section-overview");

  const navItems = [
    { id: "section-overview", labelRu: "Обзор и вердикт", labelEn: "Overview & Verdict" },
    { id: "section-score", labelRu: "Оценка и план", labelEn: "Score & Plan" },
    { id: "section-stats", labelRu: "Характеристики", labelEn: "Combat Stats" },
    { id: "section-relics", labelRu: "Реликвии и сеты", labelEn: "Relics & Sets" },
    { id: "section-simulation", labelRu: "Симуляция MoC 12", labelEn: "MoC 12 Simulation" }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const headerOffset = 140;

      for (let i = navItems.length - 1; i >= 0; i--) {
        const item = navItems[i];
        const el = document.getElementById(item.id);
        if (el) {
          const top = el.offsetTop - headerOffset;
          if (scrollY >= top) {
            setActiveSection(item.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleJump = (id) => {
    setActiveSection(id);
    const target = document.getElementById(id);
    if (target) {
      const yOffset = -90; // Offset for sticky headers
      const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <nav className="dashboard-nav-bar" aria-label={isRu ? "Навигация по разделам" : "Section navigation"}>
      <div className="dashboard-nav-inner">
        <span className="nav-bar-label">{isRu ? "Разделы:" : "Jump to:"}</span>
        <div className="nav-pills-list">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`nav-pill-btn ${isActive ? "active" : ""}`}
                onClick={() => handleJump(item.id)}
              >
                <span>{isRu ? item.labelRu : item.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
