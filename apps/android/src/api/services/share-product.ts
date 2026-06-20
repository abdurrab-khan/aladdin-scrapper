import { supabase } from "../clients/supabase.ts";
import { CaptionDetails } from "../../types/index.ts";
import { FunctionsResponse } from "@supabase/functions-js";

export const shareProduct = async (
  productDetails: CaptionDetails,
): Promise<FunctionsResponse<any>> => {
  try {
    const shareProduct = await supabase.functions.invoke("share-product", {
      body: productDetails,
      method: "POST",
    });

    console.log("Share Product Response is: ", shareProduct);

    if (shareProduct?.error) {
      throw new Error(shareProduct?.error);
    }

    return shareProduct;
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    throw new Error(errorMessage);
  }
};
