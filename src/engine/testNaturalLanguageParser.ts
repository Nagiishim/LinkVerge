import { parseNaturalLanguage } from "./naturalLanguageParser.js";

const request =
  "I need a laptop under ₦700k with at least 16GB RAM and around 12 hours battery life";

try {
  const intent = parseNaturalLanguage(request);

  console.log("USER REQUEST:");
  console.log(request);

  console.log("\nPARSED INTENT:");
  console.dir(intent, { depth: null });
} catch (error) {
  console.error("PARSER ERROR:");
  console.error(error);
  process.exit(1);
}