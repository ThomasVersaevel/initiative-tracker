import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./GridRow.css";
import { Popup } from "./Popup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFloppyDisk } from "@fortawesome/free-solid-svg-icons";
import { NumericInput } from "../NumericInput";

const condition = [
  "blinded",
  "charmed",
  "concentration",
  "deafened",
  "frightened",
  "grappled",
  "incapacitated",
  "invisible",
  "paralyzed",
  "petrified",
  "poisoned",
  "prone",
  "restrained",
  "stunned",
  "surprised",
  "unconscious",
];

const savingThrowConditions = [
  "blinded",
  "charmed",
  "frightened",
  "paralyzed",
  "petrified",
  "poisoned",
  "stunned",
  "unconscious",
];

export function GridRow({
  columnSizes,
  id,
  initialValues,
  updateValues,
  onDeleteRow,
  isNew,
  highlighted,
  shouldRoll,
  theme,
  showSpeed,
  showSpellSave,
  showCondition,
  rowIndex,
  savedCharacterStats,
  onSaveCharacter,
  onImportStaticImage,
}) {
  const nameCellRef = useRef(null);
  const initiativeCellRef = useRef(null);

  const getCellPopupStyle = (cellRef) => {
    const rect = cellRef.current?.getBoundingClientRect();
    if (!rect) {
      return {};
    }

    return {
      position: "fixed",
      top: `${rect.top + rect.height + 4}px`,
      left: `${rect.left + 4}px`,
      width: "200px",
    };
  };
  const [values, setValues] = useState({
    ...initialValues,
    hp: initialValues.hp ?? 0,
    hpGroup: initialValues.hpGroup ?? [0, 0, 0, 0],
    isGroup: initialValues.isGroup ?? false,
  });
  const hpRef = useRef(initialValues.hp ?? 0);

  const [nameRecognised, setNameRecognised] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [prevHighlighted, setPrevHighlighted] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [rowHovered, setRowHovered] = useState(false);
  const [d20Roll, setD20Roll] = useState("");
  const [isD20Rolling, setIsD20Rolling] = useState(false);
  const [maxHp, setMaxHp] = useState(0);
  const [savePromptOpen, setSavePromptOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (deleteTimeoutRef.current) {
        clearTimeout(deleteTimeoutRef.current);
      }
    };
  }, []);

  const handleDelete = () => {
    if (isDeleting) return;

    const deletionStarted = onDeleteRow(id, true);
    if (deletionStarted === false) return;

    setIsDeleting(true);
    deleteTimeoutRef.current = setTimeout(() => {
      onDeleteRow(id);
    }, 300);
  };

  // check if the character name matches a player character in pcstats.json and update the values accordingly
  const checkPlayerCharacter = (name) => {
    const lowerCaseName = name.trim().toLowerCase();

    if (savedCharacterStats[lowerCaseName]) {
      setNameRecognised(true);
      console.log("Character name recognised:", lowerCaseName);
    } else {
      setNameRecognised(false);
    }
  };

  const importCharacterStats = (name) => {
    const lowerCaseName = name.trim().toLowerCase();
    const importedStats = savedCharacterStats[lowerCaseName];

    if (!importedStats) {
      return;
    }

    const importedData = importedStats.data || importedStats;
    const importedName = importedData.name || importedStats.name || name;
    const importedHp = importedData.hp ?? importedStats.hp ?? 0;
    const importedAc = importedData.ac ?? importedStats.ac ?? 0;
    const importedSpeed =
      importedData.speed ??
      importedStats.speed ??
      (Array.isArray(importedData.speeds)
        ? importedData.speeds.find((speed) => speed.type === "walk")?.value || ""
        : "");
    const importedSpell = importedData.spell ?? importedStats.spell ?? "";
    const importedCondition = importedData.condition ?? importedStats.condition ?? "";
    const importedTimer = importedData.timer ?? importedStats.timer ?? 0;
    const importedLegendary = importedData.legendary ?? importedStats.legendary ?? false;

    const importedRowValues = {
      charactername: importedName,
      hp: importedHp,
      ac: importedAc,
      speed: importedSpeed,
      spell: importedSpell,
      condition: importedCondition,
      timer: importedTimer,
      legendary: importedLegendary,
    };

    hpRef.current = importedHp;
    setValues((prev) => ({
      ...prev,
      ...importedRowValues,
    }));

    Object.entries(importedRowValues).forEach(([field, value]) => {
      updateValues(id, field, value);
    });

    const statBlockPayload = importedData.data || importedData;
    if (statBlockPayload?.stats && typeof statBlockPayload === "object") {
      onImportStaticImage?.(statBlockPayload);
    }
  };

  const saveRowAsCharacter = async () => {
    if (!values.charactername.trim()) return;

    setIsSaving(true);
    const saved = await onSaveCharacter(values);
    setIsSaving(false);
    if (saved) setSavePromptOpen(false);
  };

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;

    const newValue = type === "checkbox" ? checked : value;

    setValues((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    if (type === "text" && name === "charactername") {
      checkPlayerCharacter(value);
    }

    updateValues(id, name, newValue);
  };

  const applyHpMath = (rawValue) => {
    const currentHp = parseInt(hpRef.current, 10);
    const trimmed = String(rawValue).trim();

    let newHp = currentHp;
    if (trimmed.includes("-")) {
      const amount = currentHp - parseInt(trimmed.split("-")[1], 10);
      if (!isNaN(amount)) newHp = amount;
    } else if (trimmed.includes("+")) {
      const amount = currentHp + parseInt(trimmed.split("+")[1], 10);
      if (!isNaN(amount)) newHp = amount;
    } else {
      const direct = parseInt(trimmed, 10);
      if (!isNaN(direct)) newHp = direct;
    }
    return newHp;
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      event.target.blur();
    }
  };

  const handleGroupToggle = (checked) => {
    const nextHp = checked ? 0 : (values.hpGroup?.[0] ?? 0);
    hpRef.current = nextHp;
    setValues((prev) => ({
      ...prev,
      isGroup: checked,
      hp: nextHp,
      hpGroup: checked ? prev.hpGroup : [prev.hp, prev.hp, prev.hp, prev.hp],
    }));

    updateValues(id, "isGroup", checked);
    updateValues(id, "hp", nextHp);
  };

  useEffect(() => {
    if (
      highlighted &&
      values.condition !== "" &&
      !isPopupOpen &&
      !prevHighlighted
    ) {
      if (savingThrowConditions.some((item) => item === values.condition)) {
        setIsPopupOpen(true);
      }
    }

    setPrevHighlighted(highlighted);
  }, [highlighted, values.condition, isPopupOpen, prevHighlighted]);

  const rollDice = useCallback(() => {
    setD20Roll(Math.floor(Math.random() * 20 + 1));
  }, []);

  const handleNavigation = (event) => {
    const key = event.key;

    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key)) {
      return;
    }

    event.preventDefault();

    const current = event.target;

    const row = parseInt(current.dataset.row, 10);
    const col = parseInt(current.dataset.col, 10);

    let nextRow = row;
    let nextCol = col;

    if (key === "ArrowUp") nextRow--;
    if (key === "ArrowDown") nextRow++;
    if (key === "ArrowLeft") nextCol--;
    if (key === "ArrowRight") nextCol++;

    const next = document.querySelector(
      `[data-row="${nextRow}"][data-col="${nextCol}"]`,
    );

    next?.focus();
  };

  useEffect(() => {
    hpRef.current = initialValues.hp ?? 0;
    setValues({
      ...initialValues,
      hp: initialValues.hp ?? 0,
      hpGroup: initialValues.hpGroup ?? [0, 0, 0, 0],
      isGroup: initialValues.isGroup ?? false,
    });

  }, [initialValues]);

  useEffect(() => {
    if (!highlighted) {
      setIsD20Rolling(false);
      return;
    }

    if (!shouldRoll) return;

    rollDice();
    setIsD20Rolling(true);

    const animationTimeout = setTimeout(() => {
      setIsD20Rolling(false);
    }, 420);

    return () => clearTimeout(animationTimeout);
  }, [highlighted, rollDice, shouldRoll]);

  return (
    <div
      className={`grid-row form-inline ${
        isNew ? "row-entering" : ""
      } ${
        isDeleting ? "deleting" : ""
      } ${
        values.condition === "surprised"
          ? "surprised"
          : highlighted
            ? "highlighted"
            : ""
      } App ${theme}`}
      style={{ display: "grid", gridTemplateColumns: columnSizes }}
      onMouseEnter={() => setRowHovered(true)}
      onMouseLeave={() => setRowHovered(false)}
    >
      <div
        className="cell initiative-cell"
        ref={initiativeCellRef}
      >
        <NumericInput
          data-row={rowIndex}
          data-col={0}
          onKeyDown={handleNavigation}
          className="form-control grid-row-input"
          name="initiative"
          value={values.initiative}
          onChange={handleInputChange}
        />
        {rowHovered && (
          <button
            type="button"
            className="save-row-button"
            aria-label="Save row as character"
            title="Save row as character"
            onClick={() => setSavePromptOpen(true)}
          >
            <FontAwesomeIcon icon={faFloppyDisk} />
          </button>
        )}
        {savePromptOpen &&
          createPortal(
            <div
              className="name-popup save-row-popup"
              style={getCellPopupStyle(initiativeCellRef)}
            >
              Save row as character?
              <br />
              <button
                className="name-popup-btn"
                disabled={isSaving || !values.charactername.trim()}
                onClick={saveRowAsCharacter}
              >
                {isSaving ? "Saving..." : "Yes"}
              </button>
              <button
                className="name-popup-btn"
                disabled={isSaving}
                onClick={() => setSavePromptOpen(false)}
              >
                No
              </button>
            </div>,
            document.body,
          )}
      </div>

      <div
        className="cell"
        ref={nameCellRef}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {nameRecognised &&
          createPortal(
            <div
              className="name-popup"
              style={getCellPopupStyle(nameCellRef)}
            >
              Import character?
              <br />
              <button
                className="name-popup-btn"
                onClick={() => {
                  setNameRecognised(false);
                  importCharacterStats(values.charactername);
                }}
              >
                Yes
              </button>
              <button
                className="name-popup-btn"
                onClick={() => setNameRecognised(false)}
              >
                No
              </button>
            </div>,
            document.body,
          )}
        <input
          data-row={rowIndex}
          data-col={1}
          onKeyDown={handleNavigation}
          className={`form-control grid-row-input ${
            values.legendary ? "legendary" : ""
          }`}
          name="charactername"
          value={values.charactername}
          onChange={handleInputChange}
          autoComplete="off"
        />
        {(hovered || values.isGroup) && (
          <div>
            <label className="checkbox group">
              <input
                type="checkbox"
                name="isGroup"
                checked={values.isGroup || false}
                onChange={(e) => handleGroupToggle(e.target.checked)}
              />
              Group
            </label>
            <label className="checkbox legendary">
              <input
                type="checkbox"
                name="legendary"
                checked={values.legendary || false}
                onChange={handleInputChange}
              />
              Legendary
            </label>
          </div>
        )}
      </div>

      <div className="cell no-padding">
        {values.isGroup ? (
          values.hpGroup.map((hpValue, idx) => (
            <NumericInput
              data-row={rowIndex}
              data-col={2}
              onKeyDown={handleNavigation}
              key={idx}
              className="form-control grid-row-input text-medium no-padding"
              value={hpValue}
              onChange={(e) => {
                const newHpGroup = [...values.hpGroup];
                newHpGroup[idx] = parseInt(e.target.value || 0, 10);

                setValues((prev) => ({
                  ...prev,
                  hpGroup: newHpGroup,
                }));

                updateValues(id, "hpGroup", newHpGroup);
              }}
            />
          ))
        ) : (
          <NumericInput
            data-row={rowIndex}
            data-col={2}
            className="form-control grid-row-input"
            name="hp"
            type="text"
            value={values.hp}
            onKeyDown={(e) => {
              handleNavigation(e);
              handleKeyDown(e);
            }}
            onBlur={(e) => {
              const newHp = applyHpMath(e.target.value);

              hpRef.current = newHp;
              setValues((prev) => ({
                ...prev,
                hp: newHp,
              }));

              updateValues(id, "hp", newHp);

              if (newHp > maxHp) setMaxHp(newHp);
            }}
          />
        )}

        {!values.isGroup && maxHp > 0 && (
          <span className="max-hp">{maxHp}</span>
        )}
      </div>

      <div className="cell">
        <input
          data-row={rowIndex}
          data-col={3}
          onKeyDown={handleNavigation}
          className="form-control grid-row-input"
          name="ac"
          type="text"
          value={values.ac}
          onChange={handleInputChange}
          max={999}
        />
      </div>

      {showSpeed && (
        <div className="cell">
          <input
            data-row={rowIndex}
            data-col={4}
            onKeyDown={handleNavigation}
            className="form-control grid-row-input"
            name="speed"
            type="text"
            value={values.speed}
            onChange={handleInputChange}
            max={999}
          />
        </div>
      )}

      {showSpellSave && (
        <div className="cell">
          <input
            data-row={rowIndex}
            data-col={5}
            onKeyDown={handleNavigation}
            className="form-control grid-row-input"
            name="spell"
            value={values.spell}
            onChange={handleInputChange}
          />
        </div>
      )}

      {showCondition && (
        <>
          <div className="cell">
            <select
              data-row={rowIndex}
              data-col={6}
              onKeyDown={handleNavigation}
              className="form-control grid-row-input"
              name="condition"
              value={values.condition}
              onChange={handleInputChange}
            >
              <option className="option" value="">
                -
              </option>
              {condition.map((condition, index) => (
                <option className="option" key={index} value={condition}>
                  {condition}
                </option>
              ))}
            </select>
          </div>
          <div className="cell">
            <NumericInput
              data-row={rowIndex}
              data-col={7}
              onKeyDown={handleNavigation}
              className="form-control grid-row-input"
              name="timer"
              value={values.timer}
              onChange={handleInputChange}
            />
          </div>
        </>
      )}

      <div className="cell d-flex align-items-center">
        <input
          className={`form-control grid-row-input d20-transparent ${
            isD20Rolling ? "d20-rolling" : ""
          }`}
          name="d20"
          type="number"
          value={d20Roll}
          readOnly
        />
      </div>

      <div className="cell delete">
        <button
          data-row={rowIndex}
          data-col={8}
          onKeyDown={handleNavigation}
          className="btn btn-danger shrink"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          Delete
        </button>
      </div>

      {isPopupOpen && (
        <Popup isOpen={isPopupOpen} onClose={setIsPopupOpen(false)}></Popup>
      )}
    </div>
  );
}
