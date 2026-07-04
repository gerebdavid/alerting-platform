export interface MatchableAlert {
  id: string;
  userId: string;
  categoryId: string;
  channel: string;
  isEnabled: boolean;
}

export interface MatchableEvent {
  categoryId: string;
}

export function matchAlerts<T extends MatchableAlert>(alerts: T[], event: MatchableEvent): T[] {
  return alerts.filter((alert) => alert.categoryId === event.categoryId && alert.isEnabled);
}
