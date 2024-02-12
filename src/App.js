import React, { useState } from "react";
import "./App.css";
import { GridRow } from "./components/GridRow";

function App() {
  const [gridRows, setGridRows] = useState([
    {
      initiative: "",
      charactername: "",
      movement: "",
      hp: "",
      ac: "",
      conditions: "",
      id: 0,
    },
  ]);
  const [rowCount, setRowCount] = useState(1);

  const createRows = () => {
    const initialRowCount = parseInt(rowCount);
    const initialGridRows = [];
    for (let i = 1; i <= initialRowCount; i++) {
      initialGridRows.push({
        initiative: "",
        charactername: "",
        movement: "",
        hp: "",
        ac: "",
        conditions: "",
        id: i,
      });
    }
    setGridRows(initialGridRows);
  };

  const updateValues = (id, name, value) => {
    setGridRows((prevGridRows) =>
      prevGridRows.map((row) => {
        if (row.id === id) {
          return { ...row, [name]: value };
        }
        return row;
      })
    );
  };

  const clearInitiativeInputs = () => {
    setGridRows((prevGridRows) =>
      prevGridRows.map((row) => {
        // Clear initiative field
        updateValues(row.id, "initiative", "");
        return row;
      })
    );
  };

  const addRow = () => {
    setGridRows([
      ...gridRows,
      {
        initiative: "",
        charactername: "",
        movement: "",
        hp: "",
        ac: "",
        conditions: "",
        id: rowCount,
      },
    ]);
    setRowCount(rowCount + 1);
  };

  const sortDescending = () => {
    const sortedGridRows = [...gridRows].map((row) => ({ ...row }));
    sortedGridRows.sort((a, b) => {
      const initiativeA = parseInt(a.initiative);
      const initiativeB = parseInt(b.initiative);
      return initiativeB - initiativeA; // Sort in descending order
    });
    setGridRows(sortedGridRows);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Thomas and Sharon's Initiative Tracker</h1>
      </header>
      <div className="App-body">
        <div className="input-container">
          <input
            className="form-control"
            type="number"
            value={rowCount}
            onChange={(e) => setRowCount(parseInt(e.target.value))}
          />
          <button className="btn btn-secondary" onClick={createRows}>
            Create Rows
          </button>
        </div>
        <div className="grid">
          <div className="row">
            <div className="col">Initiative</div>
            <div className="col">Player Name</div>
            <div className="col">Movement</div>
            <div className="col">HP</div>
            <div className="col">AC</div>
            <div className="col">Conditions</div>
          </div>
          {gridRows.map((row) => (
            <div key={row.id} className="GridRow">
              <GridRow
                className="GridRow"
                key={row.id}
                id={row.id}
                initialValues={row}
                updateValues={updateValues}
              />
            </div>
          ))}
        </div>
        <div className="row mt-2">
          <div className="col">
            <button className="btn btn-secondary" onClick={addRow}>
              Add Row
            </button>
          </div>
          <div className="col">
            <button className="btn btn-secondary" onClick={sortDescending}>
              Sort Descending
            </button>
          </div>
          <div className="col">
            <button
              className="btn btn-secondary"
              onClick={clearInitiativeInputs}
            >
              Clear Initiatives
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
