import nodePath from "path";
import { BaseScreenshotHandler } from "./base.handler";
import { Website } from "@/types";
import { ProviderFactory } from "../engines/factory";
import CustomError from "@/utils/ErrorHandler";
import { Browser, Page } from "puppeteer";

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

      // const path = `./src/product_images/full_${id}_image.png`;
      const path = nodePath.resolve(
        __dirname,
        `product_images/full_${id}_image.png`,
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

const x = new FullScreenshotHandler();

x.execute(
  "123",
  "https://www.flipkart.com/lzard-slim-men-dark-blue-jeans/p/itma2a503b661259?pid=JEAFMHTSADHYYQEZ&lid=LSTJEAFMHTSADHYYQEZHCVSJJ&marketplace=FLIPKART&q=jeans&store=clo%2Fvua%2Fk58&srno=s_1_1&otracker=search&otracker1=search&fm=Search&iid=en_Iy7yK488fM90dLRMk9UC5aMTJqW4R50FE_qFV7yZwAEmkNkgbFnBYFKNuqIagr6BhLA0i4b9NyjSnmVzrDMFmw%3D%3D&ppt=sp&ppn=sp&ssid=oho9grvjow0000001779732584468&qH=a0f2589b1ced4dec&ov_redirect=true",
  "FLIPKART",
)
  .then((path) => {})
  .catch((err) => {
    console.error("Error executing full screenshot handler: ", err);
  });
