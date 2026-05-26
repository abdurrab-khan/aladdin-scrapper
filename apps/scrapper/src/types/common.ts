import type { Product, SingleProductDetails } from "./product.js";

export type E_COMMERCE = "flipkart" | "amazon";
export type FlatProduct = Omit<Product, "details"> & SingleProductDetails;

export type ProductSelector = Exclude<
  keyof FlatProduct,
  | "isGrouped"
  | "id"
  | "discountPercent"
  | "category"
  | "screenshotInfo"
  | "userId"
  | "platformId"
  | "associatedAppId"
  | "cardScreenshotPath"
>;

export type ProductSelectorValue = {
  [T in ProductSelector]: T extends "images" ? string : FlatProduct[T];
};

export interface ScrapeFilters {
  available?: boolean | undefined;
  rating?: number | undefined;
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
  maxDiscount?: number | undefined;
  maxBrandDiscount?: number | undefined;
  maxDiscountForFullPageScreenshot?: number | undefined;
}

export interface SubCategory {
  maxPrice: number;
  minPrice: number;
  maxDiscount: number;
  maxBrandDiscount: number;
  maxDiscountForFullPageScreenshot: number;
  maxProducts?: number;
  urls: {
    [k in E_COMMERCE]: string;
  };
  baseConfig?: {
    amazon?: {
      keyword: string;
      nodeId: string;
    };
    flipkart?: {
      path: string;
      sid: string;
    };
  };
}

export type SubCategoryDetails = {
  [subCat: string]: SubCategory;
};

export interface Category {
  category: string;
  subCategories: { [key: string]: SubCategory };
  lowPriorityCategories?: { [key: string]: SubCategory };
}

export interface HistoryCategory {
  subCategories: string[];
  lowPriorityCategories: string[];
  lastLowPriorityRun: number | null;
  timeStamp: number | null;
}

export interface History {
  [categoryName: string]: HistoryCategory;
}
export interface ScrapeTask {
  name: string;
  details: SubCategory;
}

export interface SelectionResult {
  category: string;
  tasks: ScrapeTask[];
  isLowPriority: boolean;
}
