import type { TimelineSlot } from "../types";

type MockTimelineEntry = Omit<TimelineSlot, "id" | "eventId">;

/**
 * Run-of-show demo data for the seeded event, so the timeline screen has
 * content before a backend exists. Mirrors `MOCK_EVENTS` (English only).
 */
const MOCK_TIMELINE_ENTRIES: MockTimelineEntry[] = [
  {
    title: "Venue Setup Begins",
    description:
      "Staff arrives to set up tables, chairs, stage, and decorations according to the layout plan.",
    start: "08:00",
    end: "10:00",
    status: "completed",
  },
  {
    title: "Floral & Decor Installation",
    description: "Florist team installs centerpieces, aisle arrangements, and stage décor.",
    start: "10:00",
    end: "11:30",
    status: "completed",
  },
  {
    title: "Sound & Lighting Check",
    description: "AV team tests sound system, microphones, projectors, and ambient lighting.",
    start: "11:30",
    end: "12:30",
    status: "completed",
  },
  {
    title: "Catering Setup",
    description: "Kitchen staff begins food preparation and buffet station arrangement.",
    start: "13:00",
    end: "15:00",
    status: "in-progress",
  },
  {
    title: "Photography Team Arrival",
    description: "Photographers and videographers arrive for equipment setup and pre-event shots.",
    start: "15:00",
    end: "16:00",
    status: "pending",
  },
  {
    title: "Guest Check-in Opens",
    description:
      "Welcome desk opens for guest registration, QR code scanning, and seating assignment.",
    start: "16:00",
    end: "17:00",
    status: "pending",
  },
  {
    title: "Ceremony Begins",
    description: "Main event ceremony starts with welcome speech and opening remarks.",
    start: "17:00",
    end: "18:30",
    status: "pending",
  },
  {
    title: "Dinner Reception",
    description: "Guests move to the reception hall for dinner service and entertainment.",
    start: "18:30",
    end: "21:00",
    status: "pending",
  },
];

export function mockTimelineForEvent(eventId: string): TimelineSlot[] {
  return MOCK_TIMELINE_ENTRIES.map((entry, index) => ({
    ...entry,
    id: `slot-mock-${eventId}-${index + 1}`,
    eventId,
  }));
}

export { MOCK_TIMELINE_ENTRIES };
