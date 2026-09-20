"use client";

/**
 * FileUpload — a dropzone for browsing or drag-and-dropping a file, with a
 * selected-file preview row (name, size, progress, replace, remove).
 *
 * `variant="default"` is the larger dropzone with a dedicated "Browse File"
 * button; `variant="compact"` is the slim single-line dropzone. Both accept
 * an optional `progress` (0–100) to show an upload-in-progress bar on the
 * selected file.
 *
 * Pass `existingFile` to show a remote file already stored for the field.
 * Replace opens the file picker; Remove clears the local file or calls
 * `onExistingRemove` when clearing a remote file.
 */

import { CloudUpload, File as FileIcon, RefreshCw, Upload, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { formatBytes } from "@/shared/utils/format-bytes";

import { Button } from "../ui/button";

import type { ChangeEvent, DragEvent, ReactNode } from "react";

type ExistingFile = {
  name: string;
  meta?: string;
  href?: string | null;
};

type FileUploadProps = {
  label?: string;
  hint?: string;
  accept?: string;
  variant?: "default" | "compact";
  file?: File | null;
  /** Remote/stored file shown when no local `file` is selected. */
  existingFile?: ExistingFile | null;
  progress?: number;
  meta?: string;
  tone?: "default" | "success";
  fileIcon?: ReactNode;
  dropLabel?: string;
  orLabel?: string;
  browseLabel?: string;
  removeLabel?: string;
  replaceLabel?: string;
  onFileChange?: (file: File | null) => void;
  /** Called when the user removes a remote `existingFile` (no local file). */
  onExistingRemove?: () => void;
  disabled?: boolean;
  className?: string;
};

function FileUpload({
  label,
  hint = "PDF, DOCX, XLSX up to 10MB",
  accept,
  variant = "default",
  file,
  existingFile,
  progress,
  meta,
  tone = "default",
  fileIcon,
  dropLabel,
  orLabel = "or",
  browseLabel = "Browse",
  removeLabel = "Remove file",
  replaceLabel = "Replace file",
  onFileChange,
  onExistingRemove,
  disabled,
  className,
}: FileUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedFileRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [internalFile, setInternalFile] = useState<File | null>(null);

  const selectedFile = file !== undefined ? file : internalFile;
  const hasLocalFile = Boolean(selectedFile);
  const hasExistingFile = Boolean(existingFile) && !hasLocalFile;
  const showPreview = hasLocalFile || hasExistingFile;

  useEffect(() => {
    if (!showPreview) return;

    window.requestAnimationFrame(() => {
      selectedFileRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    });
  }, [showPreview, selectedFile, existingFile?.name]);

  function selectFile(next: File | null) {
    setInternalFile(next);
    onFileChange?.(next);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    selectFile(event.target.files?.[0] ?? null);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) {
      selectFile(dropped);
    }
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (!disabled) setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function openBrowser() {
    if (disabled) return;
    if (inputRef.current) {
      // Allow re-selecting the same file after replace/remove.
      inputRef.current.value = "";
      inputRef.current.click();
    }
  }

  function handleRemove() {
    if (disabled) return;
    if (hasLocalFile) {
      selectFile(null);
      return;
    }
    onExistingRemove?.();
  }

  const previewName = selectedFile?.name ?? existingFile?.name ?? "";
  const previewMeta =
    meta ?? (selectedFile ? formatBytes(selectedFile.size) : undefined) ?? existingFile?.meta;
  const previewHref = !hasLocalFile ? existingFile?.href : undefined;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label ? (
        <label htmlFor={inputId} className="text-sm font-medium text-foreground">
          {label}
        </label>
      ) : null}

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        disabled={disabled}
        onChange={handleInputChange}
        className="sr-only"
      />

      {!showPreview && variant === "default" ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border px-6 py-10 text-center transition-colors",
            isDragging && "border-primary bg-selected",
            disabled && "pointer-events-none opacity-50",
          )}
        >
          <CloudUpload className="size-8 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">
            {dropLabel ?? `Drag and drop your ${label ? label.toLowerCase() : "file"} here`}
          </p>
          <p className="text-xs text-muted-foreground">{orLabel}</p>
          <Button
            type="button"
            variant="outline-invert"
            size="sm"
            onClick={openBrowser}
            className="h-auto border-primary px-6 py-2.5 text-sm text-primary hover:bg-selected"
          >
            {browseLabel}
          </Button>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
      ) : null}

      {!showPreview && variant === "compact" ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={openBrowser}
          className={cn(
            "flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border border-dashed border-border px-6 py-6 text-center transition-colors",
            isDragging && "border-primary bg-selected",
            disabled && "pointer-events-none cursor-not-allowed opacity-50",
          )}
        >
          <Upload className="size-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-primary">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
      ) : null}

      {showPreview ? (
        <div
          ref={selectedFileRef}
          className="flex items-center gap-3 rounded-xl border border-border p-3"
        >
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg",
              tone === "success"
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive",
            )}
          >
            {fileIcon ?? <FileIcon className="size-4" />}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            {previewHref ? (
              <a
                href={previewHref}
                target="_blank"
                rel="noreferrer"
                className="truncate text-sm font-medium text-primary underline-offset-2 hover:underline"
              >
                {previewName}
              </a>
            ) : (
              <p className="truncate text-sm font-medium text-foreground">{previewName}</p>
            )}
            {previewMeta || typeof progress !== "number" ? (
              <p className="text-xs text-muted-foreground">{previewMeta}</p>
            ) : null}
            {typeof progress === "number" ? (
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-[width]",
                    tone === "success" ? "bg-success" : "bg-primary",
                  )}
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
              </div>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={replaceLabel}
              onClick={openBrowser}
              disabled={disabled}
              className="rounded-full text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={removeLabel}
              onClick={handleRemove}
              disabled={disabled}
              className="rounded-full text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export { FileUpload };
export type { ExistingFile, FileUploadProps };
