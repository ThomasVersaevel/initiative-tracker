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
  const [showModal, setShowModal] = useState(false);
  const [characterName, setCharacterName] = useState("");
  const [characterAC, setCharacterAC] = useState("");
  const [characterHP, setCharacterHP] = useState("");

  const menuRef = useRef(null);

  const handleBlur = (e) => {
    if (!menuRef.current?.contains(e.relatedTarget)) {
      setMenuOpen(false);
    }
  };

  const clearCharacterInputs = () => {
    setCharacterName("");
    setCharacterAC("");
    setCharacterHP("");
  };

  const saveCharacterStats = (character) => {
    const existing = JSON.parse(localStorage.getItem("pcStats") || "{}");

    const key = character.name.toLowerCase();

    existing[key] = character;

    localStorage.setItem("pcStats", JSON.stringify(existing));
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

            <button
              className="menu-btn"
              onClick={() => {
                  console.log("opening modal");
                setMenuOpen(false);
                setShowModal(true);
              }}
            >
              Add character stats
            </button>
          </div>
        )}
      </div>

      <div className="title">
        <h1>Take Initiative</h1>
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

      {showModal && (
        <div className="modal">
          <h2>Add Character Stats</h2>

          <input
            type="text"
            placeholder="Character Name"
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
          />

          <input
            type="number"
            placeholder="AC"
            value={characterAC}
            onChange={(e) => setCharacterAC(e.target.value)}
          />

          <input
            type="number"
            placeholder="HP"
            value={characterHP}
            onChange={(e) => setCharacterHP(e.target.value)}
          />

          <button
            className="btn btn-secondary"
            onClick={() => {
              clearCharacterInputs();
              setShowModal(false);
            }}
          >
            Cancel
          </button>

          <button
            className="btn btn-primary"
            onClick={() => {
              saveCharacterStats({
                name: characterName,
                ac: Number(characterAC),
                hp: Number(characterHP),
              });
              clearCharacterInputs();
              setShowModal(false);
            }}
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
}
