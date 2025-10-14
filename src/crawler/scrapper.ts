import type { SelectionResult } from "../types/index.js";
import productsHunter from "./services/productHunter.js";
import getBrowser from "./utils/browser/getBrowser.js";

/**
 * Scrape products from the given URL and e-commerce website.
 */
export async function scrapeProducts(selection: SelectionResult): Promise<any> {
  const selectionDetails = Object.entries(selection.subcategoriesDetails);

  console.log("🚀  Starting product scraping...");

  if (selectionDetails.length === 0) {
    console.warn("⚠️  No subcategories selected for scraping.");
    return [];
  }

  const browser = await getBrowser({ headless: true });

  try {
    const products = await Promise.all(
      selectionDetails.map(([category, details]) => {
        const urls = Object.entries(details.urls);

        return Promise.all(
          urls.map(([ecommerce, url]) => {
            console.log(
              `🔍 Scraping subcategory: ${category}  - E-commerce: ${ecommerce}`
            );

            return productsHunter(
              browser,
              url,
              ecommerce as "amazon" | "flipkart",
              category,
              details
            );
          })
        );
      })
    );

    return products.flat(2);
  } catch (error) {
    console.error(`⚠️  Error in scrapeProducts:`, error);
    return null;
  } finally {
    await browser.close();
  }
}
