import React, { useState } from "react";
import "./Header.css";

const themes = [
  { label: "Default", value: "default" },
  { label: "Green", value: "green" },
  { label: "Prisma", value: "prisma" },
  { label: "Dark", value: "dark" },
  { label: "Berry", value: "berry" },
];

export function Header({ onSelectTheme, }) {
  const [showSpeed, setShowSpeed] = useState(true);
  const [showSpell, setShowSpell] = useState(true);

  return (
    <div className="App-header">
      <div className="title">
        <h1>Take Initiative</h1>
      </div>
      <div className="options-container">
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            id="toggleSpeed"
            checked={showSpeed}
            onChange={() => setShowSpeed((prev) => !prev)}
          />
          <label className="form-check-label" htmlFor="toggleSpeed">
            Show Speed
          </label>
        </div>
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            id="toggleSpeed"
            checked={showSpell}
            onChange={() => setShowSpell((prev) => !prev)}
          />
          <label className="form-check-label" htmlFor="toggleSpeed">
            Show Speed
          </label>
        </div>
      </div>

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
