import React, { useEffect, useMemo, useRef, useState } from "react";
import DiceBox from "@3d-dice/dice-box";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faDiceD20,
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
  { label: "STR", ability: "str", physical: true },
  { label: "DEX", ability: "dex", physical: true },
  { label: "CON", ability: "con", physical: true },
  { label: "INT", ability: "int", mental: true },
  { label: "WIS", ability: "wis", mental: true },
  { label: "CHA", ability: "cha", mental: true },
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
  const [maxHp, setMaxHp] = useState(10);
  const [ac] = useState(10);
  const [initiative] = useState(0);
  const [speed] = useState(30);
  const [proficiencyBonus] = useState(2);
  const [activeTab, setActiveTab] = useState("actions");
  const [lastRoll, setLastRoll] = useState(null);
  const diceRef = useRef(null);

  useEffect(() => {
    if (!diceRef.current) {
      const dice = new DiceBox("#dice-box-char", {
        id: "charsheet-dice",
        assetPath: "/assets/dice-box/",
        themeColor: "#2bbfff",
        scale: 5,
        startingHeight: 4,
        throwForce: 4,
        spinForce: 5,
        lightIntensity: 1.0,
      });

      dice
        .init()
        .then(() => {
          diceRef.current = dice;
        })
        .catch(() => {
          // no-op if dice library cannot initialize here
        });
    }
  }, []);

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

    if (diceRef.current) {
      diceRef.current.roll("1d20").then((results) => {
        const result = results?.[0]?.value ?? roll;
        setLastRoll({
          name: rollName,
          roll: result,
          modifier: mod,
          total: result + mod,
        });
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

    if (diceRef.current) {
      diceRef.current.roll("1d20").then((results) => {
        const result = results?.[0]?.value ?? roll;
        setLastRoll({
          name: "Initiative",
          roll: result,
          modifier: initiative,
          total: result + initiative,
        });
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
    setStats((current) => ({ ...current, [key]: Math.min(30, Math.max(1, value)) }));
  };

  return (
    <div className="character-sheet-page">
      <div className="App-header">
        <button className="menu-btn" onClick={() => setPage("initiative-tracker")}>
          <FontAwesomeIcon icon={faArrowLeft} /> Initiative Tracker
        </button>

        <button className="menu-btn" onClick={() => setPage("token-stamp")}>
          Token Stamp <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>

      <div className="App-body">
        <div className="character-sheet">
          <section className="character-top-row">
            <div className="character-ident">
              <div className="character-image">
                <img alt="Astra" src="/images/default-avatar.png" />
              </div>
              <div>
                <div className="character-name">Astra</div>
                <div className="character-subline">Human · Fighter · Level 1</div>
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
                  <div className="ability-label">{ability.label}</div>
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
                <div className="core-value">{sign(proficiencyBonus)}</div>
              </div>
              <div className="core-info-block">
                <div className="core-label">Speed</div>
                <div className="core-value">{speed} ft</div>
              </div>
              <div className="core-info-block">
                <div className="core-label">Hero Points</div>
                <div className="core-value hp-controls">
                  <button type="button" onClick={() => setHeroPoints(heroPoints - 1)}>
                    <FontAwesomeIcon icon={faMinus} />
                  </button>
                  <span className="hp-number">{heroPoints}</span>
                  <button type="button" onClick={() => setHeroPoints(heroPoints + 1)}>
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                </div>
              </div>
              <div className="core-info-block">
                <div className="core-label">Initiative</div>
                <button type="button" className="initiative-button" onClick={rollInitiative}>
                  <FontAwesomeIcon icon={faDiceD20} /> {sign(initiative)}
                </button>
              </div>
              <div className="core-info-block">
                <div className="core-label">Armor Class</div>
                <div className="core-value">{ac}</div>
              </div>
              <div className="core-info-block">
                <div className="core-label">HP</div>
                <div className="core-value hp-controls">
                  <input type="number" value={hp} onChange={(e) => setHp(Number(e.target.value))} />
                  <span>/</span>
                  <input type="number" value={maxHp} onChange={(e) => setMaxHp(Number(e.target.value))} />
                  <div className="hp-updown">
                    <button type="button" onClick={() => setHp(hp + 1)}><FontAwesomeIcon icon={faPlus} /></button>
                    <button type="button" onClick={() => setHp(hp - 1)}><FontAwesomeIcon icon={faMinus} /></button>
                  </div>
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
                      className="save-dice-button"
                      type="button"
                      onClick={() => rollAbility(item.ability, `${item.label} save`)}
                      aria-label={`Roll ${item.label} save`}
                    >
                      <FontAwesomeIcon icon={faDiceD20} />
                    </button>
                    <span className="save-proc">○</span>
                    <span className="save-label">{item.label}</span>
                    <span className="save-mod">{sign(modifierForScore(stats[item.ability]))}</span>
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
                    <span className={`skill-proficiency ${row.prof ? "active" : ""}`}></span>
                    <span className="skill-ability">{row.ability}</span>
                    <span className="skill-name">{row.name}</span>
                    <button className="skill-mod" type="button" onClick={() => rollAbility(row.ability, row.name)}>
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

          <div className="dicebox-overlay">
            <div id="dice-box-char" />
          </div>
          {lastRoll && (
            <div className="roll-result" role="status">
              <span className="roll-result-name">{lastRoll.name}</span>
              <strong>{lastRoll.total}</strong>
              <span>{lastRoll.roll} {sign(lastRoll.modifier)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
