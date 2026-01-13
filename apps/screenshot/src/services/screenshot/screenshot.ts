import puppeteer, { Browser, Page } from "puppeteer";

import Utils from "./utils/screenshotUtils";

import AmazonSelector from "./css-selectors/amazon";
import FlipkartSelector from "./css-selectors/flipkart";

import CustomError from "@/utils/ErrorHandler";
import ApiResponse from "@/utils/ApiResponse";

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
    page: Page
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

  // setting variant
  setVarient(varient: ScreenShotVaritents) {
    this.varient = varient;
  }

  // setting price Details
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
          "An unkown error occurred during navigation"
      );
    }
  }

  async takeScreenShot(browser: Browser, page: Page): Promise<string> {
    try {
      // waiting for main element to be visible.
      await this.waitForVisible(page);

      // calculating -- coordinates of the element which we want
      const clipCoords = await this.utils.calClippedCoords(
        page,
        this.website,
        this.varient,
        this?.priceDetails
      );

      const path = `./src/product_images/${this.varient.toLowerCase()}_${
        this.id
      }_image.png`;

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
          "An unknown error occurred during taking screenshot"
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
          "An unknown error occurred during launching browser"
      );
    }
  }

  private async waitForVisible(
    page: Page,
    retry = 1,
    maxRetry = 3
  ): Promise<void> {
    let selector = "";

    // getting selector based on >> website, variant
    if (this.website === "AMAZON") {
      selector =
        this.varient === "FULL"
          ? AmazonSelector.FULL.main
          : AmazonSelector.GROUPED.card;
    } else {
      selector =
        this.varient === "FULL"
          ? FlipkartSelector.FULL.main
          : FlipkartSelector.GROUPED.card;
    }

    try {
      await page.waitForSelector(selector, {
        visible: true,
        timeout: 1000 * 40,
      });
    } catch (err) {
      if (retry >= maxRetry) {
        throw new Error(
          `Element not found: ${selector} for ${this.website}, ${
            this.varient
          }, error: ${
            (err as Error)?.message ??
            "An unknown error occurred during waiting for main element"
          }`
        );
      }

      await page.reload();
      await this.waitForVisible(page, retry + 1, maxRetry);
    }
  }
}

export default ScreenShot;
