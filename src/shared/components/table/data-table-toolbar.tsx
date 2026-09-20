"use client";
"use no memo";

import { Columns3, RefreshCw, Upload } from "lucide-react";
import { useEffect, useRef } from "react";

import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../navigation";
import { Button } from "../ui/button";

import { getColumnLabel } from "./columns/column-helpers";
import { DataTableSearch } from "./data-table-search";
import { DataTableActiveFilters, DataTableFilters } from "./filters";

import type { DataTableFilterDef } from "./types";
import type { Table } from "@tanstack/react-table";
import type { HTMLAttributes } from "react";

type DataTableToolbarProps<TData> = HTMLAttributes<HTMLDivElement> & {
  table: Table<TData>;
  showSearch?: boolean;
  /** Column ids searchable via the picker — omit or pass `[]` to hide the search bar entirely (no implicit "all columns"). */
  searchColumns?: string[];
  showColumnVisibility?: boolean;
  /** Filter definitions — omit or pass `[]` to hide the filter button entirely. */
  filters?: DataTableFilterDef[];
  /** Shows a refresh icon button that calls this when clicked. */
  onRefresh?: () => void;
  /** Spins the refresh icon while a refetch is in flight. */
  refreshing?: boolean;
  /** Shows an export-to-Excel icon button that calls this when clicked. */
  onExport?: () => void;
  /** Spins the export icon while an export is in flight. */
  exporting?: boolean;
};

/** Matches the search field/dropdown height (h-10) so the whole toolbar row aligns. */
const toolbarIconButtonClassName = "size-10";

/**
 * Table toolbar: search-with-column-picker on the start edge, icon-only
 * actions (column visibility, filters, refresh) on the end edge, and — when
 * any filter is active — a removable chip row underneath so the current
 * filter set is always visible.
 */
function DataTableToolbar<TData>({
  table,
  showSearch = true,
  searchColumns = [],
  showColumnVisibility = true,
  filters = [],
  onRefresh,
  refreshing = false,
  onExport,
  exporting = false,
  className,
  children,
  ...props
}: DataTableToolbarProps<TData>) {
  const t = useTranslations("dataTable");
  const hideableColumns = table.getAllColumns().filter((column) => column.getCanHide());
  const allColumnsVisible = hideableColumns.every((column) => column.getIsVisible());

  // Clearing a filter or the search box can bring column filters back to a
  // combination the query has already cached — refetch so the table reflects
  // current server data instead of a stale cached result.
  const columnFiltersCount = table.getState().columnFilters.length;
  const previousColumnFiltersCountRef = useRef(columnFiltersCount);
  useEffect(() => {
    const previousCount = previousColumnFiltersCountRef.current;
    previousColumnFiltersCountRef.current = columnFiltersCount;
    if (columnFiltersCount < previousCount) {
      onRefresh?.();
    }
  }, [columnFiltersCount, onRefresh]);

  return (
    <div className={cn("flex flex-col gap-3", className)} {...props}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {showSearch && searchColumns.length > 0 ? (
          <DataTableSearch table={table} searchColumns={searchColumns} />
        ) : (
          <div />
        )}

        <div className="flex shrink-0 items-center gap-2">
          {children}

          {showColumnVisibility && table.options.enableHiding !== false ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="outline-invert"
                    size="icon"
                    aria-label={t("toggleColumnsLabel")}
                    className={toolbarIconButtonClassName}
                  />
                }
              >
                <Columns3 className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>{t("toggleColumnsLabel")}</DropdownMenuLabel>
                  <DropdownMenuCheckboxItem
                    checked={allColumnsVisible}
                    onCheckedChange={(checked) =>
                      hideableColumns.forEach((column) => column.toggleVisibility(checked === true))
                    }
                  >
                    {allColumnsVisible ? t("deselectAllColumns") : t("selectAllColumns")}
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSeparator />
                  {hideableColumns.map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={(checked) => column.toggleVisibility(checked === true)}
                    >
                      {getColumnLabel(column.columnDef)}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}

          <DataTableFilters
            table={table}
            filters={filters}
            triggerClassName={toolbarIconButtonClassName}
          />

          {onRefresh ? (
            <Button
              type="button"
              variant="outline-invert"
              size="icon"
              aria-label={t("refreshAriaLabel")}
              onClick={onRefresh}
              disabled={refreshing}
              className={toolbarIconButtonClassName}
            >
              <RefreshCw className={cn("size-4", refreshing && "animate-spin")} />
            </Button>
          ) : null}

          {onExport ? (
            <Button
              type="button"
              variant="outline-invert"
              size="icon"
              aria-label={t("exportAriaLabel")}
              onClick={onExport}
              disabled={exporting}
              className={toolbarIconButtonClassName}
            >
              <Upload className="size-4" />
            </Button>
          ) : null}
        </div>
      </div>

      <DataTableActiveFilters table={table} filters={filters} />
    </div>
  );
}

export { DataTableToolbar };
