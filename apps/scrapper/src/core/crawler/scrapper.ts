import { ScraperFacade } from "./ScraperFacade.js";
import type { SubCategory } from "../../types/common.js";
import type { Product } from "../../types/product.js";
import type { BaseCache } from "../../providers/cache/interfaces.js";

/**
 * Scrape products from the given URL and e-commerce website.
 */
export async function scrapeProducts(
  categoryName: string,
  categoryDetails: SubCategory,
  cache: BaseCache,
): Promise<Product[] | null> {
  try {
    const facade = new ScraperFacade();
    return await facade.scrape(categoryName, categoryDetails, cache);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "An unknown error occurred during scraping products";
    throw new Error(msg);
  }
}
