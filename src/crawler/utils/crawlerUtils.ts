import { v4 as uuidv4 } from "uuid";
import type { Browser, ElementHandle, Page } from "playwright";

import getContext from "./getContext.js";
import { cleanData, hasRequiredDetails } from "./helper.js";
import { CARD_SELECTOR, PRODUCT_DETAILS } from "../css/css_selectors.js";
import {
  getClippingForGroupedScreenshot,
  getClippingForScreenshot,
  getContextOptionsForScreenShot,
  isValidProductDeal,
  randomDelay,
} from "./utils.js";

import type {
  E_COMMERCE,
  FlatProduct,
  Product,
  ProductSelector,
} from "../../types/index.js";
import { getBrandSelectors } from "./utility.js";
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
    page: Page,
    brand: string
  ): Promise<ElementHandle<HTMLElement | SVGElement> | null> {
    try {
      const brandSelectorFunc = getBrandSelectors(this.website);

      if (brandSelectorFunc) {
        return await brandSelectorFunc(page, brand);
      }

      return null;
    } catch (error) {
      console.error("⚠️ Error fetching brand selector:", error);
      return null;
    }
  }

  public async getBrandProducts(
    max_price: number,
    products: ElementHandle<SVGElement | HTMLElement>[],
    page: Page
  ): Promise<Product | null> {
    if (!products || products.length === 0) return null;

    // Extract product details concurrently
    const productDetails = await Promise.all(
      products.map(async (product, i) => {
        const details = await this.extractProductData(product);

        console.log("Extracted Details:", details);

        if (!details) {
          // At-least 3 valid products are required to proceed
          if (i < 3) throw new Error("No valid products found for the brand");
          return null; // Skip invalid product
        }

        // Check if the product is a valid deal
        const {
          productDetails: { price, discountPrice },
        } = details;

        if (!isValidProductDeal(price, discountPrice, max_price)) {
          // At-least 3 valid products are required to proceed
          if (i < 3) throw new Error("No valid products found for the brand");
          return null; // Skip invalid deal
        }
        return details;
      })
    )
      .then((results) =>
        results.reduce((acc, val) => {
          if (val != null) acc.push(val);
          return acc;
        }, [] as Product[])
      )
      .catch((error) => {
        console.error("⚠️ Error extracting product details:", error);
        return [];
      });

    if (productDetails.length >= 3) {
      productDetails.sort((a, b) => {
        const priceA =
          a.productDetails.discountPrice || a.productDetails.price || Infinity;
        const priceB =
          b.productDetails.discountPrice || b.productDetails.price || Infinity;
        return priceA - priceB;
      });

      const fileName = `./products/group_${this.website}_${
        productDetails[0]?.productDetails.brand
      }_${Date.now()}`;

      // Let's take a screen shot
      if (
        await this.getScreenshotForProduct(
          page,
          fileName,
          productDetails.length,
          products[0]
        )
      ) {
        return {
          productId: uuidv4(),
          isGrouped: true,
          productCard: `${fileName}.png`,
          productName: productDetails[0]?.productDetails.brand + " Products",
          productUrl: "",
          productDetails: {
            brand: productDetails[0]?.productDetails.brand || "Various",
            price: productDetails[0]?.productDetails.price || 0,
            discountPrice: productDetails[0]?.productDetails.discountPrice || 0,
            image: productDetails.map((p) => p.productDetails.image as string),
          },
        };
      }
    }

    return null;
  }

  public async getScreenshotForProduct(
    page: Page,
    filePath: string,
    totalProducts: number,
    product: ElementHandle<SVGElement | HTMLElement> | undefined
  ): Promise<boolean> {
    if (!product) return false;

    const boundingBox = await product.boundingBox();

    // If bounding box is not available, return false
    if (!boundingBox) return false;

    try {
      const clipped = getClippingForGroupedScreenshot(
        boundingBox,
        totalProducts
      );

      await page.screenshot({
        path: `${filePath}.png`,
        type: "png",
        caret: "hide",
        fullPage: false,
        animations: "disabled",
        timeout: 30000,
        clip: clipped,
      });

      return true;
    } catch (error) {
      return false;
    }
  }
}

export default CrawlerUtils;
