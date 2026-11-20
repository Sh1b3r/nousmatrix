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
      const headerOffset = 60; // Offset for sticky nav alone at top: 0

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
      const yOffset = -55; // Offset for sticky sections bar at top: 0
      const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <nav className="dashboard-nav-bar" aria-label={isRu ? "Навигация по разделам" : "Section navigation"}>
      <div className="dashboard-nav-inner">
        <div className="nav-left-group">
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

        <a
          href="https://www.privat24.ua/send/k853c"
          target="_blank"
          rel="noopener noreferrer"
          className="nav-donate-btn"
          title={isRu ? "Поддержать развитие проекта Nous Matrix" : "Support Nous Matrix development"}
        >
          <svg className="donate-heart-icon" viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <span className="donate-text-full">{isRu ? "Поддержать проект" : "Support Project"}</span>
          <span className="donate-text-short">{isRu ? "Поддержать" : "Donate"}</span>
        </a>
      </div>
    </nav>
  );
}
