import type { Request, Response } from "express";
import type CustomError from "../utils/ErrorHandler.js";

const errorMiddleware = (err: CustomError, req: Request, res: Response) => {
  const statusCode = err.statusCode || 500;
  const message = err.message;

  res.status(200).json({
    message,
    statusCode,
    success: false,
  });
};

export default errorMiddleware;
