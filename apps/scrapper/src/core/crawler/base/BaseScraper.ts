import type { Product } from "../../../types/product.js";

export abstract class BaseScraper {
  /**
   * List of products scraped so far.
   */
  abstract products: Product[];

  /**
   * Flag indicating if the scraping is completed.
   */
  abstract isDone: boolean;

  /**
   * Main entry point to start or continue fetching products.
   */
  abstract fetchProducts(): Promise<void>;

  /**
   * Logic to navigate to the next page.
   */
  abstract clickToNextPageBtn(): Promise<void>;

  /**
   * Cleanup resources (closing browser/pages).
   */
  abstract close(): Promise<void>;
}
