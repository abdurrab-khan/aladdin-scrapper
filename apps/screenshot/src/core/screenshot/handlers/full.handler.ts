import nodePath from "path";
import { fileURLToPath } from "url";
import { BaseScreenshotHandler } from "./base.handler";
import { Website } from "@/types";
import { ProviderFactory } from "../engines/factory";
import CustomError from "@/utils/ErrorHandler";
import { Browser, Page } from "puppeteer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = nodePath.dirname(__filename);

export class FullScreenshotHandler extends BaseScreenshotHandler {
  async execute(id: string, url: string, website: Website): Promise<string> {
    this.provider = ProviderFactory.getProvider(website);
    let browser: Browser | null = null;
    let page: Page | null = null;

    try {
      const launched = await this.launchBrowser(website);
      browser = launched.browser;
      page = launched.page;

      await this.navigate(page, url);

      const selector = this.provider.getMainSelector("FULL");

      console.log(
        `WAITING FOR MAIN SELECTOR: ${selector} for website: ${website}`,
      );

      await this.waitForElement(page, selector);

      const mainElement = await page.$(selector);
      if (!mainElement)
        throw new Error(`Could not find main element for ${website}`);

      const maxHeight = await this.provider.getMaxHeight(mainElement);
      const maxWidth = await this.provider.getMaxWidth(mainElement);
      const mainBounding = await mainElement.boundingBox();

      if (!mainBounding)
        throw new Error(`Could not get bounding box for ${website}`);

      const path = nodePath.resolve(
        __dirname,
        `../../../../product_images/full_${id}_image.png`,
      );

      await page.screenshot({
        path,
        type: "png",
        clip: {
          x: mainBounding.x,
          y: mainBounding.y,
          height: maxHeight,
          width: maxWidth,
        },
        captureBeyondViewport: true,
      });

      return path;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new Error(
        (error as Error)?.message ?? "Error taking full screenshot",
      );
    } finally {
      if (page && !page.isClosed()) await page.close();
      if (browser) await browser.close();
    }
  }
}
