import express from "express";
import { errorHandler } from "~/middleware/error.middleware.js";
import { authRouter } from "~/modules/auth/auth.routes.js";
import { logger } from "~/utils/logger.js";

export const app = express();

app.use(express.json());

app.get("/api/health", (_req, res) => {
  logger.info("health check hit");
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);

app.use(errorHandler);
