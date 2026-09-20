import type {
  EventGuestFilterInput,
  EventGuestGender,
  EventGuestSortInput,
  EventGuestStatus,
} from "./queries/event-guest-list";
import type { DataTableDateRange } from "@/shared/components/table";
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";

const SORT_FIELD_MAP: Record<string, string> = {
  name: "name",
  email: "email",
  phone: "formattedPhoneNumber",
  status: "status",
  companions: "numberOfCompanions",
  companionsCount: "numberOfCompanions",
  gender: "gender",
};

const SEARCH_FIELD_MAP: Record<string, "name" | "email" | "formattedPhoneNumber" | "id"> = {
  name: "name",
  email: "email",
  phone: "formattedPhoneNumber",
  id: "id",
};

const STATUSES = new Set<EventGuestStatus>(["expected", "confirmed", "cancelled"]);
const GENDERS = new Set<EventGuestGender>(["male", "female", "NA"]);

function toUtcDateTime(value: Date | undefined, bound: "start" | "end"): string | undefined {
  if (!value) return undefined;
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  const time = bound === "start" ? "00:00:00" : "23:59:59";
  return `${year}-${month}-${day}T${time}Z`;
}

export function buildEventGuestListFilters(
  columnFilters: ColumnFiltersState,
): EventGuestFilterInput {
  const filters: EventGuestFilterInput = {};

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

    if (id === "status") {
      const status = String(value) as EventGuestStatus;
      if (STATUSES.has(status)) filters.status = status;
      continue;
    }

    if (id === "gender") {
      const gender = String(value) as EventGuestGender;
      if (GENDERS.has(gender)) filters.gender = gender;
      continue;
    }

    const field = SEARCH_FIELD_MAP[id];
    if (!field) continue;
    const raw = String(value).trim();
    if (!raw) continue;
    filters[field] = field === "formattedPhoneNumber" ? raw.replace(/[^\d+]/g, "") : raw;
  }

  return filters;
}

export function buildEventGuestListSort(sorting: SortingState): EventGuestSortInput[] | undefined {
  const entry = sorting.find((item) => SORT_FIELD_MAP[item.id]);
  if (!entry) return undefined;
  const field = SORT_FIELD_MAP[entry.id];
  if (!field) return undefined;
  return [{ field, direction: entry.desc ? "desc" : "asc" }];
}
