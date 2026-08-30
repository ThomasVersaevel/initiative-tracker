import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faTrash } from "@fortawesome/free-solid-svg-icons";

const createReaction = (id) => ({
  id,
  name: "",
  description: "",
});

export function ReactionStore({
  setStorePanelOpen,
  reactions,
  setReactions,
}) {
  const updateReaction = (id, field, value) => {
    setReactions((current) =>
      current.map((reaction) =>
        reaction.id === id ? { ...reaction, [field]: value } : reaction,
      ),
    );
  };

  const addReaction = () => {
    setReactions((current) => [
        ...current,
        createReaction(
          current.reduce(
            (maxId, reaction) => Math.max(maxId, reaction.id),
            0,
          ) + 1,
        ),
      ],
    );
  };

  const removeReaction = (id) => {
    setReactions((current) =>
      current.filter(
        (reaction) => reaction.id !== id,
      ),
    );
  };

  return (
    <div>
      <div className="store-header">
        <h2>Reactions</h2>
        <button
          type="button"
          className="btn"
          onClick={() => setStorePanelOpen("")}
        >
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>

      <div className="store-items reaction-store">
        <button
          type="button"
          className="button add-button"
          onClick={addReaction}
        >
          Add Reaction
        </button>

        {reactions.map((reaction) => (
          <div className="attack-editor" key={reaction.id}>
            <div className="attack-editor-header">
              <strong>Reaction</strong>
              <button
                type="button"
                className="ability-remove-button"
                onClick={() => removeReaction(reaction.id)}
                title="Remove Reaction"
                aria-label="Remove Reaction"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
            <label>
              Name
              <input
                type="text"
                value={reaction.name}
                onChange={(event) =>
                  updateReaction(reaction.id, "name", event.target.value)
                }
              />
            </label>
            <label>
              Description
              <textarea
                rows="3"
                value={reaction.description}
                onChange={(event) =>
                  updateReaction(
                    reaction.id,
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
