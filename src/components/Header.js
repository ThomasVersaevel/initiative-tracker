import React, { useState, useRef } from "react";
import "./Header.css";

const themes = [
  { label: "Default", value: "default" },
  { label: "Forest", value: "green" },
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
  const menuRef = useRef(null);

  const handleBlur = (e) => {
    // Only close if focus moved outside the menu
    if (!menuRef.current?.contains(e.relatedTarget)) {
      setMenuOpen(false);
    }
  };

  return (
    <div className="App-header">
      <div onBlur={handleBlur} ref={menuRef}>
        <button
          className="hamburger"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
          onBlur={handleBlur}
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
        
      </div>
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
