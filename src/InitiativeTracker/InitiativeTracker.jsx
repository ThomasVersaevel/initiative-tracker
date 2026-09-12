import React, { useEffect, useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import "../App.css";
import { GridRow } from "./GridRow";
import { DiceRoller } from "./DiceRoller";
import Cookies from "js-cookie";
import { Header } from "./Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faDiceD20,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { ImageHandler } from "./ImageHandler";
import { LegendaryTracker } from "./LegendaryTracker";
import { supabase, ensureAnonymousSession } from "../Supabase";
import StatBlockImageGenerator from "../StatBlockBuilder/StatBlockImageGenerator";

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
  const [showSoundboard, setShowSoundboard] = useState(false);

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
  const [shouldRollHighlightedRow, setShouldRollHighlightedRow] =
    useState(false);
  const [newRowId, setNewRowId] = useState(null);
  const [theme, setTheme] = useState("default");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedStationary, setSelectedStationary] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadedStationary, setUploadedStationary] = useState([]);
  const [pcStats, setPcStats] = useState({});

  useEffect(() => {
    const loadCharacters = async () => {
      const { data, error } = await supabase.from("characters").select("*");

      if (error) {
        console.error("Failed to load characters:", error);
        return;
      }

      const characterMap = Object.fromEntries(
        data.map((character) => [character.name.toLowerCase(), character]),
      );

      setPcStats((current) => ({ ...current, ...characterMap }));
    };

    const loadStatBlocks = async () => {
      try {
        const { configured, userId } = await ensureAnonymousSession();

        let query = supabase.from("stat_blocks").select("id, name, data");
        if (configured && userId) {
          query = query.eq("user_id", userId);
        }

        const { data, error: statBlockError } = await query;
        if (statBlockError) {
          console.error("Failed to load stat blocks:", statBlockError);
          return;
        }

        const statBlockMap = Object.fromEntries(
          (data || []).map((block) => {
            const statData = block.data || {};
            return [
              block.name.toLowerCase(),
              {
                ...statData,
                id: block.id,
                name: block.name,
                hp: Number(statData.hp ?? statData.hp ?? 0) || 0,
                ac: Number(statData.ac ?? 0) || 0,
                speed:
                  Array.isArray(statData.speeds)
                    ? statData.speeds.find((speed) => speed.type === "walk")
                        ?.value || ""
                    : statData.speed || "",
                portrait: statData.portrait || "",
              },
            ];
          }),
        );

        setPcStats((current) => ({ ...current, ...statBlockMap }));
      } catch (caughtError) {
        console.error("Failed to load stat blocks:", caughtError);
      }
    };

    loadCharacters();
    loadStatBlocks();
  }, []);

  const updateValues = (id, name, value) => {
    setGridRows((prevGridRows) =>
      prevGridRows.map((row) =>
        row.id === id ? { ...row, [name]: value } : row,
      ),
    );
  };

  const saveCharacterFromRow = async (row) => {
    const character = {
      name: row.charactername.trim(),
      ac: Number(row.ac) || 0,
      hp: Number(row.hp) || 0,
    };
    const { data, error } = await supabase
      .from("characters")
      .insert(character)
      .select()
      .single();

    if (error) {
      console.error("Failed to save character:", error);
      return false;
    }

    setPcStats((current) => ({
      ...current,
      [data.name.toLowerCase()]: data,
    }));
    return true;
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
    setNewRowId(nextId);
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

  const onDeleteRow = (id, checkOnly = false) => {
    if (gridRows.length === 1) {
      // Skip deletion if there's only one row left
      return false;
    }
    if (checkOnly) return true;

    setGridRows((prevGridRows) => prevGridRows.filter((row) => row.id !== id));
    return true;
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

  const addStaticImageFromStatBlock = useCallback(async (statBlock) => {
    if (!statBlock || !statBlock.stats) {
      return;
    }

    try {
      const host = document.createElement("div");
      host.style.position = "fixed";
      host.style.left = "-10000px";
      host.style.top = "-10000px";
      host.style.width = `${statBlock.size?.width || 600}px`;
      host.style.height = `${statBlock.size?.height || 700}px`;
      document.body.appendChild(host);

      const imageRef = { current: null };
      const root = createRoot(host);
      root.render(
        <StatBlockImageGenerator
          ref={imageRef}
          statBlock={statBlock}
          size={statBlock.size || { width: 600, height: 700 }}
        />,
      );

      await new Promise((resolve) => requestAnimationFrame(resolve));

      const imageSource = await imageRef.current?.getImageDataUrl?.();

      root.unmount();
      host.remove();

      if (imageSource) {
        setUploadedImages((prevImages) => [...prevImages, imageSource]);
      }
    } catch (error) {
      console.error("Failed to generate stat block image preview:", error);
    }
  }, []);

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
    setShouldRollHighlightedRow(true);
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
    setShouldRollHighlightedRow(false);
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
          reader.onload = (pasteEvent) => {
            setUploadedImages((prevImages) => [
              ...prevImages,
              pasteEvent.target.result,
            ]);
          };
          reader.readAsDataURL(blob);
        }
      }
    };

    document.addEventListener("paste", handlePaste);

    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, [setUploadedImages]);

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
        showSoundboard={showSoundboard}
        setShowSoundboard={setShowSoundboard}
        setPage={setPage}
        pcStats={pcStats}
        setPcStats={setPcStats}
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
            <GridRow
              columnSizes={columnSizes}
              highlighted={index === highlightedRow}
              shouldRoll={shouldRollHighlightedRow}
              key={row.id}
              id={row.id}
              initialValues={row}
              isNew={row.id === newRowId}
              updateValues={updateValues}
              onDeleteRow={onDeleteRow}
              theme={theme}
              savedCharacterStats={pcStats}
              onSaveCharacter={saveCharacterFromRow}
              showSpeed={showSpeed}
              showSpellSave={showSpellSave}
              showCondition={showCondition}
              uploadedImages={uploadedImages}
              rowIndex={index}
              onImportStaticImage={addStaticImageFromStatBlock}
            />
          ))}
        </div>
        <div className="initiative-actions mt-3">
          <button className="btn btn-secondary bot-add-button" onClick={addRow}>
            Add Row <FontAwesomeIcon icon={faPlus} />
          </button>
          <button className="btn btn-secondary bot-button" onClick={sortDescending}>
            Sort
          </button>
          <button
            className="btn btn-secondary bot bot-button"
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
