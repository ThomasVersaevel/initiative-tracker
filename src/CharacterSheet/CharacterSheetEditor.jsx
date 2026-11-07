import React, { useEffect, useMemo, useState } from "react";
import { NavigationMenu } from "../Header";
import { ensureAnonymousSession, isSupabaseConfigured, supabase } from "../Supabase";
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

const rulesetSlug = "dnd-srd-5-2-1";

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

function EquipmentPreview({ title, items, description }) {
  return (
    <section className="editor-preview">
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {items?.length ? (
        <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
      ) : description ? null : (
        <p>Select an option to preview its starting equipment.</p>
      )}
      {items?.length > 0 && (
        <small>Equipment is added to the character from the Extra tab.</small>
      )}
      {description && !items?.length && (
        <small>
          Review the equipment options, then add chosen items individually in
          the Extra tab.
        </small>
      )}
    </section>
  );
}

const emptyCharacter = {
  name: "",
  portrait: "",
  advancement: "milestone",
  className: "",
  classId: "",
  classLevel: 1,
  subclass: "",
  subclassId: "",
  classSnapshot: null,
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
};

export default function CharacterSheetEditor({
  setPage,
  onSave,
  initialCharacter,
}) {
  const [activeTab, setActiveTab] = useState("Basic");
  const [character, setCharacter] = useState(() => ({
    ...emptyCharacter,
    ...initialCharacter,
    scores: { ...emptyCharacter.scores, ...initialCharacter?.scores },
    equipment: initialCharacter?.equipment ?? [],
  }));
  const [newItem, setNewItem] = useState("");
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [classCatalog, setClassCatalog] = useState({
    classes: [],
    isLoading: true,
    error: "",
    ruleset: null,
  });
  const [speciesCatalog, setSpeciesCatalog] = useState({
    species: [],
    isLoading: true,
    error: "",
    ruleset: null,
  });

  useEffect(() => {
    let isActive = true;

    const loadClassCatalog = async () => {
      if (!isSupabaseConfigured) {
        if (isActive) {
          setClassCatalog({
            classes: [],
            isLoading: false,
            error: "Connect Supabase to load the class catalog.",
            ruleset: null,
          });
          setSpeciesCatalog({
            species: [],
            isLoading: false,
            error: "Connect Supabase to load the species catalog.",
            ruleset: null,
          });
        }
        return;
      }

      const { configured, userId, error: sessionError } =
        await ensureAnonymousSession();
      if (!isActive) return;
      if (!configured || sessionError || !userId) {
        setClassCatalog({
          classes: [],
          isLoading: false,
          error:
            sessionError?.friendlyMessage ||
            sessionError?.message ||
            "Unable to connect to the class catalog.",
          ruleset: null,
        });
        setSpeciesCatalog({
          species: [],
          isLoading: false,
          error:
            sessionError?.friendlyMessage ||
            sessionError?.message ||
            "Unable to connect to the species catalog.",
          ruleset: null,
        });
        return;
      }

      const { data: ruleset, error: rulesetError } = await supabase
        .from("rulesets")
        .select("id, name, slug")
        .eq("slug", rulesetSlug)
        .maybeSingle();

      if (!isActive) return;
      if (rulesetError || !ruleset) {
        if (rulesetError) {
          console.error("Failed to load the SRD ruleset:", rulesetError);
        }
        setClassCatalog({
          classes: [],
          isLoading: false,
          error: rulesetError
            ? "Unable to load the class ruleset. Apply the class catalog migrations and try again."
            : "The SRD class catalog is not installed yet. Apply the class catalog migrations.",
          ruleset: null,
        });
        setSpeciesCatalog({
          species: [],
          isLoading: false,
          error: "Unable to load the species ruleset.",
          ruleset: null,
        });
        return;
      }

      const { data: speciesRows, error: speciesError } = await supabase
        .from("species")
        .select(`
          id, slug, name, description, creature_type, size_options, speed, languages,
          species_features (id, slug, name, description, level, sort_order, choices)
        `)
        .eq("ruleset_id", ruleset.id)
        .eq("status", "published")
        .order("name");

      if (!isActive) return;
      if (speciesError) {
        console.error("Failed to load the species catalog:", speciesError);
        setSpeciesCatalog({
          species: [],
          isLoading: false,
          error:
            "Unable to load the species catalog. Apply the species catalog migration and try again.",
          ruleset,
        });
      } else {
        setSpeciesCatalog({
          species: (speciesRows ?? []).map((speciesData) => ({
            ...speciesData,
            species_features: [...(speciesData.species_features ?? [])].sort(
              (left, right) =>
                left.level - right.level || left.sort_order - right.sort_order,
            ),
          })),
          isLoading: false,
          error: "",
          ruleset,
        });
      }

      const { data: rows, error: classesError } = await supabase
        .from("classes")
        .select(`
          id, slug, name, description, hit_die, primary_abilities,
          saving_throw_proficiencies, proficiencies, starting_equipment,
          class_features (id, slug, name, description, level, sort_order),
          subclasses (
            id, slug, name, description, unlock_level,
            subclass_features (id, slug, name, description, level, sort_order)
          )
        `)
        .eq("ruleset_id", ruleset.id)
        .eq("status", "published")
        .order("name");

      if (!isActive) return;
      if (classesError) {
        console.error("Failed to load the class catalog:", classesError);
        setClassCatalog({
          classes: [],
          isLoading: false,
          error: "Unable to load the class catalog. Please try again.",
          ruleset,
        });
        return;
      }

      const sortFeatures = (features = []) =>
        [...features].sort(
          (left, right) =>
            left.level - right.level || left.sort_order - right.sort_order,
        );
      setClassCatalog({
        classes: (rows ?? []).map((classData) => ({
          ...classData,
          class_features: sortFeatures(classData.class_features),
          subclasses: (classData.subclasses ?? []).map((subclass) => ({
            ...subclass,
            subclass_features: sortFeatures(subclass.subclass_features),
          })),
        })),
        isLoading: false,
        error: "",
        ruleset,
      });
    };

    loadClassCatalog().catch((error) => {
      console.error("Failed to load the class catalog:", error);
      if (isActive) {
        setClassCatalog({
          classes: [],
          isLoading: false,
          error: error.message || "Unable to load the class catalog.",
          ruleset: null,
        });
        setSpeciesCatalog({
          species: [],
          isLoading: false,
          error: error.message || "Unable to load the species catalog.",
          ruleset: null,
        });
      }
    });

    return () => {
      isActive = false;
    };
  }, []);

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

  const selectedClass = classCatalog.classes.find(
    (classData) =>
      classData.id === character.classId ||
      classData.name === character.className,
  );
  const selectedSubclass = selectedClass?.subclasses.find(
    (subclass) =>
      subclass.id === character.subclassId ||
      subclass.name === character.subclass,
  );
  const selectedSpecies = speciesCatalog.species.find(
    (speciesData) =>
      speciesData.id === character.speciesId ||
      speciesData.name === character.species,
  );
  const selectedSpeciesFeatures = (selectedSpecies?.species_features ?? []).filter(
    (feature) => feature.level <= character.classLevel,
  );
  const classEquipment = selectedClass?.starting_equipment?.items ?? [];
  const classEquipmentDescription =
    selectedClass?.starting_equipment?.description ?? "";
  const backgroundEquipment = backgrounds[character.background]?.equipment ?? [];
  const combinedEquipment = useMemo(
    () => [...classEquipment, ...backgroundEquipment],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedClass?.id, character.background],
  );
  const pointTotal = Object.values(character.scores).reduce(
    (total, score) => total + pointCost(score),
    0,
  );
  const classFeatures = [
    ...(selectedClass?.class_features ?? [])
      .filter((feature) => feature.level <= character.classLevel)
      .map((feature) => ({ ...feature, source: "class" })),
    ...(selectedSubclass?.subclass_features ?? [])
      .filter((feature) => feature.level <= character.classLevel)
      .map((feature) => ({ ...feature, source: "subclass" })),
  ].sort(
    (left, right) =>
      left.level - right.level ||
      left.sort_order - right.sort_order ||
      left.name.localeCompare(right.name),
  );
  const classSkillCount =
    selectedClass?.proficiencies?.skill_choice_count ?? 0;
  const allowedClassSkills = new Set(
    selectedClass?.proficiencies?.skill_options ?? [],
  );

  const save = async () => {
    if (!character.name.trim()) {
      setActiveTab("Basic");
      setSaveError("Enter a character name before saving.");
      return;
    }

    setIsSaving(true);
    setSaveError("");
    try {
      const classSnapshot = selectedClass
        ? {
            ruleset: classCatalog.ruleset,
            class: {
              id: selectedClass.id,
              slug: selectedClass.slug,
              name: selectedClass.name,
              description: selectedClass.description,
              hitDie: selectedClass.hit_die,
              primaryAbilities: selectedClass.primary_abilities,
              savingThrowProficiencies:
                selectedClass.saving_throw_proficiencies,
              proficiencies: selectedClass.proficiencies,
              startingEquipment: selectedClass.starting_equipment,
            },
            subclass: selectedSubclass
              ? {
                  id: selectedSubclass.id,
                  slug: selectedSubclass.slug,
                  name: selectedSubclass.name,
                  description: selectedSubclass.description,
                }
              : null,
            features: classFeatures.map(
              ({ id, level, name, description, source }) => ({
                id,
                level,
                name,
                description,
                source,
              }),
            ),
          }
        : null;
      const speciesSnapshot = selectedSpecies
        ? {
            ruleset: speciesCatalog.ruleset,
            species: {
              id: selectedSpecies.id,
              slug: selectedSpecies.slug,
              name: selectedSpecies.name,
              description: selectedSpecies.description,
              creatureType: selectedSpecies.creature_type,
              sizeOptions: selectedSpecies.size_options,
              speed: selectedSpecies.speed,
              languages: selectedSpecies.languages,
            },
            features: selectedSpeciesFeatures.map((feature) => ({
              id: feature.id,
              slug: feature.slug,
              name: feature.name,
              description: feature.description,
              level: feature.level,
              choices: Object.fromEntries(
                (feature.choices ?? []).map((choice) => [
                  choice.key,
                  character.speciesChoices?.[`${feature.slug}:${choice.key}`] ?? "",
                ]),
              ),
            })),
          }
        : null;

      await onSave({
        ...character,
        classId: selectedClass?.id ?? character.classId ?? "",
        className: selectedClass?.name ?? character.className,
        subclassId: selectedSubclass?.id ?? character.subclassId ?? "",
        subclass: selectedSubclass?.name ?? character.subclass,
        classSnapshot: selectedClass
          ? classSnapshot
          : character.classSnapshot,
        speciesId: selectedSpecies?.id ?? character.speciesId ?? "",
        species: selectedSpecies?.name ?? character.species,
        speciesSnapshot: selectedSpecies
          ? speciesSnapshot
          : character.species
            ? character.speciesSnapshot
            : null,
      });
    } catch (error) {
      console.error("Failed to save character sheet:", error);
      setSaveError(error.message || "Unable to save this character.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleClassSkill = (skill) => {
    setCharacter((current) => {
      const selected = current.classSkills.includes(skill);
      if (
        !selected &&
        current.classSkills.length >= classSkillCount
      ) {
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
              <Field
                label="Class"
                hint={classCatalog.error || undefined}
              >
                <select
                  value={selectedClass?.id ?? ""}
                  disabled={classCatalog.isLoading || Boolean(classCatalog.error)}
                  onChange={(event) => {
                    const nextClass = classCatalog.classes.find(
                      (classData) => classData.id === event.target.value,
                    );
                    setCharacter((current) => ({
                      ...current,
                      classId: nextClass?.id ?? "",
                      className: nextClass?.name ?? "",
                      subclassId: "",
                      subclass: "",
                      classSkills: [],
                      classSnapshot: null,
                    }));
                  }}
                >
                  <option value="">Choose a class</option>
                  {classCatalog.classes.map((classData) => (
                    <option key={classData.id} value={classData.id}>
                      {classData.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Class level">
                <input type="number" min="1" max="20" value={character.classLevel} onWheel={(event) => event.currentTarget.blur()} onChange={(event) => update("classLevel", Math.min(20, Math.max(1, Number(event.target.value) || 1)))} />
              </Field>
              <Field label="Subclass">
                <select
                  value={selectedSubclass?.id ?? ""}
                  disabled={!selectedClass}
                  onChange={(event) => {
                    const nextSubclass = selectedClass?.subclasses.find(
                      (subclass) => subclass.id === event.target.value,
                    );
                    setCharacter((current) => ({
                      ...current,
                      subclassId: nextSubclass?.id ?? "",
                      subclass: nextSubclass?.name ?? "",
                    }));
                  }}
                >
                  <option value="">Choose a subclass</option>
                  {(selectedClass?.subclasses ?? []).map((subclass) => (
                    <option key={subclass.id} value={subclass.id}>
                      {subclass.name} (level {subclass.unlock_level})
                    </option>
                  ))}
                </select>
              </Field>
              {selectedClass && (
                <section className="editor-preview">
                  <h3>{selectedClass.name} core traits</h3>
                  <p>
                    <strong>Hit die:</strong> d{selectedClass.hit_die}
                  </p>
                  <p>
                    <strong>Primary abilities:</strong>{" "}
                    {selectedClass.primary_abilities.join(", ")}
                  </p>
                  <p>
                    <strong>Saving throw proficiencies:</strong>{" "}
                    {selectedClass.saving_throw_proficiencies.join(", ")}
                  </p>
                  <p>
                    <strong>Skill proficiencies:</strong> Choose{" "}
                    {classSkillCount}{" "}
                    {classSkillCount === 1 ? "skill" : "skills"}
                  </p>
                  {selectedSubclass?.description && (
                    <p>
                      <strong>{selectedSubclass.name}:</strong>{" "}
                      {selectedSubclass.description}
                    </p>
                  )}
                </section>
              )}
              <Field label="Class proficiencies" hint="Armor, weapons, tools, or other class-granted proficiencies.">
                <textarea rows="3" value={character.classProficiencies} onChange={(event) => update("classProficiencies", event.target.value)} />
              </Field>
              <h3 className="editor-subheading">Skill proficiencies</h3>
              <p className="editor-hint">Choose {classSkillCount} skills ({character.classSkills.length} selected).</p>
              <div className="editor-check-grid">
                {skills.map((skill) => (
                  <label key={skill} className="editor-check">
                    <input type="checkbox" checked={character.classSkills.includes(skill)} disabled={!selectedClass || (!character.classSkills.includes(skill) && (!allowedClassSkills.has(skill) || character.classSkills.length >= classSkillCount))} onChange={() => toggleClassSkill(skill)} />
                    {skill}
                  </label>
                ))}
              </div>
              <Field label="Additional class notes">
                <textarea rows="4" value={character.classFeatures} onChange={(event) => update("classFeatures", event.target.value)} placeholder="Add personal notes or feature choices" />
              </Field>
              {selectedClass && (
                <section className="editor-preview">
                  <h3>
                    Features gained by level {character.classLevel}
                  </h3>
                  {classFeatures.length ? (
                    <ul>
                      {classFeatures.map((feature) => (
                        <li key={`${feature.source}-${feature.id}`}>
                          <strong>
                            Level {feature.level}: {feature.name}
                          </strong>
                          <p>{feature.description}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No features are recorded for this level.</p>
                  )}
                </section>
              )}
            </section>
            <EquipmentPreview
              title="Class starting equipment"
              items={classEquipment}
              description={classEquipmentDescription}
            />
          </div>
        );
      case "Race":
        return (
          <div className="editor-form-grid">
            <section className="editor-section">
              <h2>Species</h2>
              <Field label="Species" hint={speciesCatalog.error || undefined}>
                <select
                  value={selectedSpecies?.id ?? character.species}
                  disabled={speciesCatalog.isLoading || Boolean(speciesCatalog.error)}
                  onChange={(event) => {
                    const nextSpecies = speciesCatalog.species.find(
                      (speciesData) => speciesData.id === event.target.value,
                    );
                    setCharacter((current) => ({
                      ...current,
                      speciesId: nextSpecies?.id ?? "",
                      species: nextSpecies?.name ?? "",
                      speciesLineage: "",
                      speciesChoices: {},
                      speciesSize:
                        nextSpecies?.size_options?.[0] ??
                        current.speciesSize,
                      speciesSpeed: nextSpecies?.speed ?? current.speciesSpeed,
                      speciesLanguages:
                        nextSpecies?.languages?.join(", ") ??
                        current.speciesLanguages,
                      speciesSnapshot: null,
                    }));
                  }}
                >
                  <option value="">Choose a race</option>
                  {!selectedSpecies && character.species && (
                    <option value={character.species}>
                      {character.species} (saved character)
                    </option>
                  )}
                  {speciesCatalog.species.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </Field>
              {selectedSpeciesFeatures.flatMap((feature) =>
                (feature.choices ?? []).map((choice) => {
                  const selectionKey = `${feature.slug}:${choice.key}`;
                  const value =
                    character.speciesChoices?.[selectionKey] ?? "";
                  const onChange = (nextValue) => {
                    setCharacter((current) => ({
                      ...current,
                      speciesChoices: {
                        ...current.speciesChoices,
                        [selectionKey]: nextValue,
                      },
                      ...(choice.key === "lineage" || choice.key === "ancestry"
                        ? { speciesLineage: nextValue }
                        : {}),
                    }));
                  };
                  return (
                    <Field key={selectionKey} label={choice.prompt}>
                      {choice.allowCustom ? (
                        <input
                          value={value}
                          onChange={(event) => onChange(event.target.value)}
                        />
                      ) : (
                        <select
                          value={value}
                          onChange={(event) => onChange(event.target.value)}
                        >
                          <option value="">Choose an option</option>
                          {(choice.options ?? []).map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      )}
                    </Field>
                  );
                }),
              )}
              <div className="editor-inline-fields">
                <Field label="Size">
                  <select value={character.speciesSize} onChange={(event) => update("speciesSize", event.target.value)}>
                    {(selectedSpecies?.size_options ?? ["Small", "Medium", "Large", "Other"]).map((size) => (
                      <option key={size}>{size}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Speed (ft.)">
                  <input type="number" min="0" value={character.speciesSpeed} onWheel={(event) => event.currentTarget.blur()} onChange={(event) => update("speciesSpeed", Math.max(0, Number(event.target.value) || 0))} />
                </Field>
              </div>
              <Field label="Languages">
                <input value={character.speciesLanguages} onChange={(event) => update("speciesLanguages", event.target.value)} placeholder="Languages known" />
              </Field>
              {selectedSpecies && (
                <>
                  <h3 className="editor-subheading">Species traits</h3>
                  <ul>
                    {selectedSpeciesFeatures.map((feature) => (
                      <li key={feature.id}>
                        <strong>{feature.name}.</strong> {feature.description}
                      </li>
                    ))}
                  </ul>
                  <p>2024 SRD species do not grant ability score increases.</p>
                </>
              )}
              <Field label="Traits and other choices" hint="Record racial traits or additional choices.">
                <textarea rows="5" value={character.speciesNotes} onChange={(event) => update("speciesNotes", event.target.value)} placeholder="Traits, languages, or other choices" />
              </Field>
            </section>
            <section className="editor-section editor-note-panel">
              <h2>{character.species || "Species"} details</h2>
              {selectedSpecies ? (
                <>
                  <p>{selectedSpecies.description}</p>
                  <p>Creature type: {selectedSpecies.creature_type}</p>
                  <p>Languages: {selectedSpecies.languages.join(", ")}</p>
                  <p>Species choices are saved with this character.</p>
                </>
              ) : (
                <p>Species traits and choices can be recorded separately from class and background selections.</p>
              )}
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
              <p className="editor-hint">Choose class equipment from its options and add the items individually here. Background equipment can be added from its preview.</p>
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
        <NavigationMenu setPage={setPage} />
        <div>
          <p className="editor-eyebrow">Character Builder</p>
          <h1>{character.name || "New Character"}</h1>
        </div>
        <div className="editor-header-meta">{selectedClass ? `${selectedClass.name}${selectedSubclass ? ` · ${selectedSubclass.name}` : ""} · Level ${character.classLevel}` : "Draft"}</div>
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
            <div>
              <span>{activeTab} · {tabs.indexOf(activeTab) + 1} of {tabs.length}</span>
              {saveError && <p className="editor-error" role="alert">{saveError}</p>}
            </div>
            <div>
              {tabs.indexOf(activeTab) > 0 && <button type="button" className="editor-button secondary" onClick={() => setActiveTab(tabs[tabs.indexOf(activeTab) - 1])}>Previous</button>}
              {tabs.indexOf(activeTab) < tabs.length - 1 && <button type="button" className="editor-button" onClick={() => setActiveTab(tabs[tabs.indexOf(activeTab) + 1])}>Next section</button>}
              {onSave && <button type="button" className="editor-button" onClick={save} disabled={isSaving}>{isSaving ? "Saving…" : "Save Character"}</button>}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}