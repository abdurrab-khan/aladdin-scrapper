import "dotenv/config";

import SupabaseClient from "./db/supabase.js";
import manager from "./utils/catalogManager.js";
import { scrapeProducts } from "./crawler/scrapper.js";
import { randomDelay } from "./crawler/utils/utils.js";

async function main() {
  try {
    const selection = manager.run();

    const x: ReturnType<typeof manager.run> = [
      {
        category: "fashion",
        subcategories: ["jeans", "t-shirts"],
        isLowPriority: false,
        subcategoriesDetails: {
          tshirts: {
            maxPrice: 1500,
            minPrice: 150,
            maxDiscount: 75,
            maxBrandDiscount: 80,
            maxDiscountForFullPageScreenshot: 85,
            urls: {
              amazon:
                "https://www.amazon.in/s?k=t-shirt&i=apparel&rh=n%3A1968123031&s=popularity-rank",
              flipkart:
                "https://www.flipkart.com/clothing-and-accessories/topwear/tshirt/men-tshirt/pr?sid=clo,ash,ank,edy&otracker=categorytree",
            },
          },
          shirts: {
            maxPrice: 1500,
            minPrice: 150,
            maxDiscount: 75,
            maxBrandDiscount: 80,
            maxDiscountForFullPageScreenshot: 85,
            urls: {
              amazon:
                "https://www.amazon.in/s?k=shirts&i=apparel&rh=n%3A94998646031&s=popularity-rank",
              flipkart:
                "https://www.flipkart.com/mens-shirts/pr?sid=clo%2Cash%2Caxc%2Cmmk&otracker=categorytree",
            },
          },
        },
      },
    ];

    x.forEach(async (s, i) => {
      console.log("🚀  Starting product scraping...");

      const products = await scrapeProducts(s);
      if (products && products.length > 0) {
        await SupabaseClient.saveProducts(products);
      }

      console.log(`\n🎉 Finished scraping for selection: ${s.category}\n`);

      // Adding a delay between different selections to avoid overwhelming the server
      if (i < x.length - 1) {
        await new Promise((res) => setTimeout(res, randomDelay(120, 300)));
      }
    });
  } catch (error) {
    console.error("❌  Error in main:", (error as Error).message ?? error);
  }
}

main();
