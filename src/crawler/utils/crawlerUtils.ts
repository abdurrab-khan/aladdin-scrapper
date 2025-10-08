import { v4 as uuidv4 } from "uuid";

import getContext from "./browser/getContext.js";
import { cleanData, hasRequiredDetails } from "./helper.js";
import {
  AMAZON_FETCH_BRAND_PRODUCTS,
  FLIPKART_FETCH_BRAND_PRODUCTS,
  PRODUCT_CARD_SELECTOR,
  PRODUCT_DETAILS,
} from "../css/css_selectors.js";
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
  ProductSelector,
} from "../../types/index.js";
import type { Product } from "../../types/product.js";
import type { Browser, ElementHandle, Page } from "playwright";

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
        PRODUCT_CARD_SELECTOR[this.website],
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
  ): Promise<Product | null> {
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
      ) as {
        [T in ProductSelector]: T extends "images" ? string : FlatProduct[T];
      };

      return {
        id: uuidv4(),
        name: productDetails.name,
        url: productDetails.url,
        details: {
          brand: productDetails.brand ?? productDetails.name.split(" ")[0],
          price: productDetails.price,
          discountPrice: productDetails.discountPrice,
          rating: productDetails?.rating,
          reviews: productDetails?.reviews,
        },
        images: {
          card: "",
          image: productDetails.images ?? null,
          fullPage: null,
        },
        isGrouped: false,
      } as Product;
    } catch (error) {
      return null;
    }
  }

  // Method to take screenshot of the product
  public async takeScreenshot(
    fileName: string,
    screenShotElement?: Page | ElementHandle<SVGElement | HTMLElement>,
    productUrl?: string,
    screenShotConfig:
      | Parameters<ElementHandle["screenshot"]>[0]
      | NonNullable<Parameters<Page["screenshot"]>[0]> = {}
  ): Promise<string | null> {
    const fullFilePath = `./products/${fileName}.png`;
    let contextAndPage: Awaited<ReturnType<typeof getContext>> | null = null;

    try {
      // If full page screenshot is required
      if (productUrl) {
        // Create a new context and page for taking screenshot
        contextAndPage = await getContext(
          this.browser,
          getContextOptionsForScreenShot(this.website)
        );

        // Navigate to the product URL
        await this.navigateToUrl(contextAndPage.page, productUrl, false, 20000);

        // Wait for the page to load completely
        await this.waitForPageLoad(
          contextAndPage.page,
          PRODUCT_CARD_SELECTOR[this.website],
          true,
          10000
        );

        // Adding the config for clipping
        (screenShotConfig as NonNullable<Parameters<Page["screenshot"]>[0]>)[
          "clip"
        ] = getClippingForScreenshot(this.website);
      }

      // If product element is not provided, use the one from the new context
      if (!screenShotElement && !contextAndPage?.page) {
        console.error(
          `⚠️ No product or context available for screenshot: ${fileName}`
        );
        return null;
      }

      // Take screenshot of the product or the full page
      const buffer = await (
        screenShotElement ?? contextAndPage?.page
      )?.screenshot({
        path: fullFilePath,
        type: "png",
        caret: "hide",
        animations: "disabled",
        timeout: 10000,
        ...screenShotConfig,
      });

      // If screenshot fails, return null
      if (!buffer) return null;

      return fullFilePath;
    } catch (error) {
      console.error(
        `⚠️ Error taking screenshot for ${fileName}:`,
        (error as Error).message ?? " error);"
      );
      return null;
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
          state: "visible",
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
      if (this.website === "amazon") {
        return await this.getAmazonBrandSelector(page, brand);
      } else if (this.website === "flipkart") {
        return await this.getFlipkartBrandSelector(page, brand);
      }

      return null;
    } catch (error) {
      console.error("⚠️ Error fetching brand selector:", error);
      return null;
    }
  }

  public async getBrandProducts(
    page: Page,
    products: ElementHandle<SVGElement | HTMLElement>[],
    max_price: number
  ): Promise<Product | null> {
    if (!products || products.length === 0) return null;

    // Extract product details concurrently
    const productDetails = await Promise.all(
      products.map(async (product, i) => {
        const details = await this.extractProductData(product);

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
        console.error(
          "⚠️ Error extracting product details:",
          (error as Error).message ?? " error"
        );
        return [];
      });

    if (productDetails.length >= 3) {
      productDetails.sort((a, b) => {
        const priceA = a.details.discountPrice || a.details.price || Infinity;
        const priceB = b.details.discountPrice || b.details.price || Infinity;

        return priceA - priceB;
      });

      const fileName = `group_${this.website}_${
        productDetails[0]?.details.brand
      }_${Date.now()}`;

      // Get bounding box of the first product to determine screenshot area
      const boundingBox = await products[0]?.boundingBox();
      if (!boundingBox) return null;

      const screenShotPath = await this.takeScreenshot(fileName, page, "", {
        clip: getClippingForGroupedScreenshot(
          boundingBox,
          productDetails.length
        ),
      });

      // Let's take a screen shot
      if (screenShotPath) {
        return {
          id: uuidv4(),
          name: productDetails[0]?.details.brand + " Products",
          url: "",
          details: {
            brand: productDetails[0]?.details.brand || "Various",
            price: productDetails[0]?.details.price || 0,
            discountPrice: productDetails[0]?.details.discountPrice || 0,
            discountPercent: Math.round(
              (((productDetails[0]?.details.price || 0) -
                (productDetails[0]?.details.discountPrice || 0)) /
                (productDetails[0]?.details.price || 1)) *
                100
            ),
          },
          images: {
            card: screenShotPath,
            image: productDetails.map((p) => p.images.image as string),
            fullPage: null,
          },
          isGrouped: true,
        };
      }
    }

    return null;
  }

  private async getFlipkartBrandSelector(
    page: Page,
    brand: string
  ): Promise<ElementHandle<HTMLElement | SVGElement> | null> {
    try {
      const sections =
        (await page.$$(FLIPKART_FETCH_BRAND_PRODUCTS["mainSection"])) || [];

      const brandSection = sections.find(async (section) => {
        const titleElement = await section.$(
          FLIPKART_FETCH_BRAND_PRODUCTS["sectionTitle"]
        );

        const text = await titleElement?.textContent();
        return text?.trim().toLowerCase().includes("brand");
      });

      if (brandSection) {
        // Expand the brand section if it's collapsible
        await brandSection.click();

        const inputElement = await brandSection.$(
          FLIPKART_FETCH_BRAND_PRODUCTS["input"]
        );

        if (inputElement) {
          await inputElement.fill(brand);

          // Find all brand selectors
          const allBrandSelectors = await brandSection.$$(
            FLIPKART_FETCH_BRAND_PRODUCTS["selector"]
          );

          if (allBrandSelectors && allBrandSelectors.length > 0) {
            return allBrandSelectors[0] || null;
          }
        }
      }

      return null;
    } catch (error) {
      console.error("⚠️ Error fetching flipkart brand selector:", error);
      return null;
    }
  }

  private async getAmazonBrandSelector(
    page: Page,
    brand: string
  ): Promise<ElementHandle<HTMLElement | SVGElement> | null> {
    try {
      const seeMoreBtn = await page.$(AMAZON_FETCH_BRAND_PRODUCTS["seeMore"]);

      if (seeMoreBtn) {
        // Click to expand the brand list
        await seeMoreBtn.click();

        const allBrandSelectors = await page.$$(
          AMAZON_FETCH_BRAND_PRODUCTS["selector"]
        );

        // Iterate through each brand selector to find the matching brand
        for (const brandSelector of allBrandSelectors) {
          const text = (await brandSelector.textContent())
            ?.trim()
            .toLowerCase();

          // Create a case-insensitive regex to match the brand
          const matchRegex = new RegExp(brand, "i");
          if (matchRegex.test(text || "")) {
            return brandSelector;
          }
        }
      }

      return null;
    } catch (error) {
      console.error("⚠️ Error fetching amazon brand selector:", error);
      return null;
    }
  }
}

export default CrawlerUtils;
