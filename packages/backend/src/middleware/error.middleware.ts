import type { NextFunction, Request, Response } from "express";
import { HttpError } from "~/lib/http-error.js";
import { logger } from "~/utils/logger.js";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  logger.error("unhandled error", err);
  res.status(500).json({ error: "Internal server error" });
}
