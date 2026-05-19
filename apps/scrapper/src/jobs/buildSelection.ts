import type { SelectionResult, SubCategory } from "../types/index.js";

export type ScrapeRequestBody = SubCategory & {
  category: string;
  subCategoryName: string;
};

export function buildSelectionFromRequest(
  request: ScrapeRequestBody
): SelectionResult[] {
  const { category, subCategoryName, ...details } = request;

  const selection: SelectionResult = {
    category,
    subcategories: [subCategoryName],
    subcategoriesDetails: {
      [subCategoryName]: details,
    },
    isLowPriority: false,
  };

  return [selection];
}

export function validateScrapeRequest(
  request: ScrapeRequestBody
): string | null {
  if (typeof request.category !== "string") {
    return "category must be a string";
  }

  if (request.category.trim().length === 0) {
    return "category is required";
  }

  if (typeof request.subCategoryName !== "string") {
    return "subCategoryName must be a string";
  }

  if (request.subCategoryName.trim().length === 0) {
    return "subCategoryName is required";
  }

  if (!request.urls || typeof request.urls !== "object") {
    return "urls is required";
  }

  if (
    typeof request.urls.amazon !== "string" ||
    typeof request.urls.flipkart !== "string"
  ) {
    return "urls.amazon and urls.flipkart must be strings";
  }

  if (!request.urls.amazon && !request.urls.flipkart) {
    return "at least one of urls.amazon or urls.flipkart is required";
  }

  const numberFields: Array<[string, number]> = [
    ["minPrice", request.minPrice],
    ["maxPrice", request.maxPrice],
    ["maxDiscount", request.maxDiscount],
    ["maxBrandDiscount", request.maxBrandDiscount],
    [
      "maxDiscountForFullPageScreenshot",
      request.maxDiscountForFullPageScreenshot,
    ],
  ];

  for (const [field, value] of numberFields) {
    if (typeof value !== "number" || Number.isNaN(value)) {
      return `${field} must be a number`;
    }

    if (value < 0) {
      return `${field} must be greater than or equal to 0`;
    }
  }

  if (request.minPrice > request.maxPrice) {
    return "minPrice must be less than or equal to maxPrice";
  }

  return null;
}
