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
  const [pcStats, setPcStats] = useState(() => {
    return JSON.parse(localStorage.getItem("pcStats") || "{}");
  });

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
    const updated = {
      ...pcStats,
      [character.name.toLowerCase()]: character,
    };

    setPcStats(updated);
    localStorage.setItem("pcStats", JSON.stringify(updated));
  };

  const editCharacterStats = (name) => {
    const updated = { ...pcStats };
    setCharacterName(updated[name].name);
    setCharacterAC(updated[name].ac);
    setCharacterHP(updated[name].hp);
    delete updated[name];

    localStorage.setItem("pcStats", JSON.stringify(updated));
  };

  const deleteCharacterStats = (name) => {
    const updated = { ...pcStats };
    delete updated[name];

    setPcStats(updated);
    localStorage.setItem("pcStats", JSON.stringify(updated));
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
        <div className="character-modal">
          <div className="modal-left">
            <h4>Add Character</h4>
            Name:
            <input
              className="modal-input"
              type="text"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
            />
            AC:
            <input
              className="modal-input"
              type="number"
              value={characterAC}
              onChange={(e) => setCharacterAC(e.target.value)}
            />
            HP:
            <input
              className="modal-input"
              type="number"
              value={characterHP}
              onChange={(e) => setCharacterHP(e.target.value)}
            />
            <div className="modal-buttons">
              <button
                className="modal-btn"
                onClick={() => {
                  clearCharacterInputs();
                  setShowModal(false);
                }}
              >
                Cancel
              </button>

              <button
                className="modal-btn"
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
          </div>

          <div className="modal-right">
            <h4>Saved Characters</h4>

            {Object.entries(pcStats).map(([name]) => (
              <div key={name} className="character-entry">
                <span>{name.charAt(0).toUpperCase() + name.slice(1)}</span>

                <button
                  className="delete-img-button"
                  onClick={() => editCharacterStats(name)}
                >
                  <img
                    className="button-img"
                    src="/images/edit-icon.svg"
                    alt=""
                  ></img>
                </button>
                <button
                  className="delete-img-button"
                  onClick={() => deleteCharacterStats(name)}
                >
                  <img
                    className="button-img"
                    src="/images/trash-icon.png"
                    alt=""
                  ></img>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
