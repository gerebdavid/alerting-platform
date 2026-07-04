import express from "express";
import { errorHandler } from "~/middleware/error.middleware.js";
import { alertsRouter } from "~/modules/alerts/alerts.routes.js";
import { authRouter } from "~/modules/auth/auth.routes.js";
import { categoriesRouter } from "~/modules/categories/categories.routes.js";
import { logger } from "~/utils/logger.js";

export const app = express();

app.use(express.json());

app.get("/api/health", (_req, res) => {
  logger.info("health check hit");
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/alerts", alertsRouter);

app.use(errorHandler);
