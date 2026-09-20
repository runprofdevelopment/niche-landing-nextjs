import type {
  ColumnDef,
  ColumnFiltersState,
  OnChangeFn,
  PaginationState,
  RowData,
  RowSelectionState,
  SortingState,
  TableOptions,
  VisibilityState,
} from "@tanstack/react-table";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line unused-imports/no-unused-vars -- required for interface augmentation to merge with TanStack's declaration
  interface ColumnMeta<TData extends RowData, TValue> {
    /**
     * Readable name shown in the column-visibility dropdown and the
     * search-column picker. Falls back to a string `header` or the column
     * `id`/`accessorKey` when omitted — set this whenever `header` is a
     * component (e.g. `DataTableColumnHeader`).
     */
    label?: string;
    /**
     * Text alignment shared by the header and every cell in this column, so
     * they always line up. Defaults to `center`; set `start` for
     * long-text columns like names where centering hurts readability.
     */
    align?: "start" | "center" | "end";
    /**
     * When true (default), cell content truncates to the column width and the
     * full value is shown in a hover tooltip. Set `false` for controls
     * (checkboxes, row actions) that must not clip.
     */
    truncate?: boolean;
  }
}

/**
 * Serializable table UI state owned by the product layer.
 *
 * Pass slices of this object into `useDataTable` for full control, or use
 * `useDataTableState` / `useDataTableUrlState` to manage it for you.
 */
export type DataTableState = {
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  columnVisibility: VisibilityState;
  rowSelection: RowSelectionState;
  globalFilter: string;
  pagination: PaginationState;
};

export type DataTableStateHandlers = {
  onSortingChange: OnChangeFn<SortingState>;
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>;
  onColumnVisibilityChange: OnChangeFn<VisibilityState>;
  onRowSelectionChange: OnChangeFn<RowSelectionState>;
  onGlobalFilterChange: OnChangeFn<string>;
  onPaginationChange: OnChangeFn<PaginationState>;
};

export type DataTableControlledState = {
  state: DataTableState;
} & DataTableStateHandlers;

export type DataTableControlledStateInput = {
  state?: Partial<DataTableState>;
} & Partial<DataTableStateHandlers>;

export type DataTableFeatureOptions = {
  enableSorting?: boolean;
  enableColumnFilters?: boolean;
  enableGlobalFilter?: boolean;
  enablePagination?: boolean;
  enableRowSelection?: boolean | ((row: { original: unknown }) => boolean);
  enableColumnVisibility?: boolean;
  enableMultiSort?: boolean;
  /** Drag a header edge to resize the column; body cells follow the same width. */
  enableColumnResizing?: boolean;
};

export type DataTableManualOptions = {
  /** Server provides pre-sorted data — disable client sort model. */
  manualSorting?: boolean;
  /** Server applies filters — disable client filter model. */
  manualFiltering?: boolean;
  /** Server paginates — pass `pageCount` from the API. */
  manualPagination?: boolean;
  pageCount?: number;
};

export type UseDataTableOptions<TData, TValue = unknown> = {
  data: TData[];
  columns: ColumnDef<TData, TValue>[];
  getRowId?: TableOptions<TData>["getRowId"];
  initialState?: Partial<DataTableState>;
  controlledState?: DataTableControlledStateInput;
} & DataTableFeatureOptions &
  DataTableManualOptions;

export type DataTableUrlStateOptions = {
  /** Query-string key used to store serialized state (default: `table`). */
  paramKey?: string;
  /** When false, state is read from the URL but not written (SSR hydration). */
  syncToUrl?: boolean;
};

export type DataTableFilterOption = {
  value: string;
  label: string;
};

export type DataTableDateRange = {
  from?: Date;
  to?: Date;
};

type DataTableFilterDefBase = {
  /** Must match the target column's `id`. */
  id: string;
  label: string;
};

export type DataTableSelectFilterDef = DataTableFilterDefBase & {
  type: "select";
  options: DataTableFilterOption[];
  placeholder?: string;
};

export type DataTableMultiSelectFilterDef = DataTableFilterDefBase & {
  type: "multiSelect";
  options: DataTableFilterOption[];
  placeholder?: string;
};

export type DataTableDateRangeFilterDef = DataTableFilterDefBase & {
  type: "dateRange";
};

export type DataTableSwitchFilterDef = DataTableFilterDefBase & {
  type: "switch";
};

export type DataTableInputFilterDef = DataTableFilterDefBase & {
  type: "input";
  /** Switches the native input's keyboard/validation; the filter value is still matched as a substring either way. */
  inputType?: "text" | "number";
  placeholder?: string;
};

export type DataTableAsyncSelectFilterDef = DataTableFilterDefBase & {
  type: "asyncSelect";
  options: DataTableFilterOption[];
  placeholder?: string;
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onSearchChange?: (query: string) => void;
};

export type DataTableDependentSelectValue = {
  parent?: string;
  child?: string;
};

export type DataTableAsyncSelectSource = {
  options: DataTableFilterOption[];
  loading?: boolean;
  hasMore?: boolean;
  loadMore?: () => void;
};

export type DataTableDependentSelectFieldDef = {
  label?: string;
  placeholder?: string;
  options: DataTableFilterOption[];
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onSearchChange?: (query: string) => void;
};

/** Two linked async selects — child options depend on the selected parent value. */
export type DataTableDependentSelectFilterDef = DataTableFilterDefBase & {
  type: "dependentSelect";
  parent: DataTableDependentSelectFieldDef;
  child: {
    label?: string;
    placeholder?: string;
    /** Options for the applied parent — used in active-filter chip labels. */
    optionsForDisplay?: DataTableFilterOption[];
    context?: Record<string, unknown>;
    useOptions(parentId?: string, context?: Record<string, unknown>): DataTableAsyncSelectSource;
  };
  parentColumnId: string;
  childColumnId: string;
};

/** One entry of the array passed to `DataTableFilters`/`DataTableActiveFilters`. */
export type DataTableFilterDef =
  | DataTableSelectFilterDef
  | DataTableMultiSelectFilterDef
  | DataTableDateRangeFilterDef
  | DataTableSwitchFilterDef
  | DataTableInputFilterDef
  | DataTableAsyncSelectFilterDef
  | DataTableDependentSelectFilterDef;
