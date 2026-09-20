"use client";
"use no memo";

import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";

import { Pagination } from "../navigation/pagination";

import type { Table } from "@tanstack/react-table";
import type { HTMLAttributes } from "react";

type DataTablePaginationProps<TData> = HTMLAttributes<HTMLDivElement> & {
  table: Table<TData>;
  pageSizeOptions?: number[];
  /**
   * Total row count across all pages — required for accurate "X of Y selected"
   * on manually-paginated tables, where `data` only holds the current page and
   * `getFilteredRowModel()` can't see the rest. Falls back to the table's own
   * filtered row count for client-side pagination.
   */
  totalCount?: number;
};

/**
 * Pagination controls wired to TanStack Table pagination state.
 *
 * Uses the shared `Pagination` navigator (1-based pages) while the table
 * stores a 0-based `pageIndex`.
 *
 * Layout:
 * - `<sm`: stacked, centered — pagination on top, rows-per-page + status below.
 * - `sm+`: status on the start edge, rows-per-page and pagination on the end.
 */
function DataTablePagination<TData>({
  table,
  pageSizeOptions = [10, 20, 50],
  totalCount,
  className,
  ...props
}: DataTablePaginationProps<TData>) {
  const t = useTranslations("dataTable");
  const { pageIndex, pageSize } = table.getState().pagination;
  const pageCount = table.getPageCount();
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const rowCount = totalCount ?? table.getFilteredRowModel().rows.length;

  return (
    <div
      className={cn(
        "flex flex-col-reverse items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
      {...props}
    >
      <div className="flex flex-col items-center gap-1 text-center text-sm text-muted-foreground sm:flex-row sm:items-center sm:gap-4 sm:text-start">
        {table.options.enableRowSelection ? (
          <span>{t("rowsSelected", { selected: selectedCount, total: rowCount })}</span>
        ) : (
          <span>
            {t("pageLabel")} <span className="font-medium text-foreground">{pageIndex + 1}</span>{" "}
            {t("ofLabel")}{" "}
            <span className="font-medium text-foreground">{Math.max(pageCount, 1)}</span>
          </span>
        )}
      </div>

      <div className="flex flex-col-reverse items-center gap-3 sm:flex-row sm:gap-6">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="hidden sm:inline">{t("rowsPerPage")}</span>
          <span className="sm:hidden">{t("rowsPerPageShort")}</span>
          <select
            className="h-8 rounded-lg border border-border bg-input px-2 text-sm text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            value={pageSize}
            onChange={(event) => table.setPageSize(Number(event.target.value))}
            aria-label={t("rowsPerPage")}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <Pagination
          page={pageIndex + 1}
          pageCount={Math.max(pageCount, 1)}
          onPageChange={(page) => table.setPageIndex(page - 1)}
        />
      </div>
    </div>
  );
}

export { DataTablePagination };
