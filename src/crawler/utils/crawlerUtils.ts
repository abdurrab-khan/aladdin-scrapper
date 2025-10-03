import { v4 as uuidv4 } from "uuid";
import type { Browser, ElementHandle, Page } from "playwright";

import getContext from "./getContext.js";
import { cleanData, hasRequiredDetails } from "./helper.js";
import { CARD_SELECTOR, PRODUCT_DETAILS } from "../css/css_selectors.js";
import {
  getClippingForScreenshot,
  getContextOptionsForScreenShot,
  randomDelay,
} from "./utils.js";

import type {
  E_COMMERCE,
  FlatProduct,
  Product,
  ProductSelector,
} from "../../types/index.js";
class CrawlerUtils {
  private browser: Browser;
  private page: Page;
  private website: E_COMMERCE;

  constructor(browser: Browser, page: Page, website: E_COMMERCE) {
    this.website = website;
    this.browser = browser;
    this.page = page;
  }

  public async navigateToUrl(
    page: Page,
    url: string,
    showRandomDelay = true,
    timeout = 60000
  ): Promise<void> {
    try {
      const nRes = await page.goto(url, {
        timeout,
        waitUntil: "domcontentloaded",
      });

      // If navigation fails, return false
      if (nRes === null || !nRes.ok()) {
        throw new Error(
          `🧭 Navigation to ${url} failed with status ${nRes?.status()}`
        );
      }

      // Wait for the page to load completely
      await this.waitForPageLoad(
        page,
        CARD_SELECTOR[this.website],
        showRandomDelay
      );
    } catch (error) {
      const errMsg =
        (error as Error).message ?? "⚠️ An error occurred during navigation";
      throw new Error("⚠️ Navigation error: " + errMsg);
    }
  }

  public async extractProductData(
    product: ElementHandle<SVGElement | HTMLElement>
  ) {
    if (!product) return null; // Return null if product is null or undefined

    const productCSSSelector = PRODUCT_DETAILS[this.website];

    try {
      const productDetails = Object.fromEntries(
        await Promise.all(
          Object.entries(productCSSSelector).map(async ([key, selector]) => {
            const typedKey = key as ProductSelector;

            // @Checking whether the selector is valid or not
            if (!selector.trim() || selector === "N/A") {
              throw new Error("⚠️ Invalid selector");
            }

            const element = await product.$(selector);
            const value = await cleanData(typedKey, element, this.website);

            if (!value && !hasRequiredDetails(typedKey, value)) {
              throw new Error(
                `⚠️  Missing required detail for key: ${typedKey}`
              );
            }

            return [typedKey, value];
          })
        )
      ) as { [T in ProductSelector]: FlatProduct[T] };

      return {
        productId: uuidv4(),
        productName: productDetails.productName,
        productUrl: productDetails.productUrl,
        productCard: "",
        isGrouped: false,
        productDetails: {
          brand:
            productDetails.brand ?? productDetails.productName.split(" ")[0],
          price: productDetails.price,
          discountPrice: productDetails.discountPrice,
          rating: productDetails?.rating,
          reviews: productDetails?.reviews,
          image: productDetails.image,
        },
      } as Product;
    } catch (error) {
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
        await targetPage.waitForTimeout(randomDelay(2, 5));
      }
    } catch (error) {
      throw error;
    }
  }

  public async getBrandSelector(
    page: Page
  ): Promise<ElementHandle<HTMLElement> | null> {
    try {
      return "" as unknown as ElementHandle<HTMLElement>;
    } catch (error) {
      console.error("⚠️ Error fetching brand selector:", error);
      return null;
    }
  }
}

export default CrawlerUtils;
