import type { Browser, ElementHandle, Page } from "playwright";

import type { E_COMMERCE, Product } from "../../types/index.js";
import { CARD_SELECTOR, NEXT_BUTTON_SELECTOR } from "../css/css_selectors.js";
import {
  MAX_EMPTY_PAGES_ALLOWED,
  MAX_PRODUCTS_PER_WEBSITE,
  MIN_PRODUCTS_PER_PAGE,
} from "../constants/const.js";
import {
  extractProductData,
  getClippingForScreenshot,
  getContextOptionsForScreenShot,
  randomDelay,
} from "../utils/utils.js";
import getContext from "../utils/getContext.js";

export class Crawler {
  public products: Product[] = [];
  public isDone: boolean = false;

  protected pageNumber: number = 0;

  private page: Page;
  private browser: Browser;
  private website: E_COMMERCE;
  private productsCount: number = 0;
  private emptyPageThreshold: number = 3;
  private productsByBrand = new Map();
  private alreadyProcessedProducts = new Set<string>();
  private maxPrice: number;

  constructor(website: E_COMMERCE, page: Page, browser: Browser) {
    this.page = page;
    this.browser = browser;
    this.website = website;
    this.maxPrice = 2500; // TODO: Make it dynamic based on user input
  }

  // @Navigate to the given URL
  protected async navigateToUrl(url: string, page?: Page): Promise<boolean> {
    try {
      // Navigate to the URL with a timeout of 10 seconds
      await (page ?? this.page).goto(url, {
        timeout: 10000,
        waitUntil: "domcontentloaded",
      });

      // Wait for product cards to load
      await this.waitForProductCard();

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
    if (this.isDone) return; // If already done, return

    try {
      const cardSelector = CARD_SELECTOR[this.website];
      const products = await this.page.$$(cardSelector);

      // If no products found, return null
      if (products.length === 0) {
        console.warn(`⚠️ No products found on ${this.website}`);
        return this.increaseEmptyPageThreshold([]);
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
      const nextButton = this.page.locator(nextButtonSelector, {
        hasText,
      });

      if ((await nextButton.count()) === 0) {
        throw new Error(
          `\nℹ️ No 'Next' button found on page ${this.pageNumber} for ${this.website}.`
        );
      }

      // Click the first "Next" button
      await nextButton.first().click();

      // PERFORM WAITING ACTIONS
      await this.waitForProductCard();

      // Increase the page number after successful navigation
      this.pageNumber += 1;

      if (this.pageNumber >= 30) this.isDone = true; // Limit to 20 pages for now

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
      const productDetails = await extractProductData(this.website, product);

      // If product details extraction failed, return null
      if (!productDetails) return null;

      // Basic validations
      const { price, discountPrice } = productDetails?.productDetails!;
      const isValid = this.isProductValid(
        price,
        discountPrice,
        productDetails.productUrl
      );

      // @Check if the product is valid or not
      if (!isValid) return null;

      // Taking screen short
      const fileName = `./products/${this.website}-${productDetails.productId}`;
      const discountPercentage = Math.floor(
        ((price - discountPrice) / price) * 100
      );

      // If discount is more than 85% take full page screenshot otherwise take product card screenshot
      if (discountPercentage >= 85) {
        const takeScreenShot = await this.takeFullPageScreenShot(
          fileName,
          productDetails.productUrl
        );

        if (!takeScreenShot) return null; // If screenshot fails, return null
      } else {
        await product.screenshot({
          path: `${fileName}.png`,
          type: "png",
          caret: "hide",
          animations: "disabled",
          timeout: 10000,
        });
      }

      this.postProcessProduct(productDetails); // Post process the product
      productDetails["productCard"] = `${fileName}.png`; // Set the product card path

      console.log(
        `✅ Extracted - ${this.website.toUpperCase()} : ${
          productDetails.productName
        } | Price: ${price} | Discount Price: ${discountPrice}`
      );

      return productDetails;
    } catch (error) {
      return null;
    }
  }

  // @Private method things after successfully extracting a product
  private postProcessProduct(product: Product): void {
    const brand = product.productDetails?.brand!;
    const url = product.productUrl;

    this.productsByBrand.set(brand, (this.productsByBrand.get(brand) || 0) + 1); // Increment brand count
    this.alreadyProcessedProducts.add(url); // Mark this product as processed
  }

  // @Private method to increase empty page threshold and check if done
  private increaseEmptyPageThreshold(products: Product[] | null): void {
    if (products && products.length >= MIN_PRODUCTS_PER_PAGE) {
      this.emptyPageThreshold = 0;
      return;
    }

    this.emptyPageThreshold += 1;

    if (this.emptyPageThreshold > MAX_EMPTY_PAGES_ALLOWED) {
      console.info(
        `\n🚫 Crawler terminated for ${this.website}: Maximum empty page threshold exceeded (${this.emptyPageThreshold}). Page: ${this.pageNumber}, Products collected: ${this.productsCount}\n`
      );
      this.isDone = true;
    }
  }

  // @ Private method to check if a product is valid
  private isProductValid(
    price: number,
    discountPrice: number,
    url: string
  ): boolean {
    const isValid =
      this.alreadyProcessedProducts.has(url) === false &&
      price < this.maxPrice &&
      price > 0 &&
      discountPrice > 0 &&
      this.productsCount < MAX_PRODUCTS_PER_WEBSITE &&
      discountPrice < price;

    // Basic validations
    if (!isValid) return false;

    // Check if product as best discount or not
    const discountPercentage = Math.floor(
      ((price - discountPrice) / price) * 100
    );

    // If discount is more than 60% consider it as best deal
    if (discountPercentage < 40) {
      return false;
    }

    // Mark this product as processed
    this.alreadyProcessedProducts.add(url);

    return true;
  }

  // @Private method to wait for product cards to load
  private async waitForProductCard(): Promise<void> {
    const cardSelector = CARD_SELECTOR[this.website];

    try {
      // Wait for DOM content to be fully loaded
      await this.page.waitForLoadState("domcontentloaded");

      // Wait for product cards to be visible
      await this.page.waitForSelector(cardSelector, {
        state: "attached",
        timeout: 10000,
      });

      // Random delay between 1.5 to 4 seconds
      await this.page.waitForTimeout(randomDelay(1.5, 4));
    } catch (error) {
      console.error(
        `⚠️  Error waiting for product cards on ${this.website}:`,
        error
      );

      this.isDone = true; // Mark as done if waiting fails
    }
  }

  // @Private method to take a screenshot of the current page/product card
  private async takeFullPageScreenShot(
    fileName: string,
    url: string
  ): Promise<boolean> {
    let contextAndPage: Awaited<ReturnType<typeof getContext>> | null = null;

    try {
      // If URL is provided, navigate to the URL and take a screenshot of the full page
      contextAndPage = await getContext(
        this.browser,
        getContextOptionsForScreenShot(this.website)
      );

      const navigated = await this.navigateToUrl(url, contextAndPage.page);
      if (!navigated) return false; // If navigation fails, return false

      // Taking screenshot of the full page
      await contextAndPage.page.screenshot({
        path: `${fileName}.png`,
        type: "png",
        caret: "hide",
        animations: "disabled",
        clip: getClippingForScreenshot(this.website),
        fullPage: false,
        timeout: 10000,
      });

      return true;
    } catch (error) {
      console.log(
        `⚠️  Error taking full page screenshot for ${fileName}: `,
        (error as Error).message ?? error
      );
      return false;
    } finally {
      if (contextAndPage) {
        await contextAndPage.context.close();
        await contextAndPage.page.close();
      }
    }
  }
}
