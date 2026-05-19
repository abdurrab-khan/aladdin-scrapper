import type { Request, Response } from "express";
import type CustomError from "../utils/ErrorHandler";

const errorMiddleware = (err: CustomError, _req: Request, res: Response) => {
  const statusCode = err.statusCode || 500;
  const message = err.message;

  res.status(statusCode).json({
    message,
    statusCode,
    success: false,
  });
};

export default errorMiddleware;
