"use client";

import { useState } from "react";

import { useInfiniteRoles } from "@/features/roles/services";
import { useTranslations } from "@/hooks/useTranslations";
import { ConfirmDialog } from "@/shared/components";

import type { ConfirmFieldValues } from "@/shared/components";

type ApproveRequestDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: { name: string; email: string; phoneNumber: string };
  /** Owned by the caller so its pending state can drive the row's trigger spinner. */
  onConfirm: (values: ConfirmFieldValues) => void;
};

function ApproveRequestDialog({ open, onOpenChange, staff, onConfirm }: ApproveRequestDialogProps) {
  const t = useTranslations("staff");
  const tCommon = useTranslations("common");
  const [roleSearch, setRoleSearch] = useState("");
  const {
    options: roleOptions,
    loading: rolesLoading,
    hasMore: rolesHasMore,
    loadMore: loadMoreRoles,
  } = useInfiniteRoles({
    skip: !open,
    search: roleSearch,
  });

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      tone="success"
      contentClassName="max-w-lg"
      title={t("approveTitle")}
      description={t("approveDescription")}
      infoRows={[
        { label: t("dialogName"), value: staff.name },
        { label: t("dialogEmail"), value: staff.email },
        { label: t("dialogPhone"), value: staff.phoneNumber },
      ]}
      fields={[
        {
          name: "roleIds",
          type: "multi-select",
          label: t("assignRoles"),
          required: true,
          placeholder: rolesLoading ? tCommon("loading") : t("assignRolesPlaceholder"),
          options: roleOptions,
          loading: rolesLoading,
          hasMore: rolesHasMore,
          onLoadMore: loadMoreRoles,
          onSearchChange: setRoleSearch,
        },
      ]}
      cancelLabel={tCommon("cancel")}
      confirmLabel={t("approveAction")}
      confirmClassName="bg-success text-white hover:bg-success/90"
      onConfirm={onConfirm}
    />
  );
}

export { ApproveRequestDialog };
