import type { Request, Response } from "express";
import { ApiResponse, AsyncHandler } from "../utils/index.js";
import ScreenShot from "../services/screenshot/screenshot.js";
import { Website } from "../types/index.js";

const takeFullScreenShot = AsyncHandler(async (req: Request, res: Response) => {
  const { url, website } = req.body;

  if (!url || !website) {
    throw new Error("Url is required to take a screenshot");
  }

  const screenshotHelper = new ScreenShot(url, website as Website, "FULL");
  const { page, browser } = await screenshotHelper.navigateTo();

  // let's taking screenshot
  const screenshot = await screenshotHelper.takeScreenShot(browser, page);

  await page.close();
  await browser.close();

  res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: "screenshot taken successfully",
      data: [
        {
          page: screenshot,
        },
      ],
    }),
  );
});

export default takeFullScreenShot;
