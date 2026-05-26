import { FunctionsResponse } from "@supabase/functions-js";
import { supabase } from "../supabase";
import { CaptionDetails } from "../zod";

export const shareProduct = async (
  productDetails: CaptionDetails
): Promise<FunctionsResponse<any>> => {
  try {
    // Calling -- Supabase function to send post/message into the given platform.
    const shareProduct = await supabase.functions.invoke(
      "social-media-helper",
      {
        body: productDetails,
        method: "POST",
      }
    );

    if (shareProduct.error) {
      throw shareProduct.error;
    }

    return shareProduct;
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    throw new Error(errorMessage);
  }
};
