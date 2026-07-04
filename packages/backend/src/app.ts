import express from "express";
import { logger } from "~/utils/logger.js";

export const app = express();

app.use(express.json());

app.get("/api/health", (_req, res) => {
  logger.info("health check hit");
  res.json({ status: "ok" });
});
