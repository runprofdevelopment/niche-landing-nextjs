"use client";

import { Edit2, Eye, Trash2, Zap } from "lucide-react";
import { useState } from "react";

import { routes } from "@/constants/routes";
import { useTranslations } from "@/hooks/useTranslations";
import { useRouter } from "@/providers/i18n";
import {
  ConfirmDialog,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  TableRowActionsTrigger,
} from "@/shared/components";

import { useStaffPermissions } from "../../hooks";
import { useChangeStaffStatus, useDeleteStaff } from "../../services";

import type { StaffMember } from "../../types";

type StaffRowActionsProps = {
  staff: StaffMember;
};

function StaffRowActions({ staff }: StaffRowActionsProps) {
  const t = useTranslations("staff");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { canView, canUpdate, canDelete } = useStaffPermissions();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const { deleteStaff, loading: deleteLoading } = useDeleteStaff();
  const { changeStaffStatus, loading: statusLoading } = useChangeStaffStatus();

  const entity = t("entityName");
  const isActive = staff.status === "active";
  const hasAnyAction = canView || canUpdate || canDelete;
  const actionPending = deleteLoading || statusLoading;

  const handleDelete = async () => {
    const result = await deleteStaff(staff.id);
    if (!result) return;
    setDeleteOpen(false);
  };

  const handleToggleStatus = async () => {
    const result = await changeStaffStatus(staff.id, isActive ? "inactive" : "active");
    if (result == null) return;
    setStatusOpen(false);
  };

  if (!hasAnyAction) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <TableRowActionsTrigger label={t("rowActionsLabel")} loading={actionPending} />
        <DropdownMenuContent align="end">
          {canView ? (
            <DropdownMenuItem onClick={() => router.push(routes.usersStaffMember(staff.id))}>
              <Eye />
              {t("actionView")}
            </DropdownMenuItem>
          ) : null}
          {canUpdate ? (
            <DropdownMenuItem onClick={() => router.push(routes.usersStaffEdit(staff.id))}>
              <Edit2 />
              {t("actionEdit")}
            </DropdownMenuItem>
          ) : null}
          {canUpdate ? (
            <DropdownMenuItem
              className={isActive ? "text-destructive" : "text-success"}
              onClick={() => setStatusOpen(true)}
            >
              <Zap />
              {isActive ? t("actionDeactivate") : t("actionActivate")}
            </DropdownMenuItem>
          ) : null}
          {canDelete ? (
            <DropdownMenuItem className="text-destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 />
              {t("actionDelete")}
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      {canDelete ? (
        <ConfirmDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          tone="destructive"
          icon={<Trash2 className="size-6" />}
          title={tCommon("confirmDeleteTitle", { entity })}
          description={tCommon("confirmDeleteDescription", { entity })}
          cancelLabel={tCommon("cancel")}
          confirmLabel={tCommon("delete")}
          onConfirm={handleDelete}
        />
      ) : null}

      {canUpdate ? (
        <ConfirmDialog
          open={statusOpen}
          onOpenChange={setStatusOpen}
          tone={isActive ? "destructive" : "success"}
          title={
            isActive
              ? tCommon("confirmDeactivateTitle", { entity })
              : tCommon("confirmActivateTitle", { entity })
          }
          description={
            isActive
              ? tCommon("confirmDeactivateDescription", { entity })
              : tCommon("confirmActivateDescription", { entity })
          }
          cancelLabel={tCommon("cancel")}
          confirmLabel={isActive ? tCommon("deactivate") : tCommon("activate")}
          onConfirm={handleToggleStatus}
        />
      ) : null}
    </>
  );
}

export { StaffRowActions };
