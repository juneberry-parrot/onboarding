export function convertDistance(value, from, to) {
  if (from === "km" && to === "mi") return value / 1.609344;
  if (from === "mi" && to === "km") return value * 1.609344;

  // SI definition
  if (from === "km" && to === "m") return value * 1000;
  if (from === "m" && to === "km") return value / 1000;

  // 1959 international mile
  if (from === "mi" && to === "m") return value * 1.609344;
  if (from === "m" && to === "mi") return value / 1.609344;

  throw new Error(`Unsupported distance conversion: ${from} to ${to}`);
}
