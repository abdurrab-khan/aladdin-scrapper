import { Job } from "bullmq";

import { FullScreenshotHandler } from "../../core/screenshot/handlers/full.handler";
import { GroupedScreenshotHandler } from "../../core/screenshot/handlers/grouped.handler";
import {
  IGroupedScreenShotRequest,
  IFullScreenShotRequest,
  Website,
} from "@/types";
import failedQueue from "./queue/failed-queue";
import supabase from "@/providers/database/supabase";

const workerHandler = async (
  job: Job<IGroupedScreenShotRequest | IFullScreenShotRequest>,
) => {
  const { queueName, name, data } = job;

  let imageType: "Full" | "Group" = "Full";
  console.log(
    `[Worker] Starting job ${job.id} - Type: ${name}, Product ID: ${data.id}`,
  );

  try {
    let path: string;

    if (name.startsWith("full")) {
      const handler = new FullScreenshotHandler();
      imageType = "Full";
      path = await handler.execute(data.id, data.url, data.website as Website);
    } else {
      const handler = new GroupedScreenshotHandler();
      imageType = "Group";
      path = await handler.execute(
        data.id,
        data.url,
        data.website as Website,
        (data as IGroupedScreenShotRequest).priceDetails,
      );
    }

    console.log(`[Worker] Screenshot captured at ${path} for ID: ${data.id}`);
    await supabase.save_image(data.id, path, imageType);
    console.log(
      `[Worker] Job ${job.id} completed successfully for ID: ${data.id}`,
    );
  } catch (err) {
    // if job is from main-queue, add it to failed-queue
    if (queueName === "main-queue") {
      console.log(
        `[Worker] Job ${job.id} failed, moving to failed-queue. Error: ${err instanceof Error ? err.message : err}`,
      );
      failedQueue.add(name, data);
      return;
    }

    console.error(`[Worker] Job ${job.id} critical failure: `, err);
    throw err;
  }
};

export default workerHandler;
