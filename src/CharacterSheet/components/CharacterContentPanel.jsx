import React, { useState } from "react";

const tabs = [
  ["actions", "Actions"],
  ["spells", "Spells"],
  ["features", "Features"],
  ["inventory", "Inventory"],
  ["extra", "Extra"],
];

export default function CharacterContentPanel({ character }) {
  const [activeTab, setActiveTab] = useState("actions");
  const classSnapshot = character.classSnapshot;
  const className = classSnapshot?.class?.name ?? character.className;
  const subclassName = classSnapshot?.subclass?.name ?? character.subclass;
  const speciesSnapshot = character.speciesSnapshot;
  const speciesName = speciesSnapshot?.species?.name ?? character.species;
  const features = [
    ...(classSnapshot?.features ?? []).map(
      (feature) =>
        `Level ${feature.level}: ${feature.name} (${feature.source}) - ${feature.description}`,
    ),
    ...(speciesSnapshot?.features ?? []).map((feature) => {
      const choices = Object.values(feature.choices ?? {}).filter(Boolean);
      return `Species: ${feature.name} - ${feature.description}${
        choices.length ? ` (Chosen: ${choices.join(", ")})` : ""
      }`;
    }),
    character.classFeatures,
    character.speciesNotes,
    character.backgroundNotes,
  ]
    .filter(Boolean)
    .flatMap((section) => section.split(/\n+/).map((line) => line.trim()))
    .filter(Boolean);
  const content = {
    actions: features,
    spells: [],
    features,
    inventory: (character.equipment ?? []).map(
      (item) => `${item.name} × ${item.quantity}`,
    ),
    extra: [
      speciesName && `Species: ${speciesName}`,
      speciesSnapshot?.species?.creatureType &&
        `Creature type: ${speciesSnapshot.species.creatureType}`,
      character.speciesSize && `Size: ${character.speciesSize}`,
      className &&
        `Level ${character.classLevel || 1} ${className}${
          subclassName ? ` (${subclassName})` : ""
        }`,
      classSnapshot?.ruleset?.name &&
        `Ruleset: ${classSnapshot.ruleset.name}`,
      classSnapshot?.class?.hitDie &&
        `Hit Die: d${classSnapshot.class.hitDie}`,
      classSnapshot?.class?.primaryAbilities?.length &&
        `Primary abilities: ${classSnapshot.class.primaryAbilities.join(", ")}`,
      classSnapshot?.class?.savingThrowProficiencies?.length &&
        `Saving throw proficiencies: ${classSnapshot.class.savingThrowProficiencies.join(", ")}`,
      classSnapshot?.class?.startingEquipment?.description &&
        `Starting equipment: ${classSnapshot.class.startingEquipment.description}`,
      classSnapshot?.subclass?.description &&
        `Subclass details: ${classSnapshot.subclass.description}`,
      character.background && `Background: ${character.background}`,
      (character.speciesLanguages ||
        speciesSnapshot?.species?.languages?.join(", ")) &&
        `Languages: ${
          character.speciesLanguages ||
          speciesSnapshot.species.languages.join(", ")
        }`,
      character.notes,
    ].filter(Boolean),
  };
  const items = content[activeTab];

  return (
    <section className="tabs-block">
      <div className="tabs-heading">
        {tabs.map(([key, label]) => (
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
        {items.length ? (
          <ul>
            {items.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="character-content-empty">
            {activeTab === "spells"
              ? "No spells recorded."
              : "No details recorded yet."}
          </p>
        )}
      </div>
    </section>
  );
}
