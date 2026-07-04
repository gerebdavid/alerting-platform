import type {
  AlertCategory,
  EventResponse,
  EventSeverity,
  TriggerMockEventRequest,
  TriggerMockEventResponse,
} from "@app/shared";
import { prisma } from "~/db/prisma.js";
import { HttpError } from "~/lib/http-error.js";
import type { EventSource } from "~/modules/events/event-source.js";
import { MockEventSource } from "~/modules/events/mock-event-source.js";

const eventSource: EventSource = new MockEventSource();

interface EventWithCategory {
  id: string;
  title: string;
  description: string;
  severity: string;
  sourceName: string;
  createdAt: Date;
  triggeredById: string | null;
  category: { code: string; label: string };
}

function toEventResponse(event: EventWithCategory): EventResponse {
  return {
    id: event.id,
    categoryCode: event.category.code as AlertCategory,
    categoryLabel: event.category.label,
    title: event.title,
    description: event.description,
    severity: event.severity as EventSeverity,
    sourceName: event.sourceName,
    createdAt: event.createdAt.toISOString(),
    triggeredById: event.triggeredById,
  };
}

export async function triggerMockEvent(
  triggeredById: string,
  input: TriggerMockEventRequest,
): Promise<TriggerMockEventResponse> {
  const category = await prisma.category.findUnique({ where: { code: input.categoryCode } });
  if (!category) {
    throw new HttpError(404, "Category not found");
  }

  const generated = eventSource.generate(input);

  const event = await prisma.event.create({
    data: {
      categoryId: category.id,
      title: generated.title,
      description: generated.description,
      severity: generated.severity,
      sourceName: generated.sourceName,
      payload: JSON.stringify(generated.payload),
      triggeredById,
    },
    include: { category: true },
  });

  // Epic 5 will replace this with real matching/dispatch results.
  return { event: toEventResponse(event), notifications: [] };
}
