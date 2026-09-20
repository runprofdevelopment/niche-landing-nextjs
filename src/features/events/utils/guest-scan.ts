import { seatsForTable } from "../domain/geometry";

import type { Guest, Hall } from "../types";

export type ScanPayloadKind = "guest" | "table" | "unknown";

export type ParsedScanPayload = {
  kind: ScanPayloadKind;
  value: string;
};

/**
 * Normalize QR text. Prefer prefixed payloads for multi-use scanners:
 * - guest:{code|id}
 * - table:{tableId}
 * Unprefixed values are treated as guest codes for check-in compatibility.
 */
export function parseScanPayload(raw: string): ParsedScanPayload {
  const trimmed = raw.trim();
  if (!trimmed) return { kind: "unknown", value: "" };

  const separator = trimmed.indexOf(":");
  if (separator > 0) {
    const prefix = trimmed.slice(0, separator).toLowerCase();
    const value = trimmed.slice(separator + 1).trim();
    if (prefix === "guest" && value) return { kind: "guest", value };
    if (prefix === "table" && value) return { kind: "table", value };
  }

  return { kind: "guest", value: trimmed };
}

/** Resolve a scanned QR payload to a guest (code or id). */
export function findGuestByScanPayload(guests: Guest[], raw: string): Guest | undefined {
  const parsed = parseScanPayload(raw);
  if (parsed.kind !== "guest" || !parsed.value) return undefined;

  const value = parsed.value.toLowerCase();
  return guests.find((guest) => {
    const code = guest.code?.trim().toLowerCase();
    return code === value || guest.id.toLowerCase() === value;
  });
}

/** Find the hall that owns this guest (by hallId, then by tableId in layout). */
export function findHallForGuest(halls: Hall[], guest: Guest): Hall | undefined {
  if (guest.hallId) {
    const byId = halls.find((hall) => hall.id === guest.hallId);
    if (byId) return byId;
  }

  if (guest.tableId) {
    return halls.find((hall) => hall.layout.objects.some((object) => object.id === guest.tableId));
  }

  return undefined;
}

export function guestTableLabel(guest: Guest, hall?: Hall): string {
  if (guest.tableNumber) return guest.tableNumber;
  if (hall && guest.tableId) {
    const label = hall.layout.objects.find((object) => object.id === guest.tableId)?.label;
    if (label) return label;
  }
  return guest.tableId ?? "—";
}

export function guestSeatLabel(guest: Guest, hall?: Hall): string {
  if (guest.seatNumber) return guest.seatNumber;
  if (hall && guest.tableId && guest.seatId) {
    const table = hall.layout.objects.find((object) => object.id === guest.tableId);
    if (table?.type === "table") {
      const seat = seatsForTable(table).find((entry) => entry.id === guest.seatId);
      if (seat) return String(seat.number);
    }
  }
  return guest.seatId ?? "—";
}
