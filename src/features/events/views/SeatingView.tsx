"use client";

import Konva from "konva";
import {
  // ArrowLeft,
  Info,
  Maximize2,
  Save,
  UserMinus,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { SEATING_PERMISSIONS } from "@/constants/permissions";
// import { routes } from "@/constants/routes";
import { usePermissions } from "@/hooks/usePermissions";
import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";
// import { Link } from "@/providers/i18n";
import { useErrorHandler } from "@/services/error-handling";
import { PermissionGate } from "@/shared/components/auth/permission-gate";
import { toast } from "@/shared/components/feedback/toast";
import { Button } from "@/shared/components/ui/button";

import HallCanvas from "../components/designer/HallCanvas";
import { SeatingGuestsAvatarRail } from "../components/seating/SeatingGuestsAvatarRail";
import {
  SeatingGuestsSidebar,
  type SeatDragItem,
} from "../components/seating/SeatingGuestsSidebar";
import { clampZoom, zoomToward } from "../domain/canvas-view";
import { COORDINATE_SYSTEM } from "../domain/coordinate-system";
import { boundsOf } from "../domain/geometry";
import {
  buildSeatsByTable,
  buildTableRosterSlots,
  collectAssignedGuestIds,
} from "../domain/seat-occupancy";
import {
  useEventGuestSeatMapListQuery,
  useEventHallFindQuery,
  useEventHallObjectListQuery,
  useEventSeatMutations,
  useEventTableRosterQuery,
} from "../graphql";

import type { SaveEventSeatInput } from "../graphql/mutations/event-seat-save-all";
import type { HallObject } from "../types";

export default function SeatingApp({ eventId, hallId }: { eventId: string; hallId: string }) {
  const t = useTranslations("events");
  const tCommon = useTranslations("common");
  const { handleError } = useErrorHandler();
  const { can } = usePermissions();
  const canUpdateSeating = can(SEATING_PERMISSIONS.update);

  const { hall, loading: hallLoading } = useEventHallFindQuery(hallId);
  const { objects, refetch: refetchObjects } = useEventHallObjectListQuery(eventId, hallId);
  const {
    groups,
    individuals,
    loading: guestsLoading,
    refetch: refetchGuests,
  } = useEventGuestSeatMapListQuery(eventId);
  const { saveSeats, unassignSeat, saving: savingSeating, unassigning } = useEventSeatMutations();

  const [query, setQuery] = useState("");
  const [zoom, setZoom] = useState(0.7);
  const [pan, setPan] = useState({ x: 20, y: 20 });
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [guestsPanelOpen, setGuestsPanelOpen] = useState(false);
  const [detailsPanelOpen, setDetailsPanelOpen] = useState(false);
  const [assignments, setAssignments] = useState<SaveEventSeatInput[]>([]);
  const mapHostRef = useRef<HTMLDivElement | null>(null);
  const ghostRef = useRef<HTMLDivElement | null>(null);

  const {
    roster,
    loading: rosterLoading,
    refetch: refetchRoster,
  } = useEventTableRosterQuery(selectedTableId, { skip: !selectedTableId });

  const tables = useMemo(() => objects.filter((object) => object.type === "table"), [objects]);
  const selectedTable = tables.find((entry) => entry.id === selectedTableId);

  const allMembers = useMemo(() => {
    const members = new Map<string, { id: string; name: string }>();
    for (const group of groups) {
      for (const member of group.members) {
        members.set(member.id, { id: member.id, name: member.name ?? "" });
      }
    }
    for (const guest of individuals) {
      members.set(guest.id, { id: guest.id, name: guest.name ?? "" });
    }
    return members;
  }, [groups, individuals]);

  const assignedGuestIds = useMemo(
    () =>
      collectAssignedGuestIds({
        assignments,
        rosterGuestIds: selectedTableId ? (roster?.seats ?? []).map((seat) => seat.guestId) : [],
        groups,
        individuals,
      }),
    [assignments, groups, individuals, roster, selectedTableId],
  );

  const guestTotal = allMembers.size;
  const reservedTotal =
    tables.reduce((sum, table) => sum + (table.reservedSeats ?? 0), 0) + assignments.length;

  // Snapshot from hall-object list only — never from roster/selection.
  const reservedByTableId = useMemo(() => {
    const map: Record<string, number> = {};
    for (const table of tables) {
      map[table.id] = table.reservedSeats ?? 0;
    }
    return map;
  }, [tables]);

  const seatsByTable = useMemo(
    () =>
      buildSeatsByTable({
        tables,
        assignments,
        allMembers,
        reservedByTableId,
      }),
    [allMembers, assignments, reservedByTableId, tables],
  );

  const nextSeatIndexes = useCallback(
    (table: HallObject, count: number) => {
      const capacity = table.capacity ?? 0;
      const used = new Set(
        assignments.filter((seat) => seat.tableId === table.id).map((seat) => seat.seatIndex),
      );
      // Backend reserved seats without known indexes — treat lowest indexes as taken.
      const reserved = reservedByTableId[table.id] ?? table.reservedSeats ?? 0;
      for (let index = 1; index <= reserved; index += 1) {
        used.add(index);
      }
      const free: number[] = [];
      for (let index = 1; index <= capacity && free.length < count; index += 1) {
        if (!used.has(index)) free.push(index);
      }
      return free;
    },
    [assignments, reservedByTableId],
  );

  const applyAssign = useCallback(
    (item: SeatDragItem, table: HallObject) => {
      if (!canUpdateSeating) return;

      const guestIds: string[] = [];
      if (item.kind === "guest") {
        if (assignedGuestIds.has(item.id)) {
          toast.error(t("dropOntoTable"));
          return;
        }
        guestIds.push(item.id);
      } else {
        const group = groups.find((entry) => entry.id === item.id);
        if (!group) return;
        for (const member of group.members) {
          if (!assignedGuestIds.has(member.id)) guestIds.push(member.id);
        }
      }

      if (guestIds.length === 0) {
        toast.error(t("dropOntoTable"));
        return;
      }

      const indexes = nextSeatIndexes(table, guestIds.length);
      if (indexes.length < guestIds.length) {
        toast.error(
          t("tableCapacitySummary", {
            capacity: table.capacity ?? 0,
            assigned:
              (reservedByTableId[table.id] ?? table.reservedSeats ?? 0) +
              assignments.filter((s) => s.tableId === table.id).length,
            total: table.capacity ?? 0,
            available: indexes.length,
          }),
        );
        return;
      }

      const nextSeats = guestIds.map((guestId, index) => ({
        guestId,
        tableId: table.id,
        seatIndex: indexes[index]!,
      }));
      setAssignments((current) => [...current, ...nextSeats]);
      setSelectedTableId(table.id);
      setSelectedGuestId(null);
      setSelectedGroupId(null);
      toast.success(`${table.label} — ${guestIds.length}`);
    },
    [
      assignments,
      assignedGuestIds,
      canUpdateSeating,
      groups,
      nextSeatIndexes,
      reservedByTableId,
      t,
    ],
  );

  const hitTestTable = useCallback(
    (x: number, y: number): HallObject | undefined =>
      tables.find((table) => {
        const b = boundsOf(table);
        const pad = 12;
        return x >= b.x1 - pad && x <= b.x2 + pad && y >= b.y1 - pad && y <= b.y2 + pad;
      }),
    [tables],
  );

  const clientToLogical = useCallback((clientX: number, clientY: number) => {
    const el = document.querySelector("[data-hall-canvas]") as HTMLElement | null;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    // Prefer live Stage transform so drops stay accurate during pan/zoom.
    const stage = Konva.stages.find((entry) => el.contains(entry.container()));
    const panX = stage?.x() ?? 0;
    const panY = stage?.y() ?? 0;
    const scale = stage?.scaleX() || 1;
    return {
      x: (clientX - rect.left - panX) / scale,
      y: (clientY - rect.top - panY) / scale,
    };
  }, []);

  const handleViewChange = useCallback((v: { zoom: number; pan: { x: number; y: number } }) => {
    setZoom(v.zoom);
    setPan(v.pan);
  }, []);

  useEffect(() => {
    const handler = (event: Event) => {
      if (!canUpdateSeating) return;
      const detail = (event as CustomEvent).detail as { raw: string; x: number; y: number };
      let item: SeatDragItem;
      try {
        item = JSON.parse(detail.raw) as SeatDragItem;
      } catch {
        return;
      }
      if (item.kind !== "guest" && item.kind !== "group") return;
      const table = hitTestTable(detail.x, detail.y);
      if (!table) {
        toast.error(t("dropOntoTable"));
        return;
      }
      applyAssign(item, table);
    };
    window.addEventListener("hall-canvas-drop", handler);
    return () => window.removeEventListener("hall-canvas-drop", handler);
  }, [applyAssign, canUpdateSeating, hitTestTable, t]);

  const onPointerAssignStart = useCallback(
    (item: SeatDragItem, event: React.PointerEvent) => {
      if (!canUpdateSeating || event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();

      const startX = event.clientX;
      const startY = event.clientY;
      let dragging = false;

      const label =
        item.kind === "group"
          ? (groups.find((group) => group.id === item.id)?.parent?.name ?? t("noFamily"))
          : (allMembers.get(item.id)?.name ?? t("guestFallback"));

      const ensureGhost = () => {
        if (ghostRef.current) return ghostRef.current;
        const ghost = document.createElement("div");
        ghost.className =
          "pointer-events-none fixed z-[120] max-w-[60vw] truncate rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg";
        ghost.textContent = label;
        document.body.appendChild(ghost);
        ghostRef.current = ghost;
        return ghost;
      };

      const move = (ev: PointerEvent) => {
        if (!dragging && Math.hypot(ev.clientX - startX, ev.clientY - startY) < 10) return;
        dragging = true;
        const ghost = ensureGhost();
        ghost.style.left = `${ev.clientX + 12}px`;
        ghost.style.top = `${ev.clientY + 12}px`;
      };

      const finish = (ev: PointerEvent) => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", finish);
        window.removeEventListener("pointercancel", finish);
        ghostRef.current?.remove();
        ghostRef.current = null;
        if (!dragging) return;
        const logical = clientToLogical(ev.clientX, ev.clientY);
        if (!logical) {
          toast.error(t("dropOntoTable"));
          return;
        }
        const table = hitTestTable(logical.x, logical.y);
        if (!table) {
          toast.error(t("dropOntoTable"));
          return;
        }
        applyAssign(item, table);
      };

      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", finish);
      window.addEventListener("pointercancel", finish);
    },
    [allMembers, applyAssign, canUpdateSeating, clientToLogical, groups, hitTestTable, t],
  );

  const handleSaveSeating = async () => {
    try {
      await saveSeats({ eventId, eventHallId: hallId, seats: assignments });
      toast.success(t("seatingSaved"));
      setAssignments([]);
      void refetchObjects();
      void refetchGuests();
      void refetchRoster();
    } catch (error) {
      handleError(error, { context: { feature: "events", action: "saveSeating" } });
    }
  };

  const handleUnassign = async (seatId: string) => {
    try {
      await unassignSeat({ eventId, seatId });
      toast.success(t("guestUnseated", { name: "Guest" }));
      void refetchRoster();
      void refetchObjects();
      void refetchGuests();
    } catch (error) {
      handleError(error, { context: { feature: "events", action: "unassignSeat" } });
    }
  };

  const zoomBy = (factor: number) => {
    const host = mapHostRef.current;
    const cx = host ? host.clientWidth / 2 : 200;
    const cy = host ? host.clientHeight / 2 : 150;
    const next = zoomToward({ zoom, pan }, zoom * factor, { x: cx, y: cy });
    setZoom(next.zoom);
    setPan(next.pan);
  };

  const fitToHall = useCallback(() => {
    if (!hall || !mapHostRef.current) return;
    const w = mapHostRef.current.clientWidth;
    const h = mapHostRef.current.clientHeight;
    if (w < 40 || h < 40) return;
    const pad = 20;
    const bw = Math.max(1, hall.boundary.width);
    const bh = Math.max(1, hall.boundary.height);
    const z = clampZoom(Math.min((w - pad * 2) / bw, (h - pad * 2) / bh));
    setZoom(z);
    setPan({
      x: (w - bw * z) / 2 - hall.boundary.x * z,
      y: (h - bh * z) / 2 - hall.boundary.y * z,
    });
  }, [hall]);

  const handleTableClick = (tableId: string) => {
    const table = tables.find((entry) => entry.id === tableId);
    setSelectedTableId(tableId);

    if (table && canUpdateSeating && selectedGroupId) {
      applyAssign({ kind: "group", id: selectedGroupId }, table);
      return;
    }
    if (table && canUpdateSeating && selectedGuestId && !assignedGuestIds.has(selectedGuestId)) {
      applyAssign({ kind: "guest", id: selectedGuestId }, table);
      return;
    }

    // Mobile/tablet: open the floating details sheet. Desktop uses the right rail.
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches) {
      setDetailsPanelOpen(true);
      setGuestsPanelOpen(false);
    }
  };

  const pendingAssignName = selectedGroupId
    ? (groups.find((group) => group.id === selectedGroupId)?.parent?.name ?? null)
    : selectedGuestId && !assignedGuestIds.has(selectedGuestId)
      ? (allMembers.get(selectedGuestId)?.name ?? null)
      : null;

  const rosterSeats = useMemo(() => {
    if (!selectedTableId) return [];
    return roster?.seats ?? [];
  }, [roster, selectedTableId]);
  const rosterCapacity = selectedTable?.capacity ?? 0;
  const pendingForSelected = useMemo(
    () => assignments.filter((seat) => seat.tableId === selectedTableId),
    [assignments, selectedTableId],
  );
  const rosterSlots = useMemo(
    () =>
      buildTableRosterSlots({
        capacity: rosterCapacity,
        rosterSeats,
        pending: pendingForSelected,
        memberNames: allMembers,
        reservedCount: selectedTableId
          ? (reservedByTableId[selectedTableId] ?? selectedTable?.reservedSeats ?? 0)
          : 0,
      }),
    [
      allMembers,
      pendingForSelected,
      reservedByTableId,
      rosterCapacity,
      rosterSeats,
      selectedTable?.reservedSeats,
      selectedTableId,
    ],
  );

  if (hallLoading && !hall) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        {tCommon("loading")}
      </div>
    );
  }

  if (!hall) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        {t("createHallFirst")}
      </div>
    );
  }

  const rosterLabel = selectedTable?.label ?? t("tableFallback");
  const rosterOccupied = rosterSlots.filter(
    (slot) => slot.guestId || slot.guestName || slot.seatId || slot.reservedPlaceholder,
  ).length;
  const rosterAvailable = Math.max(0, rosterCapacity - rosterOccupied);

  const guestsSidebar = (
    <SeatingGuestsSidebar
      groups={groups}
      individuals={individuals}
      assignedGuestIds={assignedGuestIds}
      query={query}
      onQueryChange={setQuery}
      selectedGuestId={selectedGuestId}
      selectedGroupId={selectedGroupId}
      canUpdate={canUpdateSeating}
      onSelectGuest={setSelectedGuestId}
      onSelectGroup={setSelectedGroupId}
      onPointerAssignStart={onPointerAssignStart}
    />
  );

  const tableRosterPanel = (
    <div className="space-y-3">
      {!selectedTableId ? (
        <p className="text-sm text-muted-foreground">{t("seatingHintMobile")}</p>
      ) : rosterLoading ? (
        <p className="text-sm text-muted-foreground">{tCommon("loading")}</p>
      ) : (
        <div>
          <p className="text-sm font-medium">{rosterLabel}</p>
          <p className="text-xs text-muted-foreground">
            {t("tableCapacitySummary", {
              capacity: rosterCapacity,
              assigned: rosterOccupied,
              total: rosterCapacity,
              available: rosterAvailable,
            })}
          </p>
          <div className="mt-3 space-y-1.5">
            {rosterCapacity <= 0 ? (
              <p className="text-sm text-muted-foreground">{t("tableHasNoSeats")}</p>
            ) : (
              rosterSlots.map((slot) => {
                const occupied = Boolean(
                  slot.guestName || slot.guestId || slot.reservedPlaceholder,
                );
                return (
                  <div
                    key={slot.key}
                    className={cn(
                      "flex min-h-11 items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm",
                      occupied
                        ? "border-transparent bg-active text-active-foreground"
                        : "border-border/60 bg-secondary/30",
                    )}
                  >
                    <span className="text-xs text-muted-foreground">
                      {t("seatNumberLabel", { number: slot.seatIndex })}
                    </span>
                    {occupied ? (
                      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
                        <span className="truncate font-medium">
                          {slot.guestName || (slot.reservedPlaceholder ? t("seatedGuest") : "—")}
                        </span>
                        {canUpdateSeating && !slot.reservedPlaceholder ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 shrink-0 touch-manipulation"
                            disabled={unassigning || (!slot.pending && !slot.seatId)}
                            onClick={() => {
                              if (slot.pending && slot.guestId) {
                                setAssignments((current) =>
                                  current.filter(
                                    (entry) =>
                                      !(
                                        entry.guestId === slot.guestId &&
                                        entry.tableId === selectedTableId &&
                                        entry.seatIndex === slot.seatIndex
                                      ),
                                  ),
                                );
                                return;
                              }
                              if (slot.seatId) void handleUnassign(slot.seatId);
                            }}
                          >
                            <UserMinus className="size-4" />
                          </Button>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">{t("emptySeat")}</span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <PermissionGate permission={SEATING_PERMISSIONS.view}>
      {/* Sit in the dashboard layout so the app header and sidebar stay visible (same as designer). */}
      <div className="flex h-full min-h-0 flex-col bg-background">
        <header className="flex shrink-0 flex-wrap items-center gap-2 border-b bg-card/95 px-2 py-2 backdrop-blur sm:gap-3 sm:px-3">
          {/* <Button
            variant="ghost"
            size="icon"
            asChild
            className="size-11 shrink-0 touch-manipulation"
          >
            <Link href={routes.event(eventId)} aria-label={t("back")}>
              <ArrowLeft className="size-5" />
            </Link>
          </Button> */}
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-base font-semibold leading-tight sm:text-lg">
              {t("seatingAssignment")}
            </h1>
            <p className="truncate text-xs text-muted-foreground">
              {hall.name}
              <span className="ms-2 tabular-nums sm:hidden">
                · {reservedTotal}/{guestTotal}
              </span>
            </p>
          </div>

          <div className="order-last flex w-full items-center justify-center gap-4 text-xs text-muted-foreground sm:order-0 sm:w-auto">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-active-foreground" aria-hidden />
              {t("assignedSeatLegend")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-secondary" aria-hidden />
              {t("unassignedSeatLegend")}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <span className="me-1 hidden text-xs tabular-nums md:inline">
              {t("assignedCount", { assigned: reservedTotal, total: guestTotal })}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="hidden size-11 touch-manipulation sm:inline-flex"
              onClick={() => zoomBy(1 / 1.25)}
              title={t("zoomOut")}
            >
              <ZoomOut className="size-5" />
            </Button>
            <span className="hidden w-12 text-center text-xs tabular-nums sm:inline">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="hidden size-11 touch-manipulation sm:inline-flex"
              onClick={() => zoomBy(1.25)}
              title={t("zoomIn")}
            >
              <ZoomIn className="size-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden size-11 touch-manipulation sm:inline-flex"
              onClick={fitToHall}
              title={t("fitToHall")}
            >
              <Maximize2 className="size-5" />
            </Button>
            {canUpdateSeating ? (
              <Button
                size="sm"
                className="h-11 touch-manipulation px-3"
                disabled={savingSeating || assignments.length === 0}
                onClick={() => void handleSaveSeating()}
              >
                <Save className="size-4 sm:me-1" />
                <span className="hidden sm:inline">{t("saveSeating")}</span>
              </Button>
            ) : null}
          </div>
        </header>

        {pendingAssignName && canUpdateSeating ? (
          <div className="flex items-center gap-2 border-b bg-primary px-3 py-2.5 text-sm text-primary-foreground">
            <span className="min-w-0 flex-1 truncate font-medium">
              {t("tapTableToSeat", { name: pendingAssignName })}
            </span>
            <Button
              variant="secondary"
              size="sm"
              className="h-9 shrink-0 touch-manipulation"
              onClick={() => {
                setSelectedGuestId(null);
                setSelectedGroupId(null);
              }}
            >
              {t("cancel")}
            </Button>
          </div>
        ) : null}

        <div className="flex min-h-0 flex-1">
          <aside className="hidden w-80 shrink-0 border-e lg:flex lg:flex-col">
            {guestsLoading ? (
              <p className="p-3 text-sm text-muted-foreground">{tCommon("loading")}</p>
            ) : (
              guestsSidebar
            )}
          </aside>

          <main className="relative min-h-0 min-w-0 flex-1 touch-none">
            <div className="absolute inset-0 flex min-h-0">
              {/* Compact avatar rail — keeps the map usable on phones / mid screens. */}
              <div className="relative z-20 shrink-0 lg:hidden">
                {guestsLoading ? (
                  <div className="flex h-full w-14 items-center justify-center border-e bg-card/95">
                    <span className="size-2 animate-pulse rounded-full bg-muted-foreground/40" />
                  </div>
                ) : (
                  <SeatingGuestsAvatarRail
                    groups={groups}
                    individuals={individuals}
                    assignedGuestIds={assignedGuestIds}
                    selectedGuestId={selectedGuestId}
                    selectedGroupId={selectedGroupId}
                    canUpdate={canUpdateSeating}
                    onSelectGuest={setSelectedGuestId}
                    onSelectGroup={setSelectedGroupId}
                    onPointerAssignStart={onPointerAssignStart}
                    onOpenFullList={() => {
                      setGuestsPanelOpen(true);
                      setDetailsPanelOpen(false);
                    }}
                  />
                )}
              </div>

              <div ref={mapHostRef} className="relative min-h-0 min-w-0 flex-1">
                <HallCanvas
                  mode="view"
                  boundary={hall.boundary}
                  objects={objects}
                  coordinateSystem={hall.layout.coordinateSystem ?? COORDINATE_SYSTEM}
                  zoom={zoom}
                  pan={pan}
                  onViewChange={handleViewChange}
                  showGrid
                  seatsByTable={seatsByTable}
                  highlightTableId={selectedTableId}
                  onTableClick={handleTableClick}
                  autoFit
                />
              </div>
            </div>

            {guestsPanelOpen ? (
              <div className="absolute inset-s-2 top-2 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 flex w-[min(18.5rem,calc(100%-4.75rem))] flex-col overflow-hidden rounded-xl border border-border/70 bg-card shadow-xl touch-auto lg:hidden">
                <div className="flex shrink-0 items-center justify-between gap-2 border-b px-2.5 py-2">
                  <p className="truncate text-sm font-semibold">{t("guestsPanel")}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-9 shrink-0 touch-manipulation"
                    onClick={() => setGuestsPanelOpen(false)}
                    aria-label={t("close")}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
                <div className="min-h-0 flex-1 overflow-hidden">{guestsSidebar}</div>
              </div>
            ) : null}

            {detailsPanelOpen && selectedTableId ? (
              <div className="absolute inset-x-2 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 max-h-[42%] overflow-y-auto rounded-xl border border-border/70 bg-card p-3 shadow-xl lg:hidden">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold">{rosterLabel}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-9 shrink-0 touch-manipulation"
                    onClick={() => setDetailsPanelOpen(false)}
                    aria-label={t("close")}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
                {tableRosterPanel}
              </div>
            ) : null}

            <div className="absolute inset-e-3 top-3 z-20 flex flex-col gap-2 lg:hidden">
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="size-11 shadow-md touch-manipulation"
                onClick={() => zoomBy(1.25)}
                title={t("zoomIn")}
              >
                <ZoomIn className="size-5" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="size-11 shadow-md touch-manipulation"
                onClick={() => zoomBy(1 / 1.25)}
                title={t("zoomOut")}
              >
                <ZoomOut className="size-5" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="size-11 shadow-md touch-manipulation"
                onClick={fitToHall}
                title={t("fitToHall")}
              >
                <Maximize2 className="size-5" />
              </Button>
              {selectedTableId ? (
                <Button
                  type="button"
                  size="icon"
                  variant={detailsPanelOpen ? "default" : "secondary"}
                  className="size-11 shadow-md touch-manipulation"
                  onClick={() => {
                    setDetailsPanelOpen((open) => !open);
                    setGuestsPanelOpen(false);
                  }}
                  title={rosterLabel}
                  aria-pressed={detailsPanelOpen}
                >
                  <Info className="size-5" />
                </Button>
              ) : null}
            </div>
          </main>

          <aside className="hidden w-72 shrink-0 overflow-y-auto border-s bg-card p-3 lg:block">
            {tableRosterPanel}
          </aside>
        </div>
      </div>
    </PermissionGate>
  );
}
