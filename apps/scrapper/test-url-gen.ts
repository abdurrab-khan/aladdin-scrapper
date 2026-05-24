import { CATALOG_CONFIG } from "./src/config/catalog.js";
import { URLBuilder } from "./src/core/crawler/utils/URLBuilder.js";
import { E_COMMERCE, ScrapeFilters } from "./src/types/common.js";

function testUrlGeneration() {
  console.log("Testing URL Generation...");
  
  const categoryName = "menClothings";
  const subCategoryName = "T-Shirts";
  const websites: E_COMMERCE[] = ["amazon", "flipkart"];
  const filters: ScrapeFilters = {
    minPrice: 500,
    maxPrice: 1000,
    available: true,
    rating: 4
  };

  const category = CATALOG_CONFIG[categoryName];
  if (!category) {
    console.error("Category not found");
    return;
  }

  const subCat = category.subCategories[subCategoryName];
  if (!subCat) {
    console.error("Subcategory not found");
    return;
  }

  websites.forEach(site => {
    const base = subCat.baseConfig?.[site];
    if (base) {
      const url = URLBuilder.build(site, base, filters);
      console.log(`\nPlatform: ${site}`);
      console.log(`Generated URL: ${url}`);
    } else {
      console.log(`\nPlatform: ${site}`);
      console.log("No baseConfig found, using static URL fallback (if any)");
    }
  });
}

testUrlGeneration();
