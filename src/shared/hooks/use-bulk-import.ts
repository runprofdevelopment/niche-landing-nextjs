"use client";

/**
 * Drives a `BulkImportDialog` end to end: file selection, template download,
 * upload with progress, success/partial-error/failure toasts, and auto-close
 * on a clean success. This is the one place that owns that state machine —
 * features should not reimplement it.
 *
 * Usage in a feature's actions component:
 *
 * ```tsx
 * const bulkImport = useBulkImport<FleetVehicle>({
 *   downloadTemplateFn: downloadFleetInventoryBulkImportTemplate,
 *   fallbackTemplateFileName: t('bulkImportTemplateName'),
 *   fallbackTemplateMeta: t('bulkImportTemplateMeta'),
 *   importFn: (file, { onProgress }) =>
 *     bulkImportFleetInventory(file, { onProgress }),
 *   onImported,
 *   handleError,
 *   errorContext: { feature: 'fleet', action: 'bulkImportFleetInventory' },
 *   successMessage: tData('importSuccessMessage'),
 *   formatUploadedMeta: ({ count, size }) => t('bulkImportUploadedMeta', { count, size }),
 * });
 *
 * <BulkImportDialog
 *   {...bulkImport.dialogProps}
 *   title={t('bulkImportTitle')}
 *   downloadStepTitle={t('bulkImportDownloadStepTitle')}
 *   // ...remaining label props are entity copy, supplied by the caller
 * />
 * ```
 *
 * `templateFileName`/`templateFileMeta` in `dialogProps` reflect the backend's
 * real filename and file size (fetched when the dialog opens), falling back
 * to the two strings above until that resolves or if it fails.
 *
 * For a brand-new module, pair this with `bulkImportRest`/`downloadBulkImportTemplate`
 * from `@/shared/utils` (see that file's doc comment for the REST convention).
 */

import { useCallback, useEffect, useRef, useState } from "react";

import { notify } from "@/shared/components";
import {
  downloadImportTemplate,
  formatBytes,
  formatBulkImportValidationIssues,
  type BulkImportValidationIssue,
  type DownloadTemplateResult,
} from "@/shared/utils";

import type { UseErrorHandlerResult } from "@/services/error-handling";

export type BulkImportOutcome<TRow> = {
  message: string;
  importedCount: number;
  errors: BulkImportValidationIssue[];
  rows: TRow[];
};

export type UseBulkImportOptions<TRow> = {
  /** Fetches the downloadable template — typically `downloadBulkImportTemplate(entityPath)`. */
  downloadTemplateFn: () => Promise<DownloadTemplateResult>;
  /** Shown until the backend's real filename/size load, or if that fetch fails. */
  fallbackTemplateFileName: string;
  fallbackTemplateMeta: string;
  /** Uploads the file and returns the outcome — typically wraps `bulkImportRest(entityPath, file, mapRecord, options)`. */
  importFn: (
    file: File,
    options: { onProgress: (progress: number) => void },
  ) => Promise<BulkImportOutcome<TRow>>;
  /** Called once with every successfully-imported row, e.g. to prepend them to a table. */
  onImported?: (rows: TRow[]) => void;
  handleError: UseErrorHandlerResult["handleError"];
  /** Error-context tags passed to `handleError`, e.g. `{ feature: 'fleet', action: 'bulkImportFleetInventory' }`. */
  errorContext: { feature: string; action: string };
  /** Fallback toast title when the backend response doesn't include a `message`. */
  successMessage: string;
  /** Builds the "{count} vehicles · {size}" label shown after a successful upload. Defaults to just the file size. */
  formatUploadedMeta?: (params: { count: number; size: string }) => string;
  /** Delay before auto-closing the dialog after a fully-successful upload. @default 700 */
  autoCloseDelayMs?: number;
};

function useBulkImport<TRow>({
  downloadTemplateFn,
  fallbackTemplateFileName,
  fallbackTemplateMeta,
  importFn,
  onImported,
  handleError,
  errorContext,
  successMessage,
  formatUploadedMeta,
  autoCloseDelayMs = 700,
}: UseBulkImportOptions<TRow>) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number | undefined>(undefined);
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const [templateInfo, setTemplateInfo] = useState<DownloadTemplateResult | null>(null);
  const templatePromiseRef = useRef<Promise<DownloadTemplateResult> | null>(null);
  const templateInfoRef = useRef<DownloadTemplateResult | null>(null);

  useEffect(
    () => () => {
      if (templateInfoRef.current) {
        URL.revokeObjectURL(templateInfoRef.current.downloadLink);
      }
    },
    [],
  );

  // Re-fetched fresh every time the dialog opens, so an updated backend
  // template is always reflected instead of showing a stale cached copy.
  const fetchTemplate = useCallback(() => {
    templatePromiseRef.current ??= downloadTemplateFn().then((result) => {
      if (templateInfoRef.current) {
        URL.revokeObjectURL(templateInfoRef.current.downloadLink);
      }
      templateInfoRef.current = result;
      setTemplateInfo(result);
      return result;
    });
    return templatePromiseRef.current;
  }, [downloadTemplateFn]);

  const openDialog = useCallback(() => {
    setFile(null);
    setProgress(undefined);
    setImportedCount(null);
    setTemplateInfo(null);
    templatePromiseRef.current = null;
    setOpen(true);
    void fetchTemplate();
  }, [fetchTemplate]);

  const handleFileChange = useCallback((next: File | null) => {
    setFile(next);
    setProgress(undefined);
    setImportedCount(null);
  }, []);

  const handleDownloadTemplate = useCallback(async () => {
    setDownloading(true);
    try {
      await downloadImportTemplate({ handleError, downloadTemplateFn: fetchTemplate });
    } finally {
      setDownloading(false);
    }
  }, [fetchTemplate, handleError]);

  const handleUpload = useCallback(async () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);

    try {
      const result = await importFn(file, { onProgress: setProgress });

      setImportedCount(result.importedCount);
      setProgress(100);

      if (result.importedCount > 0) {
        onImported?.(result.rows);
      }

      if (result.errors.length > 0) {
        notify.error({
          title: result.message || successMessage,
          description: formatBulkImportValidationIssues(result.errors),
        });
        return;
      }

      notify.success({ title: result.message || successMessage });
      window.setTimeout(() => setOpen(false), autoCloseDelayMs);
    } catch (error) {
      handleError(error, { context: errorContext });
    } finally {
      setUploading(false);
    }
  }, [file, importFn, onImported, successMessage, autoCloseDelayMs, errorContext, handleError]);

  const uploadedFileMeta = file
    ? importedCount != null
      ? (formatUploadedMeta?.({ count: importedCount, size: formatBytes(file.size) }) ??
        formatBytes(file.size))
      : formatBytes(file.size)
    : undefined;

  const templateFileName = templateInfo?.filename ?? fallbackTemplateFileName;
  const templateFileMeta =
    templateInfo?.size != null ? formatBytes(templateInfo.size) : fallbackTemplateMeta;

  return {
    open,
    file,
    downloading,
    uploading,
    progress,
    importedCount,
    uploadedFileMeta,
    openDialog,
    handleFileChange,
    handleDownloadTemplate,
    handleUpload,
    /** Spread directly onto `<BulkImportDialog>` — covers every non-copy prop. */
    dialogProps: {
      open,
      onOpenChange: setOpen,
      onDownloadTemplate: handleDownloadTemplate,
      downloading,
      file,
      onFileChange: handleFileChange,
      uploadedFileMeta,
      progress,
      onUpload: handleUpload,
      uploading,
      templateFileName,
      templateFileMeta,
    },
  };
}

export { useBulkImport };
