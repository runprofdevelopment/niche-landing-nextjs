import type { EventStaffRow } from "../../domain/event-staff";
import type { EventStaffListRowNode, EventStaffRole } from "../queries/event-staff-list";

const ROLES = new Set<EventStaffRole>(["staff", "frontdesk"]);

export function mapEventStaffRole(value: string | null | undefined): EventStaffRole {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();
  if (normalized === "frontdesk" || normalized === "front_desk" || normalized === "front-desk") {
    return "frontdesk";
  }
  // Legacy API / local store values.
  if (normalized === "security") return "frontdesk";
  return "staff";
}

export function isEventStaffRole(value: string): value is EventStaffRole {
  return ROLES.has(value as EventStaffRole);
}

export function mapEventStaffListRow(row: EventStaffListRowNode): EventStaffRow {
  return {
    id: row.id,
    eventId: row.eventId,
    role: mapEventStaffRole(row.role),
    name: row.fullName?.trim() || "",
    email: row.email?.trim() || "",
    phone: row.formattedPhoneNumber?.trim() || row.phoneNumber?.trim() || "",
    notes: row.note?.trim() || "",
    createdAt: row.createdAt ?? "",
  };
}
