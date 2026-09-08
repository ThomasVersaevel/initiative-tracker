import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faTrash } from "@fortawesome/free-solid-svg-icons";

const createAction = (id) => ({
  id,
  name: "",
  description: "",
});

export function LairStore({ setStorePanelOpen, lair, setLair }) {
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

  return (
    <div>
      <div className="store-header">
        <h2>Lair Actions</h2>
        <button type="button" className="btn" onClick={() => setStorePanelOpen("")}>
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
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
            <input
              type="number"
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
          {lair.actions.map((action) => (
            <div className="attack-editor" key={action.id}>
              <div className="attack-editor-header">
                <strong>Action</strong>
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