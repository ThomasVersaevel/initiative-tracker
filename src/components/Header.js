import React, { useState } from "react";
import "./Header.css";

const themes = [
  { label: "Default", value: "default" },
  { label: "Forrest", value: "green" },
  { label: "Prisma", value: "prisma" },
  { label: "Dark", value: "dark" },
  { label: "Berry", value: "berry" },
];

export function Header({
  onSelectTheme,
  showSpeed,
  showSpell,
  setShowSpeed,
  setShowSpell,
  showCondition,
  setShowCondition,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="App-header">
      <button
        className="hamburger"
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label="Toggle menu"
      >
        <span>☰</span>
      </button>
      {/* Dropdown menu */}
      {menuOpen && (
        <div className="hamburger-menu">
          <label className="form-check-label">
            <input
              type="checkbox"
              className="form-check-input"
              checked={showSpeed}
              onChange={() => setShowSpeed(!showSpeed)}
            />
            Show Speed
          </label>

          <label className="form-check-label">
            <input
              type="checkbox"
              className="form-check-input"
              checked={showSpell}
              onChange={() => setShowSpell(!showSpell)}
            />
            Show Spell Save
          </label>

          <label className="form-check-label">
            <input
              type="checkbox"
              className="form-check-input"
              checked={showCondition}
              onChange={() => setShowCondition(!showCondition)}
            />
            Show Condition
          </label>
        </div>
      )}
      <div className="title">
        <h1>Take Initiative</h1>
      </div>
      {/* Theme selector */}
      <div className="class-selector">
        <select
          className="form-control select"
          onChange={(e) => onSelectTheme(e.target.value)}
        >
          {themes.map((option, index) => (
            <option className="option" key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
