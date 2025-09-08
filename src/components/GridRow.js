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
}) {
  const [values, setValues] = useState(initialValues);
  const [maxHp, setMaxHp] = useState(initialValues.hp || 0);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [prevHighlighted, setPrevHighlighted] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [d20Roll, setD20Roll] = useState("");

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    const newValue = type === "checkbox" ? checked : value;
    setValues((prevValues) => {
      const updated = { ...prevValues, [name]: value };
      if (name === "hp") {
        const numeric = parseInt(newValue, 10);
        if (!isNaN(numeric) && numeric > maxHp) {
          setMaxHp(numeric);
        }
      }
      return updated;
    });

    updateValues(id, name, newValue);
  };

  const onLoseFocusHpField = (event) => {
    const { value } = event.target;

    // If a minus sign is present, subtract the substring after the minus from the current hp when enter is pressed
    if (value.includes("-")) {
      const currentHp = parseInt(values.hp) || 0;
      const newHp = currentHp - parseInt(value.split("-")[1]);
      if (isNaN(newHp)) {
        // Check here if input is valid afterwards.
        return;
      }
      setValues((prevValues) => ({
        ...prevValues,
        hp: newHp,
      }));
    }
    if (value.includes("+")) {
      const currentHp = parseInt(values.hp) || 0;
      const newHp = currentHp + parseInt(value.split("+")[1]);
      if (isNaN(newHp)) {
        // Check here if input is valid afterwards.
        return;
      }
      setValues((prevValues) => ({
        ...prevValues,
        hp: newHp,
      }));
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      onLoseFocusHpField(event);
    }
  };

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

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
          className={`form-control grid-row-input ${
            values.legendary ? "legendary" : ""
          }`}
          name="charactername"
          value={values.charactername}
          onChange={handleInputChange}
          autoComplete="off"
        />
        {(hovered || values.legendary) && (
          <label className="checkbox legendary">
            <input
              type="checkbox"
              name="legendary"
              checked={values.legendary || false}
              onChange={handleInputChange}
              className="me-1"
            />
            Legendary
          </label>
        )}
      </div>

      {showSpeed && (
        <div className="cell">
          <input
            className="form-control grid-row-input"
            name="speed"
            type="text"
            value={values.speed}
            onChange={handleInputChange}
          />
        </div>
      )}

      <div className="cell">
        <input
          className="form-control grid-row-input"
          name="hp"
          type="text"
          value={values.hp}
          onChange={handleInputChange}
          onBlur={onLoseFocusHpField}
          onKeyDown={(e) => handleKeyDown(e)}
        />
        {maxHp > 0 && <span className="max-hp">{maxHp}</span>}
      </div>

      <div className="cell">
        <input
          className="form-control grid-row-input"
          name="ac"
          type="text"
          value={values.ac}
          onChange={handleInputChange}
        />
      </div>

      {showSpellSave && (
        <div className="cell">
          <input
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
          className="form-control grid-row-input"
          name="d20"
          type="number"
          value={d20Roll}
          readOnly
        />
        {/* <button className="btn btn-primary" onClick={rollDice}></button> */}
      </div>

      <div className="cell delete">
        <button className="btn btn-danger" onClick={() => onDeleteRow(id)}>
          Delete
        </button>
      </div>

      {isPopupOpen && <Popup isOpen={isPopupOpen} onClose={closePopup}></Popup>}
    </div>
  );
}
