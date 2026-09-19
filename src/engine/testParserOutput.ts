import { ParserOutputSchema } from "../schemas/parserOutput.js";

const parsed = ParserOutputSchema.safeParse({
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

if (!parsed.success) {
  console.error("PARSER OUTPUT INVALID:");
  console.error(parsed.error.issues);
  process.exit(1);
}

console.log("PARSER OUTPUT VALID:");
console.dir(parsed.data, { depth: null });