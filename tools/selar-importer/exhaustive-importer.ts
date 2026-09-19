import { chromium, type Page } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const BASE_URL = "https://affiliates.selar.com";
const OUTPUT_DIR = path.join(process.cwd(), "tools", "selar-importer", "data");
const OUTPUT_PATH = path.join(OUTPUT_DIR, "multi-type-products.json");
const META_PATH = path.join(OUTPUT_DIR, "exhaustive-import-meta.json");

const PRODUCT_TYPE_SEARCHES = [
  { keyword: "ebook", type: "ebook" },
  { keyword: "course", type: "course" },
  { keyword: "template", type: "template" },
  { keyword: "guide", type: "guide" },
  { keyword: "software", type: "software" },
  { keyword: "community", type: "community" },
  { keyword: "bundle", type: "bundle" },
] as const;

const DELAY_MS = 250;
const MAX_PAGE_SAFETY = 2000;
const MAX_RETRIES = 2;

type ProductType =
  | "ebook"
  | "course"
  | "template"
  | "guide"
  | "software"
  | "community"
  | "bundle"
  | "other";

type SelarProduct = {
  code?: string;
  id?: string;
  name?: string;
  description?: string | null;
  affiliateUrl?: string | null;
  affiliate_url?: string | null;
  finditProductType?: ProductType | null;
  [key: string]: unknown;
};

type SearchResponse = {
  status: number;
  text: string;
  versionHeader: string | null;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function classifyProduct(
  product: SelarProduct,
  searchedType: ProductType
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

  return searchedType;
}

async function saveCatalog(
  products: Map<string, SelarProduct>
): Promise<void> {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  await fs.writeFile(
    OUTPUT_PATH,
    JSON.stringify(Array.from(products.values()), null, 2),
    "utf8"
  );
}

async function loadCatalog(): Promise<Map<string, SelarProduct>> {
  const productMap = new Map<string, SelarProduct>();

  try {
    const raw = await fs.readFile(OUTPUT_PATH, "utf8");
    const existing = JSON.parse(raw) as unknown;

    if (!Array.isArray(existing)) {
      return productMap;
    }

    for (const value of existing) {
      if (
        value &&
        typeof value === "object" &&
        typeof (value as SelarProduct).code === "string"
      ) {
        const product = value as SelarProduct;

        if (!product.finditProductType) {
          product.finditProductType = classifyProduct(product, "other");
        }

        productMap.set(product.code!, product);
      }
    }
  } catch {
    // No existing catalog: start fresh.
  }

  return productMap;
}

function parsePayload(text: string): any | null {
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
  const productContainer = payload?.props?.products;

  const meta =
    productContainer?.meta ??
    payload?.props?.meta ??
    productContainer?.paginator ??
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

async function getInertiaVersion(page: Page): Promise<string> {
  return page.evaluate(() => {
    const raw = document.querySelector("#app")?.getAttribute("data-page");

    if (!raw) {
      throw new Error("Could not read Inertia data from #app.");
    }

    const data = JSON.parse(raw) as { version?: string };

    if (!data.version) {
      throw new Error("Could not read the current Inertia version.");
    }

    return data.version;
  });
}

async function fetchSearchPage(
  page: Page,
  keyword: string | null,
  pageNumber: number,
  inertiaVersion: string
): Promise<SearchResponse> {
  return page.evaluate(
    async ({ baseUrl, keyword: searchKeyword, pageNumber: number, version }) => {
      const url = new URL("/search", baseUrl);
      url.searchParams.set("page", String(number));

      if (searchKeyword) {
        url.searchParams.set("keyword", searchKeyword);
      }

      const response = await fetch(url.toString(), {
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
        versionHeader: response.headers.get("X-Inertia-Version"),
      };
    },
    {
      baseUrl: BASE_URL,
      keyword,
      pageNumber,
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
    throw new Error(data.message ?? "No affiliate link returned");
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
    throw new Error("No Chrome pages found. Open the Selar Affiliate Network first.");
  }

  const page = pages[0];

  console.log("Connected to authenticated Chrome:", page.url());

  await page.goto(`${BASE_URL}/explore`, {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });

  let inertiaVersion = await getInertiaVersion(page);
  const productMap = await loadCatalog();

  console.log(`RESUMING: ${productMap.size} products already saved.`);

  const searches: Array<{
    label: string;
    keyword: string | null;
    type: ProductType;
  }> = [
    { label: "ALL PRODUCTS", keyword: null, type: "other" },
    ...PRODUCT_TYPE_SEARCHES.map((item) => ({
      label: item.keyword.toUpperCase(),
      keyword: item.keyword,
      type: item.type,
    })),
  ];

  let totalPagesFetched = 0;
  let searchesCompleted = 0;
  const totalsSeen = new Set<number>();

  for (const search of searches) {
    console.log(`\n========== ${search.label} ==========`);

    const pageSignatures = new Set<string>();
    let pagesForSearch = 0;

    for (
      let pageNumber = 1;
      pageNumber <= MAX_PAGE_SAFETY;
      pageNumber += 1
    ) {
      let response: SearchResponse | null = null;

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
        response = await fetchSearchPage(
          page,
          search.keyword,
          pageNumber,
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
        throw new Error("No search response returned.");
      }

      if (response.status !== 200) {
        console.log(`Page ${pageNumber}: HTTP ${response.status}; stopping this search.`);
        break;
      }

      const payload = parsePayload(response.text);

      if (!payload) {
        console.log(`Page ${pageNumber}: invalid Inertia JSON; stopping this search.`);
        break;
      }

      const products = extractProducts(payload);

      if (products.length === 0) {
        console.log(`Page ${pageNumber}: 0 products; search exhausted.`);
        break;
      }

      const signature = products
        .map((product) => product.code)
        .filter(Boolean)
        .join("|");

      if (pageSignatures.has(signature)) {
        console.log(`Page ${pageNumber}: repeated page detected; stopping safely.`);
        break;
      }

      pageSignatures.add(signature);
      pagesForSearch += 1;
      totalPagesFetched += 1;

      let newProducts = 0;

      for (const rawProduct of products) {
        const code = rawProduct.code;

        if (!code) {
          continue;
        }

        const classified: SelarProduct = {
          ...rawProduct,
          finditProductType:
            rawProduct.finditProductType ??
            classifyProduct(rawProduct, search.type),
        };

        if (!productMap.has(code)) {
          newProducts += 1;
        }

        productMap.set(code, {
          ...(productMap.get(code) ?? {}),
          ...classified,
        });
      }

      await saveCatalog(productMap);

      const pagination = extractPagination(payload);

      if (pagination.total !== null) {
        totalsSeen.add(pagination.total);
      }

      console.log(
        `Page ${pageNumber}: ${products.length} results | NEW: ${newProducts} | UNIQUE TOTAL: ${productMap.size}` +
          (pagination.total !== null
            ? ` | REPORTED TOTAL: ${pagination.total}`
            : "")
      );

      if (
        pagination.currentPage !== null &&
        pagination.lastPage !== null &&
        pagination.currentPage >= pagination.lastPage
      ) {
        console.log(`Reached reported last page: ${pagination.lastPage}`);
        break;
      }

      await sleep(DELAY_MS);
    }

    searchesCompleted += 1;
    console.log(`${search.label}: ${pagesForSearch} pages fetched.`);
  }

  const products = Array.from(productMap.values());

  let generated = 0;
  let existing = 0;
  let failed = 0;

  console.log(`\nGenerating/verifying affiliate links for ${products.length} products...`);

  for (let index = 0; index < products.length; index += 1) {
    const product = products[index];

    if (!product.code) {
      failed += 1;
      continue;
    }

    const currentAffiliate =
      typeof product.affiliateUrl === "string"
        ? product.affiliateUrl
        : typeof product.affiliate_url === "string"
          ? product.affiliate_url
          : null;

    if (currentAffiliate?.includes("?affiliate=")) {
      existing += 1;
      continue;
    }

    try {
      const affiliateUrl = await generateAffiliateLink(page, product.code);

      products[index] = {
        ...product,
        affiliateUrl,
      };

      productMap.set(product.code, products[index]);
      generated += 1;
    } catch (error) {
      failed += 1;

      console.log(
        `[${index + 1}/${products.length}] affiliate link FAILED for ${product.code}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }

    await saveCatalog(productMap);

    if ((index + 1) % 25 === 0 || index === products.length - 1) {
      console.log(
        `[${index + 1}/${products.length}] generated=${generated} existing=${existing} failed=${failed}`
      );
    }

    await sleep(DELAY_MS);
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

  const typeCounts = saved.reduce<Record<string, number>>((counts, product) => {
    const type = product.finditProductType ?? "other";
    counts[type] = (counts[type] ?? 0) + 1;
    return counts;
  }, {});

  const metadata = {
    completedAt: new Date().toISOString(),
    uniqueProducts: saved.length,
    affiliateUrls: affiliateCount,
    generatedThisRun: generated,
    existingAffiliateUrls: existing,
    failedAffiliateLinks: failed,
    pagesFetched: totalPagesFetched,
    searchesCompleted,
    reportedTotals: Array.from(totalsSeen).sort((a, b) => a - b),
    productTypeCounts: typeCounts,
    searches: searches.map((search) => ({
      label: search.label,
      keyword: search.keyword,
    })),
  };

  await fs.writeFile(
    META_PATH,
    JSON.stringify(metadata, null, 2),
    "utf8"
  );

  console.log("\n======================================");
  console.log("EXHAUSTIVE SELAR IMPORT COMPLETE");
  console.log("======================================");
  console.log(`Unique products: ${saved.length}`);
  console.log(`Affiliate URLs: ${affiliateCount}/${saved.length}`);
  console.log(`Generated this run: ${generated}`);
  console.log(`Existing affiliate URLs: ${existing}`);
  console.log(`Failed affiliate links: ${failed}`);
  console.log(`Pages fetched: ${totalPagesFetched}`);
  console.log(`Reported marketplace totals seen: ${Array.from(totalsSeen).join(", ") || "none"}`);
  console.log(`Metadata: ${META_PATH}`);
  console.log("======================================");

  if (failed > 0 || affiliateCount !== saved.length) {
    throw new Error(
      `Affiliate verification failed: ${affiliateCount}/${saved.length} have valid Selar affiliate URLs.`
    );
  }
}

main().catch((error: unknown) => {
  console.error("\nExhaustive Selar importer failed:");
  console.error(error);
  process.exit(1);
});
