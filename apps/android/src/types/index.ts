export type SocialMedia = "telegram" | "instagram" | "facebook" | "x";

export interface Affiliate {
  id: string;
  url: string;
  productId: string;
  createdAt: string;
  isDefault: boolean;
}

export type ProductImage = {
  id: string;
  imageUrl: string;
  imageStatus: "Completed";
  imageType: "Card" | "Group" | "Full";
};

export type Website = {
  id: string;
  name: string;
  icon: string | null;
};

export interface Product {
  app_id: string;
  name: string;
  url: string;
  price: string;
  brand: string;
  product_id: string;
  discount_price: string;
  category: string;
  is_posted: boolean;
  is_grouped: boolean;
  website: Website;
  product_images: ProductImage[];
}
