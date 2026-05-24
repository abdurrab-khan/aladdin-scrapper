import type { E_COMMERCE, SubCategory } from "../../../types/common.js";
import type { BaseCache } from "../../../providers/cache/interfaces.js";
import BrowserUtils from "./browserUtils.js";
import type { BaseScraper } from "../base/BaseScraper.js";

/**
 * Factory class to create scraper instances based on the platform.
 */
export default class CrawlerFactory {
  static async create(
    url: string,
    website: E_COMMERCE,
    subCategory: string,
    subCategoryInfo: SubCategory,
    cache: BaseCache,
  ): Promise<BaseScraper> {
    const { browser, page } = await BrowserUtils.launchBrowser({
      headless: false,
    });

    switch (website) {
      case "amazon": {
        const { AmazonScraper } = await import("../engines/amazon.js");
        return new AmazonScraper(
          browser,
          page,
          url,
          cache,
          subCategory,
          subCategoryInfo,
        );
      }
      case "flipkart": {
        const { FlipkartScraper } = await import("../engines/flipkart.js");
        return new FlipkartScraper(
          browser,
          page,
          url,
          cache,
          subCategory,
          subCategoryInfo,
        );
      }
      default:
        throw new Error(`Unsupported website: ${website}`);
    }
  }
}
