import React, { useState } from 'react';
import { ArrowRightIcon, WarnIcon } from './Icons.jsx';

export default function HomeView({ onSearch, isLoading, errorMsg, onOpenDemo, recentProfile, onRestoreProfile, t, lang = 'ru' }) {
  const [uid, setUid] = useState('');
  const isRu = (lang || (t?.lvl === 'Ур.' ? 'ru' : 'en')) === 'ru';

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

        {/* Quick Return to Profile button (instantaneous with 0 loading) */}
        {recentProfile && !isLoading && (
          <div style={{ marginBottom: '16px' }}>
            <button
              type="button"
              className="btn-quick-return"
              onClick={onRestoreProfile}
              title={isRu ? 'Мгновенно открыть профиль без загрузки (Вперёд / ArrowRight / Mouse 5)' : 'Instantly restore profile without loading (Forward / ArrowRight / Mouse 5)'}
            >
              <span className="btn-quick-return-left">
                <ArrowRightIcon size={14} className="return-arrow-icon" />
                <span>
                  {isRu ? 'Вернуться к профилю: ' : 'Return to profile: '}
                  <strong style={{ color: 'var(--text-primary)' }}>{recentProfile.player?.nickname || 'Trailblazer'}</strong>
                  <span style={{ opacity: 0.65, marginLeft: '6px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                    (UID: {recentProfile.player?.uid})
                  </span>
                </span>
              </span>
              <span className="quick-return-tag">{isRu ? 'Вперёд →' : 'Forward →'}</span>
            </button>
          </div>
        )}

        {/* Inline Error / Notice Banner */}
        {errorMsg && (
          <div className="error-banner">
            <div className="error-text">
              <WarnIcon size={14} className="error-svg-icon" />
              <span>{errorMsg}</span>
            </div>
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
