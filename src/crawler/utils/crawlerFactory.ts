import type { Browser, Page } from "playwright";
import type { E_COMMERCE } from "../../types/index.js";

/**
 * Factory class to create scraper instances based on the platform.
 * This class can be extended to include methods for different platforms.
 */
export default class CrawlerFactory {
  static async create(
    url: string,
    page: Page,
    website: E_COMMERCE,
    browser: Browser
  ) {
    switch (website) {
      case "amazon": {
        const { AmazonService } = await import(
          "../services/websites/amazon.js"
        );
        return new AmazonService(url, page, browser);
      }
      case "flipkart": {
        const { FlipkartService } = await import(
          "../services/websites/flipkart.js"
        );
        return new FlipkartService(url, page, browser);
      }
      default:
        throw new Error(`Unsupported website: ${website}`);
    }
  }
}
