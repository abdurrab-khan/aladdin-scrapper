import { Worker } from "bullmq";
import redis from "@/providers/cache/redis";
import workerHandler from "../workerHandler";

const worker = new Worker("main-queue", workerHandler, {
  connection: redis,
});

export default worker;
