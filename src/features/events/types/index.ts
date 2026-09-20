/**
 * Core domain types for the Hall & Seating feature.
 *
 * Geometry (x/y/width/height/points) is in LOGICAL designer units.
 * Physical hall size is widthMeters / heightMeters (source of truth).
 * Logical size is a uniform fit of meters into COORDINATE_SYSTEM.
 */

export type Point = { x: number; y: number };

export type BoundaryShape = "rectangle" | "square" | "circle" | "polygon";

export type HallBoundary = {
  shape: BoundaryShape;
  /** top-left of bounding box, logical units */
  x: number;
  y: number;
  /** logical size (fitted from meters into the designer workspace) */
  width: number;
  height: number;
  /** physical size in meters — source of truth when present */
  widthMeters?: number;
  heightMeters?: number;
  /** only for shape === "polygon" (absolute logical points) */
  points?: Point[];
};

export type TableShape = "round" | "rectangle" | "square";

export type TableTemplate = {
  id: string;
  name: string;
  shape: TableShape;
  capacity: number;
  quantity: number;
  /** default visual size presets in logical units */
  width: number;
  height: number;
  tableNaming?: "numeric" | "alphabetical";
  seatNaming?: "numeric" | "alphabetical";
  /** Tables of this template already placed in the hall. Backend-owned. */
  createdObjectCount?: number;
};

export type HallObjectType =
  | "table"
  | "stage"
  | "entrance"
  | "exit"
  | "vip"
  | "restricted"
  | "dining"
  | "walkway"
  | "dance-floor"
  | "buffet"
  | "dj"
  | "screen"
  | "decoration"
  | "flowers"
  | "cake"
  | "photo-area";

export type HallObject = {
  id: string;
  type: HallObjectType;
  label: string;
  /** center position in logical units */
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  /** table-only */
  templateId?: string;
  tableShape?: TableShape;
  capacity?: number;
  /** Seats already reserved on this table (seat map). Backend-owned. */
  reservedSeats?: number;
  /** @deprecated Local designer slot only — not sent to API. Prefer template quantity matching. */
  tableNumber?: number;
  /** free-drawn geometry (walkway path / custom area polygon), logical units */
  points?: Point[];
  geometry?: "box" | "polygon" | "path";
};

export type Seat = {
  id: string;
  tableId: string;
  number: number;
  /** absolute logical position, derived from table transform */
  x: number;
  y: number;
  rotation: number;
  guestId?: string;
};

export type HallLayout = {
  hallId: string;
  coordinateSystem: { width: number; height: number };
  objects: HallObject[];
};

export type HallType = "wedding" | "dining";

export type Hall = {
  id: string;
  eventId: string;
  name: string;
  hallType: HallType;
  /** Backend event-type enum id (e.g. wedding, engagement). */
  eventType?: string;
  expectedGuests: number;
  boundary: HallBoundary;
  tableTemplates: TableTemplate[];
  layout: HallLayout;
};

export type EventStatus = "upcoming" | "live" | "completed";

export type EventRecord = {
  id: string;
  name: string;
  brideName: string;
  groomName: string;
  customerName: string;
  /** Guest profile marked as owner for this event. */
  ownerId?: string;
  createdBy: "App" | "Operational";
  date: string;
  startTime: string;
  endTime: string;
  venueName: string;
  expectedGuests: number;
  hallCapacity?: number;
  hallReference?: string;
  address?: string;
  googleMapsUrl?: string;
  invitationCount: number;
  status: EventStatus;
  /** Backend `eventTypeEnum` id. */
  eventType: string;
  /** Event content language: `en` | `ar`. */
  language: string;
  createdAt: string;
};

export type GuestGroup = {
  id: string;
  eventId: string;
  name: string;
};

export type TimelineStatus = "pending" | "in-progress" | "completed";

export type TimelineSlot = {
  id: string;
  eventId: string;
  title: string;
  description?: string;
  /** 24h local time strings ("19:30") — the entry is scoped to the event's date. */
  start: string;
  end: string;
  status: TimelineStatus;
};

/**
 * Abaya label numbering for one event. Codes are derived from the range, so
 * only the configuration is stored — never the expanded list.
 */
export type AbayaLabelBatch = {
  id?: string;
  eventId: string;
  prefix: string;
  suffix: string;
  from: number;
  to: number;
  generatedAt: string;
  updatedAt?: string;
  totalLabels?: number;
  assignedLabels?: number;
  availableLabels?: number;
};

/** Which directory an assigned member was picked from. */
export type EventStaffKind = "staff" | "frontdesk";

/**
 * Assignment row only — the member's account lives in the staff or front-desk
 * directory, so removing an assignment never deletes the underlying member.
 */
export type EventStaffAssignment = {
  id: string;
  eventId: string;
  /** `StaffMember.id` or front-desk member id, depending on `kind`. */
  memberId: string;
  kind: EventStaffKind;
  notes?: string;
  assignedAt: string;
};

export type GuestGender = "male" | "female" | "NA";

export type GuestRsvpStatus = "confirmed" | "maybe" | "unconfirmed";

export type GuestStatus = "expected" | "confirmed" | "cancelled";

/** How the guest was added: alone, or as part of a named family party. */
export type GuestType = "individual" | "family";

export type Guest = {
  id: string;
  eventId: string;
  name: string;
  /** Family / party display name — seating groups by this string, not by id */
  familyName?: string;
  email?: string;
  phone?: string;
  countryCode?: string;
  gender?: GuestGender;
  abayaLabel?: string;
  abayaLabelId?: string;
  code?: string;
  rsvpStatus?: GuestRsvpStatus;
  status?: GuestStatus;
  numberOfCompanions?: number;
  companions?: Array<{ id: string; name?: string; email?: string }>;
  invitationSent?: boolean;
  checkedIn?: boolean;
  createdAt?: string;
  /**
   * @deprecated Prefer grouping by `familyName` in seating.
   * Kept for GraphQL `groupId` compatibility.
   */
  familyId?: string;
  hallId?: string;
  /** seat assignment — guests are NEVER linked to coordinates directly */
  seatId?: string;
  tableId?: string;
  /** Display values from `eventGuestList` (preferred over resolving ids locally). */
  seatNumber?: string;
  tableNumber?: string;
  qrCode?: { id: string; name?: string; publicUrl?: string };
  /** check-in / check-out audit (ISO timestamps) */
  checkedInAt?: string;
  checkedOutAt?: string;
};

export type InvitationLayout = "classic" | "modern";

export type Invitation = {
  eventId: string;
  /** Invitation content language (preview RTL when Arabic). */
  language?: "English" | "Arabic";
  layout: InvitationLayout;
  headingFont: string;
  bodyFont: string;
  /** Bride & groom name size in px */
  namesFontSize?: number;
  accent: string;
  background: string;
  brideName: string;
  groomName: string;
  title: string;
  message: string;
  dateLine: string;
  timeLine: string;
  venueLine: string;
  footer: string;
  /** uploaded background template (data URL) */
  templateImage?: string;
  /** fully designed invitation uploaded by the user (data URL) — exported as-is */
  readyImage?: string;
};
