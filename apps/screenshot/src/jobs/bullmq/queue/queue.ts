import redis from "@/providers/cache/redis";
import { Queue } from "bullmq";

const queue = new Queue("main-queue", {
  connection: redis,
});

(async function () {
  await queue.setGlobalConcurrency(5);
})();

export default queue;
