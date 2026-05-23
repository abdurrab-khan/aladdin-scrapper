type ScreenshotWebsite = "AMAZON" | "FLIPKART";

type ScreenshotFullRequest = {
  id: string;
  url: string;
  website: ScreenshotWebsite;
};

type ScreenshotGroupedRequest = ScreenshotFullRequest & {
  priceDetails: {
    minPrice: number;
    maxPrice: number;
    discount: number;
  };
};

const SCREENSHOT_SERVICE_URL =
  process.env["SCREENSHOT_SERVICE_URL"] ||
  "http://localhost:4000/v1/screenshot";

const DEFAULT_TIMEOUT_MS = 10000;

const toScreenshotWebsite = (
  website: "amazon" | "flipkart"
): ScreenshotWebsite => {
  return website === "amazon" ? "AMAZON" : "FLIPKART";
};

const requestWithTimeout = async (
  url: string,
  init: RequestInit,
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<Response> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
};

const enqueueFullScreenshot = async (
  payload: ScreenshotFullRequest
): Promise<void> => {
  const response = await requestWithTimeout(
    `${SCREENSHOT_SERVICE_URL}/full`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Screenshot full enqueue failed: ${message}`);
  }
};

const enqueueGroupedScreenshot = async (
  payload: ScreenshotGroupedRequest
): Promise<void> => {
  const response = await requestWithTimeout(
    `${SCREENSHOT_SERVICE_URL}/group`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Screenshot grouped enqueue failed: ${message}`);
  }
};

export {
  enqueueFullScreenshot,
  enqueueGroupedScreenshot,
  toScreenshotWebsite,
};
