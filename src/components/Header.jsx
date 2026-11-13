import React from "react";
export default function Header({ onBackToHome }) {
  return  React.createElement("header", { className: "site-header" },  React.createElement("div", { className: "brand", onClick: onBackToHome, role: "button", tabIndex: 0, title: "На главную" },  React.createElement("img", { className: "brand-logo", src: "/media/NousMatrix-logo.png", alt: "NousMatrix Logo" }),  React.createElement("span", { className: "brand-title" }, "NousMatrix")));
}
