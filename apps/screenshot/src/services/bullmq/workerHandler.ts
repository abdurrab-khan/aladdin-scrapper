import { Job } from "bullmq";

import ScreenShot from "../screenshot/screenshot";
import {
  IGroupedScreenShotRequest,
  IFullScreenShotRequest,
  Website,
} from "@/types";
import failedQueue from "./queue/failed-queue";

const workerHandler = async (
  job: Job<IGroupedScreenShotRequest | IFullScreenShotRequest>,
) => {
  const { queueName, name, data } = job;
  console.log("Queue name is: ", queueName);

  try {
    const screenshotHelper = new ScreenShot(
      data.id,
      data.url,
      data.website as Website,
    );
    const { page, browser } = await screenshotHelper.navigateTo();

    if (name.startsWith("full")) {
      // setting varient as "FULL" >> for full screenshot
      screenshotHelper.setVarient("FULL");
    } else {
      // setting varient as "GROUPED" >> for grouped screenshot
      screenshotHelper.setVarient("GROUPED");

      // setting price details
      screenshotHelper.setPriceDetails(
        (data as IGroupedScreenShotRequest)?.priceDetails,
      );
    }

    await screenshotHelper.takeScreenShot(browser, page);
  } catch (err) {
    // if failed at first time
    if (queueName === "main-queue") {
      failedQueue.add(name, data);
      return;
    }
    console.error("Failed to take a screenshot: ", err);
    throw err;
  }
};

export default workerHandler;
