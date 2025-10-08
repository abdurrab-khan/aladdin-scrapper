import type { Product, SingleProductDetails } from "./product.js";

export type E_COMMERCE = "flipkart" | "amazon";
export type FlatProduct = Omit<Product, "details"> & SingleProductDetails;

export type ProductSelector = Exclude<
  keyof FlatProduct,
  "isGrouped" | "id" | "discountPercent"
>;

export type ProductSelectorValue = {
  [T in ProductSelector]: T extends "images" ? string : FlatProduct[T];
};
