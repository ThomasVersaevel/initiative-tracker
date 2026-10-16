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
  const features = [
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
      character.species && `Race: ${character.species}`,
      character.className &&
        `Level ${character.classLevel || 1} ${character.className}`,
      character.background && `Background: ${character.background}`,
      character.speciesLanguages &&
        `Languages: ${character.speciesLanguages}`,
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
