"use client";

import { useTranslations } from "@/hooks/useTranslations";
import { ConfirmDialog } from "@/shared/components/dialogs";

type ApproveMemberDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberName: string;
  memberEmail?: string;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
};

export function ApproveMemberDialog({
  open,
  onOpenChange,
  memberName,
  memberEmail,
  onConfirm,
  loading = false,
}: ApproveMemberDialogProps) {
  const t = useTranslations("security");
  const tCommon = useTranslations("common");

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      tone="success"
      title={t("approveMemberTitle", { name: memberName })}
      description={t("approveMemberDescription")}
      infoRows={[
        { label: t("columnName"), value: memberName },
        ...(memberEmail ? [{ label: t("columnEmail"), value: memberEmail }] : []),
      ]}
      cancelLabel={tCommon("cancel")}
      confirmLabel={t("confirmApprove")}
      confirmClassName="bg-active text-active-foreground hover:bg-active/90"
      loading={loading}
      onConfirm={async () => {
        await onConfirm();
        onOpenChange(false);
      }}
    />
  );
}
