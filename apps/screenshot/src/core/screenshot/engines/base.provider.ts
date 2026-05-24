import { Page, ElementHandle } from "puppeteer";
import { Website, IGroupedScreenShotRequest } from "@/types";

export abstract class BaseProvider {
  abstract readonly website: Website;

  abstract getMainSelector(variant: "FULL" | "GROUPED"): string;
  abstract getSponsorSelector(): string;
  abstract getPriceSelector(): string;
  abstract getDiscountSelector(): string;

  abstract getMaxHeight(mainElement: ElementHandle<Element>): Promise<number>;
  abstract getMaxWidth(mainElement: ElementHandle<Element>): Promise<number>;

  async removeSponsors(page: Page): Promise<void> {
    const selector = this.getSponsorSelector();
    await page.$$eval(
      selector,
      (elems, website) => {
        if (website === "FLIPKART") {
          const bounding = elems[0]?.getBoundingClientRect();
          if (bounding && bounding.height > bounding.width) {
            return;
          }
        }
        elems.forEach((e) => e.remove());
      },
      this.website,
    );
  }

  abstract isValidProduct(
    price: ElementHandle<Element> | null,
    discountPrice: ElementHandle<Element> | null,
    priceDetails: IGroupedScreenShotRequest["priceDetails"],
  ): Promise<boolean>;
}
