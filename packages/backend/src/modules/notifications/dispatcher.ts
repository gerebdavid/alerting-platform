import type { ChannelType, EventSeverity, NotificationLogEntry } from "@app/shared";
import { NotificationStatus } from "@app/shared";
import { prisma } from "~/db/prisma.js";
import { getChannel } from "~/modules/notifications/channel-registry.js";

interface DispatchableEvent {
  id: string;
  title: string;
  severity: EventSeverity;
}

interface DispatchableAlert {
  id: string;
  userId: string;
  channel: string;
  user: { email: string };
}

export async function dispatch(
  event: DispatchableEvent,
  matchedAlerts: DispatchableAlert[],
): Promise<NotificationLogEntry[]> {
  const entries: NotificationLogEntry[] = [];

  for (const alert of matchedAlerts) {
    const channel = getChannel(alert.channel as ChannelType);
    const target = { user: { id: alert.userId, email: alert.user.email }, event };

    let result: { status: NotificationStatus; detail: string };
    try {
      result = await channel.send(target);
    } catch (err) {
      result = { status: NotificationStatus.FAILED, detail: err instanceof Error ? err.message : String(err) };
    }

    const notification = await prisma.notification.create({
      data: {
        eventId: event.id,
        alertId: alert.id,
        userId: alert.userId,
        channel: alert.channel,
        status: result.status,
        detail: result.detail,
      },
    });

    entries.push({
      id: notification.id,
      eventId: notification.eventId,
      eventTitle: event.title,
      alertId: notification.alertId,
      userId: notification.userId,
      userEmail: alert.user.email,
      channel: notification.channel as ChannelType,
      status: notification.status as NotificationStatus,
      detail: notification.detail,
      createdAt: notification.createdAt.toISOString(),
    });
  }

  return entries;
}
