import "dotenv/config";
import { configDotenv } from "dotenv";
configDotenv({
  path: "../../.env",
});

import { exit } from "process";
import App from "./api/app.js";
import redis from "./providers/cache/redis.js";

const PORT = Number(process.env["PORT"] || 8080);

redis
  .connect()
  .then(() => {
    App.listen(PORT, "0.0.0.0", () => {
      console.log(`Server started on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error(
      `Application startup failed: ${err instanceof Error ? err.message : err}`,
    );
    exit(1);
  });
