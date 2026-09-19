import type { Catalog } from "./catalogTypes.js";
import type { RetailerAdapter } from "./retailerAdapter.js";
import {
  normalizeProduct,
  normalizeOffer,
} from "./normalizer.js";

export async function loadCatalog(
  adapters: RetailerAdapter[]
): Promise<Catalog> {
  const productMap = new Map<
    string,
    ReturnType<typeof normalizeProduct>
  >();

  const offers: ReturnType<typeof normalizeOffer>[] = [];

  for (const adapter of adapters) {
    const rawCatalog = await adapter.fetchCatalog();

    for (const rawProduct of rawCatalog.products) {
      if (!productMap.has(rawProduct.product_id)) {
        productMap.set(
          rawProduct.product_id,
          normalizeProduct(rawProduct)
        );
      }
    }

    for (const rawOffer of rawCatalog.offers) {
      offers.push(normalizeOffer(rawOffer));
    }
  }

  return {
    products: Array.from(productMap.values()),
    offers,
  };
}