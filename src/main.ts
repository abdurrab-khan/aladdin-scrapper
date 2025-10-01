import { scrapeProducts } from "./crawler/scrapper.js";
import type { E_COMMERCE } from "./types/index.js";

async function main() {
  try {
    const urls: Array<[string, E_COMMERCE]> = [
      [
        "https://www.flipkart.com/search?q=jeans&otracker=search&otracker1=search&marketplace=FLIPKART&as-show=on&as=off&page=1",
        "flipkart",
      ],
      // [
      //   "https://www.flipkart.com/search?q=gadgets&otracker=search&otracker1=search&marketplace=FLIPKART&as-show=on&as=off",
      //   "flipkart",
      // ],
      // ["https://www.amazon.in/s?k=gedgets", "amazon"],
      // ["https://www.amazon.in/s?k=raspberry+pi+4", "amazon"],
      // ["https://www.amazon.in/s?k=jeans", "amazon"],
    ];

    const products = await scrapeProducts(urls);

    console.log("Products:", products[0]);
    console.log(`Total products scraped: ${products[0].length}`);
  } catch (error) {
    console.error("❌ Error in main:", (error as Error).message ?? error);
  }
}

main();
