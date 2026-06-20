import { configDotenv } from "dotenv";
import { Redis } from "ioredis";
configDotenv({
  path: "../../.env",
});

const redis = new Redis({
  port: parseInt(process.env["REDIS_PORT"] || "6379"),
  host: process.env["REDIS_HOST"] || "localhost",
  password: process.env["REDIS_PASSWORD"] || "",
  maxRetriesPerRequest: null,
  retryStrategy: (retries) => {
    if (retries > 10) {
      throw new Error("Max retries reached");
    }
    return Math.min(retries * 100, 3000);
  },
});

export default redis;
