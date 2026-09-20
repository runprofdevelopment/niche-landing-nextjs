import { uid } from "../utils/uid";

import { TABLE_PRESETS } from "./catalog";

import type { HallObject, TableShape, TableTemplate } from "../types";

const DEFAULT_CAPACITY: Record<TableShape, number> = {
  round: 8,
  rectangle: 10,
  square: 4,
};

const DEFAULT_QUANTITY: Record<TableShape, number> = {
  round: 20,
  rectangle: 10,
  square: 5,
};

export type TableShapeLabels = Partial<Record<TableShape, string>>;

export function createDefaultTableTemplates(labels?: TableShapeLabels): TableTemplate[] {
  return (Object.keys(TABLE_PRESETS) as TableShape[]).map((shape) => ({
    id: uid("tpl"),
    name: labels?.[shape] ?? TABLE_PRESETS[shape].label,
    shape,
    capacity: DEFAULT_CAPACITY[shape],
    quantity: DEFAULT_QUANTITY[shape],
    ...TABLE_PRESETS[shape],
  }));
}

export function createTemplateFromPreset(
  shape: TableShape,
  options?: { quantity?: number; name?: string },
): TableTemplate {
  return {
    id: uid("tpl"),
    name: options?.name ?? TABLE_PRESETS[shape].label,
    shape,
    capacity: DEFAULT_CAPACITY[shape],
    quantity: options?.quantity ?? 5,
    ...TABLE_PRESETS[shape],
  };
}

export function librarySeatCapacity(templates: TableTemplate[]): number {
  return templates.reduce((sum, template) => sum + template.capacity * template.quantity, 0);
}

/** Match placed tables to templates when templateId is unreliable. */
export function tablePlacementKey(shape: TableShape, capacity: number): string {
  return `${shape}:${capacity}`;
}

export function countPlacedTablesByShapeCapacity(objects: HallObject[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const object of objects) {
    if (object.type !== "table") continue;
    const shape = object.tableShape ?? "round";
    const capacity = object.capacity ?? 0;
    const key = tablePlacementKey(shape, capacity);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

/**
 * Locks template quantities to tables already placed on the hall.
 * Matching is by shape + capacity (not templateId).
 */
export function applyPlacedObjectCountsToTemplates(
  templates: TableTemplate[],
  objects: HallObject[],
): TableTemplate[] {
  const remaining = countPlacedTablesByShapeCapacity(objects);

  return templates.map((template) => {
    const key = tablePlacementKey(template.shape, template.capacity);
    const placedForKey = remaining.get(key) ?? 0;
    remaining.set(key, 0);

    const locked = Math.max(template.createdObjectCount ?? 0, placedForKey);
    return {
      ...template,
      createdObjectCount: locked,
      quantity: Math.max(template.quantity, locked),
    };
  });
}

export type TableLibrarySlot = {
  templateId: string;
  slotIndex: number;
  shape: TableShape;
  capacity: number;
  label: string;
  placed: boolean;
};

/**
 * Library slots for the designer left panel / mobile tray.
 * Marks slots as placed by shape + capacity (templateId may be stale).
 */
export function buildTableLibrarySlots(
  templates: TableTemplate[],
  objects: HallObject[],
): TableLibrarySlot[] {
  const remainingPlaced = countPlacedTablesByShapeCapacity(objects);
  const slots: TableLibrarySlot[] = [];

  for (const template of templates) {
    const key = tablePlacementKey(template.shape, template.capacity);
    const placedForKey = remainingPlaced.get(key) ?? 0;
    const placedCount = Math.min(placedForKey, template.quantity);
    remainingPlaced.set(key, Math.max(0, placedForKey - placedCount));

    for (let index = 0; index < template.quantity; index += 1) {
      slots.push({
        templateId: template.id,
        slotIndex: index,
        shape: template.shape,
        capacity: template.capacity,
        label: "table",
        placed: index < placedCount,
      });
    }
  }

  return slots;
}

/** How many tables of this shape+capacity are already on the canvas. */
export function countPlacedForShapeCapacity(
  objects: HallObject[],
  shape: TableShape,
  capacity: number,
): number {
  return countPlacedTablesByShapeCapacity(objects).get(tablePlacementKey(shape, capacity)) ?? 0;
}

/** Total library quantity allowed for a shape+capacity across templates. */
export function libraryQuantityForShapeCapacity(
  templates: TableTemplate[],
  shape: TableShape,
  capacity: number,
): number {
  return templates
    .filter((template) => template.shape === shape && template.capacity === capacity)
    .reduce((sum, template) => sum + template.quantity, 0);
}
