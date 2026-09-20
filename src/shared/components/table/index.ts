/**
 * Headless data table built on @tanstack/react-table.
 *
 * - `useDataTable` — column defs, row models, sorting, filtering, pagination,
 *   selection, column visibility, and column resizing without prescribing markup.
 * - `useDataTableState` / `useDataTableUrlState` — product-owned or URL-synced state.
 * - `DataTable` — accessible `<table>` rendering; compose or replace freely.
 */

export type {
  DataTableControlledState,
  DataTableDateRange,
  DataTableDateRangeFilterDef,
  DataTableFeatureOptions,
  DataTableFilterDef,
  DataTableFilterOption,
  DataTableInputFilterDef,
  DataTableManualOptions,
  DataTableMultiSelectFilterDef,
  DataTableSelectFilterDef,
  DataTableAsyncSelectFilterDef,
  DataTableDependentSelectFilterDef,
  DataTableDependentSelectValue,
  DataTableAsyncSelectSource,
  DataTableDependentSelectFieldDef,
  DataTableState,
  DataTableStateHandlers,
  DataTableSwitchFilterDef,
  DataTableUrlStateOptions,
  UseDataTableOptions,
} from "./types";

export {
  DEFAULT_DATA_TABLE_STATE,
  DEFAULT_PAGE_SIZE,
  DATA_TABLE_QUERY_KEYS,
  applyDataTableStateToSearchParams,
  createDataTableState,
  parseDataTableSearchParams,
} from "./state";

export {
  useDataTable,
  useDataTableState,
  useDataTableUrlState,
  type UseDataTableStateResult,
  type UseDataTableUrlStateResult,
} from "./hooks";

export {
  createAccessorColumn,
  createDisplayColumn,
  createSelectColumn,
  getColumnLabel,
  SELECT_COLUMN_ID,
} from "./columns";

export { DataTable } from "./data-table";
export { DataTableView } from "./data-table-view";
export { DataTableCell } from "./data-table-cell";
export { DataTableColumnHeader } from "./data-table-column-header";
export { DataTableToolbar } from "./data-table-toolbar";
export { DataTableSearch } from "./data-table-search";
export { DataTablePagination } from "./data-table-pagination";
export {
  TableRowActionsTrigger,
  type TableRowActionsTriggerProps,
} from "./table-row-actions-trigger";
export { DataTableDemoTabs, DataTableLocalDemo, DataTableUrlDemo } from "./data-table-demo";

export {
  DataTableFilters,
  DataTableActiveFilters,
  DataTableFilterControl,
  dataTableFilterFns,
  multiSelectFilterFn,
  dateRangeFilterFn,
  isFilterValueActive,
  formatFilterValue,
  getFilterValueFromTable,
  setFilterValueOnTable,
} from "./filters";

export { flexRender } from "@tanstack/react-table";
export type { ColumnDef, Row, Table } from "@tanstack/react-table";
