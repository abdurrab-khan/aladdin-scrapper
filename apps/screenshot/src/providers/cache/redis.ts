import { Redis } from "ioredis";

const redis = new Redis({
  port: parseInt(process.env["REDIS_PORT"] || "6379"),
  host: process.env["REDIS_HOST"] || "localhost",
  password: process.env["REDIS_PASSWORD"] || "",
  maxRetriesPerRequest: null,
});

redis.on("connect", () => {
  console.log("[Redis] Connected to the server");
});

redis.on("error", (err) => {
  console.error("[Redis] Error:", err);
});

export default redis;
