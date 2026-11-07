import React from "react";

export default function Skills({ rows, onRoll }) {
  return (
    <section className="sheet-column skills">
      <h3>Skills</h3>
      <div className="skill-list">
        {rows.map((row) => (
          <div className="skill-row" key={row.name}>
            <span
              className={`skill-proficiency ${row.prof ? "active" : ""}`}
            ></span>
            <span className="skill-ability">{row.ability}</span>
            <span className="skill-name">{row.name}</span>
            <button
              className="skill-mod"
              type="button"
              onClick={() => onRoll(row.ability, row.name, row.prof)}
            >
              {row.modifierText}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
