import React, { useState } from "react";
import { ArrowRightIcon, WarnIcon } from "./Icons.jsx";
export default function HomeView({ onSearch, isLoading, errorMsg, onOpenDemo, recentProfile, onRestoreProfile, t, lang = "ru" }) {
  const [uid, setUid] = useState("");
  const isRu = (lang || (t?.lvl === "Ур." ? "ru" : "en")) === "ru";
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const cleanUid = uid.trim().replace(/\D/g, "");
    if (!cleanUid) {
      onSearch("700142890");
    } else {
      onSearch(cleanUid);
    }
  };
  return  React.createElement("section", { id: "view-home" },  React.createElement("div", { className: "home-card" },  React.createElement("h1", { className: "hero-title" }, "NousMatrix"),  React.createElement("form", { onSubmit: handleSubmit, className: "input-box-wrapper" },  React.createElement(
    "input",
    {
      type: "text",
      className: "uid-input",
      placeholder: t.inputPlaceholder,
      value: uid,
      onChange: (e) => setUid(e.target.value),
      disabled: isLoading,
      maxLength: 11,
      autoFocus: true
    }
  ),  React.createElement("button", { type: "submit", className: "btn-submit", disabled: isLoading }, isLoading ? t.btnAnalyzing : t.btnAnalyze)), recentProfile && !isLoading &&  React.createElement("div", { style: { marginBottom: "16px" } },  React.createElement(
    "button",
    {
      type: "button",
      className: "btn-quick-return",
      onClick: onRestoreProfile,
      title: isRu ? "Мгновенно открыть профиль без загрузки (Вперёд / ArrowRight / Mouse 5)" : "Instantly restore profile without loading (Forward / ArrowRight / Mouse 5)"
    },
     React.createElement("span", { className: "btn-quick-return-left" },  React.createElement(ArrowRightIcon, { size: 14, className: "return-arrow-icon" }),  React.createElement("span", null, isRu ? "Вернуться к профилю: " : "Return to profile: ",  React.createElement("strong", { style: { color: "var(--text-primary)" } }, recentProfile.player?.nickname || "Trailblazer"),  React.createElement("span", { style: { opacity: 0.65, marginLeft: "6px", fontSize: "11px", fontFamily: "var(--font-mono)" } }, "(UID: ", recentProfile.player?.uid, ")"))),
     React.createElement("span", { className: "quick-return-tag" }, isRu ? "Вперёд →" : "Forward →")
  )), errorMsg &&  React.createElement("div", { className: "error-banner" },  React.createElement("div", { className: "error-text" },  React.createElement(WarnIcon, { size: 14, className: "error-svg-icon" }),  React.createElement("span", null, errorMsg)), onOpenDemo &&  React.createElement(
    "button",
    {
      type: "button",
      className: "btn-demo-link",
      onClick: onOpenDemo
    },
    t.demoBtnText
  )),  React.createElement("div", { className: "guide-banner" },  React.createElement("div", { className: "guide-heading" }, t.guideHeading),  React.createElement("div", { className: "guide-steps" },  React.createElement("div", { className: "guide-step" },  React.createElement("b", null, t.guideStep1Title), t.guideStep1Desc),  React.createElement("div", { className: "guide-step" },  React.createElement("b", null, t.guideStep2Title), t.guideStep2Desc)))));
}
