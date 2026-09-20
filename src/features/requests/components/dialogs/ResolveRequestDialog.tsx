"use client";

import { useTranslations } from "@/hooks/useTranslations";
import { ConfirmDialog } from "@/shared/components/dialogs";

type ResolveRequestDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerName: string;
  email?: string;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
};

export function ResolveRequestDialog({
  open,
  onOpenChange,
  customerName,
  email,
  onConfirm,
  loading = false,
}: ResolveRequestDialogProps) {
  const t = useTranslations("requests");

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      tone="success"
      title={t("resolveTitle", { name: customerName })}
      description={t("resolveDescription")}
      infoRows={[
        { label: t("columnCustomerName"), value: customerName },
        ...(email ? [{ label: t("columnEmail"), value: email }] : []),
      ]}
      cancelLabel={t("cancel")}
      confirmLabel={t("confirmResolve")}
      confirmClassName="bg-active text-active-foreground hover:bg-active/90"
      loading={loading}
      onConfirm={async () => {
        await onConfirm();
        onOpenChange(false);
      }}
    />
  );
}
