import "dotenv/config";
import App from "./api/app";
import "./jobs/bullmq/worker/worker";
import "./jobs/bullmq/worker/failed-worker";
import redis from "./providers/cache/redis";

const PORT = (process.env["PORT"] || 4000) as number;

redis.on("connect", () => {
  console.log("[Redis] Connected to the server");
  App.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running successfully on http://localhost:${PORT}`);
  });
});

redis.on("error", (err) => {
  console.error("[Redis] Error:", err);
});
