import React from 'react';

export default function Header({ onBackToHome }) {
  return (
    <header className="site-header">
      <div className="brand" onClick={onBackToHome} role="button" tabIndex={0} title="На главную">
        <img className="brand-logo" src="/media/NousMatrix-logo.png" alt="NousMatrix Logo" />
        <span className="brand-title">NousMatrix</span>
      </div>
    </header>
  );
}
