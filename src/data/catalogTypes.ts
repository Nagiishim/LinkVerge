import type { Product } from "../schemas/product.js";
import type { Offer } from "../schemas/offer.js";

export interface Catalog {
  products: Product[];
  offers: Offer[];
}