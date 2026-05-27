import { TAGS_POOL } from "@/constants/const";
import { Product, ProductImage } from "@/types/product";

interface ProductDetailsProps {
  ids: string[];
  productUrls: string[];
  productAffiliateUrls: string[];
  productImages: string[];
}

export const extractProductCaptionDetails = (
  products: Product[]
): ProductDetailsProps => {
  if (products == null || products.length === 0) {
    throw new Error("Product array is null or empty");
  }

  return products.reduce(
    (acc, prod) => {
      // For now, we don't have a direct affiliate URL in the sample data, 
      // but the app expects one. Using the product URL as fallback if has_affiliate is true.
      // In a real scenario, there might be another field or a process to get the affiliate link.
      const affiliateUrl: string = prod.url; 
      
      const images = prod.images as ProductImage[];
      const cardImage = images.find(img => img.image_type === 'Card')?.image_url || images[0]?.image_url;

      acc.ids.push(prod.product_id);
      acc.productUrls.push(prod.url);
      acc.productImages.push(cardImage);
      acc.productAffiliateUrls.push(affiliateUrl);
      return acc;
    },
    {
      ids: [],
      productUrls: [],
      productImages: [],
      productAffiliateUrls: [],
    } as ProductDetailsProps
  );
};

export const generateCaption = (affliateUrls: string[]): string => {
  // Affiliate URLS string
  const affiliateUrlsString = affliateUrls.map((url) => `🔗 ${url}`).join("\n");

  // Check whether to use singular or plural form
  const checkOutText =
    affliateUrls.length === 1 ? "Check this out" : "Check these out";

  // Create caption message
  return `\n\n${checkOutText}:\n${affiliateUrlsString}`;
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
