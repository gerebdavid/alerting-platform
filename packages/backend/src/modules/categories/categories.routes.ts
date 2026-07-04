import { Router } from "express";
import { requireAuth } from "~/middleware/auth.middleware.js";
import { listHandler } from "~/modules/categories/categories.controller.js";

export const categoriesRouter = Router();

categoriesRouter.use(requireAuth);
categoriesRouter.get("/", listHandler);
