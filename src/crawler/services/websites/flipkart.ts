import type { Browser, Page } from "playwright";
import { Crawler } from "../crawler.js";

export class FlipkartService extends Crawler {
  private url: string;

  constructor(url: string, page: Page, browser: Browser) {
    super("flipkart", page, browser);
    this.url = url;
  }

  async fetchProducts(): Promise<void> {
    if (this.pageNumber === 0) {
      const navigated = await this.navigateToUrl(this.url); // Navigate to the initial URL

      // Stop if navigation fails
      if (!navigated) {
        console.log("🧭 Navigation failed in flipkart.");
        this.isDone = true;
      }
    } else {
      await this.clickToNextPageBtn(); // Click to the next page for subsequent pages
    }

    await this.extractProducts();
  }
}
