import React, { useRef, useState } from "react";
import { Header } from "../Header";
import { ensureAnonymousSession, isSupabaseConfigured, supabase } from "../Supabase";
import "./CustomClassCreator.css";

const abilities = [
  ["str", "Strength"],
  ["dex", "Dexterity"],
  ["con", "Constitution"],
  ["int", "Intelligence"],
  ["wis", "Wisdom"],
  ["cha", "Charisma"],
];

const skills = [
  "Acrobatics",
  "Animal Handling",
  "Arcana",
  "Athletics",
  "Deception",
  "History",
  "Insight",
  "Intimidation",
  "Investigation",
  "Medicine",
  "Nature",
  "Perception",
  "Performance",
  "Persuasion",
  "Religion",
  "Sleight of Hand",
  "Stealth",
  "Survival",
];

const activationTimes = ["Action", "Bonus action", "Reaction", "Special"];

function emptyFeature(id, level) {
  return {
    id,
    name: "",
    description: "",
    level,
    type: "text",
    activationTime: "",
    specialActivation: "",
    skills: [],
    skillChoiceCount: 1,
    charges: 1,
    recharge: "long_rest",
    rechargeDetail: "",
    bonusTarget: "ability_score",
    bonusOption: "Strength",
    bonusScalers: [{ id: 0, mode: "fixed", amount: 1, ability: "Strength" }],
    isExpanded: false,
  };
}

function slugFromName(name) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${slug || "custom-class"}-${Date.now()}`;
}

function featureChoices(feature) {
  const choices = { type: feature.type };
  if (feature.activationTime) {
    choices.activationTime = feature.activationTime;
  }
  if (feature.activationTime === "Special" && feature.specialActivation.trim()) {
    choices.specialActivation = feature.specialActivation.trim();
  }
  if (feature.type === "skill_proficiency") {
    choices.skills = feature.skills;
    choices.choiceCount = Number(feature.skillChoiceCount);
  }
  if (feature.type === "resource") {
    choices.charges = Number(feature.charges);
    choices.recharge = feature.recharge;
    if (feature.recharge === "other" && feature.rechargeDetail.trim()) {
      choices.rechargeDetail = feature.rechargeDetail.trim();
    }
  }
  if (feature.type === "bonus") {
    choices.target = feature.bonusTarget;
    choices.option = feature.bonusOption;
    choices.scalers = feature.bonusScalers.map((scaler) =>
      scaler.mode === "fixed"
        ? { mode: scaler.mode, amount: Number(scaler.amount) }
        : { mode: scaler.mode, ability: scaler.ability },
    );
  }
  return choices;
}

export default function CustomClassCreator({ setPage }) {
  const [className, setClassName] = useState("");
  const [description, setDescription] = useState("");
  const [hitDie, setHitDie] = useState("8");
  const [primaryAbilities, setPrimaryAbilities] = useState([]);
  const [savingThrows, setSavingThrows] = useState([]);
  const [features, setFeatures] = useState([]);
  const [newFeatureLevel, setNewFeatureLevel] = useState("1");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState("");
  const [savedName, setSavedName] = useState("");
  const nextFeatureId = useRef(0);

  const toggleValue = (values, setValues, value) => {
    setValues((current) =>
      current.includes(value)
        ? current.filter((entry) => entry !== value)
        : [...current, value],
    );
  };

  const addFeature = () => {
    const id = nextFeatureId.current++;
    setFeatures((current) => [
      ...current.map((feature) => ({ ...feature, isExpanded: false })),
      { ...emptyFeature(id, Number(newFeatureLevel)), isExpanded: true },
    ]);
  };

  const updateFeature = (id, update) => {
    setFeatures((current) =>
      current.map((feature) =>
        feature.id === id ? { ...feature, ...update } : feature,
      ),
    );
  };

  const removeFeature = (id) => {
    setFeatures((current) => current.filter((feature) => feature.id !== id));
  };

  const saveClass = async (event) => {
    event.preventDefault();
    setError("");

    if (!className.trim()) {
      setError("Enter a name for this class.");
      return;
    }

    const invalidSkillFeature = features.find(
      (feature) =>
        feature.type === "skill_proficiency" &&
        (!feature.skills.length ||
          Number(feature.skillChoiceCount) < 1 ||
          Number(feature.skillChoiceCount) > feature.skills.length),
    );
    const invalidBonusFeature = features.find(
      (feature) =>
        feature.type === "bonus" &&
        feature.bonusScalers.some(
          (scaler) =>
            scaler.mode === "fixed" &&
            (!Number.isFinite(Number(scaler.amount)) ||
              Number(scaler.amount) < 1),
        ),
    );
    if (invalidSkillFeature) {
      setError(
        `Choose at least as many skill options as the number granted for "${invalidSkillFeature.name || "the skill feature"}".`,
      );
      return;
    }
    if (invalidBonusFeature) {
      setError(
        `Enter a positive bonus amount for "${invalidBonusFeature.name || "the bonus feature"}".`,
      );
      return;
    }

    setIsSaving(true);
    let createdClassId = null;
    try {
      if (!isSupabaseConfigured) {
        throw new Error("Connect Supabase before saving a custom class.");
      }

      const { configured, userId, error: sessionError } =
        await ensureAnonymousSession();
      if (!configured || sessionError || !userId) {
        throw new Error(
          sessionError?.friendlyMessage ||
            sessionError?.message ||
            "Unable to connect to character storage.",
        );
      }

      const { data: ruleset, error: rulesetError } = await supabase
        .from("rulesets")
        .select("id")
        .eq("slug", "dnd-srd-5-2-1")
        .is("created_by", null)
        .maybeSingle();
      if (rulesetError) throw rulesetError;
      if (!ruleset) {
        throw new Error(
          "The class catalog is not installed yet. Apply the class catalog migrations and try again.",
        );
      }

      const { data: createdClass, error: classError } = await supabase
        .from("classes")
        .insert({
          ruleset_id: ruleset.id,
          created_by: userId,
          slug: slugFromName(className),
          name: className.trim(),
          description: description.trim(),
          hit_die: Number(hitDie),
          primary_abilities: primaryAbilities,
          saving_throw_proficiencies: savingThrows,
          proficiencies: {},
          starting_equipment: {},
          status: "draft",
        })
        .select("id")
        .single();
      if (classError) throw classError;
      createdClassId = createdClass.id;

      if (features.length) {
        const featureRows = features.map((feature, index) => ({
          class_id: createdClassId,
          name: feature.name.trim(),
          description: feature.description.trim(),
          level: Number(feature.level),
          sort_order: features
            .slice(0, index)
            .filter((previous) => Number(previous.level) === Number(feature.level))
            .length,
          choices: featureChoices(feature),
        }));
        const { error: featuresError } = await supabase
          .from("class_features")
          .insert(featureRows);
        if (featuresError) {
          const { error: cleanupError } = await supabase
            .from("classes")
            .delete()
            .eq("id", createdClassId)
            .eq("created_by", userId);
          if (cleanupError) {
            console.error("Failed to remove an incomplete custom class:", cleanupError);
          }
          throw featuresError;
        }
      }

      setSavedName(className.trim());
      setIsSaved(true);
    } catch (saveError) {
      if (createdClassId) {
        console.error("Failed to save custom class features:", saveError);
      } else {
        console.error("Failed to save custom class:", saveError);
      }
      setError(
        saveError?.message || "Unable to save this custom class. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const groupedFeatures = features.reduce((groups, feature) => {
    const level = Number(feature.level);
    groups[level] = [...(groups[level] ?? []), feature];
    return groups;
  }, {});

  return (
    <main className="custom-class-page">
      <Header title="Custom Class Creator" setPage={setPage} />
      <div className="custom-class-content">
        <div className="custom-class-heading">
          <div>
            <p className="custom-class-eyebrow">Character tools</p>
            <h2>Build a class</h2>
            <p>
              Define the class basics, then add features at any level from 1 to
              20.
            </p>
          </div>
          <button
            type="button"
            className="custom-class-back-button"
            onClick={() => setPage("characters")}
          >
            Back to Characters
          </button>
        </div>

        <form className="custom-class-form" onSubmit={saveClass}>
          <section className="custom-class-section" aria-labelledby="class-details-title">
            <div className="custom-class-section-heading">
              <div>
                <span>01</span>
                <h3 id="class-details-title">Class details</h3>
              </div>
              <p>Set the core identity and starting proficiencies.</p>
            </div>

            <div className="custom-class-fields">
              <label className="custom-class-field">
                <span>Class name</span>
                <input
                  required
                  maxLength={80}
                  value={className}
                  onChange={(event) => setClassName(event.target.value)}
                  placeholder="e.g. Spellblade"
                />
              </label>
              <label className="custom-class-field">
                <span>Hit die</span>
                <select value={hitDie} onChange={(event) => setHitDie(event.target.value)}>
                  {[4, 6, 8, 10, 12].map((die) => (
                    <option key={die} value={die}>d{die}</option>
                  ))}
                </select>
              </label>
              <label className="custom-class-field custom-class-field-wide">
                <span>Description</span>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="What makes this class distinct?"
                />
              </label>
              <fieldset className="custom-class-choice-field">
                <legend>Primary abilities</legend>
                <div className="custom-class-check-grid">
                  {abilities.map(([key, label]) => (
                    <label key={key}>
                      <input
                        type="checkbox"
                        checked={primaryAbilities.includes(label)}
                        onChange={() =>
                          toggleValue(primaryAbilities, setPrimaryAbilities, label)
                        }
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset className="custom-class-choice-field">
                <legend>Saving throw proficiencies</legend>
                <div className="custom-class-check-grid">
                  {abilities.map(([key, label]) => (
                    <label key={key}>
                      <input
                        type="checkbox"
                        checked={savingThrows.includes(label)}
                        onChange={() => toggleValue(savingThrows, setSavingThrows, label)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          </section>

          <section className="custom-class-section" aria-labelledby="class-features-title">
            <div className="custom-class-section-heading custom-class-features-heading">
              <div>
                <span>02</span>
                <h3 id="class-features-title">Level features</h3>
              </div>
              <p>Add multiple features to a level, and move them between levels at any time.</p>
            </div>

            <div className="custom-class-add-feature">
              <label className="custom-class-field">
                <span>Add feature at level</span>
                <select
                  value={newFeatureLevel}
                  onChange={(event) => setNewFeatureLevel(event.target.value)}
                >
                  {Array.from({ length: 20 }, (_, index) => index + 1).map((level) => (
                    <option key={level} value={level}>Level {level}</option>
                  ))}
                </select>
              </label>
              <button type="button" className="custom-class-add-button" onClick={addFeature}>
                <span aria-hidden="true">+</span> Add feature
              </button>
            </div>

            {features.length === 0 ? (
              <div className="custom-class-no-features">
                No features yet. Add a feature to start building the class progression.
              </div>
            ) : (
              <div className="custom-class-feature-groups">
                {Object.keys(groupedFeatures)
                  .map(Number)
                  .sort((left, right) => left - right)
                  .map((level) => (
                    <section className="custom-class-level-group" key={level}>
                      <h4>Level {level}</h4>
                      {groupedFeatures[level].map((feature) => (
                        <article className="custom-class-feature-card" key={feature.id}>
                          <div className="custom-class-feature-topline">
                            <button
                              type="button"
                              className="custom-class-feature-toggle"
                              aria-expanded={feature.isExpanded}
                              onClick={() =>
                                updateFeature(feature.id, {
                                  isExpanded: !feature.isExpanded,
                                })
                              }
                            >
                              <span
                                className="custom-class-feature-chevron"
                                aria-hidden="true"
                              >
                                {feature.isExpanded ? "⌄" : "›"}
                              </span>
                              <strong>{feature.name || "New feature"}</strong>
                              <span className="custom-class-feature-summary">
                                {feature.type === "bonus"
                                  ? `Bonus · ${feature.bonusScalers
                                      .map((scaler) =>
                                        scaler.mode === "fixed"
                                          ? `+${scaler.amount}`
                                          : `${scaler.ability} modifier`,
                                      )
                                      .join(" + ")} ${feature.bonusOption}`
                                  : feature.type === "resource"
                                    ? "Limited-use"
                                    : feature.type === "skill_proficiency"
                                      ? "Skill proficiencies"
                                      : "Text feature"}
                              </span>
                            </button>
                            <button
                              type="button"
                              className="custom-class-remove-button"
                              onClick={() => removeFeature(feature.id)}
                              aria-label={`Remove ${feature.name || "new feature"}`}
                            >
                              Remove
                            </button>
                          </div>
                          {feature.isExpanded && (
                          <div className="custom-class-feature-fields">
                            <label className="custom-class-field">
                              <span>Feature name</span>
                              <input
                                required
                                maxLength={100}
                                value={feature.name}
                                onChange={(event) =>
                                  updateFeature(feature.id, { name: event.target.value })
                                }
                                placeholder="e.g. Arcane Recovery"
                              />
                            </label>
                            <label className="custom-class-field">
                              <span>Level</span>
                              <select
                                value={feature.level}
                                onChange={(event) =>
                                  updateFeature(feature.id, { level: Number(event.target.value) })
                                }
                              >
                                {Array.from({ length: 20 }, (_, index) => index + 1).map((value) => (
                                  <option key={value} value={value}>Level {value}</option>
                                ))}
                              </select>
                            </label>
                            <label className="custom-class-field custom-class-field-wide">
                              <span>Description</span>
                              <textarea
                                rows="3"
                                value={feature.description}
                                onChange={(event) =>
                                  updateFeature(feature.id, { description: event.target.value })
                                }
                                placeholder="Describe what the feature does."
                              />
                            </label>
                            <label className="custom-class-field">
                              <span>Feature kind</span>
                              <select
                                value={feature.type}
                                onChange={(event) =>
                                  updateFeature(feature.id, {
                                    type: event.target.value,
                                    skills: [],
                                  })
                                }
                              >
                                <option value="text">Text feature</option>
                                <option value="skill_proficiency">Skill proficiencies</option>
                                <option value="resource">Limited-use feature</option>
                                <option value="bonus">Bonus to a statistic</option>
                              </select>
                            </label>
                            <label className="custom-class-field">
                              <span>Activation time <small>(optional)</small></span>
                              <select
                                value={feature.activationTime}
                                onChange={(event) =>
                                  updateFeature(feature.id, {
                                    activationTime: event.target.value,
                                    specialActivation: "",
                                  })
                                }
                              >
                                <option value="">No activation time</option>
                                {activationTimes.map((activation) => (
                                  <option key={activation} value={activation}>{activation}</option>
                                ))}
                              </select>
                            </label>
                            {feature.activationTime === "Special" && (
                              <label className="custom-class-field custom-class-field-wide">
                                <span>Special activation time</span>
                                <input
                                  value={feature.specialActivation}
                                  onChange={(event) =>
                                    updateFeature(feature.id, {
                                      specialActivation: event.target.value,
                                    })
                                  }
                                  placeholder="e.g. When you finish a short rest"
                                />
                              </label>
                            )}
                            {feature.type === "skill_proficiency" && (
                              <>
                                <label className="custom-class-field">
                                  <span>Number of skills granted</span>
                                  <input
                                    type="number"
                                    min="1"
                                    max={Math.max(feature.skills.length, 1)}
                                    value={feature.skillChoiceCount}
                                    onChange={(event) =>
                                      updateFeature(feature.id, {
                                        skillChoiceCount: event.target.value,
                                      })
                                    }
                                  />
                                </label>
                                <fieldset className="custom-class-choice-field custom-class-field-wide">
                                  <legend>Skill options</legend>
                                  <div className="custom-class-check-grid custom-class-skills-grid">
                                    {skills.map((skill) => (
                                      <label key={skill}>
                                        <input
                                          type="checkbox"
                                          checked={feature.skills.includes(skill)}
                                          onChange={() =>
                                            updateFeature(feature.id, {
                                              skills: feature.skills.includes(skill)
                                                ? feature.skills.filter((entry) => entry !== skill)
                                                : [...feature.skills, skill],
                                            })
                                          }
                                        />
                                        {skill}
                                      </label>
                                    ))}
                                  </div>
                                </fieldset>
                              </>
                            )}
                            {feature.type === "resource" && (
                              <>
                                <label className="custom-class-field">
                                  <span>Charges</span>
                                  <input
                                    type="number"
                                    min="1"
                                    max="999"
                                    value={feature.charges}
                                    onChange={(event) =>
                                      updateFeature(feature.id, { charges: event.target.value })
                                    }
                                  />
                                </label>
                                <label className="custom-class-field">
                                  <span>Recharge</span>
                                  <select
                                    value={feature.recharge}
                                    onChange={(event) =>
                                      updateFeature(feature.id, { recharge: event.target.value })
                                    }
                                  >
                                    <option value="short_rest">Short rest</option>
                                    <option value="long_rest">Long rest</option>
                                    <option value="dawn">At dawn</option>
                                    <option value="other">Other / special</option>
                                  </select>
                                </label>
                                {feature.recharge === "other" && (
                                  <label className="custom-class-field custom-class-field-wide">
                                    <span>Special recharge condition</span>
                                    <input
                                      value={feature.rechargeDetail}
                                      onChange={(event) =>
                                        updateFeature(feature.id, {
                                          rechargeDetail: event.target.value,
                                        })
                                      }
                                      placeholder="Describe when charges return"
                                    />
                                  </label>
                                )}
                              </>
                            )}
                            {feature.type === "bonus" && (
                              <>
                                <label className="custom-class-field">
                                  <span>Bonus target</span>
                                  <select
                                    value={feature.bonusTarget}
                                    onChange={(event) =>
                                      updateFeature(feature.id, {
                                        bonusTarget: event.target.value,
                                        bonusOption:
                                          event.target.value === "ability_score"
                                            ? "Strength"
                                            : event.target.value === "skill"
                                              ? skills[0]
                                              : event.target.value === "armor_class"
                                                ? "Armor Class"
                                                : "Hit Points",
                                      })
                                    }
                                  >
                                    <option value="ability_score">Ability score</option>
                                    <option value="skill">Skill check</option>
                                    <option value="armor_class">Armor Class</option>
                                    <option value="hit_points">Hit points</option>
                                  </select>
                                </label>
                                {(feature.bonusTarget === "ability_score" ||
                                  feature.bonusTarget === "skill") && (
                                  <label className="custom-class-field">
                                    <span>
                                      {feature.bonusTarget === "ability_score"
                                        ? "Ability"
                                        : "Skill"}
                                    </span>
                                    <select
                                      value={feature.bonusOption}
                                      onChange={(event) =>
                                        updateFeature(feature.id, {
                                          bonusOption: event.target.value,
                                        })
                                      }
                                    >
                                      {(feature.bonusTarget === "ability_score"
                                        ? abilities.map(([, label]) => label)
                                        : skills
                                      ).map((option) => (
                                        <option key={option} value={option}>
                                          {option}
                                        </option>
                                      ))}
                                    </select>
                                  </label>
                                )}
                                <div className="custom-class-bonus-scalers custom-class-field-wide">
                                  {feature.bonusScalers.map((scaler, index) => (
                                    <div className="custom-class-bonus-scaler" key={scaler.id}>
                                      <div className="custom-class-bonus-scaler-heading">
                                        <strong>Scaler {index + 1}</strong>
                                        {feature.bonusScalers.length > 1 && (
                                          <button
                                            type="button"
                                            className="custom-class-remove-button"
                                            onClick={() =>
                                              updateFeature(feature.id, {
                                                bonusScalers: feature.bonusScalers.filter(
                                                  (entry) => entry.id !== scaler.id,
                                                ),
                                              })
                                            }
                                          >
                                            Remove scaler
                                          </button>
                                        )}
                                      </div>
                                      <div className="custom-class-feature-fields">
                                        <label className="custom-class-field">
                                          <span>Scales by</span>
                                          <select
                                            value={scaler.mode}
                                            onChange={(event) =>
                                              updateFeature(feature.id, {
                                                bonusScalers: feature.bonusScalers.map(
                                                  (entry) =>
                                                    entry.id === scaler.id
                                                      ? {
                                                          ...entry,
                                                          mode: event.target.value,
                                                        }
                                                      : entry,
                                                ),
                                              })
                                            }
                                          >
                                            <option value="fixed">Fixed amount</option>
                                            <option value="ability_modifier">
                                              Ability modifier
                                            </option>
                                          </select>
                                        </label>
                                        {scaler.mode === "fixed" ? (
                                          <label className="custom-class-field">
                                            <span>Bonus amount</span>
                                            <input
                                              type="number"
                                              min="1"
                                              step="1"
                                              value={scaler.amount}
                                              onChange={(event) =>
                                                updateFeature(feature.id, {
                                                  bonusScalers: feature.bonusScalers.map(
                                                    (entry) =>
                                                      entry.id === scaler.id
                                                        ? {
                                                            ...entry,
                                                            amount: event.target.value,
                                                          }
                                                        : entry,
                                                  ),
                                                })
                                              }
                                            />
                                          </label>
                                        ) : (
                                          <label className="custom-class-field">
                                            <span>Scaling ability</span>
                                            <select
                                              value={scaler.ability}
                                              onChange={(event) =>
                                                updateFeature(feature.id, {
                                                  bonusScalers: feature.bonusScalers.map(
                                                    (entry) =>
                                                      entry.id === scaler.id
                                                        ? {
                                                            ...entry,
                                                            ability: event.target.value,
                                                          }
                                                        : entry,
                                                  ),
                                                })
                                              }
                                            >
                                              {abilities.map(([, label]) => (
                                                <option key={label} value={label}>
                                                  {label}
                                                </option>
                                              ))}
                                            </select>
                                          </label>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                  {feature.bonusScalers.length < 2 && (
                                    <button
                                      type="button"
                                      className="custom-class-add-scaler-button"
                                      onClick={() =>
                                        updateFeature(feature.id, {
                                          bonusScalers: [
                                            ...feature.bonusScalers,
                                            {
                                              id: Math.max(
                                                ...feature.bonusScalers.map(
                                                  (scaler) => scaler.id,
                                                ),
                                              ) + 1,
                                              mode: "ability_modifier",
                                              amount: 1,
                                              ability: "Strength",
                                            },
                                          ],
                                        })
                                      }
                                    >
                                      + Add another scaler
                                    </button>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                          )}
                        </article>
                      ))}
                    </section>
                  ))}
              </div>
            )}
          </section>

          {error && <p className="custom-class-error" role="alert">{error}</p>}
          {isSaved && (
            <p className="custom-class-success" role="status">
              {savedName} and its features are saved to the database as a
              private draft. It will not appear in the character class picker
              until class integration is added.
            </p>
          )}
          <div className="custom-class-form-actions">
            <button
              type="button"
              className="custom-class-back-button"
              onClick={() => setPage("characters")}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="custom-class-save-button"
              disabled={isSaving || isSaved}
            >
              {isSaving
                ? "Saving…"
                : isSaved
                  ? "Saved to database"
                  : "Save class to database"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
