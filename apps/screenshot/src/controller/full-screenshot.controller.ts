import type { Request, Response } from "express";
import { ApiResponse, AsyncHandler } from "../utils/index.js";

const takeFullScreenShot = AsyncHandler((req: Request, res: Response) => {
  res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: "screenshot taken successfully",
      data: [],
    }),
  );
});

export default takeFullScreenShot;
