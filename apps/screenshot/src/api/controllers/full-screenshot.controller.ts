import type { Request, Response } from "express";
import { IFullScreenShotRequest } from "../../types/index";
import { ApiResponse, AsyncHandler } from "../../utils/index";
import { validateFullScreenshotRequest } from "../validations/screenshotValidation";
import queue from "@/jobs/bullmq/queue/queue";

const takeFullScreenShot = AsyncHandler(async (req: Request, res: Response) => {
  const { id, url, website } = validateFullScreenshotRequest(
    req?.body as IFullScreenShotRequest,
  );

  console.log(`[API] Received full-screenshot request for ID: ${id}, URL: ${url}`);

  await queue.add("full-screenshot", {
    id,
    url,
    website,
  });

  console.log(`[API] Successfully queued full-screenshot for ID: ${id}`);

  res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: "Added into queue for taking full page screenshot",
    }),
  );
});

export default takeFullScreenShot;
