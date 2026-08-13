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

export const resistanceOptions = {};
