import { z } from "zod";
import { updateProduct } from "./product";
import { supabase } from "@/api/clients/supabase";
import { FunctionsResponse } from "@supabase/functions-js";
import { CaptionDetailsSchema } from "@/api/schemas/caption.schema";

type CaptionDetails = z.infer<typeof CaptionDetailsSchema> & {
  productImage?: string;
};

export const shareProduct = async (
  productDetails: CaptionDetails,
): Promise<FunctionsResponse<any>> => {
  try {
    const shareProduct = await supabase.functions.invoke("share-product", {
      body: productDetails,
      method: "POST",
    });

    if (shareProduct?.error) {
      throw new Error(shareProduct?.error);
    }

    // // Update the product as shared
    await updateProduct(productDetails.ids, { is_posted: true });

    return shareProduct;
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    throw new Error(errorMessage);
  }
};
