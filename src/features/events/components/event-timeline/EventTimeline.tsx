"use client";

import { CalendarClock, Pencil, Plus, Trash2 } from "lucide-react";

import { EVENT_PERMISSIONS } from "@/constants/permissions";
import { usePermissions } from "@/hooks/usePermissions";
import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";
import { ConfirmDeleteDialog } from "@/shared/components/dialogs";
import { EmptyState } from "@/shared/components/layout/empty-state";
import { TableRowActionsTrigger } from "@/shared/components/table";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/shared/components/ui/dropdown-menu";
import { formatTime24, parseTime24 } from "@/shared/utils/time";

import {
  TIMELINE_STATUS_BADGE_VARIANT,
  TIMELINE_STATUS_DOT_CLASS,
  TIMELINE_STATUS_LABEL_KEYS,
} from "../../domain/timeline";
import { useTimelineSlots } from "../../hooks/use-timeline-slots";

import { TimelineEntryDialog } from "./TimelineEntryDialog";

import type { TimelineSlot } from "../../types";

function formatSlotTime(value: string): string {
  return formatTime24(parseTime24(value)) ?? value;
}

type EventTimelineProps = {
  eventId: string;
  /** Event calendar date (`yyyy-MM-dd`) used to derive slot status. */
  eventDate?: string;
};

export function EventTimeline({ eventId, eventDate }: EventTimelineProps) {
  const t = useTranslations("events");
  const { can } = usePermissions();
  const canCreate = can(EVENT_PERMISSIONS.timelineCreate);
  const canUpdate = can(EVENT_PERMISSIONS.timelineUpdate);
  const canDelete = can(EVENT_PERMISSIONS.timelineDelete);
  const canManage = canCreate || canUpdate;

  const {
    slots,
    loading,
    editing,
    dialogOpen,
    setDialogOpen,
    openAdd,
    openEdit,
    handleSubmit,
    pendingDelete,
    setPendingDelete,
    confirmDelete,
  } = useTimelineSlots(
    eventId,
    {
      entryAdded: t("timelineEntryAdded"),
      entryUpdated: t("timelineEntryUpdated"),
      entryDeleted: t("timelineEntryDeleted"),
    },
    eventDate ? { eventDate } : {},
  );

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-display text-2xl font-semibold">{t("eventTimeline")}</h2>

        {canCreate ? (
          <Button className="w-full sm:w-auto" onClick={openAdd}>
            <Plus className="size-4" />
            {t("addEntry")}
          </Button>
        ) : null}
      </div>

      <Card className="border-border/60 bg-card shadow-sm">
        <CardContent className="p-0">
          {loading && slots.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">{t("loadingEvent")}</p>
          ) : slots.length === 0 ? (
            <EmptyState
              className="border-0"
              icon={<CalendarClock />}
              title={t("timelineEmptyTitle")}
              description={t("timelineEmptyDescription")}
              actions={
                canCreate ? (
                  <Button variant="outline" className="w-full sm:w-auto" onClick={openAdd}>
                    <Plus className="size-4" />
                    {t("addEntry")}
                  </Button>
                ) : null
              }
            />
          ) : (
            <ol className="relative space-y-0 px-5 py-6 sm:px-8">
              {/* Continuous preview rail behind all entries */}
              <span
                className="absolute inset-s-5.75 top-8 bottom-8 w-px bg-border sm:inset-s-8.75"
                aria-hidden
              />
              {slots.map((slot) => (
                <TimelineRow
                  key={slot.id}
                  slot={slot}
                  canUpdate={canUpdate}
                  canDelete={canDelete}
                  onEdit={() => openEdit(slot)}
                  onDelete={() => setPendingDelete(slot)}
                />
              ))}
            </ol>
          )}
        </CardContent>
      </Card>

      {canManage ? (
        <TimelineEntryDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          slot={editing}
          onSubmit={handleSubmit}
        />
      ) : null}

      {canDelete ? (
        <ConfirmDeleteDialog
          open={Boolean(pendingDelete)}
          onOpenChange={(open) => {
            if (!open) setPendingDelete(null);
          }}
          title={t("deleteTimelineEntryTitle", {
            name: pendingDelete?.title ?? "",
          })}
          description={t("deleteTimelineEntryDescription")}
          onConfirm={confirmDelete}
        />
      ) : null}
    </section>
  );
}

type TimelineRowProps = {
  slot: TimelineSlot;
  canUpdate: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
};

function TimelineRow({ slot, canUpdate, canDelete, onEdit, onDelete }: TimelineRowProps) {
  const t = useTranslations("events");
  const showActions = canUpdate || canDelete;
  const startLabel = formatSlotTime(slot.start);
  const endLabel = formatSlotTime(slot.end);

  return (
    <li className="relative flex gap-4 py-3.5 sm:gap-5">
      <div className="relative z-10 flex w-3 shrink-0 justify-center pt-1.5" aria-hidden>
        <span
          className={cn(
            "size-3 shrink-0 rounded-full ring-4 ring-card",
            TIMELINE_STATUS_DOT_CLASS[slot.status],
          )}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground sm:text-sm">
              <time dateTime={slot.start} className="tabular-nums">
                {startLabel}
              </time>
              <span aria-hidden>–</span>
              <time dateTime={slot.end} className="tabular-nums">
                {endLabel}
              </time>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <h3 className="min-w-0 font-medium leading-snug text-foreground">{slot.title}</h3>
              <Badge variant={TIMELINE_STATUS_BADGE_VARIANT[slot.status]} className="shrink-0">
                {t(TIMELINE_STATUS_LABEL_KEYS[slot.status])}
              </Badge>
            </div>
            {slot.description ? (
              <p className="text-sm leading-relaxed text-muted-foreground">{slot.description}</p>
            ) : null}
          </div>

          {showActions ? (
            <div className="-me-1.5 -mt-1 shrink-0">
              <DropdownMenu>
                <TableRowActionsTrigger label={t("rowActionsLabel", { name: slot.title })} />
                <DropdownMenuContent align="end" className="min-w-40">
                  {canUpdate ? (
                    <DropdownMenuItem
                      onSelect={(event) => {
                        event.preventDefault();
                        onEdit();
                      }}
                    >
                      <Pencil className="size-4" />
                      {t("actionEdit")}
                    </DropdownMenuItem>
                  ) : null}
                  {canDelete ? (
                    <>
                      {canUpdate ? <DropdownMenuSeparator /> : null}
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onSelect={(event) => {
                          event.preventDefault();
                          onDelete();
                        }}
                      >
                        <Trash2 className="size-4" />
                        {t("actionDelete")}
                      </DropdownMenuItem>
                    </>
                  ) : null}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : null}
        </div>
      </div>
    </li>
  );
}
