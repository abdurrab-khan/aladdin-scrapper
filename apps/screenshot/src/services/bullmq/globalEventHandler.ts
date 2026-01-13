import { QueueEvents } from "bullmq";

const globalQueue = new QueueEvents("globalListener");

globalQueue.on("completed", ({ jobId }) => {
  console.log("Completed Job id is: ", jobId);
});
