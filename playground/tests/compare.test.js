import { test } from "node:test";
import { strictEqual, throws } from "node:assert";
import { compare } from "../src/compare.js";

test("compares distance values - first larger", () => {
  const result = compare(5, "km", 3, "mi");
  strictEqual(result.larger, "5 km");
  strictEqual(result.equal, false);
  strictEqual(result.difference, 0.17);
});

test("compares distance values - second larger", () => {
  const result = compare(1, "mi", 2, "km");
  strictEqual(result.larger, "2 km");
  strictEqual(result.equal, false);
});

test("compares distance values - equal", () => {
  const result = compare(1, "km", 0.621371, "mi");
  strictEqual(result.equal, true);
  strictEqual(result.larger, "equal");
  strictEqual(result.difference, 0);
});

test("compares same unit - first larger", () => {
  const result = compare(10, "km", 5, "km");
  strictEqual(result.larger, "10 km");
  strictEqual(result.equal, false);
  strictEqual(result.difference, 5);
});

test("compares same unit - equal", () => {
  const result = compare(5, "km", 5, "km");
  strictEqual(result.equal, true);
  strictEqual(result.larger, "equal");
  strictEqual(result.difference, 0);
});

test("compares temperature values - first larger", () => {
  const result = compare(100, "C", 150, "F");
  strictEqual(result.larger, "100 C");
  strictEqual(result.equal, false);
});

test("compares temperature values - equal", () => {
  const result = compare(100, "C", 212, "F");
  strictEqual(result.equal, true);
  strictEqual(result.larger, "equal");
});

test("compares weight values - first larger", () => {
  const result = compare(500, "g", 1, "lb");
  strictEqual(result.larger, "500 g");
  strictEqual(result.equal, false);
});

test("compares weight values - second larger", () => {
  const result = compare(400, "g", 1, "lb");
  strictEqual(result.larger, "1 lb");
  strictEqual(result.equal, false);
});

test("compares weight values - equal", () => {
  const result = compare(453.59, "g", 1, "lb");
  strictEqual(result.equal, true);
  strictEqual(result.larger, "equal");
});

test("rejects comparison of different types", () => {
  throws(
    () => compare(5, "km", 100, "C"),
    /Cannot compare.*distance.*temperature/i,
    "Should throw error when comparing different unit types"
  );
});

test("rejects unknown unit", () => {
  throws(
    () => compare(5, "xyz", 3, "km"),
    /Unknown unit/i,
    "Should throw error for unknown unit"
  );
});

test("handles precision in difference calculation", () => {
  const result = compare(5, "km", 3, "mi");
  // Difference should be rounded to 2 decimal places (from config)
  strictEqual(result.difference, 0.17);
});

test("compares meters to kilometers", () => {
  const result = compare(1000, "m", 1, "km");
  strictEqual(result.equal, true);
  strictEqual(result.larger, "equal");
});

test("compares meters to miles", () => {
  const result = compare(1609, "m", 1, "mi");
  strictEqual(result.larger, "1609 m");
  strictEqual(result.equal, false);
});

test("compares grams to ounces", () => {
  const result = compare(100, "g", 3.53, "oz");
  strictEqual(result.larger, "3.53 oz");
  strictEqual(result.equal, false);
});

test("compares ounces to pounds", () => {
  const result = compare(16, "oz", 1, "lb");
  strictEqual(result.equal, true);
  strictEqual(result.larger, "equal");
});

test("compares Celsius to Kelvin", () => {
  const result = compare(0, "C", 273.15, "K");
  strictEqual(result.equal, true);
  strictEqual(result.larger, "equal");
});

test("compares Fahrenheit to Kelvin", () => {
  const result = compare(32, "F", 273.15, "K");
  strictEqual(result.equal, true);
  strictEqual(result.larger, "equal");
});
