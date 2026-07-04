import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { z, ZodType } from "zod";
import { HttpError } from "./http-error.js";

interface HandlerSchemas {
  params?: ZodType;
  query?: ZodType;
  body?: ZodType;
}

type InferSchemas<S extends HandlerSchemas> = {
  [K in keyof S]: S[K] extends ZodType ? z.infer<S[K]> : never;
};

type HandlerCallback<S extends HandlerSchemas> = (
  req: Request,
  res: Response,
  data: InferSchemas<S>,
) => Promise<void> | void;

const SCHEMA_KEYS = ["params", "query", "body"] as const;

export function handler<S extends HandlerSchemas>(
  schemas: S,
  callback: HandlerCallback<S>,
): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = {} as Record<string, unknown>;
      for (const key of SCHEMA_KEYS) {
        const schema = schemas[key];
        if (!schema) continue;
        const parsed = schema.safeParse(req[key]);
        if (!parsed.success) {
          throw new HttpError(400, parsed.error.message);
        }
        data[key] = parsed.data;
      }
      await callback(req, res, data as InferSchemas<S>);
    } catch (err) {
      next(err);
    }
  };
}
