import { loginSchema, signupSchema } from "@app/shared";
import type { Request, Response } from "express";
import { HttpError } from "~/lib/http-error.js";
import * as authService from "./auth.service.js";

export async function signupHandler(req: Request, res: Response) {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, parsed.error.message);
  }
  const result = await authService.signup(parsed.data);
  res.status(201).json(result);
}

export async function loginHandler(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, parsed.error.message);
  }
  const result = await authService.login(parsed.data);
  res.status(200).json(result);
}

export async function meHandler(req: Request, res: Response) {
  const user = await authService.getCurrentUser(req.user!.userId);
  res.status(200).json(user);
}
