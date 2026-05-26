import { ElementHandle } from "puppeteer";
import { BaseProvider } from "./base.provider";
import { Website, IGroupedScreenShotRequest } from "@/types";
import FlipkartSelector from "../selectors/flipkart";

export class FlipkartProvider extends BaseProvider {
  readonly website: Website = "FLIPKART";

  getMainSelector(variant: "FULL" | "GROUPED"): string {
    return variant === "FULL"
      ? FlipkartSelector.FULL.main
      : FlipkartSelector.GROUPED.card;
  }

  getSponsorSelector(): string {
    return FlipkartSelector.GROUPED.sponsoreCard;
  }

  getPriceSelector(): string {
    return FlipkartSelector.GROUPED.price;
  }

  getDiscountSelector(): string {
    return FlipkartSelector.GROUPED.discount;
  }

  async getMaxHeight(mainElement: ElementHandle<Element>): Promise<number> {
    const imageSection = await mainElement.$(FlipkartSelector.FULL.image);
    if (imageSection === null) {
      throw new Error(`Sorry we can't find image section for Flipkart`);
    }

    const imageBounding = await imageSection.boundingBox();
    if (imageBounding === null) {
      throw new Error(`Sorry we can't find image bounding for Flipkart`);
    }

    return Math.min(imageBounding.height, 938);
  }

  async getMaxWidth(mainElement: ElementHandle<Element>): Promise<number> {
    const bounding = await mainElement.boundingBox();
    if (!bounding) throw new Error("Could not find Flipkart main bounding box");
    return bounding.width;
  }

  async isValidProduct(
    price: ElementHandle<Element> | null,
    discountPrice: ElementHandle<Element> | null,
    priceDetails: IGroupedScreenShotRequest["priceDetails"],
  ): Promise<boolean> {
    if (!priceDetails) return true;

    // Both price elements missing -> invalid
    if (!price && !discountPrice) return false;

    const getNumeric = async (
      el: ElementHandle<Element> | null,
    ): Promise<number | null> => {
      if (!el) return null;
      try {
        const txt = (await (el as any).evaluate(
          (n: Element) => n.textContent,
        )) as string | null;
        if (!txt) return null;
        const num = txt.replace(/[^0-9.]/g, "");
        const parsed = parseFloat(num);
        return Number.isFinite(parsed) ? parsed : null;
      } catch {
        return null;
      }
    };

    const mainPrice = await getNumeric(price);
    const discPrice = await getNumeric(discountPrice);

    const finalPrice = discPrice ?? mainPrice;
    if (finalPrice === null) return false;

    // priceDetails may contain min and/or max fields
    const min = (priceDetails as any)?.min ?? (priceDetails as any)?.minPrice;
    const max = (priceDetails as any)?.max ?? (priceDetails as any)?.maxPrice;

    if (typeof min === "number" && finalPrice < min) return false;
    if (typeof max === "number" && finalPrice > max) return false;

    return true;
  }
}
