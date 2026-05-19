import "dotenv/config";
import express from "express";

import { runScrape } from "./jobs/runScrape.js";
import {
  buildSelectionFromRequest,
  validateScrapeRequest,
  type ScrapeRequestBody,
} from "./jobs/buildSelection.js";

const app = express();

app.use(express.json());

let isScrapeRunning = false;

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.post("/v1/scrape", async (req, res) => {
  if (isScrapeRunning) {
    return res.status(409).json({ status: "already_running" });
  }

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
    isScrapeRunning = true;
    await runScrape(selection);
    return res.status(200).json({ status: "completed" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to run scrape";
    return res.status(500).json({ status: "error", error: msg });
  } finally {
    isScrapeRunning = false;
  }
});

export default app;
