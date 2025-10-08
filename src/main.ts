import { scrapeProducts } from "./crawler/scrapper.js";
import type { E_COMMERCE } from "./types/index.js";

async function main() {
  try {
    const urls: Array<[string, E_COMMERCE]> = [
      // [
      //   "https://www.flipkart.com/search?q=jeans&otracker=search&otracker1=search&marketplace=FLIPKART&as-show=on&as=off&page=1",
      //   "flipkart",
      // ],
      // [
      //   "https://www.flipkart.com/search?q=gadgets&otracker=search&otracker1=search&marketplace=FLIPKART&as-show=on&as=off",
      //   "flipkart",
      // ],
      ["https://www.amazon.in/s?k=jeans", "amazon"],
      // ["https://www.amazon.in/s?k=gedgets", "amazon"],
      // ["https://www.amazon.in/s?k=raspberry+pi+4", "amazon"],
    ];

    const products = await scrapeProducts(urls);
    console.log("Products:", products[0]);
    console.log(`Total products scraped: ${products[0].length}`);

    // const browser = await getBrowser({ headless: false });
    // const { page, context } = await getContext(browser, {
    //   screen: { height: 2500, width: 1920 },
    //   viewport: { height: 2500, width: 1920 },
    // });

    // await page.goto("https://www.amazon.in/s?k=gedgets", {
    //   waitUntil: "domcontentloaded",
    // });

    // await page.waitForTimeout(1000);

    // const seeMore = await page.$(AMAZON_FETCH_BRAND_PRODUCTS["seeMore"]);
    // await seeMore?.click();

    // const brandSection = await page.$$(AMAZON_FETCH_BRAND_PRODUCTS["selector"]);

    // for (const section of brandSection) {
    //   const text = (await section.textContent())?.trim().toLowerCase();

    //   if (text === "amazon" || text?.includes("amazon")) {
    //     await section.click();
    //     break;
    //   }
    // }

    // await page.waitForLoadState("domcontentloaded");
    // await page.waitForTimeout(1000);

    // const productsCards = await page.$$(PRODUCT_CARD["amazon"]);
    // const firstBound = await productsCards[0]?.boundingBox();

    // await page.screenshot({
    //   path: "amazon_brand_click.png",
    //   type: "png",
    //   caret: "hide",
    //   fullPage: false,
    //   clip: getClippingForGroupedScreenshot(firstBound!, 3),
    //   timeout: 60000,
    // });

    // console.log("Current URL:", page.url());

    // await context.close();
    // await page.close();

    // browser.close();
  } catch (error) {
    console.error("❌  Error in main:", (error as Error).message ?? error);
  }
}

main();
