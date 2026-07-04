import { createAlertSchema, updateAlertSchema } from "@app/shared";
import { z } from "zod";
import { handler } from "~/lib/handler.js";
import * as alertsService from "~/modules/alerts/alerts.service.js";

const idParamsSchema = z.object({ id: z.string() });

export const listHandler = handler({}, async (req, res) => {
  const alerts = await alertsService.list(req.user!.userId);
  res.status(200).json(alerts);
});

export const createHandler = handler({ body: createAlertSchema }, async (req, res, { body }) => {
  const alert = await alertsService.create(req.user!.userId, body);
  res.status(201).json(alert);
});

export const updateHandler = handler(
  { params: idParamsSchema, body: updateAlertSchema },
  async (req, res, { params, body }) => {
    const alert = await alertsService.update(req.user!.userId, params.id, body);
    res.status(200).json(alert);
  },
);

export const removeHandler = handler({ params: idParamsSchema }, async (req, res, { params }) => {
  await alertsService.remove(req.user!.userId, params.id);
  res.status(204).send();
});
