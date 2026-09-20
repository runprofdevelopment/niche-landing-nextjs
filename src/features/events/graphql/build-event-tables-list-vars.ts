import { type EventTableFilterInput, type EventTableSortInput } from "./queries/event-tables-list";

import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";

const SORT_FIELD_MAP: Record<string, string> = {
  name: "name",
  label: "label",
  capacity: "capacity",
  tableNumber: "tableNumber",
  code: "tableNumber",
};

type EventTableSearchFilterKey = "id" | "name" | "label";

const SEARCH_FIELD_MAP: Record<string, EventTableSearchFilterKey> = {
  name: "name",
  label: "label",
  id: "id",
};

export function buildEventTablesListFilters(
  columnFilters: ColumnFiltersState,
): EventTableFilterInput {
  const filters: EventTableFilterInput = {};

  for (const { id, value } of columnFilters) {
    if (value == null || value === "") continue;

    if (id === "tableNumber" || id === "capacity") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        if (id === "tableNumber") filters.tableNumber = parsed;
        else filters.capacity = parsed;
      }
      continue;
    }

    const field = SEARCH_FIELD_MAP[id];
    if (!field) continue;
    const raw = String(value).trim();
    if (!raw) continue;
    filters[field] = raw;
  }

  return filters;
}

export function buildEventTablesListSort(sorting: SortingState): EventTableSortInput[] | undefined {
  const entry = sorting.find((item) => SORT_FIELD_MAP[item.id]);
  if (!entry) return undefined;
  return [
    {
      field: SORT_FIELD_MAP[entry.id]!,
      order: entry.desc ? "desc" : "asc",
    },
  ];
}
