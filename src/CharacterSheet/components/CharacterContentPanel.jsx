import React, { useState } from "react";

const tabs = [
  ["actions", "Actions"],
  ["spells", "Spells"],
  ["features", "Features"],
  ["inventory", "Inventory"],
  ["extra", "Extra"],
];

const content = {
  actions: ["Attack: Longsword", "Second Wind"],
  spells: ["No prepared spells"],
  features: ["Fighting Style: Defense", "Second Wind"],
  inventory: ["Longsword", "Shield", "Explorer’s pack"],
  extra: ["Human", "Level 1 Fighter", "Background: Outlander"],
};

export default function CharacterContentPanel() {
  const [activeTab, setActiveTab] = useState("actions");

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
        <ul>
          {content[activeTab].map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
