import type { z } from "zod";
import type { loginSchema, signupSchema } from "../schemas/auth.schema.js";
import type { UserResponse } from "./user.dto.js";

export type SignupRequest = z.infer<typeof signupSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;

export interface AuthResponse {
  token: string;
  user: UserResponse;
}
