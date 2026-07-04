import type { NextFunction, Request, Response } from "express";
import { HttpError } from "~/lib/http-error.js";
import { verifyToken } from "~/lib/jwt.js";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const [scheme, token] = header?.split(" ") ?? [];

  if (scheme !== "Bearer" || !token) {
    return next(new HttpError(401, "Missing or malformed Authorization header"));
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    next(new HttpError(401, "Invalid or expired token"));
  }
}
