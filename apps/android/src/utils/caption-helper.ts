import { Product } from "@/types/product";
import { TAGS_POOL } from "../constants/const";
import { Affiliate } from "../types";

// export const extractProductCaptionDetails = (
//   products: Product[],
//   affiliates: Affiliate[] = [],
// ): ProductDetailsProps => {
//   if (products == null || products.length === 0) {
//     throw new Error("Product array is null or empty");
//   }

//   return products.reduce(
//     (acc, prod) => {
//       // Find the corresponding affiliate link
//       const affiliate = affiliates.find(
//         (a) => a.product_id === prod.product_id,
//       );
//       const affiliateUrl: string = affiliate
//         ? affiliate.affiliate_url
//         : prod.url;

//       const images = Array.isArray(prod.images) ? prod.images : [];
//       const cardImage =
//         images.find((img) => img.image_type === "Card")?.image_url ||
//         images[0]?.image_url ||
//         "https://via.placeholder.com/150";

//       acc.ids.push(prod.product_id);
//       acc.productUrls.push(prod.url);
//       acc.productImages.push(cardImage);
//       acc.productAffiliateUrls.push(affiliateUrl);
//       return acc;
//     },
//     {
//       ids: [],
//       productUrls: [],
//       productImages: [],
//       productAffiliateUrls: [],
//     } as ProductDetailsProps,
//   );
// };

export const generateCaption = (
  products: Product[],
  affiliates: Affiliate[] | null,
): string => {
  const productUrls = products.map((product) => {
    const affiliateUrl = affiliates?.find(
      (aff) => aff.product_id === product.product_id,
    )?.affiliate_url;
    const url = affiliateUrl ?? product.url;

    return `🔗 ${url}`;
  });

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
