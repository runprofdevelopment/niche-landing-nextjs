"use client";
"use no memo";

import { useCallback, useMemo } from "react";

import { usePathname, useRouter, useSearchParams } from "@/providers/i18n";

import {
  applyDataTableStateToSearchParams,
  createDataTableState,
  parseDataTableSearchParams,
} from "../state";

import type { DataTableControlledState, DataTableState, DataTableUrlStateOptions } from "../types";
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
 * URL-backed table state — reads from `searchParams` and writes via the router.
 *
 * Server components can parse the same params with `parseDataTableSearchParams`
 * and pass the result as `initial` for consistent hydration.
 */
export function useDataTableUrlState(
  initial?: Partial<DataTableState>,
  options: DataTableUrlStateOptions = {},
): DataTableControlledState {
  const { paramKey: _paramKey = "table", syncToUrl = true } = options;
  void _paramKey;

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const searchParamsString = searchParams.toString();

  const state = useMemo(
    () => parseDataTableSearchParams(searchParamsString, initial),
    [searchParamsString, initial],
  );

  const readCurrentState = useCallback(
    () => parseDataTableSearchParams(searchParamsString, initial),
    [searchParamsString, initial],
  );

  const commitState = useCallback(
    (next: DataTableState) => {
      if (!syncToUrl) return;

      const params = applyDataTableStateToSearchParams(
        next,
        new URLSearchParams(searchParamsString),
      );
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParamsString, syncToUrl],
  );

  const patchState = useCallback(
    (patch: Partial<DataTableState>) => {
      commitState({ ...readCurrentState(), ...patch });
    },
    [commitState, readCurrentState],
  );

  const onSortingChange = useCallback(
    (updater: Updater<SortingState>) => {
      const current = readCurrentState();
      commitState({
        ...current,
        sorting: resolveUpdater(updater, current.sorting),
      });
    },
    [commitState, readCurrentState],
  );

  const onColumnFiltersChange = useCallback(
    (updater: Updater<ColumnFiltersState>) => {
      const current = readCurrentState();
      commitState({
        ...current,
        columnFilters: resolveUpdater(updater, current.columnFilters),
        pagination: { ...current.pagination, pageIndex: 0 },
      });
    },
    [commitState, readCurrentState],
  );

  const onColumnVisibilityChange = useCallback(
    (updater: Updater<VisibilityState>) => {
      const current = readCurrentState();
      commitState({
        ...current,
        columnVisibility: resolveUpdater(updater, current.columnVisibility),
      });
    },
    [commitState, readCurrentState],
  );

  const onRowSelectionChange = useCallback(
    (updater: Updater<RowSelectionState>) => {
      const current = readCurrentState();
      commitState({
        ...current,
        rowSelection: resolveUpdater(updater, current.rowSelection),
      });
    },
    [commitState, readCurrentState],
  );

  const onGlobalFilterChange = useCallback(
    (updater: Updater<string>) => {
      const current = readCurrentState();
      commitState({
        ...current,
        globalFilter: resolveUpdater(updater, current.globalFilter),
        pagination: { ...current.pagination, pageIndex: 0 },
      });
    },
    [commitState, readCurrentState],
  );

  const onPaginationChange = useCallback(
    (updater: Updater<PaginationState>) => {
      const current = readCurrentState();
      commitState({
        ...current,
        pagination: resolveUpdater(updater, current.pagination),
      });
    },
    [commitState, readCurrentState],
  );

  const resetState = useCallback(() => {
    commitState(createDataTableState(initial));
  }, [commitState, initial]);

  return useMemo(
    () => ({
      state,
      patchState,
      resetState,
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
      resetState,
      onSortingChange,
      onColumnFiltersChange,
      onColumnVisibilityChange,
      onRowSelectionChange,
      onGlobalFilterChange,
      onPaginationChange,
    ],
  );
}

export type UseDataTableUrlStateResult = ReturnType<typeof useDataTableUrlState>;
