// The maximum number of products to scrape from a single website
const MAX_PRODUCTS_PER_WEBSITE = 30;

// The maximum number of products to send per category
const MAX_PRODUCT_PER_CATEGORY = 8;

// The maximum number of empty pages allowed before stopping the scraper
const MAX_EMPTY_PAGES_ALLOWED = 5;

// The minimum number of products expected per page
const MIN_PRODUCTS_PER_PAGE = 5;

// The maximum number of products allowed per brand before fetching more products by brand
const MAX_PRODUCT_BY_BRAND = 5;

// The maximum percentage discount to consider a product as a best deal
const MAX_PERCENTAGE_DISCOUNT = 65;

// The maximum percentage discount to consider a product as a brand deal
const MAX_PERCENTAGE_DISCOUNT_BRAND = 80;

// The maximum percentage to take full page screenshot
const MAX_PERCENTAGE_TO_TAKE_FULL_PAGE_SCREENSHOT = 85;

export {
  MAX_PRODUCTS_PER_WEBSITE,
  MAX_PRODUCT_PER_CATEGORY,
  MAX_EMPTY_PAGES_ALLOWED,
  MIN_PRODUCTS_PER_PAGE,
  MAX_PRODUCT_BY_BRAND,
  MAX_PERCENTAGE_DISCOUNT,
  MAX_PERCENTAGE_DISCOUNT_BRAND,
  MAX_PERCENTAGE_TO_TAKE_FULL_PAGE_SCREENSHOT,
};
