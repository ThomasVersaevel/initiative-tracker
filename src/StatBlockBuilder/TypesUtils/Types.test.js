import {
  formatResistanceEntry,
  formatMultiattackDescription,
  getTraitResistanceGroups,
  normalizeTraitResistances,
} from "./Types";

describe("trait resistance normalization", () => {
  test("legacy string resistances normalize into resistance entries", () => {
    expect(normalizeTraitResistances(["fire", "acid"])).toEqual([
      { damageType: "fire", relation: "resistance" },
      { damageType: "acid", relation: "resistance" },
    ]);
  });

  test("formatResistanceEntry labels immunity and vulnerability readably", () => {
    expect(formatResistanceEntry({ damageType: "fire", relation: "immunity" })).toBe(
      "Immunity: fire",
    );
    expect(formatResistanceEntry({ damageType: "acid", relation: "vulnerability" })).toBe(
      "Vulnerability: acid",
    );
  });

  test("groups selected damage types by relation", () => {
    expect(
      getTraitResistanceGroups([
        "cold",
        { damageType: "fire", relation: "immunity" },
        { damageType: "acid", relation: "vulnerability" },
      ]),
    ).toEqual([
      { relation: "resistance", label: "Resistances", damageTypes: ["cold"] },
      { relation: "immunity", label: "Immunities", damageTypes: ["fire"] },
      {
        relation: "vulnerability",
        label: "Vulnerabilities",
        damageTypes: ["acid"],
      },
    ]);
  });
});

describe("multiattack description formatting", () => {
  test("replaces the creature name and attack-count placeholders", () => {
    expect(
      formatMultiattackDescription(
        "The <name> makes # attacks in any combination.",
        "Hydra",
        5,
      ),
    ).toBe("The Hydra makes 5 attacks in any combination.");
  });

  test("uses the default prose when a saved description is missing", () => {
    expect(formatMultiattackDescription(undefined, "Hydra", 3)).toBe(
      "The Hydra makes 3 attacks in any combination.",
    );
  });
});
