import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const BASE_URL = "https://affiliates.selar.com";
const KEYWORD = "ebook";
const MAX_PAGES = 70;
const INERTIA_VERSION = "0ce4a6c226ce913f336363c03b92e399";
const DELAY_MS = 250;
const SAVE_EVERY = 25;

interface SelarProduct {
  id?: string;
  name?: string;
  productUrl?: string | null;
  affiliateUrl?: string | null;
  [key: string]: unknown;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main(): Promise<void> {
  console.log("Connecting to your existing Chrome session...");

  const browser = await chromium.connectOverCDP(
    "http://localhost:9222"
  );

  const context = browser.contexts()[0];
  const pages = context.pages();

  if (pages.length === 0) {
    throw new Error("No Chrome pages found.");
  }

  const page = pages[0];

  console.log("Connected.");
  console.log("Current page:", page.url());

  await page.goto(`${BASE_URL}/explore`, {
    waitUntil: "domcontentloaded",
    timeout: 30000
  });

  console.log("Affiliate page:", page.url());

  const outputDir = path.join(
    process.cwd(),
    "tools",
    "selar-importer",
    "data"
  );

  const outputPath = path.join(
    outputDir,
    `${KEYWORD}-products.json`
  );

  await fs.mkdir(outputDir, {
    recursive: true
  });

  const results: SelarProduct[] = [];

  for (
    let pageNumber = 1;
    pageNumber <= MAX_PAGES;
    pageNumber++
  ) {
    const url =
      `${BASE_URL}/search?keyword=${encodeURIComponent(KEYWORD)}` +
      `&page=${pageNumber}`;

    console.log(
      `Fetching page ${pageNumber}/${MAX_PAGES}...`
    );

    const data = await page.evaluate(
      async ({ url, inertiaVersion }) => {
        const response = await fetch(url, {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "text/html, application/xhtml+xml",
            "X-Inertia": "true",
            "X-Inertia-Version": inertiaVersion,
            "X-Requested-With": "XMLHttpRequest"
          }
        });

        return {
          status: response.status,
          text: await response.text()
        };
      },
      {
        url,
        inertiaVersion: INERTIA_VERSION
      }
    );

    if (data.status !== 200) {
      console.log(
        `Page ${pageNumber} failed: HTTP ${data.status}`
      );
      continue;
    }

    let payload: any;

    try {
      payload = JSON.parse(data.text);
    } catch {
      console.log(
        `Page ${pageNumber}: invalid JSON`
      );
      continue;
    }

    const products =
      payload?.props?.products ?? [];

    console.log(
      `Found ${products.length} products.`
    );

    results.push(...products);
  }

  console.log(
    `Raw products collected: ${results.length}`
  );

  const uniqueProducts = Array.from(
    new Map(
      results
        .filter((product) => product?.id)
        .map((product) => [
          product.id,
          product
        ])
    ).values()
  );

  console.log(
    `Unique products: ${uniqueProducts.length}`
  );

  if (uniqueProducts.length === 0) {
    throw new Error("No products were found.");
  }

  async function saveCheckpoint(): Promise<void> {
    await fs.writeFile(
      outputPath,
      JSON.stringify(
        uniqueProducts,
        null,
        2
      ),
      "utf8"
    );

    console.log("Checkpoint saved.");
  }

  async function generateAffiliateLink(
    productId: string
  ): Promise<string> {
    const result = await page.evaluate(
      async (id) => {
        const response = await fetch(
          `${location.origin}/product/get-link`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              "X-Requested-With": "XMLHttpRequest"
            },
            body: JSON.stringify({
              product_code: id
            })
          }
        );

        return {
          status: response.status,
          text: await response.text()
        };
      },
      productId
    );

    if (result.status !== 200) {
      throw new Error(
        `HTTP ${result.status}`
      );
    }

    const data = JSON.parse(result.text);

    if (
      data.status !== "success" ||
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
  let skipped = 0;
  let failed = 0;

  console.log(
    `Generating affiliate links for ${uniqueProducts.length} products...`
  );

  for (
    let index = 0;
    index < uniqueProducts.length;
    index++
  ) {
    const product = uniqueProducts[index];

    if (!product.id) {
      skipped++;
      continue;
    }

    if (product.affiliateUrl) {
      skipped++;
      continue;
    }

    try {
      const affiliateUrl =
        await generateAffiliateLink(
          product.id
        );

      product.affiliateUrl =
        affiliateUrl;

      generated++;

      console.log(
        `[${index + 1}/${uniqueProducts.length}] ` +
        `${product.id} -> affiliate link generated`
      );
    } catch (error) {
      failed++;

      console.log(
        `[${index + 1}/${uniqueProducts.length}] ` +
        `${product.id} -> FAILED: ` +
        `${
          error instanceof Error
            ? error.message
            : "Unknown error"
        }`
      );
    }

    if (
      (index + 1) % SAVE_EVERY === 0
    ) {
      await saveCheckpoint();
    }

    await sleep(DELAY_MS);
  }

  await saveCheckpoint();

  console.log("==============================");
  console.log("AFFILIATE IMPORT COMPLETE");
  console.log("==============================");
  console.log(
    `Unique products: ${uniqueProducts.length}`
  );
  console.log(
    `Affiliate links generated: ${generated}`
  );
  console.log(
    `Already existing/skipped: ${skipped}`
  );
  console.log(
    `Failed: ${failed}`
  );
  console.log("==============================");
}

main().catch((error) => {
  console.error("Importer failed:");
  console.error(error);
  process.exit(1);
});