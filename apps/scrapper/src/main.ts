import "dotenv/config";
import { rm } from "fs/promises";

import RedisDB from "./db/redis.js";
import SupabaseClient from "./db/supabase.js";
import manager from "./utils/catalogManager.js";
import { scrapeProducts } from "./crawler/scrapper.js";
import { randomDelay } from "./crawler/utils/utils.js";
import type { SubCategory } from "./types/index.js";

async function main() {
  const redisClient = new RedisDB();

  try {
    await redisClient.connect(); // Connect to Redis
    const selection = manager.run();

    for (let i = 0; i < selection.length; i++) {
      const selectionDetails = selection[i];

      if (!selectionDetails) {
        console.warn(
          `⚠️ There is no selection details available ${selectionDetails}`
        );
        continue;
      }

      // extracting details
      const category = selectionDetails.category;
      const subCategories = selectionDetails.subcategories;
      const subCategoryDetails = selectionDetails.subcategoriesDetails;

      // throw an error if there is not subCategories
      if (subCategories.length === 0) {
        throw new Error(
          `❌ Failed there is no subcategories found ${subCategories}`
        );
      }

      // looping sub subCategories
      for (let j = 0; j < subCategories.length; j++) {
        const categoryName = subCategories[j] as string;
        const subCategory = subCategoryDetails[categoryName] as SubCategory;

        console.log(`🚀  Starting ${categoryName} product scraping...`);

        // scrapping products
        const scrappedProducts = await scrapeProducts(
          redisClient,
          categoryName,
          subCategory
        );

        // insert products
        await SupabaseClient.saveProducts(scrappedProducts);

        console.log(`\n🎉 Finished scraping for selection: ${categoryName}\n`);

        // adding some delays
        if (i < selection.length - 1) {
          await new Promise((res) => setTimeout(res, randomDelay(120, 300)));
        }
      }
    }
  } catch (err) {
    const msg =
      err instanceof Error
        ? err.message
        : "An error unknown error occured during scrapping products";
    console.error(msg);
  } finally {
    await redisClient.disconnect();

    // Clean up the products directory after processing
    await rm("products", {
      recursive: true,
      force: true,
    });
  }
}

main();
