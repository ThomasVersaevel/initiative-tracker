import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faTrash } from "@fortawesome/free-solid-svg-icons";
import {
  ImportExistingButton,
  SaveItemButton,
  useSavedItems,
} from "./SavedItems";

const createAbility = (id) => ({
  id,
  name: "",
  description: "",
});

export function AbilityStore({ setStorePanelOpen, abilities, setAbilities }) {
  const savedItems = useSavedItems("ability");

  const updateAbility = (id, field, value) => {
    setAbilities((current) => ({
      ...current,
      abilities: current.abilities.map((ability) =>
        ability.id === id ? { ...ability, [field]: value } : ability,
      ),
    }));
  };

  const addAbility = () => {
    setAbilities((current) => ({
      ...current,
      abilities: [
        ...current.abilities,
        createAbility(
          current.abilities.reduce(
            (maxId, ability) => Math.max(maxId, ability.id),
            0,
          ) + 1,
        ),
      ],
    }));
  };

  const removeAbility = (id) => {
    setAbilities((current) => ({
      ...current,
      abilities: current.abilities.filter((ability) => ability.id !== id),
    }));
  };

  const addSavedAbility = (ability) => {
    setAbilities((current) => ({
      ...current,
      abilities: [
        ...current.abilities,
        {
          ...ability,
          id: current.abilities.reduce(
            (maxId, item) => Math.max(maxId, item.id),
            0,
          ) + 1,
        },
      ],
    }));
  };

  return (
    <div>
      <div className="store-header">
        <h2>Abilities</h2>
        <div className="store-header-actions">
          <ImportExistingButton
            sources={[
              {
                title: "Abilities",
                ...savedItems,
                onAdd: addSavedAbility,
                onDelete: savedItems.deleteItem,
              },
            ]}
          />
        <button
          type="button"
          className="btn"
          onClick={() => setStorePanelOpen("")}
        >
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
        </div>
      </div>

      <div className="store-items Ability-store">
        <button
          type="button"
          className="button add-button"
          onClick={addAbility}
        >
          Add Ability
        </button>
        {abilities.abilities.map((ability) => (
          <div className="attack-editor" key={ability.id}>
            <div className="attack-editor-header">
              <strong>Ability</strong>
              <SaveItemButton
                onClick={() => savedItems.saveItem(ability, ability.name)}
                disabled={!ability.name.trim() && !ability.description.trim()}
              />
              <button
                type="button"
                className="ability-remove-button"
                onClick={() => removeAbility(ability.id)}
                title="Remove Ability"
                aria-label="Remove Ability"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
            <label>
              Name
              <input
                type="text"
                value={ability.name}
                onChange={(event) =>
                  updateAbility(ability.id, "name", event.target.value)
                }
              />
            </label>
            <label>
              Description
              <textarea
                rows="3"
                value={ability.description}
                onChange={(event) =>
                  updateAbility(ability.id, "description", event.target.value)
                }
              />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
