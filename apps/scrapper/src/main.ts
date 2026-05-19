import "dotenv/config";

import { runScrape } from "./jobs/runScrape.js";
import manager from "./utils/catalogManager/manager.js";

async function main() {
  const selection = manager.run();
  await runScrape(selection);
}

void main();
