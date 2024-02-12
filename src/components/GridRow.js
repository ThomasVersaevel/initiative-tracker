import React, { useState } from "react";
import "./GridRow.css";

export function GridRow({ id, initialValues, updateValues }) {
  const [values, setValues] = useState(initialValues);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
    updateValues(id, name, value);
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
      <div className="col-4 cell">
        <input
          className="form-control grid-row-input"
          name="conditions"
          value={values.conditions}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );
}
