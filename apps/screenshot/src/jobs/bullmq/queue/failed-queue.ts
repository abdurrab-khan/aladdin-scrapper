import redis from "@/providers/cache/redis";
import { Queue } from "bullmq";

const failedQueue = new Queue("failed-queue", {
  connection: redis,
});

(async function () {
  await failedQueue.setGlobalConcurrency(1);
})();

export default failedQueue;
