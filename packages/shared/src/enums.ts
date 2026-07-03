export const Role = {
  USER: "user",
  ADMIN: "admin",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const AlertCategory = {
  BREAKING_NEWS: "breaking-news",
  MARKETS: "markets",
  NATURAL_DISASTERS: "natural-disasters",
} as const;
export type AlertCategory = (typeof AlertCategory)[keyof typeof AlertCategory];

export const ChannelType = {
  EMAIL: "email",
  SLACK: "slack",
} as const;
export type ChannelType = (typeof ChannelType)[keyof typeof ChannelType];

export const EventSeverity = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
} as const;
export type EventSeverity = (typeof EventSeverity)[keyof typeof EventSeverity];

export const NotificationStatus = {
  SENT: "sent",
  FAILED: "failed",
  SKIPPED: "skipped",
} as const;
export type NotificationStatus = (typeof NotificationStatus)[keyof typeof NotificationStatus];
