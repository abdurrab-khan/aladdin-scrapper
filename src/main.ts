import { scrapeProducts } from "./crawler/scrapper.js";
import type { E_COMMERCE } from "./types/index.js";

async function main() {
  try {
    const urls: Array<[string, E_COMMERCE]> = [
      // [
      //   "https://www.flipkart.com/search?q=jeans&otracker=search&otracker1=search&marketplace=FLIPKART&as-show=on&as=off&p%5B%5D=facets.offer_type%255B%255D%3DBuy%2BMore%252C%2BSave%2BMore&p%5B%5D=facets.offer_type%255B%255D%3DSpecial%2BPrice",
      //   "flipkart",
      // ],
      // [
      //   "https://www.flipkart.com/search?q=phone+accessories+for+men",
      //   "flipkart",
      // ],
      ["https://www.amazon.in/s?k=jeans", "amazon"],
      // ["https://www.amazon.in/s?k=gedgets", "amazon"],
      // ["https://www.amazon.in/s?k=raspberry+pi+4", "amazon"],
    ];

    const products = await scrapeProducts(urls);
    console.log("Products:", products[0]);
    console.log(`Total products scraped: ${products.flat().length}`);
  } catch (error) {
    console.error("❌  Error in main:", (error as Error).message ?? error);
  }
}

main();
