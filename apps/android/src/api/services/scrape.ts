import axios from "axios";
import { Platform } from "react-native";

// Use 10.0.2.2 for Android Emulator to access localhost on host machine
const baseURL =
  Platform.OS === "android"
    ? "http://192.168.0.100:8080/v1"
    : "http://localhost:8080/v1";

const scrapeClient = axios.create({
  baseURL,
  timeout: 15000,
});

export interface ScrapeSubCategory {
  name: string;
  websites: string[];
  defaults: {
    minPrice: number;
    maxPrice: number;
    maxDiscount: number;
  };
}

export interface ScrapeCategory {
  id: string;
  name: string;
  subCategories: ScrapeSubCategory[];
}

export interface ScrapeRequest {
  category: string;
  subCategoryName: string;
  websites: ("amazon" | "flipkart")[];
  maxProducts?: number;
  filters?: {
    available?: boolean;
    rating?: number;
    minPrice?: number;
    maxPrice?: number;
    maxDiscount?: number;
    maxBrandDiscount?: number;
    maxDiscountForFullPageScreenshot?: number;
  };
}

export const getScrapeCategories = async (): Promise<ScrapeCategory[]> => {
  const response = await scrapeClient.get("/categories");
  return response.data;
};

export const triggerScrape = async (data: ScrapeRequest): Promise<void> => {
  await scrapeClient.post("/scrape", data);
};

export const triggerRotationScrape = async (): Promise<void> => {
  await scrapeClient.post("/scrape/rotation");
};
