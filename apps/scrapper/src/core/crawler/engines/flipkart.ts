import { BaseScraper } from "../base/BaseScraper.js";
import type { BaseCache } from "../../../providers/cache/interfaces.js";
import type { Browser, Page, ElementHandle } from "playwright";
import type { SubCategory } from "../../../types/common.js";
import type { Product } from "../../../types/product.js";
import { NEXT_BUTTON_SELECTOR, FLIPKART_FETCH_BRAND_PRODUCTS } from "../css_selectors.js";
import { ScraperManager } from "../base/ScraperManager.js";

export class FlipkartScraper extends BaseScraper {
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
      "flipkart",
      cache,
      subCategory,
      subCategoryDetails,
      process.env["FLIPKART_PLATFORM_ID"] || "",
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
      console.error(`⚠️ Error fetching products on Flipkart:`, error);
      this.isDone = true;
    }
  }

  async clickToNextPageBtn(): Promise<void> {
    const nextButtonSelector = NEXT_BUTTON_SELECTOR["flipkart"];
    try {
      const nextButton = this.page.locator(nextButtonSelector, { hasText: "Next" });
      if ((await nextButton.count()) === 0) {
        throw new Error(`ℹ️ No 'Next' button found on Flipkart.`);
      }

      await nextButton.first().click();
      await this.page.waitForLoadState("domcontentloaded");

      this.pageNumber += 1;
      if (this.pageNumber >= 30) this.isDone = true;
    } catch (error) {
      console.info(`⚠️ Flipkart pagination reached the end or failed.`);
      this.isDone = true;
    }
  }

  async close(): Promise<void> {
    if (this.page) await this.page.close();
    if (this.browser) await this.browser.close();
  }

  private async getBrandSelector(page: Page, brand: string): Promise<ElementHandle<HTMLElement | SVGElement> | null> {
    try {
      const sections = await page.$$(FLIPKART_FETCH_BRAND_PRODUCTS["mainSection"]);
      for (const section of sections) {
        const title = await section.$(FLIPKART_FETCH_BRAND_PRODUCTS["sectionTitle"]);
        if (title && (await title.textContent())?.trim().toLowerCase() === "brand") {
          if (((await section.boundingBox())?.height ?? 0) < 60) {
            await section.click();
            await page.waitForTimeout(500);
          }
          const input = await section.$(FLIPKART_FETCH_BRAND_PRODUCTS["input"]);
          await input?.fill(brand);

          return await section.$(FLIPKART_FETCH_BRAND_PRODUCTS["selector"]);
        }
      }
      return null;
    } catch (error) {
      console.error("⚠️ Error fetching Flipkart brand selector:", error);
      return null;
    }
  }
}
