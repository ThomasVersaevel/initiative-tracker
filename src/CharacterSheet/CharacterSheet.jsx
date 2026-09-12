import React, { useEffect, useMemo, useRef, useState } from "react";
import DiceBox from "@3d-dice/dice-box";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faPlus,
  faMinus,
} from "@fortawesome/free-solid-svg-icons";
import "./CharacterSheet.css";

const initialStats = {
  str: 10,
  dex: 10,
  con: 10,
  int: 10,
  wis: 10,
  cha: 10,
};

const abilityMeta = {
  str: { label: "STR", full: "Strength" },
  dex: { label: "DEX", full: "Dexterity" },
  con: { label: "CON", full: "Constitution" },
  int: { label: "INT", full: "Intelligence" },
  wis: { label: "WIS", full: "Wisdom" },
  cha: { label: "CHA", full: "Charisma" },
};

const skillRows = [
  { name: "Acrobatics", ability: "dex", prof: false },
  { name: "Animal Handling", ability: "wis", prof: true },
  { name: "Arcana", ability: "int", prof: false },
  { name: "Athletics", ability: "str", prof: true },
  { name: "Deception", ability: "cha", prof: false },
  { name: "History", ability: "int", prof: false },
  { name: "Insight", ability: "wis", prof: true },
  { name: "Intimidation", ability: "cha", prof: false },
  { name: "Investigation", ability: "int", prof: false },
  { name: "Medicine", ability: "wis", prof: false },
  { name: "Nature", ability: "int", prof: false },
  { name: "Perception", ability: "wis", prof: true },
  { name: "Performance", ability: "cha", prof: false },
  { name: "Persuasion", ability: "cha", prof: false },
  { name: "Religion", ability: "int", prof: false },
  { name: "Sleight of Hand", ability: "dex", prof: false },
  { name: "Stealth", ability: "dex", prof: false },
  { name: "Survival", ability: "wis", prof: false },
];

const savingThrows = [
  { label: "Strength", ability: "str", physical: true },
  { label: "Dexterity", ability: "dex", physical: true },
  { label: "Constitution", ability: "con", physical: true },
  { label: "Intelligence", ability: "int", mental: true },
  { label: "Wisdom", ability: "wis", mental: true },
  { label: "Charisma", ability: "cha", mental: true },
];

function modifierForScore(score) {
  return Math.floor((score - 10) / 2);
}

function sign(value) {
  return value >= 0 ? `+${value}` : `${value}`;
}

export default function CharacterSheet({ setPage }) {
  const [stats, setStats] = useState(initialStats);
  const [heroPoints, setHeroPoints] = useState(5);
  const [hp, setHp] = useState(10);
  const maxHp = 10;
  const [ac] = useState(10);
  const [initiative] = useState(0);
  const [speed] = useState(30);
  const [proficiencyBonus] = useState(2);
  const [activeTab, setActiveTab] = useState("actions");
  const [lastRoll, setLastRoll] = useState(null);
  const [isDiceFading, setIsDiceFading] = useState(false);
  const [hpChange, setHpChange] = useState(1);
  const diceRef = useRef(null);
  const diceCleanupTimerRef = useRef(null);

  useEffect(() => {
    if (!diceRef.current) {
      const dice = new DiceBox("#dice-box-char", {
        id: "charsheet-dice",
        assetPath: "/assets/dice-box/",
        themeColor: "#2bbfff",
        offscreen: false,
        scale: 6,
        startingHeight: 4,
        throwForce: 4,
        spinForce: 5,
        lightIntensity: 1.0,
      });

      dice
        .init()
        .then(() => {
          diceRef.current = dice;
          dice.resizeWorld();
        })
        .catch(() => {
          // no-op if dice library cannot initialize here
        });
    }
  }, []);

  useEffect(() => {
    return () => clearTimeout(diceCleanupTimerRef.current);
  }, []);

  const scheduleDiceCleanup = () => {
    clearTimeout(diceCleanupTimerRef.current);
    setIsDiceFading(true);
    diceCleanupTimerRef.current = setTimeout(() => {
      diceRef.current?.clear();
      setIsDiceFading(false);
    }, 550);
  };

  const abilityEntries = useMemo(() => {
    return Object.entries(abilityMeta).map(([key, meta]) => {
      const stat = stats[key];
      const mod = modifierForScore(stat);
      return {
        key,
        label: meta.label,
        full: meta.full,
        score: stat,
        mod,
      };
    });
  }, [stats]);

  const rollAbility = (abilityKey, rollName = abilityMeta[abilityKey].full) => {
    const mod = modifierForScore(stats[abilityKey]);
    const roll = Math.floor(Math.random() * 20) + 1;
    setLastRoll(null);
    clearTimeout(diceCleanupTimerRef.current);
    setIsDiceFading(false);

    if (diceRef.current) {
      diceRef.current.roll("1d20").then((results) => {
        const result = results?.[0]?.value ?? roll;
        setLastRoll({
          name: rollName,
          roll: result,
          modifier: mod,
          total: result + mod,
        });
        scheduleDiceCleanup();
      });
    } else {
      setLastRoll({
        name: rollName,
        roll,
        modifier: mod,
        total: roll + mod,
      });
    }
  };

  const rollInitiative = () => {
    const roll = Math.floor(Math.random() * 20) + 1;
    setLastRoll(null);
    clearTimeout(diceCleanupTimerRef.current);
    setIsDiceFading(false);

    if (diceRef.current) {
      diceRef.current.roll("1d20").then((results) => {
        const result = results?.[0]?.value ?? roll;
        setLastRoll({
          name: "Initiative",
          roll: result,
          modifier: initiative,
          total: result + initiative,
        });
        scheduleDiceCleanup();
      });
    } else {
      setLastRoll({
        name: "Initiative",
        roll,
        modifier: initiative,
        total: roll + initiative,
      });
    }
  };

  const updateStat = (key, nextValue) => {
    const value = Number.isNaN(Number(nextValue)) ? 1 : Number(nextValue);
    setStats((current) => ({
      ...current,
      [key]: Math.min(30, Math.max(1, value)),
    }));
  };

  return (
    <div className="character-sheet-page">
      <div className="App-header statblock-page-header">
        <button className="menu-btn" onClick={() => setPage("token-stamp")}>
          <FontAwesomeIcon icon={faArrowLeft} /> Token Stamp
        </button>
        <div className="title">
          <h1>Character Sheet</h1>
        </div>
        <button
          className="menu-btn"
          onClick={() => setPage("initiative-tracker")}
        >
          <FontAwesomeIcon icon={faArrowRight} /> Initiative Tracker
        </button>
      </div>

      <div className="App-body">
        <div className="character-sheet">
          <section className="character-top-row">
            <div className="character-ident">
              <div className="character-image">
                <img alt="Dikke bilal" src="/images/default-avatar.png" />
              </div>
              <div>
                <div className="character-name">Dikke Bilal</div>
                <div className="character-subline">
                  Human · Fighter · Level 1
                </div>
              </div>
            </div>

            <div className="character-actions">
              <button className="sheet-button">Short Rest</button>
              <button className="sheet-button">Long Rest</button>
              <button className="sheet-button">Edit Sheet</button>
            </div>
          </section>

          <section className="character-stats-row">
            <div className="ability-stack">
              {abilityEntries.map((ability) => (
                <div className="ability-card" key={ability.key}>
                  <div className="ability-label">{ability.full}</div>
                  <button
                    className="ability-modifier"
                    type="button"
                    onClick={() => rollAbility(ability.key)}
                  >
                    {sign(ability.mod)}
                  </button>
                  <input
                    className="ability-override"
                    type="number"
                    min="1"
                    max="30"
                    value={ability.score}
                    onChange={(e) => updateStat(ability.key, e.target.value)}
                  />
                </div>
              ))}
            </div>

            <div className="core-info-strip">
              <div className="core-info-block">
                <div className="core-label">Proficiency</div>
                <div className="core-value stat-shape proficiency-shape">
                  {sign(proficiencyBonus)}
                </div>
              </div>
              <div className="core-info-block">
                <div className="core-label">Speed</div>
                <div className="core-value stat-shape speed-shape">
                  {speed} ft
                </div>
              </div>
              <div className="core-info-block">
                <div className="core-label">Hero Points</div>
                <div className="core-value hp-controls">
                  <button
                    type="button"
                    onClick={() => setHeroPoints(heroPoints - 1)}
                  >
                    <FontAwesomeIcon icon={faMinus} />
                  </button>
                  <span className="hp-number">{heroPoints}</span>
                  <button
                    type="button"
                    onClick={() => setHeroPoints(heroPoints + 1)}
                  >
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                </div>
              </div>
              <div className="core-info-block">
                <div className="core-label">Initiative</div>
                <button
                  type="button"
                  className="initiative-button"
                  onClick={rollInitiative}
                >
                  {sign(initiative)}
                </button>
              </div>
              <div className="core-info-block">
                <div className="core-label">Armor Class</div>
                <div className="core-value stat-shape armor-shape">{ac}</div>
              </div>
              <div className="core-info-block">
                <div className="core-label">HP</div>
                <div className="core-value hp-controls">
                  <input
                    className="hp-current"
                    type="number"
                    value={hp}
                    onChange={(e) => setHp(Number(e.target.value))}
                  />
                  <span>/</span>
                  <input
                    className="hp-max"
                    type="number"
                    value={maxHp}
                    readOnly
                    aria-label="Maximum hit points"
                  />
                  <button
                    type="button"
                    onClick={() => setHp(hp - hpChange)}
                    aria-label="Decrease hit points"
                  >
                    <FontAwesomeIcon icon={faMinus} />
                  </button>
                  <input
                    className="hp-change"
                    type="number"
                    min="1"
                    value={hpChange}
                    onChange={(e) =>
                      setHpChange(Math.max(1, Number(e.target.value) || 1))
                    }
                    aria-label="Hit point change amount"
                  />
                  <button
                    type="button"
                    onClick={() => setHp(hp + hpChange)}
                    aria-label="Increase hit points"
                  >
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="character-lower-grid">
            <section className="sheet-column">
              <h3>Saving Throws</h3>
              <div className="saving-grid">
                {savingThrows.map((item) => (
                  <div className="save-row" key={item.label}>
                    <button
                      className="skill-mod save-roll-button"
                      type="button"
                      onClick={() =>
                        rollAbility(item.ability, `${item.label} save`)
                      }
                      aria-label={`Roll ${item.label} save`}
                    >
                      {sign(modifierForScore(stats[item.ability]))}
                    </button>
                    <span
                      className="save-proc skill-proficiency"
                      aria-hidden="true"
                    ></span>
                    <span className="save-label">{item.label}</span>
                  </div>
                ))}
              </div>

              <h3>Senses</h3>
              <div className="senses-list">
                <span>Passive Perception 10</span>
              </div>

              <h3>Proficiencies</h3>
              <div className="proficiency-list">
                <span>Simple weapons</span>
              </div>
            </section>

            <section className="sheet-column skills">
              <h3>Skills</h3>
              <div className="skill-list">
                {skillRows.map((row) => (
                  <div className="skill-row" key={row.name}>
                    <span
                      className={`skill-proficiency ${row.prof ? "active" : ""}`}
                    ></span>
                    <span className="skill-ability">{row.ability}</span>
                    <span className="skill-name">{row.name}</span>
                    <button
                      className="skill-mod"
                      type="button"
                      onClick={() => rollAbility(row.ability, row.name)}
                    >
                      {sign(modifierForScore(stats[row.ability]))}
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="tabs-block">
              <div className="tabs-heading">
                {[
                  ["actions", "Actions"],
                  ["spells", "Spells"],
                  ["features", "Features"],
                  ["inventory", "Inventory"],
                  ["extra", "Extra"],
                ].map(([key, label]) => (
                  <button
                    className={`tab-button ${activeTab === key ? "active" : ""}`}
                    key={key}
                    type="button"
                    onClick={() => setActiveTab(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="tab-content">
                {activeTab === "actions" && (
                  <ul>
                    <li>Attack: Longsword</li>
                    <li>Second Wind</li>
                  </ul>
                )}
                {activeTab === "spells" && (
                  <ul>
                    <li>No prepared spells</li>
                  </ul>
                )}
                {activeTab === "features" && (
                  <ul>
                    <li>Fighting Style: Defense</li>
                    <li>Second Wind</li>
                  </ul>
                )}
                {activeTab === "inventory" && (
                  <ul>
                    <li>Longsword</li>
                    <li>Shield</li>
                    <li>Explorer’s pack</li>
                  </ul>
                )}
                {activeTab === "extra" && (
                  <ul>
                    <li>Human</li>
                    <li>Level 1 Fighter</li>
                    <li>Background: Outlander</li>
                  </ul>
                )}
              </div>
            </section>
          </section>

          <div className={`dicebox-overlay ${isDiceFading ? "fading" : ""}`}>
            <div id="dice-box-char" />
          </div>
          {lastRoll && (
            <div className="roll-result" role="status">
              <span className="roll-result-name">{lastRoll.name}</span>
              <strong>{lastRoll.total}</strong>
              <span>
                {lastRoll.roll} {sign(lastRoll.modifier)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
