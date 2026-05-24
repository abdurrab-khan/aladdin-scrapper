import type { Request, Response } from "express";
import { ApiResponse, AsyncHandler } from "../../utils/index";
import { validateGroupedScreenshotRequest } from "../validations/screenshotValidation";
import { IGroupedScreenShotRequest } from "../../types/index";
import queue from "@/jobs/bullmq/queue/queue";

const takeGroupScreenShot = AsyncHandler(
  async (req: Request, res: Response) => {
    const { id, url, website, priceDetails } = validateGroupedScreenshotRequest(
      req.body as IGroupedScreenShotRequest,
    );

    console.log(`[API] Received group-screenshot request for ID: ${id}, URL: ${url}`);

    await queue.add("group-screenshot", {
      id,
      url,
      website,
      priceDetails,
    });

    console.log(`[API] Successfully queued group-screenshot for ID: ${id}`);

    res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        message: "Added into queue for taking grouped page screenshot",
      }),
    );
  },
);

export default takeGroupScreenShot;
