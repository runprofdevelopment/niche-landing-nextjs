import type { Hall, HallObject } from "../types";

/**
 * Layout-only payload for PUT .../halls/:hallId/layout.
 *
 * Coordinate space (shared FE/BE/mobile contract):
 *   layout.coordinateSystem = { width: 1400, height: 900 }
 * All boundary and object x/y/width/height are logical units on that canvas.
 * Backend must store and return the same coordinateSystem; clients scale to screen.
 *
 * Seats are never persisted — derived client-side from table capacity + shape.
 * See .cursor/plans/event_hall_api_contract_e754602c.plan.md
 */
export function buildHallLayoutSavePayload(hall: Hall, objects: HallObject[]) {
  return {
    hallId: hall.id,
    eventId: hall.eventId,
    name: hall.name,
    expectedGuests: hall.expectedGuests,
    boundary: hall.boundary,
    layout: {
      hallId: hall.id,
      coordinateSystem: hall.layout.coordinateSystem,
      seatAlgorithmVersion: 1 as const,
      objects: objects.map((object) => {
        const base = {
          id: object.id,
          type: object.type,
          label: object.label,
          x: object.x,
          y: object.y,
          width: object.width,
          height: object.height,
          rotation: object.rotation,
          zIndex: object.zIndex,
          geometry: object.geometry ?? "box",
          ...(object.points ? { points: object.points } : {}),
        };

        if (object.type !== "table") return base;

        return {
          ...base,
          templateId: object.templateId ?? null,
          tableShape: object.tableShape ?? "round",
          capacity: object.capacity ?? 0,
        };
      }),
    },
  };
}
