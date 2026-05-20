import type { E_COMMERCE, SubCategory } from "../../types/index.js";
import redis from "../../db/redis.js";
import BrowserUtils from "./browserUtils.js";

/**
 * Factory class to create scraper instances based on the platform.
 * This class can be extended to include methods for different platforms.
 */
export default class CrawlerFactory {
  static async create(
    url: string,
    website: E_COMMERCE,
    subCategory: string,
    subCategoryInfo: SubCategory,
  ) {
    const { browser, page } = await BrowserUtils.launchBrowser({
      headless: false,
    });

    switch (website) {
      case "amazon": {
        const { AmazonService } =
          await import("../services/websites/amazon.js");
        return new AmazonService(
          browser,
          page,
          url,
          redis,
          subCategory,
          subCategoryInfo,
        );
      }
      case "flipkart": {
        const { FlipkartService } =
          await import("../services/websites/flipkart.js");
        return new FlipkartService(
          browser,
          page,
          url,
          redis,
          subCategory,
          subCategoryInfo,
        );
      }
      default:
        throw new Error(`Unsupported website: ${website}`);
    }
  }
}
