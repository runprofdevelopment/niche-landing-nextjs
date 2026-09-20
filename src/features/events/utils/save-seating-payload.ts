/**
 * Seat-map save contract (FE ↔ BE).
 *
 * Request: assigned seats only for one hall (+ hallId).
 * Response: hall boundary + tables with geometry + guests on each table
 *           so web/mobile can edit and render without empty-seat rows.
 *
 * Coordinate space: logical units on a fixed canvas
 *   coordinateSystem = { width: 1400, height: 900 }
 * Backend must persist and return the same system; all boundary/table x,y
 * are relative to that canvas (not screen pixels, not meters).
 */

import { COORDINATE_SYSTEM } from "../domain/coordinate-system";

import type { HallBoundary } from "../types";

export type SaveSeatingAssignment = {
  guestId: string;
  tableId: string;
  seatId: string;
  seatNumber: number;
  familyName?: string;
};

/** PUT /events/:eventId/halls/:hallId/seating — request body */
export type SaveSeatingRequest = {
  action: "save_seating";
  eventId: string;
  hallId: string;
  /** Logical canvas — FE constant today; BE stores/echoes. */
  coordinateSystem: { width: number; height: number };
  assignments: SaveSeatingAssignment[];
};

export type SaveSeatingTableGuest = {
  guestId: string;
  name: string;
  familyName?: string;
  seatId: string;
  seatNumber: number;
};

export type SaveSeatingTable = {
  tableId: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  capacity: number;
  tableShape?: string;
  guests: SaveSeatingTableGuest[];
};

/** PUT/GET seating — response for edit + mobile */
export type SaveSeatingResponse = {
  eventId: string;
  hallId: string;
  coordinateSystem: { width: number; height: number };
  hallBoundary: HallBoundary;
  tables: SaveSeatingTable[];
};

type BuildRequestInput = {
  eventId: string;
  hallId: string;
  coordinateSystem?: { width: number; height: number };
  tables: Array<{
    id: string;
    label: string;
    capacity?: number;
    seats: Array<{ id: string; number: number }>;
  }>;
  guests: Array<{
    id: string;
    name: string;
    familyName?: string;
    seatId?: string;
    tableId?: string;
  }>;
};

type BuildResponseInput = {
  eventId: string;
  hallId: string;
  hallBoundary: HallBoundary;
  coordinateSystem?: { width: number; height: number };
  tables: Array<{
    id: string;
    label: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    capacity?: number;
    tableShape?: string;
  }>;
  guests: Array<{
    id: string;
    name: string;
    familyName?: string;
    seatId?: string;
    tableId?: string;
    hallId?: string;
  }>;
};

export function buildSaveSeatingRequest(input: BuildRequestInput): SaveSeatingRequest {
  const tableIds = new Set(input.tables.map((table) => table.id));
  const seatMeta = new Map<string, { tableId: string; seatNumber: number }>();
  for (const table of input.tables) {
    for (const seat of table.seats) {
      seatMeta.set(seat.id, { tableId: table.id, seatNumber: seat.number });
    }
  }

  const assignments: SaveSeatingAssignment[] = [];
  for (const guest of input.guests) {
    if (!guest.seatId || !guest.tableId || !tableIds.has(guest.tableId)) continue;
    const meta = seatMeta.get(guest.seatId);
    if (!meta) continue;
    assignments.push({
      guestId: guest.id,
      tableId: guest.tableId,
      seatId: guest.seatId,
      seatNumber: meta.seatNumber,
      ...(guest.familyName?.trim() ? { familyName: guest.familyName.trim() } : {}),
    });
  }

  return {
    action: "save_seating",
    eventId: input.eventId,
    hallId: input.hallId,
    coordinateSystem: input.coordinateSystem ?? { ...COORDINATE_SYSTEM },
    assignments,
  };
}

export function buildSaveSeatingResponse(input: BuildResponseInput): SaveSeatingResponse {
  const coordinateSystem = input.coordinateSystem ?? { ...COORDINATE_SYSTEM };
  const guestsByTable = new Map<string, SaveSeatingTableGuest[]>();

  for (const guest of input.guests) {
    if (!guest.seatId || !guest.tableId) continue;
    if (guest.hallId && guest.hallId !== input.hallId) continue;
    const match = guest.seatId.match(/-seat-(\d+)$/);
    const seatNumber = match ? Number(match[1]) : 0;
    const entry: SaveSeatingTableGuest = {
      guestId: guest.id,
      name: guest.name,
      seatId: guest.seatId,
      seatNumber,
      ...(guest.familyName?.trim() ? { familyName: guest.familyName.trim() } : {}),
    };
    const list = guestsByTable.get(guest.tableId) ?? [];
    list.push(entry);
    guestsByTable.set(guest.tableId, list);
  }

  const tables: SaveSeatingTable[] = input.tables.map((table) => ({
    tableId: table.id,
    label: table.label,
    x: table.x,
    y: table.y,
    width: table.width,
    height: table.height,
    rotation: table.rotation,
    capacity: table.capacity ?? 0,
    ...(table.tableShape ? { tableShape: table.tableShape } : {}),
    guests: (guestsByTable.get(table.id) ?? []).sort((a, b) => a.seatNumber - b.seatNumber),
  }));

  return {
    eventId: input.eventId,
    hallId: input.hallId,
    coordinateSystem,
    hallBoundary: input.hallBoundary,
    tables,
  };
}

/** @deprecated Use buildSaveSeatingRequest — kept name alias for older imports */
export const buildSaveSeatingPayload = buildSaveSeatingRequest;
