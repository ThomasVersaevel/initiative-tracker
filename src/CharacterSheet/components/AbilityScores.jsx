import React from "react";
import { NumericInput } from "../../NumericInput";

export default function AbilityScores({ abilities, onRoll, onUpdate }) {
  return (
    <div className="ability-stack">
      {abilities.map((ability) => (
        <div className="ability-card" key={ability.key}>
          <div className="ability-label">{ability.full}</div>
          <button
            className="ability-modifier"
            type="button"
            onClick={() => onRoll(ability.key)}
          >
            {ability.modifierText}
          </button>
          <NumericInput
            className="ability-override"
            min="1"
            max="30"
            value={ability.score}
            onChange={(event) => onUpdate(ability.key, event.target.value)}
          />
        </div>
      ))}
    </div>
  );
}
