"use client";

import { Eye, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { EVENT_PERMISSIONS } from "@/constants/permissions";
import { routes } from "@/constants/routes";
import { useEventMutations } from "@/features/events/graphql";
import { usePermissions } from "@/hooks/usePermissions";
import { useTranslations } from "@/hooks/useTranslations";
import { Link, useRouter } from "@/providers/i18n";
import { useErrorHandler } from "@/services/error-handling";
import { ConfirmDeleteDialog } from "@/shared/components/dialogs";
import { TableRowActionsTrigger } from "@/shared/components/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/shared/components/ui/dropdown-menu";

import { EditEventDialog } from "../dialogs";

import type { EventTableRow } from "./EventsTable";

type EventsTableRowActionsProps = {
  event: EventTableRow;
};

export function EventsTableRowActions({ event }: EventsTableRowActionsProps) {
  const t = useTranslations("events");
  const router = useRouter();
  const { can } = usePermissions();
  const { handleError } = useErrorHandler();
  const { deleteEvent } = useEventMutations();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const canView = can(EVENT_PERMISSIONS.view);
  const canUpdate = can(EVENT_PERMISSIONS.update);
  const canDelete = can(EVENT_PERMISSIONS.delete);

  if (!canView && !canUpdate && !canDelete) return null;

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteEvent(event.id);
      setDeleteOpen(false);
      router.refresh();
    } catch (error) {
      handleError(error, { context: { feature: "events", action: "deleteEvent" } });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <TableRowActionsTrigger label={t("rowActionsLabel", { name: event.name })} />
        <DropdownMenuContent align="end" className="min-w-40">
          {canView ? (
            <DropdownMenuItem asChild>
              <Link href={routes.event(event.id)}>
                <Eye className="size-4" />
                {t("actionView")}
              </Link>
            </DropdownMenuItem>
          ) : null}
          {canUpdate ? (
            <DropdownMenuItem
              onSelect={(selectionEvent) => {
                selectionEvent.preventDefault();
                setEditOpen(true);
              }}
            >
              <Pencil className="size-4" />
              {t("actionEdit")}
            </DropdownMenuItem>
          ) : null}
          {canDelete ? (
            <>
              {(canView || canUpdate) && <DropdownMenuSeparator />}
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={(selectionEvent) => {
                  selectionEvent.preventDefault();
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
        <EditEventDialog event={event} open={editOpen} onOpenChange={setEditOpen} />
      ) : null}

      {canDelete ? (
        <ConfirmDeleteDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title={t("deleteEventTitle", { name: event.name })}
          description={t("deleteEventDescription")}
          onConfirm={handleDelete}
          loading={deleting}
        />
      ) : null}
    </>
  );
}
