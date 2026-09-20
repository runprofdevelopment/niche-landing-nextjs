import type { SeatInfo } from "../components/designer/HallCanvas";
import type { SaveEventSeatInput } from "../graphql/mutations/event-seat-save-all";
import type {
  EventGuestSeatMapGroup,
  EventGuestSeatMapMember,
} from "../graphql/queries/event-guest-seat-map-list";
import type { EventTableRosterSeat } from "../graphql/queries/event-table-roster";
import type { HallObject } from "../types";

type BuildSeatsByTableArgs = {
  tables: HallObject[];
  assignments: SaveEventSeatInput[];
  allMembers: Map<string, { id: string; name: string }>;
  /** Explicit reserved counts (from EventHallObjectList) — not from table click/roster. */
  reservedByTableId?: Record<string, number>;
};

/**
 * Canvas seat dots (taken = green).
 * Driven only by each table's `reservedSeats` + pending local assignments —
 * never by which table is selected / roster fetch.
 */
export function buildSeatsByTable({
  tables,
  assignments,
  allMembers,
  reservedByTableId,
}: BuildSeatsByTableArgs): Record<string, SeatInfo[]> {
  const map: Record<string, SeatInfo[]> = {};

  for (const table of tables) {
    const capacity = table.capacity ?? 0;
    const reserved = reservedByTableId?.[table.id] ?? table.reservedSeats ?? 0;
    const pendingByIndex = new Map(
      assignments.filter((seat) => seat.tableId === table.id).map((seat) => [seat.seatIndex, seat]),
    );

    const takenIndexes = new Set<number>();
    const namesByIndex = new Map<number, string>();

    for (const [index, seat] of pendingByIndex) {
      takenIndexes.add(index);
      const name = allMembers.get(seat.guestId)?.name;
      if (name) namesByIndex.set(index, name);
    }

    // Reserved seats are already-saved occupancy with unknown indexes.
    // Pending local assignments are *additional* — do not subtract them from reserved
    // or greens "move" (e.g. seat 1 clears when seat 2 is assigned).
    let remaining = Math.max(0, reserved);
    for (let index = 1; index <= capacity && remaining > 0; index += 1) {
      if (takenIndexes.has(index)) continue;
      takenIndexes.add(index);
      remaining -= 1;
    }

    map[table.id] = Array.from({ length: capacity }, (_, i) => {
      const number = i + 1;
      const guestName = namesByIndex.get(number);
      const taken = takenIndexes.has(number);
      return {
        id: `${table.id}-seat-${number}`,
        number,
        ...(guestName ? { guestName } : {}),
        ...(taken ? { taken: true } : {}),
      };
    });
  }

  return map;
}

export type TableRosterSlot = {
  key: string;
  seatIndex: number;
  seatId: string | null;
  guestId: string | null;
  guestName: string | null;
  pending: boolean;
  /** Saved occupancy without roster guest details (matches canvas reserved greens). */
  reservedPlaceholder?: boolean;
};

/**
 * Full seat list for the side panel: capacity slots, filled from roster + pending.
 * Empty seats are capacity − occupied (API often returns occupied seats only).
 * Handles null / 0-based seatIndex and reservedSeats when roster rows are missing.
 */
export function buildTableRosterSlots(args: {
  capacity: number;
  rosterSeats: EventTableRosterSeat[];
  pending: SaveEventSeatInput[];
  memberNames: Map<string, { id: string; name: string }>;
  reservedCount?: number;
}): TableRosterSlot[] {
  const { capacity, rosterSeats, pending, memberNames, reservedCount = 0 } = args;
  if (capacity <= 0) return [];

  const indexed = rosterSeats.filter((seat) => seat.seatIndex != null);
  const unindexed = rosterSeats.filter((seat) => seat.seatIndex == null);
  const minIndex =
    indexed.length > 0 ? Math.min(...indexed.map((seat) => seat.seatIndex as number)) : 1;
  // Some APIs return 0-based indexes; canvas / UI seats are 1..capacity.
  const zeroBased = indexed.length > 0 && minIndex === 0;

  const rosterByIndex = new Map(
    indexed.map((seat) => {
      const raw = seat.seatIndex as number;
      const seatIndex = zeroBased ? raw + 1 : raw;
      return [seatIndex, seat] as const;
    }),
  );
  const pendingByIndex = new Map(pending.map((seat) => [seat.seatIndex, seat]));

  const slots: TableRosterSlot[] = Array.from({ length: capacity }, (_, i) => {
    const seatIndex = i + 1;
    const rosterSeat = rosterByIndex.get(seatIndex);
    const pendingSeat = pendingByIndex.get(seatIndex);

    if (pendingSeat) {
      return {
        key: `pending-${pendingSeat.guestId}-${seatIndex}`,
        seatIndex,
        seatId: null,
        guestId: pendingSeat.guestId,
        guestName: memberNames.get(pendingSeat.guestId)?.name ?? null,
        pending: true,
      };
    }

    if (rosterSeat) {
      return {
        key: rosterSeat.id,
        seatIndex,
        seatId: rosterSeat.id,
        guestId: rosterSeat.guestId,
        guestName: rosterSeat.guest?.name ?? null,
        pending: false,
      };
    }

    return {
      key: `empty-${seatIndex}`,
      seatIndex,
      seatId: null,
      guestId: null,
      guestName: null,
      pending: false,
    };
  });

  // Place roster rows that had no seatIndex into the first free slots.
  let unindexedCursor = 0;
  for (let i = 0; i < slots.length && unindexedCursor < unindexed.length; i += 1) {
    const slot = slots[i]!;
    if (slot.guestId || slot.pending || slot.seatId) continue;
    const rosterSeat = unindexed[unindexedCursor]!;
    unindexedCursor += 1;
    slots[i] = {
      key: rosterSeat.id,
      seatIndex: slot.seatIndex,
      seatId: rosterSeat.id,
      guestId: rosterSeat.guestId,
      guestName: rosterSeat.guest?.name ?? null,
      pending: false,
    };
  }

  // Match canvas greens: if reservedSeats > roster rows returned, mark free slots taken.
  const rosterOccupied = slots.filter(
    (slot) => slot.seatId || (slot.guestId && !slot.pending),
  ).length;
  let remainingReserved = Math.max(0, reservedCount - rosterOccupied);
  for (let i = 0; i < slots.length && remainingReserved > 0; i += 1) {
    const slot = slots[i]!;
    if (slot.guestId || slot.pending || slot.seatId || slot.reservedPlaceholder) continue;
    slots[i] = {
      ...slot,
      key: `reserved-${slot.seatIndex}`,
      reservedPlaceholder: true,
    };
    remainingReserved -= 1;
  }

  return slots;
}

export function collectAssignedGuestIds(args: {
  assignments: SaveEventSeatInput[];
  rosterGuestIds: Array<string | null | undefined>;
  groups: EventGuestSeatMapGroup[];
  individuals: EventGuestSeatMapMember[];
}): Set<string> {
  const ids = new Set(args.assignments.map((seat) => seat.guestId));
  for (const guestId of args.rosterGuestIds) {
    if (guestId) ids.add(guestId);
  }
  for (const group of args.groups) {
    for (const member of group.members) {
      if (member.seatId) ids.add(member.id);
    }
  }
  for (const guest of args.individuals) {
    if (guest.seatId) ids.add(guest.id);
  }
  return ids;
}
