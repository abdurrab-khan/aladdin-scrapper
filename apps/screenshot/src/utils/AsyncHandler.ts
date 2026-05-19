import type { Request, Response, NextFunction } from "express";

type Function = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

function AsyncHandler(fn: Function) {
  return function (req: Request, res: Response, next: NextFunction) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export default AsyncHandler;
