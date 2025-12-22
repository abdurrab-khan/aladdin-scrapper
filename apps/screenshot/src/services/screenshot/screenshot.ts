import puppeteer, { Browser, Page } from "puppeteer";

import Utils from "./utils/screenshotUtils.js";

import CustomError from "@/utils/ErrorHandler";
import ApiResponse from "@/utils/ApiResponse.js";

import {
  IGroupedScreenShotRequest,
  ScreenShotVaritents,
  Website,
} from "@/types/index.js";

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
  priceDetails?: IGroupedScreenShotRequest["priceDetails"];

  navigateTo: () => Promise<INavigateToReturn>;
  takeScreenShot: (
    browser: Browser,
    page: Page,
  ) => Promise<string | ApiResponse>;
}

class ScreenShot implements IScreenShot {
  id: string;
  url: string;
  website: Website;
  utils: Utils;
  varient: ScreenShotVaritents = "FULL";
  priceDetails?: IGroupedScreenShotRequest["priceDetails"];

  constructor(id: string, url: string, website: Website) {
    this.id = id;
    this.url = url;
    this.website = website;
    this.utils = new Utils();
  }

  // setting varient
  setVarient(varient: ScreenShotVaritents) {
    this.varient = varient;
  }

  // setting priceDetails
  setPriceDetails(priceDetails?: IGroupedScreenShotRequest["priceDetails"]) {
    this.priceDetails = priceDetails;
  }

  // <==================> ACTUAL METHODS <==================>
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

  async takeScreenShot(
    browser: Browser,
    page: Page,
  ): Promise<string | ApiResponse> {
    try {
      // calculating -- coordinates of the element which we want
      const clipCoords = await this.utils.calClippedCoords(
        page,
        this.website,
        this.varient,
        this?.priceDetails,
      );

      // if there is some message directly return them
      if (clipCoords instanceof ApiResponse) {
        return clipCoords;
      }

      const path = `${this.varient}_${this.id}_image.png`;

      // taking screenshot
      await page.screenshot({
        path,
        type: "png",
        clip: clipCoords,
        captureBeyondViewport: true,
      });

      return path;
    } catch (error) {
      // directly throw error
      if (error instanceof CustomError) {
        throw error;
      }

      throw new Error(
        (error as Error)?.message ??
          "An unknown error occurred during taking screenshot",
      );
    } finally {
      // closing page and browser
      if (page && !page.isClosed()) {
        await page.close();
      }

      if (browser) {
        await browser.close();
      }
    }
  }

  private async launchBrowser(): Promise<ILaunchBrowserReturn> {
    try {
      const browser = await puppeteer.launch({
        executablePath:
          "C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe",
        headless: false,
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
