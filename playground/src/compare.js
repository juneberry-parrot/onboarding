import { convert } from "./convert.js";
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

function determineType(unit) {
  const distanceUnits = ["km", "mi", "m"];
  const weightUnits = ["g", "oz", "lb"];
  const temperatureUnits = ["C", "F", "K"];

  if (distanceUnits.includes(unit)) return "distance";
  if (weightUnits.includes(unit)) return "weight";
  if (temperatureUnits.includes(unit)) return "temperature";
  throw new Error(`Unknown unit: ${unit}`);
}

export function compare(value1, unit1, value2, unit2) {
  const type1 = determineType(unit1);
  const type2 = determineType(unit2);

  if (type1 !== type2) {
    throw new Error(`Cannot compare ${unit1} (${type1}) with ${unit2} (${type2})`);
  }

  const converted2 = unit1 === unit2 ? value2 : convert(type1, value2, unit2, unit1);
  const diff = Math.abs(value1 - converted2);
  const larger = value1 > converted2 ? 1 : value1 < converted2 ? 2 : 0;

  return {
    larger: larger === 1 ? `${value1} ${unit1}` : larger === 2 ? `${value2} ${unit2}` : "equal",
    difference: roundToPrecision(diff, defaults.precision),
    equal: larger === 0
  };
}
