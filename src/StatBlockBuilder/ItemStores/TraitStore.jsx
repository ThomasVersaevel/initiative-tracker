import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { traitOptions } from "../TypesUtils/StoreTypes";

export function TraitStore({ setStorePanelOpen, traits, setTraits }) {
  const [openCategory, setOpenCategory] = useState(null);

  const toggleOption = (category, option) => {
    setTraits((current) => ({
      ...current,
      [category]: current[category].includes(option)
        ? current[category].filter((value) => value !== option)
        : [...current[category], option],
    }));
  };

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
        {renderMultiSelect("senses", "Senses")}
        {renderMultiSelect("languages", "Languages")}

        <label className="trait-select-field">
          <span>Challenge Rating</span>
          <input
            type="number"
            min="0"
            value={traits.challengeRating}
            onChange={(e) =>
              setTraits((current) => ({
                ...current,
                challengeRating: Number(e.target.value),
              }))
            }
          />
        </label>
      </div>
    </div>
  );
}
