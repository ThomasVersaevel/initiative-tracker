import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { skillOptions, traitOptions } from "../TypesUtils/StoreTypes";
import { NumericInput } from "../../NumericInput";
import {
  challengeRatings,
  formatResistanceEntry,
  normalizeTraitResistances,
} from "../TypesUtils/Types";

export function TraitStore({
  setStorePanelOpen,
  traits,
  setTraits,
  initiativeModifier,
}) {
  const [openCategory, setOpenCategory] = useState(null);
  const [customSense, setCustomSense] = useState("");
  const [customSenseRange, setCustomSenseRange] = useState("");
  const [skillToAdd, setSkillToAdd] = useState("");
  const selectedChallengeRating =
    challengeRatings.find(
      (rating) => rating.value === String(traits.challengeRating),
    ) || challengeRatings[0];

  const resistanceRelations = [
    { value: "resistance", label: "Resistance" },
    { value: "immunity", label: "Immunity" },
    { value: "vulnerability", label: "Vulnerability" },
  ];

  const toggleOption = (category, option) => {
    setTraits((current) => ({
      ...current,
      [category]: current[category].includes(option)
        ? current[category].filter((value) => value !== option)
        : [...current[category], option],
    }));
  };

  const getSenseName = (sense) =>
    typeof sense === "string" ? sense : sense.name;

  const toggleSense = (senseName) => {
    setTraits((current) => ({
      ...current,
      senses: current.senses.some((sense) => getSenseName(sense) === senseName)
        ? current.senses.filter((sense) => getSenseName(sense) !== senseName)
        : [...current.senses, { name: senseName, range: "" }],
    }));
  };

  const updateSenseRange = (senseName, range) => {
    setTraits((current) => ({
      ...current,
      senses: current.senses.map((sense) =>
        getSenseName(sense) === senseName
          ? { name: senseName, range }
          : sense,
      ),
    }));
  };

  const addCustomSense = () => {
    const name = String(customSense ?? "").trim();
    if (!name) return;

    const range = String(customSenseRange ?? "").trim();

    setTraits((current) => ({
      ...current,
      senses: [...current.senses, { name, range }],
    }));
    setCustomSense("");
    setCustomSenseRange("");
    setOpenCategory(null);
  };

  const updateResistanceRelation = (damageType, relation) => {
    setTraits((current) => ({
      ...current,
      resistances: normalizeTraitResistances(current.resistances).map((entry) =>
        entry.damageType === damageType ? { ...entry, relation } : entry,
      ),
    }));
  };

  const addSkill = (name) => {
    if (!name || traits.skills.some((skill) => skill.name === name)) return;

    setTraits((current) => ({
      ...current,
      skills: [...current.skills, { name, modifier: 0 }],
    }));
    setSkillToAdd("");
  };

  const updateSkillModifier = (name, modifier) => {
    setTraits((current) => ({
      ...current,
      skills: current.skills.map((skill) =>
        skill.name === name ? { ...skill, modifier } : skill,
      ),
    }));
  };

  const removeSkill = (name) => {
    setTraits((current) => ({
      ...current,
      skills: current.skills.filter((skill) => skill.name !== name),
    }));
  };

  const renderResistanceEditor = () => (
    <div className="trait-select-field">
      <span>Resistances</span>
      <div className="trait-picker">
        <button
          type="button"
          className="trait-picker-input"
          aria-expanded={openCategory === "resistances"}
          onClick={() =>
            setOpenCategory((current) =>
              current === "resistances" ? null : "resistances",
            )
          }
        >
          {traits.resistances.length > 0 ? (
            normalizeTraitResistances(traits.resistances).map((entry) => (
              <span className="trait-pill" key={entry.damageType}>
                {formatResistanceEntry(entry)}
              </span>
            ))
          ) : (
            <span className="trait-picker-placeholder">Choose options</span>
          )}
          <span className="trait-picker-chevron">▾</span>
        </button>

        {openCategory === "resistances" && (
          <div className="trait-picker-menu">
            {traitOptions.resistances.map((option) => {
              const selected = normalizeTraitResistances(traits.resistances).some(
                (entry) => entry.damageType === option,
              );
              return (
                <div className="trait-picker-option-wrap" key={option}>
                  <button
                    type="button"
                    className={`trait-picker-option${selected ? " selected" : ""}`}
                    onClick={() => {
                      const currentEntries = normalizeTraitResistances(traits.resistances);
                      const existing = currentEntries.find((entry) => entry.damageType === option);
                      if (existing) {
                        setTraits((current) => ({
                          ...current,
                          resistances: current.resistances.filter((entry) => {
                            if (typeof entry === "string") return entry !== option;
                            return entry.damageType !== option;
                          }),
                        }));
                        return;
                      }

                      setTraits((current) => ({
                        ...current,
                        resistances: [
                          ...normalizeTraitResistances(current.resistances),
                          { damageType: option, relation: "resistance" },
                        ],
                      }));
                    }}
                  >
                    <span>{option}</span>
                    {selected && <span>✓</span>}
                  </button>

                  {selected && (
                    <div className="trait-relation-picker">
                      {resistanceRelations.map((relation) => (
                        <button
                          type="button"
                          key={relation.value}
                          className={`trait-relation-button${normalizeTraitResistances(traits.resistances).find((entry) => entry.damageType === option)?.relation === relation.value ? " selected" : ""}`}
                          onClick={() => updateResistanceRelation(option, relation.value)}
                        >
                          {relation.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const renderSenses = () => (
    <div className="trait-select-field">
      <span>Senses</span>
      <div className="trait-picker">
        <button
          type="button"
          className="trait-picker-input"
          aria-expanded={openCategory === "senses"}
          onClick={() =>
            setOpenCategory((current) =>
              current === "senses" ? null : "senses",
            )
          }
        >
          {traits.senses.length > 0 ? (
            traits.senses.map((sense) => (
              <span className="trait-pill" key={getSenseName(sense)}>
                {getSenseName(sense)}
              </span>
            ))
          ) : (
            <span className="trait-picker-placeholder">Choose options</span>
          )}
          <span className="trait-picker-chevron">▾</span>
        </button>

        {openCategory === "senses" && (
          <div className="trait-picker-menu">
            {traitOptions.senses.map((option) => {
              const selected = traits.senses.some(
                (sense) => getSenseName(sense) === option,
              );
              return (
                <button
                  type="button"
                  key={option}
                  className={`trait-picker-option${selected ? " selected" : ""}`}
                  onClick={() => toggleSense(option)}
                >
                  <span>{option}</span>
                  {selected && <span>✓</span>}
                </button>
              );
            })}

            <div className="custom-sense-form">
              <strong>Custom sense</strong>
              <input
                type="text"
                placeholder="Sense name"
                value={customSense}
                onChange={(e) => setCustomSense(e.target.value)}
              />
              <NumericInput
                min="0"
                placeholder="Range (ft.)"
                value={customSenseRange}
                allowEmpty
                onChange={(e) => setCustomSenseRange(e.target.value)}
              />
              <button
                type="button"
                className="button add-button"
                onClick={addCustomSense}
              >
                Add custom sense
              </button>
            </div>
          </div>
        )}
      </div>

      {traits.senses.length > 0 && (
        <div className="sense-range-fields">
          {traits.senses.map((sense) => {
            const name = getSenseName(sense);
            return (
              <label key={name}>
                <span>{name} range (ft.)</span>
                <NumericInput
                  min="0"
                  placeholder="Optional"
                  value={typeof sense === "string" ? "" : sense.range}
                  allowEmpty
                  onChange={(e) => updateSenseRange(name, e.target.value)}
                />
              </label>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderMultiSelect = (category, label) => (
    <div className="trait-select-field">
      <span>{label}</span>
      <div className="trait-picker">
        <button
          type="button"
          className="trait-picker-input"
          aria-expanded={openCategory === category}
          onClick={() =>
            setOpenCategory((current) =>
              current === category ? null : category,
            )
          }
        >
          {traits[category].length > 0 ? (
            traits[category].map((option) => (
              <span
                className="trait-pill"
                role="button"
                onClick={(event) => {
                  event.stopPropagation();
                  toggleOption(category, option);
                }}
                key={option}
              >
                {option}
                <span
                  className="trait-pill-remove"
                  aria-label={`Remove ${option}`}
                >
                  x
                </span>
              </span>
            ))
          ) : (
            <span className="trait-picker-placeholder">Choose options</span>
          )}
          <span className="trait-picker-chevron">▾</span>
        </button>

        {openCategory === category && (
          <div className="trait-picker-menu">
            {traitOptions[category].map((option) => {
              const selected = traits[category].includes(option);
              return (
                <button
                  type="button"
                  key={option}
                  className={`trait-picker-option${
                    selected ? " selected" : ""
                  }`}
                  onClick={() => toggleOption(category, option)}
                >
                  <span>{option}</span>
                  {selected && <span>✓</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <div className="store-header">
        <h2>Traits</h2>

        <button
          type="button"
          className="btn"
          onClick={() => setStorePanelOpen("")}
        >
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>

      <div className="store-items">
        <label className="trait-select-field">
          <span>Initiative modifier</span>
          <NumericInput
            step="1"
            value={initiativeModifier}
            onChange={(event) =>
              setTraits((current) => ({
                ...current,
                initiative: Number(event.target.value),
              }))
            }
          />
        </label>
        <div className="trait-select-field">
          <span>Skills</span>
          <select
            className="trait-picker-input"
            aria-label="Add skill check"
            value={skillToAdd}
            onChange={(event) => addSkill(event.target.value)}
          >
            <option value="">Add a skill check</option>
            {skillOptions.map((skill) => (
              <option
                key={skill}
                value={skill}
                disabled={traits.skills.some((entry) => entry.name === skill)}
              >
                {skill}
              </option>
            ))}
          </select>
          {traits.skills.length > 0 && (
            <div className="trait-skill-fields">
              {traits.skills.map((skill) => (
                <label key={skill.name}>
                  <span>{skill.name}</span>
                  <NumericInput
                    step="1"
                    value={skill.modifier}
                    aria-label={`${skill.name} modifier`}
                    onChange={(event) =>
                      updateSkillModifier(
                        skill.name,
                        Number(event.target.value),
                      )
                    }
                  />
                  <button
                    type="button"
                    className="btn remove-button"
                    aria-label={`Remove ${skill.name}`}
                    title={`Remove ${skill.name}`}
                    onClick={() => removeSkill(skill.name)}
                  >
                    x
                  </button>
                </label>
              ))}
            </div>
          )}
        </div>
        {renderResistanceEditor()}
        {renderSenses()}
        {renderMultiSelect("languages", "Languages")}

        <label className="trait-select-field">
          <span>Challenge Rating</span>
          <div className="trait-picker">
            <button
              type="button"
              className="trait-picker-input challenge-rating-picker-input"
              aria-expanded={openCategory === "challengeRating"}
              onClick={() =>
                setOpenCategory((current) =>
                  current === "challengeRating" ? null : "challengeRating",
                )
              }
            >
              <span>CR {selectedChallengeRating.label}</span>
              <span className="challenge-rating-meta">
                {selectedChallengeRating.xp} XP - PB {selectedChallengeRating.proficiencyBonus}
              </span>
              <span className="trait-picker-chevron">▾</span>
            </button>

            {openCategory === "challengeRating" && (
              <div className="trait-picker-menu">
                {challengeRatings.map((rating) => (
                  <button
                    type="button"
                    key={rating.value}
                    className={`trait-picker-option challenge-rating-option${
                      rating.value === String(traits.challengeRating)
                        ? " selected"
                        : ""
                    }`}
                    onClick={() => {
                      setTraits((current) => ({
                        ...current,
                        challengeRating: rating.value,
                      }));
                      setOpenCategory(null);
                    }}
                  >
                    <span>CR {rating.label}</span>
                    <span className="challenge-rating-meta">
                      {rating.xp} XP - PB {rating.proficiencyBonus}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </label>
      </div>
    </div>
  );
}
