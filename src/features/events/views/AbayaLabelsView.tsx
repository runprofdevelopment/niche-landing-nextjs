"use client";

import { useCallback } from "react";

import { EVENT_PERMISSIONS } from "@/constants/permissions";
import { routes } from "@/constants/routes";
import {
  useEventAbayaLabelMutations,
  useEventAbayaLabelSetFindQuery,
  useEventHallListQuery,
  useEventQuery,
} from "@/features/events/graphql";
import { usePermissions } from "@/hooks/usePermissions";
import { useTranslations } from "@/hooks/useTranslations";
import { Link } from "@/providers/i18n";
import { PermissionGate } from "@/shared/components/auth/permission-gate";
import { toast } from "@/shared/components/feedback/toast";
import { Button } from "@/shared/components/ui/button";

import { AbayaLabelsSection } from "../components/abaya-labels";
import { EventSummaryHeader } from "../components/event-details/EventSummaryHeader";
import { abayaLabelCount } from "../domain/abaya-labels";

import type { AbayaLabelConfig } from "../domain/abaya-labels";

export default function AbayaLabelsView({ eventId }: { eventId: string }) {
  const t = useTranslations("events");
  const { can } = usePermissions();
  const { event, loading: eventLoading } = useEventQuery(eventId);
  const { halls } = useEventHallListQuery(eventId);
  const canView = can(EVENT_PERMISSIONS.abayaView);
  const canGenerate = can(EVENT_PERMISSIONS.abayaGenerate);
  const {
    batch,
    loading: labelsLoading,
    refetch,
  } = useEventAbayaLabelSetFindQuery(eventId, {
    skip: !canView,
  });
  const { generateAbayaLabels, generating } = useEventAbayaLabelMutations();

  const handleGenerate = useCallback(
    async (config: AbayaLabelConfig) => {
      try {
        await generateAbayaLabels({
          eventId,
          prefix: config.prefix,
          suffix: config.suffix,
          from: config.from,
          to: config.to,
        });
        await refetch();
        toast.success(t("abayaLabelsGenerated", { count: abayaLabelCount(config) }));
      } catch {
        toast.error(t("abayaLabelsGenerateFailed"));
      }
    },
    [eventId, generateAbayaLabels, refetch, t],
  );

  if ((eventLoading || labelsLoading) && !event) {
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
        <p className="text-muted-foreground">{t("abayaLabelsNoPermission")}</p>
        <Button variant="outline" asChild>
          <Link href={routes.event(eventId)}>{t("backToEvent")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <PermissionGate permission={EVENT_PERMISSIONS.abayaView}>
      <div className="space-y-6">
        <EventSummaryHeader event={event} halls={halls} editHref={routes.event(eventId)} />
        <AbayaLabelsSection
          {...(batch ? { batch } : {})}
          onGenerate={handleGenerate}
          canManage={canGenerate}
          generating={generating}
        />
      </div>
    </PermissionGate>
  );
}
