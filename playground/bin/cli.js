#!/usr/bin/env node
import { convert } from "../src/convert.js";
import { compare } from "../src/compare.js";

const [,, type, value, from, to] = process.argv;

if (!type || !value) {
  console.error("Usage: convert <type> <value> [from] [to]");
  console.error("   or: convert compare <value1> <unit1> <value2> <unit2>");
  process.exit(1);
}

if (type === "compare") {
  const result = compare(Number(value), from, Number(to), process.argv[6]);
  
  if (result.equal) {
    console.log(`${value} ${from} equals ${to} ${process.argv[6]}`);
  } else {
    console.log(`${result.larger} is larger`);
    console.log(`Difference: ${result.difference} ${from}`);
  }
} else {
  const result = convert(type, Number(value), from, to);
  console.log(result);
}
