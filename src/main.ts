import "dotenv/config";
import { rm } from "fs/promises";

import SupabaseClient from "./db/supabase.js";
import manager from "./utils/catalogManager.js";
import { scrapeProducts } from "./crawler/scrapper.js";
import { randomDelay } from "./crawler/utils/utils.js";
import RedisDB from "./db/redis.js";

async function main() {
  const redisClient = new RedisDB();

  try {
    await redisClient.connect(); // Connect to Redis
    const selection = manager.run();

    selection.forEach(async (s, i) => {
      console.log("🚀  Starting product scraping...");

      const products = await scrapeProducts(s, redisClient);
      if (products && products.length > 0) {
        await SupabaseClient.saveProducts(products);
      }

      console.log(`\n🎉 Finished scraping for selection: ${s.category}\n`);

      // Adding a delay between different selections to avoid overwhelming the server
      if (i < selection.length - 1) {
        await new Promise((res) => setTimeout(res, randomDelay(120, 300)));
      }
    });
  } catch (error) {
    console.error("❌  Error in main:", (error as Error).message ?? error);
  } finally {
    // Disconnect from Redis
    await redisClient.disconnect();

    // Clean up the products directory after processing
    await rm("products", {
      recursive: true,
      force: true,
    });
  }
}

main();
