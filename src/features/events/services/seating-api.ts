/**
 * Mock seating API — replace with GraphQL/REST PUT
 *   PUT /events/:eventId/halls/:hallId/seating
 */

import { seatsForTable } from "../domain/geometry";
import { useAppStore } from "../store/events.store";
import {
  buildSaveSeatingRequest,
  buildSaveSeatingResponse,
  type SaveSeatingRequest,
  type SaveSeatingResponse,
} from "../utils/save-seating-payload";

/** Same path the real call will use, so logged payloads map 1:1 onto the endpoint. */
function seatingEndpoint(eventId: string, hallId: string) {
  return `/events/${eventId}/halls/${hallId}/seating`;
}

export async function saveHallSeating(
  eventId: string,
  hallId: string,
): Promise<{
  request: SaveSeatingRequest;
  response: SaveSeatingResponse;
}> {
  const state = useAppStore.getState();
  const hall = state.getHall(hallId);
  if (!hall || hall.eventId !== eventId) {
    throw new Error("Hall not found for event");
  }

  const tables = hall.layout.objects.filter((object) => object.type === "table");
  const eventGuests = state.guests.filter((guest) => guest.eventId === eventId);

  const request = buildSaveSeatingRequest({
    eventId,
    hallId,
    coordinateSystem: hall.layout.coordinateSystem,
    tables: tables.map((table) => ({
      id: table.id,
      label: table.label,
      ...(typeof table.capacity === "number" ? { capacity: table.capacity } : {}),
      seats: seatsForTable(table).map((seat) => ({ id: seat.id, number: seat.number })),
    })),
    guests: eventGuests.map((guest) => ({
      id: guest.id,
      name: guest.name,
      ...(guest.familyName ? { familyName: guest.familyName } : {}),
      ...(guest.seatId ? { seatId: guest.seatId } : {}),
      ...(guest.tableId ? { tableId: guest.tableId } : {}),
    })),
  });

  // Exactly what goes over the wire — `json` is copy-pasteable into an API client.
  console.warn("[event-seating:save:request]", {
    method: "PUT",
    endpoint: seatingEndpoint(eventId, hallId),
    summary: {
      tables: tables.length,
      guests: eventGuests.length,
      assignments: request.assignments.length,
      coordinateSystem: request.coordinateSystem,
    },
    body: request,
    json: JSON.stringify(request, null, 2),
  });

  // Persist hallId on assigned guests for this hall (mock BE write).
  const assignedIds = new Set(request.assignments.map((entry) => entry.guestId));
  const tableIds = new Set(tables.map((table) => table.id));

  useAppStore.setState((current) => ({
    guests: current.guests.map((guest) => {
      if (guest.eventId !== eventId) return guest;
      if (assignedIds.has(guest.id)) {
        return { ...guest, hallId };
      }
      // Guests previously tied to this hall but no longer in the snapshot → clear seat
      if (guest.hallId === hallId || (guest.tableId && tableIds.has(guest.tableId))) {
        if (!assignedIds.has(guest.id) && guest.seatId) {
          const { seatId: _s, tableId: _t, hallId: _h, ...rest } = guest;
          return rest;
        }
      }
      return guest;
    }),
  }));

  const refreshed = useAppStore.getState().guests.filter((guest) => guest.eventId === eventId);

  const response = buildSaveSeatingResponse({
    eventId,
    hallId,
    hallBoundary: hall.boundary,
    coordinateSystem: hall.layout.coordinateSystem,
    tables: tables.map((table) => ({
      id: table.id,
      label: table.label,
      x: table.x,
      y: table.y,
      width: table.width,
      height: table.height,
      rotation: table.rotation,
      ...(typeof table.capacity === "number" ? { capacity: table.capacity } : {}),
      ...(table.tableShape ? { tableShape: table.tableShape } : {}),
    })),
    guests: refreshed.map((guest) => ({
      id: guest.id,
      name: guest.name,
      ...(guest.familyName ? { familyName: guest.familyName } : {}),
      ...(guest.seatId ? { seatId: guest.seatId } : {}),
      ...(guest.tableId ? { tableId: guest.tableId } : {}),
      ...(guest.hallId ? { hallId: guest.hallId } : {}),
    })),
  });

  console.warn("[event-seating:save:response]", {
    endpoint: seatingEndpoint(eventId, hallId),
    summary: {
      tables: response.tables.length,
      seatedGuests: response.tables.reduce((total, table) => total + table.guests.length, 0),
    },
    body: response,
  });

  return { request, response };
}
