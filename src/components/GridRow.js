import React, { useEffect, useState } from "react";
import "./GridRow.css";

const conditions = [
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

export function GridRow({
  id,
  initialValues,
  updateValues,
  onDeleteRow,
  highlighted,
  theme,
}) {
  const [values, setValues] = useState(initialValues);
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
    updateValues(id, name, value);
  };

  useEffect(()=> {setValues(initialValues)},[initialValues]);

  return (
    <div
      className={`row form-inline ${highlighted ? "highlighted" : "grid-row"} App ${theme}`}
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
      <div className="col-4 cell">
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
      <div className="col-2 cell">
        <select
          className="form-control grid-row-input conditions-field"
          name="conditions"
          value={values.conditions}
          onChange={handleInputChange}
        >
          <option className="option" value="">
            -
          </option>
          {conditions.map((condition, index) => (
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
    </div>
  );
}
