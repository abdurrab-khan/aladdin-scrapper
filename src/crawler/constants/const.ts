// The maximum number of products to scrape from a single website
const MAX_PRODUCTS_PER_WEBSITE = 30;

// The maximum number of products to fetch by brand
const MAX_PRODUCTS_BY_BRAND = 4;

// The maximum number of products to fetch by brand (old constant, kept for reference)
const MAX_PRODUCTS_BY_BRAND_COUNT = 4;

// The maximum number of products to send per category
const MAX_PRODUCT_PER_CATEGORY = 6;

// The maximum number of empty pages allowed before stopping the scraper
const MAX_EMPTY_PAGES_ALLOWED = 5;

// The minimum number of products expected per page
const MIN_PRODUCTS_PER_PAGE = 5;

// The maximum percentage discount to consider a product as a best deal
const MAX_PERCENTAGE_DISCOUNT = 75;

// The maximum percentage discount to consider a product as a brand deal
const MAX_PERCENTAGE_DISCOUNT_BRAND = 30;

// The maximum percentage to take full page screenshot
const MAX_PERCENTAGE_TO_TAKE_FULL_PAGE_SCREENSHOT = 80;

export {
  MAX_PRODUCTS_PER_WEBSITE,
  MAX_PRODUCT_PER_CATEGORY,
  MAX_EMPTY_PAGES_ALLOWED,
  MAX_PRODUCTS_BY_BRAND,
  MAX_PRODUCTS_BY_BRAND_COUNT,
  MAX_PERCENTAGE_DISCOUNT,
  MAX_PERCENTAGE_DISCOUNT_BRAND,
  MAX_PERCENTAGE_TO_TAKE_FULL_PAGE_SCREENSHOT,
  MIN_PRODUCTS_PER_PAGE,
};
