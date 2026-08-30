import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faTrash } from "@fortawesome/free-solid-svg-icons";

const createBonusAction = (id) => ({
  id,
  name: "",
  description: "",
});

export function BonusActionStore({
  setStorePanelOpen,
  bonusActions,
  setBonusActions,
}) {
  const updateBonusAction = (id, field, value) => {
    setBonusActions((current) =>
      current.map((bonusAction) =>
        bonusAction.id === id
          ? { ...bonusAction, [field]: value }
          : bonusAction,
      ),
    );
  };

  const addBonusAction = () => {
    setBonusActions((current) => [
        ...current,
        createBonusAction(
          current.reduce(
            (maxId, bonusAction) => Math.max(maxId, bonusAction.id),
            0,
          ) + 1,
        ),
      ],
    );
  };

  const removeBonusAction = (id) => {
    setBonusActions((current) =>
      current.filter(
        (bonusAction) => bonusAction.id !== id,
      ),
    );
  };

  return (
    <div>
      <div className="store-header">
        <h2>Bonus actions</h2>
        <button
          type="button"
          className="btn"
          onClick={() => setStorePanelOpen("")}
        >
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>

      <div className="store-items Ability-store">
        <button
          type="button"
          className="button add-button"
          onClick={addBonusAction}
        >
          Add Bonus Action
        </button>

        {bonusActions.map((bonusAction) => (
          <div className="attack-editor" key={bonusAction.id}>
            <div className="attack-editor-header">
              <strong>Bonus Action</strong>
              <button
                type="button"
                className="ability-remove-button"
                onClick={() => removeBonusAction(bonusAction.id)}
                title="Remove Bonus Action"
                aria-label="Remove Bonus Action"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
            <label>
              Name
              <input
                type="text"
                value={bonusAction.name}
                onChange={(event) =>
                  updateBonusAction(bonusAction.id, "name", event.target.value)
                }
              />
            </label>
            <label>
              Description
              <textarea
                rows="3"
                value={bonusAction.description}
                onChange={(event) =>
                  updateBonusAction(
                    bonusAction.id,
                    "description",
                    event.target.value,
                  )
                }
              />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
