import { Router } from "express";
import { requireAuth } from "~/middleware/auth.middleware.js";
import { loginHandler, meHandler, signupHandler } from "~/modules/auth/auth.controller.js";

export const authRouter = Router();

authRouter.post("/signup", signupHandler);
authRouter.post("/login", loginHandler);
authRouter.get("/me", requireAuth, meHandler);
