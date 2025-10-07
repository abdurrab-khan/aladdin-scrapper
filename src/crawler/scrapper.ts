import type { E_COMMERCE } from "../types/index.js";
import productsHunter from "./services/productHunter.js";
import getBrowser from "./utils/browser/getBrowser.js";

/**
 * Scrape products from the given URL and e-commerce website.
 */
export async function scrapeProducts(
  urls: Array<[string, E_COMMERCE]>
): Promise<any> {
  const browser = await getBrowser({ headless: true });
  const redis = null; // TODO: Integrate Redis if needed

  try {
    const results = await Promise.all(
      urls.map(
        async ([url, website]) => await productsHunter(browser, url, website)
      )
    );

    return results;
  } catch (error) {
    console.error(`⚠️ Error in scrapeProducts:`, error);
    return null;
  } finally {
    await browser.close();
  }
}
