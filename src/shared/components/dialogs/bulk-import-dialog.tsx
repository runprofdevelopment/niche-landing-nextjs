"use client";

import { Download, FileSpreadsheet, Info, Upload } from "lucide-react";

import { useTranslations } from "@/hooks/useTranslations";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/feedback/alert";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { FileUpload } from "@/shared/components/upload/file-upload";

import type { ReactNode } from "react";

type BulkImportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  showNote?: boolean;
  downloadStepTitle: string;
  downloadStepDescription: string;
  templateFileName: string;
  templateFileMeta: string;
  templateColumnsHint: string;
  downloadLabel: string;
  onDownloadTemplate: () => void;
  downloading?: boolean;
  uploadStepTitle: string;
  uploadStepDescription: string;
  accept?: string;
  uploadHint: string;
  dropLabel?: string;
  orLabel?: string;
  browseLabel?: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  uploadedFileMeta?: string;
  progress?: number;
  cancelLabel: string;
  uploadLabel: string;
  onUpload: () => void;
  uploading?: boolean;
};

function StepMarker({ children }: { children: ReactNode }) {
  return (
    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
      {children}
    </span>
  );
}

function StepHeader({
  step,
  title,
  description,
}: {
  step: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3">
        <StepMarker>{step}</StepMarker>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
      </div>
      <p className="ps-9 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function TemplateCard({
  fileName,
  meta,
  downloadLabel,
  onDownload,
  downloading,
}: {
  fileName: string;
  meta: string;
  downloadLabel: string;
  onDownload: () => void;
  downloading?: boolean;
}) {
  return (
    <div className="flex flex-col items-stretch gap-3 rounded-xl bg-muted p-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
          <FileSpreadsheet className="size-5" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="truncate text-sm font-medium text-foreground">{fileName}</p>
          <p className="truncate text-xs text-muted-foreground">{meta}</p>
        </div>
      </div>
      <Button
        variant="outline-invert"
        size="sm"
        onClick={onDownload}
        loading={Boolean(downloading)}
        className="w-full shrink-0 gap-2 border-primary px-4 text-primary hover:bg-selected sm:w-auto"
      >
        <Download className="size-4" />
        {downloadLabel}
      </Button>
    </div>
  );
}

function BulkImportDialog({
  open,
  onOpenChange,
  title,
  showNote = true,
  downloadStepTitle,
  downloadStepDescription,
  templateFileName,
  templateFileMeta,
  templateColumnsHint,
  downloadLabel,
  onDownloadTemplate,
  downloading,
  uploadStepTitle,
  uploadStepDescription,
  accept = ".xlsx",
  uploadHint,
  dropLabel,
  orLabel,
  browseLabel,
  file,
  onFileChange,
  uploadedFileMeta,
  progress,
  cancelLabel,
  uploadLabel,
  onUpload,
  uploading,
}: BulkImportDialogProps) {
  const t = useTranslations("dataTable");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-slot="bulk-import-dialog"
        className="flex max-h-[90dvh] max-w-xl flex-col gap-0 overflow-hidden p-0 sm:rounded-lg"
      >
        <DialogHeader className="shrink-0 border-b border-border px-6 py-4">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
          {showNote ? (
            <Alert variant="info">
              <Info />
              <AlertTitle>{t("bulkImportNoteTitle")}</AlertTitle>
              <AlertDescription>{t("bulkImportNoteDescription")}</AlertDescription>
            </Alert>
          ) : null}

          <section className="flex flex-col gap-3">
            <StepHeader step="1" title={downloadStepTitle} description={downloadStepDescription} />
            <TemplateCard
              fileName={templateFileName}
              meta={templateFileMeta}
              downloadLabel={downloadLabel}
              onDownload={onDownloadTemplate}
              {...(downloading !== undefined ? { downloading } : {})}
            />
            <p className="text-xs text-muted-foreground">{templateColumnsHint}</p>
          </section>

          <div className="border-t border-border" />

          <section className="flex flex-col gap-3">
            <StepHeader step="2" title={uploadStepTitle} description={uploadStepDescription} />
            <FileUpload
              accept={accept}
              hint={uploadHint}
              {...(dropLabel !== undefined ? { dropLabel } : {})}
              {...(orLabel !== undefined ? { orLabel } : {})}
              {...(browseLabel !== undefined ? { browseLabel } : {})}
              file={file}
              {...(progress !== undefined ? { progress } : {})}
              {...(uploadedFileMeta !== undefined ? { meta: uploadedFileMeta } : {})}
              tone="success"
              fileIcon={<FileSpreadsheet className="size-4" />}
              onFileChange={onFileChange}
            />
          </section>
        </div>

        <DialogFooter className="shrink-0 border-t border-border px-6 py-4 sm:justify-end">
          <Button variant="outline-invert" onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </Button>
          <Button onClick={onUpload} disabled={!file} loading={Boolean(uploading)}>
            <Upload className="size-4" />
            {uploadLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { BulkImportDialog };
export type { BulkImportDialogProps };
