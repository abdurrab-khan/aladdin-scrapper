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
