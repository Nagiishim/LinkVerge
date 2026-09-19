import { filterCandidates } from "./candidateFilter.js";
import { rankCandidates } from "./scoring.js";
import { buildRecommendations } from "./recommendations.js";
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
  {
    attribute: "price",
    operator: "LESS_THAN_OR_EQUAL",
    value: 20000,
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

const recommendations = buildRecommendations(
  rankedCandidates,
  softPreferences
);

console.log("\nFINDIT RECOMMENDATIONS\n");

for (const recommendation of recommendations) {
  console.log(
    `${recommendation.title} | ₦${recommendation.price}`
  );

  for (const reason of recommendation.reasons) {
    console.log(`  ✓ ${reason}`);
  }

  console.log();
}

console.log(
  `Total recommendations: ${recommendations.length}`
);