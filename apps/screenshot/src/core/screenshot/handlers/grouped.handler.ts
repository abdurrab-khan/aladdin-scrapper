import nodePath from "path";
import { fileURLToPath } from "url";
import { BaseScreenshotHandler } from "./base.handler";
import { Website, IGroupedScreenShotRequest } from "@/types";
import { ProviderFactory } from "../engines/factory";
import CustomError from "@/utils/ErrorHandler";
import { Browser, Page, ElementHandle, ScreenshotClip } from "puppeteer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = nodePath.dirname(__filename);

export class GroupedScreenshotHandler extends BaseScreenshotHandler {
  async execute(
    id: string,
    url: string,
    website: Website,
    priceDetails: IGroupedScreenShotRequest["priceDetails"],
  ): Promise<string> {
    if (!priceDetails) {
      throw new Error(
        `Price details are required for grouped screenshot for: ${website}`,
      );
    }

    this.provider = ProviderFactory.getProvider(website);
    let browser: Browser | null = null;
    let page: Page | null = null;

    try {
      const launched = await this.launchBrowser(website);
      browser = launched.browser;
      page = launched.page;

      await this.navigate(page, url);

      // Amazon might need a reload as per old utils logic
      if (website === "AMAZON") await page.reload();

      const cardSelector = this.provider.getMainSelector("GROUPED");
      await this.waitForElement(page, cardSelector);

      // Remove sponsors
      await this.provider.removeSponsors(page);

      // Fetch product cards
      const productCards = await page.$$(cardSelector);
      if (productCards.length === 0) {
        throw new Error(`Could not find product cards for: ${website}`);
      }

      // Validate products
      const validCards: ElementHandle<Element>[] = [];
      const priceSelector = this.provider.getPriceSelector();
      const discountSelector = this.provider.getDiscountSelector();

      for (let i = 0; i < productCards.length && i < 4; i++) {
        const card = productCards[i];
        const priceElem = await card.$(priceSelector);
        const discountElem = await card.$(discountSelector);

        const isValid = await this.provider.isValidProduct(
          priceElem,
          discountElem,
          priceDetails,
        );
        if (!isValid) {
          if (i >= 2) break;
          throw new CustomError({
            statusCode: 400,
            message: "No valid products found for grouped screenshot",
          });
        }
        validCards.push(card);
      }

      // Calculate clip area
      const clip = await this.calculateClip(validCards);
      const path = nodePath.resolve(
        __dirname,
        `../../../../product_images/grouped_${id}_image.png`,
      );

      await page.screenshot({
        path,
        type: "png",
        clip,
        captureBeyondViewport: true,
      });

      return path;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new Error(
        (error as Error)?.message ?? "Error taking grouped screenshot",
      );
    } finally {
      if (page && !page.isClosed()) await page.close();
      if (browser) await browser.close();
    }
  }

  private async calculateClip(
    elems: ElementHandle<Element>[],
  ): Promise<ScreenshotClip> {
    let x = 0;
    let y = 0;
    let maxHeight = 0;
    let maxWidth = 0;

    for (let i = 0; i < elems.length; i++) {
      const bounding = await elems[i].boundingBox();
      if (!bounding) throw new Error("Could not get bounding box for a card");

      if (i === 0) {
        x = bounding.x;
        y = bounding.y;
      }

      if (bounding.height > bounding.width) {
        maxWidth += bounding.width;
        maxHeight = Math.max(maxHeight, bounding.height);
      } else {
        maxHeight += bounding.height;
        maxWidth = Math.max(maxWidth, bounding.width);
      }
    }

    return { x, y, height: maxHeight, width: maxWidth };
  }
}
