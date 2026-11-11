import React, { useState } from 'react';

export default function HomeView({ onSearch, isLoading, errorMsg, onOpenDemo, t }) {
  const [uid, setUid] = useState('');

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const cleanUid = uid.trim().replace(/\D/g, '');
    if (!cleanUid) {
      onSearch('700142890');
    } else {
      onSearch(cleanUid);
    }
  };

  return (
    <section id="view-home">
      <div className="home-card">
        <h1 className="hero-title">NousMatrix</h1>

        <form onSubmit={handleSubmit} className="input-box-wrapper">
          <input
            type="text"
            className="uid-input"
            placeholder={t.inputPlaceholder}
            value={uid}
            onChange={(e) => setUid(e.target.value)}
            disabled={isLoading}
            maxLength={11}
            autoFocus
          />
          <button type="submit" className="btn-submit" disabled={isLoading}>
            {isLoading ? t.btnAnalyzing : t.btnAnalyze}
          </button>
        </form>

        {/* Inline Error / Notice Banner */}
        {errorMsg && (
          <div className="error-banner">
            <div className="error-text">⚠️ {errorMsg}</div>
            {onOpenDemo && (
              <button
                type="button"
                className="btn-demo-link"
                onClick={onOpenDemo}
              >
                {t.demoBtnText}
              </button>
            )}
          </div>
        )}

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
