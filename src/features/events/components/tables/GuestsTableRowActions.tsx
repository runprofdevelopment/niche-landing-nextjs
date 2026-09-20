"use client";

import { Eye, Mail, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { useTranslations } from "@/hooks/useTranslations";
import { ConfirmDeleteDialog } from "@/shared/components/dialogs";
import { TableRowActionsTrigger } from "@/shared/components/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/shared/components/ui/dropdown-menu";
import { Spinner } from "@/shared/components/ui/spinner";

import { GuestFormDialog, ViewGuestDialog } from "../dialogs";

import type { GuestDetailsFormValues } from "../../schemas/event-forms.schema";
import type { Guest } from "../../types";

type GuestsTableRowActionsProps = {
  guest: Guest;
  tableLabel: string;
  seatLabel: string;
  onUpdate: (guestId: string, values: GuestDetailsFormValues) => void | Promise<void>;
  onDelete: (guestId: string) => void | Promise<void>;
  onResendInvitation?: (guest: Guest) => void | Promise<void>;
  canUpdate?: boolean;
  canDelete?: boolean;
  canShareInvitation?: boolean;
  resending?: boolean;
};

export function GuestsTableRowActions({
  guest,
  tableLabel,
  seatLabel,
  onUpdate,
  onDelete,
  onResendInvitation,
  canUpdate = false,
  canDelete = false,
  canShareInvitation = false,
  resending = false,
}: GuestsTableRowActionsProps) {
  const t = useTranslations("events");
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const displayName = guest.name || guest.phone || "—";

  return (
    <>
      <DropdownMenu>
        <TableRowActionsTrigger label={t("rowActionsLabel", { name: displayName })} />
        <DropdownMenuContent align="end" className="min-w-44">
          {canShareInvitation && onResendInvitation ? (
            <DropdownMenuItem
              disabled={resending}
              onSelect={(event) => {
                event.preventDefault();
                void onResendInvitation(guest);
              }}
            >
              {resending ? <Spinner size="sm" /> : <Mail className="size-4" />}
              {t("resendInvitation")}
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              setViewOpen(true);
            }}
          >
            <Eye className="size-4" />
            {t("actionView")}
          </DropdownMenuItem>
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
          {canDelete ? (
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

      <ViewGuestDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        guest={guest}
        tableLabel={tableLabel}
        seatLabel={seatLabel}
        {...(canUpdate ? { onEdit: () => setEditOpen(true) } : {})}
      />

      {canUpdate ? (
        <GuestFormDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          mode="edit"
          guest={guest}
          onSubmit={(values) => onUpdate(guest.id, values)}
        />
      ) : null}

      {canDelete ? (
        <ConfirmDeleteDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          name={displayName}
          description={t("deleteGuestDescription")}
          onConfirm={async () => {
            await onDelete(guest.id);
            setDeleteOpen(false);
          }}
        />
      ) : null}
    </>
  );
}
