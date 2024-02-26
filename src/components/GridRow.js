import React, { useEffect, useState } from "react";
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
  id,
  initialValues,
  updateValues,
  onDeleteRow,
  highlighted,
  theme,
}) {
  const [values, setValues] = useState(initialValues);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [hasOpenedPopup, setHasOpenedPopup] = useState(false);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
    updateValues(id, name, value);
  };

  const openPopup = () => {
    setIsPopupOpen(true);
    setHasOpenedPopup(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  useEffect(() => {
    if (!hasOpenedPopup && highlighted && values.condition !== "") {
      if (savingThrowConditions.some((item) => item === values.condition)) {
        openPopup();
      }
    } else {
      setHasOpenedPopup(false);
    }
  }, [hasOpenedPopup, highlighted, values.condition]);

  return (
    <div
      className={`row form-inline ${
        values.condition === "surprised"
          ? "surprised"
          : highlighted
          ? "highlighted"
          : "grid-row"
      } App ${theme}`}
    >
      <div className="col-1 cell">
        <input
          className="form-control grid-row-input"
          name="initiative"
          type="number"
          value={values.initiative}
          onChange={handleInputChange}
        />
      </div>
      <div className="col-3 cell">
        <input
          className="form-control grid-row-input"
          name="charactername"
          value={values.charactername}
          onChange={handleInputChange}
          autoComplete="off"
        />
      </div>
      <div className="col-1 cell">
        <input
          className="form-control grid-row-input"
          name="speed"
          type="number"
          value={values.speed}
          onChange={handleInputChange}
        />
      </div>
      <div className="col-1 cell">
        <input
          className="form-control grid-row-input"
          name="hp"
          type="number"
          value={values.hp}
          onChange={handleInputChange}
        />
      </div>
      <div className="col-1 cell">
        <input
          className="form-control grid-row-input"
          name="ac"
          type="number"
          value={values.ac}
          onChange={handleInputChange}
        />
      </div>
      <div className="col-1 cell">
        <input
          className="form-control grid-row-input"
          name="spell"
          type="number"
          value={values.spell}
          onChange={handleInputChange}
        />
      </div>
      <div className="col-2 cell">
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
      <div className="col-1 cell">
        <input
          className="form-control grid-row-input"
          name="timer"
          type="number"
          value={values.timer}
          onChange={handleInputChange}
        />
      </div>
      <div className="col-1 cell delete">
        <button className="btn btn-danger" onClick={() => onDeleteRow(id)}>
          Delete
        </button>
      </div>
      <Popup isOpen={isPopupOpen} onClose={closePopup}></Popup>
    </div>
  );
}
