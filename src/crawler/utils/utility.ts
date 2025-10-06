import type { ElementHandle, Page } from "playwright";
import type { E_COMMERCE } from "../../types/index.js";
import {
  AMAZON_FETCH_BRAND_PRODUCTS,
  FLIPKART_FETCH_BRAND_PRODUCTS,
} from "../css/css_selectors.js";

// <=======================> Function to get brand selector <=======================>
const getFlipkartBrandSelector = async (
  page: Page,
  brand: string
): Promise<ElementHandle<HTMLElement | SVGElement> | null> => {
  try {
    const sections =
      (await page.$$(FLIPKART_FETCH_BRAND_PRODUCTS["mainSection"])) || [];

    const brandSection = sections.find(async (section) => {
      const titleElement = await section.$(
        FLIPKART_FETCH_BRAND_PRODUCTS["sectionTitle"]
      );

      const text = await titleElement?.textContent();
      return text?.trim().toLowerCase().includes("brand");
    });

    if (brandSection) {
      // Expand the brand section if it's collapsible
      await brandSection.click();

      const inputElement = await brandSection.$(
        FLIPKART_FETCH_BRAND_PRODUCTS["input"]
      );

      if (inputElement) {
        await inputElement.fill(brand);

        // Find all brand selectors
        const allBrandSelectors = await brandSection.$$(
          FLIPKART_FETCH_BRAND_PRODUCTS["selector"]
        );

        if (allBrandSelectors && allBrandSelectors.length > 0) {
          return allBrandSelectors[0] || null;
        }
      }
    }

    return null;
  } catch (error) {
    console.error("⚠️ Error fetching flipkart brand selector:", error);
    return null;
  }
};

const getAmazonBrandSelector = async (
  page: Page,
  brand: string
): Promise<ElementHandle<HTMLElement | SVGElement> | null> => {
  try {
    const seeMoreBtn = await page.$(AMAZON_FETCH_BRAND_PRODUCTS["see_more"]);

    if (seeMoreBtn) {
      await seeMoreBtn.click();

      const allBrandSelectors = await page.$$(
        AMAZON_FETCH_BRAND_PRODUCTS["selector"]
      );

      // Iterate through each brand selector to find the matching brand
      for (const brandSelector of allBrandSelectors) {
        const text = await brandSelector.$eval(
          AMAZON_FETCH_BRAND_PRODUCTS["selectionText"],
          (el) => el.textContent?.trim().toLowerCase() || ""
        );

        if (text && text.toLowerCase().includes(brand.toLowerCase())) {
          console.log("Found brand selector:", text);
          return brandSelector;
        }
      }
    }

    return null;
  } catch (error) {
    console.error("⚠️ Error fetching amazon brand selector:", error);
    return null;
  }
};

export function getBrandSelectors(
  website: E_COMMERCE
):
  | null
  | ((
      page: Page,
      brand: string
    ) => Promise<ElementHandle<HTMLElement | SVGElement> | null>) {
  switch (website) {
    case "flipkart":
      return getFlipkartBrandSelector;
    case "amazon":
      return getAmazonBrandSelector;
    default:
      return null;
  }
}
