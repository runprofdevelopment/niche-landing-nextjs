"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";

import { useTranslations } from "@/hooks/useTranslations";
import { ConfirmDeleteDialog } from "@/shared/components/dialogs";
import { TableRowActionsTrigger } from "@/shared/components/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/shared/components/ui/dropdown-menu";

import type { EventStaffRow } from "../../domain/event-staff";

type EventStaffRowActionsProps = {
  member: EventStaffRow;
  onRemove: (assignmentId: string) => void | Promise<void>;
};

export function EventStaffRowActions({ member, onRemove }: EventStaffRowActionsProps) {
  const t = useTranslations("events");
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <TableRowActionsTrigger label={t("rowActionsLabel", { name: member.name })} />
        <DropdownMenuContent align="end" className="min-w-48">
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={(event) => {
              event.preventDefault();
              setConfirmOpen(true);
            }}
          >
            <Trash2 className="size-4" />
            {t("removeFromEvent")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t("removeEventStaffTitle", { name: member.name })}
        description={t("removeEventStaffDescription")}
        onConfirm={() => {
          void onRemove(member.id);
          setConfirmOpen(false);
        }}
      />
    </>
  );
}
