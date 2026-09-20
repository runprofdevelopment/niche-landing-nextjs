import type { UseErrorHandlerResult } from "@/services/error-handling";

export type BulkImportValidationIssue = {
  row?: number;
  field?: string;
  message: string;
};

export type DownloadTemplateResult = {
  downloadLink: string;
  filename?: string;
  size?: number | null;
};

export type BulkImportRestResult<TRow> = {
  message: string;
  importedCount: number;
  errors: BulkImportValidationIssue[];
  rows: TRow[];
};

/**
 * Triggers a browser download for a previously fetched template blob URL.
 */
export async function downloadImportTemplate(options: {
  handleError: UseErrorHandlerResult["handleError"];
  downloadTemplateFn: () => Promise<DownloadTemplateResult>;
}): Promise<void> {
  try {
    const result = await options.downloadTemplateFn();
    const anchor = document.createElement("a");
    anchor.href = result.downloadLink;
    anchor.download = result.filename ?? "import-template.xlsx";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  } catch (error) {
    options.handleError(error, {
      context: { feature: "bulk-import", action: "downloadTemplate" },
    });
  }
}

export function formatBulkImportValidationIssues(issues: BulkImportValidationIssue[]): string {
  if (issues.length === 0) return "";
  return issues
    .slice(0, 8)
    .map((issue) => {
      const row = issue.row != null ? `Row ${issue.row}` : "Row ?";
      const field = issue.field ? ` · ${issue.field}` : "";
      return `${row}${field}: ${issue.message}`;
    })
    .join("\n");
}

/**
 * Fetches a bulk-import template from the REST API.
 * Until the backend is ready, returns a CSV blob built client-side.
 */
export async function downloadBulkImportTemplate(
  entityPath: string,
  options?: { columns?: string[]; sampleRow?: string[] },
): Promise<DownloadTemplateResult> {
  const columns = options?.columns ?? ["Name", "Family Name", "Email", "Phone Number", "Gender"];
  const sample = options?.sampleRow ?? [
    "Sara Al-Farid",
    "Al-Farid",
    "sara@example.com",
    "+966501234567",
    "female",
  ];
  const csv = `${columns.join(",")}\n${sample.join(",")}\n`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const downloadLink = URL.createObjectURL(blob);
  const filename = `${entityPath.replace(/\//g, "-")}-template.csv`;

  return {
    downloadLink,
    filename,
    size: blob.size,
  };
}

type BulkImportRestOptions = {
  onProgress?: (progress: number) => void;
};

/**
 * Uploads a bulk-import file.
 * Mock implementation parses CSV locally until the backend endpoint exists.
 */
export async function bulkImportRest<TRow>(
  _entityPath: string,
  file: File,
  mapRecord: (record: Record<string, string>, index: number) => TRow | null,
  options: BulkImportRestOptions = {},
): Promise<BulkImportRestResult<TRow>> {
  options.onProgress?.(10);
  const text = await file.text();
  options.onProgress?.(40);

  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return {
      message: "The file is empty.",
      importedCount: 0,
      errors: [{ message: "No rows found in the uploaded file." }],
      rows: [],
    };
  }

  const headers = (lines[0] ?? "").split(",").map((part) => part.trim());
  const rows: TRow[] = [];
  const errors: BulkImportValidationIssue[] = [];

  for (let index = 1; index < lines.length; index += 1) {
    const values = (lines[index] ?? "").split(",").map((part) => part.trim());
    const record: Record<string, string> = {};
    headers.forEach((header, headerIndex) => {
      record[header] = values[headerIndex] ?? "";
    });

    try {
      const mapped = mapRecord(record, index + 1);
      if (mapped) rows.push(mapped);
    } catch (error) {
      errors.push({
        row: index + 1,
        message: error instanceof Error ? error.message : "Invalid row",
      });
    }
  }

  options.onProgress?.(100);

  return {
    message:
      errors.length > 0
        ? `Imported ${rows.length} row(s) with ${errors.length} issue(s).`
        : `Imported ${rows.length} row(s) successfully.`,
    importedCount: rows.length,
    errors,
    rows,
  };
}
