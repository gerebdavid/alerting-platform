import { triggerMockEventSchema } from "@app/shared";
import { handler } from "~/lib/handler.js";
import * as eventsService from "~/modules/events/events.service.js";

export const triggerHandler = handler({ body: triggerMockEventSchema }, async (req, res, { body }) => {
  const result = await eventsService.triggerMockEvent(req.user!.userId, body);
  res.status(201).json(result);
});
