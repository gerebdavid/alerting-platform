import { Role } from "@app/shared";
import { Router } from "express";
import { requireAuth } from "~/middleware/auth.middleware.js";
import { requireRole } from "~/middleware/role.middleware.js";
import { triggerHandler } from "~/modules/events/events.controller.js";

export const eventsRouter = Router();

eventsRouter.use(requireAuth, requireRole(Role.ADMIN));
eventsRouter.post("/trigger", triggerHandler);
