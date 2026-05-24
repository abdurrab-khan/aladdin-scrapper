import { Router } from "express";
import takeGroupScreenShot from "../controllers/group-screenshot.controller.js";
import takeFullScreenShot from "../controllers/full-screenshot.controller.js";

const router = Router();

router.post("/group", takeGroupScreenShot);
router.post("/full", takeFullScreenShot);

export default router;
