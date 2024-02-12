import React, { useState } from "react";

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
    <div className="row form-inline">
      <div className="col">
        <input
          className="form-control"
          name="initiative"
          type="number"
          value={values.initiative}
          onChange={handleInputChange}
        />
      </div>
      <div className="col largeField">
        <input
          className="form-control"
          name="charactername"
          value={values.charactername}
          onChange={handleInputChange}
        />
      </div>
      <div className="col">
        <input
          className="form-control"
          name="movement"
          type="number"
          value={values.movement}
          onChange={handleInputChange}
        />
      </div>
      <div className="col">
        <input
          className="form-control"
          name="hp"
          type="number"
          value={values.hp}
          onChange={handleInputChange}
        />
      </div>
      <div className="col">
        <input
          className="form-control"
          name="ac"
          type="number"
          value={values.ac}
          onChange={handleInputChange}
        />
      </div>
      <div className="col">
        <input
          className="form-control"
          name="conditions"
          value={values.conditions}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );
}
