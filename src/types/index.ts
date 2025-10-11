import type { Product, SingleProductDetails } from "./product.js";

export type E_COMMERCE = "flipkart" | "amazon";
export type FlatProduct = Omit<Product, "details"> & SingleProductDetails;

export type ProductSelector = Exclude<
  keyof FlatProduct,
  "isGrouped" | "id" | "discountPercent" | "category"
>;

export type ProductSelectorValue = {
  [T in ProductSelector]: T extends "images" ? string : FlatProduct[T];
};

export interface SubCategory {
  maxPrice: number;
  minPrice: number;
  maxDiscount: number;
  maxBrandDiscount: number;
  maxDiscountForFullPageScreenshot: number;
  urls: {
    amazon: string;
    flipkart: string;
  };
}

export type SubCategoryInfo = Omit<SubCategory, "urls">;

export type SubCategoryDetails = {
  [subCat: string]: Omit<SubCategory, "urls">;
};

export interface Category {
  category: string;
  subCategories: { [key: string]: SubCategory };
  lowPriorityCategories?: { [key: string]: SubCategory };
}

export interface HistoryCategory {
  subCategories: string[];
  lowPriorityCategories: string[];
}

export interface History {
  [categoryName: string]: HistoryCategory;
}
export interface SelectionResult {
  category: string;
  subcategories: string[];
  subcategoriesDetails: SubCategoryDetails;
  urls: Array<[E_COMMERCE, string][]>;
  isLowPriority: boolean;
}
