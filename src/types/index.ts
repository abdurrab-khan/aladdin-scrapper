// <======================> Types <======================>
export type E_COMMERCE = "flipkart" | "amazon";

export type ProductDetails = {
  brand: string;
  price: number;
  rating?: number;
  reviews?: number;
  image: string | string[];
  discountPrice: number;
};

export interface Product {
  productId: string;
  productName: string;
  productDetails: ProductDetails;
  productCard: string;
  productUrl: string;
  isGrouped: boolean;
}

// <======================> Utils Type <======================>
export type FlatProduct = Omit<Product, "productDetails"> & ProductDetails;

export type ProductSelector = Exclude<
  keyof FlatProduct,
  "isGrouped" | "productCard" | "productId"
>;
