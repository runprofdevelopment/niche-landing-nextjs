"use client";

import { useEffect, useMemo, useState } from "react";

import { EVENT_PERMISSIONS } from "@/constants/permissions";
import { routes } from "@/constants/routes";
import {
  useEventHallListQuery,
  useEventQuery,
  useEventTimelineListQuery,
} from "@/features/events/graphql";
import { usePermissions } from "@/hooks/usePermissions";
import { useTranslations } from "@/hooks/useTranslations";
import { useRouter, useSearchParams, Link } from "@/providers/i18n";
import { PermissionGate } from "@/shared/components/auth/permission-gate";
import { Button } from "@/shared/components/ui/button";

import { EditEventDialog } from "../components/dialogs";

import { EventModulesView } from "./EventModulesView";

import type { HallType } from "../types";
import type { EventModuleContext } from "../utils/event-modules";

type EventDetailsPageProps = {
  eventId: string;
};

export default function EventDetailsPage({ eventId }: EventDetailsPageProps) {
  const t = useTranslations("events");
  const { can } = usePermissions();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { event, setupProgress, stats, loading } = useEventQuery(eventId);
  const { halls: apiHalls } = useEventHallListQuery(eventId);
  const { slots: timeline } = useEventTimelineListQuery(eventId, {
    ...(event?.date ? { eventDate: event.date } : {}),
  });
  const canUpdateEvent = can(EVENT_PERMISSIONS.update);

  const resolveHallType = (eventType?: string): HallType =>
    eventType === "dining" ? "dining" : "wedding";

  const halls = useMemo(
    () =>
      apiHalls.map((hall) => ({
        ...hall,
        expectedGuests: event?.expectedGuests ?? hall.expectedGuests,
        hallType: resolveHallType(event?.eventType),
        ...(event?.eventType ? { eventType: event.eventType } : {}),
      })),
    [apiHalls, event?.eventType, event?.expectedGuests],
  );

  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    const firstHallId = halls[0]?.id;
    if (searchParams.get("setup") === "hallSetup" && firstHallId) {
      router.replace(routes.eventHallSetupById(eventId, firstHallId));
    }
  }, [eventId, halls, router, searchParams]);

  // Module cards use GraphQL `setupProgress` / `stats` when present.
  // Local guests/staff/invitation leftovers are empty — no Zustand mirror.
  const moduleContext: EventModuleContext = {
    eventId,
    halls,
    guests: [],
    timeline,
    eventStaff: [],
  };

  if (loading && !event) {
    return <p className="p-8 text-sm text-muted-foreground">{t("loadingEvent")}</p>;
  }

  if (!event) {
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
    <PermissionGate permission={EVENT_PERMISSIONS.view}>
      <EventModulesView
        event={event}
        context={moduleContext}
        {...(setupProgress ? { setupProgress } : {})}
        {...(stats ? { stats } : {})}
        {...(canUpdateEvent ? { onEdit: () => setEditOpen(true) } : {})}
      />
      {canUpdateEvent ? (
        <EditEventDialog event={event} open={editOpen} onOpenChange={setEditOpen} />
      ) : null}
    </PermissionGate>
  );
}
