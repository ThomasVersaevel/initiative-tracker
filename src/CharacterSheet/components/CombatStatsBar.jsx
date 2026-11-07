import React from "react";
import { NumericInput } from "../../NumericInput";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";

export default function CombatStatsBar({
  proficiencyBonus,
  speed,
  heroPoints,
  setHeroPoints,
  initiative,
  onRollInitiative,
  ac,
  hp,
  setHp,
  maxHp,
  hpChange,
  setHpChange,
  formatModifier,
}) {
  return (
    <div className="core-info-strip">
      <div className="core-info-block">
        <div className="core-label">Initiative</div>
        <button
          type="button"
          className="initiative-button"
          onClick={onRollInitiative}
        >
          {formatModifier(initiative)}
        </button>
      </div>
      <div className="core-info-block">
        <div className="core-label">Hero Points</div>
        <div className="core-value hp-controls hero-point-controls">
          <span className="hp-number">{heroPoints}</span>
          <div className="hero-point-buttons">
            <button
              type="button"
              onClick={() => setHeroPoints((current) => current + 1)}
              aria-label="Increase hero points"
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
            <button
              type="button"
              onClick={() => setHeroPoints((current) => current - 1)}
              aria-label="Decrease hero points"
            >
              <FontAwesomeIcon icon={faMinus} />
            </button>
          </div>
        </div>
      </div>
      <div className="core-info-block">
        <div className="core-label">Proficiency</div>
        <div className="core-value stat-shape proficiency-shape">
          {formatModifier(proficiencyBonus)}
        </div>
      </div>
      <div className="core-info-block">
        <div className="core-label">Speed</div>
        <div className="core-value stat-shape speed-shape">{speed}</div>
      </div>
      <div className="core-info-block">
        <div className="core-label">Armor Class</div>
        <div className="core-value stat-shape armor-shape">{ac}</div>
      </div>
      <div className="core-info-block hp-info-block">
        <div className="core-label hp-core-label">HP</div>
        <div className="core-value hp-controls hp-health-controls">
          <div className="hp-values">
            <NumericInput
              className="hp-current"
              value={hp}
              onChange={(event) => setHp(Number(event.target.value))}
              aria-label="Current hit points"
            />
            <span className="hp-divider">/</span>
            <input
              className="hp-max"
              type="number"
              value={maxHp}
              readOnly
              aria-label="Maximum hit points"
            />
          </div>
          <div className="hp-adjustment">
            <button
              type="button"
              onClick={() => setHp((current) => current + hpChange)}
              aria-label="Heal hit points"
            >
              Heal
            </button>
            <NumericInput
              className="hp-change"
              min="1"
              value={hpChange}
              onChange={(event) =>
                setHpChange(Math.max(1, Number(event.target.value) || 1))
              }
              aria-label="Hit point change amount"
            />
            <button
              type="button"
              onClick={() => setHp((current) => current - hpChange)}
              aria-label="Damage hit points"
            >
              Damage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
