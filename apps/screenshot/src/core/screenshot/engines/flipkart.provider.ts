import { ElementHandle } from "puppeteer";
import { BaseProvider } from "./base.provider";
import { Website, IGroupedScreenShotRequest } from "@/types";
import FlipkartSelector from "../selectors/flipkart";

export class FlipkartProvider extends BaseProvider {
  readonly website: Website = "FLIPKART";

  getMainSelector(variant: "FULL" | "GROUPED"): string {
    return variant === "FULL" ? FlipkartSelector.FULL.main : FlipkartSelector.GROUPED.card;
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

    return imageBounding.height + 28;
  }

  async getMaxWidth(mainElement: ElementHandle<Element>): Promise<number> {
    const bounding = await mainElement.boundingBox();
    if (!bounding) throw new Error("Could not find Flipkart main bounding box");
    return bounding.width;
  }

  async isValidProduct(
    price: ElementHandle<Element> | null,
    discountPrice: ElementHandle<Element> | null,
    priceDetails: IGroupedScreenShotRequest["priceDetails"]
  ): Promise<boolean> {
    // Current logic returns true, following existing implementation in utils.ts
    return true;
  }
}
