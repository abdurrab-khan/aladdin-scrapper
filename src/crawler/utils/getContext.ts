import type {
  Browser,
  BrowserContext,
  BrowserContextOptions,
  Page,
} from "playwright";
import { generateRandomUserAgent } from "./helper.js";

interface GetContextReturnType {
  page: Page;
  context: BrowserContext;
}

const getContext = async (
  browser: Browser,
  contextOptions?: BrowserContextOptions
): Promise<GetContextReturnType> => {
  try {
    // Create a new browser context with specified options
    const context = await browser.newContext({
      screen: { height: 1080, width: 1920 },
      viewport: { height: 1080, width: 1920 },
      userAgent: generateRandomUserAgent(),
      reducedMotion: "reduce",
      ...contextOptions,
    });

    // Initialize a new page in the context
    const page = await context.newPage();

    return { page, context };
  } catch (error) {
    throw new Error(`❌ Failed to create browser context or page: ${error}`);
  }
};

export default getContext;
