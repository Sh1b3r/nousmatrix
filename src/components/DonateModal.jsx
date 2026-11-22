import React from "react";

export default function DonateModal({ isOpen, onClose, lang = "ru" }) {
  if (!isOpen) return null;
  const isRu = lang === "ru";

  const paymentOptions = [
    {
      id: "privat24",
      badge: isRu ? "Visa / Mastercard · ПриватБанк" : "Visa / Mastercard · PrivatBank",
      title: isRu ? "Помощь бабушке" : "Help Grandma",
      desc: isRu
        ? "Откроется страница ПриватБанка. Выберите «Другая карта» для оплаты Visa или Mastercard. Международные карты могут зависеть от страны и банка отправителя."
        : "Opens PrivatBank’s page. Choose “Other card” to pay by Visa or Mastercard. International card availability may depend on the sender’s country and bank.",
      icon: "💳",
      link: "https://www.privat24.ua/send/k853c",
      actionText: isRu ? "Перейти к оплате картой" : "Donate by card"
    },
    {
      id: "international-transfer",
      badge: isRu ? "Личные сообщения" : "Private message",
      title: isRu ? "Иностранный перевод" : "International bank transfer",
      desc: isRu
        ? "Напишите мне лично — отправлю реквизиты SWIFT в ответ"
        : "Message me privately and I’ll send the SWIFT details",
      icon: "💬",
      link: "https://t.me/Spani_ard",
      actionText: isRu ? "Написать в Telegram" : "Message me on Telegram"
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
                {isRu ? "Помогите бабушке с операцией" : "Help Grandma Get Her Surgery"}
              </h3>
              <p className="donate-modal-sub">
                {isRu
                  ? "Бабушке уже заменили один тазобедренный сустав, теперь нужна операция на втором. Имплант стоит около 100 000 грн. Будем благодарны за любую помощь."
                  : "My grandmother has already had one hip replaced and now needs surgery on her other hip. The implant costs about UAH 100,000. Any support is greatly appreciated."}
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
              <a
                href={opt.link}
                target="_blank"
                rel="noopener noreferrer"
                className="donate-opt-btn link"
              >
                {opt.actionText} ↗
              </a>
            </div>
          ))}
        </div>

        <div className="donate-modal-footer">
          <span>{isRu ? "Спасибо за помощь и поддержку нашей семьи! 💛" : "Thank you for helping and supporting our family! 💛"}</span>
        </div>
      </div>
    </div>
  );
}
