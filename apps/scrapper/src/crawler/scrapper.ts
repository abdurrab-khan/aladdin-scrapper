import BrowserUtils from "./utils/browserUtils.js";
import CrawlerFactory from "./utils/crawlerFactory.js";

import type RedisDB from "../db/redis.js";
import type { E_COMMERCE, SubCategory } from "../types/index.js";
import type { Product, SingleProductDetails } from "../types/product.js";
import { MAX_PRODUCT_PER_CATEGORY } from "./constants/const.js";

type SingleProducts = Product & { details: SingleProductDetails };

/**
 * Scrape products from the given URL and e-commerce website.
 */
export async function scrapeProducts(
  redis: RedisDB,
  categoryName: string,
  categoryDetails: SubCategory
): Promise<Product[] | null> {
  // checking whether or not subcategory there
  if (!categoryDetails) {
    console.warn(`⚠️ There is no subCategory available ${categoryDetails}`);
    return [];
  }

  try {
    const urls = Object.entries(categoryDetails.urls) as [E_COMMERCE, string][];

    // let's fetch concurrently
    const products = await Promise.allSettled(
      urls.map(async ([website, url]) => {
        // simple return nothing if no url there
        if (!url) {
          return Promise.resolve([] as Product[]);
        }

        // launching browser
        const { browser, context, page } = await BrowserUtils.launchBrowser();

        // initializing crawler to scrape product
        const crawler = await CrawlerFactory.create(
          browser,
          page,
          website,
          url,
          redis,
          categoryName,
          categoryDetails
        );

        try {
          // scrapping till done
          do {
            await crawler.fetchProducts();
          } while (!crawler.isDone);
        } catch (err) {
          const msg =
            err instanceof Error
              ? err.message
              : "An unknown error occured during fetching products";
          console.error(msg);
        } finally {
          if (context) await context.close(); // closing context after finishing fetching
          if (browser) await browser.close(); //closing the browser

          return crawler?.products.length > 0 ? crawler.products : []; // return fetched products
        }
      })
    ).then((products) => {
      // flattening the products array
      const fetchedProducts: Product[] = [];

      products.forEach((result) => {
        if (result.status === "fulfilled") {
          fetchedProducts.push(...result.value);
        }
      });

      return fetchedProducts;
    });

    // filtering grouped products
    const groupedProducts = products.filter((p) => p.isGrouped);

    // filtering single products
    const uniqueProducts = products.filter(
      (p) => !p.isGrouped
    ) as SingleProducts[];

    // perform operations on fetched products;
    const finalProducts = uniqueProducts
      .sort((a, b) => a.details.discountPrice - b.details.discountPrice)
      .slice(0, MAX_PRODUCT_PER_CATEGORY);

    return [...finalProducts, ...groupedProducts];
  } catch (err) {
    const msg =
      err instanceof Error
        ? err.message
        : "An unknown error occured during scraping products";
    throw new Error(msg);
  }
}
