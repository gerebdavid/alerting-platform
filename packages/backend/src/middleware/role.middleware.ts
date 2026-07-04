import type { NextFunction, Request, Response } from "express";
import type { Role } from "@app/shared";
import { HttpError } from "~/lib/http-error.js";

export function requireRole(role: Role) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new HttpError(401, "Not authenticated"));
    }
    if (req.user.role !== role) {
      return next(new HttpError(403, "Insufficient permissions"));
    }
    next();
  };
}
