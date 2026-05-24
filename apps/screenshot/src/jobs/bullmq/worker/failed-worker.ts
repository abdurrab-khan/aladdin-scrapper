import redis from "@/providers/cache/redis";
import { Worker } from "bullmq";
import workerHandler from "../workerHandler";

const failedWorker = new Worker("failed-queue", workerHandler, {
  connection: redis,
});

export default failedWorker;
