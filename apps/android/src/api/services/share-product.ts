import { supabase } from "@/api/clients/supabase";
import { CaptionDetails } from "@/types/index.js";
import { FunctionsResponse } from "@supabase/functions-js";
import { updateProduct } from "./product";

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
