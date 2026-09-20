"use client";
"use no memo";

import { cn } from "@/lib/utils";

import { DataTable } from "./data-table";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";

import type { DataTableFilterDef } from "./types";
import type { Table } from "@tanstack/react-table";
import type { HTMLAttributes, ReactNode } from "react";

type DataTableViewProps<TData> = HTMLAttributes<HTMLDivElement> & {
  table: Table<TData>;
  caption?: string;
  emptyMessage?: ReactNode;
  stickyHeader?: boolean;
  /**
   * Fills the parent height and scrolls the table body (both axes). Parent must
   * be a flex column with `min-h-0` / bounded height (e.g. dashboard main).
   */
  fillHeight?: boolean;
  showToolbar?: boolean;
  showPagination?: boolean;
  showSearch?: boolean;
  /** Column ids searchable via the picker — omit or pass `[]` to hide the search bar entirely (no implicit "all columns"). */
  searchColumns?: string[];
  showColumnVisibility?: boolean;
  filters?: DataTableFilterDef[];
  /** Total row count across all pages — see `DataTablePagination`'s `totalCount`. */
  totalCount?: number;
  /** True while data is being fetched — dims the table under a spinner (overlay). */
  loading?: boolean;
  /**
   * Spins the refresh icon (manual sync in progress). Defaults to `loading` for
   * backward compatibility; pass it explicitly to decouple the icon spin from
   * general loading, so routine fetches (pagination, filtering) don't spin it.
   */
  refreshing?: boolean;
  /** Shows a refresh icon button in the toolbar; called on click. */
  onRefresh?: () => void;
  /** Shows an export-to-Excel icon button in the toolbar; called on click. */
  onExport?: () => void;
  /** Spins the export icon while an export is in flight. */
  exporting?: boolean;
  toolbar?: ReactNode;
  /**
   * Optional tabs row rendered above the toolbar — pass your own `Tabs`
   * instance. Omit for tables that don't need tabs; this is per-table, not
   * baked into the shell, since some tables have them and some don't.
   */
  tabs?: ReactNode;
  footer?: ReactNode;
};

/**
 * Convenience shell: optional tabs + toolbar + accessible table + pagination.
 *
 * Skip this wrapper when you need full control over layout — compose
 * `DataTable`, `DataTableToolbar`, and `DataTablePagination` directly.
 */
function DataTableView<TData>({
  table,
  caption,
  emptyMessage,
  stickyHeader,
  fillHeight = false,
  showToolbar = true,
  showPagination = true,
  showSearch,
  searchColumns,
  showColumnVisibility,
  filters,
  totalCount,
  loading = false,
  refreshing,
  onRefresh,
  onExport,
  exporting = false,
  toolbar,
  tabs,
  footer,
  className,
  ...props
}: DataTableViewProps<TData>) {
  const resolvedStickyHeader = stickyHeader ?? fillHeight;

  return (
    <div
      className={cn(
        "min-w-0",
        fillHeight ? "flex min-h-0 flex-1 flex-col gap-4" : "space-y-4",
        className,
      )}
      {...props}
    >
      {tabs ? (
        <div className="min-w-0 max-w-full shrink-0 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs}
        </div>
      ) : null}

      {showToolbar
        ? (toolbar ?? (
            <div className="shrink-0">
              <DataTableToolbar
                table={table}
                {...(showSearch !== undefined ? { showSearch } : {})}
                {...(searchColumns !== undefined ? { searchColumns } : {})}
                {...(showColumnVisibility !== undefined ? { showColumnVisibility } : {})}
                {...(filters !== undefined ? { filters } : {})}
                {...(onRefresh ? { onRefresh } : {})}
                refreshing={refreshing ?? loading}
                {...(onExport ? { onExport } : {})}
                exporting={exporting}
              />
            </div>
          ))
        : null}

      <DataTable
        table={table}
        {...(caption !== undefined ? { caption } : {})}
        {...(emptyMessage !== undefined ? { emptyMessage } : {})}
        stickyHeader={resolvedStickyHeader}
        fillHeight={fillHeight}
        loading={loading}
        refreshing={refreshing ?? loading}
      />

      {footer ? <div className="shrink-0">{footer}</div> : null}

      {showPagination ? (
        <div className="shrink-0">
          <DataTablePagination
            table={table}
            {...(totalCount !== undefined ? { totalCount } : {})}
          />
        </div>
      ) : null}
    </div>
  );
}

export { DataTableView };
