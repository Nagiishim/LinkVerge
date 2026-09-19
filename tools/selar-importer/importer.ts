import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const BASE_URL = "https://affiliates.selar.com";

const PRODUCT_TYPES = [
  { keyword: "ebook", type: "ebook" },
  { keyword: "course", type: "course" },
  { keyword: "template", type: "template" },
  { keyword: "guide", type: "guide" },
  { keyword: "software", type: "software" },
  { keyword: "community", type: "community" },
  { keyword: "bundle", type: "bundle" },
] as const;

const MAX_PAGES_PER_TYPE = 70;
const DELAY_MS = 250;

const INERTIA_VERSION =
  "0ce4a6c226ce913f336363c03b92e399";

interface SelarProduct {
  code?: string;
  id?: string;
  name?: string;
  description?: string | null;

  price?: string | number | null;
  currency?: string | null;

  product_url?: string | null;
  productUrl?: string | null;

  affiliateUrl?: string | null;
  affiliate_url?: string | null;

  finditProductType?: string | null;

  [key: string]: unknown;
}

type ProductType =
  | "ebook"
  | "course"
  | "template"
  | "guide"
  | "software"
  | "community"
  | "bundle"
  | "other";

type ClassifiedProduct =
  SelarProduct & {
    finditProductType: ProductType;
  };

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) =>
    setTimeout(resolve, ms)
  );
}

function classifyProduct(
  product: SelarProduct,
  searchedType: ProductType
): ProductType {
  const text = [
    product.name || "",
    product.description || "",
  ]
    .join(" ")
    .toLowerCase();

  if (
    text.includes("course") ||
    text.includes("masterclass") ||
    text.includes("training")
  ) {
    return "course";
  }

  if (
    text.includes("template") ||
    text.includes("canva") ||
    text.includes("notion")
  ) {
    return "template";
  }

  if (
    text.includes("software") ||
    text.includes("saas")
  ) {
    return "software";
  }

  if (
    text.includes("community") ||
    text.includes("membership")
  ) {
    return "community";
  }

  if (
    text.includes("bundle") ||
    text.includes("mega pack")
  ) {
    return "bundle";
  }

  if (
    text.includes("guide") ||
    text.includes("manual") ||
    text.includes("handbook")
  ) {
    return "guide";
  }

  if (
    text.includes("ebook") ||
    text.includes("e-book") ||
    text.includes("e book")
  ) {
    return "ebook";
  }

  return searchedType || "other";
}

async function saveCatalog(
  outputPath: string,
  products: ClassifiedProduct[]
): Promise<void> {
  await fs.writeFile(
    outputPath,
    JSON.stringify(
      products,
      null,
      2
    ),
    "utf8"
  );
}

async function main(): Promise<void> {
  console.log(
    "Connecting to your existing Chrome session..."
  );

  const browser =
    await chromium.connectOverCDP(
      "http://localhost:9222"
    );

  const context =
    browser.contexts()[0];

  const pages =
    context.pages();

  if (pages.length === 0) {
    throw new Error(
      "No Chrome pages found."
    );
  }

  const page = pages[0];

  console.log("Connected.");
  console.log(
    "Current page:",
    page.url()
  );

  await page.goto(
    `${BASE_URL}/explore`,
    {
      waitUntil:
        "domcontentloaded",
      timeout: 30000,
    }
  );

  const outputDir =
    path.join(
      process.cwd(),
      "tools",
      "selar-importer",
      "data"
    );

  const outputPath =
    path.join(
      outputDir,
      "multi-type-products.json"
    );

  await fs.mkdir(
    outputDir,
    {
      recursive: true,
    }
  );

  // --------------------------------------------------
  // LOAD EXISTING PROGRESS
  // --------------------------------------------------

  const productMap =
    new Map<
      string,
      ClassifiedProduct
    >();

  try {
    const existingRaw =
      await fs.readFile(
        outputPath,
        "utf8"
      );

    const existing =
      JSON.parse(
        existingRaw
      ) as ClassifiedProduct[];

    for (
      const product of existing
    ) {
      if (product.code) {
        productMap.set(
          String(product.code),
          product
        );
      }
    }

    console.log(
      `RESUMING: ${productMap.size} products already saved.`
    );
  } catch {
    console.log(
      "No existing catalog found. Starting fresh."
    );
  }

  // --------------------------------------------------
  // COLLECT PRODUCTS
  // --------------------------------------------------

  console.log(
    "\n======================================"
  );

  console.log(
    "MULTI-TYPE SELAR CATALOG"
  );

  console.log(
    "======================================"
  );

  for (
    const productType of PRODUCT_TYPES
  ) {
    console.log(
      `\n========== ${productType.keyword.toUpperCase()} ==========`
    );

    for (
      let pageNumber = 1;
      pageNumber <=
        MAX_PAGES_PER_TYPE;
      pageNumber++
    ) {
      const url =
        `${BASE_URL}/search?keyword=` +
        `${encodeURIComponent(
          productType.keyword
        )}` +
        `&page=${pageNumber}`;

      try {
        const result =
          await page.evaluate(
            async ({
              url,
              inertiaVersion,
            }) => {
              const response =
                await fetch(
                  url,
                  {
                    method:
                      "GET",
                    credentials:
                      "include",
                    headers: {
                      Accept:
                        "text/html, application/xhtml+xml",
                      "X-Inertia":
                        "true",
                      "X-Inertia-Version":
                        inertiaVersion,
                      "X-Requested-With":
                        "XMLHttpRequest",
                    },
                  }
                );

              return {
                status:
                  response.status,
                text:
                  await response.text(),
              };
            },
            {
              url,
              inertiaVersion:
                INERTIA_VERSION,
            }
          );

        if (
          result.status !==
          200
        ) {
          console.log(
            `Page ${pageNumber}: HTTP ${result.status}`
          );
          continue;
        }

        let payload: any;

        try {
          payload =
            JSON.parse(
              result.text
            );
        } catch {
          console.log(
            `Page ${pageNumber}: invalid JSON`
          );
          continue;
        }

        const products =
          payload?.props
            ?.products ?? [];

        if (
          !Array.isArray(
            products
          ) ||
          products.length === 0
        ) {
          console.log(
            `Page ${pageNumber}: 0 products — moving to next type.`
          );
          break;
        }

        let newProducts = 0;

        for (
          const product of products
        ) {
          if (
            !product?.code
          ) {
            continue;
          }

          const code =
            String(
              product.code
            );

          if (
            !productMap.has(
              code
            )
          ) {
            productMap.set(
              code,
              {
                ...product,
                finditProductType:
                  classifyProduct(
                    product,
                    productType.type
                  ),
              }
            );

            newProducts++;
          }
        }

        console.log(
          `Page ${pageNumber}: ${products.length} results | ` +
          `NEW: ${newProducts} | ` +
          `UNIQUE TOTAL: ${productMap.size}`
        );

        // Save after every page.
        await saveCatalog(
          outputPath,
          Array.from(
            productMap.values()
          )
        );

        await sleep(
          DELAY_MS
        );
      } catch (
        error
      ) {
        console.log(
          `Page ${pageNumber} failed: ${
            error instanceof Error
              ? error.message
              : "Unknown error"
          }`
        );

        console.log(
          "Stopping collection safely. Saved progress is preserved."
        );

        break;
      }
    }
  }

  const products =
    Array.from(
      productMap.values()
    );

  await saveCatalog(
    outputPath,
    products
  );

  console.log(
    "\n======================================"
  );

  console.log(
    "PRODUCT COLLECTION COMPLETE"
  );

  console.log(
    "======================================"
  );

  console.log(
    `Unique products: ${products.length}`
  );

  console.log(
    `Saved: ${outputPath}`
  );

  console.log(
    "======================================"
  );

  // --------------------------------------------------
  // AFFILIATE LINKS
  // --------------------------------------------------

  async function generateAffiliateLink(
    productCode: string
  ): Promise<string> {
    const result =
      await page.evaluate(
        async (code) => {
          const response =
            await fetch(
              `${location.origin}/product/get-link`,
              {
                method:
                  "POST",
                credentials:
                  "include",
                headers: {
                  Accept:
                    "application/json",
                  "Content-Type":
                    "application/json",
                  "X-Requested-With":
                    "XMLHttpRequest",
                },
                body:
                  JSON.stringify({
                    product_code:
                      code,
                  }),
              }
            );

          return {
            status:
              response.status,
            text:
              await response.text(),
          };
        },
        productCode
      );

    if (
      result.status !==
      200
    ) {
      throw new Error(
        `HTTP ${result.status}`
      );
    }

    const data =
      JSON.parse(
        result.text
      );

    if (
      data.status !==
        "success" ||
      !data.link
    ) {
      throw new Error(
        data.message ||
          "No affiliate link returned"
      );
    }

    return data.link;
  }

  let generated = 0;
  let existing = 0;
  let failed = 0;

  console.log(
    `\nGenerating affiliate links for ${products.length} products...`
  );

  for (
    let i = 0;
    i < products.length;
    i++
  ) {
    const product =
      products[i];

    if (
      !product.code
    ) {
      failed++;
      continue;
    }

    const current =
      typeof product.affiliateUrl ===
      "string"
        ? product.affiliateUrl
        : typeof product.affiliate_url ===
          "string"
        ? product.affiliate_url
        : null;

    if (
      current?.includes(
        "?affiliate="
      )
    ) {
      existing++;

      console.log(
        `[${i + 1}/${products.length}] existing`
      );

      continue;
    }

    try {
      const affiliateUrl =
        await generateAffiliateLink(
          product.code
        );

      products[i] = {
        ...product,
        affiliateUrl,
      };

      generated++;

      console.log(
        `[${i + 1}/${products.length}] generated`
      );
    } catch (
      error
    ) {
      failed++;

      console.log(
        `[${i + 1}/${products.length}] FAILED`
      );
    }

    // Save EVERY product.
    await saveCatalog(
      outputPath,
      products
    );

    await sleep(
      DELAY_MS
    );
  }

  // --------------------------------------------------
  // FINAL VERIFICATION
  // --------------------------------------------------

  const saved =
    JSON.parse(
      await fs.readFile(
        outputPath,
        "utf8"
      )
    ) as ClassifiedProduct[];

  const affiliateCount =
    saved.filter(
      (product) => {
        const url =
          typeof product.affiliateUrl ===
          "string"
            ? product.affiliateUrl
            : "";

        return url.includes(
          "?affiliate="
        );
      }
    ).length;

  const typeCount =
    saved.filter(
      (product) =>
        Boolean(
          product.finditProductType
        )
    ).length;

  console.log(
    "\n======================================"
  );

  console.log(
    "MULTI-TYPE IMPORT COMPLETE"
  );

  console.log(
    "======================================"
  );

  console.log(
    `Unique products: ${saved.length}`
  );

  console.log(
    `Affiliate links generated: ${generated}`
  );

  console.log(
    `Existing affiliate links: ${existing}`
  );

  console.log(
    `Failed: ${failed}`
  );

  console.log(
    `Products classified: ${typeCount}`
  );

  console.log(
    `Affiliate URLs saved: ${affiliateCount}`
  );

  console.log(
    "======================================"
  );

  if (
    affiliateCount !==
    saved.length
  ) {
    throw new Error(
      `Verification failed: ${affiliateCount}/${saved.length} have affiliate URLs.`
    );
  }

  console.log(
    "SUCCESS: Multi-type catalog persisted."
  );
}

main().catch(
  (error: unknown) => {
    console.error(
      "\nImporter failed:"
    );

    console.error(
      error
    );

    process.exit(1);
  }
);