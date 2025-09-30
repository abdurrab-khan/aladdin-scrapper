import type { Browser, ElementHandle, Page } from "playwright";
import type { E_COMMERCE, Product } from "../../types/index.js";
import getContext from "./getContext.js";
import {
  getClippingForScreenshot,
  getContextOptionsForScreenShot,
  randomDelay,
} from "./utils.js";
import { CARD_SELECTOR } from "../css/css_selectors.js";
import { MAX_PERCENTAGE_DISCOUNT } from "../constants/const.js";

class CrawlerUtils {
  private browser: Browser;
  private page: Page;
  private website: E_COMMERCE;

  constructor(browser: Browser, page: Page, website: E_COMMERCE) {
    this.website = website;
    this.browser = browser;
    this.page = page;
  }

  // Method to validate whether the product has valid pricing and best deal
  public isValidProductDeal(
    price: number,
    discountPrice: number,
    maxPrice: number
  ): boolean {
    // Calculate discount percentage
    const discountPercentage = Math.round(
      ((price - discountPrice) / price) * 100
    );

    // Validate price, discount price, and discount percentage
    const isValid =
      price > 0 &&
      price < maxPrice &&
      discountPrice > 0 &&
      discountPrice < price &&
      discountPercentage > MAX_PERCENTAGE_DISCOUNT;

    return isValid;
  }

  // Method to fetch products by brand
  public async getBrandProducts(brand: string): Promise<Product | null> {
    try {
      // Logic to fetch products by brand
      return null;
    } catch (error) {
      console.error(`⚠️ Error fetching products for brand ${brand}:`, error);
      return null;
    }
  }

  // Method to take screenshot of the product
  public async takeScreenshot(
    fileName: string,
    product: ElementHandle<SVGElement | HTMLElement>,
    productUrl: string,
    isFullPage = false
  ): Promise<boolean> {
    let contextAndPage: Awaited<ReturnType<typeof getContext>> | null = null;

    try {
      // Logic to take screenshot
      if (isFullPage) {
        const selector = CARD_SELECTOR[this.website];
        contextAndPage = await getContext(
          this.browser,
          getContextOptionsForScreenShot(this.website)
        );

        const navigate = await contextAndPage.page.goto(productUrl, {
          timeout: 30000,
          waitUntil: "domcontentloaded",
        });
        if (!navigate || !contextAndPage.page) return false;

        // Wait for the page to load completely
        await this.waitForPageLoad(contextAndPage.page, selector, true, 60000);

        // Taking screenshot of the full page
        await contextAndPage.page.screenshot({
          path: `${fileName}.png`,
          type: "png",
          caret: "hide",
          fullPage: false,
          animations: "disabled",
          clip: getClippingForScreenshot(this.website),
          timeout: 30000,
        });

        return true;
      }

      // Taking screenshot of the product element
      await product.screenshot({
        path: `${fileName}.png`,
        type: "png",
        caret: "hide",
        animations: "disabled",
        timeout: 30000,
      });

      return true;
    } catch (error) {
      console.error(`⚠️ Error taking screenshot for ${fileName}:`, error);
      return false;
    } finally {
      // Ensure context and page are closed if they were opened
      if (contextAndPage) {
        await contextAndPage.page.close();
        await contextAndPage.context.close();
      }
    }
  }

  // Wait until the page is fully loaded
  public async waitForPageLoad(
    page?: Page,
    selector?: string,
    showAdditionalDelay = true,
    timeout = 60000
  ): Promise<void> {
    try {
      const targetPage = page || this.page;

      // Wait for DOM content to be fully loaded
      await targetPage.waitForLoadState("domcontentloaded", {
        timeout,
      });

      // Wait for the specific selector to be attached to the DOM
      if (selector) {
        await targetPage.waitForSelector(selector, {
          state: "attached",
          timeout,
        });
      }

      // Additional random delay to ensure all resources are loaded
      if (showAdditionalDelay) {
        await targetPage.waitForTimeout(randomDelay(1.5, 4));
      }
    } catch (error) {
      throw error;
    }
  }
}

export default CrawlerUtils;
