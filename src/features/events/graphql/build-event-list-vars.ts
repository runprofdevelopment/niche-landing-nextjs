import { format } from "date-fns";

import type { EventStatus } from "../types";
import type { EventFilterInput, EventSortInput } from "./queries/event-list";
import type { DataTableDateRange } from "@/shared/components/table";
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";

const SORT_FIELD_MAP: Record<string, string> = {
  name: "name",
  brideName: "brideName",
  groomName: "groomName",
  date: "date",
  startTime: "startTime",
  hallReference: "hallRef",
  createdBy: "createdFrom",
  expectedGuests: "numberOfGuests",
  status: "status",
};

const SEARCH_FIELD_MAP: Record<string, keyof EventFilterInput> = {
  name: "name",
  brideName: "brideName",
  groomName: "groomName",
  hallReference: "hallRef",
};

function toDateString(value: Date | undefined): string | undefined {
  if (!value) return undefined;
  return format(value, "yyyy-MM-dd");
}

/**
 * Builds flat `EventFilterInput` for `eventList`.
 * Sends a JSON object of field → value (not an array of conditions).
 */
export function buildEventListFilters(options: {
  tab?: EventStatus | undefined;
  statuses?: EventStatus[] | undefined;
  columnFilters: ColumnFiltersState;
}): EventFilterInput {
  const filters: EventFilterInput = {};

  if (options.statuses && options.statuses.length > 0) {
    const [firstStatus, ...restStatuses] = options.statuses;
    if (firstStatus && restStatuses.length === 0) {
      filters.status = firstStatus;
    } else if (firstStatus) {
      filters.status = [firstStatus, ...restStatuses];
    }
  } else if (options.tab) {
    filters.status = options.tab;
  }

  for (const { id, value } of options.columnFilters) {
    if (value == null || value === "") continue;

    if (id === "date") {
      const range = value as DataTableDateRange;
      const start = toDateString(range.from);
      const end = toDateString(range.to);
      if (!start && !end) continue;
      filters.eventDateRange = {
        start: start ?? null,
        end: end ?? null,
      };
      continue;
    }

    if (id === "hallReference") {
      const refs = Array.isArray(value) ? value.map(String).filter(Boolean) : [String(value)];
      if (refs.length === 0) continue;
      const [firstRef] = refs;
      if (firstRef) filters.hallRef = firstRef;
      continue;
    }

    if (id === "createdBy") {
      filters.createdFrom = String(value) === "App" ? "APP" : "OPERATIONAL";
      continue;
    }

    const field = SEARCH_FIELD_MAP[id];
    if (field) {
      filters[field] = String(value) as never;
    }
  }

  return filters;
}

export function buildEventListSort(sorting: SortingState): EventSortInput[] | undefined {
  const entry = sorting.find((item) => SORT_FIELD_MAP[item.id]);
  if (!entry) return undefined;
  const field = SORT_FIELD_MAP[entry.id];
  if (!field) return undefined;
  return [{ field, order: entry.desc ? "desc" : "asc" }];
}
