import type { ChannelType, NotificationStatus } from "../enums.js";

export interface NotificationLogEntry {
  id: string;
  eventId: string;
  eventTitle: string;
  alertId: string;
  userId: string;
  userEmail: string;
  channel: ChannelType;
  status: NotificationStatus;
  detail: string;
  createdAt: string;
}
