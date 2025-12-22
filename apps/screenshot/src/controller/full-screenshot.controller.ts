import type { Request, Response } from "express";
import { IFullScreenShotRequest } from "../types/index";
import { ApiResponse, AsyncHandler } from "../utils/index";
import { validateFullScreenshotRequest } from "../utils/requestValidator";
import queue from "@/services/bullmq/queue/queue";

const takeFullScreenShot = AsyncHandler(async (req: Request, res: Response) => {
  const { id, url, website } = validateFullScreenshotRequest(
    req?.body as IFullScreenShotRequest,
  );

  await queue.add("full-screenshot", {
    id,
    url,
    website,
  });

  res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: "Added into queue for taking full page screenshot",
    }),
  );
});

export default takeFullScreenShot;
