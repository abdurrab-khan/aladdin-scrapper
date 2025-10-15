import type RedisDB from "../db/redis.js";
import type { SelectionResult } from "../types/index.js";
import type { Product, SingleProductDetails } from "../types/product.js";
import { MAX_PRODUCT_PER_CATEGORY } from "./constants/const.js";
import productsHunter from "./services/productHunter.js";
import getBrowser from "./utils/browser/getBrowser.js";

type SingleProducts = Product & { details: SingleProductDetails };

/**
 * Scrape products from the given URL and e-commerce website.
 */
export async function scrapeProducts(
  selection: SelectionResult,
  redis: RedisDB
): Promise<any> {
  const selectionDetails = Object.entries(selection.subcategoriesDetails);

  if (selectionDetails.length === 0) {
    console.warn("⚠️  No subcategories selected for scraping.");
    return [];
  }

  const browser = await getBrowser();

  try {
    const products = await Promise.all(
      selectionDetails.map(([category, details]) => {
        const urls = Object.entries(details.urls);

        return Promise.all(
          urls.map(([ecommerce, url]) =>
            productsHunter(
              browser,
              url,
              ecommerce as "amazon" | "flipkart",
              redis,
              category,
              details
            )
          )
        ).then((res) => {
          const flattened = res.flat();

          const groupedProducts = flattened.filter((p) => p.isGrouped);
          const uniqueProducts = flattened.filter(
            (p) => !p.isGrouped
          ) as SingleProducts[];

          const sortedUniqueProducts = uniqueProducts
            .sort((a, b) => {
              // Function to get discount percentage
              const getDiscountPercentage = (product: SingleProducts) => {
                const originalPrice = product.details.price;
                const discountPrice = product.details.discountPercent;
                return Math.floor(
                  ((originalPrice - discountPrice) / originalPrice) * 100
                );
              };
              return getDiscountPercentage(b) - getDiscountPercentage(a);
            })
            .slice(0, MAX_PRODUCT_PER_CATEGORY);

          return [...groupedProducts, ...sortedUniqueProducts];
        });
      })
    );

    return products.flat();
  } catch (error) {
    console.error(`⚠️  Error in scrapeProducts:`, error);
    return null;
  } finally {
    await browser.close();
  }
}
