import { filterCandidates } from "./candidateFilter.js";
import { rankCandidates } from "./scoring.js";
import { mockProducts } from "../data/mockData.js";
import type {
  HardConstraint,
  SoftPreference,
} from "../schemas/intent.js";

const hardConstraints: HardConstraint[] = [
  {
    attribute: "category",
    operator: "EQUALS",
    value: "Tech & Coding",
  },
];

const softPreferences: SoftPreference[] = [
  {
    attribute: "level",
    value: "beginner",
    weight: 1,
  },
];

const candidates = filterCandidates(
  mockProducts,
  hardConstraints
);

const rankedCandidates = rankCandidates(
  candidates,
  softPreferences
);

console.log("\nRANKED CANDIDATES:");

for (const product of rankedCandidates) {
  console.log(
    `- ${product.title} | ₦${product.price}`
  );
}