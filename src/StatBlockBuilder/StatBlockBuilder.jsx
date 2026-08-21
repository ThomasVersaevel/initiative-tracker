import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faHeart,
  faShield,
  faPlus,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import { SpeedStore } from "./ItemStores/SpeedStore";
import { speedOptions, traitOptions } from "./TypesUtils/StoreTypes";
import { TraitStore } from "./ItemStores/TraitStore";
import { AttackStore } from "./ItemStores/AttackStore";
import SaveUploads from "./SaveUploads";
import StatBlockImageGenerator from "./StatBlockImageGenerator";
import { defaultStatBlock } from "./TypesUtils/Types.js";
import "./StatBlockBuilder.css";

const STAT_BLOCK_STORAGE_KEY = "statBlockBuilderState";

const getInitialStatBlock = () => {
  try {
    const saved = JSON.parse(
      localStorage.getItem(STAT_BLOCK_STORAGE_KEY) || "null",
    );
    if (!saved) return structuredClone(defaultStatBlock);

    return {
      ...defaultStatBlock,
      ...saved,
      stats: {
        ...defaultStatBlock.stats,
        ...(saved.stats || {}),
      },
      traits: {
        ...defaultStatBlock.traits,
        ...(saved.traits || {}),
      },
      attacks: {
        ...defaultStatBlock.attacks,
        ...(saved.attacks || {}),
        multiattack: {
          ...defaultStatBlock.attacks.multiattack,
          ...(saved.attacks?.multiattack || {}),
        },
      },
      size: {
        ...defaultStatBlock.size,
        ...(saved.size || {}),
      },
    };
  } catch {
    return structuredClone(defaultStatBlock);
  }
};

function StatBlockBuilder({ setPage }) {
  const [statBlock, setStatBlock] = useState(getInitialStatBlock);
  const [storePanelOpen, setStorePanelOpen] = useState("");
  const imageGeneratorRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(STAT_BLOCK_STORAGE_KEY, JSON.stringify(statBlock));
    } catch {
      // Keep editing available if browser storage is unavailable or full.
    }
  }, [statBlock]);

  const resizing = useRef(false);

  const uploadPortrait = (event) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => updateField("portrait", reader.result);
    reader.readAsDataURL(file);
    event.target.value = "";
  };

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
      traits: typeof value === "function" ? value(current.traits) : value,
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
        <button
          className="menu-btn"
          onClick={() => setPage("initiative-tracker")}
        >
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
            <div className="standard-row stat-block-heading-row">
              <label>
                <input
                  className="margin-left-6"
                  name="name"
                  placeholder="Monster Name"
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

              {statBlock.portrait ? (
                <div className="portrait-display">
                  <img
                    className="portrait-image"
                    src={statBlock.portrait}
                    alt="Creature portrait"
                  />
                </div>
              ) : (
                <label
                  className="portrait-upload"
                  title="Upload creature portrait"
                >
                  <FontAwesomeIcon icon={faUpload} />
                  <input
                    hidden
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={uploadPortrait}
                  />
                </label>
              )}
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

            <div className="border-top-3 trait-display-row">
              {statBlock.traits.resistances.length > 0 && (
                <div>
                  <strong className="accent-color">Resistances:</strong>{" "}
                  {statBlock.traits.resistances.join(", ")}
                </div>
              )}
              {statBlock.traits.senses.length > 0 && (
                <div>
                  <strong className="accent-color">Senses:</strong>{" "}
                  {statBlock.traits.senses.join(", ")}
                </div>
              )}
              {statBlock.traits.languages.length > 0 && (
                <div>
                  <strong className="accent-color">Languages:</strong>{" "}
                  {statBlock.traits.languages.join(", ")}
                </div>
              )}
              {statBlock.traits.challengeRating > 0 && (
                <div>
                  <strong className="accent-color">Challenge Rating:</strong>{" "}
                  {statBlock.traits.challengeRating}
                </div>
              )}
            </div>

            <div className="standard-row trait-actions-row">
              <button
                type="button"
                className="button add-button width-100"
                onClick={() => setStorePanelOpen("trait")}
              >
                Add Traits <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>
            <div className=" border-top-3">
              <div className="attack-display-row">
                {statBlock.attacks.multiattack.enabled &&
                  statBlock.attacks.multiattack.attacks.length > 0 && (
                    <div className="attack-multiattack-text">
                      <strong>
                        <em>Multiattack.</em>
                      </strong>{" "}
                      The {statBlock.name || "creature"} makes{" "}
                      {statBlock.attacks.multiattack.attacks
                        .map((selection) => {
                          const attack = statBlock.attacks.attacks.find(
                            (item) => item.id === selection.attackId,
                          );
                          return `${selection.count} ${
                            attack?.name || "unnamed attack"
                          } attack${selection.count === 1 ? "" : "s"}`;
                        })
                        .join(" or ")}
                      .
                    </div>
                  )}
                {statBlock.attacks.attacks.map((attack) => (
                  <div className="attack-display-item" key={attack.id}>
                    <strong>
                      <em>{attack.name || "Unnamed attack"}.</em>
                    </strong>{" "}
                    {attack.description}
                  </div>
                ))}
              </div>

              <div className="standard-row trait-actions-row">
                <button
                  type="button"
                  className="button add-button width-100"
                  onClick={() => setStorePanelOpen("attack")}
                >
                  Add Attacks <FontAwesomeIcon icon={faPlus} />
                </button>
              </div>
            </div>
          </form>

          <div className="resize-handle" onMouseDown={startResize} />
        </div>

        <SaveUploads
          setStatBlock={setStatBlock}
          statBlock={statBlock}
          imageGeneratorRef={imageGeneratorRef}
        />
        <div className="stat-block-image-preview-wrapper" aria-hidden="true">
          <StatBlockImageGenerator
            ref={imageGeneratorRef}
            statBlock={statBlock}
          />
        </div>
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
            traits={statBlock.traits}
            setTraits={setTraits}
          />
        )}

        {storePanelOpen === "attack" && (
          <AttackStore
            setStorePanelOpen={setStorePanelOpen}
            attacks={statBlock.attacks}
            setAttacks={setAttacks}
          />
        )}
      </div>

      <div className="App-footer"></div>
    </div>
  );
}

export default StatBlockBuilder;
