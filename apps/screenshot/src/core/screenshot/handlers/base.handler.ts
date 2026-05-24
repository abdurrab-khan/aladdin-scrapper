import puppeteer, { Browser, Page } from "puppeteer";
import { Website, IGroupedScreenShotRequest } from "@/types";
import { BaseProvider } from "../providers/base.provider";

export abstract class BaseScreenshotHandler {
  protected provider!: BaseProvider;

  protected async launchBrowser(): Promise<{ browser: Browser; page: Page }> {
    try {
      console.log("[Browser] Launching browser...");
      const browser = await puppeteer.launch({
        executablePath:
          "C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe",
        headless: true,
      });
      const page = await browser.newPage();

      if (!browser.connected) {
        throw new Error("Failed to launch the browser");
      }
      console.log("[Browser] Browser launched successfully.");

      await page.setViewport({
        height: 910,
        width: 1280,
        deviceScaleFactor: 1,
      });

      return { browser, page };
    } catch (error) {
      throw new Error(
        (error as Error)?.message ??
          "An unknown error occurred during launching browser",
      );
    }
  }

  protected async navigate(page: Page, url: string): Promise<void> {
    try {
      console.log(`[Browser] Navigating to: ${url}`);
      await page.goto(url, {
        timeout: 50000,
        waitUntil: "domcontentloaded",
      });
      console.log(`[Browser] Navigation to ${url} completed.`);
    } catch (error) {
      throw new Error(
        (error as Error)?.message ??
          "An unknown error occurred during navigation",
      );
    }
  }

  protected async waitForElement(
    page: Page,
    selector: string,
    retry = 1,
    maxRetry = 3,
  ): Promise<void> {
    try {
      await page.waitForSelector(selector, {
        visible: true,
        timeout: 1000 * 40,
      });
    } catch (err) {
      if (retry >= maxRetry) {
        throw new Error(
          `Element not found: ${selector}. Error: ${(err as Error)?.message}`,
        );
      }
      await page.reload();
      await this.waitForElement(page, selector, retry + 1, maxRetry);
    }
  }

  abstract execute(
    id: string,
    url: string,
    website: Website,
    priceDetails?: IGroupedScreenShotRequest["priceDetails"],
  ): Promise<string>;
}
