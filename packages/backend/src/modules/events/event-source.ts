import type { AlertCategory, EventSeverity } from "@app/shared";

export interface GeneratedEvent {
  title: string;
  description: string;
  severity: EventSeverity;
  sourceName: string;
  payload: Record<string, unknown>;
}

export interface EventSource {
  generate(input: { categoryCode: AlertCategory; severity?: EventSeverity }): GeneratedEvent;
}
