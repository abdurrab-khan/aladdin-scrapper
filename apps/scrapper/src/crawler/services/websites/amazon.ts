import { Crawler } from "../crawler.js";

import RedisDB from "../../../db/redis.js";
import type { Browser, Page } from "playwright";
import type { SubCategory } from "../../../types/index.js";

export class AmazonService extends Crawler {
  private url: string;

  constructor(
    browser: Browser,
    page: Page,
    url: string,
    redis: typeof RedisDB,
    subCategory: string,
    subCategoryDetails: SubCategory,
  ) {
    super(browser, page, "amazon", redis, subCategory, subCategoryDetails);
    this.url = url;
    this.browser = browser;
    this.page = page;
  }

  async fetchProducts(): Promise<void> {
    try {
      this.pageNumber === 0
        ? await this.navigateToUrl(this.url)
        : this.clickToNextPageBtn();
      await this.extractProducts();
    } catch {
      if (this.page) await this.page.close();
      if (this.browser) await this.browser.close();
    }
  }
}
