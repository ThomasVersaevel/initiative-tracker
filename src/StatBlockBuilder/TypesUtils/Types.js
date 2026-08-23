export const defaultStats = {
  str: { value: 10, save: "+0", saveIsManual: false },
  dex: { value: 10, save: "+0", saveIsManual: false },
  con: { value: 10, save: "+0", saveIsManual: false },
  int: { value: 10, save: "+0", saveIsManual: false },
  wis: { value: 10, save: "+0", saveIsManual: false },
  cha: { value: 10, save: "+0", saveIsManual: false },
};

export const getAbilityModifier = (value) => {
  const modifier = Math.floor((Number(value) - 10) / 2);
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
};

export const normalizeStats = (stats = {}) =>
  Object.fromEntries(
    Object.entries(defaultStats).map(([stat, defaults]) => {
      const savedStat = stats[stat] || {};
      const value = savedStat.value ?? defaults.value;
      const save = savedStat.save ?? getAbilityModifier(value);

      return [stat, {
        ...defaults,
        ...savedStat,
        value,
        save,
        saveIsManual:
          savedStat.saveIsManual ?? save !== getAbilityModifier(value),
      }];
    }),
  );

export const challengeRatings = [
  { value: "0", label: "0", xp: "10", proficiencyBonus: "+2" },
  { value: "1/8", label: "1/8", xp: "25", proficiencyBonus: "+2" },
  { value: "1/4", label: "1/4", xp: "50", proficiencyBonus: "+2" },
  { value: "1/2", label: "1/2", xp: "100", proficiencyBonus: "+2" },
  { value: "1", label: "1", xp: "200", proficiencyBonus: "+2" },
  { value: "2", label: "2", xp: "450", proficiencyBonus: "+2" },
  { value: "3", label: "3", xp: "700", proficiencyBonus: "+2" },
  { value: "4", label: "4", xp: "1,100", proficiencyBonus: "+2" },
  { value: "5", label: "5", xp: "1,800", proficiencyBonus: "+3" },
  { value: "6", label: "6", xp: "2,300", proficiencyBonus: "+3" },
  { value: "7", label: "7", xp: "2,900", proficiencyBonus: "+3" },
  { value: "8", label: "8", xp: "3,900", proficiencyBonus: "+3" },
  { value: "9", label: "9", xp: "5,000", proficiencyBonus: "+4" },
  { value: "10", label: "10", xp: "5,900", proficiencyBonus: "+4" },
  { value: "11", label: "11", xp: "7,200", proficiencyBonus: "+4" },
  { value: "12", label: "12", xp: "8,400", proficiencyBonus: "+4" },
  { value: "13", label: "13", xp: "10,000", proficiencyBonus: "+5" },
  { value: "14", label: "14", xp: "11,500", proficiencyBonus: "+5" },
  { value: "15", label: "15", xp: "13,000", proficiencyBonus: "+5" },
  { value: "16", label: "16", xp: "15,000", proficiencyBonus: "+5" },
  { value: "17", label: "17", xp: "18,000", proficiencyBonus: "+6" },
  { value: "18", label: "18", xp: "20,000", proficiencyBonus: "+6" },
  { value: "19", label: "19", xp: "22,000", proficiencyBonus: "+6" },
  { value: "20", label: "20", xp: "25,000", proficiencyBonus: "+6" },
  { value: "21", label: "21", xp: "33,000", proficiencyBonus: "+7" },
  { value: "22", label: "22", xp: "41,000", proficiencyBonus: "+7" },
  { value: "23", label: "23", xp: "50,000", proficiencyBonus: "+7" },
  { value: "24", label: "24", xp: "62,000", proficiencyBonus: "+7" },
  { value: "25", label: "25", xp: "75,000", proficiencyBonus: "+8" },
];

export const getChallengeRating = (value) =>
  challengeRatings.find((rating) => rating.value === String(value)) ||
  challengeRatings[0];

export const formatSense = (sense) => {
  if (typeof sense === "string") return sense;

  return sense.range ? `${sense.name} ${sense.range} ft.` : sense.name;
};

export const defaultStatBlock = {
  name: "",
  portrait: null,
  hp: 0,
  ac: 0,
  legendary: false,

  speeds: [
    {
      type: "walk",
      value: 30,
    },
  ],

  stats: defaultStats,

  traits: {
    resistances: [],
    senses: [],
    languages: [],
    challengeRating: 0,
  },

  abilities: {
    abilities: [],
  },

  attacks: {
    multiattack: {
      enabled: false,
      attacks: [],
    },
    attacks: [],
  },

  size: {
    width: 600,
    height: 700,
  },

  theme: "default",
};
