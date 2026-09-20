"use client";
"use no memo";

import { useCallback, useMemo, useState } from "react";

import { createDataTableState } from "../state";

import type { DataTableControlledState, DataTableState } from "../types";
import type {
  ColumnFiltersState,
  PaginationState,
  RowSelectionState,
  SortingState,
  Updater,
  VisibilityState,
} from "@tanstack/react-table";

function resolveUpdater<T>(updater: Updater<T>, previous: T): T {
  if (typeof updater === "function") {
    return (updater as (value: T) => T)(previous);
  }
  return updater;
}

/**
 * Local React state for a data table.
 *
 * Product UI owns the state object and passes it to `useDataTable` via
 * `controlledState`. Swap this hook for `useDataTableUrlState` when the
 * same state should live in the URL.
 */
export function useDataTableState(initial?: Partial<DataTableState>): DataTableControlledState {
  const [state, setState] = useState<DataTableState>(() => createDataTableState(initial));

  const patchState = useCallback((patch: Partial<DataTableState>) => {
    setState((previous) => ({ ...previous, ...patch }));
  }, []);

  const onSortingChange = useCallback((updater: Updater<SortingState>) => {
    setState((previous) => ({
      ...previous,
      sorting: resolveUpdater(updater, previous.sorting),
    }));
  }, []);

  const onColumnFiltersChange = useCallback((updater: Updater<ColumnFiltersState>) => {
    setState((previous) => ({
      ...previous,
      columnFilters: resolveUpdater(updater, previous.columnFilters),
      pagination: { ...previous.pagination, pageIndex: 0 },
    }));
  }, []);

  const onColumnVisibilityChange = useCallback((updater: Updater<VisibilityState>) => {
    setState((previous) => ({
      ...previous,
      columnVisibility: resolveUpdater(updater, previous.columnVisibility),
    }));
  }, []);

  const onRowSelectionChange = useCallback((updater: Updater<RowSelectionState>) => {
    setState((previous) => ({
      ...previous,
      rowSelection: resolveUpdater(updater, previous.rowSelection),
    }));
  }, []);

  const onGlobalFilterChange = useCallback((updater: Updater<string>) => {
    setState((previous) => ({
      ...previous,
      globalFilter: resolveUpdater(updater, previous.globalFilter),
      pagination: { ...previous.pagination, pageIndex: 0 },
    }));
  }, []);

  const onPaginationChange = useCallback((updater: Updater<PaginationState>) => {
    setState((previous) => ({
      ...previous,
      pagination: resolveUpdater(updater, previous.pagination),
    }));
  }, []);

  return useMemo(
    () => ({
      state,
      patchState,
      onSortingChange,
      onColumnFiltersChange,
      onColumnVisibilityChange,
      onRowSelectionChange,
      onGlobalFilterChange,
      onPaginationChange,
    }),
    [
      state,
      patchState,
      onSortingChange,
      onColumnFiltersChange,
      onColumnVisibilityChange,
      onRowSelectionChange,
      onGlobalFilterChange,
      onPaginationChange,
    ],
  );
}

export type UseDataTableStateResult = ReturnType<typeof useDataTableState>;
