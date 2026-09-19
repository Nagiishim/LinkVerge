import "dotenv/config";
import express from "express";
import cors from "cors";

import { IntentSchema } from "./schemas/intent.js";
import { parseNaturalLanguage } from "./engine/naturalLanguageParser.js";
import { filterCandidates } from "./engine/candidateFilter.js";
import { buildRecommendations } from "./engine/recommendations.js";

import {
  catalog,
  initializeCatalog,
} from "./data/catalog.js";

const app = express();

const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    products: catalog.products.length,
  });
});

app.post("/parse-intent", (req, res) => {
  try {
    const query = req.body?.query;

    if (typeof query !== "string" || !query.trim()) {
      return res.status(400).json({
        error: "A search query is required.",
      });
    }

    const intent = parseNaturalLanguage(query);

    return res.json({ intent });
  } catch (error) {
    console.error("Error parsing intent:", error);

    return res.status(400).json({
      error: "Unable to understand your request.",
    });
  }
});

/*
 * Affiliate click tracking + redirect
 *
 * User clicks a LinkVerge product
 *        ↓
 * LinkVerge records the click
 *        ↓
 * User is redirected to the affiliate URL
 */
app.get("/go/:productId", (req, res) => {
  const product = catalog.products.find(
    (item) => item.product_id === req.params.productId
  );

  if (!product) {
    return res.status(404).json({
      error: "Product not found.",
    });
  }

  const destination =
    product.affiliate_url || product.product_url;

  console.log(
    `Affiliate click: ${product.product_id} → ${destination}`
  );

  return res.redirect(302, destination);
});

app.post("/recommend", (req, res) => {
  try {
    const result = IntentSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: "Invalid search intent.",
      });
    }

    const intent = result.data;

    const candidates = filterCandidates(
      catalog.products,
      intent.hard_constraints
    );

    const recommendations = buildRecommendations(
      candidates,
      intent.soft_preferences
    );

    return res.json({
      recommendations,
    });
  } catch (error) {
    console.error(
      "Error generating recommendations:",
      error
    );

    return res.status(500).json({
      error: "Unable to generate recommendations.",
    });
  }
});

app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("Unhandled server error:", error);

    res.status(500).json({
      error: "Internal server error.",
    });
  }
);

async function startServer(): Promise<void> {
  await initializeCatalog();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `LinkVerge API running on port ${PORT}`
    );

    console.log(
      `Products loaded: ${catalog.products.length}`
    );
  });
}

startServer().catch((error: unknown) => {
  console.error("Failed to start LinkVerge:", error);
  process.exit(1);
});