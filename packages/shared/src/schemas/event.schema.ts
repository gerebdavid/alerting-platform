import { z } from "zod";
import { AlertCategory, EventSeverity } from "../enums.js";

export const triggerMockEventSchema = z.object({
  categoryCode: z.nativeEnum(AlertCategory),
  severity: z.nativeEnum(EventSeverity).optional(),
});
