import express from "express";

const app = express();

app.use(express.json());
app.use(express.static("../photos/"));

// ALL ROUTES
import ScreenShotRoute from "./routes/screenshot.route.js";
import ErrorMiddleware from "./middlewares/error.middleware.js";

const COMMON_PATH = "/v1";

app.use(COMMON_PATH + "/screenshot", ScreenShotRoute);

// ERROR MIDDLEWARE
app.use(ErrorMiddleware);

export default app;
