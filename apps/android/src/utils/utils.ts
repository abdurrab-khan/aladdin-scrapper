import { Product, Website } from "@/types/product";

export const getPaginationRange = (
  currentPage: number,
  pageSize: number = 10,
): { start: number; end: number } => {
  const start = (currentPage + 1) * pageSize;
  const end = start + pageSize - 1; // Adjusted to include the last item in the range
  return { start, end };
};

export const convertNumberToString = (num: number): string => {
  if (num === 0) return "0";
  if (num < 1000) return num.toString();
  if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
  if (num < 1000000000) return `${(num / 1000000).toFixed(1)}M`;
  return `${(num / 1000000000).toFixed(1)}B`;
};

export const generatePostCaption = (
  product: Product,
  isGrouped: boolean = false,
): string => {
  const { name, price, discount_price, rating } = product;
  const priceNum = parseFloat(price);
  const discountPriceNum = parseFloat(discount_price);

  const productDetails = {
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
  // return generateTelegramMessage(productDetails);
  return "";
};

export const getWebsiteName = (url: string): string => {
  const match = url.match(/(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+)\./);
  return match ? match[1].toLowerCase() : "";
};
