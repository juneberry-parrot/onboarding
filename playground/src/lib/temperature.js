export function convertTemperature(value, from, to) {
  if (from === "C" && to === "F") {
    return value * (9 / 5) + 32;
  }
  if (from === "F" && to === "C") {
    return (value - 32) * (5 / 9);
  }

  // NIST ITS-90 absolute zero offset
  if (from === "C" && to === "K") {
    return value + 273.15;
  }
  if (from === "K" && to === "C") {
    return value - 273.15;
  }

  if (from === "F" && to === "K") {
    return (value - 32) * (5 / 9) + 273.15;
  }
  if (from === "K" && to === "F") {
    return (value - 273.15) * (9 / 5) + 32;
  }

  throw new Error(`Unsupported temperature conversion: ${from} to ${to}`);
}
