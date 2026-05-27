import express, { type Express } from "express";
import { runScrape } from "../jobs/runScrape.js";
import {
  buildSelectionFromRequest,
  validateScrapeRequest,
  type ScrapeRequestBody,
} from "./validations/scrapeValidation.js";
import SupabaseDatabaseInstance from "../providers/database/supabase.js";
import redis from "../providers/cache/redis.js";
import { CATALOG_CONFIG } from "../config/catalog.js";

const app: Express = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/v1/categories", (_req, res) => {
  const categories = Object.keys(CATALOG_CONFIG).map((key) => {
    const cat = CATALOG_CONFIG[key]!;
    return {
      id: key,
      name: key,
      subCategories: [
        ...Object.keys(cat.subCategories),
        ...Object.keys(cat.lowPriorityCategories || {}),
      ],
    };
  });
  res.status(200).json(categories);
});

app.post("/v1/scrape", async (req, res) => {
  if (
    !req.body ||
    typeof req.body !== "object" ||
    Object.keys(req.body).length === 0
  ) {
    console.error("Error: Empty or non-object body received.");
    return res.status(400).json({
      status: "invalid_request",
      error: "body is required and must be a non-empty JSON object",
    });
  }

  const body = req.body;
  const validationResult = validateScrapeRequest(body);

  if (typeof validationResult === "string") {
    return res
      .status(400)
      .json({ status: "invalid_request", error: validationResult });
  }

  try {
    const selection = buildSelectionFromRequest(validationResult);
    console.log(
      "Successfully built selection, starting scrape job...: ",
      selection.tasks[0]?.details,
    );
    void runScrape(selection, SupabaseDatabaseInstance, redis);
    return res.status(200).json({ status: "completed" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to run scrape";
    return res.status(500).json({ status: "error", error: msg });
  }
});

export default app;
