import { scrapeProducts } from "./src/core/crawler/scrapper.js";
import { CATALOG_CONFIG } from "./src/config/catalog.js";
import { BaseCache } from "./src/providers/cache/interfaces.js";
import { URLBuilder } from "./src/core/crawler/utils/URLBuilder.js";
import { E_COMMERCE } from "./src/types/common.js";

class MockCache extends BaseCache {
  async connect() { return true; }
  async disconnect() { return true; }
  async isUrlCached() { return false; }
}

async function testScraper() {
  console.log("Starting Scraper Test (Browser)...");
  
  const cache = new MockCache();
  const categoryName = "menClothings";
  const subCategoryName = "T-Shirts";
  
  const category = CATALOG_CONFIG[categoryName];
  const subCat = category.subCategories[subCategoryName];
  
  // Update URLs dynamically for the test
  const websites: E_COMMERCE[] = ["amazon"]; // Test with Amazon first to save time
  const filters = {
    minPrice: 500,
    maxPrice: 1000,
    available: true,
    rating: 4
  };

  const generatedUrls: any = {};
  websites.forEach(site => {
    const base = subCat.baseConfig?.[site as E_COMMERCE];
    if (base) {
      generatedUrls[site] = URLBuilder.build(site as E_COMMERCE, base, filters);
      console.log(`Generated URL for ${site}: ${generatedUrls[site]}`);
    }
  });

  const testDetails = {
    ...subCat,
    urls: generatedUrls
  };

  try {
    console.log(`Scraping ${subCategoryName} from ${websites.join(", ")}...`);
    const products = await scrapeProducts(subCategoryName, testDetails, cache);
    
    console.log(`\nSuccessfully scraped ${products?.length || 0} products.`);
    if (products && products.length > 0) {
      console.log("First product sample:");
      console.log(JSON.stringify(products[0], null, 2));
    }
  } catch (err) {
    console.error("Scraper failed:", err);
  }
}

testScraper();
