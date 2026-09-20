"use client";

import { useTranslations } from "@/hooks/useTranslations";
import { ConfirmDialog } from "@/shared/components";

import type { GuestType } from "../../constants";

type ChangeGuestTypeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  nextType: GuestType;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
};

function ChangeGuestTypeDialog({
  open,
  onOpenChange,
  userName,
  nextType,
  loading = false,
  onConfirm,
}: ChangeGuestTypeDialogProps) {
  const t = useTranslations("registrationUsers");
  const tCommon = useTranslations("common");

  const isOwner = nextType === "owner";

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      tone="default"
      title={isOwner ? t("markAsOwnerTitle") : t("markAsGuestTitle")}
      description={
        isOwner
          ? t("markAsOwnerDescription", { name: userName })
          : t("markAsGuestDescription", { name: userName })
      }
      cancelLabel={tCommon("cancel")}
      confirmLabel={t("confirm")}
      loading={loading}
      onConfirm={onConfirm}
    />
  );
}

export { ChangeGuestTypeDialog };
