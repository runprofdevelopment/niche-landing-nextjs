"use client";
"use no memo";

import { flexRender } from "@tanstack/react-table";
import { useCallback, useRef, useState } from "react";

import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";

import { Spinner } from "../ui/spinner";

import { SELECT_COLUMN_ID } from "./columns/select-column";
import { DataTableCell } from "./data-table-cell";

import type { Column, ColumnSizingState, Table } from "@tanstack/react-table";
import type {
  CSSProperties,
  HTMLAttributes,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  RefObject,
} from "react";

const ACTIONS_COLUMN_ID = "actions";

/**
 * Widest a content-sized column may get before its text truncates. Once a
 * column is resized it uses the dragged width instead.
 */
const AUTO_COLUMN_MAX_WIDTH = 288;

type DataTableProps<TData> = HTMLAttributes<HTMLDivElement> & {
  table: Table<TData>;
  caption?: string;
  emptyMessage?: ReactNode;
  stickyHeader?: boolean;
  /**
   * When true with `stickyHeader`, the table body scrolls vertically inside the
   * available height (parent must be a flex/`min-h-0` constrained container).
   */
  fillHeight?: boolean;
  /** Shows a spinner overlay above the (still-visible) rows — set while refetching. */
  loading?: boolean;
  /** When the overlay is a manual sync, labels it "Refreshing…"; otherwise "Loading…". */
  refreshing?: boolean;
};

function getAriaSortValue(direction: false | "asc" | "desc"): "none" | "ascending" | "descending" {
  if (direction === "asc") return "ascending";
  if (direction === "desc") return "descending";
  return "none";
}

const alignClassName: Record<"start" | "center" | "end", string> = {
  start: "text-start",
  center: "text-center",
  end: "text-end",
};

function shouldTruncateColumn(column: {
  id: string;
  columnDef: { meta?: { truncate?: boolean } };
}): boolean {
  if (column.id === SELECT_COLUMN_ID || column.id === ACTIONS_COLUMN_ID) {
    return false;
  }

  return column.columnDef.meta?.truncate !== false;
}

function hasFixedWidth<TData>(
  column: Column<TData, unknown>,
  columnSizing: ColumnSizingState,
): boolean {
  return columnSizing[column.id] != null;
}

/**
 * Pins a column to an exact width once it has been resized; otherwise leaves
 * sizing to the browser so the column fits its content.
 */
function getColumnStyle<TData>(
  column: Column<TData, unknown>,
  columnSizing: ColumnSizingState,
): CSSProperties {
  if (!hasFixedWidth(column, columnSizing)) {
    return { maxWidth: AUTO_COLUMN_MAX_WIDTH };
  }

  const size = column.getSize();
  return { width: size, minWidth: 0, maxWidth: size };
}

/**
 * Column resizing that widens the table instead of squeezing its neighbours:
 * every column is frozen at its rendered width when a drag starts, so the
 * dragged column grows into the horizontal scroll area.
 */
function useColumnResize<TData>(table: Table<TData>, tableRef: RefObject<HTMLTableElement | null>) {
  const [resizingColumnId, setResizingColumnId] = useState<string | null>(null);

  const startResize = useCallback(
    (columnId: string, event: ReactPointerEvent<HTMLElement>) => {
      const tableElement = tableRef.current;
      const column = table.getColumn(columnId);
      if (!tableElement || !column) return;

      event.preventDefault();
      event.stopPropagation();

      const measured: ColumnSizingState = {};
      tableElement
        .querySelectorAll<HTMLTableCellElement>("thead th[data-column-id]")
        .forEach((headerCell) => {
          const id = headerCell.dataset["columnId"];
          if (id) measured[id] = Math.round(headerCell.getBoundingClientRect().width);
        });

      const startWidth = measured[columnId] ?? column.getSize();
      const startX = event.clientX;
      const direction = table.options.columnResizeDirection === "rtl" ? -1 : 1;
      const minSize = column.columnDef.minSize ?? 0;
      const maxSize = column.columnDef.maxSize ?? Number.MAX_SAFE_INTEGER;

      table.setColumnSizing((previous) => ({
        ...measured,
        ...previous,
        [columnId]: startWidth,
      }));
      setResizingColumnId(columnId);

      const onPointerMove = (moveEvent: PointerEvent) => {
        const dragged = startWidth + (moveEvent.clientX - startX) * direction;
        const width = Math.min(Math.max(dragged, minSize), maxSize);
        table.setColumnSizing((previous) => ({
          ...previous,
          [columnId]: width,
        }));
      };

      const onPointerUp = () => {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        setResizingColumnId(null);
      };

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
    },
    [table, tableRef],
  );

  const resetSizes = useCallback(() => {
    table.resetColumnSizing();
  }, [table]);

  return { resizingColumnId, startResize, resetSizes };
}

/**
 * Accessible table markup for a TanStack Table instance.
 *
 * Headless logic lives in `useDataTable`; this component only renders semantic
 * `<table>` structure with `scope`, `aria-sort`, and selection attributes.
 *
 * Columns fit their content and the table scrolls horizontally rather than
 * shrinking columns to the container width.
 */
function DataTable<TData>({
  table,
  caption,
  emptyMessage,
  stickyHeader = false,
  fillHeight = false,
  loading = false,
  refreshing,
  className,
  ...props
}: DataTableProps<TData>) {
  const t = useTranslations("dataTable");
  const tableRef = useRef<HTMLTableElement>(null);
  const { resizingColumnId, startResize, resetSizes } = useColumnResize(table, tableRef);
  const rows = table.getRowModel().rows;
  const columnSizing = table.getState().columnSizing;
  const isResized = Object.keys(columnSizing).length > 0;
  const enableBodyScroll = stickyHeader || fillHeight;

  return (
    <div
      data-slot="data-table"
      className={cn(
        "relative w-full min-w-0 overflow-hidden rounded-xl border border-border bg-card",
        fillHeight && "flex min-h-0 flex-1 flex-col",
        className,
      )}
      {...props}
    >
      {loading ? (
        <div
          data-slot="data-table-loading-overlay"
          className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-card/60 backdrop-blur-[1px]"
        >
          <Spinner size="lg" className="text-primary" />
          <span className="text-sm font-medium text-muted-foreground">
            {refreshing === false ? t("loading") : t("refreshing")}
          </span>
        </div>
      ) : null}

      <div
        data-slot="data-table-scroll"
        className={cn(
          "relative w-full min-w-0 overscroll-contain",
          enableBodyScroll
            ? // Explicit svh cap so Mac/Safari always gets a real scrollport
              // (flex-only height chains often fail to constrain there).
              "max-h-[calc(100svh-15rem)] min-h-0 overflow-auto"
            : "overflow-x-auto",
        )}
      >
        <table
          ref={tableRef}
          className={cn("caption-bottom text-sm", resizingColumnId && "select-none")}
          style={
            isResized
              ? {
                  tableLayout: "fixed",
                  width: `max(100%, ${table.getTotalSize()}px)`,
                }
              : { width: "max-content", minWidth: "100%" }
          }
        >
          {caption ? <caption className="sr-only">{caption}</caption> : null}

          <thead
            className={cn(
              "border-b border-border bg-muted/40",
              stickyHeader && "sticky top-0 z-10 backdrop-blur-sm",
            )}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-border">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    scope="col"
                    colSpan={header.colSpan}
                    data-column-id={header.column.id}
                    aria-sort={
                      header.column.getCanSort()
                        ? getAriaSortValue(header.column.getIsSorted())
                        : undefined
                    }
                    className={cn(
                      "relative h-11 min-w-0 overflow-hidden px-4 align-middle font-medium whitespace-nowrap text-muted-foreground",
                      stickyHeader && "bg-muted/95",
                      alignClassName[header.column.columnDef.meta?.align ?? "center"],
                    )}
                    style={getColumnStyle(header.column, columnSizing)}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}

                    {header.column.getCanResize() ? (
                      <div
                        role="separator"
                        aria-orientation="vertical"
                        aria-label={t("resizeColumnLabel")}
                        onPointerDown={(event) => startResize(header.column.id, event)}
                        onDoubleClick={resetSizes}
                        className={cn(
                          "absolute inset-e-0 top-0 z-20 h-full w-1.5 cursor-col-resize touch-none select-none",
                          "after:absolute after:inset-y-2 after:inset-e-0.75 after:w-px after:bg-border after:transition-colors",
                          "hover:after:bg-primary",
                          resizingColumnId === header.column.id && "after:bg-primary",
                        )}
                      />
                    ) : null}
                  </th>
                ))}
                {isResized ? <th aria-hidden className="w-auto p-0" /> : null}
              </tr>
            ))}
          </thead>

          <tbody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <tr
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  aria-selected={row.getIsSelected() || undefined}
                  className="border-b border-border transition-colors hover:bg-muted/30 data-[state=selected]:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => {
                    const truncate = shouldTruncateColumn(cell.column);
                    const content = flexRender(cell.column.columnDef.cell, cell.getContext());
                    const fixedWidth = hasFixedWidth(cell.column, columnSizing);

                    return (
                      <td
                        key={cell.id}
                        className={cn(
                          "min-w-0 px-4 py-3 align-middle text-foreground",
                          truncate && "overflow-hidden",
                          alignClassName[cell.column.columnDef.meta?.align ?? "center"],
                        )}
                        style={getColumnStyle(cell.column, columnSizing)}
                      >
                        {truncate ? (
                          <DataTableCell
                            {...(!fixedWidth ? { maxWidth: AUTO_COLUMN_MAX_WIDTH } : {})}
                          >
                            {content}
                          </DataTableCell>
                        ) : (
                          content
                        )}
                      </td>
                    );
                  })}
                  {isResized ? <td aria-hidden className="w-auto p-0" /> : null}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={table.getVisibleLeafColumns().length + (isResized ? 1 : 0)}
                  className="h-24 px-4 text-center text-muted-foreground"
                >
                  {emptyMessage ?? t("noResults")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export { DataTable };
