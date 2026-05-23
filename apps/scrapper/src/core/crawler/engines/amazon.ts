import { BaseScraper } from "../base/BaseScraper.js";
import type { BaseCache } from "../../../providers/cache/interfaces.js";
import type { Browser, Page, ElementHandle } from "playwright";
import type { SubCategory } from "../../../types/common.js";
import type { Product } from "../../../types/product.js";
import { NEXT_BUTTON_SELECTOR, AMAZON_FETCH_BRAND_PRODUCTS } from "../css_selectors.js";
import { ScraperManager } from "../base/ScraperManager.js";

export class AmazonScraper extends BaseScraper {
  private manager: ScraperManager;
  private pageNumber: number = 0;
  private url: string;
  private page: Page;
  private browser: Browser;

  constructor(
    browser: Browser,
    page: Page,
    url: string,
    cache: BaseCache,
    subCategory: string,
    subCategoryDetails: SubCategory,
  ) {
    super();
    this.browser = browser;
    this.page = page;
    this.url = url;
    this.manager = new ScraperManager(
      browser,
      page,
      "amazon",
      cache,
      subCategory,
      subCategoryDetails,
      process.env["AMAZON_PLATFORM_ID"] || "",
      this.getBrandSelector.bind(this)
    );
  }

  get products(): Product[] {
    return this.manager.products;
  }

  set products(val: Product[]) {
    this.manager.products = val;
  }

  get isDone(): boolean {
    return this.manager.isDone;
  }

  set isDone(val: boolean) {
    this.manager.isDone = val;
  }

  async fetchProducts(): Promise<void> {
    try {
      if (this.pageNumber === 0) {
        await this.manager.navigateToUrl(this.url);
        this.pageNumber = 1;
      } else {
        await this.clickToNextPageBtn();
      }
      await this.manager.extractProducts();
    } catch (error) {
      console.error(`⚠️ Error fetching products on Amazon:`, error);
      this.isDone = true;
    }
  }

  async clickToNextPageBtn(): Promise<void> {
    const nextButtonSelector = NEXT_BUTTON_SELECTOR["amazon"];

    try {
      const nextButton = this.page.locator(nextButtonSelector);

      if ((await nextButton.count()) === 0) {
        throw new Error(`ℹ️ No 'Next' button found on Amazon.`);
      }

      await nextButton.first().click();
      await this.page.waitForLoadState("domcontentloaded");

      this.pageNumber += 1;
      if (this.pageNumber >= 30) this.isDone = true;
    } catch (error) {
      console.info(`⚠️ Amazon pagination reached the end or failed.`);
      this.isDone = true;
    }
  }

  async close(): Promise<void> {
    if (this.page) await this.page.close();
    if (this.browser) await this.browser.close();
  }

  private async getBrandSelector(page: Page, brand: string): Promise<ElementHandle<HTMLElement | SVGElement> | null> {
    try {
      const seeMoreBtn = await page.$(AMAZON_FETCH_BRAND_PRODUCTS["seeMore"]);
      if (seeMoreBtn) await seeMoreBtn.click();

      const allBrandSelectors = await page.$$(AMAZON_FETCH_BRAND_PRODUCTS["selector"]);
      for (const brandSelector of allBrandSelectors) {
        const text = (await brandSelector.textContent())?.trim().toLowerCase();
        const matchRegex = new RegExp(brand, "i");
        if (matchRegex.test(text || "")) {
          return brandSelector;
        }
      }
      return null;
    } catch (error) {
      console.error("⚠️ Error fetching Amazon brand selector:", error);
      return null;
    }
  }
}
