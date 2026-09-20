import type { EventRecord, EventStatus } from "../../types";
import type {
  EventModuleApiItem,
  EventModuleId,
  EventModuleStatus,
  EventModulesApiResponse,
} from "../../utils/event-modules";
import type { EventFindNode, EventSetupProgressNode, EventStatsNode } from "../queries/event-find";
import type { EventListRowNode, EventListStatus } from "../queries/event-list";
import type {
  CreateEventMutation,
  EventCreatedBy as ApiEventCreatedBy,
  EventQuery,
  EventsQuery,
  EventStatus as ApiEventStatus,
  UpdateEventMutation,
} from "@/lib/graphql/generated/graphql";

export type EventStatMetric = {
  count: number;
  /** Display-ready percent label from the API (includes `%`). */
  percent: string;
};

export type EventStats = {
  eventId: string;
  totalGuests: number;
  expected: EventStatMetric;
  invitationsSent: EventStatMetric;
  rsvpsConfirmed: EventStatMetric;
  checkedIn: EventStatMetric;
};

type ApiEvent =
  | EventsQuery["events"][number]
  | NonNullable<EventQuery["event"]>
  | CreateEventMutation["createEvent"]
  | UpdateEventMutation["updateEvent"];

function mapStatus(value: ApiEventStatus | string | null | undefined): EventStatus {
  const normalized = String(value ?? "").toLowerCase();
  if (normalized === "live" || normalized === "active") return "live";
  if (normalized === "completed" || normalized === "past") return "completed";
  return "upcoming";
}

function mapCreatedBy(
  value: ApiEventCreatedBy | string | null | undefined,
): EventRecord["createdBy"] {
  const normalized = String(value ?? "").toUpperCase();
  if (normalized === "APP" || normalized === "APPLICATION") return "App";
  return "Operational";
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function asOptionalNumber(value: unknown): number | undefined {
  return typeof value === "number" ? value : undefined;
}

function emptyMetric(): EventStatMetric {
  return { count: 0, percent: "0%" };
}

/** Pass through API percent as-is; backend already includes `%`. */
function mapStatPercent(value: string | number | null | undefined): string {
  if (value == null || value === "") return "0%";
  return String(value).trim() || "0%";
}

function mapMetric(
  node: { count: number; percent: string | number } | null | undefined,
): EventStatMetric {
  if (!node) return emptyMetric();
  return {
    count: node.count ?? 0,
    percent: mapStatPercent(node.percent),
  };
}

/** Maps backend setup-progress module keys → UI module ids. */
const SETUP_PROGRESS_MODULE_KEYS: Array<{
  apiKey: keyof Pick<
    EventSetupProgressNode,
    | "hallSetup"
    | "eventTables"
    | "guestList"
    | "seatMapping"
    | "invitations"
    | "timeline"
    | "checkIn"
    | "abayaLabels"
    | "eventStaff"
  >;
  moduleId: EventModuleId;
}> = [
  { apiKey: "hallSetup", moduleId: "hallSetup" },
  { apiKey: "eventTables", moduleId: "eventTables" },
  { apiKey: "guestList", moduleId: "guestList" },
  { apiKey: "seatMapping", moduleId: "seatMapping" },
  { apiKey: "invitations", moduleId: "invitations" },
  { apiKey: "timeline", moduleId: "eventTimeline" },
  { apiKey: "checkIn", moduleId: "checkInSystem" },
  { apiKey: "abayaLabels", moduleId: "abayaLabels" },
  { apiKey: "eventStaff", moduleId: "eventsStaff" },
];

/** Normalize backend language to `en` | `ar` (empty when unknown). */
function mapEventLanguage(value: string | null | undefined): string {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();
  if (normalized === "ar" || normalized === "arabic") return "ar";
  if (normalized === "en" || normalized === "english") return "en";
  return "";
}

/** Maps a GraphQL Event payload into the feature domain model. */
export function mapEventFromApi(event: ApiEvent): EventRecord {
  const mapped: EventRecord = {
    id: event.id,
    name: event.name,
    brideName: event.brideName,
    groomName: event.groomName,
    customerName: event.customerName,
    createdBy: mapCreatedBy(event.createdBy),
    date: event.date,
    startTime: event.startTime,
    endTime: event.endTime,
    venueName: event.venueName,
    expectedGuests: event.expectedGuests,
    invitationCount: event.invitationCount,
    status: mapStatus(event.status),
    eventType: "",
    language: mapEventLanguage(event.language),
    createdAt: String(event.createdAt),
  };

  const hallCapacity = asOptionalNumber(event.hallCapacity);
  if (hallCapacity !== undefined) mapped.hallCapacity = hallCapacity;

  const hallReference = asOptionalString(event.hallReference);
  if (hallReference) mapped.hallReference = hallReference;

  const address = asOptionalString(event.address);
  if (address) mapped.address = address;

  const googleMapsUrl = asOptionalString(event.googleMapsUrl);
  if (googleMapsUrl) mapped.googleMapsUrl = googleMapsUrl;

  return mapped;
}

/** Maps an `eventList` / `eventFind` payload into the feature domain model. */
function mapBackendEventRowFromApi(
  row: Pick<
    EventListRowNode,
    | "id"
    | "name"
    | "brideName"
    | "groomName"
    | "date"
    | "startTime"
    | "endTime"
    | "hallCapacity"
    | "numberOfGuests"
    | "language"
    | "address"
    | "hallRef"
    | "googleMapUrl"
    | "createdFrom"
    | "createdAt"
    | "createdBy"
    | "status"
    | "owner"
    | "ownerId"
    | "eventType"
  >,
): EventRecord {
  const hallRef = asOptionalString(row.hallRef);
  const address = asOptionalString(row.address);
  const ownerName = row.owner?.fullName?.trim() || "";
  const ownerId = asOptionalString(row.ownerId) ?? asOptionalString(row.owner?.id);
  const mapped: EventRecord = {
    id: row.id,
    name: row.name,
    brideName: row.brideName ?? "",
    groomName: row.groomName ?? "",
    customerName: ownerName,
    createdBy: mapCreatedBy(row.createdFrom ?? row.createdBy),
    date: row.date,
    startTime: row.startTime,
    endTime: row.endTime,
    venueName: hallRef || address || "",
    expectedGuests: row.numberOfGuests ?? 0,
    invitationCount: 0,
    status: mapStatus(row.status),
    eventType: row.eventType ?? "",
    language: mapEventLanguage(row.language),
    createdAt: String(row.createdAt ?? ""),
  };

  if (ownerId) mapped.ownerId = ownerId;

  const hallCapacity = asOptionalNumber(row.hallCapacity);
  if (hallCapacity !== undefined) mapped.hallCapacity = hallCapacity;
  if (hallRef) mapped.hallReference = hallRef;
  if (address) mapped.address = address;

  const googleMapUrl = asOptionalString(row.googleMapUrl);
  if (googleMapUrl) mapped.googleMapsUrl = googleMapUrl;

  return mapped;
}

/** Maps an `eventList` row into the feature domain model. */
export function mapEventListRowFromApi(row: EventListRowNode): EventRecord {
  return mapBackendEventRowFromApi(row);
}

/** Maps an `eventFind` payload into the feature domain model. */
export function mapEventFindFromApi(row: EventFindNode): EventRecord {
  return mapBackendEventRowFromApi(row);
}

/** Maps `eventSetupProgressFind` into the module-cards API shape. */
export function mapEventSetupProgressFromApi(
  row: EventSetupProgressNode | null | undefined,
): EventModulesApiResponse | undefined {
  if (!row) return undefined;

  const hallDone = Boolean(row.hallSetup?.completed);
  const guestsDone = Boolean(row.guestList?.completed);

  const modules: EventModuleApiItem[] = SETUP_PROGRESS_MODULE_KEYS.map(({ apiKey, moduleId }) => {
    const section = row[apiKey];
    const completed = Boolean(section?.completed);

    let status: EventModuleStatus = completed ? "done" : "pending";
    if (!completed) {
      if ((moduleId === "seatMapping" || moduleId === "eventTables") && !hallDone) {
        status = "locked";
      }
      if (moduleId === "checkInSystem" && !guestsDone) {
        status = "locked";
      }
    }

    return { id: moduleId, status };
  });

  return {
    eventId: row.eventId,
    modules,
    progress: {
      completed: row.completedCount ?? 0,
      total: row.totalCount ?? modules.length,
      percent: row.percentComplete ?? 0,
    },
  };
}

/** Maps `eventStatsFind` into dashboard stat cards. */
export function mapEventStatsFromApi(
  row: EventStatsNode | null | undefined,
): EventStats | undefined {
  if (!row) return undefined;

  return {
    eventId: row.eventId,
    totalGuests: row.totalGuests ?? 0,
    expected: mapMetric(row.expected),
    invitationsSent: mapMetric(row.invitationsSent),
    rsvpsConfirmed: mapMetric(row.rsvpsConfirmed),
    checkedIn: mapMetric(row.checkedIn),
  };
}

/**
 * Maps domain status to the legacy `Events` CRUD enum until that schema catches up.
 * `eventList` uses lowercase `upcoming` | `live` | `completed` directly.
 */
export function mapStatusToApi(status: EventStatus | undefined): ApiEventStatus | undefined {
  if (status === "live") return "ACTIVE";
  if (status === "upcoming") return "UPCOMING";
  if (status === "completed") return "PAST";
  return undefined;
}

export function mapStatusToListApi(status: EventStatus | undefined): EventListStatus | undefined {
  if (!status) return undefined;
  return status;
}

export function mapCreatedByToApi(
  createdBy: EventRecord["createdBy"] | undefined,
): ApiEventCreatedBy | undefined {
  if (createdBy === "App") return "APP";
  if (createdBy === "Operational") return "OPERATIONAL";
  return undefined;
}
