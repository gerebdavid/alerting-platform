import { z } from "zod";
import { AlertCategory, ChannelType } from "../enums.js";

export const createAlertSchema = z.object({
  categoryCode: z.enum(AlertCategory),
  channel: z.enum(ChannelType),
});

export const updateAlertSchema = z.object({
  channel: z.enum(ChannelType).optional(),
  isEnabled: z.boolean().optional(),
});
