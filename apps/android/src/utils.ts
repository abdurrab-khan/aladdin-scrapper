import { ToastAndroid } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { TAGS_POOL } from "./constants/const";

import type { Affiliate } from "@/types";
import { ProductData } from "@/app/(others)/share-product";

export const generateCaption = async (
  products: ProductData[],
): Promise<string> => {
  const existingGroupedAffiliateUrls: Record<string, Affiliate[]> = JSON.parse(
    (await AsyncStorage.getItem("grouped_affiliate_urls")) ?? "{}",
  );

  const productUrls = products.map((product) => {
    const affiliateUrls =
      product?.affiliateUrl?.url ??
      existingGroupedAffiliateUrls[product.productId]?.filter(
        (affiliate) => affiliate.isDefault,
      )[0]?.url;

    return `🔗 ${affiliateUrls ?? product.url}`;
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

const toast = (message: string, duration: number = ToastAndroid.SHORT) => {
  ToastAndroid.show(message, duration);
};

export default toast;
