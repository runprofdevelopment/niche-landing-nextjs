"use client";

import { EVENT_PERMISSIONS } from "@/constants/permissions";
import { routes } from "@/constants/routes";
import { useEventHallListQuery, useEventQuery } from "@/features/events/graphql";
import { usePermissions } from "@/hooks/usePermissions";
import { useTranslations } from "@/hooks/useTranslations";
import { Link } from "@/providers/i18n";
import { PermissionGate } from "@/shared/components/auth/permission-gate";
import { Button } from "@/shared/components/ui/button";

import { EventSummaryHeader } from "../components/event-details/EventSummaryHeader";
import { EventStaffSection } from "../components/tables";

export default function EventStaffView({ eventId }: { eventId: string }) {
  const t = useTranslations("events");
  const { can } = usePermissions();
  const { event, loading } = useEventQuery(eventId);
  const { halls } = useEventHallListQuery(eventId);
  const canView = can(EVENT_PERMISSIONS.staffView);

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

  if (!canView) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-muted-foreground">{t("eventStaffNoPermission")}</p>
        <Button variant="outline" asChild>
          <Link href={routes.event(eventId)}>{t("backToEvent")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <PermissionGate permission={EVENT_PERMISSIONS.staffView}>
      <div className="space-y-6">
        <EventSummaryHeader event={event} halls={halls} editHref={routes.event(eventId)} />
        <EventStaffSection eventId={eventId} />
      </div>
    </PermissionGate>
  );
}
