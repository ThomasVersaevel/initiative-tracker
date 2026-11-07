import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faTrash } from "@fortawesome/free-solid-svg-icons";
import { NumericInput } from "../../NumericInput";
import {
  ImportExistingButton,
  SaveItemButton,
  useSavedItems,
} from "./SavedItems";

const createAction = (id) => ({
  id,
  name: "",
  description: "",
});

export function LairStore({ setStorePanelOpen, lair, setLair }) {
  const savedItems = useSavedItems("lair-action");

  const updateAction = (id, field, value) => {
    setLair((current) => ({
      ...current,
      actions: current.actions.map((action) =>
        action.id === id ? { ...action, [field]: value } : action,
      ),
    }));
  };

  const addAction = () => {
    setLair((current) => ({
      ...current,
      actions: [
        ...current.actions,
        createAction(
          current.actions.reduce((maxId, action) => Math.max(maxId, action.id), 0) + 1,
        ),
      ],
    }));
  };

  const removeAction = (id) => {
    setLair((current) => ({
      ...current,
      actions: current.actions.filter((action) => action.id !== id),
    }));
  };

  const addSavedAction = (action) => {
    setLair((current) => ({
      ...current,
      actions: [
        ...current.actions,
        {
          ...action,
          id: current.actions.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1,
        },
      ],
    }));
  };

  return (
    <div>
      <div className="store-header">
        <h2>Lair Actions</h2>
        <div className="store-header-actions">
          <ImportExistingButton
            sources={[
              {
                title: "Lair actions",
                ...savedItems,
                onAdd: addSavedAction,
                onDelete: savedItems.deleteItem,
              },
            ]}
          />
        <button type="button" className="btn" onClick={() => setStorePanelOpen("")}>
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
        </div>
      </div>
      <div className="store-items legendary-store">
        <section className="legendary-store-section">
          <div className="legendary-store-section-header">
            <strong>Lair actions</strong>
            <button type="button" className="button add-button" onClick={addAction}>
              Add action
            </button>
          </div>
          <label className="legendary-store-uses">
            Number of uses
            <NumericInput
              min="0"
              value={lair.uses}
              onChange={(event) =>
                setLair((current) => ({
                  ...current,
                  uses: Math.max(0, Number(event.target.value) || 0),
                }))
              }
            />
          </label>
          <label className="legendary-store-uses">
            Initiative count
            <NumericInput
              min="0"
              value={lair.initiativeCount}
              onChange={(event) =>
                setLair((current) => ({
                  ...current,
                  initiativeCount: Math.max(0, Number(event.target.value) || 0),
                }))
              }
            />
          </label>
          {lair.actions.map((action) => (
            <div className="attack-editor" key={action.id}>
              <div className="attack-editor-header">
                <strong>Action</strong>
                <SaveItemButton
                  onClick={() => savedItems.saveItem(action, action.name)}
                  disabled={!action.name.trim() && !action.description.trim()}
                />
                <button
                  type="button"
                  className="attack-remove-button"
                  onClick={() => removeAction(action.id)}
                  title="Remove action"
                  aria-label="Remove action"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
              <label>
                Name
                <input
                  type="text"
                  value={action.name}
                  onChange={(event) => updateAction(action.id, "name", event.target.value)}
                />
              </label>
              <label>
                Description
                <textarea
                  rows="3"
                  value={action.description}
                  onChange={(event) => updateAction(action.id, "description", event.target.value)}
                />
              </label>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}