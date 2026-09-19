import fs from "node:fs/promises";
import path from "node:path";

import type { Catalog } from "./catalogTypes.js";

const DATA_PATH = path.resolve(
  process.cwd(),
  "tools",
  "selar-importer",
  "data",
  "multi-type-products.json"
);

type FindItProductType =
  | "course"
  | "ebook"
  | "template"
  | "guide"
  | "community"
  | "software"
  | "bundle"
  | "other";

type SelarProduct = {
  code?: string;
  name?: string;
  description?: string | null;

  price?: string | number | null;
  currency?: string | null;

  affiliate_network_commission?: number | null;

  category_id?: number | null;

  product_url?: string | null;
  productUrl?: string | null;

  affiliateUrl?: string | null;
  affiliate_url?: string | null;

  finditProductType?: string | null;

  merchant_details?: {
    fullname?: string | null;
    profile_picture?: string | null;
  } | null;

  review_stats?: number | null;
  sales_count?: number | null;
};

function normalizeProductType(
  value: string | null | undefined
): FindItProductType {
  switch (
    value?.toLowerCase().trim()
  ) {
    case "course":
      return "course";

    case "ebook":
      return "ebook";

    case "template":
      return "template";

    case "guide":
      return "guide";

    case "community":
      return "community";

    case "software":
      return "software";

    case "bundle":
      return "bundle";

    default:
      return "other";
  }
}

function getProductUrl(
  product: SelarProduct
): string | null {
  return (
    product.product_url ||
    product.productUrl ||
    null
  );
}

function getAffiliateUrl(
  product: SelarProduct
): string | null {
  return (
    product.affiliateUrl ||
    product.affiliate_url ||
    null
  );
}

export const catalog: Catalog = {
  products: [],
  offers: [],
};

export async function initializeCatalog(): Promise<void> {
  console.log(
    "Reading catalog:",
    DATA_PATH
  );

  const raw = await fs.readFile(
    DATA_PATH,
    "utf8"
  );

  const source =
    JSON.parse(raw) as SelarProduct[];

  console.log(
    "Raw products found:",
    source.length
  );

  const validProducts =
    source.filter((product) => {
      return (
        product.code &&
        product.name &&
        getProductUrl(product)
      );
    });

  catalog.products =
    validProducts.map((product) => {
      const price =
        typeof product.price === "string"
          ? Number.parseFloat(
              product.price
            )
          : product.price ?? 0;

      const productUrl =
        getProductUrl(product)!;

      const affiliateUrl =
        getAffiliateUrl(product);

      return {
        product_id:
          product.code as string,

        title:
          product.name as string,

        creator:
          product.merchant_details
            ?.fullname ||
          "Unknown creator",

        description:
          product.description ||
          "No description available.",

        category:
          product.category_id !==
            null &&
          product.category_id !==
            undefined
            ? "Selar Category " +
              product.category_id
            : "Other",

        product_type:
          normalizeProductType(
            product.finditProductType
          ),

        price,

        currency:
          product.currency ||
          "NGN",

        rating:
          product.review_stats !==
            null &&
          product.review_stats !==
            undefined
            ? product.review_stats
            : undefined,

        attributes: {
          commission:
            product
              .affiliate_network_commission ||
            0,

          sales_count:
            product.sales_count ||
            0,
        },

        product_url:
          productUrl,

        affiliate_url:
          affiliateUrl ||
          productUrl,
      };
    });

  catalog.offers =
    validProducts.map((product) => {
      const price =
        typeof product.price === "string"
          ? Number.parseFloat(
              product.price
            )
          : product.price ?? 0;

      const productUrl =
        getProductUrl(product)!;

      const affiliateUrl =
        getAffiliateUrl(product);

      return {
        offer_id:
          product.code +
          "-selar",

        product_id:
          product.code as string,

        retailer_id:
          "selar",

        price,

        currency:
          "NGN",

        in_stock:
          true,

        product_url:
          productUrl,

        affiliate_url:
          affiliateUrl ||
          productUrl,

        seller_name:
          product.merchant_details
            ?.fullname ||
          undefined,

        shippable_locations:
          ["NG"],

        last_verified_at:
          new Date().toISOString(),
      };
    });

  console.log(
    "Valid products loaded:",
    catalog.products.length
  );

  const typeCounts =
    new Map<
      string,
      number
    >();

  for (
    const product of catalog.products
  ) {
    const type =
      product.product_type;

    typeCounts.set(
      type,
      (typeCounts.get(type) || 0) +
        1
    );
  }

  console.log(
    "Product types:"
  );

  for (
    const [type, count] of typeCounts
  ) {
    console.log(
      `  ${type}: ${count}`
    );
  }

  const affiliateCount =
    catalog.products.filter(
      (product) => {
        return (
          product.affiliate_url &&
          product.affiliate_url.includes(
            "?affiliate="
          )
        );
      }
    ).length;

  console.log(
    "Tracked affiliate links loaded:",
    affiliateCount
  );
}