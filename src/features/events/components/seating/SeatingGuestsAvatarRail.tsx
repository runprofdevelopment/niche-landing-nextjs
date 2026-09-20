"use client";

import { Users } from "lucide-react";
import { useMemo } from "react";

import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";

import type { SeatDragItem } from "./SeatingGuestsSidebar";
import type {
  EventGuestSeatMapGroup,
  EventGuestSeatMapMember,
} from "../../graphql/queries/event-guest-seat-map-list";

type SeatingGuestsAvatarRailProps = {
  groups: EventGuestSeatMapGroup[];
  individuals: EventGuestSeatMapMember[];
  assignedGuestIds: Set<string>;
  selectedGuestId: string | null;
  selectedGroupId: string | null;
  canUpdate: boolean;
  onSelectGuest: (guestId: string | null) => void;
  onSelectGroup: (groupId: string | null) => void;
  onPointerAssignStart: (item: SeatDragItem, event: React.PointerEvent) => void;
  onOpenFullList: () => void;
  className?: string;
};

function initials(name: string | null | undefined) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

function isSeated(id: string, seatId: string | null | undefined, assignedGuestIds: Set<string>) {
  return assignedGuestIds.has(id) || Boolean(seatId);
}

export function SeatingGuestsAvatarRail({
  groups,
  individuals,
  assignedGuestIds,
  selectedGuestId,
  selectedGroupId,
  canUpdate,
  onSelectGuest,
  onSelectGroup,
  onPointerAssignStart,
  onOpenFullList,
  className,
}: SeatingGuestsAvatarRailProps) {
  const t = useTranslations("events");

  const familyItems = useMemo(
    () =>
      groups.map((group) => {
        const unseated = group.members.filter(
          (member) => !isSeated(member.id, member.seatId, assignedGuestIds),
        ).length;
        return { group, unseated, allSeated: unseated === 0 };
      }),
    [assignedGuestIds, groups],
  );

  const guestItems = useMemo(
    () =>
      individuals.map((guest) => ({
        guest,
        seated: isSeated(guest.id, guest.seatId, assignedGuestIds),
      })),
    [assignedGuestIds, individuals],
  );

  return (
    <aside
      className={cn(
        "pointer-events-auto flex h-full w-14 shrink-0 flex-col items-center gap-2 border-e border-border/70 bg-card/95 py-2 backdrop-blur touch-auto",
        className,
      )}
    >
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="size-10 shrink-0 touch-manipulation"
        onClick={onOpenFullList}
        title={t("guestsPanel")}
        aria-label={t("guestsPanel")}
      >
        <Users className="size-4" />
      </Button>

      <div className="flex min-h-0 w-full flex-1 flex-col items-center gap-2 overflow-y-auto px-1.5 pb-2">
        {familyItems.map(({ group, unseated, allSeated }) => {
          const canDrag = canUpdate && !allSeated;
          const selected = selectedGroupId === group.id;
          const label = group.parent?.name ?? t("noFamily");
          return (
            <button
              key={group.id}
              type="button"
              title={label}
              aria-label={label}
              aria-pressed={selected}
              draggable={canDrag}
              onDragStart={(event) => {
                if (!canDrag) {
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
              onClick={() => {
                if (allSeated) return;
                onSelectGroup(selected ? null : group.id);
                onSelectGuest(null);
              }}
              onPointerDown={(event) => {
                if (!canDrag || event.button !== 0) return;
                if (event.pointerType === "mouse") return;
                onPointerAssignStart({ kind: "group", id: group.id }, event);
              }}
              className={cn(
                "relative shrink-0 touch-manipulation rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring",
                canDrag && "cursor-grab active:cursor-grabbing",
                allSeated && "cursor-default opacity-55",
                selected && "ring-2 ring-primary ring-offset-1 ring-offset-background",
              )}
            >
              <Avatar className="size-10 border border-border/60">
                <AvatarFallback
                  className={cn(
                    "text-[10px] font-semibold",
                    allSeated
                      ? "bg-active text-active-foreground"
                      : "bg-secondary/40 text-foreground",
                  )}
                >
                  {initials(label)}
                </AvatarFallback>
              </Avatar>
              {!allSeated ? (
                <span className="absolute -inset-e-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                  {unseated}
                </span>
              ) : (
                <span className="absolute -inset-e-0.5 -top-0.5 size-2.5 rounded-full bg-active-foreground" />
              )}
            </button>
          );
        })}

        {guestItems.map(({ guest, seated }) => {
          const canDrag = canUpdate && !seated;
          const selected = selectedGuestId === guest.id;
          const label = guest.name || t("guestFallback");
          return (
            <button
              key={guest.id}
              type="button"
              title={label}
              aria-label={label}
              aria-pressed={selected}
              draggable={canDrag}
              onDragStart={(event) => {
                if (!canDrag) {
                  event.preventDefault();
                  return;
                }
                const payload = JSON.stringify({
                  kind: "guest",
                  id: guest.id,
                } satisfies SeatDragItem);
                event.dataTransfer.setData("application/x-hall-item", payload);
                event.dataTransfer.setData("text/plain", payload);
                event.dataTransfer.effectAllowed = "copyMove";
              }}
              onClick={() => {
                if (seated) return;
                onSelectGuest(selected ? null : guest.id);
                onSelectGroup(null);
              }}
              onPointerDown={(event) => {
                if (!canDrag || event.button !== 0) return;
                if (event.pointerType === "mouse") return;
                onPointerAssignStart({ kind: "guest", id: guest.id }, event);
              }}
              className={cn(
                "relative shrink-0 touch-manipulation rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring",
                canDrag && "cursor-grab active:cursor-grabbing",
                seated && "cursor-default opacity-55",
                selected && "ring-2 ring-primary ring-offset-1 ring-offset-background",
              )}
            >
              <Avatar className="size-10 border border-border/60">
                <AvatarFallback
                  className={cn(
                    "text-[10px] font-semibold",
                    seated ? "bg-active text-active-foreground" : "bg-muted text-foreground",
                  )}
                >
                  {initials(guest.name)}
                </AvatarFallback>
              </Avatar>
              {seated ? (
                <span className="absolute -inset-e-0.5 -top-0.5 size-2.5 rounded-full bg-active-foreground" />
              ) : null}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
