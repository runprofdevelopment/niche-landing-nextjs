"use client";

import { useTranslations } from "@/hooks/useTranslations";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

import type { EventTableSummary } from "../../domain/event-tables";

type TableGuestsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: EventTableSummary | null;
};

type TableGuestsDialogBodyProps = {
  table: EventTableSummary;
  onOpenChange: (open: boolean) => void;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function TableGuestsDialogBody({ table, onOpenChange }: TableGuestsDialogBodyProps) {
  const t = useTranslations("events");

  return (
    <DialogContent className="flex max-h-[90vh] max-w-md flex-col gap-0 overflow-hidden p-0 sm:rounded-lg">
      <DialogHeader className="shrink-0 border-b border-border px-6 py-4 pe-12">
        <DialogTitle className="font-display text-xl">
          {t("tableGuestsTitle", { table: table.name })}
        </DialogTitle>
      </DialogHeader>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-6 py-5">
        <div className="space-y-2 rounded-lg border border-border/60 bg-muted/30 p-4 text-sm">
          <div className="grid grid-cols-[8rem_1fr] items-start gap-3">
            <span className="text-muted-foreground">{t("columnTableName")}</span>
            <span className="min-w-0 wrap-break-word font-medium">{table.name}</span>
          </div>
          <div className="grid grid-cols-[8rem_1fr] items-start gap-3">
            <span className="text-muted-foreground">{t("capacity")}</span>
            <span className="font-medium">{t("capacitySeats", { count: table.capacity })}</span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            {t("assignedGuestsCount", { count: table.guests.length })}
          </p>
          {table.guests.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">{t("noGuestsAssigned")}</p>
          ) : (
            <ul className="space-y-2">
              {table.guests.map((guest) => (
                <li
                  key={guest.id}
                  className="flex items-center gap-3 rounded-lg border border-border/60 px-3 py-2"
                >
                  <Avatar className="size-8">
                    <AvatarFallback>{initials(guest.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{guest.name}</p>
                    {guest.email ? (
                      <p className="truncate text-xs text-muted-foreground">{guest.email}</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <DialogFooter className="shrink-0 border-t border-border px-6 py-4">
        <Button type="button" variant="outline-invert" onClick={() => onOpenChange(false)}>
          {t("close")}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export function TableGuestsDialog({ open, onOpenChange, table }: TableGuestsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {table ? (
        <TableGuestsDialogBody key={table.id} table={table} onOpenChange={onOpenChange} />
      ) : null}
    </Dialog>
  );
}
