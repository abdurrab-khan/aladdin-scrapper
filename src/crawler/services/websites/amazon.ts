import type { Browser, Page } from "playwright";
import { Crawler } from "../crawler.js";
import type { SubCategoryInfo } from "../../../types/index.js";

export class AmazonService extends Crawler {
  private url: string;

  constructor(
    browser: Browser,
    page: Page,
    url: string,
    subCategory: string,
    subCategoryDetails: SubCategoryInfo
  ) {
    super(browser, page, "amazon", subCategory, subCategoryDetails);
    this.url = url;
  }

  async fetchProducts(): Promise<void> {
    if (this.pageNumber === 0) {
      // First page, navigate to the URL
      await this.navigateToUrl(this.url); // Navigate to the initial URL
    } else {
      // Not the first page, click to go to the next page
      await this.clickToNextPageBtn();
    }

    await this.extractProducts();
  }
}
