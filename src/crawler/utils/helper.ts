import type { ElementHandle } from "playwright";
import type {
  E_COMMERCE,
  FlatProduct,
  ProductSelector,
} from "../../types/index.js";
import { BASE_URLS } from "../../utils/const.js";

/**
 * Validate the extracted product details based on the key and value.
 * @param key
 * @param value
 * @returns boolean
 */
export const hasRequiredDetails = <T extends ProductSelector>(
  key: T,
  value: FlatProduct[T] | null
): boolean => {
  const isImportantKey =
    key === "price" ||
    key === "discountPrice" ||
    key === "url" ||
    key === "name";

  if (isImportantKey && !value) {
    return false;
  }

  return true;
};

/**
 * Clean and format the extracted data based on the key.
 * @param key - ProductSelector
 * @param element - ElementHandle
 * @param website - E_COMMERCE
 * @returns
 */
export const cleanData = async (
  key: ProductSelector,
  element: ElementHandle<SVGElement | HTMLElement> | null,
  website: E_COMMERCE
) => {
  const elementText = (await element?.textContent()) ?? null;

  switch (key) {
    case "price":
    case "discountPrice": {
      // Removing all non-numeric characters except for the decimal point
      const cleaned = elementText?.replace(/[^\d.]/g, "");

      return cleaned ? parseFloat(cleaned) : null;
    }
    case "rating": {
      const cleaned = elementText?.replace(/[^\d.]/g, "");
      return cleaned ? parseFloat(cleaned) : null;
    }
    case "reviews": {
      const cleaned = elementText?.replace(/[^\d]/g, "");
      return cleaned ? parseInt(cleaned, 10) : null;
    }
    case "url": {
      const urlElement = (await element?.getAttribute("href")) ?? null;

      if (urlElement?.startsWith("https") || !urlElement) {
        return urlElement;
      }

      const baseUrl = BASE_URLS[website] || "";
      return baseUrl && urlElement
        ? new URL(urlElement, baseUrl).toString()
        : null;
    }
    case "image": {
      const imageElement = (await element?.getAttribute("src")) ?? null;

      if (imageElement?.startsWith("https") || !imageElement) {
        return imageElement;
      }

      const baseUrl = BASE_URLS[website] || "";
      return baseUrl && imageElement
        ? new URL(imageElement, baseUrl).toString()
        : null;
    }
    default:
      return elementText?.trim() || null;
  }
};

/**
 * A simple function to generate a random user agent string.
 * @returns A random user agent string.
 */
export const generateRandomUserAgent = (): string => {
  return `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${Math.floor(
    Math.random() * (115 - 100) + 100
  )}.0.${Math.floor(Math.random() * (5793 - 4000) + 4000)}.${Math.floor(
    Math.random() * (140 - 10) + 10
  )} Safari/537.36`;
};
