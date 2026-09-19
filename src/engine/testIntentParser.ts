import { parseIntent } from "./intentParser.js";

const intent = parseIntent({
  category: "laptop",
  location: "NG",
  hard_constraints: [
    {
      attribute: "price",
      operator: "LESS_THAN_OR_EQUAL",
      value: 700000,
    },
    {
      attribute: "ram_gb",
      operator: "GREATER_THAN_OR_EQUAL",
      value: 16,
    },
  ],
  soft_preferences: [
    {
      attribute: "battery_life_hours",
      value: 12,
      weight: 1,
    },
  ],
});

console.log("PARSED INTENT:");
console.dir(intent, { depth: null });