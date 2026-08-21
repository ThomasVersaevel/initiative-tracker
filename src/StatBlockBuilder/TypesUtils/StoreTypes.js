import {
  faMountain,
  faSwimmer,
  faPersonRunning,
  faWind,
} from "@fortawesome/free-solid-svg-icons";

export const speedOptions = [
  {
    type: "walk",
    label: "Walking speed",
    icon: faPersonRunning,
    defaultValue: 30,
  },
  {
    type: "fly",
    label: "Flying speed",
    icon: faWind,
    defaultValue: 30,
  },
  {
    type: "climb",
    label: "Climbing speed",
    icon: faMountain,
    defaultValue: 30,
  },
  {
    type: "swim",
    label: "Swimming speed",
    icon: faSwimmer,
    defaultValue: 30,
  },
];

export const resistanceOptions = [
  "lightning",
  "thunder",
  "acid",
  "fire",
  "poison",
  "psychic",
  "necrotic",
  "radiant",
];

export const sensesOptions = [
  "darkvision",
  "blindsight",
  "truesight",
  "tremmorsense",
];

export const languageOptions = [
  "All",
  "Abyssal",
  "Aquan",
  "Auran",
  "Celestial",
  "Common",
  "Deep Speech",
  "Draconic",
  "Dwarvish",
  "Elvish",
  "Giant",
  "Gnomish",
  "Goblin",
  "Halfling",
  "Ignan",
  "Infernal",
  "Orc",
  "Primordial",
  "Terran",
  "Sylvan",
  "Undercommon",
];

export const traitOptions = {
  resistances: resistanceOptions,
  senses: sensesOptions,
  languages: languageOptions,
};
