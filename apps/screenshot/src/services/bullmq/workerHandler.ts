import { Job } from "bullmq";

import ScreenShot from "../screenshot/screenshot";
import {
  IGroupedScreenShotRequest,
  IFullScreenShotRequest,
  Website,
} from "@/types";
import failedQueue from "./queue/failed-queue";
import supabase from "@/database/supabase";

const workerHandler = async (
  job: Job<IGroupedScreenShotRequest | IFullScreenShotRequest>
) => {
  const { queueName, name, data } = job;

  let imageType: "Full" | "Group" = "Full";

  try {
    const screenshotHelper = new ScreenShot(
      data.id,
      data.url,
      data.website as Website
    );
    const { page, browser } = await screenshotHelper.navigateTo();

    if (name.startsWith("full")) {
      // setting varient as "FULL" >> for full screenshot
      screenshotHelper.setVarient("FULL");
      imageType = "Full";
    } else {
      // setting varient as "GROUPED" >> for grouped screenshot
      screenshotHelper.setVarient("GROUPED");
      imageType = "Group";

      // setting price details
      screenshotHelper.setPriceDetails(
        (data as IGroupedScreenShotRequest)?.priceDetails
      );
    }

    const path = await screenshotHelper.takeScreenShot(browser, page);
    await supabase.save_image(data.id, path, imageType);
  } catch (err) {
    // if job is from main-queue, add it to failed-queue
    if (queueName === "main-queue") {
      failedQueue.add(name, data);
      return;
    }

    console.error("Failed to take a screenshot: ", err);
    throw err;
  }
};

export default workerHandler;
