import "dotenv/config";
import cron from "node-cron";

import { runScrape } from "./jobs/runScrape.js";
import manager from "./utils/catalogManager/manager.js";

const schedule = process.env["CRON_SCHEDULE"] || "0 * * * *";
const runOnStart = process.env["CRON_RUN_ON_START"] === "true";

async function runJob() {
  const selections = manager.run();
  await runScrape(selections);
}

if (runOnStart) {
  void runJob();
}

cron.schedule(schedule, () => {
  void runJob();
});

console.log(`🕒 Cron scheduled with: ${schedule}`);
