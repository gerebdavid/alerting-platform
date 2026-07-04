import type { EventSeverity, NotificationStatus } from "@app/shared";

export interface DispatchTarget {
  user: { id: string; email: string };
  event: { id: string; title: string; severity: EventSeverity };
}

export interface DispatchResult {
  status: NotificationStatus;
  detail: string;
}

export interface NotificationChannel {
  send(target: DispatchTarget): Promise<DispatchResult> | DispatchResult;
}
