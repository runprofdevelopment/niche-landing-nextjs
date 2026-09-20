"use client";

import { useState } from "react";

import { useTranslations } from "@/hooks/useTranslations";
import { useErrorHandler } from "@/services/error-handling";
import {
  createTableCsvExportFn,
  exportTableData,
  type ExportFilterInput,
} from "@/shared/utils/export";

import type { Table } from "@tanstack/react-table";

type UseTableExportOptions = {
  collectionName: string;
  fieldMap?: Record<string, string>;
  excludeColumnIds?: string[];
  filters?: ExportFilterInput;
};

type UseTableExportResult = {
  exporting: boolean;
  onExport: () => Promise<void>;
};

/** Export visible/selected rows as CSV (mock until backend export API is wired). */
export function useTableExport<TData>(
  table: Table<TData>,
  options: UseTableExportOptions,
): UseTableExportResult {
  const t = useTranslations("dataTable");
  const { handleError } = useErrorHandler();
  const [exporting, setExporting] = useState(false);

  const onExport = async () => {
    setExporting(true);
    try {
      await exportTableData({
        table,
        t: (key) => t(key),
        handleError,
        exportFn: createTableCsvExportFn(table, {
          collectionName: options.collectionName,
          ...(options.fieldMap ? { fieldMap: options.fieldMap } : {}),
        }),
        ...(options.fieldMap ? { fieldMap: options.fieldMap } : {}),
        ...(options.excludeColumnIds ? { excludeColumnIds: options.excludeColumnIds } : {}),
        ...(options.filters ? { filters: options.filters } : {}),
      });
    } finally {
      setExporting(false);
    }
  };

  return { exporting, onExport };
}
