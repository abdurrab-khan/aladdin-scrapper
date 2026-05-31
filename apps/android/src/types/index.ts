export type SocialMedia = "x" | "telegram" | "instagram" | "facebook";

// APPLICATION -- INTERFACE
export interface Application {
  id: string;
  name: string;
  logo: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

// AFFILIATE -- INTERFACE

export interface Affiliate {
  affiliate_id: string;
  affiliate_url: string;
  is_default: boolean;
  created_at: string;
  website_id: string;
  product_id: string;
  app_id: string;
}

// PLATFORM -- INTERFACE
export interface PlateForm {
  id: string;
  name: string;
  logo: string;
  created_at: string;
}

// CAPTION DETAILS -- INTERFACE
export interface CaptionDetails {
  ids: string[];
  caption: string;
  platforms: SocialMedia[];
  tags?: string;
  productUrls: string[];
  productImage: Uint8Array | string;
}

export type ProductSelectionData = Map<
  string,
  {
    images: string[];
    hasAffiliateLink: boolean;
    isGrouped: boolean;
  }
>;
