import {
  type Page,
  type Browser,
  type LaunchOptions,
  type BrowserContext,
  type BrowserContextOptions,
  chromium,
} from "playwright";
import { generateRandomUserAgent } from "./helper.js";

interface GetContextReturnProps {
  page: Page;
  context: BrowserContext;
}

interface LaunchBrowserReturnProps extends GetContextReturnProps {
  browser: Browser;
}

class BrowserUtils {
  static async getContext(
    browser: Browser,
    contextOptions: BrowserContextOptions = {},
  ): Promise<GetContextReturnProps> {
    try {
      // initializing context
      const context = await browser.newContext({
        screen: { height: 1080, width: 1920 },
        viewport: { height: 1080, width: 1920 },
        userAgent: generateRandomUserAgent(),
        reducedMotion: "reduce",
        ...contextOptions,
      });

      // creating new page
      const page = await context.newPage();

      return {
        page,
        context,
      };
    } catch (err) {
      throw new Error(
        (err as Error)?.message ??
          "An error occurred during creating new context",
      );
    }
  }

  static async launchBrowser(
    browserOptions: LaunchOptions = {},
    contextOptions: BrowserContextOptions = {},
  ): Promise<LaunchBrowserReturnProps> {
    try {
      // launching browser
      const browser = await chromium.launch({
        headless: true,
        timeout: 60000,
        ...browserOptions,
      });

      // Check if the browser is launched successfully
      if (!browser || !browser.isConnected()) {
        if (browser) await browser.close();
        throw new Error("❌ Failed to launch the browser.");
      }

      // getting context and page
      const contextPage = await BrowserUtils.getContext(
        browser,
        contextOptions,
      );

      return {
        browser,
        ...contextPage,
      };
    } catch (err) {
      throw new Error(
        (err as Error)?.message ?? "An error occurred during lauching browser",
      );
    }
  }
}

export default BrowserUtils;
