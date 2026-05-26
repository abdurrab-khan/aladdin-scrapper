import { SUPABASE_BUCKET_URL, TAGS_POOL } from "@/constants/const";
import { Product } from "@/types/product";

interface ProductDetailsProps {
  ids: string[];
  productUrls: string[];
  productAffiliateUrls: string[];
  productImages: string[];
}

export const extractProductCaptionDetails = (
  product: Product[]
): ProductDetailsProps => {
  if (product == null || product.length === 0) {
    throw new Error("Product array is null or empty");
  }

  return product.reduce(
    (acc, prod) => {
      const affiateUrl: string = (prod.affiliateInfo?.affiliate_url ||
        prod.groupAffiliateUrl)!;
      const cardImage =
        SUPABASE_BUCKET_URL +
        (product.length === 1 && prod.images.fullPage
          ? prod.images.fullPage
          : prod.images.card);

      acc.ids.push(prod.id);
      acc.productUrls.push(prod.url);
      acc.productImages.push(cardImage);
      acc.productAffiliateUrls.push(affiateUrl);
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
