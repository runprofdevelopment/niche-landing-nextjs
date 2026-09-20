"use client";
"use no memo";

import { Calendar, Filter, ListFilter, Plus, ToggleLeft, Type, X } from "lucide-react";
import { useState } from "react";

import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";

import { Button } from "../../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";

import { DataTableFilterControl } from "./data-table-filter-control";
import { getFilterValueFromTable, isFilterValueActive, setFilterValueOnTable } from "./filter-fns";

import type { DataTableFilterDef } from "../types";
import type { Table } from "@tanstack/react-table";
import type { LucideIcon } from "lucide-react";

type DataTableFiltersProps<TData> = {
  table: Table<TData>;
  filters: DataTableFilterDef[];
  className?: string;
  /** Applied to the icon trigger — used by the toolbar to match its other icon buttons' size. */
  triggerClassName?: string;
};

const TYPE_ICON: Record<DataTableFilterDef["type"], LucideIcon> = {
  select: ListFilter,
  multiSelect: ListFilter,
  asyncSelect: ListFilter,
  dependentSelect: ListFilter,
  dateRange: Calendar,
  switch: ToggleLeft,
  input: Type,
};

/**
 * Icon-only filter trigger. Opens a builder popover: pick which fields you
 * want to filter by from a row of pills, each adds a card with its control
 * below, then apply everything at once (or cancel to discard). Draft state
 * is separate from the table's real filters until "Apply" — so composing
 * three filters doesn't re-run the table's filtering three times.
 */
function DataTableFilters<TData>({
  table,
  filters,
  className,
  triggerClassName,
}: DataTableFiltersProps<TData>) {
  const t = useTranslations("dataTable");
  const [open, setOpen] = useState(false);
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const [draft, setDraft] = useState<Record<string, unknown>>({});

  if (filters.length === 0) return null;

  const activeCount = filters.filter((filter) =>
    isFilterValueActive(filter.type, getFilterValueFromTable(table, filter)),
  ).length;

  function seedFromTable() {
    const ids: string[] = [];
    const values: Record<string, unknown> = {};
    filters.forEach((filter) => {
      const value = getFilterValueFromTable(table, filter);
      if (isFilterValueActive(filter.type, value)) {
        ids.push(filter.id);
        values[filter.id] = value;
      }
    });
    setAddedIds(ids);
    setDraft(values);
  }

  function handleOpenChange(next: boolean) {
    if (next) seedFromTable();
    setOpen(next);
  }

  function addFilter(id: string) {
    setAddedIds((current) => [...current, id]);

    // A switch has no neutral "unset" display — it always shows on/off, so it
    // needs a real value the instant it's added, matching what's shown.
    const filter = filters.find((entry) => entry.id === id);
    if (filter?.type === "switch") {
      setDraft((current) => ({ ...current, [id]: false }));
    }
  }

  function removeFilter(id: string) {
    setAddedIds((current) => current.filter((entry) => entry !== id));
    setDraft((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  function clearAll() {
    setAddedIds([]);
    setDraft({});
    filters.forEach((filter) => setFilterValueOnTable(table, filter, undefined));
    setOpen(false);
  }

  function apply() {
    filters.forEach((filter) => {
      setFilterValueOnTable(
        table,
        filter,
        addedIds.includes(filter.id) ? draft[filter.id] : undefined,
      );
    });
    setOpen(false);
  }

  const availableFilters = filters.filter((filter) => !addedIds.includes(filter.id));
  const addedFilters = filters.filter((filter) => addedIds.includes(filter.id));

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline-invert"
            size="icon"
            aria-label={t("filtersLabel")}
            className={cn("relative", triggerClassName)}
          />
        }
      >
        <Filter className="size-4" />
        {activeCount > 0 ? (
          <span className="absolute -inset-e-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
            {activeCount}
          </span>
        ) : null}
      </PopoverTrigger>
      <PopoverContent align="end" className={cn("w-96 p-0", className)}>
        <div className="flex items-center justify-between px-4 pt-4">
          <span className="text-sm font-semibold text-foreground">{t("filtersLabel")}</span>
          {addedIds.length > 0 ? (
            <button
              type="button"
              onClick={clearAll}
              className="cursor-pointer text-xs font-medium text-primary underline-offset-2 hover:underline"
            >
              {t("clearAll")}
            </button>
          ) : null}
        </div>

        {availableFilters.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 px-4 pt-3">
            {availableFilters.map((filter) => {
              const Icon = TYPE_ICON[filter.type];
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => addFilter(filter.id)}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-dashed border-border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <Plus className="size-3" />
                  <Icon className="size-3" />
                  {filter.label}
                </button>
              );
            })}
          </div>
        ) : null}

        {addedFilters.length > 0 ? (
          <div className="flex max-h-80 flex-col gap-2 overflow-y-auto p-4">
            {addedFilters.map((filter) => {
              const Icon = TYPE_ICON[filter.type];
              return (
                <div
                  key={filter.id}
                  className="flex min-w-0 flex-col gap-2 overflow-hidden rounded-lg border border-border p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                      <Icon className="size-3.5 text-muted-foreground" />
                      {filter.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFilter(filter.id)}
                      aria-label={t("removeFilterLabel", {
                        label: filter.label,
                      })}
                      className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                  <DataTableFilterControl
                    filter={filter}
                    value={draft[filter.id]}
                    onChange={(value) =>
                      setDraft((current) => ({
                        ...current,
                        [filter.id]: value,
                      }))
                    }
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            {t("pickFieldPrompt")}
          </p>
        )}

        <div className="flex items-center justify-end gap-2 border-t border-border p-4">
          <Button type="button" variant="outline-invert" size="sm" onClick={() => setOpen(false)}>
            {t("cancel")}
          </Button>
          <Button type="button" size="sm" onClick={apply}>
            {t("apply")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { DataTableFilters };
