import manager from "./utils/catalogManager.js";
import { scrapeProducts } from "./crawler/scrapper.js";

async function main() {
  try {
    const selection = manager.run();

    const products = await scrapeProducts({
      category: "Electronics",
      subcategories: ["Laptops", "Smartphones", "Monitor"],
      subcategoriesDetails: {
        Laptops: {
          maxPrice: 100000,
          minPrice: 25000,
          maxDiscount: 30,
          maxBrandDiscount: 35,
          maxDiscountForFullPageScreenshot: 45,
        },
        Smartphones: {
          maxPrice: 80000,
          minPrice: 5000,
          maxDiscount: 30,
          maxBrandDiscount: 35,
          maxDiscountForFullPageScreenshot: 45,
        },
        Monitor: {
          maxPrice: 60000,
          minPrice: 3000,
          maxDiscount: 40,
          maxBrandDiscount: 35,
          maxDiscountForFullPageScreenshot: 50,
        },
      },
      urls: [
        [
          [
            "amazon",
            "https://www.amazon.in/s?k=laptops&crid=NGHBXLTF95Z&qid=1760183789&rnid=7252027031&sprefix=laptops%2Caps%2C256&ref=sr_nr_p_36_0_0&low-price=4900&high-price=91300",
          ],
          [
            "flipkart",
            "https://www.flipkart.com/laptops/pr?sid=6bo,b5g&q=laptops&otracker=categorytree",
          ],
        ],
        [
          [
            "amazon",
            "https://www.amazon.in/s?k=smartphone&rh=n%3A1389401031&ref=nb_sb_noss",
          ],
          [
            "flipkart",
            "https://www.flipkart.com/mobiles/pr?sid=tyy,4io&q=phone&otracker=categorytree",
          ],
        ],
        [
          [
            "amazon",
            "https://www.amazon.in/s?k=monitor&i=electronics&rh=n%3A1389375031&qid=1760203671&rnid=1318502031&ref=sr_nr_p_36_0_0&low-price=1350&high-price=80100",
          ],
          [
            "flipkart",
            "https://www.flipkart.com/search?q=monitor&otracker=search&otracker1=search&marketplace=FLIPKART&as-show=on&as=off&p%5B%5D=facets.price_range.from%3D2000&p%5B%5D=facets.price_range.to%3DMax",
          ],
        ],
      ],
      isLowPriority: false,
    });

    console.log("Products:", products);
  } catch (error) {
    console.error("❌  Error in main:", (error as Error).message ?? error);
  }
}

main();
