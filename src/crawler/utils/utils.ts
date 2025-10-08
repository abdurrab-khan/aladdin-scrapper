import type { BrowserContextOptions } from "playwright";
import type { E_COMMERCE } from "../../types/index.js";
import { MAX_PERCENTAGE_DISCOUNT } from "../constants/const.js";

/**
 * Generate a random delay between min and max seconds
 * @param min - minimum seconds
 * @param max - maximum seconds
 * @returns - random delay in milliseconds between min and max seconds
 */
export function randomDelay(min: number = 0, max: number = 3) {
  const minMs = min * 1000;
  const maxMs = max * 1000;

  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
}

/**
 * Get the context options for screenshot based on the website
 * @param website - E_COMMERCE
 * @returns - Partial<BrowserContextOptions>
 */
export function getContextOptionsForScreenShot(
  website: E_COMMERCE
): Partial<BrowserContextOptions> {
  const screen = { height: 1080, width: 1920 };
  const viewport = { height: 1080, width: 1920 };

  switch (website) {
    case "amazon":
      return {
        screen,
        viewport: { height: 1000, width: 1400 },
      };
    case "flipkart":
      return {
        screen,
        viewport: { height: 800, width: 1400 },
      };
    default:
      return {
        screen,
        viewport,
      };
  }
}

/**
 * Get the clipping for screenshot based on the website
 * @param website - E_COMMERCE
 * @returns - clipping for screenshot
 */
export function getClippingForScreenshot(website: E_COMMERCE, yAxis?: number) {
  switch (website) {
    case "amazon":
      return { x: 0, y: yAxis ?? 177, width: 1400, height: 820 };
    case "flipkart":
      return { x: 0, y: yAxis ?? 85, width: 1400, height: 715 };
    default:
      return { x: 0, y: yAxis ?? 0, width: 1400, height: 700 };
  }
}

/**
 * Get the clipping for grouped screenshot based on the layout
 * @param bounding - bounding box of the product element
 * @param totalProducts - total number of products in the group
 * @returns
 */
export function getClippingForGroupedScreenshot(
  bounding: {
    x: number;
    y: number;
    height: number;
    width: number;
  },
  totalProducts: number
) {
  // Check Vertical or Horizontal Layout
  if (bounding.height > bounding.width) {
    return {
      x: bounding.x,
      y: bounding.y,
      height: bounding.height,
      width: bounding.width * totalProducts,
    };
  } else {
    return {
      x: bounding.x,
      y: bounding.y,
      height: bounding.height * totalProducts,
      width: bounding.width,
    };
  }
}

// ============== PRODUCT RELATED HELPER FUNCTIONS ==============
export function isValidProductDeal(
  price: number,
  discountPrice: number,
  maxPrice: number
) {
  const discountPercentage = ((price - discountPrice) / price) * 100;

  // Validate price, discount price, and discount percentage
  const isValid =
    price > 0 &&
    price < maxPrice &&
    discountPrice > 0 &&
    discountPrice < price &&
    discountPercentage > MAX_PERCENTAGE_DISCOUNT;

  return isValid;
}
