import { test } from "node:test";
import { strictEqual } from "node:assert";
import { convertTemperature } from "../src/lib/temperature.js";

test("converts Celsius to Fahrenheit", () => {
  strictEqual(convertTemperature(0, "C", "F"), 32);
  strictEqual(convertTemperature(100, "C", "F"), 212);
});

test("converts Fahrenheit to Celsius", () => {
  strictEqual(convertTemperature(32, "F", "C"), 0);
  strictEqual(convertTemperature(212, "F", "C"), 100);
});

test("converts Celsius to Kelvin", () => {
  strictEqual(convertTemperature(0, "C", "K"), 273.15);
  strictEqual(convertTemperature(-273.15, "C", "K"), 0);
  strictEqual(convertTemperature(100, "C", "K"), 373.15);
});

test("converts Kelvin to Celsius", () => {
  strictEqual(convertTemperature(273.15, "K", "C"), 0);
  strictEqual(convertTemperature(0, "K", "C"), -273.15);
  strictEqual(convertTemperature(373.15, "K", "C"), 100);
});

test("converts Fahrenheit to Kelvin", () => {
  strictEqual(convertTemperature(32, "F", "K"), 273.15);
  strictEqual(convertTemperature(212, "F", "K"), 373.15);
});

test("converts Kelvin to Fahrenheit", () => {
  strictEqual(convertTemperature(273.15, "K", "F"), 32);
  strictEqual(convertTemperature(373.15, "K", "F"), 212);
});
