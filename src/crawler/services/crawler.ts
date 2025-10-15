import { ulid } from "ulid";
import type { Browser, ElementHandle, Page } from "playwright";

import { randomDelay } from "../utils/utils.js";
import CrawlerUtils from "../utils/crawlerUtils.js";
import getContext from "../utils/browser/getContext.js";

import type { E_COMMERCE, SubCategory } from "../../types/index.js";
import type { Product, SingleProductDetails } from "../../types/product.js";

import {
  NEXT_BUTTON_SELECTOR,
  PRODUCT_CARD_SELECTOR,
} from "../css/css_selectors.js";
import {
  MAX_EMPTY_PAGES_ALLOWED,
  MAX_PRODUCTS_BY_BRAND,
  MAX_PRODUCTS_BY_BRAND_COUNT,
  MAX_PRODUCTS_PER_WEBSITE,
  MIN_PRODUCTS_PER_PAGE,
} from "../constants/const.js";

export class Crawler {
  public products: Product[] = [];
  public isDone: boolean = false;

  protected pageNumber: number = 0;

  private page: Page;
  private browser: Browser;
  private website: E_COMMERCE;

  private crawlerUtils: CrawlerUtils;
  private tabsOpened: number = 0;
  private productsCount: number = 0;
  private emptyPageThreshold: number = 3;
  private productsByBrand = new Map();
  private alreadyProcessedProducts = new Set<string>();
  private subCategory: string;
  private subCategoryDetails: SubCategory;

  // Private Product Details
  private productPrivateInfo: Record<
    "userId" | "platformId" | "associatedAppId",
    string
  >;

  constructor(
    browser: Browser,
    page: Page,
    website: E_COMMERCE,
    subCategory: string,
    subCategoryDetails: SubCategory
  ) {
    this.page = page;
    this.website = website;
    this.browser = browser;
    this.subCategory = subCategory;
    this.subCategoryDetails = subCategoryDetails;

    this.productPrivateInfo = {
      userId: process.env["USER_ID"] || "",
      platformId: this.getPlatformId(),
      associatedAppId: process.env["APP_ID"] || "",
    };

    this.crawlerUtils = new CrawlerUtils(
      browser,
      page,
      website,
      subCategory,
      subCategoryDetails,
      this.productPrivateInfo
    );
  }

  // @Navigate to the given URL
  protected async navigateToUrl(url: string): Promise<void> {
    try {
      // Navigate to the URL
      await this.crawlerUtils.navigateToUrl(this.page, url);

      // Set to first page after navigation
      this.pageNumber = 1;
    } catch (error) {
      const errMsg =
        error instanceof Error
          ? error.message
          : "Unknown error during navigation";

      console.error(`⚠️  Error navigating to ${this.website}:`, errMsg);

      // Mark as done if navigation fails
      this.isDone = true;
    }
  }

  // @Extract product details from the card element
  protected async extractProducts(): Promise<void> {
    // If already done, return
    if (this.isDone) return;

    const cardSelector = PRODUCT_CARD_SELECTOR[this.website];

    try {
      const products = await this.page.$$(cardSelector);

      // If no products found, return null
      if (products.length === 0) {
        console.warn(`⚠️  No products found on ${this.website}`);
        return this.increaseEmptyPageThreshold(null);
      }

      // Extract details from each product card
      const productDetails = await Promise.all(
        products.map(async (product) => await this.getProductData(product))
      ).then((results) =>
        results.reduce((acc, val) => {
          if (val != null) acc.push(val);
          return acc;
        }, [] as Product[])
      );

      // Insert only if there are valid products
      this.insertProduct(productDetails);
    } catch (error) {
      console.error(
        `⚠️  Error extracting product details from ${this.website}:`,
        error
      );
    }
  }

  // @Method to click to the next page button
  protected async clickToNextPageBtn(hasText: string = "Next"): Promise<void> {
    const nextButtonSelector = NEXT_BUTTON_SELECTOR[this.website]; // Selector for the "Next" button

    try {
      // Locate the "Next" button with the specified text
      const nextButton = this.page.locator(nextButtonSelector, {
        hasText,
      });

      // If no "Next" button found, throw an error
      if ((await nextButton.count()) === 0) {
        throw new Error(
          `\nℹ️ No 'Next' button found on page ${this.pageNumber} for ${this.website}.`
        );
      }

      // Click the first "Next" button
      await nextButton.first().click();

      // PERFORM WAITING ACTIONS
      await this.crawlerUtils.waitForPageLoad(
        this.page,
        nextButtonSelector,
        true
      );

      // Increase the page number after successful navigation
      this.pageNumber += 1;

      // Limit to 20 pages for now
      if (this.pageNumber >= 30) this.isDone = true;

      // Log the progress
      console.log(
        `\n<=====================> ${this.website}: Page ${this.pageNumber} processed - ${this.products.length}/${MAX_PRODUCTS_PER_WEBSITE} products found so far. <=====================>\n`
      );
    } catch (error) {
      console.info(
        error instanceof Error
          ? error.message
          : `⚠️  Error finding 'Next' button on ${this.website}: ${error}`
      );

      this.isDone = true; // Mark as done if error occurs
    }
  }

  // @Private method to extract the product all details
  private async getProductData(
    product: ElementHandle<SVGElement | HTMLElement>
  ): Promise<Product | null> {
    try {
      // If product details extraction failed, return null
      const productData = await this.crawlerUtils.extractProductData(product);

      // If product details found, process further
      if (
        productData &&
        this.checkDeepValidation(productData.brand, productData.url)
      ) {
        const { brand, price, discountPrice } = productData;
        const discountPercent = Math.round(
          ((price - discountPrice) / price) * 100
        );

        // Taking screen shot
        const fileName = `${this.website}_${ulid()}`;
        const takeFullPageScreenShot =
          discountPercent >=
          this.subCategoryDetails.maxDiscountForFullPageScreenshot;

        const cardScreenShot = await this.crawlerUtils.takeScreenshot(
          fileName,
          product
        );
        let fullPageScreenShot: string | null = null;

        // Limit to 5 tabs at a time to avoid memory issues
        if (this.tabsOpened < 3 && takeFullPageScreenShot) {
          // Increase tabs opened count
          this.tabsOpened += 1;

          // Take full page screenshot
          fullPageScreenShot = await this.crawlerUtils.takeScreenshot(
            "full-page_" + fileName,
            undefined,
            productData.url
          );

          // Decrease tabs opened count
          this.tabsOpened -= 1;
        }

        if (!cardScreenShot) {
          console.warn(
            `⚠️  Failed to take screenshot for product: ${productData.name} (${productData.url})`
          );
          return null;
        }

        console.log(
          `✅ Extracted - ${this.website.toUpperCase()} : ${
            productData.name
          } | Price: ${price} | Discount Price: ${discountPrice} | ${discountPercent}%off`
        );

        // Post process the product
        await this.postProcessProduct(brand, productData.url, discountPercent);

        return {
          name: productData.name,
          url: productData.url,
          category: this.subCategory,
          details: {
            brand: productData.brand,
            price: productData.price,
            rating: productData.rating,
            reviews: productData.reviews,
            discountPercent: discountPercent,
            discountPrice: productData.discountPrice,
            discountType: productData.discountType,
          } as SingleProductDetails,
          images: {
            card: cardScreenShot,
            image: productData.images,
            fullPage: fullPageScreenShot,
          },
          isGrouped: false,
          userId: this.productPrivateInfo.userId,
          platformId: this.getPlatformId(),
          associatedAppId: this.productPrivateInfo.associatedAppId,
        };
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  // @Private to insert products to the main list
  private insertProduct(product: Product[] | null) {
    // If no products, return
    if (product && product.length > 0) {
      const availableSlots = MAX_PRODUCTS_PER_WEBSITE - this.productsCount;

      // If more products than available slots, slice the array
      if (product.length > availableSlots)
        product = product.slice(0, availableSlots);

      this.products.push(...product); // Insert products to the main list
      this.productsCount += product.length; // Update products count
    } else {
      // Check for empty page threshold
      this.increaseEmptyPageThreshold(product);
    }

    // Check if max products reached
    if (this.productsCount >= MAX_PRODUCTS_PER_WEBSITE) this.isDone = true;
  }

  // @Private method things after successfully extracting a product
  private async postProcessProduct(
    brand: string,
    url: string,
    discountPercentage: number
  ): Promise<void> {
    const brandKey = brand.toLowerCase();
    const conditionToAddBrand =
      brand !== "Unknown" &&
      this.productsByBrand.get(brandKey) !== -1 &&
      discountPercentage >= this.subCategoryDetails.maxBrandDiscount;

    // Track products by brand with best discount
    if (conditionToAddBrand) {
      this.productsByBrand.set(
        brandKey,
        (this.productsByBrand.get(brandKey) || 0) + 1
      );
    }

    // If products by brand exceed limit, fetch more products for that brand only (once)
    if (
      this.productsByBrand.get(brandKey) >= MAX_PRODUCTS_BY_BRAND &&
      this.productsByBrand.get(brandKey) !== -1
    ) {
      console.log(
        `\n🔍 Fetching more products for brand ${brand} from ${this.website}...\n`
      );
      this.productsByBrand.set(brandKey, -1);
      await this.fetchBrandProducts(brandKey);
    }

    // Mark this product as processed
    this.alreadyProcessedProducts.add(url);
  }

  // @Private method to increase empty page threshold and check if done
  private increaseEmptyPageThreshold(products: Product[] | null): void {
    // If products found and more than minimum required, decrease the threshold
    if (products && products.length > MIN_PRODUCTS_PER_PAGE) {
      if (this.emptyPageThreshold > 0) {
        this.emptyPageThreshold -= 1;
      }
    } else {
      this.emptyPageThreshold += 1;

      // If empty page threshold exceeded max allowed, mark as done
      if (this.emptyPageThreshold > MAX_EMPTY_PAGES_ALLOWED) {
        console.info(
          `\n🚫 Crawler terminated for ${this.website}: Maximum empty page threshold exceeded (${this.emptyPageThreshold}). Page: ${this.pageNumber}, Products collected: ${this.productsCount}\n`
        );
        this.isDone = true;
      }
    }
  }

  // @Private method to check deep validation for brand and URL
  private checkDeepValidation(brand: string, url: string): boolean {
    const isValid =
      this.alreadyProcessedProducts.has(url) === false &&
      this.productsByBrand.get(brand) !== -1 &&
      this.productsCount < MAX_PRODUCTS_PER_WEBSITE;

    return isValid;
  }

  // @Private method to fetch products by brand (Not implemented yet)
  private async fetchBrandProducts(brand: string): Promise<void> {
    let contextAndPage: Awaited<ReturnType<typeof getContext>> | null = null;

    try {
      contextAndPage = await getContext(this.browser);

      // Navigate to go current page URL
      await this.crawlerUtils.navigateToUrl(
        contextAndPage.page,
        this.page.url()
      );

      // Extract brand selector
      const brandSelector = await this.crawlerUtils.getBrandSelector(
        contextAndPage.page,
        brand
      );

      // If brand selector found, click and fetch products
      if (brandSelector !== null) {
        // Click the brand selector
        await brandSelector.click();

        // Wait to load the brand products
        await this.crawlerUtils.waitForPageLoad(
          contextAndPage.page,
          PRODUCT_CARD_SELECTOR[this.website],
          false,
          5000
        );

        // Wait for a random time between 1.5 to 2.5 seconds
        await contextAndPage.page.waitForTimeout(randomDelay(1.5, 2.5));

        // Finally extract the products
        const rawProducts = await contextAndPage.page.$$(
          PRODUCT_CARD_SELECTOR[this.website]
        );

        // Final extraction of product details
        const products = await this.crawlerUtils.getBrandProducts(
          contextAndPage.page,
          rawProducts.slice(0, MAX_PRODUCTS_BY_BRAND_COUNT)
        );

        // Insert the products if found
        if (products) {
          products["url"] = contextAndPage.page.url();
          this.insertProduct([products]);
          console.log(
            `\n🛍️  Fetched products for brand ${brand} from ${this.website}\n`
          );
        }
      } else {
        console.warn(
          `⚠️  No selector found for brand ${brand} on ${this.website}`
        );
      }
    } catch (error) {
      console.error(
        `⚠️  Error fetching products for brand ${brand}: `,
        (error as Error).message
      );
    } finally {
      if (contextAndPage) {
        await contextAndPage.page.close();
        await contextAndPage.context.close();
      }
    }
  }

  private getPlatformId(): string {
    if (this.website === "amazon") {
      return process.env["AMAZON_PLATFORM_ID"] || "";
    } else {
      return process.env["FLIPKART_PLATFORM_ID"] || "";
    }
  }
}
