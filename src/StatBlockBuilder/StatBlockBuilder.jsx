import React, { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faHeart,
  faShield,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { SpeedStore } from "./ItemStores/SpeedStore";
import { speedOptions, traitOptions } from "./TypesUtils/StoreTypes";
import { TraitStore } from "./ItemStores/TraitStore";
import SaveUploads from "./SaveUploads";
import { defaultStatBlock } from "./TypesUtils/Types.js";
import "./StatBlockBuilder.css";

function StatBlockBuilder({setPage}) {

  const [statBlock, setStatBlock] = useState(defaultStatBlock);
  const [storePanelOpen, setStorePanelOpen] = useState("");

  const resizing = useRef(false);

  const updateField = (field, value) => {
    setStatBlock((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateStat = (stat, field, value) => {
    setStatBlock((current) => ({
      ...current,
      stats: {
        ...current.stats,
        [stat]: {
          ...current.stats[stat],
          [field]: value,
        },
      },
    }));
  };

  const setSpeeds = (value) => {
    setStatBlock((current) => ({
      ...current,
      speeds: typeof value === "function" ? value(current.speeds) : value,
    }));
  };

  const setTraits = (value) => {
    setStatBlock((current) => ({
      ...current,
      trait: typeof value === "function" ? value(current.traits) : value,
    }));
  };

  const setAttacks = (value) => {
    setStatBlock((current) => ({
      ...current,
      attacks: typeof value === "function" ? value(current.attacks) : value,
    }));
  };

  const startResize = (e) => {
    e.preventDefault();
    resizing.current = true;

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = statBlock.size.width;
    const startHeight = statBlock.size.height;

    const handleMouseMove = (e) => {
      if (!resizing.current) return;

      setStatBlock((current) => ({
        ...current,
        size: {
          width: Math.max(400, startWidth + (e.clientX - startX)),
          height: Math.max(400, startHeight + (e.clientY - startY)),
        },
      }));
    };

    const handleMouseUp = () => {
      resizing.current = false;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className={`stat-block-normal ${statBlock.theme}`}>
      <div className="App-header statblock-page-header">
        <button className="menu-btn" onClick={() => setPage("initiative-tracker")}>
          <FontAwesomeIcon icon={faArrowLeft} /> Initiative tracker
        </button>
      </div>

      <div className="App-body flex">
        <div
          className="stat-block"
          style={{
            width: `${statBlock.size.width}px`,
            height: `${statBlock.size.height}px`,
          }}
        >
          <form id="stat-block-form">
            <div className="standard-row">
              <label>
                Name:
                <input
                  className="margin-left-6"
                  name="name"
                  value={statBlock.name}
                  onChange={(e) => updateField("name", e.target.value)}
                />
              </label>

              <label>
                <input
                  name="legendary"
                  type="checkbox"
                  checked={statBlock.legendary}
                  onChange={(e) => updateField("legendary", e.target.checked)}
                />
                <span className="subtext">Legendary:</span>
              </label>
            </div>

            <div className="standard-row border-top-3">
              <label>
                <div className="icon-with-text">
                  <FontAwesomeIcon icon={faHeart} />
                  <span>HP</span>
                </div>

                <input
                  className="two-digit-field"
                  name="hp"
                  type="number"
                  value={statBlock.hp}
                  onChange={(e) => updateField("hp", Number(e.target.value))}
                />
              </label>

              <label>
                <div className="icon-with-text">
                  <FontAwesomeIcon icon={faShield} />
                  <span>AC</span>
                </div>

                <input
                  className="two-digit-field"
                  name="ac"
                  type="number"
                  value={statBlock.ac}
                  onChange={(e) => updateField("ac", Number(e.target.value))}
                />
              </label>

              {statBlock.speeds.map((speed) => {
                const option = speedOptions.find(
                  (option) => option.type === speed.type,
                );

                if (!option) return null;

                return (
                  <label key={speed.type}>
                    <div className="icon-with-text">
                      <FontAwesomeIcon icon={option.icon} />
                    </div>

                    <input
                      className="two-digit-field"
                      name={`speed-${speed.type}`}
                      type="number"
                      value={speed.value}
                      onChange={(e) =>
                        setSpeeds((current) =>
                          current.map((item) =>
                            item.type === speed.type
                              ? {
                                  ...item,
                                  value: Number(e.target.value),
                                }
                              : item,
                          ),
                        )
                      }
                    />
                  </label>
                );
              })}

              <button
                type="button"
                className="button add-button"
                onClick={() => setStorePanelOpen("speed")}
              >
                Add <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>

            <div className="stats-row border-top-3">
              {["str", "dex", "con", "int", "wis", "cha"].map((stat) => (
                <label key={stat} className="stat-field">
                  {stat.toUpperCase()}

                  <input
                    className="margin-bottom-4"
                    name={stat}
                    type="number"
                    value={statBlock.stats[stat].value}
                    onChange={(e) =>
                      updateStat(stat, "value", Number(e.target.value))
                    }
                  />

                  <input
                    name={`${stat}save`}
                    type="text"
                    value={statBlock.stats[stat].save}
                    onChange={(e) => updateStat(stat, "save", e.target.value)}
                  />
                </label>
              ))}
            </div>

            <div className="border-top-3 standard-row">
              <button
                type="button"
                className="button add-button width-100"
                onClick={() => setStorePanelOpen("trait")}
              >
                Add <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>
          </form>

          <div className="resize-handle" onMouseDown={startResize} />
        </div>

        <SaveUploads />
      </div>

      <div className={`store-panel ${storePanelOpen !== "" ? "open" : ""}`}>
        {storePanelOpen === "speed" && (
          <SpeedStore
            setStorePanelOpen={setStorePanelOpen}
            speeds={statBlock.speeds}
            setSpeeds={setSpeeds}
          />
        )}

        {storePanelOpen === "trait" && (
          <TraitStore
            setStorePanelOpen={setStorePanelOpen}
            options={traitOptions}
            traits={statBlock}
            setTraits={setTraits}
          />
        )}
      </div>

      <div className="App-footer"></div>
    </div>
  );
}

export default StatBlockBuilder;
