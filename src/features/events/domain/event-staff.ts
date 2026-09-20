import type { EventStaffRole } from "../graphql/queries/event-staff-list";

/**
 * Shared shape for a staff or front-desk member picked in the add dialog.
 * Directories are mapped to this before reaching the dialog.
 */
export type DirectoryMember = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

/** Row shape for the event staff data table (from `eventStaffList`). */
export type EventStaffRow = {
  id: string;
  eventId: string;
  role: EventStaffRole;
  name: string;
  email: string;
  phone: string;
  notes: string;
  createdAt: string;
};

export type { EventStaffRole };
