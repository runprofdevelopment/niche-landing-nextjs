"use client";

import { ArrowLeft } from "lucide-react";

import { EVENT_PERMISSIONS } from "@/constants/permissions";
import { routes } from "@/constants/routes";
import { useEventQuery } from "@/features/events/graphql";
import { useTranslations } from "@/hooks/useTranslations";
import { Link } from "@/providers/i18n";
import { PermissionGate } from "@/shared/components/auth/permission-gate";
import { Button } from "@/shared/components/ui/button";

import { CheckInScannerSection } from "../components/check-in/CheckInScannerSection";

export default function CheckInScannerView({ eventId }: { eventId: string }) {
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
    <PermissionGate permission={EVENT_PERMISSIONS.checkInView}>
      <div className="mx-auto max-w-6xl space-y-6">
        <Button variant="ghost" size="sm" asChild className="-ms-2 w-fit">
          <Link href={routes.eventCheckIn(eventId)}>
            <ArrowLeft className="me-1 size-4" />
            {t("backToCheckIn")}
          </Link>
        </Button>

        <CheckInScannerSection eventId={eventId} />
      </div>
    </PermissionGate>
  );
}
