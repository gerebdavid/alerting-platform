import { loginSchema, signupSchema } from "@app/shared";
import { handler } from "~/lib/handler.js";
import * as authService from "./auth.service.js";

export const signupHandler = handler({ body: signupSchema }, async (_req, res, { body }) => {
  const result = await authService.signup(body);
  res.status(201).json(result);
});

export const loginHandler = handler({ body: loginSchema }, async (_req, res, { body }) => {
  const result = await authService.login(body);
  res.status(200).json(result);
});

export const meHandler = handler({}, async (req, res) => {
  const user = await authService.getCurrentUser(req.user!.userId);
  res.status(200).json(user);
});
