import { Role } from "@app/shared";
import { Router } from "express";
import { requireAuth } from "~/middleware/auth.middleware.js";
import { requireRole } from "~/middleware/role.middleware.js";
import { listHandler, updateHandler } from "~/modules/users/users.controller.js";

export const usersRouter = Router();

usersRouter.use(requireAuth, requireRole(Role.ADMIN));
usersRouter.get("/", listHandler);
usersRouter.patch("/:id", updateHandler);
