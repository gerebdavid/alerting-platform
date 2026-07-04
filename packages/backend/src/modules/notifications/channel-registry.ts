import { ChannelType } from "@app/shared";
import { EmailChannel } from "~/modules/notifications/channels/email-channel.js";
import { SlackChannel } from "~/modules/notifications/channels/slack-channel.js";
import type { NotificationChannel } from "~/modules/notifications/notification-channel.js";

const channels: Record<ChannelType, NotificationChannel> = {
  [ChannelType.EMAIL]: new EmailChannel(),
  [ChannelType.SLACK]: new SlackChannel(),
};

export function getChannel(type: ChannelType): NotificationChannel {
  return channels[type];
}
