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

  public async saveProducts(products: Product[] | null): Promise<Product[]> {
    if (!products || products.length === 0) {
      throw new Error("👎 There is not product is insert into the database");
    }

    try {
      const productsForInsert = this.stripScreenshotInfo(products);
      const insertedProducts = await this.insertProducts(
        productsForInsert,
        products
      );
      console.log(
        `✅  Successfully saved ${insertedProducts.length} products.`
      );
      return insertedProducts;
    } catch (error) {
      console.error("⚠️ Error inserting products:", error);
      return [];
    } finally {
      // no-op
    }
  }

  private buildScreenshotInfoMap(
    products: Product[]
  ): Map<string, Product["screenshotInfo"]> {
    const map = new Map<string, Product["screenshotInfo"]>();
    products.forEach((product) => {
      if (!product.screenshotInfo) return;
      const key = this.getProductMatchKey(product);
      if (!key) return;
      map.set(key, product.screenshotInfo);
    });
    return map;
  }

  private getProductMatchKey(product: Product): string {
    const record = product as unknown as Record<string, unknown>;
    const url =
      (product.url as string) ||
      (record["product_url"] as string) ||
      (record["url"] as string) ||
      "";

    return url;
  }

  private mergeScreenshotInfo(
    insertedProducts: Product[],
    originalProducts: Product[]
  ): Product[] {
    const screenshotInfoMap = this.buildScreenshotInfoMap(originalProducts);
    const originalMatchMap = new Map<string, Product>();

    originalProducts.forEach((product) => {
      originalMatchMap.set(this.getProductMatchKey(product), product);
    });

    return insertedProducts.map((product) => {
      const record = product as unknown as Record<string, unknown>;
      const normalizedProduct =
        product.id || !record["product_id"]
          ? product
          : {
              ...product,
              id: record["product_id"] as string,
            };

      const screenshotInfo = screenshotInfoMap.get(
        this.getProductMatchKey(normalizedProduct)
      );
      const originalProduct = originalMatchMap.get(
        this.getProductMatchKey(normalizedProduct)
      );

      if (screenshotInfo) {
        return {
          ...normalizedProduct,
          url: originalProduct?.url || normalizedProduct.url,
          category: originalProduct?.category || normalizedProduct.category,
          platformId: originalProduct?.platformId || normalizedProduct.platformId,
          screenshotInfo,
        };
      }

      return normalizedProduct;
    });
  }

  private async insertProducts(
    products: Product[],
    originalProducts: Product[]
  ): Promise<Product[]> {
    try {
      const { data, error } = await this.supabaseClient.rpc(
        "insert_products_v2",
        {
          products: products,
        }
      );

      if (error) {
        throw error;
      }

      if (Array.isArray(data)) {
        return this.mergeScreenshotInfo(data as Product[], originalProducts);
      }

      console.warn(
        "⚠️ insert_products_v2 did not return inserted rows. Screenshot jobs were skipped because product ids are missing."
      );
      return [];
    } catch (error) {
      console.error("⚠️  Error inserting products:", error);
      return [];
    }
  }

  public async ensureProductImageRows(products: Product[]): Promise<void> {
    const rows = products
      .map((product) => {
        const record = product as unknown as Record<string, unknown>;
        const id = product.id || (record["product_id"] as string | undefined);
        if (!id) return null;
        return {
          product_id: id,
          image_url: null,
        };
      })
      .filter((row): row is { product_id: string; image_url: null } =>
        Boolean(row)
      );

    if (rows.length === 0) return;

    try {
      const { error } = await this.supabaseClient
        .from("product_images")
        .upsert(rows, {
          onConflict: "product_id",
        });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("⚠️  Error creating product_images rows:", error);
    }
  }
}

const SupabaseClientInstance = new SupabaseClient();

export default SupabaseClientInstance;
  private stripScreenshotInfo(products: Product[]): Product[] {
    return products.map((product) => {
      if (!product.screenshotInfo) return product;
      const { screenshotInfo: _, ...rest } = product;
      return rest;
    });
  }
