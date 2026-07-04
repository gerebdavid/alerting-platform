import type { AdminUserUpdateRequest, Role, UserResponse } from "@app/shared";
import { prisma } from "~/db/prisma.js";
import { HttpError } from "~/lib/http-error.js";

interface UserRow {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
}

function toUserResponse(user: UserRow): UserResponse {
  return {
    id: user.id,
    email: user.email,
    role: user.role as Role,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function list(): Promise<UserResponse[]> {
  const users = await prisma.user.findMany();
  return users.map(toUserResponse);
}

export async function update(
  actingAdminId: string,
  targetUserId: string,
  input: AdminUserUpdateRequest,
): Promise<UserResponse> {
  if (targetUserId === actingAdminId) {
    throw new HttpError(400, "You cannot modify your own account");
  }

  const existing = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!existing) {
    throw new HttpError(404, "User not found");
  }

  const updated = await prisma.user.update({
    where: { id: targetUserId },
    data: { isActive: input.isActive, role: input.role },
  });
  return toUserResponse(updated);
}
