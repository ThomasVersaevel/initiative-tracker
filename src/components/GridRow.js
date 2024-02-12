// GridRow.js
import React from "react";

export function GridRow({ id, initiative, updateInitiative }) {
  const handleInputChange = (event) => {
    const { name, value } = event.target;

    if (name === "initiative") {
      updateInitiative(id, value);
    }
  };

  return (
    <div className="row form-inline">
      <div className="col">
        <input
          className="form-control"
          name="initiative"
          type="number"
          value={initiative}
          onChange={handleInputChange}
        />
      </div>
      <div className="col largeField">
        <input
          className="form-control"
          name="charactername"
          onChange={handleInputChange}
        />
      </div>

      <div className="col">
        <input
          className="form-control"
          name="movement"
          type="number"
          onChange={handleInputChange}
        />
      </div>
      <div className="col">
        <input
          className="form-control"
          name="hp"
          type="number"
          onChange={handleInputChange}
        />
      </div>
      <div className="col">
        <input
          className="form-control"
          name="ac"
          type="number"
          onChange={handleInputChange}
        />
      </div>
      <div className="col">
        <input
          className="form-control"
          name="conditions"
          onChange={handleInputChange}
        />
      </div>
    </div>
  );
}
