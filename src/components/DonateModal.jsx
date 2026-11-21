import React, { useState } from "react";

export default function DonateModal({ isOpen, onClose, lang = "ru" }) {
  if (!isOpen) return null;
  const isRu = lang === "ru";
  const [copiedKey, setCopiedKey] = useState(null);

  const copyToClipboard = (text, key) => {
    if (!text) return;
    try {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // fallback
    }
  };

  const paymentOptions = [
    {
      id: "privat24",
      badge: isRu ? "Украина / Карта" : "Ukraine / Card",
      title: "Приват24 / Mono / UAH",
      desc: isRu ? "Прямой перевод на карту (Privat24)" : "Direct card transfer (Privat24)",
      icon: "💳",
      link: "https://www.privat24.ua/send/k853c",
      actionText: isRu ? "Перейти к оплате" : "Open Payment"
    },
    {
      id: "crypto_usdt",
      badge: "Global / Crypto",
      title: "USDT (TRC-20)",
      desc: isRu ? "Быстрый перевод без комиссий банков" : "Fast crypto transfer via TRC-20",
      icon: "₮",
      address: "TYZ88pTz92nS8f9s3WcE6X2pG11aBcD7eF", // Placeholder clean address
      actionText: isRu ? "Скопировать адрес" : "Copy Address"
    },
    {
      id: "crypto_ton",
      badge: "Telegram / Crypto",
      title: "TON (The Open Network)",
      desc: isRu ? "Через кошелёк Telegram Wallet (@wallet)" : "Via Telegram Wallet or Tonkeeper",
      icon: "💎",
      address: "EQB_nousmatrix_donation_ton_wallet_holder",
      actionText: isRu ? "Скопировать адрес" : "Copy Address"
    },
    {
      id: "telegram_bot",
      badge: isRu ? "Telegram Stars / Бот" : "Telegram Stars / Bot",
      title: "Nous Matrix Telegram",
      desc: isRu ? "Поддержка через звёзды и донат в боте" : "Support via stars & donate in bot",
      icon: "✈️",
      link: "https://t.me/Nousmatrix_bot",
      actionText: isRu ? "Открыть бота" : "Open Bot"
    }
  ];

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 300 }}>
      <div
        className="donate-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="donate-modal-header">
          <div className="donate-modal-title-wrap">
            <span className="donate-heart-badge">💖</span>
            <div>
              <h3 className="donate-modal-title">
                {isRu ? "Поддержать развитие Nous Matrix" : "Support Nous Matrix Development"}
              </h3>
              <p className="donate-modal-sub">
                {isRu
                  ? "Сайт создаётся для игроков и содержится на личные средства без навязчивой рекламы. Ваша поддержка помогает оплачивать серверы симуляции и API."
                  : "The project is maintained independently without intrusive ads. Your support covers compute servers and real-time APIs."}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="donate-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="donate-options-grid">
          {paymentOptions.map((opt) => (
            <div key={opt.id} className="donate-option-card">
              <div className="donate-option-top">
                <span className="donate-opt-icon">{opt.icon}</span>
                <span className="donate-opt-badge">{opt.badge}</span>
              </div>
              <div className="donate-opt-info">
                <div className="donate-opt-title">{opt.title}</div>
                <div className="donate-opt-desc">{opt.desc}</div>
              </div>
              {opt.link ? (
                <a
                  href={opt.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="donate-opt-btn link"
                >
                  {opt.actionText} ↗
                </a>
              ) : (
                <button
                  type="button"
                  className={`donate-opt-btn copy ${copiedKey === opt.id ? "copied" : ""}`}
                  onClick={() => copyToClipboard(opt.address, opt.id)}
                >
                  {copiedKey === opt.id
                    ? (isRu ? "Скопировано! ✓" : "Copied! ✓")
                    : opt.actionText}
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="donate-modal-footer">
          <span>{isRu ? "Спасибо каждому Первопроходцу за поддержку проекта! 🚀" : "Thank you to every Trailblazer for supporting us! 🚀"}</span>
        </div>
      </div>
    </div>
  );
}
