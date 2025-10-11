import type { SelectionResult } from "../types/index.js";
import productsHunter from "./services/productHunter.js";
import getBrowser from "./utils/browser/getBrowser.js";

/**
 * Scrape products from the given URL and e-commerce website.
 */
export async function scrapeProducts(selection: SelectionResult): Promise<any> {
  const urls = selection.urls;

  if (!urls || urls.length === 0) {
    console.warn("⚠️  No URLs provided for scraping.");
    return null;
  }

  const browser = await getBrowser({ headless: false });

  try {
    const products = await Promise.all(
      urls.map((u, i) => {
        return Promise.all(
          u.map(([website, url]) => {
            const subCategoryInfo =
              selection?.subcategoriesDetails[selection?.subcategories[i]!];

            return productsHunter(
              browser,
              url,
              website,
              selection.subcategories[i]!, // TODO: handle undefined
              subCategoryInfo! // TODO: handle undefined
            );
          })
        );
      })
    );

    console.log("✅  Scraping completed: ", products);

    return products.flat(2);
  } catch (error) {
    console.error(`⚠️  Error in scrapeProducts:`, error);
    return null;
  } finally {
    await browser.close();
  }
}
