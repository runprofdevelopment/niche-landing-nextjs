import type { Guest, GuestGender, GuestRsvpStatus } from "../../types";
import type {
  CreateGuestMutation,
  EventGuestsQuery,
  GuestGender as ApiGuestGender,
  GuestRsvpStatus as ApiGuestRsvpStatus,
  UpdateGuestMutation,
} from "@/lib/graphql/generated/graphql";

type ApiGuest =
  | EventGuestsQuery["eventGuests"][number]
  | CreateGuestMutation["createGuest"]
  | UpdateGuestMutation["updateGuest"];

function mapGender(value: ApiGuestGender | null | undefined): GuestGender | undefined {
  if (value === "MALE") return "male";
  if (value === "FEMALE") return "female";
  return undefined;
}

function mapRsvp(value: ApiGuestRsvpStatus | null | undefined): GuestRsvpStatus | undefined {
  if (value === "CONFIRMED") return "confirmed";
  if (value === "MAYBE") return "maybe";
  if (value === "UNCONFIRMED") return "unconfirmed";
  return undefined;
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

/** Maps a GraphQL Guest payload into the feature domain model. */
export function mapGuestFromApi(guest: ApiGuest): Guest {
  const mapped: Guest = {
    id: guest.id,
    eventId: guest.eventId,
    name: guest.name,
  };

  const familyName = asOptionalString(guest.familyName);
  if (familyName) mapped.familyName = familyName;

  const email = asOptionalString(guest.email);
  if (email) mapped.email = email;

  const phone = asOptionalString(guest.phone);
  if (phone) mapped.phone = phone;

  const gender = mapGender(guest.gender);
  if (gender) mapped.gender = gender;

  const abayaLabel = asOptionalString(guest.abayaLabel);
  if (abayaLabel) mapped.abayaLabel = abayaLabel;

  const code = asOptionalString(guest.code);
  if (code) mapped.code = code;

  const rsvpStatus = mapRsvp(guest.rsvpStatus);
  if (rsvpStatus) mapped.rsvpStatus = rsvpStatus;

  const groupId = asOptionalString(guest.groupId);
  if (groupId) mapped.familyId = groupId;

  const hallId = asOptionalString("hallId" in guest ? guest.hallId : undefined);
  if (hallId) mapped.hallId = hallId;

  const seatId = asOptionalString(guest.seatId);
  if (seatId) mapped.seatId = seatId;

  const tableId = asOptionalString(guest.tableId);
  if (tableId) mapped.tableId = tableId;

  const checkedInAt = asOptionalString(guest.checkedInAt);
  if (checkedInAt) mapped.checkedInAt = checkedInAt;

  const checkedOutAt = asOptionalString(guest.checkedOutAt);
  if (checkedOutAt) mapped.checkedOutAt = checkedOutAt;

  return mapped;
}

export function mapGenderToApi(gender: GuestGender | undefined): ApiGuestGender | undefined {
  if (gender === "male") return "MALE";
  if (gender === "female") return "FEMALE";
  return undefined;
}

export function mapRsvpToApi(status: GuestRsvpStatus | undefined): ApiGuestRsvpStatus | undefined {
  if (status === "confirmed") return "CONFIRMED";
  if (status === "maybe") return "MAYBE";
  if (status === "unconfirmed") return "UNCONFIRMED";
  return undefined;
}

const GUEST_STATUSES = new Set(["expected", "confirmed", "cancelled"]);
const GUEST_GENDERS = new Set(["male", "female", "NA"]);

export function mapEventGuestListRow(row: {
  id: string;
  eventId: string;
  name: string | null;
  email: string | null;
  gender: string | null;
  phoneNumber: string | null;
  countryCode: string | null;
  formattedPhoneNumber: string | null;
  status: string | null;
  numberOfCompanions: number | null;
  companions?: Array<{ id: string; name?: string | null; email: string | null }> | null;
  invitationSent?: boolean | null;
  checkedIn?: boolean | null;
  qrCode?: { id: string; name: string | null; publicUrl: string | null } | null;
  abayaLabelId?: string | null;
  abayaLabel?: { id: string } | null;
  code?: string | null;
  seatId?: string | null;
  seatNumber?: string | number | null;
  tableNumber?: string | number | null;
  createdAt: string | null;
}): Guest {
  const gender =
    row.gender && GUEST_GENDERS.has(row.gender) ? (row.gender as Guest["gender"]) : undefined;
  const status =
    row.status && GUEST_STATUSES.has(row.status) ? (row.status as Guest["status"]) : undefined;
  const mapped: Guest = {
    id: row.id,
    eventId: row.eventId,
    name: row.name?.trim() || "",
    numberOfCompanions: Math.max(0, row.numberOfCompanions ?? 0),
    invitationSent: Boolean(row.invitationSent),
    checkedIn: Boolean(row.checkedIn),
  };
  if (row.email) mapped.email = row.email;
  // Prefer national `phoneNumber`; `countryCode` is stored separately for the dial dropdown.
  const phone = row.phoneNumber || row.formattedPhoneNumber;
  if (phone) mapped.phone = phone;
  if (row.countryCode) mapped.countryCode = row.countryCode;
  if (gender) mapped.gender = gender;
  if (status) mapped.status = status;
  if (row.createdAt) mapped.createdAt = row.createdAt;
  if (row.code) mapped.code = row.code;
  else if (row.qrCode?.name) mapped.code = row.qrCode.name;
  if (row.seatId) mapped.seatId = row.seatId;
  const seatNumber = asOptionalString(
    row.seatNumber != null && row.seatNumber !== "" ? String(row.seatNumber) : undefined,
  );
  if (seatNumber) mapped.seatNumber = seatNumber;
  const tableNumber = asOptionalString(
    row.tableNumber != null && row.tableNumber !== "" ? String(row.tableNumber) : undefined,
  );
  if (tableNumber) mapped.tableNumber = tableNumber;
  if (row.abayaLabelId) mapped.abayaLabelId = row.abayaLabelId;
  if (row.abayaLabel?.id) mapped.abayaLabel = row.abayaLabel.id;
  if (row.companions?.length) {
    mapped.companions = row.companions.map((companion) => ({
      id: companion.id,
      ...(companion.name?.trim() ? { name: companion.name.trim() } : {}),
      ...(companion.email ? { email: companion.email } : {}),
    }));
  }
  if (row.qrCode?.id) {
    mapped.qrCode = {
      id: row.qrCode.id,
      ...(row.qrCode.name ? { name: row.qrCode.name } : {}),
      ...(row.qrCode.publicUrl ? { publicUrl: row.qrCode.publicUrl } : {}),
    };
  }
  return mapped;
}
