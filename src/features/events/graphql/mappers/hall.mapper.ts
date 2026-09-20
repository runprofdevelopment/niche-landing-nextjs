import { TABLE_PRESETS } from "../../domain/catalog";
import { COORDINATE_SYSTEM } from "../../domain/coordinate-system";
import { uid } from "../../utils/uid";

import type { BoundaryShape, Hall, HallBoundary, TableShape, TableTemplate } from "../../types";
import type { EventHallListNode } from "../queries/event-hall-list";
import type {
  EventHallBoundaryInput,
  EventHallBoundaryNode,
  EventHallTableTemplateInput,
  EventHallTableTemplateNode,
} from "../queries/event-hall-shared";

const BOUNDARY_SHAPES = new Set<BoundaryShape>(["rectangle", "square", "circle", "polygon"]);
const TABLE_SHAPES = new Set<TableShape>(["round", "rectangle", "square"]);

function asBoundaryShape(value: string | null | undefined): BoundaryShape {
  if (value && BOUNDARY_SHAPES.has(value as BoundaryShape)) return value as BoundaryShape;
  return "rectangle";
}

function asTableShape(value: string | null | undefined): TableShape {
  if (value && TABLE_SHAPES.has(value as TableShape)) return value as TableShape;
  return "round";
}

function asNaming(value: string | null | undefined): "numeric" | "alphabetical" {
  return value === "alphabetical" ? "alphabetical" : "numeric";
}

export function mapBoundaryFromApi(node: EventHallBoundaryNode | null | undefined): HallBoundary {
  if (!node) {
    return {
      shape: "rectangle",
      x: 60,
      y: 60,
      width: COORDINATE_SYSTEM.width - 120,
      height: COORDINATE_SYSTEM.height - 120,
      widthMeters: 30,
      heightMeters: 20,
    };
  }

  const shape = asBoundaryShape(node.shape);
  const mapped: HallBoundary = {
    shape,
    x: node.x,
    y: node.y,
    width: node.width,
    height: node.height,
  };

  if (node.widthMeters != null && node.widthMeters > 0) {
    mapped.widthMeters = node.widthMeters;
  }
  if (node.heightMeters != null && node.heightMeters > 0) {
    mapped.heightMeters = node.heightMeters;
  }

  if (shape === "circle" && node.radius != null && node.radius > 0) {
    const size = node.radius * 2;
    mapped.width = size;
    mapped.height = size;
  }

  if (shape === "polygon" && node.points?.length) {
    mapped.points = node.points.map((point) => ({ x: point.x, y: point.y }));
  }

  return mapped;
}

export function mapBoundaryToApi(boundary: HallBoundary): EventHallBoundaryInput {
  const input: EventHallBoundaryInput = {
    shape: boundary.shape,
    x: boundary.x,
    y: boundary.y,
    width: boundary.width,
    height: boundary.height,
  };

  if (boundary.widthMeters != null && boundary.widthMeters > 0) {
    input.widthMeters = boundary.widthMeters;
  }
  if (boundary.heightMeters != null && boundary.heightMeters > 0) {
    input.heightMeters = boundary.heightMeters;
  }

  if (boundary.shape === "circle") {
    input.radius = Math.round(Math.min(boundary.width, boundary.height) / 2);
  }

  if (boundary.shape === "polygon" && boundary.points?.length) {
    input.points = boundary.points.map((point) => ({ x: point.x, y: point.y }));
  }

  return input;
}

export function mapTableTemplateFromApi(node: EventHallTableTemplateNode): TableTemplate {
  const shape = asTableShape(node.tableShape);
  const preset = TABLE_PRESETS[shape];
  return {
    id: node.id && node.id.length > 0 ? node.id : uid("tpl"),
    name: preset.label,
    shape,
    capacity: node.capacity,
    quantity: node.numberOfTables,
    width: preset.width,
    height: preset.height,
    tableNaming: asNaming(node.tableNaming),
    seatNaming: asNaming(node.seatNaming),
    createdObjectCount: Math.max(0, node.createdObjectCount ?? 0),
  };
}

export function mapTableTemplateToApi(template: TableTemplate): EventHallTableTemplateInput {
  return {
    capacity: template.capacity,
    numberOfTables: template.quantity,
    tableShape: template.shape,
    tableNaming: asNaming(template.tableNaming),
    seatNaming: asNaming(template.seatNaming),
  };
}

/** Maps an `eventHallList` / `eventHallFind` node into the feature Hall model. */
export function mapEventHallFromApi(
  node: EventHallListNode,
  options?: {
    expectedGuests?: number;
    eventType?: string;
    existingObjects?: Hall["layout"]["objects"];
  },
): Hall {
  const coordinateSystem = node.coordinateSystem
    ? { width: node.coordinateSystem.width, height: node.coordinateSystem.height }
    : { ...COORDINATE_SYSTEM };

  const hall: Hall = {
    id: node.id,
    eventId: node.eventId,
    name: node.name,
    hallType: options?.eventType === "dining" ? "dining" : "wedding",
    expectedGuests: options?.expectedGuests ?? 0,
    boundary: mapBoundaryFromApi(node.boundary),
    tableTemplates: (node.tableTemplates ?? []).map(mapTableTemplateFromApi),
    layout: {
      hallId: node.id,
      coordinateSystem,
      objects: options?.existingObjects ?? [],
    },
  };

  if (options?.eventType) hall.eventType = options.eventType;

  return hall;
}
