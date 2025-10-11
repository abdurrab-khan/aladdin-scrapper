import type { Browser, Page } from "playwright";
import type { E_COMMERCE, SubCategoryInfo } from "../../types/index.js";

/**
 * Factory class to create scraper instances based on the platform.
 * This class can be extended to include methods for different platforms.
 */
export default class CrawlerFactory {
  static async create(
    browser: Browser,
    page: Page,
    website: E_COMMERCE,
    url: string,
    subCategory: string,
    subCategoryInfo: SubCategoryInfo
  ) {
    switch (website) {
      case "amazon": {
        const { AmazonService } = await import(
          "../services/websites/amazon.js"
        );
        return new AmazonService(
          browser,
          page,
          url,
          subCategory,
          subCategoryInfo
        );
      }
      case "flipkart": {
        const { FlipkartService } = await import(
          "../services/websites/flipkart.js"
        );
        return new FlipkartService(
          browser,
          page,
          url,
          subCategory,
          subCategoryInfo
        );
      }
      default:
        throw new Error(`Unsupported website: ${website}`);
    }
  }
}
