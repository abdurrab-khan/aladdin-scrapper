import "dotenv/config";

import App from "./server";
import "./services/bullmq/worker/worker";
import "./services/bullmq/worker/failed-worker";

const PORT = (process.env["PORT"] || 4000) as number;

App.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running successfully on http://localhost:${PORT}`);
});
