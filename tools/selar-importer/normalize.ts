import fs from "node:fs/promises";
import path from "node:path";

type SelarProduct = {
  code?: string;
  name?: string;
  description?: string;

  price?: number | string | null;
  original_price?: number | string | null;
  currency?: string | null;

  affiliate_network_commission?: number | string | null;

  merchant_id?: number | string | null;
  merchant_store_url?: string | null;

  category_id?: number | string | null;
  sub_category_id?: number | string | null;

  images?: unknown[];

  product_url?: string | null;

  merchant_details?: {
    name?: string | null;
    username?: string | null;
    profile_picture?: string | null;
  } | null;

  sales_count?: number | null;

  review_stats?: {
    average?: number | null;
    count?: number | null;
  } | null;

  featured?: boolean;
  hot_product?: boolean;
  physical_product?: boolean;

  product_type_id?: number | string | null;

  created_at?: string | null;
};

type FindItProduct = {
  id: string;
  name: string;
  description: string;

  price: number | null;
  originalPrice: number | null;
  currency: string | null;
  commission: number | null;

  categoryId: number | string | null;
  subCategoryId: number | string | null;

  images: unknown[];
  productUrl: string | null;

  merchant: {
    id: number | string | null;
    name: string | null;
    username: string | null;
    profilePicture: string | null;
    storeUrl: string | null;
  };

  salesCount: number;

  rating: number | null;
  reviewCount: number | null;

  featured: boolean;
  hotProduct: boolean;
  physicalProduct: boolean;

  productTypeId: number | string | null;
  createdAt: string | null;

  source: "selar";
};

function toNumber(
  value: number | string | null | undefined
): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

function cleanText(
  value: string | null | undefined
): string {
  if (!value) {
    return "";
  }

  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

async function main() {
  const inputPath = path.join(
    process.cwd(),
    "tools",
    "selar-importer",
    "data",
    "ebook-products.json"
  );

  const outputPath = path.join(
    process.cwd(),
    "tools",
    "selar-importer",
    "data",
    "findit-ebook-products.json"
  );

  console.log("Reading raw Selar catalog...");

  const rawText = await fs.readFile(
    inputPath,
    "utf8"
  );

  const products: SelarProduct[] =
    JSON.parse(rawText);

  console.log(
    `Raw products: ${products.length}`
  );

  const normalized: FindItProduct[] =
    products
      .filter((product) => product?.code)
      .map((product) => ({
        id: product.code!,

        name: cleanText(product.name),

        description: cleanText(
          product.description
        ),

        price: toNumber(product.price),

        originalPrice: toNumber(
          product.original_price
        ),

        currency: product.currency ?? null,

        commission: toNumber(
          product.affiliate_network_commission
        ),

        categoryId:
          product.category_id ?? null,

        subCategoryId:
          product.sub_category_id ?? null,

        images: Array.isArray(product.images)
          ? product.images
          : [],

        productUrl:
          product.product_url ?? null,

        merchant: {
          id: product.merchant_id ?? null,

          name:
            product.merchant_details?.name ??
            null,

          username:
            product.merchant_details?.username ??
            null,

          profilePicture:
            product.merchant_details
              ?.profile_picture ?? null,

          storeUrl:
            product.merchant_store_url ?? null,
        },

        salesCount:
          product.sales_count ?? 0,

        rating:
          product.review_stats?.average ?? null,

        reviewCount:
          product.review_stats?.count ?? null,

        featured:
          Boolean(product.featured),

        hotProduct:
          Boolean(product.hot_product),

        physicalProduct:
          Boolean(product.physical_product),

        productTypeId:
          product.product_type_id ?? null,

        createdAt:
          product.created_at ?? null,

        source: "selar",
      }));

  await fs.writeFile(
    outputPath,
    JSON.stringify(
      normalized,
      null,
      2
    ),
    "utf8"
  );

  console.log(
    "\nNormalization complete."
  );

  console.log(
    `Normalized products: ${normalized.length}`
  );

  console.log(
    `Saved to: ${outputPath}`
  );
}

main().catch((error) => {
  console.error(
    "\nNormalization failed:"
  );

  console.error(error);

  process.exit(1);
});