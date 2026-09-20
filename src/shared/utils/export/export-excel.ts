import type { ExportFilterInput, ExportTableDataResult } from "./export-table-data";
import type { Table } from "@tanstack/react-table";

export type ExportExcelArgs = {
  collectionName: string;
  fields: string[];
  documentIds?: string[];
  filters?: ExportFilterInput;
  /** Optional matrix of row values aligned to `fields` (mock / client export). */
  rows?: string[][];
};

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

function toCsv(headers: string[], rows: string[][]): string {
  const lines = [
    headers.map(escapeCsvCell).join(","),
    ...rows.map((row) => row.map((cell) => escapeCsvCell(cell ?? "")).join(",")),
  ];
  return `\uFEFF${lines.join("\n")}`;
}

function triggerDownload(blob: Blob, fileName: string): string {
  const downloadLink = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = downloadLink;
  anchor.download = fileName;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Revoke after the browser has a chance to start the download.
  window.setTimeout(() => URL.revokeObjectURL(downloadLink), 30_000);
  return downloadLink;
}

/**
 * Export helper.
 *
 * When a backend export API exists, swap the body to POST and return its
 * `downloadLink`. Until then this builds a CSV client-side from `rows`
 * (or headers-only when rows are omitted).
 */
export async function exportExcel(args: ExportExcelArgs): Promise<ExportTableDataResult> {
  const headers = args.fields.length > 0 ? args.fields : ["id"];
  const rows = args.rows ?? args.documentIds?.map((id) => [id]) ?? [];
  const csv = toCsv(headers, rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const stamp = new Date().toISOString().slice(0, 10);
  const downloadLink = triggerDownload(blob, `${args.collectionName}-${stamp}.csv`);
  // Filename is applied via the temporary <a download>; callers that `window.open`
  // the link can skip when the value is "#".
  void downloadLink;
  return { downloadLink: "#" };
}

type CreateTableCsvExportFnOptions = {
  collectionName: string;
  /** Column id → API field (same map passed to `exportTableData`). */
  fieldMap?: Record<string, string>;
};

/**
 * Builds an `exportFn` that serializes the current table rows to CSV.
 * Uses selected rows when any are selected; otherwise uses the filtered model.
 */
export function createTableCsvExportFn<TData>(
  table: Table<TData>,
  options: CreateTableCsvExportFnOptions,
): (payload: {
  documentIds?: string[];
  fields: string[];
  filters?: ExportFilterInput;
}) => Promise<ExportTableDataResult> {
  const fieldMap = options.fieldMap ?? {};
  const reverseMap = Object.fromEntries(
    Object.entries(fieldMap).map(([columnId, apiField]) => [apiField, columnId]),
  );

  return async ({ documentIds, fields, filters }) => {
    const selected = new Set(documentIds ?? []);
    const sourceRows =
      selected.size > 0 ? table.getSelectedRowModel().rows : table.getFilteredRowModel().rows;

    const rows = sourceRows.map((row) =>
      fields.map((field) => {
        const columnId = reverseMap[field] ?? field;
        try {
          const value = row.getValue(columnId);
          if (value == null) return "";
          if (
            typeof value === "string" ||
            typeof value === "number" ||
            typeof value === "boolean"
          ) {
            return String(value);
          }
          return JSON.stringify(value);
        } catch {
          const original = row.original as Record<string, unknown>;
          const fallback = original?.[columnId] ?? original?.[field];
          return fallback == null ? "" : String(fallback);
        }
      }),
    );

    return exportExcel({
      collectionName: options.collectionName,
      fields,
      rows,
      ...(documentIds ? { documentIds } : {}),
      ...(filters ? { filters } : {}),
    });
  };
}
