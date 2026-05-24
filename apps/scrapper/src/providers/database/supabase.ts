import { createClient, SupabaseClient as SupabaseJSClient } from "@supabase/supabase-js";
import { BaseDatabase } from "./interfaces.js";
import { SupabaseTransformer } from "./utils/supabase-transformer.js";
import type { Product } from "../../types/product.js";

export class SupabaseDatabase extends BaseDatabase {
  private supabaseClient: SupabaseJSClient;

  constructor() {
    super();
    if (!process.env["SUPABASE_URL"] || !process.env["SUPABASE_KEY"]) {
      throw new Error(
        "Supabase URL or Key is not defined in environment variables.",
      );
    }

    this.supabaseClient = createClient(
      process.env["SUPABASE_URL"],
      process.env["SUPABASE_KEY"],
      {
        db: {
          schema: "public",
        },
      },
    );
  }

  public async saveProducts(products: Product[]): Promise<Product[]> {
    if (products.length === 0) {
      console.warn("No products provided for database insertion.");
      return [];
    }

    try {
      const productsForInsert = SupabaseTransformer.toDbProducts(products);

      const { data, error } = await this.supabaseClient.rpc(
        "insert_products_v2",
        {
          products: productsForInsert,
        },
      );

      if (error) {
        throw error;
      }

      if (Array.isArray(data)) {
        return SupabaseTransformer.mergeScreenshotInfo(data as Product[], products);
      }

      console.warn(
        "Stored procedure 'insert_products_v2' did not return data. Screenshot jobs were skipped.",
      );
      return [];
    } catch (error) {
      console.error("Database insertion failed:", error);
      return [];
    }
  }

  public async ensureProductImageRows(products: Product[]): Promise<void> {
    const uniqueRows = SupabaseTransformer.toProductImageRows(products);

    if (uniqueRows.length === 0) return;

    try {
      // We use a simple insert here. If you want to avoid duplicates, 
      // ensure you have a unique constraint on (product_id, image_type) in your database.
      const { error } = await this.supabaseClient
        .from("product_images")
        .insert(uniqueRows);

      if (error) {
        // If the error is about a unique constraint violation, we can ignore it
        // but if it's the 42P10 error (missing constraint for upsert), 
        // using .insert() avoids it entirely.
        if (error.code === "23505") {
          return;
        }
        throw error;
      }
    } catch (error) {
      console.error("Failed to ensure product image rows:", error);
    }
  }
}

const SupabaseDatabaseInstance = new SupabaseDatabase();
export default SupabaseDatabaseInstance;
