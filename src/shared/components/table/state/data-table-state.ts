import type { DataTableState } from "../types";
import type {
  ColumnFiltersState,
  PaginationState,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";

export const DEFAULT_PAGE_SIZE = 10;

export const DEFAULT_DATA_TABLE_STATE: DataTableState = {
  sorting: [],
  columnFilters: [],
  columnVisibility: {},
  rowSelection: {},
  globalFilter: "",
  pagination: {
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  },
};

/** URL query keys — short names keep shareable links compact. */
export const DATA_TABLE_QUERY_KEYS = {
  sort: "sort",
  filters: "filters",
  visibility: "cols",
  selection: "sel",
  globalFilter: "q",
  page: "page",
  pageSize: "pageSize",
} as const;

export function createDataTableState(initial?: Partial<DataTableState>): DataTableState {
  return {
    sorting: initial?.sorting ?? DEFAULT_DATA_TABLE_STATE.sorting,
    columnFilters: initial?.columnFilters ?? DEFAULT_DATA_TABLE_STATE.columnFilters,
    columnVisibility: initial?.columnVisibility ?? DEFAULT_DATA_TABLE_STATE.columnVisibility,
    rowSelection: initial?.rowSelection ?? DEFAULT_DATA_TABLE_STATE.rowSelection,
    globalFilter: initial?.globalFilter ?? DEFAULT_DATA_TABLE_STATE.globalFilter,
    pagination: {
      pageIndex: initial?.pagination?.pageIndex ?? DEFAULT_DATA_TABLE_STATE.pagination.pageIndex,
      pageSize: initial?.pagination?.pageSize ?? DEFAULT_DATA_TABLE_STATE.pagination.pageSize,
    },
  };
}

function parseSorting(value: string | null): SortingState {
  if (!value) return [];

  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [id, direction] = entry.split(":");
      if (!id) return null;
      return { id, desc: direction === "desc" };
    })
    .filter((entry): entry is SortingState[number] => entry !== null);
}

function serializeSorting(sorting: SortingState): string | undefined {
  if (sorting.length === 0) return undefined;
  return sorting.map(({ id, desc }) => `${id}:${desc ? "desc" : "asc"}`).join(",");
}

function parseColumnFilters(value: string | null): ColumnFiltersState {
  if (!value) return [];

  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is ColumnFiltersState[number] =>
        typeof item === "object" &&
        item !== null &&
        "id" in item &&
        typeof (item as { id: unknown }).id === "string",
    );
  } catch {
    return [];
  }
}

function serializeColumnFilters(filters: ColumnFiltersState): string | undefined {
  if (filters.length === 0) return undefined;
  return JSON.stringify(filters);
}

function parseVisibility(value: string | null): VisibilityState {
  if (!value) return {};

  return value.split(",").reduce<VisibilityState>((acc, columnId) => {
    const id = columnId.trim();
    if (id) acc[id] = false;
    return acc;
  }, {});
}

function serializeVisibility(visibility: VisibilityState): string | undefined {
  const hidden = Object.entries(visibility)
    .filter(([, visible]) => visible === false)
    .map(([id]) => id);

  if (hidden.length === 0) return undefined;
  return hidden.join(",");
}

function parseRowSelection(value: string | null): RowSelectionState {
  if (!value) return {};

  return value.split(",").reduce<RowSelectionState>((acc, rowId) => {
    const id = rowId.trim();
    if (id) acc[id] = true;
    return acc;
  }, {});
}

function serializeRowSelection(selection: RowSelectionState): string | undefined {
  const selected = Object.entries(selection)
    .filter(([, isSelected]) => isSelected)
    .map(([id]) => id);

  if (selected.length === 0) return undefined;
  return selected.join(",");
}

function parsePagination(
  pageValue: string | null,
  pageSizeValue: string | null,
  current: PaginationState,
): PaginationState {
  const pageIndex = pageValue ? Math.max(0, Number.parseInt(pageValue, 10) - 1) : current.pageIndex;
  const pageSize = pageSizeValue
    ? Math.max(1, Number.parseInt(pageSizeValue, 10))
    : current.pageSize;

  return {
    pageIndex: Number.isNaN(pageIndex) ? current.pageIndex : pageIndex,
    pageSize: Number.isNaN(pageSize) ? current.pageSize : pageSize,
  };
}

/**
 * Reads table state from URL search params (or a query string).
 *
 * Useful for SSR: parse on the server from `searchParams`, pass as `initialState`
 * to `useDataTableState`, then enable `useDataTableUrlState` on the client.
 */
export function parseDataTableSearchParams(
  input: URLSearchParams | string,
  initial?: Partial<DataTableState>,
): DataTableState {
  const params = typeof input === "string" ? new URLSearchParams(input) : input;
  const base = createDataTableState(initial);

  return {
    sorting: parseSorting(params.get(DATA_TABLE_QUERY_KEYS.sort)),
    columnFilters: parseColumnFilters(params.get(DATA_TABLE_QUERY_KEYS.filters)),
    columnVisibility: parseVisibility(params.get(DATA_TABLE_QUERY_KEYS.visibility)),
    rowSelection: parseRowSelection(params.get(DATA_TABLE_QUERY_KEYS.selection)),
    globalFilter: params.get(DATA_TABLE_QUERY_KEYS.globalFilter) ?? base.globalFilter,
    pagination: parsePagination(
      params.get(DATA_TABLE_QUERY_KEYS.page),
      params.get(DATA_TABLE_QUERY_KEYS.pageSize),
      base.pagination,
    ),
  };
}

/**
 * Writes table state into URL search params. Omits keys whose values match defaults.
 */
export function applyDataTableStateToSearchParams(
  state: DataTableState,
  params: URLSearchParams,
): URLSearchParams {
  const next = new URLSearchParams(params);

  const setOrDelete = (key: string, value: string | undefined) => {
    if (value === undefined || value === "") next.delete(key);
    else next.set(key, value);
  };

  setOrDelete(DATA_TABLE_QUERY_KEYS.sort, serializeSorting(state.sorting));
  setOrDelete(DATA_TABLE_QUERY_KEYS.filters, serializeColumnFilters(state.columnFilters));
  setOrDelete(DATA_TABLE_QUERY_KEYS.visibility, serializeVisibility(state.columnVisibility));
  setOrDelete(DATA_TABLE_QUERY_KEYS.selection, serializeRowSelection(state.rowSelection));
  setOrDelete(
    DATA_TABLE_QUERY_KEYS.globalFilter,
    state.globalFilter ? state.globalFilter : undefined,
  );

  if (state.pagination.pageIndex > 0) {
    next.set(DATA_TABLE_QUERY_KEYS.page, String(state.pagination.pageIndex + 1));
  } else {
    next.delete(DATA_TABLE_QUERY_KEYS.page);
  }

  if (state.pagination.pageSize !== DEFAULT_PAGE_SIZE) {
    next.set(DATA_TABLE_QUERY_KEYS.pageSize, String(state.pagination.pageSize));
  } else {
    next.delete(DATA_TABLE_QUERY_KEYS.pageSize);
  }

  return next;
}
