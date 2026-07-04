import type { AuthResponse, LoginRequest, SignupRequest, UserResponse } from "@app/shared";
import { Role } from "@app/shared";
import { prisma } from "~/db/prisma.js";
import { HttpError } from "~/lib/http-error.js";
import { signToken } from "~/lib/jwt.js";
import { comparePassword, hashPassword } from "~/lib/password.js";

function toUserResponse(user: {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
}): UserResponse {
  return {
    id: user.id,
    email: user.email,
    role: user.role as Role,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function signup(input: SignupRequest): Promise<AuthResponse> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new HttpError(409, "Email is already registered");
  }

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: { email: input.email, passwordHash, role: Role.USER },
  });

  const token = signToken({ userId: user.id, role: user.role as Role });
  return { token, user: toUserResponse(user) };
}

export async function login(input: LoginRequest): Promise<AuthResponse> {
  const invalidCredentials = () => new HttpError(401, "Invalid email or password");

  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !user.isActive) {
    throw invalidCredentials();
  }

  const passwordMatches = await comparePassword(input.password, user.passwordHash);
  if (!passwordMatches) {
    throw invalidCredentials();
  }

  const token = signToken({ userId: user.id, role: user.role as Role });
  return { token, user: toUserResponse(user) };
}

export async function getCurrentUser(userId: string): Promise<UserResponse> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new HttpError(401, "User no longer exists");
  }
  return toUserResponse(user);
}
