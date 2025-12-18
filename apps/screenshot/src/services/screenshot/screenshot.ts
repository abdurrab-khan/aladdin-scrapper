import puppeteer, { Browser, Page } from "puppeteer";

import Utils from "./utils/utils.js";
import { ScreenShotVaritents, Website } from "@/types/index.js";

interface INavigateToReturn {
  browser: Browser;
  page: Page;
}

interface ILaunchBrowserReturn {
  page: Page;
  browser: Browser;
}

interface IScreenShot {
  url: string;
  website: Website;
  utils: Utils;
  varient: ScreenShotVaritents;

  navigateTo: () => Promise<INavigateToReturn>;
  takeScreenShot: (browser: Browser, page: Page) => Promise<string>;
}

class ScreenShot implements IScreenShot {
  url: string;
  website: Website;
  utils: Utils;
  varient: ScreenShotVaritents;

  constructor(url: string, website: Website, varient: ScreenShotVaritents) {
    this.url = url;
    this.website = website;
    this.utils = new Utils();
    this.varient = varient;
  }

  async navigateTo(): Promise<INavigateToReturn> {
    try {
      const { browser, page } = await this.launchBrowser();

      // Navigate to url --> wait unit page got's loaded
      await page.goto(this.url, {
        timeout: 50000,
        waitUntil: "domcontentloaded",
      });

      return {
        browser,
        page,
      };
    } catch (error) {
      throw new Error(
        (error as Error)?.message ??
          "An unkown error occurred during navigation",
      );
    }
  }

  async takeScreenShot(_: Browser, page: Page): Promise<string> {
    try {
      // calculating -- coordinates of the element which we want
      const clipCoords = await this.utils.calClippedCoords(
        page,
        this.website,
        this.varient,
      );

      const path = "my-image.png";

      // taking screenshot
      await page.screenshot({
        path,
        type: "png",
        clip: clipCoords,
        captureBeyondViewport: true,
      });

      return path;
    } catch (error) {
      throw new Error(
        (error as Error)?.message ??
          "An unkown error occurred during taking screenshot",
      );
    }
  }

  private async launchBrowser(): Promise<ILaunchBrowserReturn> {
    try {
      const browser = await puppeteer.launch({
        headless: true,
      });
      const page = await browser.newPage();

      if (!browser.connected) {
        throw new Error("Failed to launch the browser");
      }

      // setting the viewport size
      await page.setViewport({
        height: 910,
        width: 1280,
        deviceScaleFactor: 1,
      });

      return {
        browser,
        page,
      };
    } catch (error) {
      throw new Error(
        (error as Error)?.message ??
          "An unkown error occurred during launching browser",
      );
    }
  }
}

export default ScreenShot;
