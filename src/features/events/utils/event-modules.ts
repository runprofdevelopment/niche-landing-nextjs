/**
 * Event modules status — backend owns done / pending / locked.
 *
 * Contract: GET /events/:eventId/modules
 * Mock today computes from local data; real API returns the same shape.
 */

import type {
  AbayaLabelBatch,
  EventStaffAssignment,
  Guest,
  Hall,
  Invitation,
  TimelineSlot,
} from "../types";

export type EventModuleId =
  | "hallSetup"
  | "eventTables"
  | "guestList"
  | "seatMapping"
  | "invitations"
  | "eventTimeline"
  | "checkInSystem"
  | "abayaLabels"
  | "eventsStaff";

export type EventModuleStatus = "done" | "pending" | "locked";

export type EventModuleApiItem = {
  id: EventModuleId;
  status: EventModuleStatus;
};

export type EventModulesApiResponse = {
  eventId: string;
  modules: EventModuleApiItem[];
  progress: {
    completed: number;
    total: number;
    percent: number;
  };
};

export type EventModuleContext = {
  eventId: string;
  halls: Hall[];
  guests: Guest[];
  invitation?: Invitation;
  timeline: TimelineSlot[];
  eventStaff: EventStaffAssignment[];
  abayaLabels?: AbayaLabelBatch;
};

export type EventModuleDefinition = {
  id: EventModuleId;
  titleKey: EventModuleId;
  descriptionKey: `${EventModuleId}Description`;
  requirementKey?: `${EventModuleId}Requirement`;
  /** Local fallback rules used only by the mock API until BE ships. */
  isComplete: (context: EventModuleContext) => boolean;
  isLocked?: (context: EventModuleContext) => boolean;
};

export const EVENT_MODULES: EventModuleDefinition[] = [
  {
    id: "hallSetup",
    titleKey: "hallSetup",
    descriptionKey: "hallSetupDescription",
    isComplete: ({ halls }) => halls.length > 0,
  },
  {
    id: "eventTables",
    titleKey: "eventTables",
    descriptionKey: "eventTablesDescription",
    requirementKey: "eventTablesRequirement",
    isComplete: ({ halls }) =>
      halls.some((hall) => hall.layout.objects.some((object) => object.type === "table")),
    isLocked: ({ halls }) => halls.length === 0,
  },
  {
    id: "guestList",
    titleKey: "guestList",
    descriptionKey: "guestListDescription",
    isComplete: ({ guests }) => guests.length > 0,
  },
  {
    id: "seatMapping",
    titleKey: "seatMapping",
    descriptionKey: "seatMappingDescription",
    requirementKey: "seatMappingRequirement",
    isComplete: ({ guests }) => guests.some((guest) => Boolean(guest.seatId)),
    isLocked: ({ halls }) => halls.length === 0,
  },
  {
    id: "invitations",
    titleKey: "invitations",
    descriptionKey: "invitationsDescription",
    isComplete: ({ invitation }) => Boolean(invitation),
  },
  {
    id: "eventTimeline",
    titleKey: "eventTimeline",
    descriptionKey: "eventTimelineDescription",
    isComplete: ({ timeline }) => timeline.length > 0,
  },
  {
    id: "checkInSystem",
    titleKey: "checkInSystem",
    descriptionKey: "checkInSystemDescription",
    requirementKey: "checkInSystemRequirement",
    isComplete: ({ guests }) => guests.some((guest) => Boolean(guest.checkedInAt)),
    isLocked: ({ guests }) => guests.length === 0,
  },
  {
    id: "abayaLabels",
    titleKey: "abayaLabels",
    descriptionKey: "abayaLabelsDescription",
    isComplete: ({ abayaLabels }) => Boolean(abayaLabels),
  },
  {
    id: "eventsStaff",
    titleKey: "eventsStaff",
    descriptionKey: "eventsStaffDescription",
    isComplete: ({ eventStaff }) => eventStaff.length > 0,
  },
];

/** Mock BE resolver — always pending until backend owns module status. */
export function fetchEventModules(context: EventModuleContext): EventModulesApiResponse {
  const modules: EventModuleApiItem[] = EVENT_MODULES.map((module) => ({
    id: module.id,
    status: "pending",
  }));

  return {
    eventId: context.eventId,
    modules,
    progress: { completed: 0, total: modules.length, percent: 0 },
  };
}

export function getEventModuleProgress(context: EventModuleContext) {
  return fetchEventModules(context).progress;
}

export function getModuleStatus(
  api: EventModulesApiResponse,
  id: EventModuleId,
): EventModuleStatus {
  return api.modules.find((module) => module.id === id)?.status ?? "pending";
}
