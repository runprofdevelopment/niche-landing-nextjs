"use client";

import { Trash2 } from "lucide-react";

import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/shared/components/ui/button";

type ConfirmDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Entity display name. When `title` is omitted, builds the default
   * "Delete {name} ?" title from common translations.
   */
  name?: string;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
};

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  name,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  loading = false,
}: ConfirmDeleteDialogProps) {
  const t = useTranslations("common");

  const resolvedTitle = title ?? (name ? t("deleteConfirmTitle", { name }) : t("delete"));
  const resolvedDescription = description ?? t("deleteConfirmDescription");
  const resolvedConfirmLabel = confirmLabel ?? t("delete");
  const resolvedCancelLabel = cancelLabel ?? t("cancel");

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (loading && !next) return;
        onOpenChange(next);
      }}
    >
      <AlertDialogContent className="max-w-md gap-6 sm:rounded-xl">
        <AlertDialogHeader className="items-center space-y-4 text-center sm:text-center">
          <div
            className="flex size-16 items-center justify-center rounded-full bg-destructive/10"
            aria-hidden
          >
            <Trash2 className="size-7 text-destructive" strokeWidth={1.75} />
          </div>
          <div className="space-y-2">
            <AlertDialogTitle className="text-center text-xl font-semibold tracking-tight">
              {resolvedTitle}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm leading-relaxed text-muted-foreground">
              {resolvedDescription}
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex-row gap-3 sm:justify-stretch sm:space-x-0">
          <AlertDialogCancel
            disabled={loading}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "mt-0 h-11 flex-1 border-destructive bg-background text-destructive hover:bg-destructive/10 hover:text-destructive",
            )}
          >
            {resolvedCancelLabel}
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            loading={loading}
            className="h-11 flex-1"
            onClick={() => {
              void onConfirm();
            }}
          >
            {resolvedConfirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
