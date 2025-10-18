import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

import type { Product } from "../types/product.js";

// cspell:ignore supabase
/**
 * Supabase Client
 * @description This class handles all interactions with the Supabase database.
 * It provides methods to connect, query, and manage data within the Supabase environment.
 */

class SupabaseClient {
  private supabaseClient;
  private uploadedImageUrls: Record<string, string> = {};

  constructor() {
    if (!process.env["SUPABASE_URL"] || !process.env["SUPABASE_KEY"]) {
      throw new Error(
        "Supabase URL or Key is not defined in environment variables."
      );
    }

    this.supabaseClient = createClient(
      process.env["SUPABASE_URL"] || "",
      process.env["SUPABASE_KEY"] || "",
      {
        db: {
          schema: "public",
        },
      }
    );
  }

  private async uploadImage(imagePath: string): Promise<void> {
    try {
      const imageBuffer = readFileSync(imagePath, {
        flag: "r",
      });

      const response = await this.supabaseClient.storage
        .from("aladdin")
        .upload(imagePath, imageBuffer, {
          upsert: false,
          contentType: "image/png",
        });

      if (response.error || !response.data?.fullPath) {
        console.error("⚠️ Error uploading image:", imagePath, response.error);
      } else {
        this.uploadedImageUrls[imagePath] = response.data.fullPath;
      }
    } catch (error) {
      console.error("⚠️ Error uploading image:", imagePath, error);
    }
  }

  private async uploadImages(imagePaths: string[]): Promise<void> {
    const uploadPromises = imagePaths.map((path) => this.uploadImage(path));
    await Promise.all(uploadPromises);
  }

  private async insertProducts(products: Product[]): Promise<void> {
    try {
      const { error } = await this.supabaseClient.rpc("insert_products_v2", {
        products: products,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("⚠️  Error inserting products:", error);
    }
  }

  private getProductsImages(products: Product[]): string[] {
    return products.reduce((acc: string[], p: Product) => {
      if (p.images.card) acc.push(p.images.card);
      if (p.images.fullPage) acc.push(p.images.fullPage);
      return acc;
    }, []);
  }

  private getProductsWithImages(products: Product[]): Product[] {
    return products.filter((p) => {
      const hasCardImage = this.uploadedImageUrls[p.images.card] !== undefined;
      const hasFullPageImage =
        !p.images.fullPage ||
        this.uploadedImageUrls[p.images.fullPage] !== undefined;

      return hasCardImage && hasFullPageImage;
    });
  }

  public async saveProducts(products: Product[]): Promise<void> {
    try {
      const imagePaths = this.getProductsImages(products);
      await this.uploadImages(imagePaths);

      const productsWithImages = this.getProductsWithImages(products);
      if (productsWithImages.length > 0) {
        await this.insertProducts(productsWithImages);
        console.log(
          `✅  Successfully saved ${productsWithImages.length} products with images.`
        );
      } else {
        console.log(
          "⚠️  No products with all images uploaded successfully. Skipping database insertion."
        );
      }
    } catch (error) {
      console.error("⚠️ Error inserting products:", error);
    } finally {
      this.uploadedImageUrls = {}; // Clear the uploaded image URLs after processing
    }
  }
}

const SupabaseClientInstance = new SupabaseClient();

export default SupabaseClientInstance;
