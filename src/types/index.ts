// <======================> Types <======================>
export type E_COMMERCE = "flipkart" | "amazon";

export type ProductDetails = {
  brand: string;
  price: number;
  rating?: number;
  reviews?: number;
  discountPrice: number;
  discountPercent: number;
};

export interface Product {
  id: string;
  name: string;
  details: ProductDetails;
  images: {
    image: string | string[];
    card: string;
    fullPage: string | null;
  };
  url: string;
  isGrouped: boolean;
}

// <======================> Utils Type <======================>
export type FlatProduct = Omit<Product, "details"> & ProductDetails;

export type ProductSelector = Exclude<
  keyof FlatProduct,
  "isGrouped" | "images" | "id" | "discountPercent"
>;
