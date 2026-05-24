import type { E_COMMERCE, SubCategory } from "../../types/common.js";
import type { Product, SingleProductDetails } from "../../types/product.js";
import { MAX_PRODUCT_PER_CATEGORY } from "./constants.js";
import CrawlerFactory from "./utils/crawlerFactory.js";
import type { BaseCache } from "../../providers/cache/interfaces.js";

type SingleProducts = Product & { details: SingleProductDetails };

export class ScraperFacade {
  /**
   * Orchestrates the scraping process across multiple websites.
   */
  public async scrape(
    categoryName: string,
    categoryDetails: SubCategory,
    cache: BaseCache,
  ): Promise<Product[]> {
    if (!categoryDetails) {
      console.warn("Subcategory details are missing.");
      return [];
    }

    const urls = Object.entries(categoryDetails.urls) as [E_COMMERCE, string][];

    const results = await Promise.allSettled(
      urls.map(async ([website, url]) => {
        if (!url) return [];

        const scraper = await CrawlerFactory.create(
          url,
          website,
          categoryName,
          categoryDetails,
          cache,
        );

        try {
          do {
            await scraper.fetchProducts();
          } while (!scraper.isDone);
          
          return scraper.products;
        } catch (err) {
          console.error(`Error in ${website} scraper:`, err);
          return [];
        } finally {
          await scraper.close();
        }
      }),
    );

    const allProducts: Product[] = [];
    results.forEach((result) => {
      if (result.status === "fulfilled") {
        allProducts.push(...result.value);
      }
    });

    return this.postProcess(allProducts);
  }

  /**
   * Sorts, filters, and slices the final product list.
   */
  private postProcess(products: Product[]): Product[] {
    const groupedProducts = products.filter((p) => p.isGrouped);
    const uniqueProducts = products.filter((p) => !p.isGrouped) as SingleProducts[];

    const finalProducts = uniqueProducts
      .sort((a, b) => a.details.discountPrice - b.details.discountPrice)
      .slice(0, MAX_PRODUCT_PER_CATEGORY);

    return [...finalProducts, ...groupedProducts];
  }
}
