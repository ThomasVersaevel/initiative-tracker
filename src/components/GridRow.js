import React, { useState } from "react";
import "./GridRow.css";

const conditions = [
  "blinded",
  "charmed",
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
  "unconscious",
  "surprised",
]

export function GridRow({ id, initialValues, updateValues, onDeleteRow }) {
  const [values, setValues] = useState(initialValues);
  const [selectedCondition, setSelectedCondition] = useState("");

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
    updateValues(id, name, value);
  };

  const handleConditionChange = (event) => {
    const { value } = event.target;
    setSelectedCondition(value);
    updateValues(id, "conditions", value);
  };

  return (
    <div className="row form-inline grid-row">
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
          autocomplete="off"
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
      <div className="col-3 cell">
        <select
          className="form-control grid-row-input"
          name="conditions"
          value={values.conditions}
          onChange={handleInputChange}
        >
          <option className="option" value="">-</option>
          {conditions.map((condition, index) => (
            <option className="option" key={index} value={condition}>
              {condition}
            </option>
          ))}
        </select>
      </div>
      <div className="col-1 cell">
        <button
          className="btn btn-danger"
          onClick={() => onDeleteRow(id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
