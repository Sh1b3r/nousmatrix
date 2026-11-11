import React, { useState } from 'react';

export default function HomeView({ onSearch, isLoading }) {
  const [uid, setUid] = useState('');

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    onSearch(uid.trim() || '700142890');
  };

  return (
    <section id="view-home">
      <div className="home-card">
        <span className="hero-label">Строгий аудит характеристик</span>
        <h1 className="hero-title">Математическая валидация билда без визуального шума.</h1>

        <form onSubmit={handleSubmit} className="input-box-wrapper">
          <input
            type="text"
            className="uid-input"
            placeholder="Введите UID аккаунта (например: 700142890)"
            value={uid}
            onChange={(e) => setUid(e.target.value)}
            autoFocus
          />
          <button type="submit" className="btn-submit" disabled={isLoading}>
            {isLoading ? 'АНАЛИЗ...' : 'АНАЛИЗИРОВАТЬ'}
          </button>
        </form>

        <div className="guide-banner">
          <div className="guide-heading">Откуда берутся персонажи и как обновить сборку:</div>
          <div className="guide-steps">
            <div className="guide-step">
              <b>1. Внутриигровая витрина (Showcase)</b>
              Данные считываются строго из открытого профиля в игре. Зайдите в <code>Телефон → Профиль → Настройки витрины</code> и выставьте нужных персонажей. Обязательно включите тумблер <code>Показывать детали</code>.
            </div>
            <div className="guide-step">
              <b>2. Очистка серверного кэша</b>
              Сервера игры обновляют витрину с задержкой 5–15 минут. После экипировки нового сета телепортируйтесь в другую локацию и полностью перезапустите игру, прежде чем запускать повторный анализ.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
