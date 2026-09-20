"use client";
"use no memo";

import { ChevronsUpDown, Search } from "lucide-react";
import { useEffect, useState } from "react";

import { useDebounce } from "@/hooks";
import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";

import { fieldControlClassName } from "../ui/input";
import { Select } from "../ui/select-field";

import { getColumnLabel } from "./columns/column-helpers";

import type { Table } from "@tanstack/react-table";

type DataTableSearchProps<TData> = {
  table: Table<TData>;
  /** Column ids to offer in the picker — don't reuse ids already in `DataTableFilters`. */
  searchColumns: string[];
  debounceMs?: number;
  className?: string;
};

function DataTableSearch<TData>({
  table,
  searchColumns,
  debounceMs = 300,
  className,
}: DataTableSearchProps<TData>) {
  const t = useTranslations("dataTable");
  const searchableColumns = table
    .getAllColumns()
    .filter((column) => searchColumns.includes(column.id) && column.getCanFilter());
  const columnOptions = searchableColumns.map((column) => ({
    value: column.id,
    label: getColumnLabel(column.columnDef),
  }));
  const columnPlaceholder = t("searchColumnPlaceholder");
  // Longest of all possible trigger labels (including the placeholder), used
  // by the invisible sizer below to size the trigger to its widest content.
  const longestColumnLabel = [
    columnPlaceholder,
    ...columnOptions.map((option) => option.label),
  ].reduce((longest, label) => (label.length > longest.length ? label : longest), "");
  // Seed from any existing column filter so the input reflects persisted state
  // on (re)mount — e.g. after switching tabs, where the panel unmounts but the
  // table's filter state lives on. Otherwise the box goes blank while the filter
  // is still applied.
  const [columnId, setColumnId] = useState<string | undefined>(
    () => searchableColumns.find((column) => column.getFilterValue() != null)?.id,
  );
  const activeColumn = columnId ? table.getColumn(columnId) : undefined;
  const activeColumnFilterValue = activeColumn?.getFilterValue();

  const [value, setValue] = useState(() =>
    activeColumnFilterValue == null ? "" : String(activeColumnFilterValue),
  );
  const debouncedValue = useDebounce(value, debounceMs);

  useEffect(() => {
    activeColumn?.setFilterValue(debouncedValue === "" ? undefined : String(debouncedValue));
    // Only push the debounced value to the active column — re-running when
    // `activeColumn` changes would clear the newly-selected column's filter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  function handleColumnChange(nextId: string) {
    if (columnId && columnId !== nextId) {
      table.getColumn(columnId)?.setFilterValue(undefined);
    }
    setColumnId(nextId);
    setValue("");
  }

  if (searchableColumns.length === 0) return null;

  return (
    <div className={cn("flex w-full max-w-md items-center gap-2", className)}>
      <div className="relative shrink-0">
        {/* Invisible sizer mirroring the trigger's box model — reserves enough
            width for the longest label so the trigger fits its content without a
            fixed width, regardless of font/locale. Capped so an unusually long
            label can't squash the search input; the trigger value then truncates
            while the popup grows to show the full name. */}
        <span
          aria-hidden
          className="invisible flex h-10 max-w-56 items-center gap-2 overflow-hidden rounded-lg border border-transparent px-2.5 py-1 text-sm whitespace-pre"
        >
          {longestColumnLabel}
          <ChevronsUpDown className="size-4 shrink-0" />
        </span>
        <Select
          className="absolute inset-0 h-full w-full"
          value={columnId ?? null}
          onValueChange={(next) => next && handleColumnChange(next)}
          items={columnOptions}
          placeholder={columnPlaceholder}
          searchable={false}
        />
      </div>
      <div className="relative min-w-0 flex-1">
        <input
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          disabled={!columnId}
          autoComplete="off"
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchAriaLabel")}
          className={cn(fieldControlClassName, "pe-8")}
        />
        <Search className="pointer-events-none absolute end-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      </div>
    </div>
  );
}

export { DataTableSearch };
