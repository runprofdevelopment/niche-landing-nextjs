"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { INVITATION_PERMISSIONS } from "@/constants/permissions";
import { routes } from "@/constants/routes";
import { usePermissions } from "@/hooks/usePermissions";
import { useTranslations } from "@/hooks/useTranslations";
import { Link } from "@/providers/i18n";
import { useErrorHandler } from "@/services/error-handling";
import { ConfirmDeleteDialog } from "@/shared/components/dialogs";
import { toast } from "@/shared/components/feedback/toast";
import { TableRowActionsTrigger } from "@/shared/components/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/shared/components/ui/dropdown-menu";

import { useInvitationTemplateMutations } from "../graphql";

import type { InvitationTemplate } from "../types";

type InvitationsTableRowActionsProps = {
  template: InvitationTemplate;
};

export function InvitationsTableRowActions({ template }: InvitationsTableRowActionsProps) {
  const t = useTranslations("invitations");
  const { can } = usePermissions();
  const { handleError } = useErrorHandler();
  const canUpdate = can(INVITATION_PERMISSIONS.update);
  const canCreate = can(INVITATION_PERMISSIONS.create);
  const canDelete = can(INVITATION_PERMISSIONS.delete);
  /** Edit opens bind-to-event flow (upsert invitation). */
  const canEdit = canUpdate || canCreate;
  const { destroyInvitationTemplate, destroying } = useInvitationTemplateMutations();
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!canEdit && !canDelete) return null;

  return (
    <>
      <DropdownMenu>
        <TableRowActionsTrigger label={t("rowActionsLabel", { name: template.name })} />
        <DropdownMenuContent align="end">
          {canEdit ? (
            <DropdownMenuItem asChild>
              <Link href={routes.invitationTemplateUse(template.id)}>
                <Pencil className="me-2 size-4" />
                {t("actionEdit")}
              </Link>
            </DropdownMenuItem>
          ) : null}
          {canDelete ? (
            <>
              {canEdit ? <DropdownMenuSeparator /> : null}
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="me-2 size-4" />
                {t("actionDelete")}
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      {canDelete ? (
        <ConfirmDeleteDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title={t("deleteTemplateTitle", { name: template.name })}
          description={t("deleteTemplateDescription")}
          loading={destroying}
          onConfirm={async () => {
            try {
              await destroyInvitationTemplate(template.id);
              toast.success(t("templateDeleted"));
              setDeleteOpen(false);
            } catch (error) {
              handleError(error, {
                context: {
                  feature: "invitations",
                  action: "InvitationTemplateDestroy",
                  extra: { id: template.id },
                },
                channels: ["toast"],
              });
            }
          }}
        />
      ) : null}
    </>
  );
}
