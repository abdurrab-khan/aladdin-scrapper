import { supabase } from "../clients/supabase.ts";
import { CaptionDetails } from "../../types/index.ts";
import { FunctionsResponse } from "@supabase/functions-js";

export const shareProduct = async (
  productDetails: CaptionDetails,
): Promise<FunctionsResponse<any>> => {
  try {
    if (process.env["NODE_ENV"] === "development") {
      const shareProduct = await fetch("http://192.168.0.100:8000/", {
        method: "POST",
        body: JSON.stringify(productDetails),
      });
      const shareResponse = await shareProduct.json();

      if (!shareResponse?.success) {
        throw new Error(shareResponse?.error);
      }

      return shareResponse;
    } else {
      const shareProduct = await supabase.functions.invoke(
        "social-media-helper",
        {
          body: productDetails,
          method: "POST",
        },
      );

      if (shareProduct?.error) {
        throw new Error(shareProduct?.error);
      }

      return shareProduct;
    }
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    throw new Error(errorMessage);
  }
};
