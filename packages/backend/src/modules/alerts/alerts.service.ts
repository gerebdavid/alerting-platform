import type { AlertCategory, AlertResponse, ChannelType, CreateAlertRequest, UpdateAlertRequest } from "@app/shared";
import { prisma } from "~/db/prisma.js";
import { HttpError } from "~/lib/http-error.js";

interface AlertWithCategory {
  id: string;
  userId: string;
  channel: string;
  isEnabled: boolean;
  createdAt: Date;
  category: { code: string; label: string };
}

function toAlertResponse(alert: AlertWithCategory): AlertResponse {
  return {
    id: alert.id,
    userId: alert.userId,
    categoryCode: alert.category.code as AlertCategory,
    categoryLabel: alert.category.label,
    channel: alert.channel as ChannelType,
    isEnabled: alert.isEnabled,
    createdAt: alert.createdAt.toISOString(),
  };
}

async function assertNoDuplicate(userId: string, categoryId: string, channel: string, excludeAlertId?: string) {
  const existing = await prisma.alert.findFirst({
    where: { userId, categoryId, channel, id: excludeAlertId ? { not: excludeAlertId } : undefined },
  });
  if (existing) {
    throw new HttpError(409, "An alert for this category and channel already exists");
  }
}

async function findOwnedAlert(userId: string, alertId: string) {
  const alert = await prisma.alert.findUnique({
    where: { id: alertId },
    include: { category: true },
  });
  if (!alert || alert.userId !== userId) {
    throw new HttpError(404, "Alert not found");
  }
  return alert;
}

export async function list(userId: string): Promise<AlertResponse[]> {
  const alerts = await prisma.alert.findMany({
    where: { userId },
    include: { category: true },
  });
  return alerts.map(toAlertResponse);
}

export async function create(userId: string, input: CreateAlertRequest): Promise<AlertResponse> {
  const category = await prisma.category.findUnique({ where: { code: input.categoryCode } });
  if (!category) {
    throw new HttpError(404, "Category not found");
  }

  await assertNoDuplicate(userId, category.id, input.channel);

  const alert = await prisma.alert.create({
    data: { userId, categoryId: category.id, channel: input.channel },
    include: { category: true },
  });
  return toAlertResponse(alert);
}

export async function update(
  userId: string,
  alertId: string,
  input: UpdateAlertRequest,
): Promise<AlertResponse> {
  const alert = await findOwnedAlert(userId, alertId);

  if (input.channel && input.channel !== alert.channel) {
    await assertNoDuplicate(userId, alert.categoryId, input.channel, alert.id);
  }

  const updated = await prisma.alert.update({
    where: { id: alertId },
    data: { channel: input.channel, isEnabled: input.isEnabled },
    include: { category: true },
  });
  return toAlertResponse(updated);
}

export async function remove(userId: string, alertId: string): Promise<void> {
  await findOwnedAlert(userId, alertId);
  await prisma.alert.delete({ where: { id: alertId } });
}
