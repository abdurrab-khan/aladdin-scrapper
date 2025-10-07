import { chromium, type Browser, type LaunchOptions } from "playwright";

const getBrowser = async (option?: LaunchOptions): Promise<Browser> => {
  const browser = await chromium.launch({
    headless: true,
    timeout: 60000,
    ...option,
  });

  // Check if the browser is launched successfully
  if (!browser || !browser.isConnected()) {
    if (browser) await browser.close(); // Ensure browser is closed if it was partially launched

    throw new Error("❌ Failed to launch the browser.");
  }

  return browser;
};

export default getBrowser;
