import type { Browser, ElementHandle, Page } from "playwright";

import type { E_COMMERCE, Product } from "../../types/index.js";
import { CARD_SELECTOR, NEXT_BUTTON_SELECTOR } from "../css/css_selectors.js";
import {
  MAX_EMPTY_PAGES_ALLOWED,
  MAX_PERCENTAGE_DISCOUNT_BRAND,
  MAX_PERCENTAGE_TO_TAKE_FULL_PAGE_SCREENSHOT,
  MAX_PRODUCT_BY_BRAND,
  MAX_PRODUCTS_PER_WEBSITE,
  MIN_PRODUCTS_PER_PAGE,
} from "../constants/const.js";
import CrawlerUtils from "../utils/crawlerUtils.js";

export class Crawler {
  public products: Product[] = [];
  public isDone: boolean = false;

  protected pageNumber: number = 0;

  private page: Page;
  private website: E_COMMERCE;
  private productsCount: number = 0;
  private emptyPageThreshold: number = 3;
  private productsByBrand = new Map();
  private alreadyProcessedProducts = new Set<string>();
  private maxPrice: number;
  private crawlerUtils: CrawlerUtils;

  constructor(website: E_COMMERCE, page: Page, browser: Browser) {
    this.page = page;
    this.website = website;
    this.maxPrice = 2500; // TODO: Make it dynamic based on user input
    this.crawlerUtils = new CrawlerUtils(browser, page, website);
  }

  // @Navigate to the given URL
  protected async navigateToUrl(url: string): Promise<boolean> {
    try {
      // Navigate to the URL with a timeout of 10 seconds
      await this.page.goto(url, {
        timeout: 60000,
        waitUntil: "domcontentloaded",
      });

      // Wait for product cards to load
      await this.crawlerUtils.waitForPageLoad(
        this.page,
        CARD_SELECTOR[this.website],
        true
      );

      // Increase the page number after successful navigation
      this.pageNumber += 1;

      return true;
    } catch (error) {
      const errMsg =
        error instanceof Error
          ? error.message
          : "Unknown error during navigation";

      console.error(`⚠️ Error navigating to ${this.website}:`, errMsg);
      return false;
    }
  }

  // @Extract product details from the card element
  protected async extractProducts(): Promise<void> {
    // If already done, return
    if (this.isDone) {
      return;
    }

    const cardSelector = CARD_SELECTOR[this.website];

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
        `⚠️ Error extracting product details from ${this.website}:`,
        error
      );
    }
  }

  // @Method to insert products to the main list
  protected insertProduct(product: Product[] | null) {
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

  // ========================= PRIVATE METHODS =========================
  // @Private method to extract the product all details
  private async extractProductDetails(
    product: ElementHandle<SVGElement | HTMLElement>
  ): Promise<Product | null> {
    try {
      const productDetails = await this.crawlerUtils.extractProductData(
        product
      );

      // If product details extraction failed, return null
      if (!productDetails) return null;

      // Additional validation for price and discount price
      const { price, discountPrice } = productDetails?.productDetails!;
      if (
        !(
          this.crawlerUtils.isValidProductDeal(
            price,
            discountPrice,
            this.maxPrice
          ) &&
          this.isProductValid(
            productDetails.productDetails?.brand!,
            productDetails.productUrl
          )
        )
      )
        return null;

      // Calculate discount percentage
      const discountPercentage = Math.floor(
        ((price - discountPrice) / price) * 100
      );
      // Taking screen shot
      const fileName = `./products/${this.website}-${productDetails.productId}`;
      const takeFullPageScreenShot =
        discountPercentage >= MAX_PERCENTAGE_TO_TAKE_FULL_PAGE_SCREENSHOT;

      const takeScreenShot = await this.crawlerUtils.takeScreenshot(
        fileName,
        product,
        productDetails.productUrl,
        takeFullPageScreenShot
      );

      // If screenshot failed
      if (!takeScreenShot) {
        if (takeFullPageScreenShot) {
          // Try taking full page screenshot if not already tried
          const fullPageScreenShot = await this.crawlerUtils.takeScreenshot(
            fileName,
            product,
            productDetails.productUrl
          );

          if (!fullPageScreenShot) return null;
        }

        return null;
      }

      // Post process the product
      await this.postProcessProduct(
        productDetails.productDetails?.brand!,
        productDetails.productUrl,
        discountPercentage
      );

      // Set the product card path
      productDetails["productCard"] = `${fileName}.png`;

      console.log(
        `✅ Extracted - ${this.website.toUpperCase()} : ${
          productDetails.productName
        } | Price: ${price} | Discount Price: ${discountPrice} | ${discountPercentage}%off`
      );

      return productDetails;
    } catch (error) {
      return null;
    }
  }

  // @Private method things after successfully extracting a product
  private async postProcessProduct(
    brand: string,
    url: string,
    discountPercentage: number
  ): Promise<void> {
    // Track products by brand with best discount
    if (
      discountPercentage >= MAX_PERCENTAGE_DISCOUNT_BRAND &&
      this.productsByBrand.get(brand) !== -1
    ) {
      this.productsByBrand.set(
        brand,
        (this.productsByBrand.get(brand) || 0) + 1
      );
    }

    // If products by brand exceeded 5 then fetch more products by brand
    if (this.productsByBrand.get(brand) === MAX_PRODUCT_BY_BRAND) {
      await this.fetchBrandProducts(brand);
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

  // @ Private method to check if a product is valid
  private isProductValid(brand: string, url: string): boolean {
    const isValid =
      this.alreadyProcessedProducts.has(url) === false &&
      this.productsByBrand.get(brand) !== -1 &&
      this.productsCount < MAX_PRODUCTS_PER_WEBSITE;

    return isValid;
  }

  // @Private method to fetch products by brand (Not implemented yet)
  private async fetchBrandProducts(brand: string): Promise<void> {
    // Fetch products by brand using crawlerUtils
    const brandProducts = await this.crawlerUtils.getBrandProducts(brand);

    // If brand products found, insert them
    if (brandProducts) {
      this.insertProduct([brandProducts]);
      console.log(`✅ Fetched additional products for brand: ${brand}`);
    }

    // Block further products from this brand
    this.productsByBrand.set(brand, -1);
  }
}
