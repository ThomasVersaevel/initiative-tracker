import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { traitOptions } from "./StoreTypes";

export function TraitStore({
  setStorePanelOpen,
  traits,
  setTraits,
}) {
  const toggleOption = (category, option) => {
    setTraits((current) => {
      const values = current[category];

      if (values.includes(option)) {
        return {
          ...current,
          [category]: values.filter((value) => value !== option),
        };
      }

      return {
        ...current,
        [category]: [...values, option],
      };
    });
  };

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
        <h3>Resistances</h3>

        {traitOptions.resistances.map((option) => {
          const alreadyAdded = traits.resistances.includes(option);

          return (
            <div
              key={option}
              className={`store-item ${
                alreadyAdded ? "store-item-added" : ""
              }`}
            >
              <div className="store-item-info">
                <span>{option}</span>
              </div>

              <button
                type="button"
                className={`btn ${
                  alreadyAdded ? "remove-button" : "add-button"
                }`}
                onClick={() => toggleOption("resistances", option)}
              >
                {alreadyAdded ? "Remove" : "Add"}
              </button>
            </div>
          );
        })}

        <h3>Senses</h3>

        {traitOptions.senses.map((option) => {
          const alreadyAdded = traits.senses.includes(option);

          return (
            <div
              key={option}
              className={`store-item ${
                alreadyAdded ? "store-item-added" : ""
              }`}
            >
              <div className="store-item-info">
                <span>{option}</span>
              </div>

              <button
                type="button"
                className={`btn ${
                  alreadyAdded ? "remove-button" : "add-button"
                }`}
                onClick={() => toggleOption("senses", option)}
              >
                {alreadyAdded ? "Remove" : "Add"}
              </button>
            </div>
          );
        })}

        <h3>Languages</h3>

        {traitOptions.languages.map((option) => {
          const alreadyAdded = traits.languages.includes(option);

          return (
            <div
              key={option}
              className={`store-item ${
                alreadyAdded ? "store-item-added" : ""
              }`}
            >
              <div className="store-item-info">
                <span>{option}</span>
              </div>

              <button
                type="button"
                className={`btn ${
                  alreadyAdded ? "remove-button" : "add-button"
                }`}
                onClick={() => toggleOption("languages", option)}
              >
                {alreadyAdded ? "Remove" : "Add"}
              </button>
            </div>
          );
        })}

        <h3>Challenge Rating</h3>

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
      </div>
    </div>
  );
}