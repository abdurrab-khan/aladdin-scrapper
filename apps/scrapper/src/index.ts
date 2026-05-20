import "dotenv/config";
import { configDotenv } from "dotenv";
configDotenv();

import { exit } from "process";
import App from "./server.js";
import redis from "./db/redis.js";

const PORT = Number(process.env["PORT"] || 8080);

redis
  .connect()
  .then(() => {
    App.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running successfully on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error(
      `⚠️ Existing the app -- ${err instanceof Error ? err.message : err} `,
    );
    exit(1);
  });
