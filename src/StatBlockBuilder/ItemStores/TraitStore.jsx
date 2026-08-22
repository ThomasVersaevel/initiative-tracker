import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { traitOptions } from "../TypesUtils/StoreTypes";
import { challengeRatings } from "../TypesUtils/Types";

export function TraitStore({ setStorePanelOpen, traits, setTraits }) {
  const [openCategory, setOpenCategory] = useState(null);
  const [customSense, setCustomSense] = useState("");
  const [customSenseRange, setCustomSenseRange] = useState("");
  const selectedChallengeRating =
    challengeRatings.find(
      (rating) => rating.value === String(traits.challengeRating),
    ) || challengeRatings[0];

  const toggleOption = (category, option) => {
    setTraits((current) => ({
      ...current,
      [category]: current[category].includes(option)
        ? current[category].filter((value) => value !== option)
        : [...current[category], option],
    }));
  };

  const getSenseName = (sense) =>
    typeof sense === "string" ? sense : sense.name;

  const toggleSense = (senseName) => {
    setTraits((current) => ({
      ...current,
      senses: current.senses.some((sense) => getSenseName(sense) === senseName)
        ? current.senses.filter((sense) => getSenseName(sense) !== senseName)
        : [...current.senses, { name: senseName, range: "" }],
    }));
  };

  const updateSenseRange = (senseName, range) => {
    setTraits((current) => ({
      ...current,
      senses: current.senses.map((sense) =>
        getSenseName(sense) === senseName
          ? { name: senseName, range }
          : sense,
      ),
    }));
  };

  const addCustomSense = () => {
    const name = customSense.trim();
    if (!name) return;

    setTraits((current) => ({
      ...current,
      senses: [
        ...current.senses,
        { name, range: customSenseRange.trim() },
      ],
    }));
    setCustomSense("");
    setCustomSenseRange("");
    setOpenCategory(null);
  };

  const renderSenses = () => (
    <div className="trait-select-field">
      <span>Senses</span>
      <div className="trait-picker">
        <button
          type="button"
          className="trait-picker-input"
          aria-expanded={openCategory === "senses"}
          onClick={() =>
            setOpenCategory((current) =>
              current === "senses" ? null : "senses",
            )
          }
        >
          {traits.senses.length > 0 ? (
            traits.senses.map((sense) => (
              <span className="trait-pill" key={getSenseName(sense)}>
                {getSenseName(sense)}
              </span>
            ))
          ) : (
            <span className="trait-picker-placeholder">Choose options</span>
          )}
          <span className="trait-picker-chevron">▾</span>
        </button>

        {openCategory === "senses" && (
          <div className="trait-picker-menu">
            {traitOptions.senses.map((option) => {
              const selected = traits.senses.some(
                (sense) => getSenseName(sense) === option,
              );
              return (
                <button
                  type="button"
                  key={option}
                  className={`trait-picker-option${selected ? " selected" : ""}`}
                  onClick={() => toggleSense(option)}
                >
                  <span>{option}</span>
                  {selected && <span>✓</span>}
                </button>
              );
            })}

            <div className="custom-sense-form">
              <strong>Custom sense</strong>
              <input
                type="text"
                placeholder="Sense name"
                value={customSense}
                onChange={(e) => setCustomSense(e.target.value)}
              />
              <input
                type="number"
                min="0"
                placeholder="Range (ft.)"
                value={customSenseRange}
                onChange={(e) => setCustomSenseRange(e.target.value)}
              />
              <button
                type="button"
                className="button add-button"
                onClick={addCustomSense}
              >
                Add custom sense
              </button>
            </div>
          </div>
        )}
      </div>

      {traits.senses.length > 0 && (
        <div className="sense-range-fields">
          {traits.senses.map((sense) => {
            const name = getSenseName(sense);
            return (
              <label key={name}>
                <span>{name} range (ft.)</span>
                <input
                  type="number"
                  min="0"
                  placeholder="Optional"
                  value={typeof sense === "string" ? "" : sense.range}
                  onChange={(e) => updateSenseRange(name, e.target.value)}
                />
              </label>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderMultiSelect = (category, label) => (
    <div className="trait-select-field">
      <span>{label}</span>
      <div className="trait-picker">
        <button
          type="button"
          className="trait-picker-input"
          aria-expanded={openCategory === category}
          onClick={() =>
            setOpenCategory((current) =>
              current === category ? null : category,
            )
          }
        >
          {traits[category].length > 0 ? (
            traits[category].map((option) => (
              <span
                className="trait-pill"
                role="button"
                onClick={(event) => {
                  event.stopPropagation();
                  toggleOption(category, option);
                }}
                key={option}
              >
                {option}
                <span
                  className="trait-pill-remove"
                  aria-label={`Remove ${option}`}
                >
                  x
                </span>
              </span>
            ))
          ) : (
            <span className="trait-picker-placeholder">Choose options</span>
          )}
          <span className="trait-picker-chevron">▾</span>
        </button>

        {openCategory === category && (
          <div className="trait-picker-menu">
            {traitOptions[category].map((option) => {
              const selected = traits[category].includes(option);
              return (
                <button
                  type="button"
                  key={option}
                  className={`trait-picker-option${
                    selected ? " selected" : ""
                  }`}
                  onClick={() => toggleOption(category, option)}
                >
                  <span>{option}</span>
                  {selected && <span>✓</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <div className="store-header">
        <h2>Add Traits</h2>

        <button
          type="button"
          className="btn"
          onClick={() => setStorePanelOpen("")}
        >
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>

      <div className="store-items">
        {renderMultiSelect("resistances", "Resistances")}
        {renderSenses()}
        {renderMultiSelect("languages", "Languages")}

        <label className="trait-select-field">
          <span>Challenge Rating</span>
          <div className="trait-picker">
            <button
              type="button"
              className="trait-picker-input challenge-rating-picker-input"
              aria-expanded={openCategory === "challengeRating"}
              onClick={() =>
                setOpenCategory((current) =>
                  current === "challengeRating" ? null : "challengeRating",
                )
              }
            >
              <span>CR {selectedChallengeRating.label}</span>
              <span className="challenge-rating-meta">
                {selectedChallengeRating.xp} XP - PB {selectedChallengeRating.proficiencyBonus}
              </span>
              <span className="trait-picker-chevron">▾</span>
            </button>

            {openCategory === "challengeRating" && (
              <div className="trait-picker-menu">
                {challengeRatings.map((rating) => (
                  <button
                    type="button"
                    key={rating.value}
                    className={`trait-picker-option challenge-rating-option${
                      rating.value === String(traits.challengeRating)
                        ? " selected"
                        : ""
                    }`}
                    onClick={() => {
                      setTraits((current) => ({
                        ...current,
                        challengeRating: rating.value,
                      }));
                      setOpenCategory(null);
                    }}
                  >
                    <span>CR {rating.label}</span>
                    <span className="challenge-rating-meta">
                      {rating.xp} XP - PB {rating.proficiencyBonus}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </label>
      </div>
    </div>
  );
}
