import redis from "@/database/redis";
import { Queue } from "bullmq";

const queue = new Queue("main-queue", {
  connection: redis,
});

(async function () {
  await queue.setGlobalConcurrency(4);
})();

// if error error from main queue, try on more time by adding into failed queue.

export default queue;
