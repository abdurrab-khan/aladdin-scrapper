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
      const cleaned = elementText?.replace(/[^\d.]/g, "");
      return cleaned ? parseFloat(cleaned) : null;
    }
    case "rating": {
      const cleaned = elementText?.match(/\d+(\.\d+)?/)?.at(0);
      return cleaned ? parseFloat(cleaned) : null;
    }
    case "reviews": {
      let cleaned = elementText
        ?.trim()
        ?.replace(/[^0-9a-zA-Z.]/g, "")
        ?.toLowerCase();

      if (!cleaned) return null;

      const num = parseFloat(cleaned);

      if (elementText?.endsWith("k")) return num * 1_000;
      if (elementText?.endsWith("m")) return num * 1_000_000;
      if (elementText?.endsWith("b")) return num * 1_000_000_000;
      if (elementText?.endsWith("t")) return num * 1_000_000_000_000;

      return cleaned ? parseInt(cleaned, 10) : null;
    }
    case "url": {
      const url = (await element?.getAttribute("href")) ?? null;
      return urlSorter(url, website);
    }
    case "images": {
      const imageUrl = (await element?.getAttribute("src")) ?? null;
      return increaseImageQuality(imageUrl, website);
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

/**
 * Increase image quality by modifying the URL parameters for known e-commerce sites.
 * @param image_url - string
 * @param website - E_COMMERCE
 * @returns - string
 */
export const increaseImageQuality = (
  image_url: string | null,
  website: E_COMMERCE
): string | null => {
  if (image_url == null) return null;

  if (website === "amazon") {
    return image_url.replace(/_AC_UL\d+_/, "_AC_UL720_");
  } else if (website === "flipkart") {
    return image_url
      .replace(/q=\d+/, "q=100")
      .replace(/image\/[0-9]+\/[0-9]+/, "image/720/720");
  }

  return image_url;
};

/**
 * Sort and clean product URLs by removing unnecessary query parameters and fragments.
 * @param url - string
 * @param website - E_COMMERCE
 * @returns - string
 */
export const urlSorter = (
  url: string | null,
  website: E_COMMERCE
): string | null => {
  if (!url) return null;

  const urlParser = new URL(url, BASE_URLS[website]);

  if (website === "amazon") {
    let pathName: string | null = urlParser.pathname;

    // Handling special case for Amazon India URLs with sspa/click
    if (url.match(/sspa\/click?/)) {
      pathName = urlParser.searchParams.get("url");
    }

    return pathName == null
      ? url
      : `${urlParser.origin}${pathName.replace(/\/ref=.*/g, "")}`;
  } else if (website === "flipkart") {
    return `${urlParser.origin}${urlParser.pathname}`;
  }

  return url;
};
