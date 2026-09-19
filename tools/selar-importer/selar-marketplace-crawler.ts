import { chromium, type Locator, type Page } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const BASE_URL = "https://affiliates.selar.com";
const OUTPUT_DIR = path.join(process.cwd(), "tools", "selar-importer", "data");
const OUTPUT_PATH = path.join(OUTPUT_DIR, "multi-type-products.json");
const META_PATH = path.join(OUTPUT_DIR, "exhaustive-marketplace-meta.json");

const DELAY_MS = 250;
const MAX_PAGE_SAFETY = 3000;
const MAX_RETRIES = 2;

type ProductType =
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
  id?: string;
  name?: string;
  description?: string | null;
  price?: string | number | null;
  currency?: string | null;
  affiliate_network_commission?: number | string | null;
  category_id?: number | null;
  sub_category_id?: number | null;
  product_url?: string | null;
  affiliateUrl?: string | null;
  affiliate_url?: string | null;
  affiliate_url_generated?: boolean | null;
  finditProductType?: ProductType | null;
  merchant_details?: {
    fullname?: string | null;
    profile_picture?: string | null;
  } | null;
  review_stats?: number | null;
  sales_count?: number | null;
  physical_product?: boolean | number | null;
  deactivated?: boolean | number | null;
  show_in_affiliate?: boolean | number | null;
  show_in_marketplace?: boolean | number | null;
  [key: string]: unknown;
};

type SelarSubCategory = {
  id: number;
  name: string;
};

type SelarCategory = {
  id: number;
  name: string;
  slug?: string;
  for_physical_product?: number;
  products_count?: number;
  sub_categories?: SelarSubCategory[];
};

type FilterTarget = {
  label: string;
  kind: "all" | "category" | "subcategory";
  categoryName?: string;
  categoryId?: number;
  subCategoryId?: number;
  discoveredUrl?: string;
};

type SearchResponse = {
  status: number;
  text: string;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function classifyProduct(
  product: SelarProduct
): ProductType {
  const text = [product.name ?? "", product.description ?? ""]
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

  if (text.includes("software") || text.includes("saas")) {
    return "software";
  }

  if (text.includes("community") || text.includes("membership")) {
    return "community";
  }

  if (text.includes("bundle") || text.includes("mega pack")) {
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

  return "other";
}

function isMarketplaceProduct(product: SelarProduct): boolean {
  if (product.deactivated === true || product.deactivated === 1) {
    return false;
  }

  if (product.physical_product === true || product.physical_product === 1) {
    return false;
  }

  if (
    product.show_in_affiliate === false ||
    product.show_in_affiliate === 0
  ) {
    return false;
  }

  return true;
}

async function saveCatalog(
  productMap: Map<string, SelarProduct>
): Promise<void> {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  await fs.writeFile(
    OUTPUT_PATH,
    JSON.stringify(Array.from(productMap.values()), null, 2),
    "utf8"
  );
}

async function loadCatalog(): Promise<Map<string, SelarProduct>> {
  const productMap = new Map<string, SelarProduct>();

  try {
    const raw = await fs.readFile(OUTPUT_PATH, "utf8");
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return productMap;
    }

    for (const value of parsed) {
      if (
        value &&
        typeof value === "object" &&
        typeof (value as SelarProduct).code === "string"
      ) {
        const product = value as SelarProduct;

        if (!product.finditProductType) {
          product.finditProductType = classifyProduct(product);
        }

        productMap.set(product.code!, product);
      }
    }
  } catch {
    // Start fresh.
  }

  return productMap;
}

function parseJson(text: string): any | null {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function extractProducts(payload: any): SelarProduct[] {
  const candidates: unknown[] = [
    payload?.props?.products,
    payload?.props?.products?.data,
    payload?.props?.products?.data?.data,
    payload?.props?.data?.products,
  ];

  for (const candidate of candidates) {
    if (!Array.isArray(candidate)) {
      continue;
    }

    return candidate.filter(
      (item): item is SelarProduct =>
        Boolean(
          item &&
          typeof item === "object" &&
          typeof (item as SelarProduct).code === "string"
        )
    );
  }

  return [];
}

function extractPagination(payload: any): {
  currentPage: number | null;
  lastPage: number | null;
  total: number | null;
} {
  const container = payload?.props?.products;

  const meta =
    container?.meta ??
    payload?.props?.meta ??
    container?.paginator ??
    payload?.props?.paginator ??
    null;

  const currentPage = Number(
    meta?.current_page ?? meta?.currentPage ?? meta?.page
  );

  const lastPage = Number(
    meta?.last_page ?? meta?.lastPage ?? meta?.pages
  );

  const total = Number(meta?.total);

  return {
    currentPage: Number.isFinite(currentPage) ? currentPage : null,
    lastPage: Number.isFinite(lastPage) ? lastPage : null,
    total: Number.isFinite(total) ? total : null,
  };
}

function extractCategories(payload: any): SelarCategory[] {
  const categories = payload?.props?.categories;

  if (!Array.isArray(categories)) {
    return [];
  }

  return categories.filter(
    (category): category is SelarCategory =>
      Boolean(
        category &&
        typeof category === "object" &&
        Number.isFinite(Number(category.id)) &&
        typeof category.name === "string"
      )
  );
}

async function getInertiaVersion(page: Page): Promise<string> {
  return page.evaluate(() => {
    const raw = document.querySelector("#app")?.getAttribute("data-page");

    if (!raw) {
      throw new Error("Missing Inertia page data.");
    }

    const data = JSON.parse(raw) as { version?: string };

    if (!data.version) {
      throw new Error("Missing Inertia version.");
    }

    return data.version;
  });
}

async function readCurrentPayload(page: Page): Promise<any> {
  const raw = await page.locator("#app").getAttribute("data-page");

  if (!raw) {
    throw new Error("Missing #app data-page.");
  }

  return JSON.parse(raw);
}

async function visibleExactTextLocator(
  page: Page,
  text: string
): Promise<Locator | null> {
  const candidates = page.getByText(text, { exact: true });
  const count = await candidates.count();

  for (let i = 0; i < count; i += 1) {
    const candidate = candidates.nth(i);

    if (await candidate.isVisible().catch(() => false)) {
      return candidate;
    }
  }

  return null;
}

async function discoverTargetUrl(
  page: Page,
  target: FilterTarget
): Promise<string | null> {
  await page.goto(`${BASE_URL}/explore`, {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });

  await sleep(400);

  if (target.kind === "all") {
    return `${BASE_URL}/explore`;
  }

  const categoryLocator = await visibleExactTextLocator(
    page,
    target.categoryName ?? target.label
  );

  if (!categoryLocator) {
    console.log(`FILTER NOT FOUND: ${target.label}`);
    return null;
  }

  const before = page.url();

  await categoryLocator.click();

  await sleep(700);

  let after = page.url();

  if (after === before) {
    await sleep(700);
    after = page.url();
  }

  if (target.kind === "category") {
    return after !== before ? after : null;
  }

  if (!target.categoryName) {
    return null;
  }

  const subLocator = await visibleExactTextLocator(
    page,
    target.label
  );

  if (!subLocator) {
    console.log(`SUBCATEGORY NOT FOUND: ${target.label}`);
    return null;
  }

  const subBefore = page.url();

  await subLocator.click();

  await sleep(700);

  const subAfter = page.url();

  if (subAfter === subBefore && subAfter === before) {
    return null;
  }

  return subAfter;
}

function withPage(
  baseUrl: string,
  pageNumber: number
): string {
  const url = new URL(baseUrl);

  url.searchParams.set("page", String(pageNumber));

  return url.toString();
}

async function fetchInertiaUrl(
  page: Page,
  url: string,
  inertiaVersion: string
): Promise<SearchResponse> {
  return page.evaluate(
    async ({ targetUrl, version }) => {
      const response = await fetch(targetUrl, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "text/html, application/xhtml+xml",
          "X-Inertia": "true",
          "X-Inertia-Version": version,
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      return {
        status: response.status,
        text: await response.text(),
      };
    },
    {
      targetUrl: url,
      version: inertiaVersion,
    }
  );
}

async function generateAffiliateLink(
  page: Page,
  productCode: string
): Promise<string> {
  const result = await page.evaluate(async (code) => {
    const response = await fetch("/product/get-link", {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify({ product_code: code }),
    });

    return {
      status: response.status,
      text: await response.text(),
    };
  }, productCode);

  if (result.status !== 200) {
    throw new Error(`HTTP ${result.status}`);
  }

  const data = JSON.parse(result.text) as {
    status?: string;
    link?: string;
    message?: string;
  };

  if (data.status !== "success" || !data.link) {
    throw new Error(data.message ?? "No affiliate link returned.");
  }

  return data.link;
}

async function main(): Promise<void> {
  const browser = await chromium.connectOverCDP("http://localhost:9222");
  const context = browser.contexts()[0];

  if (!context) {
    throw new Error("No Chrome browser context found.");
  }

  const pages = context.pages();

  if (pages.length === 0) {
    throw new Error(
      "No Chrome pages found. Open the Selar Affiliate Network first."
    );
  }

  const page = pages[0];

  await page.goto(`${BASE_URL}/explore`, {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });

  let inertiaVersion = await getInertiaVersion(page);
  const initialPayload = await readCurrentPayload(page);
  const allCategories = extractCategories(initialPayload);

  const digitalCategories = allCategories.filter(
    (category) => category.for_physical_product !== 1
  );

  console.log(
    `Discovered ${allCategories.length} top-level Selar categories; ${digitalCategories.length} are digital categories.`
  );

  const targets: FilterTarget[] = [
    {
      label: "ALL",
      kind: "all",
    },
  ];

  for (const category of digitalCategories) {
    targets.push({
      label: category.name,
      kind: "category",
      categoryName: category.name,
      categoryId: category.id,
    });

    for (const subCategory of category.sub_categories ?? []) {
      targets.push({
        label: subCategory.name,
        kind: "subcategory",
        categoryName: category.name,
        categoryId: category.id,
        subCategoryId: subCategory.id,
      });
    }
  }

  console.log(
    `Filter targets queued: ${targets.length}`
  );

  const productMap = await loadCatalog();

  console.log(
    `RESUMING: ${productMap.size} products already saved.`
  );

  const discoveredTargets: FilterTarget[] = [];

  for (const target of targets) {
    const discoveredUrl = await discoverTargetUrl(page, target);

    if (!discoveredUrl) {
      continue;
    }

    target.discoveredUrl = discoveredUrl;
    discoveredTargets.push(target);

    console.log(
      `FILTER: ${target.label} -> ${discoveredUrl}`
    );
  }

  console.log(
    `Discovered usable filter URLs: ${discoveredTargets.length}/${targets.length}`
  );

  const visitedPages = new Set<string>();
  const totalsSeen = new Set<number>();
  let pagesFetched = 0;

  for (const target of discoveredTargets) {
    if (!target.discoveredUrl) {
      continue;
    }

    console.log(
      `\n========== ${target.kind.toUpperCase()}: ${target.label} ==========`
    );

    const signatures = new Set<string>();

    for (
      let pageNumber = 1;
      pageNumber <= MAX_PAGE_SAFETY;
      pageNumber += 1
    ) {
      const targetUrl = withPage(
        target.discoveredUrl,
        pageNumber
      );

      if (visitedPages.has(targetUrl)) {
        break;
      }

      visitedPages.add(targetUrl);

      let response: SearchResponse | null = null;

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
        response = await fetchInertiaUrl(
          page,
          targetUrl,
          inertiaVersion
        );

        if (response.status !== 409) {
          break;
        }

        await page.reload({
          waitUntil: "domcontentloaded",
          timeout: 30000,
        });

        inertiaVersion = await getInertiaVersion(page);
      }

      if (!response) {
        throw new Error("No response returned.");
      }

      if (response.status !== 200) {
        console.log(
          `Page ${pageNumber}: HTTP ${response.status}; stopping target.`
        );
        break;
      }

      const payload = parseJson(response.text);

      if (!payload) {
        console.log(
          `Page ${pageNumber}: invalid Inertia payload; stopping target.`
        );
        break;
      }

      const rawProducts = extractProducts(payload);
      const products = rawProducts.filter(isMarketplaceProduct);

      if (rawProducts.length === 0) {
        console.log(
          `Page ${pageNumber}: 0 products; target exhausted.`
        );
        break;
      }

      const signature = rawProducts
        .map((product) => product.code)
        .filter(Boolean)
        .join("|");

      if (signatures.has(signature)) {
        console.log(
          `Page ${pageNumber}: repeated page detected; stopping target.`
        );
        break;
      }

      signatures.add(signature);
      pagesFetched += 1;

      let newProducts = 0;

      for (const product of products) {
        if (!product.code) {
          continue;
        }

        const nextProduct: SelarProduct = {
          ...(productMap.get(product.code) ?? {}),
          ...product,
          finditProductType:
            product.finditProductType ??
            classifyProduct(product),
        };

        if (!productMap.has(product.code)) {
          newProducts += 1;
        }

        productMap.set(product.code, nextProduct);
      }

      await saveCatalog(productMap);

      const pagination = extractPagination(payload);

      if (pagination.total !== null) {
        totalsSeen.add(pagination.total);
      }

      console.log(
        `Page ${pageNumber}: raw=${rawProducts.length} | eligible=${products.length} | NEW=${newProducts} | UNIQUE=${productMap.size}` +
          (pagination.total !== null
            ? ` | REPORTED TOTAL=${pagination.total}`
            : "")
      );

      if (
        pagination.currentPage !== null &&
        pagination.lastPage !== null &&
        pagination.currentPage >= pagination.lastPage
      ) {
        break;
      }

      await sleep(DELAY_MS);
    }
  }

  const products = Array.from(productMap.values());

  let generated = 0;
  let existing = 0;
  let failed = 0;

  console.log(
    `\nVerifying/generating affiliate links for ${products.length} products...`
  );

  for (let index = 0; index < products.length; index += 1) {
    const product = products[index];

    if (!product.code) {
      failed += 1;
      continue;
    }

    const current =
      typeof product.affiliateUrl === "string"
        ? product.affiliateUrl
        : typeof product.affiliate_url === "string"
          ? product.affiliate_url
          : null;

    if (current?.includes("?affiliate=")) {
      existing += 1;
      continue;
    }

    try {
      const affiliateUrl = await generateAffiliateLink(
        page,
        product.code
      );

      products[index] = {
        ...product,
        affiliateUrl,
      };

      productMap.set(product.code, products[index]);
      generated += 1;
    } catch (error) {
      failed += 1;

      console.log(
        `Affiliate link failed [${index + 1}/${products.length}] ${product.code}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }

    await saveCatalog(productMap);
    await sleep(DELAY_MS);

    if (
      (index + 1) % 25 === 0 ||
      index === products.length - 1
    ) {
      console.log(
        `[${index + 1}/${products.length}] generated=${generated} existing=${existing} failed=${failed}`
      );
    }
  }

  const saved = JSON.parse(
    await fs.readFile(OUTPUT_PATH, "utf8")
  ) as SelarProduct[];

  const affiliateCount = saved.filter((product) => {
    const url =
      typeof product.affiliateUrl === "string"
        ? product.affiliateUrl
        : typeof product.affiliate_url === "string"
          ? product.affiliate_url
          : "";

    return url.includes("?affiliate=");
  }).length;

  const typeCounts = saved.reduce<Record<string, number>>(
    (counts, product) => {
      const type = product.finditProductType ?? "other";
      counts[type] = (counts[type] ?? 0) + 1;
      return counts;
    },
    {}
  );

  const metadata = {
    completedAt: new Date().toISOString(),
    uniqueProducts: saved.length,
    affiliateUrls: affiliateCount,
    generatedThisRun: generated,
    existingAffiliateUrls: existing,
    failedAffiliateLinks: failed,
    pagesFetched,
    discoveredFilterTargets: discoveredTargets,
    reportedTotals: Array.from(totalsSeen).sort((a, b) => a - b),
    productTypeCounts: typeCounts,
    categoryCounts: digitalCategories.map((category) => ({
      id: category.id,
      name: category.name,
      productsCount: category.products_count ?? null,
    })),
  };

  await fs.writeFile(
    META_PATH,
    JSON.stringify(metadata, null, 2),
    "utf8"
  );

  console.log("\n======================================");
  console.log("FULL SELAR MARKETPLACE IMPORT COMPLETE");
  console.log("======================================");
  console.log(`Unique products: ${saved.length}`);
  console.log(`Affiliate URLs: ${affiliateCount}/${saved.length}`);
  console.log(`Generated this run: ${generated}`);
  console.log(`Existing affiliate URLs: ${existing}`);
  console.log(`Failed affiliate URLs: ${failed}`);
  console.log(`Pages fetched: ${pagesFetched}`);
  console.log(
    `Reported totals observed: ${Array.from(totalsSeen).join(", ") || "none"}`
  );
  console.log(`Metadata: ${META_PATH}`);
  console.log("======================================");

  if (failed > 0) {
    console.warn(
      "WARNING: Some affiliate links failed. The catalog was still preserved."
    );
  }
}

main().catch((error: unknown) => {
  console.error("\nFull Selar marketplace importer failed:");
  console.error(error);
  process.exit(1);
});
