import type {
  RetailerAdapter,
  RetailerCatalog,
} from "./retailerAdapter.js";

import { mockProducts } from "./mockData.js";

export class MockRetailerAdapter
  implements RetailerAdapter
{
  retailerId = "mock-retailer";

  async fetchCatalog(): Promise<RetailerCatalog> {
    return {
      products: mockProducts.map((product) => ({
        product_id: product.product_id,
        title: product.title,
        creator: product.creator,
        description: product.description,
        category: product.category,
        product_type: product.product_type,
        price: product.price,
        currency: product.currency,
        rating: product.rating,
        attributes: product.attributes,
        product_url: product.product_url,
        affiliate_url: product.affiliate_url,
      })),

      offers: [],
    };
  }
}