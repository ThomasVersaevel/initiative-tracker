import React, { useCallback, useEffect, useState } from "react";
import "./App.css";
import { GridRow } from "./components/GridRow";
import { Soundboard } from "./components/Soundboard";

function App() {
  const [turn, setTurn] = useState(1);
  const [gridRows, setGridRows] = useState([
    {
      initiative: 0,
      charactername: "",
      speed: "",
      hp: "",
      ac: "",
      spell: "",
      condition: "",
      timer: 0,
      id: 0,
    },
  ]);
  const [rowCount, setRowCount] = useState(1);
  const [highlightedRow, setHighlightedRow] = useState(0);
  const [theme, setTheme] = useState("default");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedStationary, setSelectedStationary] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadedStationary, setUploadedStationary] = useState([]);

  const themes = [
    { label: "Default", value: "default" },
    { label: "Sharon", value: "sharon" },
    { label: "Green", value: "green" },
    { label: "Prisma", value: "prisma" },
    { label: "Dark", value: "dark" },
    { label: "Berry", value: "berry" },
  ];

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
        spell: "",
        condition: "",
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
        spell: "",
        condition: "",
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

  const onSelectTheme = (selectedTheme) => {
    setTheme(selectedTheme);
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
          <div className="col-1"></div>
        </div>
        <div className="grid">
          <div className="row top-row">
            <div className="col-1 cell">Initiative</div>
            <div className="col-3 cell">Player Name</div>
            <div className="col-1 cell">Speed</div>
            <div className="col-1 cell">HP</div>
            <div className="col-1 cell">AC</div>
            <div className="col-1 cell">Spell Save</div>
            <div className="col-2 cell">Condition</div>
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
              ? gridRows[highlightedRow].charactername
              : " Add"}
          </label>
        </div>
        <div className="soundboard-container">
          <Soundboard></Soundboard>
          <Soundboard></Soundboard>
          <Soundboard></Soundboard>
          <Soundboard></Soundboard>
          <Soundboard></Soundboard>
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
