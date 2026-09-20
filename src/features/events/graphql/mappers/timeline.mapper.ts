import { resolveTimelineStatus } from "../../domain/timeline";

import type { TimelineSlot } from "../../types";
import type { EventTimelineFindNode } from "../queries/event-timeline-find";
import type { EventTimelineListNode } from "../queries/event-timeline-list";

/** Normalize API time strings (`HH:mm:ss` / ISO) to 24h `HH:mm`. */
function toTimeHm(value: string): string {
  const match = /^(\d{1,2}):(\d{2})/.exec(value.trim());
  if (match) {
    return `${match[1]!.padStart(2, "0")}:${match[2]}`;
  }
  const parsed = Date.parse(value);
  if (!Number.isNaN(parsed)) {
    const date = new Date(parsed);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }
  return value;
}

type TimelineApiNode = EventTimelineListNode | EventTimelineFindNode;

export function mapTimelineSlotFromApi(
  node: TimelineApiNode,
  options?: { eventDate?: string; now?: Date },
): TimelineSlot {
  const start = toTimeHm(node.startTime);
  const end = toTimeHm(node.endTime);
  const slot: TimelineSlot = {
    id: node.id,
    eventId: node.eventId,
    title: node.title,
    start,
    end,
    status: resolveTimelineStatus(start, end, {
      ...(options?.eventDate ? { eventDate: options.eventDate } : {}),
      ...(options?.now ? { now: options.now } : {}),
    }),
  };
  if (node.description) slot.description = node.description;
  return slot;
}
