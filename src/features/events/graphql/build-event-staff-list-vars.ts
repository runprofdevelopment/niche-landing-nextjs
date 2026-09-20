import { isEventStaffRole } from "./mappers/event-staff.mapper";
import { type EventStaffFilterInput, type EventStaffSortInput } from "./queries/event-staff-list";

import type { DataTableDateRange } from "@/shared/components/table";
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";

const SORT_FIELD_MAP: Record<string, string> = {
  name: "fullName",
  fullName: "fullName",
  email: "email",
  phone: "phoneNumber",
  role: "role",
  notes: "note",
  note: "note",
  createdAt: "createdAt",
};

const SEARCH_FIELD_MAP: Record<string, keyof EventStaffFilterInput> = {
  name: "fullName",
  fullName: "fullName",
  email: "email",
  phone: "phoneNumber",
  id: "id",
};

function toUtcDateTime(value: Date | undefined, bound: "start" | "end"): string | undefined {
  if (!value) return undefined;
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  const time = bound === "start" ? "00:00:00" : "23:59:59";
  return `${year}-${month}-${day}T${time}Z`;
}

export function buildEventStaffListFilters(
  columnFilters: ColumnFiltersState,
): EventStaffFilterInput {
  const filters: EventStaffFilterInput = {};

  for (const { id, value } of columnFilters) {
    if (value == null || value === "") continue;

    if (id === "createdAt") {
      const range = value as DataTableDateRange;
      const start = toUtcDateTime(range.from, "start");
      const end = toUtcDateTime(range.to, "end");
      if (!start && !end) continue;
      filters.createdAtRange = { start: start ?? null, end: end ?? null };
      continue;
    }

    if (id === "role") {
      const role = String(value);
      if (isEventStaffRole(role)) filters.role = role;
      continue;
    }

    const field = SEARCH_FIELD_MAP[id];
    if (!field) continue;
    const raw = String(value).trim();
    if (!raw) continue;
    if (field === "phoneNumber") {
      filters.phoneNumber = raw.replace(/[^\d+]/g, "");
    } else if (field === "email" || field === "fullName" || field === "id") {
      filters[field] = raw;
    }
  }

  return filters;
}

export function buildEventStaffListSort(sorting: SortingState): EventStaffSortInput[] | undefined {
  const entry = sorting.find((item) => SORT_FIELD_MAP[item.id]);
  if (!entry) return undefined;
  return [
    {
      field: SORT_FIELD_MAP[entry.id]!,
      order: entry.desc ? "desc" : "asc",
    },
  ];
}
