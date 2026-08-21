import React, { useEffect, useState, useCallback } from "react";
import "./App.css";
import { GridRow } from "./components/GridRow";
import { Soundboard } from "./components/Soundboard";
import { DiceRoller } from "./components/DiceRoller";
import Cookies from "js-cookie";
import { Header } from "./components/Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faDiceD20,
} from "@fortawesome/free-solid-svg-icons";
import { ImageHandler } from "./components/ImageHandler";
import { LegendaryTracker } from "./components/LegendaryTracker";

function InitiativeTracker({ setPage }) {
  const [turn, setTurn] = useState(1);

  const [showSpeed, setShowSpeed] = useState(
    JSON.parse(Cookies.get("showSpeed") ?? "false"),
  );
  const [showSpellSave, setShowSpell] = useState(
    JSON.parse(Cookies.get("showSpellSave") ?? "false"),
  );
  const [showCondition, setShowCondition] = useState(
    JSON.parse(Cookies.get("showCondition") ?? "false"),
  );
  const [showDiceRoller, setShowDiceRoller] = useState(
    JSON.parse(Cookies.get("showDiceroller") ?? "false"),
  );

  const createRow = (id = 0) => ({
    initiative: 0,
    charactername: "",
    legendary: false,
    group: false,
    speed: "",
    hp: 0,
    hpGroup: [0, 0, 0, 0],
    ac: "",
    spell: "",
    condition: "",
    timer: 0,
    id,
    isGroup: false,
  });

  const [gridRows, setGridRows] = useState(() => {
    const savedRows = Cookies.get("gridRows");

    if (savedRows) {
      const parsedRows = JSON.parse(savedRows);

      return parsedRows.map((row, index) => ({
        ...createRow(index),
        ...row,
        id: index,
        hpGroup: row.hpGroup ?? [0, 0, 0, 0],
        hp: row.hp ?? 0,
        isGroup: row.isGroup ?? false,
      }));
    }

    return [createRow(0)];
  });
  const [highlightedRow, setHighlightedRow] = useState(0);
  const [theme, setTheme] = useState("default");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedStationary, setSelectedStationary] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadedStationary, setUploadedStationary] = useState([]);

  const updateValues = (id, name, value) => {
    setGridRows((prevGridRows) =>
      prevGridRows.map((row) =>
        row.id === id ? { ...row, [name]: value } : row,
      ),
    );
  };

  const clearInitiativeInputs = () => {
    const updatedGridRows = gridRows.map((row) => ({
      ...row,
      initiative: 0,
    }));
    setGridRows(updatedGridRows);
  };

  const addRow = () => {
    const nextId =
      gridRows.length > 0 ? Math.max(...gridRows.map((row) => row.id)) + 1 : 0;

    setGridRows([...gridRows, createRow(nextId)]);
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
    [setSelectedFile],
  );

  const uploadStationaryImage = useCallback(
    (e) => {
      setSelectedStationary(e.target.files[0]);
    },
    [setSelectedStationary],
  );

  const decreaseTimer = useCallback(() => {
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
  }, [gridRows]);

  const increaseTimer = useCallback(() => {
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
  }, [gridRows]);

  const nextTurn = useCallback(() => {
    setHighlightedRow((prevHighlightedRow) => {
      const nextRow =
        prevHighlightedRow < gridRows.length - 1 ? prevHighlightedRow + 1 : 0;
      if (nextRow === 0) {
        setTurn(turn + 1);
        decreaseTimer();
      }
      return nextRow;
    });
  }, [decreaseTimer, gridRows.length, turn]);

  const prevTurn = useCallback(() => {
    setHighlightedRow((prevHighlightedRow) => {
      const nextRow =
        prevHighlightedRow > 0 ? prevHighlightedRow - 1 : gridRows.length - 1;
      if (nextRow === gridRows.length - 1) {
        setTurn(turn - 1);
        increaseTimer();
      }
      return nextRow;
    });
  }, [increaseTimer, gridRows.length, turn]);

  // Spacebar for next row
  useEffect(() => {
    const handleKeyboardNav = (event) => {
      const active = document.activeElement;

      const typing =
        active?.tagName === "INPUT" ||
        active?.tagName === "TEXTAREA" ||
        active?.tagName === "SELECT" ||
        active?.isContentEditable;

      if (typing) {
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        nextTurn();
      }

      if (event.code === "Backspace") {
        event.preventDefault();
        prevTurn();
      }
    };

    document.addEventListener("keydown", handleKeyboardNav);

    return () => {
      document.removeEventListener("keydown", handleKeyboardNav);
    };
  }, [nextTurn, prevTurn]);

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
    "1.2fr", // HP
    "0.8fr", // AC
    showSpeed ? "0.8fr" : null,
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
    12, // HP
    8, // AC
    showSpeed ? 8 : 0,
    showSpellSave ? 10 : 0,
    ...(showCondition ? [13, 7] : []),
    5, // Dice
    7, // Delete
  ].reduce((a, b) => a + b, 0); // sum of visible column widths

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
        setPage={setPage}
      ></Header>
      <div className={`diceroller-panel ${showDiceRoller ? "open" : ""}`}>
        <button
          className="btn btn-secondary toggle-diceroller"
          onClick={() => setShowDiceRoller(!showDiceRoller)}
        >
          {!showDiceRoller ? (
            <>
              <FontAwesomeIcon icon={faArrowLeft} />
              <FontAwesomeIcon icon={faDiceD20} />
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faDiceD20} />
              <FontAwesomeIcon icon={faArrowRight} />
            </>
          )}
        </button>
        {showDiceRoller && <DiceRoller />}
      </div>

      <div className="App-body">
        <div className="row mb-3">
          <div className="col-4 turn-container">
            <input
              className="form-control turn-counter"
              value={"Round " + turn}
              readOnly
            />
            <div className="margin-left-10px">
              <button
                className="btn btn-secondary bot"
                onClick={prevTurn}
                disabled={turn === 1 && highlightedRow === 0}
              >
                <div className="next-button" title="Previous turn (Backspace)">
                  Prev
                </div>
              </button>
            </div>
            <div className="margin-left-10px">
              <button
                className="btn btn-secondary bot"
                onClick={nextTurn}
                title={"Next turn (Spacebar)"}
              >
                <div className="next-button" title="Next turn (Spacebar)">
                  Next
                </div>
              </button>
            </div>
          </div>
          {gridRows.some((row) => row.legendary) && <LegendaryTracker />}
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
            <div className="cell">HP</div>
            <div className="cell">AC</div>
            {showSpeed && <div className="cell">Speed</div>}
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
                rowIndex={index}
              />
            </div>
          ))}
        </div>
        <div className="initiative-actions mt-3">
          <button
            className="btn btn-secondary bot add-row-button"
            onClick={addRow}
          >
            Add Row
          </button>
          <button
            className="btn btn-secondary bot"
            onClick={sortDescending}
          >
            Sort
          </button>
          <button
            className="btn btn-secondary bot"
            onClick={clearInitiativeInputs}
          >
            Clear
          </button>
        </div>
        <ImageHandler
          highlightedRow={highlightedRow}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          selectedStationary={selectedStationary}
          setSelectedStationary={setSelectedStationary}
          setUploadedImages={setUploadedImages}
          uploadedImages={uploadedImages}
          setUploadedStationary={setUploadedStationary}
          uploadedStationary={uploadedStationary}
        />
      </div>
      <div className="App-footer">
        <div className="upload-container">
          <label className="btn btn-secondary bot" htmlFor="file-upload">
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
export default InitiativeTracker;
