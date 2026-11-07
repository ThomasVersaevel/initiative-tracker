import React from "react";

export default function SavingThrows({ rows, onRoll }) {
  return (
    <>
      <h3>Saving Throws</h3>
      <div className="saving-grid">
        {rows.map((item) => (
          <div className="save-row" key={item.label}>
            <button
              className="skill-mod save-roll-button"
              type="button"
              onClick={() => onRoll(item.ability, `${item.label} save`)}
              aria-label={`Roll ${item.label} save`}
            >
              {item.modifierText}
            </button>
            <span
              className="save-proc skill-proficiency"
              aria-hidden="true"
            ></span>
            <span className="save-label">{item.label}</span>
          </div>
        ))}
      </div>
    </>
  );
}
