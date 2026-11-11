import React, { useState } from 'react';

export default function HomeView({ onSearch, isLoading, t }) {
  const [uid, setUid] = useState('');

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    onSearch(uid.trim() || '700142890');
  };

  return (
    <section id="view-home">
      <div className="home-card">
        <span className="hero-label">{t.heroLabel}</span>
        <h1 className="hero-title">{t.heroTitle}</h1>

        <form onSubmit={handleSubmit} className="input-box-wrapper">
          <input
            type="text"
            className="uid-input"
            placeholder={t.inputPlaceholder}
            value={uid}
            onChange={(e) => setUid(e.target.value)}
            autoFocus
          />
          <button type="submit" className="btn-submit" disabled={isLoading}>
            {isLoading ? t.btnAnalyzing : t.btnAnalyze}
          </button>
        </form>

        <div className="guide-banner">
          <div className="guide-heading">{t.guideHeading}</div>
          <div className="guide-steps">
            <div className="guide-step">
              <b>{t.guideStep1Title}</b>
              {t.guideStep1Desc}
            </div>
            <div className="guide-step">
              <b>{t.guideStep2Title}</b>
              {t.guideStep2Desc}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
