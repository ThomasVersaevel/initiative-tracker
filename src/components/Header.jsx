import React, { useState, useRef } from "react";
import "./Header.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { supabase } from "../Supabase";

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
  setPage,
  pcStats,
  setPcStats,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [characterName, setCharacterName] = useState("");
  const [characterAC, setCharacterAC] = useState("");
  const [characterHP, setCharacterHP] = useState("");
  const [editingCharacterId, setEditingCharacterId] = useState(null);

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
    setEditingCharacterId(null);
  };

  const saveCharacterStats = async (character) => {
    const query =
      editingCharacterId !== null
        ? supabase
            .from("characters")
            .update(character)
            .eq("id", editingCharacterId)
            .select()
            .single()
        : supabase.from("characters").insert(character).select().single();
    const { data, error } = await query;

    if (error) {
      console.error("Failed to save character:", error);
      alert("Unable to save character.");
      return false;
    }

    setPcStats((current) => {
      const updated = { ...current };
      const previousEntry = Object.entries(updated).find(
        ([, savedCharacter]) => savedCharacter.id === data.id,
      );
      if (previousEntry) delete updated[previousEntry[0]];
      updated[data.name.toLowerCase()] = data;
      return updated;
    });
    return true;
  };

  const editCharacterStats = (name) => {
    const character = pcStats[name];
    setCharacterName(character.name);
    setCharacterAC(character.ac);
    setCharacterHP(character.hp);
    setEditingCharacterId(character.id);
  };

  const deleteCharacterStats = async (name) => {
    const character = pcStats[name];
    const { error } = await supabase
      .from("characters")
      .delete()
      .eq("id", character.id);

    if (error) {
      console.error("Failed to delete character:", error);
      alert("Unable to delete character.");
      return;
    }

    setPcStats((current) => {
      const updated = { ...current };
      delete updated[name];
      return updated;
    });
  };

  return (
    <div className="App-header">
      <button className="menu-btn" onClick={() => setPage("token-stamp")}>
        <FontAwesomeIcon icon={faArrowLeft} /> Token Stamp
      </button>

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
      <button
        className="menu-btn"
        onClick={() => setPage("stat-block-builder")}
      >
        Stat Block Builder <FontAwesomeIcon icon={faArrowRight} />
      </button>
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
                onClick={async () => {
                  const saved = await saveCharacterStats({
                    name: characterName,
                    ac: Number(characterAC),
                    hp: Number(characterHP),
                  });
                  if (saved) {
                    clearCharacterInputs();
                    setShowModal(false);
                  }
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
