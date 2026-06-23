import { TAGS_POOL } from "../constants/const";
import { ProductData } from "@/app/(others)/share-product";

export const generateCaption = (products: ProductData[]): string => {
  const productUrls = products.map(
    (product) => `🔗 ${product?.affiliateUrl?.url ?? product.url}`,
  );

  const checkOutText =
    productUrls.length === 1 ? "Check this out" : "Check these out";

  return `\n\n${checkOutText}:\n${productUrls.join("\n")}`;
};

export const getRandomTags = (): string => {
  const tagsLength = TAGS_POOL.length;

  // Select 5 unique random tags
  const selectedTags = new Set<string>();
  while (selectedTags.size < 5) {
    const randomIndex = Math.floor(Math.random() * tagsLength);
    selectedTags.add(TAGS_POOL[randomIndex]);
  }

  return Array.from(selectedTags).join(" ");
};
