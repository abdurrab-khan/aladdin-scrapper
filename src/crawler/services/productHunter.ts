import type { Browser } from "playwright";
import CrawlerFactory from "../utils/crawlerFactory.js";
import type { E_COMMERCE } from "../../types/index.js";
import getContext from "../utils/getContext.js";

async function productsHunter(
  browser: Browser,
  url: string,
  website: E_COMMERCE
) {
  const { context, page } = await getContext(browser); // Get browser context and page
  const crawler = await CrawlerFactory.create(url, page, website, browser); // Create the appropriate crawler

  try {
    // Start fetching products
    do {
      await crawler.fetchProducts();
    } while (!crawler.isDone);
  } catch (error) {
    console.log(`⚠️ Error happen while crawling ${website}:`, error);
  } finally {
    await context.close(); // Ensure the context is closed after operation
    return crawler && crawler.products.length > 0 ? crawler.products : null; // Return products or null
  }
}

export default productsHunter;
