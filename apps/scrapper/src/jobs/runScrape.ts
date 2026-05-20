import { rm } from "fs/promises";

import SupabaseClient from "../db/supabase.js";
import {
  enqueueFullScreenshot,
  enqueueGroupedScreenshot,
  toScreenshotWebsite,
} from "../services/screenshot/client.js";
import { scrapeProducts } from "../crawler/scrapper.js";
import { randomDelay } from "../crawler/utils/utils.js";
import type { SelectionResult, SubCategory } from "../types/index.js";

export async function runScrape(selections: SelectionResult[]): Promise<void> {
  try {
    for (let i = 0; i < selections.length; i++) {
      const selectionDetails = selections[i];

      if (!selectionDetails) {
        console.warn(
          `⚠️ There is no selection details available ${selectionDetails}`,
        );
        continue;
      }

      // extracting details
      const { category, subcategories, subcategoriesDetails } =
        selectionDetails;

      // throw an error if there is not subCategories
      if (subcategories.length === 0) {
        throw new Error(
          `❌ Failed there is no subcategories found ${subcategories}`,
        );
      }

      // looping sub subCategories
      for (let j = 0; j < subcategories.length; j++) {
        const subCategoryName = subcategories[j] as string;
        const subCategory = subcategoriesDetails[
          subCategoryName
        ] as SubCategory;

        if (!subCategory) {
          console.warn(
            `⚠️ There is no subcategory details available ${subCategoryName}`,
          );
          continue;
        }

        console.log(
          `🚀  Starting ${category}:${subCategoryName} product scraping...`,
        );

        // scrapping products
        const scrappedProducts = await scrapeProducts(
          subCategoryName,
          subCategory,
        );

        const scrapedCount = scrappedProducts?.length ?? 0;
        if (scrapedCount === 0) {
          console.warn(
            `⚠️ No products scraped for ${category}:${subCategoryName}. Check filters or site availability.`,
          );
        }

        // insert products
        const insertedProducts =
          await SupabaseClient.saveProducts(scrappedProducts);

        if (insertedProducts.length === 0) {
          console.warn(
            `⚠️ No products inserted for ${category}:${subCategoryName}.`,
          );
          continue;
        }

        await SupabaseClient.ensureProductImageRows(
          insertedProducts.filter((product) => product.screenshotInfo),
        );

        // enqueue screenshots for products that need it
        await Promise.all(
          insertedProducts.map(async (product) => {
            try {
              const record = product as unknown as Record<string, unknown>;
              const productId =
                product.id || (record["product_id"] as string | undefined);

              if (!productId || !product.screenshotInfo) return;

              if (product.screenshotInfo.grouped) {
                if (!product.url || !product.screenshotInfo.priceDetails)
                  return;

                await enqueueGroupedScreenshot({
                  id: productId,
                  url: product.url,
                  website: toScreenshotWebsite(product.screenshotInfo.website),
                  priceDetails: product.screenshotInfo.priceDetails,
                });

                return;
              }

              if (product.screenshotInfo.fullPageRequired) {
                await enqueueFullScreenshot({
                  id: productId,
                  url: product.url,
                  website: toScreenshotWebsite(product.screenshotInfo.website),
                });
              }
            } catch (error) {
              console.warn(
                "⚠️  Failed to enqueue screenshot:",
                error instanceof Error ? error.message : error,
              );
            }
          }),
        );

        console.log(
          `\n🎉 Finished scraping for selection: ${category}:${subCategoryName}\n`,
        );
      }

      // adding some delays
      if (i < selections.length - 1) {
        await new Promise((res) => setTimeout(res, randomDelay(120, 300)));
      }
    }
  } catch (err) {
    const msg =
      err instanceof Error
        ? err.message
        : "An error unknown error occured during scrapping products";
    console.error(msg);
  } finally {
    // Removing all temp images
    rm("products", {
      recursive: true,
      force: true,
    }).catch((error) => {
      console.warn(
        "⚠️  Failed to clean products directory:",
        error instanceof Error ? error.message : error,
      );
    });
  }
}
