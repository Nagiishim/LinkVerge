import type { Product } from "../schemas/product.js";
import type { HardConstraint } from "../schemas/intent.js";
import { evaluateOperator } from "./operators.js";

function getAttribute(
  product: Product,
  attribute: string
): string | number | boolean | string[] | undefined {
  const key = attribute.toLowerCase().trim();

  switch (key) {
    case "price":
      return product.price;

    case "category":
      return product.category;

    case "product_type":
    case "type":
      return product.product_type;

    case "creator":
      return product.creator;

    case "title":
      return product.title;

    case "description":
      return product.description;

    case "topic":
      return [
        product.title,
        product.description,
        product.category,
        product.creator,
      ]
        .filter(Boolean)
        .join(" ");

    default:
      return product.attributes[key];
  }
}

export function filterCandidates(
  products: Product[],
  constraints: HardConstraint[],
  categoryTarget?: string
): Product[] {
  return products.filter((product) => {
    if (
      categoryTarget &&
      categoryTarget !== "unsupported_physical_product" &&
      product.category.toLowerCase() !==
        categoryTarget.toLowerCase()
    ) {
      return false;
    }

    return constraints.every((constraint) => {
      const actual = getAttribute(
        product,
        constraint.attribute
      );

      if (actual === undefined) {
        return false;
      }

      return evaluateOperator(
        actual,
        constraint.operator,
        constraint.value
      );
    });
  });
}