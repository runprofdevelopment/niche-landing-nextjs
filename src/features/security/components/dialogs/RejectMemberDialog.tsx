"use client";

import { useTranslations } from "@/hooks/useTranslations";
import { ConfirmDialog } from "@/shared/components/dialogs";

type RejectMemberDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberName: string;
  memberEmail?: string;
  onSubmit: (reason: string) => void | Promise<void>;
  loading?: boolean;
};

export function RejectMemberDialog({
  open,
  onOpenChange,
  memberName,
  memberEmail,
  onSubmit,
  loading = false,
}: RejectMemberDialogProps) {
  const t = useTranslations("security");
  const tCommon = useTranslations("common");

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      tone="destructive"
      title={t("rejectMemberTitle", { name: memberName })}
      description={t("rejectMemberDescription")}
      infoRows={[
        { label: t("columnName"), value: memberName },
        ...(memberEmail ? [{ label: t("columnEmail"), value: memberEmail }] : []),
      ]}
      fields={[
        {
          name: "reason",
          type: "textarea",
          label: t("rejectionReasonLabel"),
          required: true,
          placeholder: t("rejectionReasonPlaceholder"),
        },
      ]}
      cancelLabel={tCommon("cancel")}
      confirmLabel={t("confirmReject")}
      loading={loading}
      onConfirm={async (values) => {
        const reason = values["reason"];
        await onSubmit(typeof reason === "string" ? reason.trim() : "");
        onOpenChange(false);
      }}
    />
  );
}
