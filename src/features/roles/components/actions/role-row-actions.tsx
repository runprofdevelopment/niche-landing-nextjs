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

import { useRolePermissions } from "../../hooks";
import { useChangeRoleStatus, useDeleteRole } from "../../services";

import type { RoleListItem } from "../../types";

type RoleRowActionsProps = {
  role: RoleListItem;
};

function RoleRowActions({ role }: RoleRowActionsProps) {
  const t = useTranslations("roles");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { canView, canUpdate, canDelete } = useRolePermissions();
  const { deleteRole, loading: deleteLoading } = useDeleteRole();
  const { changeRoleStatus, loading: statusLoading } = useChangeRoleStatus();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  const entity = t("entityName");
  const isActive = role.status === "active";
  const hasAnyAction = canUpdate || canDelete || canView;
  const actionPending = deleteLoading || statusLoading;

  const handleDelete = async () => {
    const result = await deleteRole(role.id);
    if (result) {
      setDeleteOpen(false);
    }
  };

  const handleToggleStatus = async () => {
    const result = await changeRoleStatus(role.id, isActive ? "inactive" : "active");

    if (result) {
      setStatusOpen(false);
    }
  };

  if (!hasAnyAction) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <TableRowActionsTrigger label={t("rowActionsLabel")} loading={actionPending} />
        <DropdownMenuContent align="end">
          {canUpdate ? (
            <DropdownMenuItem onClick={() => router.push(routes.usersRoleEdit(role.id))}>
              <Edit2 />
              {t("actionEdit")}
            </DropdownMenuItem>
          ) : null}
          {canDelete ? (
            <DropdownMenuItem className="text-destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 />
              {t("actionDelete")}
            </DropdownMenuItem>
          ) : null}
          {canView ? (
            <DropdownMenuItem onClick={() => router.push(routes.usersRole(role.id))}>
              <Eye />
              {t("actionView")}
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

export { RoleRowActions };
