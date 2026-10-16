import React, { useEffect, useMemo, useRef, useState } from "react";
import DiceBox from "@3d-dice/dice-box";
import { Header } from "../Header";
import AbilityScores from "./components/AbilityScores";
import CombatStatsBar from "./components/CombatStatsBar";
import SavingThrows from "./components/SavingThrows";
import Skills from "./components/Skills";
import CharacterContentPanel from "./components/CharacterContentPanel";
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

function statsFromCharacter(characterData = {}) {
  const baseScores = { ...initialStats, ...characterData.scores };
  const bonuses = [
    [characterData.speciesAbilityTwo, 2],
    [characterData.speciesAbilityOne, 1],
    [characterData.backgroundAbilityTwo, 2],
    [characterData.backgroundAbilityOne, 1],
  ];
  bonuses.forEach(([ability, amount]) => {
    if (ability && baseScores[ability] !== undefined) {
      baseScores[ability] += amount;
    }
  });
  return baseScores;
}

const backgroundSkillProficiencies = {
  Acolyte: ["Insight", "Religion"],
  Artisan: ["Investigation", "Persuasion"],
  Criminal: ["Sleight of Hand", "Stealth"],
  Entertainer: ["Acrobatics", "Performance"],
  Farmer: ["Animal Handling", "Nature"],
  Guard: ["Athletics", "Perception"],
  Guide: ["Stealth", "Survival"],
  Hermit: ["Medicine", "Religion"],
  Noble: ["History", "Persuasion"],
  Sage: ["Arcana", "History"],
  Sailor: ["Acrobatics", "Perception"],
  Soldier: ["Athletics", "Intimidation"],
  Wayfarer: ["Insight", "Survival"],
};

export default function CharacterSheet({
  setPage,
  character,
  isLoading,
  loadError,
}) {
  const characterData = character?.data ?? {};
  const [stats, setStats] = useState(() => statsFromCharacter(characterData));
  const [heroPoints, setHeroPoints] = useState(5);
  const [hp, setHp] = useState(10);
  const maxHp = 10;
  const [ac] = useState(10);
  const initiative = modifierForScore(stats.dex);
  const speed = characterData.speciesSpeed ?? 30;
  const proficiencyBonus = Math.min(
    6,
    2 + Math.floor(((characterData.classLevel || 1) - 1) / 4),
  );
  const [rollResults, setRollResults] = useState([]);
  const [isDiceFading, setIsDiceFading] = useState(false);
  const [rollError, setRollError] = useState("");
  const [hpChange, setHpChange] = useState(1);
  const diceRef = useRef(null);
  const diceCleanupTimerRef = useRef(null);
  const nextRollIdRef = useRef(0);
  const activeRollsRef = useRef(0);

  useEffect(() => {
    if (character) {
      setStats(statsFromCharacter(character.data));
    }
  }, [character]);

  useEffect(() => {
    if (!character || isLoading || loadError) return undefined;

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
  }, [character, isLoading, loadError]);

  useEffect(() => {
    return () => clearTimeout(diceCleanupTimerRef.current);
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
        modifierText: sign(mod),
      };
    });
  }, [stats]);

  const savingThrowEntries = savingThrows.map((item) => ({
    ...item,
    modifierText: sign(modifierForScore(stats[item.ability])),
  }));
  const proficientSkills = new Set([
    ...(characterData.classSkills ?? []),
    ...(backgroundSkillProficiencies[characterData.background] ?? []),
  ]);
  const skillEntries = skillRows.map((row) => ({
    ...row,
    prof: proficientSkills.has(row.name),
    modifierText: sign(
      modifierForScore(stats[row.ability]) +
        (proficientSkills.has(row.name) ? proficiencyBonus : 0),
    ),
  }));

  const rollDice = (name, modifier) => {
    const id = nextRollIdRef.current++;
    const fallbackRoll = Math.floor(Math.random() * 20) + 1;
    setRollResults((current) => [
      ...current,
      { id, name, roll: null, modifier, total: null, status: "rolling" },
    ]);
    setRollError("");
    clearTimeout(diceCleanupTimerRef.current);
    setIsDiceFading(false);

    const resolveRoll = (result) => {
      setRollResults((current) =>
        current.map((entry) =>
          entry.id === id
            ? {
                ...entry,
                roll: result,
                total: result + modifier,
                status: "resolved",
              }
            : entry,
        ),
      );
    };

    if (!diceRef.current) {
      resolveRoll(fallbackRoll);
      return;
    }

    activeRollsRef.current += 1;
    Promise.resolve()
      .then(() => diceRef.current.add("1d20"))
      .then((results) => {
        resolveRoll(results?.[0]?.value ?? fallbackRoll);
      })
      .catch((error) => {
        console.error("Unable to complete dice roll.", error);
        setRollError("A dice roll could not be completed.");
        setRollResults((current) =>
          current.map((entry) =>
            entry.id === id ? { ...entry, status: "failed" } : entry,
          ),
        );
      })
      .finally(() => {
        activeRollsRef.current -= 1;
        if (activeRollsRef.current === 0) {
          setIsDiceFading(true);
          diceCleanupTimerRef.current = setTimeout(() => {
            diceRef.current?.clear();
            setIsDiceFading(false);
          }, 550);
        }
      });
  };

  const rollAbility = (
    abilityKey,
    rollName = abilityMeta[abilityKey].full,
    isProficient = false,
  ) => {
    rollDice(
      rollName,
      modifierForScore(stats[abilityKey]) +
        (isProficient ? proficiencyBonus : 0),
    );
  };

  const rollInitiative = () => {
    rollDice("Initiative", initiative);
  };

  const updateStat = (key, nextValue) => {
    const value = Number.isNaN(Number(nextValue)) ? 1 : Number(nextValue);
    setStats((current) => ({
      ...current,
      [key]: Math.min(30, Math.max(1, value)),
    }));
  };

  if (isLoading) {
    return <div className="character-sheet-state">Loading character sheet…</div>;
  }

  if (loadError || !character) {
    return (
      <div className="character-sheet-state" role={loadError ? "alert" : undefined}>
        <p>{loadError || "Choose a saved character to view its sheet."}</p>
        <button type="button" className="sheet-button" onClick={() => setPage("characters")}>
          Back to Characters
        </button>
      </div>
    );
  }

  const characterDescription = [
    [characterData.species, characterData.speciesLineage].filter(Boolean).join(" "),
    characterData.className,
    `Level ${characterData.classLevel || 1}`,
  ].filter(Boolean);

  return (
    <div className="character-sheet-page">
      <Header
        title="Character Sheet"
        setPage={setPage}
        previousPage={{ page: "characters", label: "Characters" }}
        nextPage={{ page: "dice-studio", label: "Dice Studio" }}
        className="statblock-page-header"
      />

      <div className="App-body">
        <div className="character-sheet">
          <section className="character-top-row">
            <div className="character-ident">
              <div className="character-image">
                {characterData.portrait ? (
                  <img alt={`${character.name} portrait`} src={characterData.portrait} />
                ) : (
                  <span aria-hidden="true">
                    {(character.name || "?").trim().charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <div className="character-name">{character.name}</div>
                <div className="character-subline">
                  {characterDescription.join(" · ")}
                </div>
              </div>
            </div>

            <div className="character-actions">
              <button className="sheet-button">Short Rest</button>
              <button className="sheet-button">Long Rest</button>
              <button
                className="sheet-button edit-sheet-button"
                type="button"
                onClick={() => setPage("character-sheet-editor")}
              >
                Edit Sheet
              </button>
            </div>
          </section>

          <section className="character-stats-row">
            <AbilityScores
              abilities={abilityEntries}
              onRoll={rollAbility}
              onUpdate={updateStat}
            />
            <CombatStatsBar
              proficiencyBonus={proficiencyBonus}
              speed={speed}
              heroPoints={heroPoints}
              setHeroPoints={setHeroPoints}
              initiative={initiative}
              onRollInitiative={rollInitiative}
              ac={ac}
              hp={hp}
              setHp={setHp}
              maxHp={maxHp}
              hpChange={hpChange}
              setHpChange={setHpChange}
              formatModifier={sign}
            />
          </section>

          <section className="character-lower-grid">
            <section className="sheet-column">
              <SavingThrows rows={savingThrowEntries} onRoll={rollAbility} />
              <h3>Senses</h3>
              <div className="senses-list">
                <span>Passive Perception {10 + modifierForScore(stats.wis) + (proficientSkills.has("Perception") ? proficiencyBonus : 0)}</span>
                {characterData.speciesLanguages && <span>Languages: {characterData.speciesLanguages}</span>}
              </div>

              <h3>Proficiencies</h3>
              <div className="proficiency-list">
                {characterData.classProficiencies || "No proficiencies recorded"}
              </div>
            </section>

            <Skills rows={skillEntries} onRoll={rollAbility} />
            <CharacterContentPanel character={characterData} />
          </section>

          <div className={`dicebox-overlay ${isDiceFading ? "fading" : ""}`}>
            <div id="dice-box-char" />
          </div>
          <div className="roll-results">
            {rollResults.map((roll) => (
              <div className="roll-result" key={roll.id} role="status">
                <span className="roll-result-name">{roll.name}</span>
                {roll.status === "rolling" ? (
                  <span>Rolling...</span>
                ) : roll.status === "failed" ? (
                  <span>Roll failed</span>
                ) : (
                  <>
                    <strong>{roll.total}</strong>
                    <span>
                      {roll.roll} {sign(roll.modifier)}
                    </span>
                  </>
                )}
              </div>
            ))}
            {rollError && (
              <div className="roll-error" role="alert">
                {rollError}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
