import { NotificationStatus } from "@app/shared";
import { logger } from "~/utils/logger.js";
import type { DispatchResult, DispatchTarget, NotificationChannel } from "~/modules/notifications/notification-channel.js";

export class SlackChannel implements NotificationChannel {
  send(target: DispatchTarget): DispatchResult {
    const message = `[${target.event.severity.toUpperCase()}] ${target.event.title}`;
    logger.info(`[mock-slack] DM to ${target.user.email}: ${message}`);
    return { status: NotificationStatus.SENT, detail: `Logged mock Slack DM to ${target.user.email}` };
  }
}
