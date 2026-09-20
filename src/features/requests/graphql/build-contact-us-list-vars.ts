import type { ContactUsFilterInput, ContactUsSortInput } from "./queries/contact-us-list";
import type { DataTableDateRange } from "@/shared/components/table";
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";

const SORT_FIELD_MAP: Record<string, string> = {
  customerName: "customerName",
  email: "email",
  phoneNumber: "phoneNumber",
  eventType: "eventType",
  status: "status",
  createdAt: "createdAt",
  date: "date",
};

const SEARCH_FIELD_MAP: Record<string, "customerName" | "email" | "phoneNumber" | "id"> = {
  customerName: "customerName",
  email: "email",
  phoneNumber: "phoneNumber",
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

/** Builds list filters from DataTable column filters (status / eventType optional). */
export function buildContactUsListFilters(options: {
  columnFilters: ColumnFiltersState;
}): ContactUsFilterInput {
  const filters: ContactUsFilterInput = {};

  for (const { id, value } of options.columnFilters) {
    if (value == null || value === "") continue;

    if (id === "status") {
      if (value === "pending" || value === "resolved") {
        filters.status = value;
      }
      continue;
    }

    if (id === "eventType") {
      const eventType = String(value).trim();
      if (eventType) filters.eventType = eventType;
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
      const raw = String(value).trim();
      filters[field] = field === "phoneNumber" ? raw.replace(/[^\d+]/g, "") : raw;
    }
  }

  return filters;
}

export function buildContactUsListSort(sorting: SortingState): ContactUsSortInput[] | undefined {
  const entry = sorting.find((item) => SORT_FIELD_MAP[item.id]);
  if (!entry) return undefined;
  const field = SORT_FIELD_MAP[entry.id];
  if (!field) return undefined;
  return [{ field, order: entry.desc ? "desc" : "asc" }];
}
