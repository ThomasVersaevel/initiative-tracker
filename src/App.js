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
      timer: 0,
      id: 0,
    },
  ]);
  const [rowCount, setRowCount] = useState(1);
  const [highlightedRow, setHighlightedRow] = useState(0);
  const [theme, setTheme] = useState("default");
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const themes = [
    { label: "Default", value: "default" },
    { label: "Sharon", value: "sharon" },
    { label: "Green", value: "green" },
    { label: "Prisma", value: "prisma" },
    { label: "Dark", value: "dark" },
  ];

  const openPopup = () => {
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

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
        timer: 0,
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
    // Clear initiative inputs of each grid row in the state
    const updatedGridRows = gridRows.map((row) => ({
      ...row,
      initiative: 0,
    }));
    setGridRows(updatedGridRows);
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
        timer: 0,
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
      const nextRow =
        prevHighlightedRow < gridRows.length - 1 ? prevHighlightedRow + 1 : 0;
      if (nextRow === 0) {
        setTurn(turn + 1);
        decreaseTimer();
      }
      return nextRow;
    });
  };

  const prevTurn = () => {
    setHighlightedRow((prevHighlightedRow) => {
      const nextRow =
        prevHighlightedRow > 0 ? prevHighlightedRow - 1 : gridRows.length - 1;
      if (nextRow === gridRows.length - 1) {
        setTurn(turn - 1);
        increaseTimer();
      }
      return nextRow;
    });
  };

  const decreaseTimer = () => {
    if (gridRows.some((row) => row.timer > 0)) {
      const updatedGridRows = gridRows.map((row) => {
        if (row.timer > 0) {
          return {
            ...row,
            timer: Math.max(row.timer - 1, 0),
          };
        }
        return row;
      });
      setGridRows(updatedGridRows);
    }
  };

  const increaseTimer = () => {
    if (gridRows.some((row) => row.conditions !== "")) {
      const updatedGridRows = gridRows.map((row) => {
        if (row.conditions !== "") {
          return {
            ...row,
            timer: Math.max(row.timer + 1, 0),
          };
        }
        return row;
      });
      setGridRows(updatedGridRows);
    }
  };

  const onSelectTheme = (selectedTheme) => {
    setTheme(selectedTheme);
  };

  return (
    <div className={`App ${theme}`}>
      <header className="App-header">
        <div className="title">
          <h1>Take Initiative</h1>
        </div>
        <div className="class-selector">
          <select
            className="form-control select"
            onChange={(e) => onSelectTheme(e.target.value)}
          >
            {themes.map((option, index) => (
              <option className="option" key={index} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </header>
      <div className="App-body">
        <Popup></Popup>
        <div className="row mb-3">
          <div className="col-1">
            <input
              className="form-control create-row-field"
              type="number"
              value={rowCount}
              onChange={(e) => setRowCount(parseInt(e.target.value))}
            />
          </div>
          <div className="col-2 next-button">
            <button className="btn btn-secondary blue" onClick={createRows}>
              <div className="next-button"> Create Rows </div>
            </button>
          </div>
          <div className="col-2"></div>
          <div className="col-4 turn-container">
            <input
              className="form-control turn-counter"
              value={"Round " + turn}
              readOnly
            />
            <div className="margin-left-10px">
              <button className="btn btn-secondary blue" onClick={nextTurn}>
                <div className="next-button">Next</div>
              </button>
            </div>
            <div className="margin-left-10px">
              <button
                className="btn btn-secondary blue"
                onClick={prevTurn}
                disabled={turn === 1 && highlightedRow === 0}
              >
                <div className="next-button">Prev</div>
              </button>
            </div>
          </div>
          <div className="col-1"></div>
        </div>
        <div className="grid">
          <div className="row topRow">
            <div className="col-1 cell">Initiative</div>
            <div className="col-4 cell">Player Name</div>
            <div className="col-1 cell">Speed</div>
            <div className="col-1 cell">HP</div>
            <div className="col-1 cell">AC</div>
            <div className="col-2 cell">Conditions</div>
            <div className="col-1 cell">Timer</div>
            <div className="col-1 cell"></div>{" "}
          </div>
          {gridRows.map((row, index) => (
            <div key={row.id}>
              <GridRow
                highlighted={index === highlightedRow}
                key={row.id}
                id={row.id}
                initialValues={row}
                updateValues={updateValues}
                onDeleteRow={onDeleteRow}
                theme={theme}
              />
            </div>
          ))}
        </div>
        <div className="row mt-2">
          <div className="col-1">
            <button className="btn btn-secondary bot" onClick={addRow}>
              +Row
            </button>
          </div>
          <div className="col-1">
            <button className="btn btn-secondary bot" onClick={sortDescending}>
              Sort
            </button>
          </div>
          <div className="col-1">
            <button
              className="btn btn-secondary bot"
              onClick={clearInitiativeInputs}
            >
              Clear
            </button>
          </div>
        </div>
      </div>
      <div className="App-footer">
        <div className="footer-text">A website by Thomas and Sharon</div>
      </div>
    </div>
  );
}

export default App;
