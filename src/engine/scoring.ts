import type { Product } from "../schemas/product.js";
import type { SoftPreference } from "../schemas/intent.js";
import { resolveAttribute } from "./attributeResolver.js";

export function scoreCandidate(
  product: Product,
  preferences: SoftPreference[]
): number {
  let score = 0;

  for (const preference of preferences) {
    const actual = resolveAttribute(
      preference.attribute,
      product
    );

    if (matchesPreference(actual, preference.value)) {
      score += preference.weight;
    }
  }

  return score;
}

export function rankCandidates(
  products: Product[],
  preferences: SoftPreference[]
): Product[] {
  return [...products]
    .map((product) => ({
      product,
      score: scoreCandidate(product, preferences),
    }))
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return a.product.price - b.product.price;
    })
    .map((item) => item.product);
}

function matchesPreference(
  actual: unknown,
  expected: string | number | boolean
): boolean {
  if (
    typeof actual === "string" &&
    typeof expected === "string"
  ) {
    return actual
      .trim()
      .toLowerCase()
      .includes(expected.trim().toLowerCase());
  }

  return actual === expected;
}