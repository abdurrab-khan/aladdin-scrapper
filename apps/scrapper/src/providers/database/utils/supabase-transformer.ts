import { ProductMapper } from "./product-mapper.js";
import type { DbProductInsert, DbProductImageRow } from "./product-mapper.js";
import type { Product } from "../../../types/product.js";

export class SupabaseTransformer {
  public static toDbProducts(products: Product[]): DbProductInsert[] {
    return products.map((product) => ProductMapper.toDatabase(product));
  }

  public static toProductImageRows(products: Product[]): DbProductImageRow[] {
    const rows = products.flatMap((product) => ProductMapper.toImageRows(product));

    // Deduplicate rows based on product_id and image_type
    return Array.from(
      new Map(
        rows.map((row) => [`${row.product_id}:${row.image_type}`, row]),
      ).values(),
    );
  }

  public static mergeScreenshotInfo(
    insertedProducts: Product[],
    originalProducts: Product[],
  ): Product[] {
    // Map original products by URL for easy lookup
    const originalMatchMap = new Map<string, Product>();
    originalProducts.forEach((p) => {
      if (p.url) originalMatchMap.set(p.url, p);
    });

    return insertedProducts.map((dbProduct) => {
      // dbProduct here is likely a raw object from Supabase (snake_case)
      const url = (dbProduct as any)["product_url"] || dbProduct.url;
      const original = originalMatchMap.get(url);
      
      return ProductMapper.normalize(dbProduct as any, original);
    });
  }
}
