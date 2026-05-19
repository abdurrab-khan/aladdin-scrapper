import { createClient } from "@supabase/supabase-js";

import type { GroupProductDetails, Product, SingleProductDetails } from "../types/product.js";

type ProductImageType = "FULL" | "GROUPED";

type DbProductInsert = {
  product_id?: string;
  product_name: string;
  product_url: string;
  product_price: number;
  product_discount_price: number;
  product_brand: string;
  product_category: string | null;
  is_grouped: boolean;
  app_id: string;
  user_id: string;
  website_id: string;
};

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
      const productsForInsert = this.toDbProducts(products);
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
      const normalizedProduct: Product =
        record["product_id"]
          ? {
              ...product,
              id: record["product_id"] as string,
            }
          : product;

      if (!normalizedProduct.url && typeof record["product_url"] === "string") {
        normalizedProduct.url = record["product_url"] as string;
      }

      if (
        !normalizedProduct.category &&
        typeof record["product_category"] === "string"
      ) {
        normalizedProduct.category = record["product_category"] as string;
      }

      if (
        !normalizedProduct.platformId &&
        typeof record["website_id"] === "string"
      ) {
        normalizedProduct.platformId = record["website_id"] as string;
      }

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
    products: DbProductInsert[],
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

  private toDbProducts(products: Product[]): DbProductInsert[] {
    return products.map((product) => {
      const details = product.details as SingleProductDetails | GroupProductDetails;
      const productPrice =
        "price" in details ? details.price : details.startPrice;
      const productDiscountPrice =
        "discountPrice" in details
          ? details.discountPrice
          : details.discountStartPrice;

      return {
        product_id: product.id,
        product_name: product.name,
        product_url: product.url,
        product_price: productPrice,
        product_discount_price: productDiscountPrice,
        product_brand: details.brand,
        product_category: product.category || null,
        is_grouped: product.isGrouped,
        app_id: product.associatedAppId,
        user_id: product.userId,
        website_id: product.platformId,
      };
    });
  }

  public async ensureProductImageRows(products: Product[]): Promise<void> {
    const rows: Array<{
      product_id: string;
      image_type: ProductImageType;
      image_url: null;
      image_status: "Pending";
    }> = [];

    products.forEach((product) => {
      if (!product.screenshotInfo) return;
      const record = product as unknown as Record<string, unknown>;
      const id = product.id || (record["product_id"] as string | undefined);
      if (!id) return;

      if (product.screenshotInfo.grouped) {
        rows.push({
          product_id: id,
          image_type: "GROUPED",
          image_url: null,
          image_status: "Pending",
        });
      }

      if (product.screenshotInfo.fullPageRequired) {
        rows.push({
          product_id: id,
          image_type: "FULL",
          image_url: null,
          image_status: "Pending",
        });
      }
    });

    const uniqueRows = Array.from(
      new Map(
        rows.map((row) => [`${row.product_id}:${row.image_type}`, row])
      ).values()
    );

    if (uniqueRows.length === 0) return;

    try {
      const { error } = await this.supabaseClient
        .from("product_images")
        .upsert(uniqueRows, {
          onConflict: "product_id,image_type",
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
