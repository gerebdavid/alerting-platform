import { z } from "zod";
import { Role } from "../enums.js";

export const adminUserUpdateSchema = z.object({
  isActive: z.boolean().optional(),
  role: z.enum(Role).optional(),
});
