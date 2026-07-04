import { NotificationStatus } from "@app/shared";
import { logger } from "~/utils/logger.js";
import type { DispatchResult, DispatchTarget, NotificationChannel } from "~/modules/notifications/notification-channel.js";

export class EmailChannel implements NotificationChannel {
  send(target: DispatchTarget): DispatchResult {
    const message = `[${target.event.severity.toUpperCase()}] ${target.event.title}`;
    logger.info(`[mock-email] to ${target.user.email}: ${message}`);
    return { status: NotificationStatus.SENT, detail: `Logged mock email to ${target.user.email}` };
  }
}
