"use client";
"use no memo";

import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Tag } from "@/shared/components/ui/tag";

import {
  formatFilterValue,
  getFilterValueFromTable,
  isFilterValueActive,
  setFilterValueOnTable,
} from "./filter-fns";

import type { DataTableFilterDef } from "../types";
import type { Table } from "@tanstack/react-table";

type DataTableActiveFiltersProps<TData> = {
  table: Table<TData>;
  filters: DataTableFilterDef[];
  className?: string;
};

/**
 * Chip row summarizing every currently-applied filter — renders under the
 * search bar so the active filter set is always visible, each chip
 * removable on its own.
 */
function DataTableActiveFilters<TData>({
  table,
  filters,
  className,
}: DataTableActiveFiltersProps<TData>) {
  const t = useTranslations("dataTable");
  const filterLabels = {
    filterDateFrom: (values: { date: string }) => t("filterDateFrom", values),
    filterDateUntil: (values: { date: string }) => t("filterDateUntil", values),
    filterDateRange: (values: { from: string; to: string }) => t("filterDateRange", values),
    filterMoreCount: (values: { count: number }) => t("filterMoreCount", values),
    yes: t("yes"),
    no: t("no"),
  };
  const active = filters
    .map((filter) => ({
      filter,
      value: getFilterValueFromTable(table, filter),
    }))
    .filter(({ filter, value }) => isFilterValueActive(filter.type, value));

  if (active.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {active.map(({ filter, value }) => (
        <Tag
          key={filter.id}
          onRemove={() => setFilterValueOnTable(table, filter, undefined)}
          removeLabel={t("removeFilterLabel", { label: filter.label })}
        >
          <span className="font-semibold">{filter.label}:</span>{" "}
          {formatFilterValue(filter, value, filterLabels)}
        </Tag>
      ))}
      <Button
        type="button"
        variant="link"
        size="sm"
        className="h-auto p-0 text-xs"
        onClick={() =>
          active.forEach(({ filter }) => setFilterValueOnTable(table, filter, undefined))
        }
      >
        {t("clearAll")}
      </Button>
    </div>
  );
}

export { DataTableActiveFilters };
