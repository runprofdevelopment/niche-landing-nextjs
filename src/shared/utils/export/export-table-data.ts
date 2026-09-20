import { notify } from "@/shared/components";

import { getVisibleExportFields } from "./get-visible-export-fields";

import type { GetVisibleExportFieldsOptions } from "./get-visible-export-fields";
import type { UseErrorHandlerResult } from "@/services/error-handling";
import type { Table } from "@tanstack/react-table";

/** Server-style filter bag (matches GraphQL `FilterInput` shape). */
export type ExportFilterInput = {
  conditions?: Array<{
    field: string;
    operator: string;
    value: unknown;
  }>;
};

export type ExportTableDataResult = { downloadLink: string };

export type ExportTableDataPayload = {
  /** Selected row ids, or `undefined` when nothing is selected. */
  documentIds?: string[];
  /** API field names for visible columns. */
  fields: string[];
  /** Server filters for the current table view. */
  filters?: ExportFilterInput;
};

export type ExportTableDataOptions<TData> = {
  table: Table<TData>;
  exportFn: (payload: ExportTableDataPayload) => Promise<ExportTableDataResult>;
  t: (key: string) => string;
  handleError: UseErrorHandlerResult["handleError"];
  /** Optional column-id → API-field mapping for the export payload. */
  fieldMap?: GetVisibleExportFieldsOptions["fieldMap"];
  excludeColumnIds?: GetVisibleExportFieldsOptions["excludeColumnIds"];
  /** Server filters matching the current table query. */
  filters?: ExportFilterInput;
};

async function exportTableData<TData>({
  table,
  exportFn,
  t,
  handleError,
  fieldMap,
  excludeColumnIds,
  filters,
}: ExportTableDataOptions<TData>): Promise<void> {
  const selectedIds = table.getSelectedRowModel().rows.map((row) => row.id);
  const fields = getVisibleExportFields(table, {
    ...(fieldMap ? { fieldMap } : {}),
    ...(excludeColumnIds ? { excludeColumnIds } : {}),
  });

  const payload: ExportTableDataPayload = {
    fields,
    ...(selectedIds.length > 0 ? { documentIds: selectedIds } : {}),
    ...(filters ? { filters } : {}),
  };

  try {
    const { downloadLink } = await exportFn(payload);
    if (downloadLink && downloadLink !== "#") {
      window.open(downloadLink, "_blank");
    }
    notify.success({ title: t("exportSuccessMessage") });
  } catch (error) {
    handleError(error, { context: { feature: "dataTable", action: "export" } });
  }
}

export { exportTableData };
