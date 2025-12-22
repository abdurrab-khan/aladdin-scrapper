import type { Request, Response } from "express";
import { ApiResponse, AsyncHandler } from "../utils/index";
import { validateGroupedScreenshotRequest } from "../utils/requestValidator";
import { IGroupedScreenShotRequest } from "../types/index";
import queue from "@/services/bullmq/queue/queue";

const takeGroupScreenShot = AsyncHandler(
  async (req: Request, res: Response) => {
    const { id, url, website, priceDetails } = validateGroupedScreenshotRequest(
      req.body as IGroupedScreenShotRequest,
    );

    await queue.add("group-screenshot", {
      id,
      url,
      website,
      priceDetails,
    });

    res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        message: "Added into queue for taking grouped page screenshot",
      }),
    );
  },
);

export default takeGroupScreenShot;
