import React, { useCallback, useEffect, useState } from "react";
import "./App.css";
import { GridRow } from "./components/GridRow";
import { Soundboard } from "./components/Soundboard";
import { DiceRoller } from "./components/DiceRoller";
import Cookies from "js-cookie";
import { Header } from "./components/Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiceD20 } from "@fortawesome/free-solid-svg-icons";

function App() {
  const [turn, setTurn] = useState(1);

  const [showSpeed, setShowSpeed] = useState(
    JSON.parse(Cookies.get("showSpeed") ?? "true")
  );
  const [showSpellSave, setShowSpell] = useState(
    JSON.parse(Cookies.get("showSpellSave") ?? "true")
  );
  const [showCondition, setShowCondition] = useState(
    JSON.parse(Cookies.get("showCondition") ?? "true")
  );
  const [showDiceRoller, setShowDiceRoller] = useState(
    JSON.parse(Cookies.get("showDiceroller") ?? "false")
  );

  const [gridRows, setGridRows] = useState(() => {
    const savedRows = Cookies.get("gridRows");
    if (savedRows) {
      const parsedRows = JSON.parse(savedRows);
      return parsedRows.map((row, index) => ({
        ...row,
        id: index, // Ensure IDs start from 0 and increment properly
      }));
    }
    return [
      {
        initiative: 0,
        charactername: "",
        legendary: false,
        speed: "",
        hp: "",
        ac: "",
        spell: "",
        condition: "",
        timer: 0,
        id: 0,
      },
    ];
  });
  const [rowCount, setRowCount] = useState(1);
  const [highlightedRow, setHighlightedRow] = useState(0);
  const [theme, setTheme] = useState("default");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedStationary, setSelectedStationary] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadedStationary, setUploadedStationary] = useState([]);

  const createRows = () => {
    const initialRowCount = parseInt(rowCount);
    const initialGridRows = [];
    for (let i = 1; i <= initialRowCount; i++) {
      initialGridRows.push({
        initiative: 0,
        charactername: "",
        legendary: false,
        speed: "",
        hp: "",
        ac: "",
        spell: "",
        condition: "",
        timer: 0,
        id: i,
      });
      setGridRows(initialGridRows);
    }
    setGridRows(initialGridRows);
  };

  const updateValues = (id, name, value) => {
    setGridRows((prevGridRows) =>
      prevGridRows.map((row) =>
        row.id === id ? { ...row, [name]: value } : row
      )
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
    // Find the max ID currently in gridRows and increment it
    const nextId =
      gridRows.length > 0 ? Math.max(...gridRows.map((row) => row.id)) + 1 : 0;

    setGridRows([
      ...gridRows,
      {
        initiative: 0,
        charactername: "",
        legendary: false,
        speed: "",
        hp: "",
        ac: "",
        spell: "",
        condition: "",
        timer: 0,
        id: nextId, // Ensure new rows get a unique ID
      },
    ]);
  };
  const sortDescending = () => {
    const sortedGridRows = [...gridRows].map((row) => ({ ...row }));
    sortedGridRows.sort((a, b) => {
      const initiativeA = parseInt(a.initiative);
      const initiativeB = parseInt(b.initiative);
      return initiativeB - initiativeA; // Sort in descending order
    });
    setGridRows(sortedGridRows);
    setUploadedImages(sortUploadedImages(sortedGridRows, uploadedImages));
  };

  const onDeleteRow = (id) => {
    if (gridRows.length === 1) {
      // Skip deletion if there's only one row left
      return;
    }
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
    if (gridRows.some((row) => row.condition !== "")) {
      const updatedGridRows = gridRows.map((row) => {
        if (row.condition !== "") {
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

  const handleUpload = () => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImages((prevImages) => {
          const tempImages = [...prevImages];
          tempImages[highlightedRow] = reader.result;
          return tempImages;
        });
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleStationaryUpload = () => {
    if (selectedStationary) {
      const reader2 = new FileReader();
      reader2.onloadend = () => {
        setUploadedStationary(reader2.result);
      };
      reader2.readAsDataURL(selectedStationary);
    }
  };

  const sortUploadedImages = (gridRows, uploadedImages) => {
    const sortedUploadedImages = gridRows.map((row) => {
      const image = uploadedImages[row.id];
      return image;
    });
    return sortedUploadedImages;
  };

  const uploadImage = useCallback(
    (e) => {
      setSelectedFile(e.target.files[0]);
    },
    [setSelectedFile]
  );

  const uploadStationaryImage = useCallback(
    (e) => {
      setSelectedStationary(e.target.files[0]);
    },
    [setSelectedStationary]
  );

  const deleteImage = (nr) => {
    if (nr === 1) {
      setSelectedFile(null);
    } else {
      setSelectedStationary(null);
    }
  };

  useEffect(() => {
    Cookies.set("gridRows", JSON.stringify(gridRows), { expires: 18 });
    Cookies.set("showSpeed", JSON.stringify(showSpeed), { expires: 18 });
    Cookies.set("showSpellSave", JSON.stringify(showSpellSave), {
      expires: 18,
    });
    Cookies.set("showCondition", JSON.stringify(showCondition), {
      expires: 18,
    });
    Cookies.set("showDiceroller", JSON.stringify(showDiceRoller), {
      expires: 18,
    });
  }, [gridRows, showSpeed, showSpellSave, showCondition, showDiceRoller]);

  const columnSizes = [
    "1fr", // Initiative
    "2fr", // Player Name
    showSpeed ? "0.8fr" : null,
    "1.2fr", // HP
    "0.8fr", // AC
    showSpellSave ? "1fr" : null,
    ...(showCondition ? ["1.3fr", "0.7fr"] : []),
    "0.5fr", // Dice
    "0.7fr", // Delete
  ]
    .filter(Boolean)
    .join(" "); // remove nulls for hidden columns

  const totalWidth = [
    10, // Initiative
    20, // Player Name
    showSpeed ? 8 : 0,
    12, // HP
    8, // AC
    showSpellSave ? 10 : 0,
    ...(showCondition ? [13, 7] : []),
    5, // Dice
    7, // Delete
  ].reduce((a, b) => a + b, 0); // sum of visible column widths

  console.log(columnSizes);

  useEffect(() => {
    handleStationaryUpload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStationary]);

  useEffect(() => {
    handleUpload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFile]);

  useEffect(() => {
    const handlePaste = (event) => {
      const items = (event.clipboardData || event.originalEvent.clipboardData)
        .items;
      for (const item of items) {
        if (item.type.indexOf("image") !== -1) {
          const blob = item.getAsFile();
          const reader = new FileReader();
          reader.onload = (event) => {
            setUploadedImages((prevImages) => {
              const tempImages = [...prevImages];
              tempImages[highlightedRow] = event.target.result;
              return tempImages;
            });
          };
          reader.readAsDataURL(blob);
        }
      }
    };

    document.addEventListener("paste", handlePaste);

    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, [highlightedRow, setUploadedImages]);

  return (
    <div className={`App ${theme}`}>
      <Header
        onSelectTheme={setTheme}
        showSpeed={showSpeed}
        setShowSpeed={setShowSpeed}
        showSpell={showSpellSave}
        setShowSpell={setShowSpell}
        showCondition={showCondition}
        setShowCondition={setShowCondition}
      ></Header>

      <div className={`diceroller-panel ${showDiceRoller ? "open" : ""}`}>
        <button
          className="btn btn-secondary toggle-diceroller"
          onClick={() => setShowDiceRoller(!showDiceRoller)}
        >
          {showDiceRoller ? (
            <>
              <FontAwesomeIcon icon={"arrow-alt-left"} />
              <FontAwesomeIcon icon={faDiceD20} />
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={"arrow-alt-right"} />
              <FontAwesomeIcon icon={faDiceD20} />
            </>
          )}
        </button>
        {showDiceRoller && <DiceRoller />}
      </div>

      <div className="App-body">
        <div className="row mb-3">
          <div className="col-1 turn-container">
            <input
              className="form-control create-row-field"
              type="number"
              value={rowCount}
              onChange={(e) => setRowCount(parseInt(e.target.value))}
            />
          </div>
          <div className="col-2 next-button turn-container">
            <button className="btn btn-secondary bot" onClick={createRows}>
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
              <button className="btn btn-secondary bot" onClick={nextTurn}>
                <div className="next-button">Next</div>
              </button>
            </div>
            <div className="margin-left-10px">
              <button
                className="btn btn-secondary bot"
                onClick={prevTurn}
                disabled={turn === 1 && highlightedRow === 0}
              >
                <div className="next-button">Prev</div>
              </button>
            </div>
          </div>
          {gridRows.some((row) => row.legendary) && (
            <div className="col-3 input-container">
              <div className="legendary-container">
                <span>Legendary Actions:</span>
                <div className="checkboxes">
                  <label className="custom-checkbox">
                    <input type="checkbox" />
                    <span className="checkmark"></span>
                  </label>
                  <label className="custom-checkbox">
                    <input type="checkbox" />
                    <span className="checkmark"></span>
                  </label>
                  <label className="custom-checkbox">
                    <input type="checkbox" />
                    <span className="checkmark"></span>
                  </label>
                </div>
              </div>

              <div className="legendary-container">
                <span>Legendary Resistances:</span>
                <div className="checkboxes">
                  <label className="custom-checkbox">
                    <input type="checkbox" />
                    <span className="checkmark"></span>
                  </label>
                  <label className="custom-checkbox">
                    <input type="checkbox" />
                    <span className="checkmark"></span>
                  </label>
                  <label className="custom-checkbox">
                    <input type="checkbox" />
                    <span className="checkmark"></span>
                  </label>
                </div>
              </div>
            </div>
          )}
          <div className="col-1"></div>
        </div>
        {/* ====================== MAIN TABLE OF GRIDROWS ====================== */}
        <div className="combat-grid" style={{ width: `${totalWidth}%` }}>
          <div
            className="grid-header top-row"
            style={{ display: "grid", gridTemplateColumns: columnSizes }}
          >
            <div className="cell">Initiative</div>
            <div className="cell">Player Name</div>
            {showSpeed && <div className="cell">Speed</div>}
            <div className="cell">HP</div>
            <div className="cell">AC</div>
            {showSpellSave && <div className="cell">Spell Save</div>}
            {showCondition && (
              <>
                <div className="cell">Condition</div>
                <div className="cell">Timer</div>
              </>
            )}
            <div className="cell">Dice</div>
            <div className="cell"></div>
          </div>

          {gridRows.map((row, index) => (
            <div key={row.id}>
              <GridRow
                columnSizes={columnSizes}
                highlighted={index === highlightedRow}
                key={row.id}
                id={row.id}
                initialValues={row}
                updateValues={updateValues}
                onDeleteRow={onDeleteRow}
                theme={theme}
                showSpeed={showSpeed}
                showSpellSave={showSpellSave}
                showCondition={showCondition}
                uploadedImages={uploadedImages}
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
        {selectedFile !== null && (
          <div className="image-container">
            <img
              className="uploaded-image"
              src={uploadedImages[highlightedRow]}
              alt={""}
            />
            <div className="img-buttons">
              <button
                className="delete-img-button"
                onClick={() => deleteImage(1)}
              >
                <img
                  className="button-img"
                  src="/images/trash-icon.png"
                  alt=""
                ></img>
              </button>
              <label className="upload-img-button" htmlFor="file-upload">
                <img
                  className="button-img"
                  src="/images/image-icon.png"
                  alt=""
                ></img>
              </label>
            </div>
          </div>
        )}
        {selectedStationary !== null && (
          <div className="stationary-container">
            <img className="uploaded-image" src={uploadedStationary} alt={""} />
            <div className="img-buttons">
              <button
                className="delete-img-button"
                onClick={() => deleteImage(2)}
              >
                <img
                  className="button-img"
                  src="/images/trash-icon.png"
                  alt=""
                ></img>
              </button>
              <label
                className="upload-img-button"
                htmlFor="stationary-file-upload"
              >
                <img
                  className="button-img"
                  src="/images/image-icon.png"
                  alt=""
                ></img>
              </label>
            </div>
          </div>
        )}
      </div>
      <div className="App-footer">
        <div className="upload-container">
          <label className="btn btn-secondary bot image" htmlFor="file-upload">
            <img
              className="button-img"
              src="/images/image-icon.png"
              alt=""
            ></img>
            {gridRows[highlightedRow].charactername.length > 0
              ? " " + gridRows[highlightedRow].charactername
              : " Add"}
          </label>
        </div>
        <div className="soundboard-container">
          <Soundboard />
        </div>
        <div className="upload-container-right">
          <label className="btn btn-secondary bot" htmlFor="stationary-upload">
            {"Fixed "}
            <img
              className="button-img"
              src="/images/image-icon.png"
              alt=""
            ></img>
          </label>
        </div>
      </div>
      <input
        id="file-upload"
        className="hidden"
        name="upload"
        type="file"
        onChange={(e) => uploadImage(e)}
      ></input>
      <input
        id="stationary-upload"
        className="hidden"
        name="stationary-upload"
        type="file"
        onChange={(e) => uploadStationaryImage(e)}
      ></input>
    </div>
  );
}
export default App;
