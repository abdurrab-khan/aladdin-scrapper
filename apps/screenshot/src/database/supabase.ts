import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

class SupabaseClient {
  public supabaseClient;

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

  private async uploadImage(
    productId: string,
    imagePath: string
  ): Promise<string> {
    try {
      const imageBuffer = readFileSync(imagePath, {
        flag: "r",
      });

      const uniqueImageKey = `product_images/${productId}-${Date.now()}.png`;
      const response = await this.supabaseClient.storage
        .from("aladdin")
        .upload(uniqueImageKey, imageBuffer, {
          upsert: false,
          contentType: "image/png",
        });

      if (response.error || !response?.data?.fullPath) {
        throw new Error(
          `Failed to upload image to Supabase Storage: ${response.error?.message}`
        );
      }

      return response.data.fullPath;
    } catch (error) {
      throw new Error(`An error occurred during image upload: ${error}`);
    }
  }

  public async save_image(
    productId: string,
    imagePath: string,
    imageType: "Full" | "Group"
  ): Promise<void> {
    try {
      const uploadImageUrl = await this.uploadImage(productId, imagePath);

      const updateDb = await this.supabaseClient
        .from("product_images")
        .update({
          image_url: uploadImageUrl,
          image_status: "Completed",
        })
        .eq("product_id", productId)
        .eq("image_type", imageType);

      if (updateDb.error) {
        throw new Error(
          `Failed to update database with image URL: ${updateDb.error.message}`
        );
      }
    } catch (err) {
      throw new Error(`An error occurred while saving the image: ${err}`);
    }
  }
}

export default new SupabaseClient();
