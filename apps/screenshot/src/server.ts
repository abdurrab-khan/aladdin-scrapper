import Express from "express";

const app = Express();

app.use(Express.json());
app.use(Express.static("../photos/"));

// ALL ROUTES
import ScreenShotRoute from "./route/screenshot.route.js";
import ErrorMiddleware from "./middleware/error.middleware.js";

const COMMON_PATH = "/v1";

app.use(COMMON_PATH + "/screenshot", ScreenShotRoute);

// ERROR MIDDLEWARE
app.use(ErrorMiddleware);

export default app;
