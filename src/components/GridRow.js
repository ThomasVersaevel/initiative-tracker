import { useCallback, useEffect, useState } from "react";
import "./GridRow.css";
import { Popup } from "./Popup";

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
  highlighted,
  theme,
  showSpeed,
  showSpellSave,
  showCondition,
  rowIndex,
}) {
  const [values, setValues] = useState({
    ...initialValues,
    hp: initialValues.hp ?? 0,
    hpGroup: initialValues.hpGroup ?? [0, 0, 0, 0],
    isGroup: initialValues.isGroup ?? false,
  });

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [prevHighlighted, setPrevHighlighted] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [d20Roll, setD20Roll] = useState("");
  const [maxHp, setMaxHp] = useState(0);

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;

    const newValue = type === "checkbox" ? checked : value;

    setValues((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    updateValues(id, name, newValue);
  };

  const applyHpMath = (rawValue) => {
    const currentHp = parseInt(values.hp, 10);
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
      const newHp = applyHpMath(event.target.value);

      setValues((prev) => ({
        ...prev,
        hp: newHp,
      }));

      updateValues(id, "hp", newHp);

      if (newHp > maxHp) {
        setMaxHp(newHp);
      }

      event.target.blur();
    }
  };

  const handleGroupToggle = (checked) => {
    setValues((prev) => ({
      ...prev,
      isGroup: checked,
      hp: checked ? 0 : (prev.hpGroup?.[0] ?? 0),
      hpGroup: checked ? prev.hpGroup : [prev.hp, prev.hp, prev.hp, prev.hp],
    }));

    updateValues(id, "isGroup", checked);
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
    setValues({
      ...initialValues,
      hp: initialValues.hp ?? 0,
      hpGroup: initialValues.hpGroup ?? [0, 0, 0, 0],
      isGroup: initialValues.isGroup ?? false,
    });
  }, [initialValues]);

  useEffect(() => {
    if (highlighted) {
      rollDice();
    }
  }, [highlighted, rollDice]);

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  return (
    <div
      className={`grid-row form-inline ${
        values.condition === "surprised"
          ? "surprised"
          : highlighted
            ? "highlighted"
            : ""
      } App ${theme}`}
      style={{ display: "grid", gridTemplateColumns: columnSizes }}
    >
      <div className="cell">
        <input
          data-row={rowIndex}
          data-col={0}
          onKeyDown={handleNavigation}
          className="form-control grid-row-input"
          name="initiative"
          type="number"
          value={values.initiative}
          onChange={handleInputChange}
        />
      </div>
      <div
        className="cell"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
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
            <input
              data-row={rowIndex}
              data-col={2}
              onKeyDown={handleNavigation}
              key={idx}
              className="form-control grid-row-input text-medium no-padding"
              type="number"
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
          <input
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
            onChange={(e) => {
              setValues((prev) => ({
                ...prev,
                hp: e.target.value,
              }));
            }}
            onBlur={(e) => {
              const newHp = applyHpMath(e.target.value);

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
            type="number"
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
            <input
              data-row={rowIndex}
              data-col={7}
              onKeyDown={handleNavigation}
              className="form-control grid-row-input"
              name="timer"
              type="number"
              value={values.timer}
              onChange={handleInputChange}
            />
          </div>
        </>
      )}

      <div className="cell d-flex align-items-center">
        <input
          className="form-control grid-row-input d20-transparent"
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
          onClick={() => onDeleteRow(id)}
        >
          Delete
        </button>
      </div>

      {isPopupOpen && <Popup isOpen={isPopupOpen} onClose={closePopup}></Popup>}
    </div>
  );
}
