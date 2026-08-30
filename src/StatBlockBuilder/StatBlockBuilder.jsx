import React, { useEffect, useReducer, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faHeart,
  faShield,
  faPlus,
  faUpload,
  faCircleInfo,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { SpeedStore } from "./ItemStores/SpeedStore";
import { speedOptions, traitOptions } from "./TypesUtils/StoreTypes";
import { TraitStore } from "./ItemStores/TraitStore";
import { AttackStore } from "./ItemStores/AttackStore";
import SaveUploads from "./SaveUploads";
import StatBlockImageGenerator from "./StatBlockImageGenerator";
import { defaultStatBlock } from "./TypesUtils/Types.js";
import {
  formatSense,
  getAbilityModifier,
  getChallengeRating,
  normalizeStats,
} from "./TypesUtils/Types.js";
import "./StatBlockBuilder.css";
import { AbilityStore } from "./ItemStores/AbilityStore.jsx";
import { LegendaryStore } from "./ItemStores/LegendaryStore.jsx";
import { FormattedText } from "./FormattedText";
import { BonusActionStore } from "./ItemStores/BonusActionStore.jsx";
import { ReactionStore } from "./ItemStores/ReactionStore.jsx";

const STAT_BLOCK_STORAGE_KEY = "statBlockBuilderState";
const MAX_HISTORY_ENTRIES = 50;
const INPUT_HISTORY_DEBOUNCE_MS = 700;

const historyReducer = (state, action) => {
  if (action.type === "update") {
    const next =
      typeof action.update === "function"
        ? action.update(state.present)
        : action.update;

    if (Object.is(next, state.present)) return state;

    const canCoalesce =
      action.historyKey &&
      state.lastHistoryKey === action.historyKey &&
      action.timestamp - state.lastHistoryAt < INPUT_HISTORY_DEBOUNCE_MS;

    if (canCoalesce) {
      return {
        ...state,
        present: next,
        lastHistoryAt: action.timestamp,
      };
    }

    return {
      past: [...state.past, state.present].slice(-MAX_HISTORY_ENTRIES),
      present: next,
      future: [],
      lastHistoryKey: action.historyKey,
      lastHistoryAt: action.timestamp,
    };
  }

  if (action.type === "undo" && state.past.length > 0) {
    const previous = state.past[state.past.length - 1];
    return {
      past: state.past.slice(0, -1),
      present: previous,
      future: [state.present, ...state.future],
      lastHistoryKey: null,
      lastHistoryAt: 0,
    };
  }

  if (action.type === "redo" && state.future.length > 0) {
    const next = state.future[0];
    return {
      past: [...state.past, state.present].slice(-MAX_HISTORY_ENTRIES),
      present: next,
      future: state.future.slice(1),
      lastHistoryKey: null,
      lastHistoryAt: 0,
    };
  }

  return state;
};

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
        ...normalizeStats(saved.stats),
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
      bonusActions: Array.isArray(saved.bonusActions)
        ? saved.bonusActions
        : Array.isArray(saved.bonusActions?.bonusActions)
          ? saved.bonusActions.bonusActions
          : defaultStatBlock.bonusActions,
      reactions: Array.isArray(saved.reactions)
        ? saved.reactions
        : Array.isArray(saved.reactions?.reactions)
          ? saved.reactions.reactions
          : defaultStatBlock.reactions,
      legendaryDetails: {
        ...defaultStatBlock.legendaryDetails,
        ...(saved.legendaryDetails || {}),
        resistances: Array.isArray(saved.legendaryDetails?.resistances)
          ? saved.legendaryDetails.resistances
          : saved.legendaryDetails?.resistance
            ? [{ id: 1, ...saved.legendaryDetails.resistance }]
            : defaultStatBlock.legendaryDetails.resistances,
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
  const [history, dispatchHistory] = useReducer(
    historyReducer,
    undefined,
    () => ({
      past: [],
      present: getInitialStatBlock(),
      future: [],
      lastHistoryKey: null,
      lastHistoryAt: 0,
    }),
  );
  const statBlock = history.present;
  const [storePanelOpen, setStorePanelOpen] = useState("");
  const imageGeneratorRef = useRef(null);

  const setStatBlock = (update) => {
    const activeElement = document.activeElement;
    const isTextInput = activeElement?.matches(
      "input:not([type=button]):not([type=checkbox]):not([type=file]), textarea",
    );

    dispatchHistory({
      type: "update",
      update,
      historyKey: isTextInput ? activeElement : null,
      timestamp: Date.now(),
    });
  };

  const undo = () => dispatchHistory({ type: "undo" });
  const redo = () => dispatchHistory({ type: "redo" });

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!(event.ctrlKey || event.metaKey) || event.altKey) return;

      if (event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      }

      if (event.key.toLowerCase() === "y") {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

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

  const getProficiencyBonusValue = () =>
    Number.parseInt(
      getChallengeRating(statBlock.traits.challengeRating).proficiencyBonus,
      10,
    );

  const formatModifier = (value) => (value >= 0 ? `+${value}` : `${value}`);

  const getModifierValue = (value) => {
    const parsedValue = Number.parseInt(String(value).replace("+", ""), 10);
    return Number.isNaN(parsedValue) ? 0 : parsedValue;
  };

  const updateStat = (stat, field, value) => {
    setStatBlock((current) => ({
      ...current,
      stats: {
        ...current.stats,
        [stat]: {
          ...current.stats[stat],
          [field]: value,
          ...(field === "save" ? { saveBase: value, saveIsManual: true } : {}),
          ...(field === "value" &&
          value !== "" &&
          !current.stats[stat].saveIsManual
            ? {
                saveBase: getAbilityModifier(value),
                save: current.stats[stat].saveIsProficient
                  ? formatModifier(
                      getModifierValue(getAbilityModifier(value)) +
                        getProficiencyBonusValue(),
                    )
                  : getAbilityModifier(value),
              }
            : {}),
          ...(field === "save" && current.stats[stat].saveIsProficient
            ? {
                saveBase: value,
                save: formatModifier(
                  getModifierValue(value) + getProficiencyBonusValue(),
                ),
              }
            : {}),
        },
      },
    }));
  };

  const addCustomStat = () => {
    const customStatId = `custom-${Date.now()}`;

    setStatBlock((current) => ({
      ...current,
      stats: {
        ...current.stats,
        [customStatId]: {
          label: "",
          value: 10,
          save: "+0",
          saveBase: "+0",
          saveIsManual: false,
          saveIsProficient: false,
        },
      },
    }));
  };

  const updateCustomStatName = (stat, value) => {
    setStatBlock((current) => ({
      ...current,
      stats: {
        ...current.stats,
        [stat]: {
          ...current.stats[stat],
          label: value.replace(/[^a-z]/gi, "").slice(0, 3),
        },
      },
    }));
  };

  const removeCustomStat = (stat) => {
    setStatBlock((current) => {
      const stats = { ...current.stats };
      delete stats[stat];
      return { ...current, stats };
    });
  };

  const toggleSaveProficiency = (stat) => {
    setStatBlock((current) => {
      const currentStat = current.stats[stat];
      const isProficient = !currentStat.saveIsProficient;
      const saveBase = currentStat.saveBase ?? currentStat.save;

      return {
        ...current,
        stats: {
          ...current.stats,
          [stat]: {
            ...currentStat,
            saveBase,
            save: isProficient
              ? formatModifier(
                  getModifierValue(saveBase) +
                    Number.parseInt(
                      getChallengeRating(current.traits.challengeRating)
                        .proficiencyBonus,
                      10,
                    ),
                )
              : saveBase,
            saveIsProficient: isProficient,
          },
        },
      };
    });
  };

  useEffect(() => {
    setStatBlock((current) => {
      const proficiencyBonus = Number.parseInt(
        getChallengeRating(current.traits.challengeRating).proficiencyBonus,
        10,
      );
      let hasChanged = false;
      const stats = Object.fromEntries(
        Object.entries(current.stats).map(([stat, currentStat]) => {
          if (!currentStat.saveIsProficient) return [stat, currentStat];

          const save = formatModifier(
            getModifierValue(currentStat.saveBase) + proficiencyBonus,
          );
          if (save === currentStat.save) return [stat, currentStat];

          hasChanged = true;
          return [stat, { ...currentStat, save }];
        }),
      );

      return hasChanged ? { ...current, stats } : current;
    });
  }, [statBlock.traits.challengeRating]);

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

  const setAbilities = (value) => {
    setStatBlock((current) => ({
      ...current,
      abilities: typeof value === "function" ? value(current.abilities) : value,
    }));
  };

  const setAttacks = (value) => {
    setStatBlock((current) => ({
      ...current,
      attacks: typeof value === "function" ? value(current.attacks) : value,
    }));
  };

  const setBonusActions = (value) => {
    setStatBlock((current) => ({
      ...current,
      bonusActions:
        typeof value === "function" ? value(current.bonusActions) : value,
    }));
  };

  const setReactions = (value) => {
    setStatBlock((current) => ({
      ...current,
      reactions: typeof value === "function" ? value(current.reactions) : value,
    }));
  };

  const setLegendary = (value) => {
    setStatBlock((current) => ({
      ...current,
      legendaryDetails:
        typeof value === "function" ? value(current.legendaryDetails) : value,
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
      <div className="App-header statblock-header-left-controls">
        <div>
          <button
            className="menu-btn"
            onClick={() => setPage("initiative-tracker")}
          >
            <FontAwesomeIcon icon={faArrowLeft} /> Initiative Tracker
          </button>
          {/* <span
            className="statblock-upload-info"
            tabIndex="0"
            role="img"
            aria-label="You can also upload your own stat block"
            data-tooltip="you can also upload your own stat block"
          >
            <FontAwesomeIcon icon={faCircleInfo} aria-hidden="true" />
          </span> */}
        </div>
        <div className="title">
          <h1>Stat block builder</h1>
        </div>
        <button className="menu-btn" onClick={() => setPage("token-stamp")}>
          Token Stamp <FontAwesomeIcon icon={faArrowRight} />
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
                <span>Name</span>
                <input
                  className="margin-left-6"
                  name="name"
                  placeholder="Monster Name"
                  value={statBlock.name}
                  onChange={(e) => updateField("name", e.target.value)}
                />
              </label>
              <label>
                <span>Size</span>
                <select
                  className="trait-picker-input creature-size-select"
                  name="creatureSize"
                  value={statBlock.creatureSize}
                  onChange={(e) => updateField("creatureSize", e.target.value)}
                  aria-label="Creature size"
                >
                  <option value="Tiny">Tiny</option>
                  <option value="Small">Small</option>
                  <option value="Medium">Medium</option>
                  <option value="Large">Large</option>
                  <option value="Huge">Huge</option>
                  <option value="Gargantuan">Gargantuan</option>
                </select>
              </label>
              <label>
                <span>Monster type</span>
                <input
                  className="margin-left-6"
                  name="creatureType"
                  placeholder="Creature type"
                  value={statBlock.creatureType}
                  onChange={(e) => updateField("creatureType", e.target.value)}
                />
              </label>
              <label className="legendary-toggle">
                <input
                  name="legendary"
                  type="checkbox"
                  checked={statBlock.legendary}
                  onChange={(e) => updateField("legendary", e.target.checked)}
                />
                <span className="subtext margin-left-4">Legendary</span>
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
              {Object.keys(statBlock.stats).map((stat) => (
                <label key={stat} className="stat-field">
                  {stat.startsWith("custom-") ? (
                    <span className="custom-stat-name-control">
                      <input
                        className="custom-stat-name"
                        type="text"
                        value={statBlock.stats[stat].label}
                        maxLength={3}
                        placeholder="STAT"
                        aria-label="Custom three-letter stat name"
                        onChange={(e) =>
                          updateCustomStatName(stat, e.target.value)
                        }
                      />
                      <button
                        type="button"
                        className="custom-stat-remove"
                        aria-label="Remove custom stat"
                        title="Remove custom stat"
                        onClick={() => removeCustomStat(stat)}
                      >
                        x
                      </button>
                    </span>
                  ) : (
                    stat.toUpperCase()
                  )}

                  <input
                    className="margin-bottom-4"
                    name={stat}
                    type="number"
                    value={statBlock.stats[stat].value}
                    onChange={(e) =>
                      updateStat(
                        stat,
                        "value",
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                  />

                  <div className="save-control">
                    <input
                      name={`${stat}save`}
                      type="text"
                      value={statBlock.stats[stat].save}
                      onChange={(e) => updateStat(stat, "save", e.target.value)}
                    />
                    <button
                      type="button"
                      className={`save-proficiency-toggle${
                        statBlock.stats[stat].saveIsProficient ? " active" : ""
                      }`}
                      aria-label={`${stat.toUpperCase()} saving throw proficiency`}
                      aria-pressed={statBlock.stats[stat].saveIsProficient}
                      title="Toggle proficiency bonus"
                      onClick={() => toggleSaveProficiency(stat)}
                    >
                      P
                    </button>
                  </div>
                </label>
              ))}
              <div className="custom-stat-controls">
                <button
                  type="button"
                  className="button add-button"
                  onClick={addCustomStat}
                >
                  Add stat <FontAwesomeIcon icon={faPlus} />
                </button>
              </div>
            </div>

            <div className="border-top-3 trait-display-row">
              {statBlock.legendary && (
                <>
                  {statBlock.legendaryDetails.resistances.map((resistance) => (
                    <div
                      className="legendary-resistance-display"
                      key={resistance.id}
                    >
                      <strong className="accent-color">
                        Legendary Resistance:{" "}
                      </strong>
                      <strong className="accent-color">
                        {resistance.amount}/day
                      </strong>{" "}
                      <FormattedText
                        text={resistance.description}
                        name={statBlock.name}
                        amount={resistance.amount}
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    className="button add-button width-100"
                    onClick={() => setStorePanelOpen("legendary-resistance")}
                  >
                    Add Legendary Resistance <FontAwesomeIcon icon={faPlus} />
                  </button>
                </>
              )}
              {statBlock.traits.resistances.length > 0 && (
                <div>
                  <strong className="accent-color">Resistances:</strong>{" "}
                  {statBlock.traits.resistances.join(", ")}
                </div>
              )}
              {statBlock.traits.senses.length > 0 && (
                <div>
                  <strong className="accent-color">Senses:</strong>{" "}
                  {statBlock.traits.senses.map(formatSense).join(", ")}
                </div>
              )}
              {statBlock.traits.languages.length > 0 && (
                <div>
                  <strong className="accent-color">Languages:</strong>{" "}
                  {statBlock.traits.languages.join(", ")}
                </div>
              )}
              <div>
                <strong className="accent-color">Challenge Rating:</strong>{" "}
                <span className="challenge-rating-value">
                  {getChallengeRating(statBlock.traits.challengeRating).label}
                </span>{" "}
                <span className="challenge-rating-meta">
                  (XP {getChallengeRating(statBlock.traits.challengeRating).xp};
                  PB{" "}
                  {
                    getChallengeRating(statBlock.traits.challengeRating)
                      .proficiencyBonus
                  }
                  )
                </span>
              </div>
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
            <div className="stat-block-content-section stat-block-abilities border-top-3">
              {statBlock.abilities.abilities.length > 0 && (
                <h2 className="stat-block-section-header">Abilities</h2>
              )}
              {statBlock.abilities.abilities.map((ability) => (
                <div className="stat-block-section-item" key={ability.id}>
                  <strong className="accent-color">
                    {ability.name || "Unnamed ability"}.
                  </strong>{" "}
                  <FormattedText
                    text={ability.description}
                    name={statBlock.name}
                  />
                </div>
              ))}
            </div>
            <div className="standard-row trait-actions-row">
              <button
                type="button"
                className="button add-button width-100"
                onClick={() => setStorePanelOpen("ability")}
              >
                Add Abilities <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>
            <div className="stat-block-content-section stat-block-actions border-top-3">
              {((statBlock.attacks.multiattack.enabled &&
                statBlock.attacks.multiattack.attacks.length > 0) ||
                statBlock.attacks.attacks.length > 0) && (
                <h2 className="stat-block-section-header">Actions</h2>
              )}
              {statBlock.attacks.multiattack.enabled &&
                statBlock.attacks.multiattack.attacks.length > 0 && (
                  <div className="attack-multiattack-text">
                    <strong className="accent-color">
                      <em>Multiattack.</em>
                    </strong>{" "}
                    The {statBlock.name || "creature"} makes{" "}
                    {statBlock.attacks.multiattack.attacks
                      .map((selection) => {
                        const attack = statBlock.attacks.attacks.find(
                          (item) => item.id === selection.attackId,
                        );
                        return `${selection.count} ${
                          attack?.name || "unnamed action"
                        } action${selection.count === 1 ? "" : "s"}`;
                      })
                      .join(" or ")}
                    .
                  </div>
                )}
              {statBlock.attacks.attacks.map((attack) => (
                <div className="attack-display-item" key={attack.id}>
                  <strong className="accent-color">
                    <em>{attack.name || "Unnamed action"}.</em>
                  </strong>{" "}
                  <FormattedText
                    text={attack.description}
                    name={statBlock.name}
                  />
                </div>
              ))}
            </div>

            <div className="standard-row trait-actions-row">
              <button
                type="button"
                className="button add-button width-100"
                onClick={() => setStorePanelOpen("attack")}
              >
                Add Actions <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>
            <div className="stat-block-content-section stat-block-bonus-actions border-top-3">
              {statBlock.bonusActions.length > 0 && (
                <h2 className="stat-block-section-header">Bonus Actions</h2>
              )}
              {statBlock.bonusActions.map((action) => (
                <div className="attack-display-item" key={action.id}>
                  <strong className="accent-color">
                    <em>{action.name || "Unnamed bonus action"}.</em>
                  </strong>{" "}
                  <FormattedText
                    text={action.description}
                    name={statBlock.name}
                  />
                </div>
              ))}
              <button
                type="button"
                className="button add-button width-100"
                onClick={() => setStorePanelOpen("bonusAction")}
                title="Bonus action store coming soon"
              >
                Add Bonus Actions <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>
            <div className="stat-block-content-section stat-block-reactions border-top-3">
              {statBlock.reactions.length > 0 && (
                <h2 className="stat-block-section-header">Reactions</h2>
              )}
              {statBlock.reactions.map((reaction) => (
                <div className="attack-display-item" key={reaction.id}>
                  <strong className="accent-color">
                    <em>{reaction.name || "Unnamed reaction"}.</em>
                  </strong>{" "}
                  <FormattedText
                    text={reaction.description}
                    name={statBlock.name}
                  />
                </div>
              ))}
              <button
                type="button"
                className="button add-button width-100"
                onClick={() => setStorePanelOpen("reaction")}
                title="Reaction store coming soon"
              >
                Add Reactions <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>
            {statBlock.legendary && (
              <div className="stat-block-content-section stat-block-legendary-actions border-top-3">
                <h2 className="stat-block-section-header">Legendary Actions</h2>
                {statBlock.legendaryDetails.actions.map((action) => (
                  <div className="attack-display-item" key={action.id}>
                    <strong className="accent-color">
                      <em>{action.name || "Unnamed action"}.</em>
                    </strong>{" "}
                    <FormattedText
                      text={action.description}
                      name={statBlock.name}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  className="button add-button width-100 legendary-actions-add-button"
                  onClick={() => setStorePanelOpen("legendary-action")}
                >
                  Add Legendary Actions <FontAwesomeIcon icon={faPlus} />
                </button>
              </div>
            )}
          </form>

          <div className="resize-handle-block" onMouseDown={startResize} />
        </div>

        <SaveUploads
          setStatBlock={setStatBlock}
          statBlock={statBlock}
          imageGeneratorRef={imageGeneratorRef}
          canUndo={history.past.length > 0}
          canRedo={history.future.length > 0}
          undo={undo}
          redo={redo}
        />
        <div className="stat-block-image-preview-wrapper" aria-hidden="true">
          <StatBlockImageGenerator
            ref={imageGeneratorRef}
            statBlock={statBlock}
            size={statBlock.size}
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
        {storePanelOpen === "ability" && (
          <AbilityStore
            setStorePanelOpen={setStorePanelOpen}
            abilities={statBlock.abilities}
            setAbilities={setAbilities}
          />
        )}
        {storePanelOpen === "attack" && (
          <AttackStore
            setStorePanelOpen={setStorePanelOpen}
            attacks={statBlock.attacks}
            setAttacks={setAttacks}
          />
        )}
        {storePanelOpen === "bonusAction" && (
          <BonusActionStore
            setStorePanelOpen={setStorePanelOpen}
            bonusActions={statBlock.bonusActions}
            setBonusActions={setBonusActions}
          />
        )}
        {storePanelOpen === "reaction" && (
          <ReactionStore
            setStorePanelOpen={setStorePanelOpen}
            reactions={statBlock.reactions}
            setReactions={setReactions}
          />
        )}
        {(storePanelOpen === "legendary-action" ||
          storePanelOpen === "legendary-resistance") && (
          <LegendaryStore
            setStorePanelOpen={setStorePanelOpen}
            legendary={statBlock.legendaryDetails}
            setLegendary={setLegendary}
            initialSection={
              storePanelOpen === "legendary-action" ? "actions" : "resistance"
            }
          />
        )}
      </div>
    </div>
  );
}

export default StatBlockBuilder;
