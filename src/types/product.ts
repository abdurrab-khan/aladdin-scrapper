export type SingleProductDetails = {
  brand: string;
  price: number;
  rating?: number;
  reviews?: number;
  discountType?: string;
  discountPrice: number;
  discountPercent: number;
};

export type GroupProductDetails = {
  brand: string;
  startPrice: number;
  discountStartPrice: number;
  productCount: number;
  avgRating?: number;
  totalReviews?: number;
};

export interface Product {
  name: string;
  category: string;
  details: SingleProductDetails | GroupProductDetails;
  images: {
    image: string | string[];
    card: string;
    fullPage: string | null;
  };
  url: string;
  isGrouped: boolean;
}
