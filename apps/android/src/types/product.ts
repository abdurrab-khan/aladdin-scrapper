import { Affiliate, PlateForm } from ".";

export type ProductImage = {
  image_id: string;
  image_url: string;
  image_type: "Card" | "Group" | string;
  image_status: "Completed" | string;
};

export type Website = {
  website_id: string;
  website_icon: string | null;
  website_name: string;
};

export interface Product {
  product_id: string;
  name: string;
  url: string;
  price: string;
  discount_price: string;
  brand: string;
  is_posted: boolean;
  is_grouped: boolean;
  user_id: string;
  app_id: string;
  images: ProductImage[] | string; // It comes as string from DB and needs parsing
  website: Website | string; // It comes as string from DB and needs parsing
  has_affiliate: boolean;
  category?: string; // Optional as not in provided sample but used in code
  rating?: number;
  reviews?: number;
  // Legacy fields preserved for compatibility if needed, but ideally replaced
  id?: string; 
  details?: any;
  platformInfo?: PlateForm;
  affiliateInfo?: Affiliate | null;
  groupAffiliateUrl?: string | null;
}
