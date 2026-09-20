"use client";

import { Ban, Check, Pencil, Trash2, UserCheck, X } from "lucide-react";
import { useState } from "react";

import { SECURITY_PERMISSIONS } from "@/constants/permissions";
import { toFrontDeskProfileInput, useFrontDeskMutations } from "@/features/security/graphql";
import { usePermissions } from "@/hooks/usePermissions";
import { useTranslations } from "@/hooks/useTranslations";
import { useErrorHandler } from "@/services/error-handling";
import { ConfirmDeleteDialog, ConfirmDialog } from "@/shared/components/dialogs";
import { toast } from "@/shared/components/feedback/toast";
import { TableRowActionsTrigger } from "@/shared/components/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/shared/components/ui/dropdown-menu";
import { useUserMutations } from "@/shared/graphql";

import { ApproveMemberDialog, MemberFormDialog, RejectMemberDialog } from "../dialogs";

import type { SecurityMemberFormValues } from "../../schemas/member.schema";
import type { SecurityMember } from "../../types";

type MembersTableRowActionsProps = {
  member: SecurityMember;
};

export function MembersTableRowActions({ member }: MembersTableRowActionsProps) {
  const t = useTranslations("security");
  const { can } = usePermissions();
  const { handleError } = useErrorHandler();
  const { approveFrontDesk, rejectFrontDesk } = useFrontDeskMutations();
  const { destroyUser, setUserStatus, updateUser } = useUserMutations({
    refetchQueries: ["FrontDeskList"],
  });

  const [editOpen, setEditOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  const canApprove = can(SECURITY_PERMISSIONS.membersApprove);
  const canReject = can(SECURITY_PERMISSIONS.membersReject);
  const canUpdate = can(SECURITY_PERMISSIONS.membersUpdate);
  const canDelete = can(SECURITY_PERMISSIONS.membersDelete);
  const isListedMember = member.status === "active" || member.status === "inactive";
  const isActive = member.status === "active";

  const showApprove = canApprove && member.status === "pending";
  const showReject = canReject && member.status === "pending";
  const showStatus = canUpdate && isListedMember;
  const showDelete = canDelete && isListedMember;

  if (!showApprove && !showReject && !canUpdate && !showStatus && !showDelete) return null;

  async function handleApprove() {
    try {
      await approveFrontDesk(member.id);
      toast.success(t("memberApproved"));
    } catch (error) {
      handleError(error, { context: { feature: "security", action: "frontDeskApprove" } });
      throw error;
    }
  }

  async function handleReject(reason: string) {
    try {
      await rejectFrontDesk(member.id, reason);
      toast.success(t("memberRejected"));
    } catch (error) {
      handleError(error, { context: { feature: "security", action: "frontDeskReject" } });
      throw error;
    }
  }

  async function handleEdit(values: SecurityMemberFormValues) {
    try {
      await updateUser(member.id, toFrontDeskProfileInput(values));
      toast.success(t("memberUpdated"));
    } catch (error) {
      handleError(error, { context: { feature: "security", action: "userUpdate" } });
      throw error;
    }
  }

  async function handleDelete() {
    try {
      await destroyUser(member.id);
      setDeleteOpen(false);
      toast.success(t("memberDeleted"));
    } catch (error) {
      handleError(error, { context: { feature: "security", action: "userDestroy" } });
    }
  }

  async function handleToggleStatus() {
    try {
      await setUserStatus(member.id, isActive ? "inactive" : "active");
      toast.success(isActive ? t("memberDeactivated") : t("memberActivated"));
    } catch (error) {
      handleError(error, { context: { feature: "security", action: "setUserStatus" } });
      throw error;
    }
  }

  return (
    <>
      <DropdownMenu>
        <TableRowActionsTrigger label={t("rowActionsLabel", { name: member.name })} />
        <DropdownMenuContent align="end" className="min-w-40">
          {showApprove ? (
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                setApproveOpen(true);
              }}
            >
              <Check className="size-4" />
              {t("actionApprove")}
            </DropdownMenuItem>
          ) : null}
          {showReject ? (
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                setRejectOpen(true);
              }}
            >
              <X className="size-4" />
              {t("actionReject")}
            </DropdownMenuItem>
          ) : null}
          {canUpdate ? (
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                setEditOpen(true);
              }}
            >
              <Pencil className="size-4" />
              {t("actionEdit")}
            </DropdownMenuItem>
          ) : null}
          {showStatus ? (
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                setStatusOpen(true);
              }}
            >
              {isActive ? <Ban className="size-4" /> : <UserCheck className="size-4" />}
              {isActive ? t("actionDeactivate") : t("actionActivate")}
            </DropdownMenuItem>
          ) : null}
          {showDelete ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={(event) => {
                  event.preventDefault();
                  setDeleteOpen(true);
                }}
              >
                <Trash2 className="size-4" />
                {t("actionDelete")}
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      {canUpdate ? (
        <MemberFormDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          mode="edit"
          member={member}
          onSubmit={handleEdit}
        />
      ) : null}

      {showApprove ? (
        <ApproveMemberDialog
          open={approveOpen}
          onOpenChange={setApproveOpen}
          memberName={member.name}
          memberEmail={member.email}
          onConfirm={handleApprove}
        />
      ) : null}

      {showReject ? (
        <RejectMemberDialog
          open={rejectOpen}
          onOpenChange={setRejectOpen}
          memberName={member.name}
          memberEmail={member.email}
          onSubmit={handleReject}
        />
      ) : null}

      {showStatus ? (
        <ConfirmDialog
          open={statusOpen}
          onOpenChange={setStatusOpen}
          tone={isActive ? "destructive" : "success"}
          title={
            isActive
              ? t("deactivateMemberTitle", { name: member.name })
              : t("activateMemberTitle", { name: member.name })
          }
          description={isActive ? t("deactivateMemberDescription") : t("activateMemberDescription")}
          infoRows={[
            { label: t("columnName"), value: member.name },
            ...(member.email ? [{ label: t("columnEmail"), value: member.email }] : []),
          ]}
          cancelLabel={t("cancel")}
          confirmLabel={isActive ? t("actionDeactivate") : t("actionActivate")}
          onConfirm={async () => {
            await handleToggleStatus();
            setStatusOpen(false);
          }}
        />
      ) : null}

      {showDelete ? (
        <ConfirmDeleteDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title={t("deleteMemberTitle", { name: member.name })}
          description={t("deleteMemberDescription")}
          onConfirm={handleDelete}
        />
      ) : null}
    </>
  );
}
