"use client";

import { CalendarDays, Clock3, Heart, LayoutGrid, Tag, Users } from "lucide-react";

import { EVENT_PERMISSIONS, INVITATION_PERMISSIONS } from "@/constants/permissions";
import { useEventInvitationShareMutation } from "@/features/invitations/graphql";
import { usePermissions } from "@/hooks/usePermissions";
import { useTranslations } from "@/hooks/useTranslations";
import { Link } from "@/providers/i18n";
import { useErrorHandler } from "@/services/error-handling";
import { toast } from "@/shared/components/feedback/toast";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Spinner } from "@/shared/components/ui/spinner";

import type { EventRecord, EventStatus, Hall } from "../../types";
import type { LucideIcon } from "lucide-react";

type EventSummaryHeaderProps = {
  event: Pick<
    EventRecord,
    | "id"
    | "name"
    | "groomName"
    | "brideName"
    | "date"
    | "startTime"
    | "venueName"
    | "hallReference"
    | "eventType"
    | "expectedGuests"
    | "status"
  >;
  /** Optional hall names from GraphQL — not required; header uses `hallReference` from the event. */
  halls?: Pick<Hall, "name">[];
  /** Visual status chip next to the title — defaults to `event.status`. */
  status?: EventStatus;
  /** Edit opens a dialog, or navigates via link */
  onEdit?: () => void;
  editHref?: string;
};

function statusLabelKey(status: EventStatus): "statusUpcoming" | "statusLive" | "statusCompleted" {
  if (status === "live") return "statusLive";
  if (status === "completed") return "statusCompleted";
  return "statusUpcoming";
}

function MetaChip({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
      <Icon className="size-4 shrink-0 text-primary" aria-hidden />
      <span>
        {label}: <strong className="font-medium text-foreground">{value}</strong>
      </span>
    </span>
  );
}

export function EventSummaryHeader({
  event,
  halls = [],
  status,
  onEdit,
  editHref,
}: EventSummaryHeaderProps) {
  const t = useTranslations("events");
  const { can } = usePermissions();
  const { handleError } = useErrorHandler();
  const { shareEventInvitation, sharing } = useEventInvitationShareMutation();
  const canUpdateEvent = can(EVENT_PERMISSIONS.update);
  const canShareInvitation = can(INVITATION_PERMISSIONS.share);
  const couple = [event.groomName, event.brideName].filter(Boolean).join(" & ") || t("emptyValue");
  const hallRef =
    event.hallReference?.trim() ||
    event.venueName?.trim() ||
    (halls.length > 0 ? halls.map((hall) => hall.name).join(", ") : "") ||
    t("emptyValue");
  const eventTypeLabel = event.eventType?.trim() || t("emptyValue");
  const resolvedStatus = status ?? event.status;
  const statusLabel = t(statusLabelKey(resolvedStatus));

  const editButton =
    canUpdateEvent && onEdit ? (
      <Button variant="outline" onClick={onEdit}>
        {t("editEvent")}
      </Button>
    ) : canUpdateEvent && editHref ? (
      <Button variant="outline-invert" asChild>
        <Link href={editHref}>{t("editEvent")}</Link>
      </Button>
    ) : null;

  async function handleShareInvitation() {
    if (!canShareInvitation || sharing) return;
    try {
      await shareEventInvitation(event.id);
      toast.success(t("invitationShared"));
    } catch (error) {
      handleError(error, {
        context: {
          feature: "invitations",
          action: "EventInvitationShare",
          extra: { eventId: event.id },
        },
        channels: ["toast"],
      });
    }
  }

  return (
    <Card className="border-border/60 bg-card shadow-sm">
      <CardContent className="space-y-5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-3xl font-semibold">{event.name}</h1>
              <Badge
                variant="secondary"
                className={
                  resolvedStatus === "live"
                    ? "bg-active text-active-foreground"
                    : resolvedStatus === "completed"
                      ? "bg-gray-bg text-gray"
                      : "bg-pending/20 text-pending-foreground"
                }
              >
                {statusLabel}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <MetaChip icon={Heart} label={t("detailCouple")} value={couple} />
              <MetaChip icon={CalendarDays} label={t("columnDate")} value={event.date} />
              <MetaChip icon={Clock3} label={t("columnTime")} value={event.startTime} />
              <MetaChip icon={LayoutGrid} label={t("hallReference")} value={hallRef} />
              <MetaChip icon={Tag} label={t("eventType")} value={eventTypeLabel} />
              <MetaChip icon={Users} label={t("columnGuests")} value={event.expectedGuests} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {editButton}
            {canShareInvitation ? (
              <Button disabled={sharing} onClick={() => void handleShareInvitation()}>
                {sharing ? <Spinner size="sm" className="me-1" /> : null}
                {t("shareInvitation")}
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
