import { SocialMedia } from "@/types";

export const affiliateProvider: Record<string, string> = {
  myntra: "https://earnkaro.com/create-earn-link",
  flipkart: "https://earnkaro.com/create-earn-link",
};

export const SUPABASE_BUCKET_URL =
  "https://seqlfxrvoxgstlzhhfrq.supabase.co/storage/v1/object/public/aladdin/";

export const SOCIAL_MEDIA: Partial<SocialMedia[]> = [
  "telegram",
  "facebook",
  "instagram",
  "x",
];

export const TAGS_POOL: string[] = [
  "#deals",
  "#onlineshopping",
  "#shopping",
  "#sale",
  "#discount",
  "#offers",
  "#amazondeals",
  "#flipkart",
  "#amazonsale",
  "#amazonindia",
  "#bestdeals",
  "#dealsandsteals",
  "#onlinedeals",
  "#savings",
  "#savemoney",
  "#shopnow",
  "#dealoftheday",
  "#limitedtimeoffer",
  "#flashsale",
  "#coupons",
  "#promo",
  "#bargain",
  "#ecommerce",
  "#shoponline",
  "#discountcode",
  "#offer",
  "#hotdeals",
  "#bestsale",
  "#affordableshopping",
  "#dailydeals",
  "#specialoffer",
  "#trending",
  "#viral",
  "#india",
];

export const MAX_TAGS = 5;
