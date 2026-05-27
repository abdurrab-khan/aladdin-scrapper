import axios from "axios";

const scrapeClient = axios.create({
  baseURL: "http://192.168.0.100:8080/v1",
  timeout: 10000,
});

export interface ScrapeCategory {
  id: string;
  name: string;
  subCategories: string[];
}

export interface ScrapeRequest {
  category: string;
  subCategoryName: string;
  websites: ("amazon" | "flipkart")[];
  maxProducts?: number;
}

export const getScrapeCategories = async (): Promise<ScrapeCategory[]> => {
  const response = await scrapeClient.get("/categories");
  return response.data;
};

export const triggerScrape = async (data: ScrapeRequest): Promise<void> => {
  await scrapeClient.post("/scrape", data);
};
