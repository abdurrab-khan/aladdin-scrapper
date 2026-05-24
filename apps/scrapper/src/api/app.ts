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
  console.log("--- New Request ---");
  console.log("Headers:", JSON.stringify(req.headers, null, 2));
  console.log("Body type:", typeof req.body);
  console.log("Body content:", JSON.stringify(req.body, null, 2));

  if (!req.body || typeof req.body !== "object" || Object.keys(req.body).length === 0) {
    console.error("Error: Empty or non-object body received.");
    return res
      .status(400)
      .json({ status: "invalid_request", error: "body is required and must be a non-empty JSON object" });
  }

  const body = req.body as ScrapeRequestBody;
  const error = validateScrapeRequest(body);

  console.log("Received scrape request:", body);

  if (error) {
    return res.status(400).json({ status: "invalid_request", error });
  }

  try {
    const selection = buildSelectionFromRequest(body);
    console.log("Successfully built selection, starting scrape job...");
    void runScrape(selection, SupabaseDatabaseInstance, redis);
    return res.status(200).json({ status: "completed" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to run scrape";
    return res.status(500).json({ status: "error", error: msg });
  }
});

export default app;
