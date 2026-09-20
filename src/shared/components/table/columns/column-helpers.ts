import { createElement } from "react";

import { DataTableCell } from "../data-table-cell";

import type { ColumnDef } from "@tanstack/react-table";

type AccessorColumnOptions<TData, TValue> = {
  id?: string;
  header: ColumnDef<TData, TValue>["header"];
  cell?: ColumnDef<TData, TValue>["cell"];
  size?: number;
  enableSorting?: boolean;
  enableHiding?: boolean;
  enableColumnFilter?: boolean;
  filterFn?: ColumnDef<TData, TValue>["filterFn"];
  meta?: ColumnDef<TData, TValue>["meta"];
};

export function createAccessorColumn<TData, TValue>(
  accessor: keyof TData & string,
  options: AccessorColumnOptions<TData, TValue>,
): ColumnDef<TData, unknown> {
  return {
    id: options.id ?? accessor,
    accessorKey: accessor,
    header: options.header,
    enableSorting: options.enableSorting ?? true,
    enableHiding: options.enableHiding ?? true,
    // Default substring match (works for numbers too); pass `filterFn` to override for nested/computed/array-shaped values.
    filterFn: options.filterFn ?? "includesString",
    cell:
      options.cell ??
      (({ getValue }) => {
        const value = getValue();
        if (value == null) return null;
        if (typeof value === "string" || typeof value === "number") {
          return createElement(DataTableCell, null, value);
        }
        return String(value);
      }),
    ...(options.enableColumnFilter !== undefined
      ? { enableColumnFilter: options.enableColumnFilter }
      : {}),
    ...(options.size !== undefined ? { size: options.size } : {}),
    meta: { truncate: true, ...options.meta },
  } as ColumnDef<TData, unknown>;
}

export function createDisplayColumn<TData>(
  id: string,
  options: Omit<AccessorColumnOptions<TData, unknown>, "id"> & {
    size?: number;
  },
): ColumnDef<TData, unknown> {
  return {
    id,
    header: options.header,
    cell: options.cell,
    enableSorting: options.enableSorting ?? false,
    enableHiding: options.enableHiding ?? true,
    enableColumnFilter: false,
    ...(options.size !== undefined ? { size: options.size } : {}),
    meta: {
      truncate: id === "actions" ? false : true,
      ...options.meta,
    },
  } as ColumnDef<TData, unknown>;
}

export function getColumnLabel<TData>(column: ColumnDef<TData, unknown>): string {
  if (column.meta?.label) return column.meta.label;
  if (typeof column.header === "string") return column.header;
  if (column.id) return column.id;
  if ("accessorKey" in column && typeof column.accessorKey === "string") {
    return column.accessorKey;
  }
  return "Column";
}
