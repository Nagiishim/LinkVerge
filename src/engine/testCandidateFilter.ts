import { filterCandidates } from "./candidateFilter.js";
import { mockProducts } from "../data/mockData.js";
import type { HardConstraint } from "../schemas/intent.js";

const constraints: HardConstraint[] = [
  {
    attribute: "price",
    operator: "LESS_THAN_OR_EQUAL",
    value: 15000,
  },
];

const candidates = filterCandidates(
  mockProducts,
  constraints,
  "Tech & Coding"
);

console.log("\nMATCHING CANDIDATES:");

for (const product of candidates) {
  console.log(
    `- ${product.title} | ₦${product.price}`
  );
}

console.log(`\nTotal matches: ${candidates.length}`);