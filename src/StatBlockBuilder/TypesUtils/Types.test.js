import {
  formatResistanceEntry,
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
});
