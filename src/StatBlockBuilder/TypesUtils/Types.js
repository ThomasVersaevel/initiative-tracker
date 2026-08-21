export const defaultStats = {
  str: { value: 10, save: "+0" },
  dex: { value: 10, save: "+0" },
  con: { value: 10, save: "+0" },
  int: { value: 10, save: "+0" },
  wis: { value: 10, save: "+0" },
  cha: { value: 10, save: "+0" },
};

export const defaultStatBlock = {
  name: "",
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

  attacks: [],

  size: {
    width: 600,
    height: 700,
  },

  theme: "default",
};
