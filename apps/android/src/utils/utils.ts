import { Product } from "@/types/product";
import {
  generateTelegramMessage,
  ProductCaptionParams,
} from "./caption-helper";

/**
 * Utility functions for pagination and other common tasks.
 * @param currentPage {number}
 * @param pageSize  {number}
 * @returns  {start: number, end: number}
 */
export const getPaginationRange = (
  currentPage: number,
  pageSize: number = 10,
): { start: number; end: number } => {
  const start = (currentPage + 1) * pageSize;
  const end = start + pageSize - 1; // Adjusted to include the last item in the range
  return { start, end };
};

/**
 * Converts a number to a string with appropriate suffixes for thousands, millions, and billions.
 * @param num {number}
 * @returns {string}
 */
export const convertNumberToString = (num: number): string => {
  if (num === 0) return "0";
  if (num < 1000) return num.toString();
  if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
  if (num < 1000000000) return `${(num / 1000000).toFixed(1)}M`;
  return `${(num / 1000000000).toFixed(1)}B`;
};

/** * Generates a post caption based on the platform and product details.
 * @param {Product} product
 * @param {boolean} isGrouped - Indicates if the product is part of a grouped set
 * * @returns {string} - Generated post caption
 * */
export const generatePostCaption = (
  product: Product,
  isGrouped: boolean = false,
): string => {
  const { name, price, discount_price, rating } = product;
  const priceNum = parseFloat(price);
  const discountPriceNum = parseFloat(discount_price);

  const productDetails: ProductCaptionParams = {
    name,
    price: priceNum,
    discountPrice: discountPriceNum,
    discountPercentage: Math.round(
      ((priceNum - discountPriceNum) / priceNum) * 100,
    ),
    url: product.url,
    ratingStars: "⭐".repeat(Math.round(rating || 0)),
  };

  // Generating -- Post Caption
  return generateTelegramMessage(productDetails);
};
