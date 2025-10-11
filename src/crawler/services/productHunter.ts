import type { Browser } from "playwright";
import CrawlerFactory from "../utils/crawlerFactory.js";
import type { E_COMMERCE, SubCategoryInfo } from "../../types/index.js";
import getContext from "../utils/browser/getContext.js";

async function productsHunter(
  browser: Browser,
  url: string,
  website: E_COMMERCE,
  subCategory: string,
  subCategoryInfo: SubCategoryInfo
) {
  const { context, page } = await getContext(browser); // Get browser context and page

  // Create the appropriate crawler
  const crawler = await CrawlerFactory.create(
    browser,
    page,
    website,
    url,
    subCategory,
    subCategoryInfo
  );

  try {
    // Start fetching products
    do {
      await crawler.fetchProducts();
    } while (!crawler.isDone);
  } catch (error) {
    console.log(`⚠️  Error happen while crawling ${website}:`, error);
  } finally {
    await context.close(); // Ensure the context is closed after operation
    return crawler && crawler.products.length > 0 ? crawler.products : []; // Return products or null
  }
}

export default productsHunter;
