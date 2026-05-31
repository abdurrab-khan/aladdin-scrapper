import { supabase } from "../clients/supabase";
import { Affiliate } from "../../types";

export const addAffiliateLink = async (
  appId: string,
  productId: string,
  platformId: string,
  affiliateUrl: string,
) => {
  if (!affiliateUrl.trim() || !platformId.trim() || !appId.trim()) {
    throw new Error("Product url and affiliate url is required.");
  }

  try {
    // Check if this is the first link for the product to make it default
    const { count } = await supabase
      .from("affiliate_urls")
      .select("*", { count: "exact", head: true })
      .eq("product_id", productId);

    const isDefault = count === 0;

    const response = await supabase
      .from("affiliate_urls")
      .insert({
        app_id: appId,
        product_id: productId,
        website_id: platformId,
        affiliate_url: affiliateUrl,
        is_default: isDefault,
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

export const getAffiliateLinks = async (productId: string): Promise<Affiliate[]> => {
  try {
    const { data, error } = await supabase
      .from("affiliate_urls")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Affiliate[];
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : "Failed to fetch affiliate links");
  }
};

export const deleteAffiliateLink = async (affiliateId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from("affiliate_urls")
      .delete()
      .eq("affiliate_id", affiliateId);

    if (error) throw error;
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : "Failed to delete affiliate link");
  }
};

export const setDefaultAffiliateLink = async (affiliateId: string, productId: string): Promise<void> => {
  try {
    // First, set all links for this product to not default
    const { error: resetError } = await supabase
      .from("affiliate_urls")
      .update({ is_default: false })
      .eq("product_id", productId);

    if (resetError) throw resetError;

    // Then set the chosen one to default
    const { error: setError } = await supabase
      .from("affiliate_urls")
      .update({ is_default: true })
      .eq("affiliate_id", affiliateId);

    if (setError) throw setError;
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : "Failed to set default affiliate link");
  }
};

export const getDefaultAffiliateLinks = async (productIds: string[]): Promise<Affiliate[]> => {
  if (!productIds || productIds.length === 0) return [];

  try {
    const { data, error } = await supabase
      .from("affiliate_urls")
      .select("*")
      .in("product_id", productIds)
      .eq("is_default", true);

    if (error) throw error;
    return data as Affiliate[];
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : "Failed to fetch default affiliate links");
  }
};
