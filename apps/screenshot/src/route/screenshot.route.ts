import { Router } from "express";
import takeGroupScreenShot from "../controller/group-screenshot.controller.js";
import takeFullScreenShot from "../controller/full-screenshot.controller.js";

const router = Router();

router.post("/group", takeGroupScreenShot);
router.post("/full", takeFullScreenShot);

export default router;
