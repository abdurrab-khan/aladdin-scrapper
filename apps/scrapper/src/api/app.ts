import express, { type Express } from "express";
import { runScrape } from "../jobs/runScrape.js";
import {
  buildSelectionFromRequest,
  validateScrapeRequest,
  type ScrapeRequestBody,
} from "./validations/scrapeValidation.js";
import SupabaseDatabaseInstance from "../providers/database/supabase.js";
import redis from "../providers/cache/redis.js";

const app: Express = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.post("/v1/scrape", async (req, res) => {
  if (!req.body || typeof req.body !== "object") {
    return res
      .status(400)
      .json({ status: "invalid_request", error: "body is required" });
  }

  const body = req.body as ScrapeRequestBody;
  const error = validateScrapeRequest(body);

  if (error) {
    return res.status(400).json({ status: "invalid_request", error });
  }

  const selection = buildSelectionFromRequest(body);

  try {
    void runScrape(selection, SupabaseDatabaseInstance, redis);
    return res.status(200).json({ status: "completed" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to run scrape";
    return res.status(500).json({ status: "error", error: msg });
  }
});

export default app;
