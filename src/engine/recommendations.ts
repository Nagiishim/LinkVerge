import type { Product } from "../schemas/product.js";
import type {
  HardConstraint,
  SoftPreference,
} from "../schemas/intent.js";

const MAX_RECOMMENDATIONS = 3;

type ScoredProduct = {
  product: Product;
  score: number;
  reasons: string[];
};

export function buildRecommendations(
  products: Product[],
  preferences: SoftPreference[],
  constraints: HardConstraint[] = []
) {
  const rankedProducts: ScoredProduct[] = products
    .map((product) => {
      const result = scoreProduct(
        product,
        preferences,
        constraints
      );

      return {
        product,
        score: result.score,
        reasons: result.reasons,
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      const salesA = getSalesCount(a.product);
      const salesB = getSalesCount(b.product);

      if (salesB !== salesA) {
        return salesB - salesA;
      }

      const ratingA = a.product.rating ?? 0;
      const ratingB = b.product.rating ?? 0;

      if (ratingB !== ratingA) {
        return ratingB - ratingA;
      }

      return a.product.title.localeCompare(
        b.product.title
      );
    });

  return rankedProducts
    .slice(0, MAX_RECOMMENDATIONS)
    .map(({ product, reasons }) => {
      return {
        product_id: product.product_id,
        title: product.title,
        creator: product.creator,
        description: product.description,
        category: product.category,
        product_type: product.product_type,

        price: product.price,
        currency: product.currency,

        rating: product.rating ?? null,

        product_url: product.product_url,
        affiliate_url: product.affiliate_url ?? null,

        reasons,
      };
    });
}

function scoreProduct(
  product: Product,
  preferences: SoftPreference[],
  constraints: HardConstraint[]
): {
  score: number;
  reasons: string[];
} {
  let score = 0;
  const reasons: string[] = [];

  /*
   * Explain satisfied hard constraints.
   */
  for (const constraint of constraints) {
    const attribute =
      constraint.attribute.toLowerCase().trim();

    if (attribute === "price") {
      if (
        typeof constraint.value === "number" &&
        constraint.operator === "LESS_THAN_OR_EQUAL"
      ) {
        reasons.push(
          `Within your ₦${constraint.value.toLocaleString()} budget.`
        );
      }
    }

    if (
      attribute === "product_type" ||
      attribute === "type"
    ) {
      if (
        product.product_type.toLowerCase() ===
        String(constraint.value).toLowerCase()
      ) {
        reasons.push(
          `Matches your preferred ${product.product_type} format.`
        );
      }
    }

    if (attribute === "topic") {
      const topic = String(constraint.value)
        .toLowerCase()
        .trim();

      const searchableText = [
        product.title,
        product.description,
        product.category,
        product.creator,
      ]
        .join(" ")
        .toLowerCase();

      if (searchableText.includes(topic)) {
        reasons.push(
          `Relevant to "${constraint.value}".`
        );
      }
    }
  }

  /*
   * Score and explain soft preferences.
   */
  for (const preference of preferences) {
    const attribute =
      preference.attribute.toLowerCase().trim();

    const expected = String(preference.value)
      .toLowerCase()
      .trim();

    const weight = preference.weight;

    if (
      attribute === "product_type" ||
      attribute === "type"
    ) {
      if (
        product.product_type
          .toLowerCase()
          .includes(expected)
      ) {
        score += 30 * weight;

        reasons.push(
          `Matches your preferred ${product.product_type} format.`
        );
      }
    }

    if (attribute === "category") {
      if (
        product.category
          .toLowerCase()
          .includes(expected)
      ) {
        score += 25 * weight;

        reasons.push(
          "Matches your requested category."
        );
      }
    }

    if (attribute === "creator") {
      if (
        product.creator
          .toLowerCase()
          .includes(expected)
      ) {
        score += 15 * weight;

        reasons.push(
          "Matches your preferred creator."
        );
      }
    }

    if (attribute === "difficulty") {
      const difficulty =
        getStringAttribute(product, "difficulty");

      if (
        difficulty &&
        difficulty.toLowerCase().includes(expected)
      ) {
        score += 20 * weight;

        reasons.push(
          `Matches your ${expected}-level preference.`
        );
      }
    }

    if (attribute === "style") {
      const style =
        getStringAttribute(product, "style");

      if (
        style &&
        style.toLowerCase().includes(expected)
      ) {
        score += 20 * weight;

        reasons.push(
          "Matches your preferred learning style."
        );
      }
    }

    if (attribute === "length") {
      const length =
        getStringAttribute(product, "length");

      if (
        length &&
        length.toLowerCase().includes(expected)
      ) {
        score += 15 * weight;

        reasons.push(
          "Matches your preferred length."
        );
      }
    }

    if (attribute === "coverage") {
      const coverage =
        getStringAttribute(product, "coverage");

      if (
        coverage &&
        coverage.toLowerCase().includes(expected)
      ) {
        score += 15 * weight;

        reasons.push(
          "Matches your preferred coverage."
        );
      }
    }
  }

  /*
   * Popularity signal.
   */
  const salesCount = getSalesCount(product);

  if (salesCount > 0) {
    score += Math.min(salesCount / 100, 10);

    reasons.push(
      `Has ${salesCount.toLocaleString()} recorded sales.`
    );
  }

  /*
   * Rating signal.
   */
  const rating = product.rating ?? 0;

  if (rating > 0) {
    score += rating * 2;

    reasons.push(
      `Rated ${rating.toFixed(1)}/5.`
    );
  }

  if (reasons.length === 0) {
    reasons.push(
      "Matches the requirements in your search."
    );
  }

  return {
    score,
    reasons: Array.from(new Set(reasons)).slice(0, 3),
  };
}

function getStringAttribute(
  product: Product,
  attribute: string
): string | undefined {
  const value = product.attributes[attribute];

  if (typeof value === "string") {
    return value;
  }

  return undefined;
}

function getSalesCount(
  product: Product
): number {
  const value = product.attributes.sales_count;

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  return 0;
}