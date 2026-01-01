import * as temperature from "./lib/temperature.js";
import * as distance from "./lib/distance.js";
import * as weight from "./lib/weight.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const defaults = JSON.parse(
  readFileSync(join(__dirname, "../config/defaults.json"), "utf-8")
);

function roundToPrecision(value, precision) {
  const multiplier = Math.pow(10, precision);
  return Math.round(value * multiplier) / multiplier;
}

function withPrecision(fn, precision) {
  return function (...args) {
    const result = fn.apply(this, args);
    return roundToPrecision(result, precision);
  };
}

function convertImpl(type, value, from, to) {
  value = typeof value === "string" ? Number(value) : value;
  if (typeof value !== "number" || isNaN(value)) {
    throw new Error("Invalid numeric value");
  }

  switch (type) {
    case "temperature":
      return temperature.convertTemperature(
        value,
        from || defaults.temperature.defaultFrom,
        to || defaults.temperature.defaultTo
      );
    case "distance":
      return distance.convertDistance(value, from, to);
    case "weight":
      return weight.convertWeight(value, from, to);
    default:
      throw new Error("Unknown type " + type);
  }
}

export const convert = withPrecision(convertImpl, defaults.precision);
