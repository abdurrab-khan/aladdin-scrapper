import type { NextFunction, Request, Response } from "express";
import type CustomError from "../utils/ErrorHandler";

const errorMiddleware = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message;

  res.status(statusCode).json({
    message,
    statusCode,
    success: false,
  });
};

export default errorMiddleware;
