import { z } from "zod";
import type { SelectionResult } from "../../types/common.js";

const subCategorySchema = z.object({
  maxPrice: z.number({ message: "details.maxPrice must be a number" }).min(0, "details.maxPrice must be greater than or equal to 0"),
  minPrice: z.number({ message: "details.minPrice must be a number" }).min(0, "details.minPrice must be greater than or equal to 0"),
  maxDiscount: z.number({ message: "details.maxDiscount must be a number" }).min(0, "details.maxDiscount must be greater than or equal to 0"),
  maxBrandDiscount: z.number({ message: "details.maxBrandDiscount must be a number" }).min(0, "details.maxBrandDiscount must be greater than or equal to 0"),
  maxDiscountForFullPageScreenshot: z.number({ message: "details.maxDiscountForFullPageScreenshot must be a number" }).min(0, "details.maxDiscountForFullPageScreenshot must be greater than or equal to 0"),
  urls: z.object({
    amazon: z.string().optional().default(""),
    flipkart: z.string().optional().default(""),
  }).refine(urls => urls.amazon.trim() !== "" || urls.flipkart.trim() !== "", {
    message: "at least one of details.urls.amazon or details.urls.flipkart is required"
  })
}).refine(data => data.minPrice <= data.maxPrice, {
  message: "details.minPrice must be less than or equal to details.maxPrice",
});

const scrapeRequestSchema = z.object({
  category: z.string().trim().min(1, "category is required and must be a string"),
  subCategoryName: z.string().trim().min(1, "subCategoryName is required and must be a string"),
  details: subCategorySchema,
});

export type ScrapeRequestBody = z.infer<typeof scrapeRequestSchema>;

export function buildSelectionFromRequest(
  request: ScrapeRequestBody
): SelectionResult {
  const { category, subCategoryName, details } = request;

  return {
    category,
    tasks: [
      {
        name: subCategoryName,
        details: details as any, // Cast due to internal SubCategory type expectations if needed
      },
    ],
    isLowPriority: false,
  };
}

export function validateScrapeRequest(
  request: any
): string | null {
  const result = scrapeRequestSchema.safeParse(request);
  
  if (!result.success) {
    // Return the first error message as a string to match previous API behavior
    return result.error.issues[0]?.message || "Invalid request";
  }

  return null;
}
