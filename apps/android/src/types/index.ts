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
  id: string;
  url: string;
  affiliate_url: string;
  created_at: string;
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
  id: string[];
  caption: string;
  platforms: SocialMedia[];
  tags: string;
  productUrl: string | string[];
  productImage: Uint8Array;
}

export type ProductSelectionData = Map<
  string,
  {
    images: string[];
    hasAffiliateLink: boolean;
    isGrouped: boolean;
  }
>;
