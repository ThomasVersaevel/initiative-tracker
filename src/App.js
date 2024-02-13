import React, { useState } from "react";
import "./App.css";
import { GridRow } from "./components/GridRow";

function App() {
  const [turn, setTurn] = useState(1);
  const [gridRows, setGridRows] = useState([
    {
      initiative: 0,
      charactername: "",
      speed: "",
      hp: "",
      ac: "",
      conditions: "",
      id: 0,
    },
  ]);
  const [rowCount, setRowCount] = useState(1);
  const [highlightedRow, setHighlightedRow] = useState(0);

  const createRows = () => {
    const initialRowCount = parseInt(rowCount);
    const initialGridRows = [];
    for (let i = 1; i <= initialRowCount; i++) {
      initialGridRows.push({
        initiative: 0,
        charactername: "",
        speed: "",
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
        return { ...row, initiative: "" };
      })
    );
  };

  const addRow = () => {
    setGridRows([
      ...gridRows,
      {
        initiative: 0,
        charactername: "",
        speed: "",
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

  const onDeleteRow = (id) => {
    setGridRows((prevGridRows) => prevGridRows.filter((row) => row.id !== id));
  };

  const nextTurn = () => {
    setHighlightedRow((prevHighlightedRow) => {
      const nextRow = prevHighlightedRow < gridRows.length - 1 ? prevHighlightedRow + 1 : 0;
      if (nextRow === 0) {
        setTurn(turn + 1);
      }
      return nextRow;
    });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Thomas and Sharon's Initiative Tracker</h1>
      </header>
      <div className="App-body">
        <div className="row mb-3">
          <div className="col-1">
            <input
              className="form-control"
              type="number"
              value={rowCount}
              onChange={(e) => setRowCount(parseInt(e.target.value))}
            />
          </div>
          <div className="col-2">
            <button className="btn btn-secondary blue" onClick={createRows}>
              Create Rows
            </button>
          </div>
          <div className="col-2">
          </div>
          <div className="col-2 turn-container">
            <input
              className="form-control turn-counter"
              type="number"
              value={turn}
              readOnly
            />
            <button className="btn btn-secondary blue" onClick={nextTurn}>
              <div className="next-button">Next</div>
            </button>
          </div>
          <div className="col-2">
          </div>
        </div>
        <div className="grid">
          <div className="row topRow">
            <div className="col-1 cell">Initiative</div>
            <div className="col-4 cell">Player Name</div>
            <div className="col-1 cell">Speed</div>
            <div className="col-1 cell">HP</div>
            <div className="col-1 cell">AC</div>
            <div className="col-4 cell">Conditions</div>
            <div className="col-1 cell"></div>{" "}
          </div>
          {gridRows.map((row, index) => (
            <div key={row.id}>
              <GridRow
                highlighted={index===highlightedRow}
                key={row.id}
                id={row.id}
                initialValues={row}
                updateValues={updateValues}
                onDeleteRow={onDeleteRow}
              />
            </div>
          ))}
        </div>
        <div className="row mt-2">
          <div className="col-1">
            <button className="btn btn-secondary green" onClick={addRow}>
              +Row
            </button>
          </div>
          <div className="col-1">
            <button
              className="btn btn-secondary yellow"
              onClick={sortDescending}
            >
              Sort
            </button>
          </div>
          <div className="col-1">
            <button
              className="btn btn-secondary red"
              onClick={clearInitiativeInputs}
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
