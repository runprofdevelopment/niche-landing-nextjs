/**
 * Column `filterFn` implementations for filter types that don't map to
 * TanStack's built-ins. Wire these onto a column via `createAccessorColumn`'s
 * `filterFn` option — `select` and `switch` filters just use the built-in
 * `'equals'`.
 */

import type {
  DataTableDateRange,
  DataTableDependentSelectFilterDef,
  DataTableDependentSelectValue,
  DataTableFilterDef,
} from "../types";
import type { Row, Table } from "@tanstack/react-table";

/** Row passes if its cell value is included in the selected option list. */
export function multiSelectFilterFn<TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: unknown,
): boolean {
  if (!Array.isArray(filterValue) || filterValue.length === 0) return true;
  const value = row.getValue(columnId);
  return filterValue.includes(value);
}
multiSelectFilterFn.autoRemove = (value: unknown) => !Array.isArray(value) || value.length === 0;

/** Row passes if its cell value (a `Date`) falls within the `{ from, to }` range. */
export function dateRangeFilterFn<TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: DataTableDateRange,
): boolean {
  if (!filterValue?.from && !filterValue?.to) return true;
  const cellValue = row.getValue(columnId);
  const date = cellValue instanceof Date ? cellValue : new Date(cellValue as string);
  if (Number.isNaN(date.getTime())) return false;
  if (filterValue.from && date < filterValue.from) return false;
  if (filterValue.to && date > filterValue.to) return false;
  return true;
}
dateRangeFilterFn.autoRemove = (value: DataTableDateRange | undefined) =>
  !value?.from && !value?.to;

/** Ready-made `filterFn` map, keyed by `DataTableFilterDef['type']`. */
export const dataTableFilterFns = {
  select: "equals",
  multiSelect: multiSelectFilterFn,
  dateRange: dateRangeFilterFn,
  switch: "equals",
  input: "includesString",
} as const;

function isDependentSelectFilter(
  filter: DataTableFilterDef,
): filter is DataTableDependentSelectFilterDef {
  return filter.type === "dependentSelect";
}

/** Reads the current filter value from the table — expands `dependentSelect` from two columns. */
export function getFilterValueFromTable<TData>(
  table: Table<TData>,
  filter: DataTableFilterDef,
): unknown {
  if (isDependentSelectFilter(filter)) {
    const parent = table.getColumn(filter.parentColumnId)?.getFilterValue() as string | undefined;
    const child = table.getColumn(filter.childColumnId)?.getFilterValue() as string | undefined;
    if (!parent && !child) return undefined;
    return { parent, child };
  }
  return table.getColumn(filter.id)?.getFilterValue();
}

/** Writes a filter value to the table — splits `dependentSelect` across two columns. */
export function setFilterValueOnTable<TData>(
  table: Table<TData>,
  filter: DataTableFilterDef,
  value: unknown,
) {
  if (isDependentSelectFilter(filter)) {
    const dependent = value as DataTableDependentSelectValue | undefined;
    table.getColumn(filter.parentColumnId)?.setFilterValue(dependent?.parent ?? undefined);
    table.getColumn(filter.childColumnId)?.setFilterValue(dependent?.child ?? undefined);
    return;
  }
  table.getColumn(filter.id)?.setFilterValue(value);
}

export function isFilterValueActive(type: DataTableFilterDef["type"], value: unknown): boolean {
  switch (type) {
    case "multiSelect":
      return Array.isArray(value) && value.length > 0;
    case "dateRange": {
      const range = value as DataTableDateRange | undefined;
      return Boolean(range?.from || range?.to);
    }
    case "dependentSelect": {
      const dependent = value as DataTableDependentSelectValue | undefined;
      return Boolean(dependent?.parent || dependent?.child);
    }
    case "switch":
      return typeof value === "boolean";
    case "select":
    case "asyncSelect":
    case "input":
    default:
      return value !== undefined && value !== null && value !== "";
  }
}

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export type FormatFilterValueLabels = {
  filterDateFrom: (values: { date: string }) => string;
  filterDateUntil: (values: { date: string }) => string;
  filterDateRange: (values: { from: string; to: string }) => string;
  filterMoreCount: (values: { count: number }) => string;
  yes: string;
  no: string;
};

const defaultFilterLabels: FormatFilterValueLabels = {
  filterDateFrom: ({ date }) => `From ${date}`,
  filterDateUntil: ({ date }) => `Until ${date}`,
  filterDateRange: ({ from, to }) => `${from} – ${to}`,
  filterMoreCount: ({ count }) => `+${count}`,
  yes: "Yes",
  no: "No",
};

export function formatFilterValue(
  filter: DataTableFilterDef,
  value: unknown,
  labels: FormatFilterValueLabels = defaultFilterLabels,
): string {
  switch (filter.type) {
    case "select":
    case "asyncSelect": {
      const option = filter.options.find((item) => item.value === value);
      return option?.label ?? String(value);
    }
    case "multiSelect": {
      const values = Array.isArray(value) ? value : [];
      const optionLabels = values.map(
        (item) => filter.options.find((option) => option.value === item)?.label ?? String(item),
      );
      if (optionLabels.length <= 2) return optionLabels.join(", ");
      return `${optionLabels.slice(0, 2).join(", ")} ${labels.filterMoreCount({ count: optionLabels.length - 2 })}`;
    }
    case "dateRange": {
      const range = value as DataTableDateRange | undefined;
      if (range?.from && range?.to) {
        return labels.filterDateRange({
          from: formatDate(range.from),
          to: formatDate(range.to),
        });
      }
      if (range?.from) {
        return labels.filterDateFrom({ date: formatDate(range.from) });
      }
      if (range?.to) {
        return labels.filterDateUntil({ date: formatDate(range.to) });
      }
      return "";
    }
    case "switch":
      return value ? labels.yes : labels.no;
    case "dependentSelect": {
      const dependent = value as DataTableDependentSelectValue;
      const parentLabel = filter.parent.options.find(
        (item) => item.value === dependent.parent,
      )?.label;
      const childLabel = (filter.child.optionsForDisplay ?? []).find(
        (item) => item.value === dependent.child,
      )?.label;
      const parts = [parentLabel, childLabel].filter(Boolean);
      return parts.length > 0 ? parts.join(" · ") : "";
    }
    case "input":
    default:
      return String(value);
  }
}
