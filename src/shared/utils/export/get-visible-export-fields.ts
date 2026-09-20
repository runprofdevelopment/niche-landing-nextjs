import type { Table } from "@tanstack/react-table";

export type GetVisibleExportFieldsOptions = {
  /** Column id → API field name for the export payload. */
  fieldMap?: Record<string, string>;
  /** Column ids to skip (in addition to select/actions). */
  excludeColumnIds?: string[];
};

const DEFAULT_EXCLUDED = new Set(["select", "actions"]);

/**
 * Returns API field names for currently visible leaf columns, mapped through
 * `fieldMap` when provided.
 */
export function getVisibleExportFields<TData>(
  table: Table<TData>,
  options: GetVisibleExportFieldsOptions = {},
): string[] {
  const fieldMap = options.fieldMap ?? {};
  const excluded = new Set([...DEFAULT_EXCLUDED, ...(options.excludeColumnIds ?? [])]);

  return table
    .getVisibleLeafColumns()
    .map((column) => column.id)
    .filter((id) => Boolean(id) && !excluded.has(id))
    .map((id) => fieldMap[id] ?? id);
}
