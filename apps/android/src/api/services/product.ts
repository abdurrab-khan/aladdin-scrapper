import { supabase } from "@/api/clients/supabase";
import { Product } from "@/types/product";
import { PostgrestError } from "@supabase/supabase-js";

// interface getProducts
interface getProductsProps {
  appId: string;
  start?: number;
  end?: number;
  query?: string | null;
  categoryValue?: string | null;
}

// cspell: ignore supabase
/**
 * Fetches products associated with a specific app.
 *
 * @param {getProductsProps} params - The parameters for fetching products.
 * @param {string} params.appId - The ID of the associated app.
 * @param {number} [params.start=0] - The starting index for pagination.
 * @param {number} [params.end=9] - The ending index for pagination.
 * @returns {Promise<Product[]>} - A promise that resolves to an array of products.
 * @throws {Error} - Throws an error if the fetch operation fails or if no products are found.
 */
export const getProducts = async ({
  appId,
  start = 0,
  end = 9,
  categoryValue = null,
  query = null,
}: getProductsProps): Promise<Product[]> => {
  try {
    let queryBuilder = supabase
      .from("product_info")
      .select("*")
      .eq("app_id", appId);

    // Apply category filter if provided
    if (categoryValue) {
      queryBuilder = queryBuilder.eq("category", categoryValue);
    }

    // Apply search query filter if provided
    if (query) {
      queryBuilder = queryBuilder.ilike("name", `%${query}%`);
    }

    const products = await queryBuilder
      .range(start, end)
      .order("category", { ascending: true })
      .order("discount_price", { ascending: true });

    if (products.status !== 200 && products.status !== 206) {
      throw new PostgrestError({
        message: products.error?.message || "Failed to fetch products",
        details: products.error?.details || "",
        hint: products.error?.hint || "",
        code: products.error?.code || "",
      });
    }

    if (!products.data || products.data.length === 0) {
      return [];
    }

    // Parse JSON strings
    const parsedProducts = products.data.map((product: any) => {
      return {
        ...product,
        images:
          typeof product.images === "string"
            ? JSON.parse(product.images)
            : product.images,
        website:
          typeof product.website === "string"
            ? JSON.parse(product.website)
            : product.website,
      };
    });

    return parsedProducts as Product[];
  } catch (err: unknown) {
    const errMessage =
      err instanceof PostgrestError
        ? err.message
        : "An error occurred during fetching products.";

    throw new Error(errMessage);
  }
};

export const deleteProducts = async (
  ids: string[] | string,
  imageId: string[] | string,
) => {
  if (!ids || ids.length === 0) {
    throw new Error("Product IDs are required.");
  }

  try {
    const { error } = await supabase
      .from("products_info")
      .delete()
      .in("product_id", Array.isArray(ids) ? ids : [ids]);

    if (error) {
      throw new Error(error.message);
    }

    // Delete the image associated with the products
    await deleteProductImage(imageId);

    return true;
  } catch (err: unknown) {
    const errMessage =
      err instanceof Error ? err.message : "An error occurred during deletion.";
    throw new Error(errMessage);
  }
};

export const updateProduct = async (
  id: string | string[],
  updatedProps: Partial<Product>,
): Promise<boolean> => {
  if (!id || !updatedProps) {
    throw new Error("Product ID and updated properties are required.");
  }

  try {
    const { error } = await supabase
      .from("products_info")
      .update(updatedProps)
      .in("product_id", Array.isArray(id) ? id : [id]);

    if (error) {
      throw new Error(error.message);
    }

    return true;
  } catch (err: unknown) {
    const errMessage =
      err instanceof Error ? err.message : "An error occurred during update.";

    throw new Error(errMessage);
  }
};

/**
 * Function to upload product image to Supabase Storage
 * @param {Uint16Array} pngBytes - The image data in PNG format as a byte array.
 * @returns {Promise<string>} - A promise that resolves to the URL of the uploaded image.
 */
export const uploadProductImage = async (
  pngBytes: Uint8Array,
): Promise<{ imageUrl: string; imagePath: string }> => {
  try {
    const fileName = `send-product/product_${Date.now()}.png`;
    const { data, error } = await supabase.storage
      .from("aladdin")
      .upload(fileName, pngBytes, {
        cacheControl: "3600",
        upsert: false,
        contentType: "image/png",
      });

    if (error) {
      throw new Error(error.message);
    }

    const fullUrl = supabase.storage.from("aladdin").getPublicUrl(data!.path)
      .data.publicUrl;

    return { imageUrl: fullUrl, imagePath: data.path };
  } catch (err: unknown) {
    const errMessage =
      err instanceof Error
        ? err.message
        : "An error occurred during image upload.";
    throw new Error(errMessage);
  }
};

/**
 * Function to delete the uploaded product image from Supabase Storage
 * @param {string} imagePath - The path of the image to be deleted (not the full URL).
 * @return {Promise<boolean>} - A promise that resolves to true if the deletion was successful.
 */
export const deleteProductImage = async (
  imagePath: string | string[],
): Promise<boolean> => {
  try {
    if (!imagePath) {
      throw new Error("Image path is required.");
    }

    const { data, error } = await supabase.storage
      .from("aladdin")
      .remove(Array.isArray(imagePath) ? imagePath : [imagePath]);

    if (error) {
      console.error("Supabase storage deletion error:", error);
      throw new Error(`Failed to delete image: ${error.message}`);
    }

    if (data && data.length > 0) {
      console.log("Image deleted successfully:");
      return true;
    } else {
      console.warn("No files were deleted or file might not exist");
      return false;
    }
  } catch (err: unknown) {
    const errMessage =
      err instanceof Error
        ? err.message
        : "An error occurred during image deletion.";
    throw new Error(errMessage);
  }
};

export const getProductCategories = async (
  appId: string,
): Promise<string[]> => {
  try {
    const { data, error } = await supabase.rpc("fetch_categories", {
      app_id: appId,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data.map((item: { category: string }) => item.category) as string[];
  } catch (err: unknown) {
    const errMessage =
      err instanceof Error
        ? err.message
        : "An error occurred while fetching product categories.";
    throw new Error(errMessage);
  }
};
