import { cleanData, hasRequiredDetails } from "./helper.js";
import { randomDelay, isValidProductDeal } from "./utils.js";

import {
  PRODUCT_DETAILS,
  PRODUCT_CARD_SELECTOR,
  AMAZON_FETCH_BRAND_PRODUCTS,
  FLIPKART_FETCH_BRAND_PRODUCTS,
} from "../css/css_selectors.js";
import type {
  E_COMMERCE,
  SubCategory,
  ProductSelector,
  ProductSelectorValue,
} from "../../types/index.js";
import type { Browser, ElementHandle, Page } from "playwright";
import type { GroupProductDetails, Product } from "../../types/product.js";

class CrawlerUtils {
  private browser: Browser;
  private page: Page;
  private website: E_COMMERCE;
  private subCategory: string;
  private subCategoryDetails: SubCategory;

  private ProductPrivateInfo: Record<
    "userId" | "platformId" | "associatedAppId",
    string
  >;

  constructor(
    browser: Browser,
    page: Page,
    website: E_COMMERCE,
    subCategory: string,
    subCategoryDetails: SubCategory,
    productPrivateInfo: Record<
      "userId" | "platformId" | "associatedAppId",
      string
    >
  ) {
    this.browser = browser;
    this.page = page;
    this.website = website;
    this.subCategory = subCategory;
    this.subCategoryDetails = subCategoryDetails;
    this.ProductPrivateInfo = productPrivateInfo;
  }

  private async getFlipkartBrandSelector(
    page: Page,
    brand: string
  ): Promise<ElementHandle<HTMLElement | SVGElement> | null> {
    try {
      const sections = await page.$$(
        FLIPKART_FETCH_BRAND_PRODUCTS["mainSection"]
      );

      for (const section of sections) {
        const title = await section.$(
          FLIPKART_FETCH_BRAND_PRODUCTS["sectionTitle"]
        );

        if (
          title &&
          (await title?.textContent())?.trim().toLowerCase() === "brand"
        ) {
          // If the section is collapsed, click to expand it
          if (((await section.boundingBox())?.height ?? 0) < 60) {
            await section.click();
            await page.waitForTimeout(500);
          }

          const input = await section.$(FLIPKART_FETCH_BRAND_PRODUCTS["input"]);
          await input?.fill(brand);

          const brandSector = await section.$(
            FLIPKART_FETCH_BRAND_PRODUCTS["selector"]
          );

          return brandSector || null;
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

  public async navigateToUrl(
    page: Page,
    url: string,
    showRandomDelay = true,
    waitSelector: string = PRODUCT_CARD_SELECTOR[this.website],
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
      await this.waitForPageLoad(page, waitSelector, showRandomDelay);
    } catch (error) {
      const errMsg =
        (error as Error).message ?? "⚠️ An error occurred during navigation";
      throw new Error("⚠️ Navigation error: " + errMsg);
    }
  }

  public async extractProductData(
    product: ElementHandle<SVGElement | HTMLElement>
  ): Promise<ProductSelectorValue | null> {
    // Return null if product is null or undefined
    if (!product) return null;

    const productCSSSelector = PRODUCT_DETAILS[this.website];

    try {
      const productDetails = Object.fromEntries(
        await Promise.all(
          Object.entries(productCSSSelector).map(async ([key, selector]) => {
            const typedKey = key as ProductSelector;

            // @Checking whether the selector is valid or not
            if (!selector.trim()) {
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
      ) as ProductSelectorValue;

      // If brand is missing, derive it from the product name
      if (!productDetails.brand)
        productDetails.brand = productDetails.name.split(" ")[0] ?? "Unknown";

      // Validate the extracted product details
      const hasValidDetails = isValidProductDeal(
        productDetails.price,
        productDetails.discountPrice,
        this.subCategoryDetails.minPrice,
        this.subCategoryDetails.maxPrice,
        this.subCategoryDetails.maxDiscount
      );

      return hasValidDetails ? productDetails : null;
    } catch (error) {
      console.log(
        `⚠️  Error extracting product data:`,
        (error as Error).message ?? " error"
      );
      return null;
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
      await targetPage.waitForLoadState("load", {
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

      throw new Error(`⚠️  Brand selector not implemented for ${this.website}`);
    } catch (error) {
      console.error("⚠️  Error fetching brand selector:", error);
      return null;
    }
  }

  public async getBrandProducts(
    page: Page,
    products: ElementHandle<SVGElement | HTMLElement>[]
  ): Promise<Product | null> {
    if (!products || products.length === 0) return null;

    // Extract product details concurrently
      const productDetails = await Promise.all(
        products.map(async (product, i) => {
          const details = await this.extractProductData(product);

          if (details) {
            return details; // Return valid product details
          }

          // If no valid products found after checking a few, log a warning
          if (i < 3) {
            throw new Error(`No valid products found for this brand`);
          }

          return null; // Skip invalid product
        })
      )
      .then((results) =>
        results.reduce((acc, val) => {
          if (val != null) acc.push(val);
          return acc;
        }, [] as ProductSelectorValue[])
      )
      .catch((error) => {
        console.error(
          "⚠️  Error extracting product details for :",
          (error as Error).message ?? " error"
        );
        return [];
      });

    if (productDetails.length >= 3) {
      productDetails.sort((a, b) => {
        const priceA = a.discountPrice || a.price || Infinity;
        const priceB = b.discountPrice || b.price || Infinity;

        return priceA - priceB;
      });

      return {
        name: "Grouped " + productDetails[0]?.brand + " Products",
        category: this.subCategory,
        url: "",
        details: {
          brand: productDetails[0]?.brand || "Various",
          startPrice: productDetails[0]?.price || 0,
          discountStartPrice: productDetails[0]?.discountPrice || 0,
          productCount: productDetails.length,
          avgRating:
            parseFloat(
              (
                productDetails.reduce((sum, p) => sum + (p.rating || 0), 0) /
                productDetails.filter((p) => p.rating).length
              ).toFixed(2)
            ) || undefined,
          totalReviews:
            productDetails.reduce((sum, p) => sum + (p.reviews || 0), 0) ||
            undefined,
        } as GroupProductDetails,
        images: {
          card: productDetails[0]?.images || "",
          image: productDetails.map((p) => p.images as string),
          fullPage: null,
        },
        screenshotInfo: {
          fullPageRequired: false,
          grouped: true,
          website: this.website,
          priceDetails: {
            minPrice: this.subCategoryDetails.minPrice,
            maxPrice: this.subCategoryDetails.maxPrice,
            discount: this.subCategoryDetails.maxBrandDiscount,
          },
        },
        isGrouped: true,
        userId: this.ProductPrivateInfo.userId,
        platformId: this.ProductPrivateInfo.platformId,
        associatedAppId: this.ProductPrivateInfo.associatedAppId,
      };
    }

    return null;
  }

  // TODO: NEW VERSION OF Crawler Utils
  /**
   * A simple function to generate a random user agent string.
   * @returns A random user agent string.
   */
  static generateRandomUserAgent = (): string => {
    return `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${Math.floor(
      Math.random() * (115 - 100) + 100
    )}.0.${Math.floor(Math.random() * (5793 - 4000) + 4000)}.${Math.floor(
      Math.random() * (140 - 10) + 10
    )} Safari/537.36`;
  };

}

export default CrawlerUtils;
