import type { z } from "zod";
import type { createAlertSchema, updateAlertSchema } from "../schemas/alert.schema.js";
import type { AlertCategory, ChannelType } from "../enums.js";

export type CreateAlertRequest = z.infer<typeof createAlertSchema>;
export type UpdateAlertRequest = z.infer<typeof updateAlertSchema>;

export interface AlertResponse {
  id: string;
  userId: string;
  categoryCode: AlertCategory;
  categoryLabel: string;
  channel: ChannelType;
  isEnabled: boolean;
  createdAt: string;
}

export interface AdminAlertResponse extends AlertResponse {
  userEmail: string;
}
