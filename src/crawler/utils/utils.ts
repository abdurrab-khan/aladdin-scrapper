import { v4 as uuidv4 } from "uuid";
import type { BrowserContextOptions, ElementHandle } from "playwright";

import type {
  E_COMMERCE,
  FlatProduct,
  Product,
  ProductSelector,
} from "../../types/index.js";
import { cleanData, hasRequiredDetails } from "./helper.js";
import { PRODUCT_DETAILS } from "../css/css_selectors.js";

/**
 * Extract the details from the product card
 * @params product
 * @return Promise<Product | null>
 */
export async function extractProductData(
  website: E_COMMERCE,
  product: ElementHandle<SVGElement | HTMLElement>
) {
  if (!product) return null; // Return null if product is null or undefined

  const productCSSSelector = PRODUCT_DETAILS[website];

  try {
    const productDetails = Object.fromEntries(
      await Promise.all(
        Object.entries(productCSSSelector).map(async ([key, selector]) => {
          const typedKey = key as ProductSelector;

          // @Checking whether the selector is valid or not
          if (!selector.trim() || selector === "N/A") {
            throw new Error("⚠️ Invalid selector");
          }

          const element = await product.$(selector);
          const value = await cleanData(typedKey, element, website);

          if (!value && !hasRequiredDetails(typedKey, value)) {
            throw new Error(`⚠️  Missing required detail for key: ${typedKey}`);
          }

          return [typedKey, value];
        })
      )
    ) as { [T in ProductSelector]: FlatProduct[T] };

    return {
      productId: uuidv4(),
      productName: productDetails.productName,
      productUrl: productDetails.productUrl,
      productCard: "",
      isGrouped: false,
      productDetails: {
        brand: productDetails.brand ?? productDetails.productName.split(" ")[0],
        price: productDetails.price,
        discountPrice: productDetails.discountPrice,
        rating: productDetails?.rating,
        reviews: productDetails?.reviews,
        image: productDetails.image,
      },
    } as Product;
  } catch (error) {
    return null;
  }
}

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
        viewport: { height: 950, width: 1400 },
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
      return { x: 0, y: 145, width: 1400, height: 805 };
    case "flipkart":
      return { x: 0, y: 85, width: 1400, height: 715 };
    default:
      return { x: 0, y: 0, width: 1400, height: 700 };
  }
}
