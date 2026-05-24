import { ElementHandle } from "puppeteer";
import { BaseProvider } from "./base.provider";
import { Website, IGroupedScreenShotRequest } from "@/types";
import AmazonSelector from "../selectors/amazon";

export class AmazonProvider extends BaseProvider {
  readonly website: Website = "AMAZON";

  getMainSelector(variant: "FULL" | "GROUPED"): string {
    return variant === "FULL" ? AmazonSelector.FULL.main : AmazonSelector.GROUPED.card;
  }

  getSponsorSelector(): string {
    return AmazonSelector.GROUPED.sponsoreCard;
  }

  getPriceSelector(): string {
    return AmazonSelector.GROUPED.price;
  }

  getDiscountSelector(): string {
    return AmazonSelector.GROUPED.discount;
  }

  async getMaxHeight(mainElement: ElementHandle<Element>): Promise<number> {
    const imageSection = await mainElement.$(AmazonSelector.FULL.image);
    const priceSection = await mainElement.$(AmazonSelector.FULL.priceSection);

    if (imageSection === null || priceSection === null) {
      throw new Error(`Sorry we can't find image or price section for Amazon`);
    }

    const imageBounding = await imageSection.boundingBox();
    const priceBounding = await priceSection.boundingBox();

    if (imageBounding === null || priceBounding === null) {
      throw new Error(`Sorry we can't find image or price bounding for Amazon`);
    }

    return Math.max(imageBounding.height, priceBounding.height);
  }

  async getMaxWidth(mainElement: ElementHandle<Element>): Promise<number> {
    const bounding = await mainElement.boundingBox();
    if (!bounding) throw new Error("Could not find Amazon main bounding box");
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
