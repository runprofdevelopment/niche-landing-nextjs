"use client";

import { Check, Eye } from "lucide-react";
import { useState } from "react";

import { useTranslations } from "@/hooks/useTranslations";
import { useRouter } from "@/providers/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  notify,
  TableRowActionsTrigger,
} from "@/shared/components";

import { useStaffPermissions } from "../../hooks";
import { useReviewStaffApplication } from "../../services";
import { ApproveRequestDialog } from "../dialogs/approve-request-dialog";

import type { StaffMember } from "../../types";
import type { ConfirmFieldValues } from "@/shared/components";

type StaffPendingRowActionsProps = {
  staff: StaffMember;
};

function StaffPendingRowActions({ staff }: StaffPendingRowActionsProps) {
  const t = useTranslations("staff");
  const router = useRouter();
  const { canUpdate, canView } = useStaffPermissions();
  const [approveOpen, setApproveOpen] = useState(false);
  const { reviewStaffApplication, loading: actionPending } = useReviewStaffApplication();

  const handleApprove = async (values: ConfirmFieldValues) => {
    const roleIds = values["roleIds"];
    const result = await reviewStaffApplication({
      staff_id: staff.id,
      decision: "ACCEPTED",
      ...(Array.isArray(roleIds) && roleIds.length > 0 ? { roleIds } : {}),
    });
    if (!result) return;

    notify.success({ title: t("approveSuccessMessage") });
    setApproveOpen(false);
  };

  if (!canUpdate && !canView) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <TableRowActionsTrigger label={t("rowActionsLabel")} loading={actionPending} />
        <DropdownMenuContent align="end">
          {canUpdate ? (
            <DropdownMenuItem className="text-success" onClick={() => setApproveOpen(true)}>
              <Check />
              {t("actionAccept")}
            </DropdownMenuItem>
          ) : null}
          {canView ? (
            <DropdownMenuItem onClick={() => router.push(`/users/staff/${staff.id}`)}>
              <Eye />
              {t("actionViewDetails")}
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      {canUpdate ? (
        <ApproveRequestDialog
          open={approveOpen}
          onOpenChange={setApproveOpen}
          staff={staff}
          onConfirm={handleApprove}
        />
      ) : null}
    </>
  );
}

export { StaffPendingRowActions };
