import React, { useMemo, useState } from "react";
import "./CharacterSheetEditor.css";

const tabs = ["Basic", "Class", "Race", "Background", "Abilities", "Extra"];
const abilities = [
  ["str", "Strength"],
  ["dex", "Dexterity"],
  ["con", "Constitution"],
  ["int", "Intelligence"],
  ["wis", "Wisdom"],
  ["cha", "Charisma"],
];
const skills = [
  "Acrobatics", "Animal Handling", "Arcana", "Athletics", "Deception",
  "History", "Insight", "Intimidation", "Investigation", "Medicine",
  "Nature", "Perception", "Performance", "Persuasion", "Religion",
  "Sleight of Hand", "Stealth", "Survival",
];

const classes = {
  Artificer: { skillCount: 2, equipment: ["Choose artisan's tools", "Choose a simple weapon", "Explorer's pack"] },
  Barbarian: { skillCount: 2, equipment: ["Choose a martial melee weapon", "Two handaxes", "Explorer's pack"] },
  Bard: { skillCount: 3, equipment: ["Choose a musical instrument", "Leather armor", "Dagger"] },
  Cleric: { skillCount: 2, equipment: ["Choose a simple weapon", "Shield", "Holy symbol"] },
  Druid: { skillCount: 2, equipment: ["Wooden shield", "Druidic focus", "Explorer's pack"] },
  Fighter: { skillCount: 2, equipment: ["Choose a martial weapon", "Shield", "Explorer's pack"] },
  Monk: { skillCount: 2, equipment: ["Choose a simple weapon", "Dungeoneer's pack", "10 darts"] },
  Paladin: { skillCount: 2, equipment: ["Choose a martial weapon", "Shield", "Holy symbol"] },
  Ranger: { skillCount: 3, equipment: ["Choose a martial weapon", "Choose two simple weapons", "Explorer's pack"] },
  Rogue: { skillCount: 4, equipment: ["Choose a rapier or shortsword", "Shortbow and arrows", "Burglar's pack"] },
  Sorcerer: { skillCount: 2, equipment: ["Choose a simple weapon", "Arcane focus", "Explorer's pack"] },
  Warlock: { skillCount: 2, equipment: ["Choose a simple weapon", "Arcane focus", "Scholar's pack"] },
  Wizard: { skillCount: 2, equipment: ["Choose a simple weapon", "Spellbook", "Scholar's pack"] },
};

const backgrounds = {
  Acolyte: { skills: ["Insight", "Religion"], equipment: ["Holy symbol", "Prayer book", "Common clothes"] },
  Artisan: { skills: ["Investigation", "Persuasion"], equipment: ["Artisan's tools", "Common clothes"] },
  Criminal: { skills: ["Sleight of Hand", "Stealth"], equipment: ["Crowbar", "Dark common clothes"] },
  Entertainer: { skills: ["Acrobatics", "Performance"], equipment: ["Musical instrument", "Costume"] },
  Farmer: { skills: ["Animal Handling", "Nature"], equipment: ["Sickle", "Healer's kit", "Common clothes"] },
  Guard: { skills: ["Athletics", "Perception"], equipment: ["Spear", "Gaming set", "Uniform"] },
  Guide: { skills: ["Stealth", "Survival"], equipment: ["Shortbow", "Arrows", "Traveler's clothes"] },
  Hermit: { skills: ["Medicine", "Religion"], equipment: ["Herbalism kit", "Book", "Common clothes"] },
  Noble: { skills: ["History", "Persuasion"], equipment: ["Fine clothes", "Signet ring"] },
  Sage: { skills: ["Arcana", "History"], equipment: ["Book", "Ink", "Common clothes"] },
  Sailor: { skills: ["Acrobatics", "Perception"], equipment: ["Rope", "Traveler's clothes"] },
  Soldier: { skills: ["Athletics", "Intimidation"], equipment: ["Spear", "Gaming set", "Common clothes"] },
  Wayfarer: { skills: ["Insight", "Survival"], equipment: ["Bedroll", "Traveler's clothes"] },
};

const species = ["Aasimar", "Dragonborn", "Dwarf", "Elf", "Gnome", "Goliath", "Halfling", "Human", "Orc", "Tiefling"];
const standardArray = [15, 14, 13, 12, 10, 8];

function modifier(score) {
  return Math.floor((score - 10) / 2);
}

function pointCost(score) {
  if (score <= 8) return 0;
  if (score <= 13) return score - 8;
  return 5 + (score - 13) * 2;
}

function Field({ label, children, hint }) {
  return (
    <label className="editor-field">
      <span className="editor-field-label">{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}

function EquipmentPreview({ title, items }) {
  return (
    <section className="editor-preview">
      <h3>{title}</h3>
      {items?.length ? (
        <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
      ) : (
        <p>Select an option to preview its starting equipment.</p>
      )}
      <small>Equipment is added to the character from the Extra tab.</small>
    </section>
  );
}

export default function CharacterSheetEditor({ onBack }) {
  const [activeTab, setActiveTab] = useState("Basic");
  const [character, setCharacter] = useState({
    name: "",
    portrait: "",
    advancement: "milestone",
    className: "",
    classLevel: 1,
    subclass: "",
    classSkills: [],
    classProficiencies: "",
    classFeatures: "",
    species: "",
    speciesLineage: "",
    speciesSize: "Medium",
    speciesSpeed: 30,
    speciesLanguages: "",
    speciesNotes: "",
    speciesAbilityTwo: "",
    speciesAbilityOne: "",
    background: "",
    backgroundNotes: "",
    backgroundTools: "",
    backgroundLanguages: "",
    backgroundFeat: "",
    backgroundAbilityTwo: "",
    backgroundAbilityOne: "",
    abilityMethod: "standard",
    scores: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
    appearance: "",
    personality: "",
    ideals: "",
    bonds: "",
    flaws: "",
    backstory: "",
    allies: "",
    organizations: "",
    notes: "",
    equipment: [],
  });
  const [newItem, setNewItem] = useState("");

  const update = (field, value) => {
    setCharacter((current) => ({ ...current, [field]: value }));
  };
  const updateScore = (key, value) => {
    const nextScore = Number(value);
    if (character.abilityMethod === "point-buy") {
      const nextTotal = Object.entries(character.scores).reduce(
        (total, [scoreKey, score]) => total + pointCost(scoreKey === key ? nextScore : score),
        0,
      );
      if (nextTotal > 27) return;
    }
    setCharacter((current) => ({
      ...current,
      scores: { ...current.scores, [key]: nextScore },
    }));
  };

  const classEquipment = classes[character.className]?.equipment ?? [];
  const backgroundEquipment = backgrounds[character.background]?.equipment ?? [];
  const combinedEquipment = useMemo(
    () => [...classEquipment, ...backgroundEquipment],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [character.className, character.background],
  );
  const pointTotal = Object.values(character.scores).reduce(
    (total, score) => total + pointCost(score),
    0,
  );
  const selectedClass = classes[character.className];

  const toggleClassSkill = (skill) => {
    setCharacter((current) => {
      const selected = current.classSkills.includes(skill);
      if (!selected && current.classSkills.length >= (selectedClass?.skillCount ?? 0)) {
        return current;
      }
      return {
        ...current,
        classSkills: selected
          ? current.classSkills.filter((item) => item !== skill)
          : [...current.classSkills, skill],
      };
    });
  };

  const uploadPortrait = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update("portrait", String(reader.result));
    reader.readAsDataURL(file);
  };

  const addStartingEquipment = () => {
    const additions = combinedEquipment
      .filter((name) => !character.equipment.some((item) => item.name === name))
      .map((name) => ({
      id: `${Date.now()}-${Math.random()}`,
      name,
      quantity: 1,
      }));
    update("equipment", [...character.equipment, ...additions]);
  };

  const renderTab = () => {
    switch (activeTab) {
      case "Basic":
        return (
          <div className="editor-form-grid">
            <section className="editor-section">
              <h2>Character identity</h2>
              <Field label="Character name">
                <input value={character.name} onChange={(event) => update("name", event.target.value)} placeholder="Enter a name" />
              </Field>
              <Field label="Portrait" hint="Choose an image from your device.">
                <input type="file" accept="image/*" onChange={uploadPortrait} />
              </Field>
              {character.portrait && <img className="editor-portrait-preview" src={character.portrait} alt="Character portrait preview" />}
            </section>
            <section className="editor-section">
              <h2>Advancement</h2>
              <Field label="Advancement method" hint="Choose experience points or milestone leveling.">
                <select value={character.advancement} onChange={(event) => update("advancement", event.target.value)}>
                  <option value="milestone">Milestone leveling</option>
                  <option value="xp">Experience points (XP)</option>
                </select>
              </Field>
            </section>
          </div>
        );
      case "Class":
        return (
          <div className="editor-form-grid">
            <section className="editor-section">
              <h2>Class</h2>
              <Field label="Class">
                <select value={character.className} onChange={(event) => setCharacter((current) => ({ ...current, className: event.target.value, classSkills: [] }))}>
                  <option value="">Choose a class</option>
                  {Object.keys(classes).map((name) => <option key={name}>{name}</option>)}
                </select>
              </Field>
              <Field label="Class level">
                <input type="number" min="1" max="20" value={character.classLevel} onWheel={(event) => event.currentTarget.blur()} onChange={(event) => update("classLevel", Math.min(20, Math.max(1, Number(event.target.value) || 1)))} />
              </Field>
              <Field label="Subclass">
                <input value={character.subclass} onChange={(event) => update("subclass", event.target.value)} placeholder="Choose when available" />
              </Field>
              <Field label="Class proficiencies" hint="Armor, weapons, tools, or other class-granted proficiencies.">
                <textarea rows="3" value={character.classProficiencies} onChange={(event) => update("classProficiencies", event.target.value)} />
              </Field>
              <h3 className="editor-subheading">Skill proficiencies</h3>
              <p className="editor-hint">Choose {selectedClass?.skillCount ?? 0} skills ({character.classSkills.length} selected).</p>
              <div className="editor-check-grid">
                {skills.map((skill) => (
                  <label key={skill} className="editor-check">
                    <input type="checkbox" checked={character.classSkills.includes(skill)} disabled={!selectedClass || (!character.classSkills.includes(skill) && character.classSkills.length >= selectedClass.skillCount)} onChange={() => toggleClassSkill(skill)} />
                    {skill}
                  </label>
                ))}
              </div>
              <Field label="Class features and choices">
                <textarea rows="4" value={character.classFeatures} onChange={(event) => update("classFeatures", event.target.value)} placeholder="Record class features and level-based choices" />
              </Field>
            </section>
            <EquipmentPreview title="Class starting equipment" items={classEquipment} />
          </div>
        );
      case "Race":
        return (
          <div className="editor-form-grid">
            <section className="editor-section">
              <h2>Race</h2>
              <Field label="Race">
                <select value={character.species} onChange={(event) => update("species", event.target.value)}>
                  <option value="">Choose a race</option>
                  {species.map((item) => <option key={item}>{item}</option>)}
                </select>
              </Field>
              <Field label="Lineage or subrace">
                <input value={character.speciesLineage} onChange={(event) => update("speciesLineage", event.target.value)} />
              </Field>
              <div className="editor-inline-fields">
                <Field label="Size">
                  <select value={character.speciesSize} onChange={(event) => update("speciesSize", event.target.value)}>
                    {["Small", "Medium", "Large", "Other"].map((size) => <option key={size}>{size}</option>)}
                  </select>
                </Field>
                <Field label="Speed (ft.)">
                  <input type="number" min="0" value={character.speciesSpeed} onWheel={(event) => event.currentTarget.blur()} onChange={(event) => update("speciesSpeed", Math.max(0, Number(event.target.value) || 0))} />
                </Field>
              </div>
              <Field label="Languages">
                <input value={character.speciesLanguages} onChange={(event) => update("speciesLanguages", event.target.value)} placeholder="Languages known" />
              </Field>
              <div className="editor-inline-fields">
                <Field label="Race score increase (+2)">
                  <select value={character.speciesAbilityTwo} onChange={(event) => update("speciesAbilityTwo", event.target.value)}>
                    <option value="">None</option>
                    {abilities.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                  </select>
                </Field>
                <Field label="Race score increase (+1)">
                  <select value={character.speciesAbilityOne} onChange={(event) => update("speciesAbilityOne", event.target.value)}>
                    <option value="">None</option>
                    {abilities.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Traits and other choices" hint="Record racial traits or additional choices.">
                <textarea rows="5" value={character.speciesNotes} onChange={(event) => update("speciesNotes", event.target.value)} placeholder="Traits, languages, or other choices" />
              </Field>
            </section>
            <section className="editor-section editor-note-panel">
              <h2>{character.species || "Race"} details</h2>
              <p>Race-specific traits and choices can be recorded here, separate from class and background selections.</p>
            </section>
          </div>
        );
      case "Background": {
        const background = backgrounds[character.background];
        return (
          <div className="editor-form-grid">
            <section className="editor-section">
              <h2>Background</h2>
              <Field label="Background">
                <select value={character.background} onChange={(event) => update("background", event.target.value)}>
                  <option value="">Choose a background</option>
                  {Object.keys(backgrounds).map((name) => <option key={name}>{name}</option>)}
                </select>
              </Field>
              {background && <>
                <h3 className="editor-subheading">Skill proficiencies</h3>
                <p>{background.skills.join(", ")}</p>
                <Field label="Tool proficiencies">
                  <input value={character.backgroundTools} onChange={(event) => update("backgroundTools", event.target.value)} />
                </Field>
                <Field label="Languages">
                  <input value={character.backgroundLanguages} onChange={(event) => update("backgroundLanguages", event.target.value)} />
                </Field>
                <div className="editor-inline-fields">
                  <Field label="Background score increase (+2)">
                    <select value={character.backgroundAbilityTwo} onChange={(event) => update("backgroundAbilityTwo", event.target.value)}>
                      <option value="">None</option>
                      {abilities.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                    </select>
                  </Field>
                  <Field label="Background score increase (+1)">
                    <select value={character.backgroundAbilityOne} onChange={(event) => update("backgroundAbilityOne", event.target.value)}>
                      <option value="">None</option>
                      {abilities.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label="Origin feat">
                  <input value={character.backgroundFeat} onChange={(event) => update("backgroundFeat", event.target.value)} />
                </Field>
                <h3 className="editor-subheading">Background feature</h3>
                <Field label="Feature or notes">
                  <textarea rows="4" value={character.backgroundNotes} onChange={(event) => update("backgroundNotes", event.target.value)} placeholder="Add the background feature or other details" />
                </Field>
              </>}
            </section>
            <EquipmentPreview title="Background starting equipment" items={backgroundEquipment} />
          </div>
        );
      }
      case "Abilities":
        return (
          <section className="editor-section">
            <div className="editor-ability-heading">
              <div>
                <h2>Ability scores</h2>
                <p>Choose a method, then set the six scores.</p>
              </div>
              <Field label="Score method">
                <select value={character.abilityMethod} onChange={(event) => update("abilityMethod", event.target.value)}>
                  <option value="standard">Standard array</option>
                  <option value="point-buy">Point buy</option>
                  <option value="manual">Manual entry</option>
                </select>
              </Field>
            </div>
            {character.abilityMethod === "point-buy" && (
              <p className={`editor-points ${pointTotal > 27 ? "over-budget" : ""}`}>Point buy: {pointTotal} / 27 points</p>
            )}
            <div className="editor-ability-grid">
              {abilities.map(([key, label]) => {
                const usedScores = abilities
                  .filter(([otherKey]) => otherKey !== key)
                  .map(([otherKey]) => character.scores[otherKey]);
                const scoreBonus = Number(character.speciesAbilityTwo === key) * 2
                  + Number(character.speciesAbilityOne === key)
                  + Number(character.backgroundAbilityTwo === key) * 2
                  + Number(character.backgroundAbilityOne === key);
                const finalScore = character.scores[key] + scoreBonus;
                return (
                  <div className="editor-ability" key={key}>
                    <label htmlFor={`score-${key}`}>{label}</label>
                    {character.abilityMethod === "standard" ? (
                      <select id={`score-${key}`} value={character.scores[key]} onChange={(event) => updateScore(key, event.target.value)}>
                        {standardArray.map((score) => <option key={score} value={score} disabled={usedScores.includes(score)}>{score}</option>)}
                      </select>
                    ) : (
                      <input id={`score-${key}`} type="number" min={character.abilityMethod === "point-buy" ? 8 : 1} max={character.abilityMethod === "point-buy" ? 15 : 30} value={character.scores[key]} onWheel={(event) => event.currentTarget.blur()} onChange={(event) => updateScore(key, Math.min(character.abilityMethod === "point-buy" ? 15 : 30, Math.max(character.abilityMethod === "point-buy" ? 8 : 1, Number(event.target.value) || 1)))} />
                    )}
                    <span className="editor-adjusted-score">Final {finalScore}</span>
                    <strong>{modifier(finalScore) >= 0 ? "+" : ""}{modifier(finalScore)}</strong>
                  </div>
                );
              })}
            </div>
            {character.abilityMethod === "point-buy" && pointTotal > 27 && <p className="editor-error" role="alert">Reduce scores to stay within the 27-point budget.</p>}
          </section>
        );
      case "Extra":
        return (
          <div className="editor-form-grid">
            <section className="editor-section">
              <h2>Character details</h2>
              {[["appearance", "Appearance"], ["personality", "Personality traits"], ["ideals", "Ideals"], ["bonds", "Bonds"], ["flaws", "Flaws"], ["backstory", "Backstory"], ["allies", "Allies"], ["organizations", "Organizations"], ["notes", "Notes"]].map(([key, label]) => (
                <Field key={key} label={label}>
                  <textarea rows={key === "backstory" || key === "notes" ? 4 : 2} value={character[key]} onChange={(event) => update(key, event.target.value)} />
                </Field>
              ))}
            </section>
            <section className="editor-section">
              <h2>Equipment</h2>
              <p className="editor-hint">Starting equipment is previewed in Class and Background, and added here.</p>
              <div className="editor-preview-list">
                <h3>Class and background equipment</h3>
                {combinedEquipment.length ? <ul>{combinedEquipment.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul> : <p>Select a class or background to preview equipment.</p>}
                <button className="editor-button" type="button" onClick={addStartingEquipment} disabled={!combinedEquipment.length}>Add starting equipment</button>
              </div>
              <form className="editor-add-item" onSubmit={(event) => {
                event.preventDefault();
                if (!newItem.trim()) return;
                update("equipment", [...character.equipment, { id: `${Date.now()}-${Math.random()}`, name: newItem.trim(), quantity: 1 }]);
                setNewItem("");
              }}>
                <Field label="Add an item">
                  <input value={newItem} onChange={(event) => setNewItem(event.target.value)} placeholder="Item name" />
                </Field>
                <button className="editor-button secondary" type="submit" disabled={!newItem.trim()}>Add item</button>
              </form>
              <ul className="editor-inventory">
                {character.equipment.map((item) => (
                  <li key={item.id}>
                    <span>{item.name}</span>
                    <label>Qty <input type="number" min="1" value={item.quantity} onWheel={(event) => event.currentTarget.blur()} onChange={(event) => update("equipment", character.equipment.map((current) => current.id === item.id ? { ...current, quantity: Math.max(1, Number(event.target.value) || 1) } : current))} /></label>
                    <button type="button" aria-label={`Remove ${item.name}`} onClick={() => update("equipment", character.equipment.filter((current) => current.id !== item.id))}>Remove</button>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main className="character-editor-page">
      <header className="character-editor-header">
        {onBack && <button className="editor-back-button" type="button" onClick={onBack}>Back</button>}
        <div>
          <p className="editor-eyebrow">Character Builder</p>
          <h1>{character.name || "New Character"}</h1>
        </div>
        <div className="editor-header-meta">{character.className ? `${character.className} · Level ${character.classLevel}` : "Draft"}</div>
      </header>
      <div className="character-editor-layout">
        <nav className="character-editor-tabs" aria-label="Character editor sections" role="tablist">
          {tabs.map((tab, index) => (
            <button key={tab} id={`editor-tab-${index}`} type="button" role="tab" aria-selected={activeTab === tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>
              <span className="editor-tab-number">0{index + 1}</span>{tab}
            </button>
          ))}
        </nav>
        <div className="character-editor-content" role="tabpanel" aria-labelledby={`editor-tab-${tabs.indexOf(activeTab)}`}>
          <div className="editor-content-heading">
            <span>SECTION {String(tabs.indexOf(activeTab) + 1).padStart(2, "0")}</span>
            <h2>{activeTab}</h2>
          </div>
          {renderTab()}
          <div className="editor-content-footer">
            <span>{activeTab} · {tabs.indexOf(activeTab) + 1} of {tabs.length}</span>
            <div>
              {tabs.indexOf(activeTab) > 0 && <button type="button" className="editor-button secondary" onClick={() => setActiveTab(tabs[tabs.indexOf(activeTab) - 1])}>Previous</button>}
              {tabs.indexOf(activeTab) < tabs.length - 1 && <button type="button" className="editor-button" onClick={() => setActiveTab(tabs[tabs.indexOf(activeTab) + 1])}>Next section</button>}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}