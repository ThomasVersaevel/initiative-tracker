import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { speedOptions } from "../TypesUtils/StoreTypes";
import {
  ImportExistingButton,
  SaveItemButton,
  useSavedItems,
} from "./SavedItems";

export function SpeedStore({
  setStorePanelOpen,
  speeds,
  setSpeeds,
}) {
  const savedItems = useSavedItems("speed");

  const addSavedSpeed = (speed) => {
    setSpeeds((current) =>
      current.some((item) => item.type === speed.type)
        ? current.map((item) => item.type === speed.type ? speed : item)
        : [...current, speed],
    );
  };

  return (
    <div>
      <div className="store-header">
        <h2>Speeds</h2>
        <div className="store-header-actions">
          <ImportExistingButton
            sources={[
              {
                title: "Speeds",
                ...savedItems,
                onAdd: addSavedSpeed,
                onDelete: savedItems.deleteItem,
              },
            ]}
          />
        <button className="btn" onClick={() => setStorePanelOpen("")}>
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
        </div>
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

              {alreadyAdded && (
                <SaveItemButton
                  onClick={() =>
                    savedItems.saveItem(
                      speeds.find((speed) => speed.type === option.type),
                      option.label,
                    )
                  }
                />
              )}

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
