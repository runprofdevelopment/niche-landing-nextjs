import type { RoleFilterInput, RoleSortInput } from "./queries/role-list";
import type { DataTableDateRange } from "@/shared/components/table";
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";

const SORT_FIELD_MAP: Record<string, string> = {
  name: "name",
  description: "description",
  status: "status",
  createdAt: "createdAt",
};

const SEARCH_FIELD_MAP: Record<string, "name" | "description" | "id"> = {
  name: "name",
  description: "description",
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

export function buildRoleListFilters(options: {
  columnFilters: ColumnFiltersState;
}): RoleFilterInput {
  const filters: RoleFilterInput = {};

  for (const { id, value } of options.columnFilters) {
    if (value == null || value === "") continue;

    if (id === "status") {
      if (value === "active" || value === "inactive") {
        filters.status = value;
      }
      continue;
    }

    if (id === "createdAt") {
      const range = value as DataTableDateRange;
      const start = toUtcDateTime(range.from, "start");
      const end = toUtcDateTime(range.to, "end");
      if (!start && !end) continue;
      filters.createdAtRange = {
        start: start ?? null,
        end: end ?? null,
      };
      continue;
    }

    const field = SEARCH_FIELD_MAP[id];
    if (field) {
      filters[field] = String(value).trim();
    }
  }

  return filters;
}

export function buildRoleListSort(sorting: SortingState): RoleSortInput[] | undefined {
  const entry = sorting.find((item) => SORT_FIELD_MAP[item.id]);
  if (!entry) return undefined;
  const field = SORT_FIELD_MAP[entry.id];
  if (!field) return undefined;
  return [{ field, order: entry.desc ? "desc" : "asc" }];
}
