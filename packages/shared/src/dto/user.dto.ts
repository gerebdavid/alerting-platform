import type { Role } from "../enums.js";

export interface UserResponse {
  id: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

export interface AdminUserUpdateRequest {
  isActive?: boolean;
  role?: Role;
}
