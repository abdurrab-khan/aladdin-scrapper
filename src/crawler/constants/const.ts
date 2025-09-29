// The maximum number of products to scrape from a single website
const MAX_PRODUCTS_PER_WEBSITE = 40;

// The maximum number of products to send per category
const MAX_PRODUCT_PER_CATEGORY = 8;

// The maximum number of empty pages allowed before stopping the scraper
const MAX_EMPTY_PAGES_ALLOWED = 5;

// The minimum number of products expected per page
const MIN_PRODUCTS_PER_PAGE = 5;

export {
  MAX_PRODUCTS_PER_WEBSITE,
  MAX_PRODUCT_PER_CATEGORY,
  MAX_EMPTY_PAGES_ALLOWED,
  MIN_PRODUCTS_PER_PAGE,
};
