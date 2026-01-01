export function convertWeight(value, from, to) {
  if (from === "g" && to === "oz") return value / 28.349523125;
  if (from === "oz" && to === "g") return value * 28.349523125;

  // 1959 international avoirdupois pound
  if (from === "g" && to === "lb") return value / 453.59237;
  if (from === "lb" && to === "g") return value * 453.59237;

  if (from === "oz" && to === "lb") return value / 16;
  if (from === "lb" && to === "oz") return value * 16;

  throw new Error(`Unsupported weight conversion: ${from} to ${to}`);
}
