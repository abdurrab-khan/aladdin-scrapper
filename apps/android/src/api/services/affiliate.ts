import { supabase } from "@/api/clients/supabase";

export const addAffiliateLink = async (
  productUrl: string,
  affiliateUrl: string,
  platformId: string,
) => {
  if (!productUrl.trim() || !affiliateUrl.trim() || !platformId.trim()) {
    throw new Error("Product url and affiliate url is required.");
  }

  try {
    const response = await supabase
      .from("associated_affiliates")
      .insert({
        product_url: productUrl,
        affiliate_url: affiliateUrl,
        platform: platformId,
      })
      .select();

    if (response.status !== 201) {
      throw new Error(
        response?.error?.message ||
          "An error occurred when adding affiliate link.",
      );
    }

    return response;
  } catch (err) {
    const errorMsg =
      err instanceof Error
        ? err.message
        : "An error occurred when adding affiliate link";

    throw new Error(errorMsg);
  }
};
