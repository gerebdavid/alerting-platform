import type { z } from "zod";
import type { triggerMockEventSchema } from "../schemas/event.schema.js";
import type { AlertCategory, EventSeverity } from "../enums.js";
import type { NotificationLogEntry } from "./notification.dto.js";

export type TriggerMockEventRequest = z.infer<typeof triggerMockEventSchema>;

export interface EventResponse {
  id: string;
  categoryCode: AlertCategory;
  categoryLabel: string;
  title: string;
  description: string;
  severity: EventSeverity;
  sourceName: string;
  createdAt: string;
  triggeredById: string | null;
}

export interface TriggerMockEventResponse {
  event: EventResponse;
  notifications: NotificationLogEntry[];
}
