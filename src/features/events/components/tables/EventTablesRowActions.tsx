"use client";

import { Users } from "lucide-react";
import { useState } from "react";

import { useTranslations } from "@/hooks/useTranslations";
import { TableRowActionsTrigger } from "@/shared/components/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/shared/components/ui/dropdown-menu";

import { TableGuestsDialog } from "../dialogs";

import type { EventTableSummary } from "../../domain/event-tables";

type EventTablesRowActionsProps = {
  table: EventTableSummary;
};

export function EventTablesRowActions({ table }: EventTablesRowActionsProps) {
  const t = useTranslations("events");
  const [guestsOpen, setGuestsOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <TableRowActionsTrigger label={t("rowActionsLabel", { name: table.name })} />
        <DropdownMenuContent align="end" className="min-w-44">
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              setGuestsOpen(true);
            }}
          >
            <Users className="size-4" />
            {t("viewTableGuests")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <TableGuestsDialog open={guestsOpen} onOpenChange={setGuestsOpen} table={table} />
    </>
  );
}
