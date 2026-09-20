"use client";
"use no memo";

import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { getDirection, useCurrentLocale } from "@/providers/i18n";

import { SELECT_COLUMN_ID } from "../columns/select-column";
import { createDataTableState } from "../state";

import { useDataTableState } from "./use-data-table-state";

import type {
  DataTableControlledState,
  DataTableControlledStateInput,
  UseDataTableOptions,
} from "../types";
import type { Table } from "@tanstack/react-table";

/**
 * Headless TanStack Table hook.
 *
 * Wires row models (core, sorted, filtered, paginated), feature flags, and
 * optional controlled state. Returns the table instance — render with `DataTable`
 * or your own markup via `flexRender`.
 */
export function useDataTable<TData, TValue = unknown>(
  options: UseDataTableOptions<TData, TValue> & {
    /** When omitted, state is managed locally via `useDataTableState`. */
    controlledState?: DataTableControlledStateInput;
  },
): Table<TData> {
  const {
    data,
    columns,
    getRowId,
    initialState,
    controlledState: controlledStateProp,
    enableSorting = true,
    enableColumnFilters = true,
    enableGlobalFilter = true,
    enablePagination = true,
    // Defaults on whenever a `createSelectColumn()` is present — pass `enableRowSelection: false`
    // explicitly to opt a checkbox column out (rare; usually you'd just omit the column instead).
    enableRowSelection = columns.some((column) => column.id === SELECT_COLUMN_ID),
    enableColumnVisibility = true,
    enableMultiSort = false,
    enableColumnResizing = true,
    manualSorting = false,
    manualFiltering = false,
    manualPagination = false,
    pageCount,
  } = options;

  const locale = useCurrentLocale();
  const internalState = useDataTableState(initialState);
  const defaultState = createDataTableState(initialState);

  const controlledState: DataTableControlledState = {
    state: {
      sorting: controlledStateProp?.state?.sorting ?? internalState.state.sorting,
      columnFilters: controlledStateProp?.state?.columnFilters ?? internalState.state.columnFilters,
      columnVisibility:
        controlledStateProp?.state?.columnVisibility ?? internalState.state.columnVisibility,
      rowSelection: controlledStateProp?.state?.rowSelection ?? internalState.state.rowSelection,
      globalFilter: controlledStateProp?.state?.globalFilter ?? internalState.state.globalFilter,
      pagination: controlledStateProp?.state?.pagination ?? internalState.state.pagination,
    },
    onSortingChange: controlledStateProp?.onSortingChange ?? internalState.onSortingChange,
    onColumnFiltersChange:
      controlledStateProp?.onColumnFiltersChange ?? internalState.onColumnFiltersChange,
    onColumnVisibilityChange:
      controlledStateProp?.onColumnVisibilityChange ?? internalState.onColumnVisibilityChange,
    onRowSelectionChange:
      controlledStateProp?.onRowSelectionChange ?? internalState.onRowSelectionChange,
    onGlobalFilterChange:
      controlledStateProp?.onGlobalFilterChange ?? internalState.onGlobalFilterChange,
    onPaginationChange: controlledStateProp?.onPaginationChange ?? internalState.onPaginationChange,
  };

  // TanStack Table returns unstable function identities that React Compiler cannot memoize.
  // eslint-disable-next-line react-hooks/incompatible-library -- useReactTable is required here
  return useReactTable<TData>({
    data,
    columns,
    ...(getRowId ? { getRowId } : {}),
    state: controlledState.state,
    onSortingChange: controlledState.onSortingChange,
    onColumnFiltersChange: controlledState.onColumnFiltersChange,
    onColumnVisibilityChange: controlledState.onColumnVisibilityChange,
    onRowSelectionChange: controlledState.onRowSelectionChange,
    onGlobalFilterChange: controlledState.onGlobalFilterChange,
    onPaginationChange: controlledState.onPaginationChange,
    getCoreRowModel: getCoreRowModel(),
    ...(manualSorting || !enableSorting ? {} : { getSortedRowModel: getSortedRowModel() }),
    ...(manualFiltering || (!enableGlobalFilter && !enableColumnFilters)
      ? {}
      : { getFilteredRowModel: getFilteredRowModel() }),
    ...(manualPagination || !enablePagination
      ? {}
      : { getPaginationRowModel: getPaginationRowModel() }),
    enableSorting,
    enableMultiSort,
    enableColumnFilters,
    enableGlobalFilter,
    enableRowSelection,
    enableHiding: enableColumnVisibility,
    enableColumnResizing,
    columnResizeDirection: getDirection(locale),
    defaultColumn: {
      minSize: 0,
      maxSize: 960,
    },
    manualSorting,
    manualFiltering,
    manualPagination,
    ...(manualPagination && pageCount !== undefined ? { pageCount } : {}),
    initialState: {
      sorting: defaultState.sorting,
      columnFilters: defaultState.columnFilters,
      columnVisibility: defaultState.columnVisibility,
      rowSelection: defaultState.rowSelection,
      globalFilter: defaultState.globalFilter,
      pagination: defaultState.pagination,
    },
  });
}
