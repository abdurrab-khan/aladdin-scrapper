import type { Browser, ElementHandle, Page } from "playwright";

import CrawlerUtils from "../utils/crawlerUtils.js";
import { isValidProductDeal } from "../utils/utils.js";
import type { E_COMMERCE, Product } from "../../types/index.js";

import {
  NEXT_BUTTON_SELECTOR,
  PRODUCT_CARD_SELECTOR,
} from "../css/css_selectors.js";
import {
  MAX_EMPTY_PAGES_ALLOWED,
  MAX_PERCENTAGE_DISCOUNT_BRAND,
  MAX_PERCENTAGE_TO_TAKE_FULL_PAGE_SCREENSHOT,
  MAX_PRODUCTS_BY_BRAND,
  MAX_PRODUCTS_BY_BRAND_COUNT,
  MAX_PRODUCTS_PER_WEBSITE,
  MIN_PRODUCTS_PER_PAGE,
} from "../constants/const.js";
import getContext from "../utils/browser/getContext.js";

export class Crawler {
  public products: Product[] = [];
  public isDone: boolean = false;

  protected pageNumber: number = 0;

  public page: Page;
  private website: E_COMMERCE;
  private productsCount: number = 0;
  private emptyPageThreshold: number = 3;
  private productsByBrand = new Map();
  private alreadyProcessedProducts = new Set<string>();
  private maxPrice: number;
  private crawlerUtils: CrawlerUtils;
  private browser: Browser;

  constructor(website: E_COMMERCE, page: Page, browser: Browser) {
    this.page = page;
    this.website = website;
    this.browser = browser;
    this.maxPrice = 2500; // TODO: Make it dynamic based on user input
    this.crawlerUtils = new CrawlerUtils(browser, page, website);
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

      console.error(`⚠️ Error navigating to ${this.website}:`, errMsg);

      // Mark as done if navigation fails
      this.isDone = true;
    }
  }

  // @Extract product details from the card element
  protected async extractProducts(): Promise<void> {
    if (this.isDone) return; // If already done, return

    const cardSelector = PRODUCT_CARD_SELECTOR[this.website];

    try {
      const products = await this.page.$$(cardSelector);

      // If no products found, return null
      if (products.length === 0) {
        console.warn(`⚠️ No products found on ${this.website}`);
        return this.increaseEmptyPageThreshold(null);
      }

      // Extract details from each product card
      const productDetails = await Promise.all(
        products.map(
          async (product) => await this.extractProductDetails(product)
        )
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
          : `⚠️ Error finding 'Next' button on ${this.website}: ${error}`
      );

      this.isDone = true; // Mark as done if error occurs
    }
  }

  // @Private method to extract the product all details
  private async extractProductDetails(
    product: ElementHandle<SVGElement | HTMLElement>
  ): Promise<Product | null> {
    try {
      // If product details extraction failed, return null
      const productData = await this.crawlerUtils.extractProductData(product);

      // If product details found, process further
      if (productData && this.checkDeepValidation(productData)) {
        // Taking screen shot
        const fileName = `./products/${this.website}-${productData.id}`;
        const takeFullPageScreenShot =
          productData.details.discountPercent >=
          MAX_PERCENTAGE_TO_TAKE_FULL_PAGE_SCREENSHOT;

        const cardScreenShot = await this.crawlerUtils.takeScreenshot(
          fileName,
          product
        );
        let fullPageScreenShot: string | null = null;

        // If high discount, take full page screenshot
        if (takeFullPageScreenShot) {
          // Try taking full page screenshot if not already tried
          fullPageScreenShot = await this.crawlerUtils.takeScreenshot(
            fileName,
            undefined,
            productData.url
          );
        }

        if (!cardScreenShot && !fullPageScreenShot) {
          console.warn(
            `⚠️  Failed to take screenshot for product: ${productData.name} (${productData.url})`
          );
          return null;
        }

        productData["images"]["card"] = `${fileName}.png`;
        productData["images"]["fullPage"] = fullPageScreenShot ?? null;

        const { brand, price, discountPrice, discountPercent } =
          productData.details;

        console.log(
          `✅ Extracted - ${this.website.toUpperCase()} : ${
            productData.name
          } | Price: ${price} | Discount Price: ${discountPrice} | ${discountPercent}%off`
        );

        // Post process the product
        await this.postProcessProduct(brand, productData.url, discountPercent);

        return productData;
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
    }

    // Check for empty page threshold
    this.increaseEmptyPageThreshold(product);

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

    // Track products by brand with best discount
    if (
      discountPercentage >= MAX_PERCENTAGE_DISCOUNT_BRAND &&
      this.productsByBrand.get(brand) !== -1
    ) {
      this.productsByBrand.set(
        brandKey,
        (this.productsByBrand.get(brandKey) || 0) + 1
      );
    }

    // If products by brand exceeded 5 then fetch more products by brand
    if (this.productsByBrand.get(brandKey) >= MAX_PRODUCTS_BY_BRAND) {
      console.log(
        `\n🔍 Fetching more products for brand ${brand} from ${this.website}...\n`
      );

      await this.fetchBrandProducts(brandKey);
      this.productsByBrand.set(brandKey, -1);
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
  private checkDeepValidation(productDetails: Product): boolean {
    const {
      url,
      details: { brand, price, discountPrice },
    } = productDetails;

    const isValid =
      isValidProductDeal(price, discountPrice, this.maxPrice) &&
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
        this.page.url(),
        true,
        10000
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

        // Finally extract the products
        const rawProducts = await contextAndPage.page.$$(
          PRODUCT_CARD_SELECTOR[this.website]
        );

        // Final extraction of product details
        const products = await this.crawlerUtils.getBrandProducts(
          contextAndPage.page,
          rawProducts.slice(0, MAX_PRODUCTS_BY_BRAND_COUNT),
          this.maxPrice
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
}
