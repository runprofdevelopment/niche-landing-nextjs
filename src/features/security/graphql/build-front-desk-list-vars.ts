import type { SecurityMemberStatus } from "../types";
import type { FrontDeskFilterInput, FrontDeskSortInput } from "./queries/front-desk-list";
import type { DataTableDateRange } from "@/shared/components/table";
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";

export type FrontDeskListTab = "active" | "pending";

const ACTIVE_TAB_STATUSES: SecurityMemberStatus[] = ["active", "inactive"];

const SORT_FIELD_MAP: Record<string, string> = {
  name: "fullName",
  email: "email",
  phone: "formattedPhoneNumber",
  status: "status",
};

const SEARCH_FIELD_MAP: Record<string, "fullName" | "email" | "formattedPhoneNumber" | "id"> = {
  name: "fullName",
  email: "email",
  phone: "formattedPhoneNumber",
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
 * Active tab lists both active and inactive. A status dropdown on that tab
 * can narrow to one of those two. Pending tab always sends `pending` and
 * must not include a status filter.
 */
export function buildFrontDeskListFilters(options: {
  tab: FrontDeskListTab;
  columnFilters: ColumnFiltersState;
}): FrontDeskFilterInput {
  const filters: FrontDeskFilterInput = {};

  if (options.tab === "pending") {
    filters.status = "pending";
  } else {
    const selected = options.columnFilters.find((filter) => filter.id === "status")?.value;
    filters.status =
      selected === "active" || selected === "inactive" ? selected : ACTIVE_TAB_STATUSES;
  }

  for (const { id, value } of options.columnFilters) {
    if (id === "status") continue;
    if (value == null || value === "") continue;

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

    if (id === "gender") {
      const gender = String(value).trim().toLowerCase();
      if (gender === "male" || gender === "female") {
        filters.gender = gender;
      }
      continue;
    }

    const field = SEARCH_FIELD_MAP[id];
    if (field) {
      const raw = String(value).trim();
      filters[field] = field === "formattedPhoneNumber" ? raw.replace(/[^\d+]/g, "") : raw;
    }
  }

  return filters;
}

export function buildFrontDeskListSort(sorting: SortingState): FrontDeskSortInput[] | undefined {
  const entry = sorting.find((item) => SORT_FIELD_MAP[item.id]);
  if (!entry) return undefined;
  const field = SORT_FIELD_MAP[entry.id];
  if (!field) return undefined;
  return [{ field, order: entry.desc ? "desc" : "asc" }];
}
