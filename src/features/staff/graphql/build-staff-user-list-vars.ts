import type { StaffUserFilterInput, StaffUserSortInput } from "./queries/user-list";
import type { DataTableDateRange } from "@/shared/components/table";
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";

const SORT_FIELD_MAP: Record<string, string> = {
  name: "fullName",
  email: "email",
  phoneNumber: "formattedPhoneNumber",
  status: "status",
  createdAt: "createdAt",
};

const SEARCH_FIELD_MAP: Record<string, "fullName" | "email" | "id"> = {
  name: "fullName",
  email: "email",
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

/**
 * Builds list filters from the table UI.
 * Tab membership (active vs pending) is applied client-side from `roleIds` / `isOwner`
 * — see `isActiveStaffUser`.
 */
export function buildStaffUserListFilters(options: {
  columnFilters: ColumnFiltersState;
}): StaffUserFilterInput {
  const filters: StaffUserFilterInput = {};

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

    if (id === "roleId") {
      filters.roleIds = String(value).trim();
      continue;
    }

    if (id === "phoneNumber") {
      continue;
    }

    const field = SEARCH_FIELD_MAP[id];
    if (field) {
      filters[field] = String(value).trim();
    }
  }

  return filters;
}

export function buildStaffUserListSort(sorting: SortingState): StaffUserSortInput[] | undefined {
  const entry = sorting.find((item) => SORT_FIELD_MAP[item.id]);
  if (!entry) return undefined;
  const field = SORT_FIELD_MAP[entry.id];
  if (!field) return undefined;
  return [{ field, order: entry.desc ? "desc" : "asc" }];
}
