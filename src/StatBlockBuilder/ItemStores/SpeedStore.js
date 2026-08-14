import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { speedOptions } from "./StoreTypes";

export function SpeedStore({
  setStorePanelOpen,
  speeds,
  setSpeeds,
}) {
  return (
    <div>
      <div className="store-header">
        <h2>Add Speed</h2>

        <button className="btn" onClick={() => setStorePanelOpen("")}>
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>

      <div className="store-items">
        {speedOptions.map((option) => {
          const alreadyAdded = speeds.some(
            (speed) => speed.type === option.type,
          );

          return (
            <div
              key={option.type}
              className={`store-item ${alreadyAdded ? "store-item-added" : ""}`}
            >
              <div className="store-item-info">
                <FontAwesomeIcon icon={option.icon} />
                <span>{option.label}</span>
              </div>

              {alreadyAdded ? (
                <button
                  type="button"
                  className="btn remove-button"
                  onClick={() =>
                    setSpeeds((current) =>
                      current.filter((speed) => speed.type !== option.type),
                    )
                  }
                >
                  Remove
                </button>
              ) : (
                <button
                  type="button"
                  className="btn add-button"
                  onClick={() =>
                    setSpeeds((current) => [
                      ...current,
                      {
                        type: option.type,
                        label: option.label,
                        value: option.defaultValue,
                      },
                    ])
                  }
                >
                  Add
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
