import { Crawler } from "../crawler.js";

import type RedisDB from "../../../db/redis.js";
import type { Browser, Page } from "playwright";
import type { SubCategory } from "../../../types/index.js";

export class FlipkartService extends Crawler {
  private url: string;

  constructor(
    browser: Browser,
    page: Page,
    url: string,
    redis: RedisDB,
    subCategory: string,
    subCategoryDetails: SubCategory
  ) {
    super(browser, page, "flipkart", redis, subCategory, subCategoryDetails);
    this.url = url;
  }

  async fetchProducts(): Promise<void> {
    if (this.pageNumber === 0) {
      // First page, navigate to the URL
      await this.navigateToUrl(this.url);
    } else {
      // Not the first page, click to go to the next page
      await this.clickToNextPageBtn();
    }

    await this.extractProducts();
  }
}
