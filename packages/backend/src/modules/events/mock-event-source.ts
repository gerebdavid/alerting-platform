import { AlertCategory, EventSeverity } from "@app/shared";
import type { EventSource, GeneratedEvent } from "~/modules/events/event-source.js";

const SOURCE_NAMES: Record<AlertCategory, string> = {
  [AlertCategory.BREAKING_NEWS]: "Mock News Wire",
  [AlertCategory.MARKETS]: "Mock Market Feed",
  [AlertCategory.NATURAL_DISASTERS]: "Mock Seismic Network",
};

const TEMPLATES: Record<AlertCategory, Array<{ title: string; description: string }>> = {
  [AlertCategory.BREAKING_NEWS]: [
    {
      title: "Major policy announcement shakes global markets",
      description: "Government officials announced a sweeping policy change with wide-reaching implications.",
    },
    {
      title: "Unexpected leadership change at major institution",
      description: "A sudden leadership transition has sparked uncertainty across the sector.",
    },
  ],
  [AlertCategory.MARKETS]: [
    {
      title: "Sharp swing in benchmark index",
      description: "A benchmark market index moved sharply following overnight trading activity.",
    },
    {
      title: "Central bank signals rate shift",
      description: "A central bank hinted at an upcoming change to interest rate policy.",
    },
  ],
  [AlertCategory.NATURAL_DISASTERS]: [
    {
      title: "Seismic activity detected in monitored region",
      description: "Sensors recorded significant seismic activity in a densely populated area.",
    },
    {
      title: "Severe weather system approaching coastline",
      description: "Meteorologists are tracking a severe weather system expected to make landfall soon.",
    },
  ],
};

const SEVERITIES = Object.values(EventSeverity);

function randomFrom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

export class MockEventSource implements EventSource {
  generate(input: { categoryCode: AlertCategory; severity?: EventSeverity }): GeneratedEvent {
    const template = randomFrom(TEMPLATES[input.categoryCode]);
    return {
      title: template.title,
      description: template.description,
      severity: input.severity ?? randomFrom(SEVERITIES),
      sourceName: SOURCE_NAMES[input.categoryCode],
      payload: { simulated: true, generatedAt: new Date().toISOString() },
    };
  }
}
