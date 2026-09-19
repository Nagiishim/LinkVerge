import type { Product } from "../schemas/product.js";

export function resolveAttribute(
  attribute: string,
  product: Product
): unknown {
  const normalizedAttr = attribute.trim().toLowerCase();

  switch (normalizedAttr) {
    case "product_id":
      return product.product_id;

    case "title":
      return product.title;

    case "creator":
      return product.creator;

    case "description":
      return product.description;

    case "category":
      return product.category;

    case "product_type":
    case "type":
      return product.product_type;

    case "price":
      return product.price;

    case "currency":
      return product.currency;

    case "rating":
      return product.rating;

    default:
      return product.attributes[normalizedAttr];
  }
}