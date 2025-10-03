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
export function getClippingForScreenshot(website: E_COMMERCE) {
  switch (website) {
    case "amazon":
      return { x: 0, y: 177, width: 1400, height: 820 };
    case "flipkart":
      return { x: 0, y: 85, width: 1400, height: 715 };
    default:
      return { x: 0, y: 0, width: 1400, height: 700 };
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
