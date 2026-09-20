"use client";

import {
  // ArrowLeft,
  Check,
  CircleAlert,
  Redo2,
  Save,
  Settings2,
  Trash2,
  Undo2,
  Users,
  Armchair,
  ZoomIn,
  ZoomOut,
  Maximize,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";

import { HALL_PERMISSIONS } from "@/constants/permissions";
import { routes } from "@/constants/routes";
import { usePermissions } from "@/hooks/usePermissions";
import { useTranslations } from "@/hooks/useTranslations";
import { useRouter } from "@/providers/i18n";
import { useErrorHandler } from "@/services/error-handling";
import { PermissionGate } from "@/shared/components/auth/permission-gate";
import { toast } from "@/shared/components/feedback/toast";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/shared/components/ui/sheet";

import { DesignerMobileIconTray } from "../components/designer/DesignerMobileIconTray";
import {
  DesignerObjectsPanel,
  type LibraryItem,
} from "../components/designer/DesignerObjectsPanel";
import { zoomToward } from "../domain/canvas-view";
import { OBJECT_PRESETS } from "../domain/catalog";
import { totalSeatingCapacity, validatePlacement } from "../domain/geometry";
import {
  countPlacedForShapeCapacity,
  libraryQuantityForShapeCapacity,
} from "../domain/table-templates";
import {
  useEventHallObjectListQuery,
  useEventHallObjectMutations,
} from "../graphql/hooks/use-event-hall-objects";
import { useEventHallFindQuery } from "../graphql/hooks/use-event-halls";
import { useEventQuery } from "../graphql/hooks/use-events";
import { mapHallObjectFromApi } from "../graphql/mappers/hall-object.mapper";
import { useDesigner } from "../store/designer.store";
import { uid } from "../utils/uid";

import type { HallObject } from "../types";

const HallCanvas = dynamic(() => import("../components/designer/HallCanvas"), { ssr: false });

export type { HallObject };

export default function DesignerApp({ eventId, hallId }: { eventId: string; hallId: string }) {
  const t = useTranslations("events");
  const { handleError } = useErrorHandler();
  const { can } = usePermissions();
  const canUpdateHall = can(HALL_PERMISSIONS.update);
  const router = useRouter();
  const { event, loading: eventLoading } = useEventQuery(eventId);
  const { hall, loading: hallLoading } = useEventHallFindQuery(hallId, {
    ...(event?.expectedGuests != null ? { expectedGuests: event.expectedGuests } : {}),
    ...(event?.eventType ? { eventType: event.eventType } : {}),
  });
  const {
    objects: loadedObjects,
    persistedIds,
    ready: objectsReady,
    refetch: refetchObjects,
  } = useEventHallObjectListQuery(eventId, hallId);
  const { saveAllObjects, destroyObject, saving } = useEventHallObjectMutations();
  const d = useDesigner();
  const [armed, setArmed] = useState<LibraryItem | null>(null);
  const [propertiesOpen, setPropertiesOpen] = useState(false);
  const ghostRef = useRef<HTMLDivElement | null>(null);
  const canvasHostRef = useRef<HTMLDivElement | null>(null);
  const suppressLoadRef = useRef(false);
  const loadedHallRef = useRef<string | null>(null);

  useEffect(() => {
    if (suppressLoadRef.current) return;
    if (!hall || !objectsReady) return;
    const hallChanged = loadedHallRef.current !== hall.id;
    if (!hallChanged && useDesigner.getState().dirty) return;
    loadedHallRef.current = hall.id;
    useDesigner.getState().init(loadedObjects);
  }, [hall, loadedObjects, objectsReady]);

  const addTable = useCallback(
    (templateId: string, x: number, y: number): HallObject | null => {
      const tpl = hall?.tableTemplates.find((template) => template.id === templateId);
      if (!tpl || !hall) return null;
      const objects = useDesigner.getState().objects;
      const placedForType = countPlacedForShapeCapacity(objects, tpl.shape, tpl.capacity);
      const allowed = libraryQuantityForShapeCapacity(hall.tableTemplates, tpl.shape, tpl.capacity);
      if (placedForType >= allowed) {
        toast.error(`No ${tpl.name} left in the library`);
        return null;
      }
      return {
        id: uid("obj"),
        type: "table",
        label: "table",
        x: Math.round(x),
        y: Math.round(y),
        width: tpl.width,
        height: tpl.height,
        rotation: 0,
        zIndex: 10,
        templateId: tpl.id,
        tableShape: tpl.shape,
        capacity: tpl.capacity,
        geometry: "box",
      };
    },
    [hall],
  );

  const addObject = useCallback((presetType: string, x: number, y: number): HallObject | null => {
    const p = OBJECT_PRESETS.find((o) => o.type === presetType);
    if (!p) return null;
    return {
      id: uid("obj"),
      type: p.type,
      label: p.type === "vip" ? "vipArea" : p.type,
      x: Math.round(x),
      y: Math.round(y),
      width: p.width,
      height: p.height,
      rotation: 0,
      zIndex: p.category === "Areas" ? 1 : 5,
      geometry: "box",
    };
  }, []);

  const tryPlaceItem = useCallback(
    (item: LibraryItem, x: number, y: number): boolean => {
      if (!hall) return false;
      const draft = item.kind === "table" ? addTable(item.id, x, y) : addObject(item.id, x, y);
      if (!draft) return false;

      const objects = useDesigner.getState().objects;
      const validation = validatePlacement(draft, objects, hall.boundary);
      if (!validation.valid) {
        toast.error(t("cannotDropHere"));
        return false;
      }

      useDesigner.getState().add(draft);
      return true;
    },
    [addObject, addTable, hall, t],
  );

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { raw: string; x: number; y: number };
      const item = JSON.parse(detail.raw) as LibraryItem;
      tryPlaceItem(item, detail.x, detail.y);
    };
    window.addEventListener("hall-canvas-drop", handler);
    return () => window.removeEventListener("hall-canvas-drop", handler);
  }, [tryPlaceItem]);

  const startPointerDrag = useCallback(
    (item: LibraryItem, disabled: boolean) => (e: React.PointerEvent) => {
      if (disabled || e.button === 2) return;
      e.preventDefault();
      const startX = e.clientX;
      const startY = e.clientY;
      let dragging = false;

      const ensureGhost = () => {
        if (ghostRef.current) return ghostRef.current;
        const g = document.createElement("div");
        g.className =
          "pointer-events-none fixed z-[80] -translate-x-1/2 -translate-y-1/2 rounded-md border bg-card px-3 py-1.5 text-xs font-medium shadow-lg";
        g.textContent = item.label;
        document.body.appendChild(g);
        ghostRef.current = g;
        return g;
      };

      const move = (ev: PointerEvent) => {
        if (!dragging && Math.hypot(ev.clientX - startX, ev.clientY - startY) < 8) return;
        dragging = true;
        const g = ensureGhost();
        g.style.left = `${ev.clientX}px`;
        g.style.top = `${ev.clientY}px`;
      };

      const finish = (ev: PointerEvent) => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", finish);
        window.removeEventListener("pointercancel", finish);
        ghostRef.current?.remove();
        ghostRef.current = null;
        if (!dragging) {
          setArmed((current) => {
            if (item.kind === "table" && current?.kind === "table") {
              return current.id === item.id && current.slotIndex === item.slotIndex ? null : item;
            }
            if (item.kind === "object" && current?.kind === "object") {
              return current.id === item.id ? null : item;
            }
            return item;
          });
          return;
        }
        const canvas = document.querySelector("[data-hall-canvas]") as HTMLElement | null;
        if (!canvas) {
          toast.error(t("cannotDropHere"));
          return;
        }
        const rect = canvas.getBoundingClientRect();
        if (
          ev.clientX < rect.left ||
          ev.clientX > rect.right ||
          ev.clientY < rect.top ||
          ev.clientY > rect.bottom
        ) {
          toast.error(t("cannotDropHere"));
          return;
        }
        const view = useDesigner.getState();
        tryPlaceItem(
          item,
          (ev.clientX - rect.left - view.pan.x) / view.zoom,
          (ev.clientY - rect.top - view.pan.y) / view.zoom,
        );
      };

      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", finish);
      window.addEventListener("pointercancel", finish);
    },
    [t, tryPlaceItem],
  );

  const removeObjects = useCallback(
    async (ids: string[]) => {
      if (!ids.length) return;
      const localIds = ids.filter((id) => !persistedIds.has(id));
      const savedIds = ids.filter((id) => persistedIds.has(id));
      suppressLoadRef.current = true;
      try {
        if (localIds.length) useDesigner.getState().remove(localIds);

        const removed: string[] = [];
        for (const id of savedIds) {
          try {
            await destroyObject(id);
            removed.push(id);
          } catch {
            toast.error(t("objectDeleteFailed"));
          }
        }
        if (removed.length) useDesigner.getState().remove(removed);
      } finally {
        suppressLoadRef.current = false;
      }
    },
    [destroyObject, persistedIds, t],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = useDesigner.getState();
      if (e.key === "Escape") {
        s.cancelDrawing();
        setArmed(null);
      }
      if (e.key === "Enter" && s.drawing) s.finishDrawing();
      if ((e.key === "Delete" || e.key === "Backspace") && s.selectedIds.length) {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
        e.preventDefault();
        void removeObjects(s.selectedIds);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) s.redo();
        else s.undo();
      }
      if (e.key === "+" || e.key === "=") {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
        e.preventDefault();
        const el = document.querySelector("[data-hall-canvas]") as HTMLElement | null;
        const point = el ? { x: el.clientWidth / 2, y: el.clientHeight / 2 } : { x: 0, y: 0 };
        s.setView(zoomToward(s, s.zoom * 1.25, point));
      }
      if (e.key === "-" || e.key === "_") {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
        e.preventDefault();
        const el = document.querySelector("[data-hall-canvas]") as HTMLElement | null;
        const point = el ? { x: el.clientWidth / 2, y: el.clientHeight / 2 } : { x: 0, y: 0 };
        s.setView(zoomToward(s, s.zoom / 1.25, point));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [removeObjects]);

  const fitCanvas = useCallback(() => {
    if (!hall) return;
    const el =
      canvasHostRef.current?.querySelector("[data-hall-canvas]") ??
      (document.querySelector("[data-hall-canvas]") as HTMLElement | null);
    if (!el || el.clientWidth < 40 || el.clientHeight < 40) return;
    const b = hall.boundary;
    const pad = 32;
    const zoom = Math.max(
      0.08,
      Math.min(
        (el.clientWidth - pad * 2) / Math.max(1, b.width),
        (el.clientHeight - pad * 2) / Math.max(1, b.height),
      ),
    );
    useDesigner.getState().setView({
      zoom,
      pan: {
        x: (el.clientWidth - b.width * zoom) / 2 - b.x * zoom,
        y: (el.clientHeight - b.height * zoom) / 2 - b.y * zoom,
      },
    });
  }, [hall]);

  useEffect(() => {
    const timer = window.setTimeout(fitCanvas, 80);
    return () => window.clearTimeout(timer);
  }, [fitCanvas]);

  const zoomBy = useCallback((factor: number) => {
    const el = document.querySelector("[data-hall-canvas]") as HTMLElement | null;
    const view = useDesigner.getState();
    const point = el ? { x: el.clientWidth / 2, y: el.clientHeight / 2 } : { x: 0, y: 0 };
    useDesigner.getState().setView(zoomToward(view, view.zoom * factor, point));
  }, []);

  const handleViewChange = useCallback((v: { zoom: number; pan: { x: number; y: number } }) => {
    useDesigner.getState().setView(v);
  }, []);

  const selectedId = d.selectedIds[0] ?? null;

  if ((eventLoading && !event) || (hallLoading && !hall)) {
    return <p className="p-8 text-sm text-muted-foreground">{t("loadingEvent")}</p>;
  }

  if (!hall) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No hall found for this event.</p>
          <Button className="mt-4" onClick={() => router.push(routes.eventHallSetup(eventId))}>
            {t("editHallLayout")}
          </Button>
        </div>
      </div>
    );
  }

  if (!objectsReady) {
    return <p className="p-8 text-sm text-muted-foreground">{t("loadingEvent")}</p>;
  }

  const selected = d.objects.find((o) => o.id === selectedId);
  const selectedValidation = selected
    ? validatePlacement(selected, d.objects, hall.boundary)
    : null;
  const capacity = totalSeatingCapacity(d.objects);
  const enough = capacity >= hall.expectedGuests;

  const handleSave = async () => {
    if (saving) return;
    try {
      await saveAllObjects({
        eventId,
        eventHallId: hall.id,
        objects: useDesigner.getState().objects,
        persistedIds,
      });
      const result = await refetchObjects();
      const next = (result.data?.eventHallObjectList ?? []).map(mapHallObjectFromApi);
      useDesigner.getState().init(next);
      useDesigner.getState().markSaved();
      toast.success(t("layoutSaved"));
      router.push(routes.event(eventId));
    } catch (error) {
      handleError(error, { context: { feature: "events", action: "eventHallObjectSaveAll" } });
    }
  };

  const propertiesPanel = (
    <div className="space-y-3">
      {!selected ? (
        <p className="text-sm text-muted-foreground">
          Select an object on the canvas to edit it. Drag items from the library to place them.
        </p>
      ) : (
        <>
          <div>
            <p className="text-sm font-medium">Selected: {selected.label}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {selected.type === "table"
                ? `${selected.tableShape} table`
                : selected.type.replace("-", " ")}
            </p>
          </div>
          {selectedValidation && !selectedValidation.valid && (
            <p className="rounded-md bg-destructive/10 px-2 py-1.5 text-xs text-destructive">
              {t("cannotDropHere")}
              {selectedValidation.reason ? ` — ${selectedValidation.reason}` : ""}
            </p>
          )}
          {selected.type === "table" && (
            <div>
              <Label className="text-xs">Capacity</Label>
              <Input
                type="number"
                min={1}
                max={24}
                value={selected.capacity ?? 0}
                onChange={(e) =>
                  d.update(selected.id, { capacity: Math.max(1, Number(e.target.value) || 1) })
                }
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Seats are generated automatically around the table.
              </p>
            </div>
          )}
          <details className="rounded-md border p-2" open>
            <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
              Advanced values
            </summary>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(["x", "y", "width", "height", "rotation"] as const).map((k) => (
                <div key={k} className={k === "rotation" ? "col-span-2" : ""}>
                  <Label className="text-xs capitalize">{k}</Label>
                  <Input
                    type="number"
                    value={Math.round(selected[k])}
                    onChange={(e) => d.update(selected.id, { [k]: Number(e.target.value) || 0 })}
                  />
                </div>
              ))}
            </div>
          </details>
          <Button
            variant="destructive"
            size="sm"
            className="w-full"
            onClick={() => void removeObjects([selected.id])}
          >
            <Trash2 className="mr-1 size-4" /> Delete
          </Button>
        </>
      )}
    </div>
  );

  return (
    <PermissionGate permission={HALL_PERMISSIONS.view}>
      {/* Sit in the dashboard layout so the app header and sidebar stay visible. */}
      <div className="flex h-full min-h-0 flex-col bg-background">
        <header className="flex shrink-0 items-center gap-1 border-b bg-card/95 px-2 py-2 backdrop-blur sm:gap-2 sm:px-3">
          {/* <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link href={routes.eventHallSetup(eventId)} aria-label={t("editHallLayout")}>
              <ArrowLeft className="size-4" />
            </Link>
          </Button> */}
          <h1 className="min-w-0 flex-1 truncate font-display text-base font-semibold sm:text-lg">
            {hall.name}
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={d.undo}
            disabled={!d.past.length}
            title="Undo"
          >
            <Undo2 className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={d.redo}
            disabled={!d.future.length}
            title="Redo"
            className="hidden sm:inline-flex"
          >
            <Redo2 className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => selected && void removeObjects([selected.id])}
            disabled={!selected}
            title="Remove"
            className="hidden md:inline-flex"
          >
            <Trash2 className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => zoomBy(1 / 1.25)}
            title="Zoom out"
            className="hidden sm:inline-flex"
          >
            <ZoomOut className="size-4" />
          </Button>
          <span className="hidden w-10 text-center text-xs tabular-nums sm:inline">
            {Math.round(d.zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => zoomBy(1.25)}
            title="Zoom in"
            className="hidden sm:inline-flex"
          >
            <ZoomIn className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={fitCanvas} title={t("fitToHall")}>
            <Maximize className="size-4" />
          </Button>
          {canUpdateHall ? (
            <Button
              className="ms-1 shrink-0 rounded-sm px-3 sm:ms-auto sm:px-5"
              onClick={() => void handleSave()}
              loading={saving}
              disabled={saving}
            >
              <Save className="size-4 sm:mr-1" />
              <span className="hidden sm:inline">Save{d.dirty ? " *" : ""}</span>
            </Button>
          ) : null}
        </header>

        <div className="flex min-h-0 flex-1">
          {/* Left objects library — desktop */}
          <aside className="hidden h-full w-[17.5rem] shrink-0 border-e bg-background lg:flex lg:w-72">
            <DesignerObjectsPanel
              templates={hall.tableTemplates}
              objects={d.objects}
              armed={armed}
              onPointerDown={startPointerDrag}
              className="w-full"
            />
          </aside>

          <main className="relative min-h-0 min-w-0 flex-1 bg-background">
            <div ref={canvasHostRef} className="relative h-full min-h-0 min-w-0">
              <HallCanvas
                boundary={hall.boundary}
                objects={d.objects}
                coordinateSystem={hall.layout.coordinateSystem}
                zoom={d.zoom}
                pan={d.pan}
                onViewChange={handleViewChange}
                showGrid={d.showGrid}
                gridSize={d.gridSize}
                snapToGrid={d.snapToGrid}
                selectedIds={d.selectedIds}
                onSelect={d.select}
                onLive={d.patchLive}
                onCommit={(id, patch) => {
                  const state = useDesigner.getState();
                  const current = state.objects.find((o) => o.id === id);
                  if (!current) return;
                  const next = { ...current, ...patch };
                  const validation = validatePlacement(next, state.objects, hall.boundary);
                  if (!validation.valid) {
                    toast.error(t("cannotDropHere"));
                    const prevObj = state.past[state.past.length - 1]?.find((o) => o.id === id);
                    if (prevObj) {
                      useDesigner.setState({
                        objects: state.objects.map((o) =>
                          o.id === id
                            ? {
                                ...o,
                                x: prevObj.x,
                                y: prevObj.y,
                                width: prevObj.width,
                                height: prevObj.height,
                                rotation: prevObj.rotation,
                              }
                            : o,
                        ),
                      });
                    }
                    return;
                  }
                  d.update(id, patch);
                }}
                drawing={d.drawing ? { mode: d.drawing.mode, points: d.drawing.points } : null}
                onDrawPoint={d.addDrawPoint}
                onFinishDrawing={d.finishDrawing}
                onCanvasTap={(p) => {
                  if (!armed) return;
                  const ok = tryPlaceItem(armed, p.x, p.y);
                  if (ok) setArmed(null);
                }}
              />

              {armed && !d.drawing && (
                <div className="pointer-events-none absolute top-3 left-1/2 z-10 max-w-[calc(100%-5.5rem)] -translate-x-1/2 rounded-full bg-primary px-4 py-1.5 text-center text-xs text-primary-foreground shadow">
                  Tap the hall to place {armed.label}
                </div>
              )}

              {/* Phone / tablet: zoom + object circles over the canvas */}
              <div className="absolute end-3 top-3 bottom-3 z-20 hidden max-lg:flex">
                <div className="flex max-h-full flex-col items-center gap-2 overflow-y-auto overscroll-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <Button
                    size="icon"
                    variant="outline"
                    className="size-10 shrink-0 rounded-full bg-card shadow-md"
                    onClick={() => zoomBy(1.25)}
                    aria-label="Zoom in"
                  >
                    <ZoomIn className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="size-10 shrink-0 rounded-full bg-card shadow-md"
                    onClick={() => zoomBy(1 / 1.25)}
                    aria-label="Zoom out"
                  >
                    <ZoomOut className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="size-10 shrink-0 rounded-full shadow-md"
                    onClick={() => setPropertiesOpen(true)}
                    disabled={!selected}
                    aria-label={t("properties")}
                  >
                    <Settings2 className="size-4" />
                  </Button>
                  <div className="h-px w-6 shrink-0 bg-border" aria-hidden />
                  <DesignerMobileIconTray
                    templates={hall.tableTemplates}
                    objects={d.objects}
                    armed={armed}
                    onPointerDown={startPointerDrag}
                  />
                </div>
              </div>

              <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center px-3 max-lg:pe-14">
                <div className="flex max-w-[min(95%,28rem)] flex-wrap items-center justify-center gap-2 rounded-full border bg-card/95 px-3 py-2 text-[11px] shadow-sm backdrop-blur sm:px-4 sm:text-xs">
                  <span className="inline-flex items-center gap-1">
                    <Users className="size-3.5 shrink-0 text-muted-foreground" />
                    <strong className="tabular-nums">{hall.expectedGuests}</strong>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Armchair className="size-3.5 shrink-0 text-muted-foreground" />
                    <strong className="tabular-nums">{capacity}</strong>
                  </span>
                  <Badge
                    variant={enough ? "default" : "destructive"}
                    className="inline-flex items-center gap-1 text-[10px] sm:text-xs"
                  >
                    {enough ? (
                      <Check className="size-3" strokeWidth={2.5} />
                    ) : (
                      <CircleAlert className="size-3" strokeWidth={2.5} />
                    )}
                    {enough ? t("capacityEnough") : t("capacityShortLabel")}
                  </Badge>
                </div>
              </div>
            </div>
          </main>

          {/* Desktop properties */}
          <aside className="hidden h-full w-64 shrink-0 overflow-y-auto border-s bg-card p-3 lg:block">
            <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              {t("properties")}
            </h2>
            <div className="mt-3">{propertiesPanel}</div>
          </aside>
        </div>

        {/* Phone / tablet properties */}
        <Sheet open={propertiesOpen} onOpenChange={setPropertiesOpen}>
          <SheetContent
            side="bottom"
            className="max-h-[75dvh] overflow-y-auto rounded-t-2xl lg:hidden"
          >
            <SheetHeader>
              <SheetTitle>{t("properties")}</SheetTitle>
            </SheetHeader>
            <div className="mt-4 pb-6">{propertiesPanel}</div>
          </SheetContent>
        </Sheet>
      </div>
    </PermissionGate>
  );
}
