import { Router } from "express";
import { requireAuth } from "~/middleware/auth.middleware.js";
import { createHandler, listHandler, removeHandler, updateHandler } from "~/modules/alerts/alerts.controller.js";

export const alertsRouter = Router();

alertsRouter.use(requireAuth);
alertsRouter.get("/", listHandler);
alertsRouter.post("/", createHandler);
alertsRouter.patch("/:id", updateHandler);
alertsRouter.delete("/:id", removeHandler);
