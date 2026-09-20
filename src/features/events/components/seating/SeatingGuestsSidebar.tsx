"use client";

import { GripVertical, Search } from "lucide-react";
import { useMemo } from "react";

import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";

import type {
  EventGuestSeatMapGroup,
  EventGuestSeatMapMember,
} from "../../graphql/queries/event-guest-seat-map-list";

export type SeatDragItem = { kind: "guest"; id: string } | { kind: "group"; id: string };

type SeatingGuestsSidebarProps = {
  groups: EventGuestSeatMapGroup[];
  individuals: EventGuestSeatMapMember[];
  assignedGuestIds: Set<string>;
  query: string;
  onQueryChange: (value: string) => void;
  selectedGuestId: string | null;
  selectedGroupId: string | null;
  canUpdate: boolean;
  onSelectGuest: (guestId: string | null) => void;
  onSelectGroup: (groupId: string | null) => void;
  onPointerAssignStart: (item: SeatDragItem, event: React.PointerEvent) => void;
  className?: string;
};

function matchesQuery(name: string | null | undefined, query: string) {
  if (!query.trim()) return true;
  return (name ?? "").toLowerCase().includes(query.trim().toLowerCase());
}

function StatusDot({ assigned }: { assigned: boolean }) {
  return (
    <span
      className={cn(
        "size-2.5 shrink-0 rounded-full",
        assigned ? "bg-active-foreground" : "bg-secondary",
      )}
      aria-hidden
    />
  );
}

function GuestRow({
  guest,
  assigned,
  selected,
  canUpdate,
  onSelect,
  onPointerAssignStart,
}: {
  guest: EventGuestSeatMapMember;
  assigned: boolean;
  selected: boolean;
  canUpdate: boolean;
  onSelect: () => void;
  onPointerAssignStart: SeatingGuestsSidebarProps["onPointerAssignStart"];
}) {
  const t = useTranslations("events");
  const isSeated = assigned || Boolean(guest.seatId);
  const canDrag = canUpdate && !isSeated;

  return (
    <div
      role="button"
      tabIndex={0}
      draggable={canDrag}
      onDragStart={(event) => {
        if (!canDrag) {
          event.preventDefault();
          return;
        }
        const payload = JSON.stringify({ kind: "guest", id: guest.id } satisfies SeatDragItem);
        event.dataTransfer.setData("application/x-hall-item", payload);
        event.dataTransfer.setData("text/plain", payload);
        event.dataTransfer.effectAllowed = "copyMove";
      }}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      onPointerDown={(event) => {
        if (!canDrag || event.button !== 0) return;
        if (event.pointerType === "mouse") return;
        if ((event.target as HTMLElement).closest("[data-drag-handle]")) {
          onPointerAssignStart({ kind: "guest", id: guest.id }, event);
        }
      }}
      className={cn(
        "flex min-h-11 items-center gap-2 rounded-lg border px-2.5 py-2.5 text-start transition-colors touch-manipulation",
        isSeated
          ? "border-transparent bg-active text-active-foreground"
          : "border-border/60 bg-secondary/25",
        selected && !isSeated && "ring-2 ring-primary ring-offset-1",
        canDrag && "cursor-grab active:cursor-grabbing",
        isSeated && "cursor-default",
      )}
    >
      {canDrag ? (
        <button
          type="button"
          data-drag-handle
          className="touch-none text-muted-foreground"
          aria-label={t("dragToSeat")}
          onClick={(event) => event.stopPropagation()}
        >
          <GripVertical className="size-4" />
        </button>
      ) : (
        <span className="w-4 shrink-0" />
      )}
      <StatusDot assigned={isSeated} />
      <p className="min-w-0 flex-1 truncate text-sm font-medium">{guest.name || "—"}</p>
    </div>
  );
}

function FamilyGroupItem({
  group,
  assignedGuestIds,
  selectedGuestId,
  selectedGroupId,
  canUpdate,
  onSelectGuest,
  onSelectGroup,
  onPointerAssignStart,
}: {
  group: EventGuestSeatMapGroup;
  assignedGuestIds: Set<string>;
  selectedGuestId: string | null;
  selectedGroupId: string | null;
  canUpdate: boolean;
  onSelectGuest: (guestId: string | null) => void;
  onSelectGroup: (groupId: string | null) => void;
  onPointerAssignStart: SeatingGuestsSidebarProps["onPointerAssignStart"];
}) {
  const t = useTranslations("events");
  const unseated = group.members.filter(
    (member) => !assignedGuestIds.has(member.id) && !member.seatId,
  ).length;
  const canDragGroup = canUpdate && unseated > 0;
  const selected = selectedGroupId === group.id;

  return (
    <AccordionItem value={group.id} className="bg-background ring-1 ring-border/60">
      <div
        className={cn(
          "rounded-lg",
          selected && "ring-2 ring-primary ring-offset-1",
          canDragGroup && "cursor-grab active:cursor-grabbing",
        )}
        draggable={canDragGroup}
        onDragStart={(event) => {
          if (!canDragGroup) {
            event.preventDefault();
            return;
          }
          const payload = JSON.stringify({
            kind: "group",
            id: group.id,
          } satisfies SeatDragItem);
          event.dataTransfer.setData("application/x-hall-item", payload);
          event.dataTransfer.setData("text/plain", payload);
          event.dataTransfer.effectAllowed = "copyMove";
          onSelectGroup(group.id);
          onSelectGuest(null);
        }}
        onPointerDown={(event) => {
          if (!canDragGroup || event.button !== 0) return;
          if (event.pointerType === "mouse") return;
          if ((event.target as HTMLElement).closest("[data-drag-handle]")) {
            onPointerAssignStart({ kind: "group", id: group.id }, event);
          }
        }}
      >
        <AccordionTrigger
          className="px-0 text-sm font-medium"
          onClick={() => {
            onSelectGroup(selected ? null : group.id);
            onSelectGuest(null);
          }}
          action={
            canDragGroup ? (
              <button
                type="button"
                data-drag-handle
                className="touch-none text-muted-foreground"
                aria-label={t("dragToSeat")}
                onClick={(event) => event.stopPropagation()}
              >
                <GripVertical className="size-4" />
              </button>
            ) : undefined
          }
        >
          <span className="truncate">{group.parent?.name ?? t("noFamily")}</span>
          <Badge variant="secondary" className="ms-auto tabular-nums">
            {unseated}/{group.count ?? group.members.length}
          </Badge>
        </AccordionTrigger>
      </div>
      <AccordionPanel className="[&>div]:gap-1.5 [&>div]:px-2 [&>div]:py-2">
        {group.members.map((member) => (
          <GuestRow
            key={member.id}
            guest={member}
            assigned={assignedGuestIds.has(member.id)}
            selected={selectedGuestId === member.id}
            canUpdate={canUpdate}
            onSelect={() => {
              onSelectGuest(selectedGuestId === member.id ? null : member.id);
              onSelectGroup(null);
            }}
            onPointerAssignStart={onPointerAssignStart}
          />
        ))}
      </AccordionPanel>
    </AccordionItem>
  );
}

export function SeatingGuestsSidebar({
  groups,
  individuals,
  assignedGuestIds,
  query,
  onQueryChange,
  selectedGuestId,
  selectedGroupId,
  canUpdate,
  onSelectGuest,
  onSelectGroup,
  onPointerAssignStart,
  className,
}: SeatingGuestsSidebarProps) {
  const t = useTranslations("events");

  const filteredGroups = useMemo(
    () =>
      groups.filter((group) => {
        if (matchesQuery(group.parent?.name, query)) return true;
        return group.members.some((member) => matchesQuery(member.name, query));
      }),
    [groups, query],
  );

  const filteredIndividuals = useMemo(
    () => individuals.filter((guest) => matchesQuery(guest.name, query)),
    [individuals, query],
  );

  const groupsUnseated = useMemo(
    () =>
      filteredGroups.reduce(
        (sum, group) =>
          sum +
          group.members.filter((member) => !assignedGuestIds.has(member.id) && !member.seatId)
            .length,
        0,
      ),
    [assignedGuestIds, filteredGroups],
  );

  const individualsUnseated = useMemo(
    () =>
      filteredIndividuals.filter((guest) => !assignedGuestIds.has(guest.id) && !guest.seatId)
        .length,
    [assignedGuestIds, filteredIndividuals],
  );

  const isEmpty = filteredGroups.length === 0 && filteredIndividuals.length === 0;

  return (
    <div className={cn("flex h-full min-h-0 flex-col bg-card", className)}>
      <div className="shrink-0 space-y-3 border-b p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute inset-s-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={t("searchGuests")}
            className="ps-8"
          />
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <StatusDot assigned />
            {t("statusAssigned")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <StatusDot assigned={false} />
            {t("statusUnassigned")}
          </span>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {isEmpty ? (
          <p className="text-sm text-muted-foreground">{t("noMembersYet")}</p>
        ) : (
          <Accordion multiple defaultValue={["groups", "individuals"]} className="gap-2">
            <AccordionItem value="groups">
              <AccordionTrigger className="text-sm">
                <span className="truncate">{t("groupsSection")}</span>
                <Badge variant="secondary" className="ms-auto tabular-nums">
                  {groupsUnseated}/{filteredGroups.reduce((sum, g) => sum + g.members.length, 0)}
                </Badge>
              </AccordionTrigger>
              <AccordionPanel className="[&>div]:gap-2 [&>div]:px-2 [&>div]:py-2">
                {filteredGroups.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t("noFamiliesYet")}</p>
                ) : (
                  <Accordion multiple className="gap-1.5">
                    {filteredGroups.map((group) => (
                      <FamilyGroupItem
                        key={group.id}
                        group={group}
                        assignedGuestIds={assignedGuestIds}
                        selectedGuestId={selectedGuestId}
                        selectedGroupId={selectedGroupId}
                        canUpdate={canUpdate}
                        onSelectGuest={onSelectGuest}
                        onSelectGroup={onSelectGroup}
                        onPointerAssignStart={onPointerAssignStart}
                      />
                    ))}
                  </Accordion>
                )}
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem value="individuals">
              <AccordionTrigger className="text-sm">
                <span className="truncate">{t("individualGuestsSection")}</span>
                <Badge variant="secondary" className="ms-auto tabular-nums">
                  {individualsUnseated}/{filteredIndividuals.length}
                </Badge>
              </AccordionTrigger>
              <AccordionPanel className="[&>div]:gap-1.5 [&>div]:px-2 [&>div]:py-2">
                {filteredIndividuals.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t("noIndividualGuests")}</p>
                ) : (
                  filteredIndividuals.map((guest) => (
                    <GuestRow
                      key={guest.id}
                      guest={guest}
                      assigned={assignedGuestIds.has(guest.id)}
                      selected={selectedGuestId === guest.id}
                      canUpdate={canUpdate}
                      onSelect={() => {
                        onSelectGuest(selectedGuestId === guest.id ? null : guest.id);
                        onSelectGroup(null);
                      }}
                      onPointerAssignStart={onPointerAssignStart}
                    />
                  ))
                )}
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        )}
      </div>
    </div>
  );
}
