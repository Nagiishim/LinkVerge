import fs from "node:fs/promises";
import path from "node:path";

import type {
  RetailerAdapter,
  RetailerCatalog,
} from "./retailerAdapter.js";

const DATA_PATH = path.join(
  process.cwd(),
  "tools",
  "selar-importer",
  "data",
  "findit-ebook-products.json"
);

interface SelarImage {
  image_path?: string;
}

interface SelarMerchant {
  id?: number | null;
  name?: string | null;
  username?: string | null;
  storeUrl?: string | null;
}

interface SelarProduct {
  id: string;
  name: string;
  description?: string | null;
  price?: number | null;
  currency?: string | null;
  commission?: number | null;
  categoryId?: number | null;
  images?: SelarImage[];
  productUrl?: string | null;
  merchant?: SelarMerchant | null;
  salesCount?: number | null;
  rating?: number | null;
  physicalProduct?: boolean;
  productTypeId?: number | null;
}

export const selarAdapter: RetailerAdapter = {
  retailerId: "selar",

  async fetchCatalog(): Promise<RetailerCatalog> {
    const file = await fs.readFile(DATA_PATH, "utf8");

    const products = JSON.parse(file) as SelarProduct[];

    const validProducts = products.filter(
      (product) =>
        product.id &&
        product.name &&
        product.productUrl
    );

    const rawProducts = validProducts.map((product) => ({
      product_id: product.id,
      title: product.name,
      creator:
        product.merchant?.name ??
        product.merchant?.username ??
        "Unknown creator",
      description:
        product.description ??
        "No description available.",
      category:
        product.categoryId !== null &&
        product.categoryId !== undefined
          ? `Selar Category ${product.categoryId}`
          : "Other",
      product_type: "ebook" as const,
      price: product.price ?? 0,
      currency: product.currency ?? "NGN",
      rating: product.rating ?? undefined,
      attributes: {
        images:
          product.images
            ?.map((image) => image.image_path)
            .filter(
              (image): image is string => Boolean(image)
            ) ?? [],
        commission: product.commission ?? 0,
        sales_count: product.salesCount ?? 0,
      },
      product_url: product.productUrl!,
      affiliate_url: product.productUrl!,
    }));

    const rawOffers = validProducts.map((product) => ({
      offer_id: `${product.id}-selar`,
      product_id: product.id,
      retailer_id: "selar",
      price: product.price ?? 0,
      currency: "NGN" as const,
      in_stock: true,
      product_url: product.productUrl!,
      affiliate_url: product.productUrl!,
      seller_name:
        product.merchant?.name ??
        product.merchant?.username ??
        undefined,
      shippable_locations: ["NG"],
      last_verified_at: new Date().toISOString(),
    }));

    return {
      products: rawProducts,
      offers: rawOffers,
    };
  },
};