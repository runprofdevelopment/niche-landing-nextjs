"use client";

import { ArrowLeft } from "lucide-react";
import { useMemo } from "react";

import { HALL_PERMISSIONS } from "@/constants/permissions";
import { routes } from "@/constants/routes";
import {
  useEventHallFindQuery,
  useEventHallMutations,
  useEventHallObjectListQuery,
  useEventQuery,
} from "@/features/events/graphql";
import { usePermissions } from "@/hooks/usePermissions";
import { useTranslations } from "@/hooks/useTranslations";
import { Link, useRouter } from "@/providers/i18n";
import { useErrorHandler } from "@/services/error-handling";
import { PermissionGate } from "@/shared/components/auth/permission-gate";
import { toast } from "@/shared/components/feedback/toast";
import { Button } from "@/shared/components/ui/button";

import { HallSetupLayoutSection } from "../components/halls/HallSetupLayoutSection";
import { HallSetupStatsBar } from "../components/halls/HallSetupStatsBar";
import { HallSetupTableSection } from "../components/halls/HallSetupTableSection";
import { TablePreviewCard } from "../components/halls/TablePreviewCard";
import { applyPlacedObjectCountsToTemplates } from "../domain/table-templates";
import { useHallSetupForm } from "../hooks/use-hall-setup-form";
import { useAppStore } from "../store/events.store";

import type { BoundaryShape, Hall, HallObject } from "../types";

type HallSetupPageProps = {
  eventId: string;
  /** Omit for create flow (`/halls/new`). */
  hallId?: string;
};

type HallSetupFormPanelProps = {
  eventId: string;
  eventExpectedGuests: number;
  capacityFromEvent: number;
  hall?: Hall | undefined;
  placedObjects: HallObject[];
  isCreate: boolean;
  canSaveHall: boolean;
};

function HallSetupFormPanel({
  eventId,
  eventExpectedGuests,
  capacityFromEvent,
  hall,
  placedObjects,
  isCreate,
  canSaveHall,
}: HallSetupFormPanelProps) {
  const t = useTranslations("events");
  const router = useRouter();
  const { handleError } = useErrorHandler();
  const upsertHall = useAppStore((state) => state.upsertHall);
  const { createHall, updateHall, creating, updating } = useEventHallMutations();

  const hallForForm = useMemo(() => {
    if (!hall) return undefined;
    if (placedObjects.length === 0) return hall;
    return {
      ...hall,
      tableTemplates: applyPlacedObjectCountsToTemplates(hall.tableTemplates, placedObjects),
    };
  }, [hall, placedObjects]);

  const form = useHallSetupForm({
    hall: hallForForm,
    defaultCapacityLimit: capacityFromEvent,
  });

  const handleShapeChange = (nextShape: BoundaryShape) => {
    form.setShape(nextShape);
    if (nextShape === "square") {
      form.setHeightMeters(form.widthMeters);
    }
  };

  const handleWidthChange = (value: number) => {
    form.setWidthMeters(value);
    if (form.shape === "square") form.setHeightMeters(value);
  };

  const handleSave = async () => {
    const boundary = form.buildBoundary();
    if (!boundary) {
      toast.error(t("polygonMinPoints"));
      return;
    }

    const name = form.hallName.trim() || t("mainHall");
    const tableTemplates = form.templates;

    try {
      if (isCreate) {
        const created = await createHall({
          eventId,
          name,
          boundary,
          tableTemplates,
        });
        toast.success(t("hallCreated", { name: created.name }));
        router.push(routes.eventDesignerById(eventId, created.id));
        return;
      }

      if (!hall) return;

      await updateHall(hall.id, {
        name,
        boundary,
        tableTemplates,
      });
      upsertHall({
        ...hall,
        name,
        expectedGuests: eventExpectedGuests,
        boundary,
        tableTemplates,
      });
      toast.success(t("hallConfigurationSaved"));
      router.push(routes.eventDesignerById(eventId, hall.id));
    } catch (error) {
      handleError(error, {
        context: {
          feature: "events",
          action: isCreate ? "eventHallCreate" : "eventHallUpdate",
        },
      });
    }
  };

  const previewRows = form.tableRows.filter((row) => row.quantity > 0);
  const saving = creating || updating;

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Button variant="ghost" size="sm" asChild className="-ms-2 w-fit">
            <Link href={routes.event(eventId)}>
              <ArrowLeft className="me-1 size-4" />
              {t("backToEvent")}
            </Link>
          </Button>
          <div>
            <h1 className="font-display text-3xl font-semibold">{t("configureNewVenue")}</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {t("configureNewVenueDescription")}
            </p>
          </div>
        </div>
        {canSaveHall ? (
          <Button
            size="lg"
            className="w-full shrink-0 sm:w-auto"
            onClick={handleSave}
            disabled={!form.canSave || saving}
            loading={saving}
          >
            {t("saveConfiguration")}
          </Button>
        ) : null}
      </div>

      <HallSetupStatsBar
        hallCapacity={capacityFromEvent}
        expectedGuests={eventExpectedGuests}
        tableCount={form.totalTables}
        remainingCapacity={Math.max(0, capacityFromEvent - form.totalSeats)}
      />

      <HallSetupLayoutSection
        shape={form.shape}
        onShapeChange={handleShapeChange}
        widthMeters={form.widthMeters}
        heightMeters={form.heightMeters}
        radiusMeters={form.radiusMeters}
        onWidthChange={handleWidthChange}
        onHeightChange={form.setHeightMeters}
        onRadiusChange={form.setRadiusMeters}
        polygonPoints={form.polygonPoints}
        polygonClosed={form.polygonClosed}
        onAddPoint={form.addPolygonPoint}
        onUndo={form.undoPolygon}
        onRedo={form.redoPolygon}
        onClear={form.clearPolygon}
        onConfirmShape={form.confirmPolygon}
        canUndo={form.canUndo}
        canRedo={form.canRedo}
      />

      <HallSetupTableSection
        rows={form.tableRows}
        lockNaming={!isCreate}
        onAdd={form.addTableRow}
        onUpdate={form.updateTableRow}
        onRemove={form.removeTableRow}
      />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">{t("tablePreviewLayout")}</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {previewRows.length > 0 ? (
            previewRows.map((row) => (
              <TablePreviewCard
                key={row.id}
                shape={row.shape}
                capacity={row.capacity}
                quantity={row.quantity}
              />
            ))
          ) : (
            <p className="text-sm text-muted-foreground">{t("noTablesConfigured")}</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default function HallSetupPage({ eventId, hallId }: HallSetupPageProps) {
  const t = useTranslations("events");
  const { can } = usePermissions();
  const isCreate = !hallId;
  const canSaveHall = isCreate ? can(HALL_PERMISSIONS.create) : can(HALL_PERMISSIONS.update);
  const { event, loading: eventLoading } = useEventQuery(eventId);
  const { hall: apiHall, loading: hallLoading } = useEventHallFindQuery(hallId ?? "", {
    ...(event?.expectedGuests != null ? { expectedGuests: event.expectedGuests } : {}),
  });
  const storeHall = useAppStore((state) => state.getHall(hallId ?? ""));
  const {
    objects: placedObjects,
    ready: objectsReady,
    loading: objectsLoading,
  } = useEventHallObjectListQuery(eventId, hallId ?? "");

  const hall = isCreate ? undefined : (apiHall ?? storeHall);
  const capacityFromEvent = event?.hallCapacity ?? event?.expectedGuests ?? 500;

  const waitingForHall = !isCreate && hallLoading && !hall;
  const waitingForObjects = !isCreate && !objectsReady && objectsLoading;

  if ((eventLoading && !event) || waitingForHall || waitingForObjects) {
    return <p className="p-8 text-sm text-muted-foreground">{t("loadingEvent")}</p>;
  }

  if (!event || (!isCreate && !hall)) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-muted-foreground">{t("eventNotFound")}</p>
        <Button variant="outline" asChild>
          <Link href={routes.events}>{t("backToEvents")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <PermissionGate permission={isCreate ? HALL_PERMISSIONS.create : HALL_PERMISSIONS.view}>
      <HallSetupFormPanel
        key={hall?.id ?? "new"}
        eventId={eventId}
        eventExpectedGuests={event.expectedGuests}
        capacityFromEvent={capacityFromEvent}
        hall={hall}
        placedObjects={isCreate ? [] : placedObjects}
        isCreate={isCreate}
        canSaveHall={canSaveHall}
      />
    </PermissionGate>
  );
}
