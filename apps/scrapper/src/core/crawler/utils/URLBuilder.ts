import type { E_COMMERCE, ScrapeFilters } from "../../../types/common.js";

export class URLBuilder {
  private static AMAZON_RATING_MAP: Record<number, string> = {
    4: "p_72:1318476031",
    3: "p_72:1318477031",
    2: "p_72:1318478031",
    1: "p_72:1318479031",
  };

  /**
   * Builds a filtered URL for Amazon India
   */
  public static buildAmazonUrl(
    base: { keyword: string; nodeId: string },
    filters: ScrapeFilters
  ): string {
    const url = new URL("https://www.amazon.in/s");
    url.searchParams.set("k", base.keyword);

    const rhParts: string[] = [`n:${base.nodeId}`];

    if (filters.available) {
      rhParts.push("p_n_availability:1318485031");
    }

    if (filters.rating && filters.rating >= 1 && filters.rating <= 4) {
      const ratingId = this.AMAZON_RATING_MAP[Math.floor(filters.rating)];
      if (ratingId) rhParts.push(ratingId);
    }

    // Amazon discount filter (using percentage off)
    if (filters.maxDiscount) {
       // Note: Amazon rh filters for discount are often platform specific, 
       // but p_n_pct-off-with-tax is a common one for India.
       // However, we'll stick to basic ones if unsure, or use p_n_deal_type for "All Deals"
       rhParts.push("p_n_deal_type:26921226031");
    }

    url.searchParams.set("rh", rhParts.join(","));

    if (filters.minPrice !== undefined) {
      url.searchParams.set("low-price", filters.minPrice.toString());
    }
    if (filters.maxPrice !== undefined) {
      url.searchParams.set("high-price", filters.maxPrice.toString());
    }

    url.searchParams.set("s", "popularity-rank");

    return url.toString();
  }

  /**
   * Builds a filtered URL for Flipkart
   */
  public static buildFlipkartUrl(
    base: { path: string; sid: string },
    filters: ScrapeFilters
  ): string {
    const url = new URL(`https://www.flipkart.com${base.path}`);
    url.searchParams.set("sid", base.sid);
    url.searchParams.set("otracker", "categorytree");

    if (filters.available) {
      url.searchParams.append("p[]", "facets.availability[]=Exclude Out of Stock");
    }

    if (filters.rating) {
      url.searchParams.append("p[]", `facets.rating[]=${Math.floor(filters.rating)}★ & above`);
    }

    if (filters.minPrice !== undefined) {
      url.searchParams.append("p[]", `facets.price_range.from=${filters.minPrice}`);
    }

    if (filters.maxPrice !== undefined) {
      url.searchParams.append("p[]", `facets.price_range.to=${filters.maxPrice}`);
    }

    if (filters.maxDiscount) {
      url.searchParams.append("p[]", `facets.discount_range[]=${filters.maxDiscount}% or more`);
    }

    // Default special price filter
    url.searchParams.append("p[]", "facets.offer_type[]=Special Price");

    return url.toString();
  }

  /**
   * Generic builder
   */
  public static build(
    website: E_COMMERCE,
    base: any,
    filters: ScrapeFilters
  ): string {
    if (website === "amazon") {
      return this.buildAmazonUrl(base, filters);
    } else {
      return this.buildFlipkartUrl(base, filters);
    }
  }
}
