"use client";

import { useState } from "react";

import { useTranslations } from "@/hooks/useTranslations";
import { Field } from "@/shared/components/forms/field";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Textarea } from "@/shared/components/ui/textarea";

type SendEmailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  onConfirm: (message: string) => void | Promise<void>;
};

export function SendEmailDialog({ open, onOpenChange, email, onConfirm }: SendEmailDialogProps) {
  const t = useTranslations("requests");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) setMessage("");
    onOpenChange(nextOpen);
  }

  async function handleConfirm() {
    const trimmed = message.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    try {
      await onConfirm(trimmed);
      handleOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-md flex-col gap-0 overflow-hidden p-0 sm:rounded-lg">
        <DialogHeader className="shrink-0 border-b border-border px-6 py-4 pe-12">
          <DialogTitle>{t("sendEmailTitle")}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 px-6 py-4">
          <p className="text-sm text-muted-foreground">
            {t("sendEmailDescription", { email: email || t("emptyValue") })}
          </p>
          <Field label={t("sendEmailMessageLabel")}>
            <Textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={t("sendEmailMessagePlaceholder")}
              rows={5}
              className="resize-none"
            />
          </Field>
        </div>

        <DialogFooter className="shrink-0 border-t border-border px-6 py-4">
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button
            type="button"
            disabled={!message.trim() || submitting}
            onClick={() => {
              void handleConfirm();
            }}
          >
            {t("sendEmailConfirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
