"use client";

import { GUEST_PERMISSIONS } from "@/constants/permissions";
import { routes } from "@/constants/routes";
import { useEventQuery } from "@/features/events/graphql";
import { useTranslations } from "@/hooks/useTranslations";
import { Link } from "@/providers/i18n";
import { PermissionGate } from "@/shared/components/auth/permission-gate";
import { Button } from "@/shared/components/ui/button";

import { EventSummaryHeader } from "../components/event-details/EventSummaryHeader";
import { GuestsTable } from "../components/tables/GuestsTable";

export default function GuestListApp({ eventId }: { eventId: string }) {
  const t = useTranslations("events");
  const { event, loading } = useEventQuery(eventId);

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
    <PermissionGate permission={GUEST_PERMISSIONS.view}>
      <div className="space-y-6">
        <EventSummaryHeader event={event} editHref={routes.event(eventId)} />
        <GuestsTable eventId={eventId} />
      </div>
    </PermissionGate>
  );
}
