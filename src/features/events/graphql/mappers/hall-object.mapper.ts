import { TABLE_PRESETS } from "../../domain/catalog";

import type { HallObject, HallObjectType, TableShape } from "../../types";
import type { SaveEventHallObjectInput } from "../mutations/event-hall-object-save-all";
import type { EventHallObjectNode } from "../queries/event-hall-object-list";

const OBJECT_TYPES = new Set<HallObjectType>([
  "table",
  "stage",
  "entrance",
  "exit",
  "vip",
  "restricted",
  "dining",
  "walkway",
  "dance-floor",
  "buffet",
  "dj",
  "screen",
  "decoration",
  "flowers",
  "cake",
  "photo-area",
]);

const TABLE_SHAPES = new Set<TableShape>(["round", "rectangle", "square"]);

const API_OBJECT_TYPES = [
  "table",
  "stage",
  "entrance",
  "vipArea",
  "walkway",
  "buffet",
  "danceFloor",
] as const;

type ApiHallObjectType = (typeof API_OBJECT_TYPES)[number];

const TO_API_TYPE: Record<string, ApiHallObjectType> = {
  table: "table",
  stage: "stage",
  entrance: "entrance",
  vip: "vipArea",
  vipArea: "vipArea",
  walkway: "walkway",
  buffet: "buffet",
  "dance-floor": "danceFloor",
  danceFloor: "danceFloor",
};

const FROM_API_TYPE: Record<string, HallObjectType> = {
  table: "table",
  stage: "stage",
  entrance: "entrance",
  vip: "vip",
  vipArea: "vip",
  walkway: "walkway",
  buffet: "buffet",
  "dance-floor": "dance-floor",
  danceFloor: "dance-floor",
};

/** Persistable label: type string; tables are always `"table"` (no numbers). */
export function labelFromType(type: string): string {
  if (type === "table" || type === "Table") return "table";
  const api = TO_API_TYPE[type];
  if (api) return api;
  return type;
}

function toApiObjectType(type: string): ApiHallObjectType | string {
  const mapped = TO_API_TYPE[type];
  if (mapped) return mapped;
  const camel = type.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
  if ((API_OBJECT_TYPES as readonly string[]).includes(camel)) return camel;
  if ((API_OBJECT_TYPES as readonly string[]).includes(type)) return type;
  return type;
}

function asObjectType(value: string | null | undefined): HallObjectType {
  if (!value) return "decoration";
  const mapped = FROM_API_TYPE[value];
  if (mapped) return mapped;
  if (OBJECT_TYPES.has(value as HallObjectType)) return value as HallObjectType;
  return "decoration";
}

function asTableShape(value: string | null | undefined): TableShape {
  if (value && TABLE_SHAPES.has(value as TableShape)) return value as TableShape;
  return "round";
}

function asGeometry(value: string | null | undefined): "box" | "polygon" | "path" {
  if (value === "polygon" || value === "path" || value === "box") return value;
  return "box";
}

export function mapHallObjectFromApi(node: EventHallObjectNode): HallObject {
  const type = asObjectType(node.type);
  const shape = asTableShape(node.table?.shape);
  const preset = type === "table" ? TABLE_PRESETS[shape] : null;
  const transform = node.transform;
  const reservedSeats = node.table?.reservedSeats;

  return {
    id: node.id,
    type,
    label: node.label?.trim() || labelFromType(type),
    x: transform?.x ?? 0,
    y: transform?.y ?? 0,
    width: transform?.width ?? preset?.width ?? 80,
    height: transform?.height ?? preset?.height ?? 80,
    rotation: transform?.rotation ?? 0,
    zIndex: transform?.zIndex ?? 1,
    geometry: asGeometry(node.geometry),
    ...(node.templateId ? { templateId: node.templateId } : {}),
    ...(type === "table"
      ? {
          tableShape: shape,
          capacity: node.table?.capacity ?? 0,
          ...(reservedSeats != null ? { reservedSeats } : {}),
        }
      : {}),
  };
}

export function mapHallObjectToSaveInput(
  object: HallObject,
  options?: { includeId?: boolean },
): SaveEventHallObjectInput {
  const input: SaveEventHallObjectInput = {
    label: labelFromType(object.type),
    type: toApiObjectType(object.type),
    geometry: object.geometry ?? "box",
    transform: {
      x: object.x,
      y: object.y,
      width: object.width,
      height: object.height,
      rotation: object.rotation,
      zIndex: object.zIndex,
    },
  };

  if (options?.includeId && object.id) input.id = object.id;
  if (object.templateId) input.templateId = object.templateId;
  if (object.type === "table") {
    input.table = {
      capacity: object.capacity ?? 0,
      shape: object.tableShape ?? "round",
    };
  }

  return input;
}
