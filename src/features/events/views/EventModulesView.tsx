"use client";

import {
  Armchair,
  CalendarClock,
  CheckCircle2,
  Clock3,
  LayoutGrid,
  Mail,
  Plus,
  Shirt,
  Table2,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";

import {
  EVENT_PERMISSIONS,
  GUEST_PERMISSIONS,
  HALL_PERMISSIONS,
  INVITATION_PERMISSIONS,
  SEATING_PERMISSIONS,
  type PermissionKey,
} from "@/constants/permissions";
import { routes } from "@/constants/routes";
import { usePermissions } from "@/hooks/usePermissions";
import { useTranslations } from "@/hooks/useTranslations";
import { Link } from "@/providers/i18n";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import { Separator } from "@/shared/components/ui/separator";

import { EventSummaryHeader } from "../components/event-details/EventSummaryHeader";
import { EVENT_MODULES, fetchEventModules, getModuleStatus } from "../utils/event-modules";

import type { EventStats } from "../graphql/mappers/event.mapper";
import type { EventRecord, Hall } from "../types";
import type {
  EventModuleContext,
  EventModuleDefinition,
  EventModuleId,
  EventModuleStatus,
  EventModulesApiResponse,
} from "../utils/event-modules";

const MODULE_ICONS: Record<EventModuleId, LucideIcon> = {
  hallSetup: LayoutGrid,
  eventTables: Table2,
  guestList: Users,
  seatMapping: Armchair,
  invitations: Mail,
  eventTimeline: CalendarClock,
  checkInSystem: CheckCircle2,
  abayaLabels: Shirt,
  eventsStaff: UserCog,
};

const MODULE_VIEW_PERMISSION: Partial<Record<EventModuleId, PermissionKey>> = {
  hallSetup: HALL_PERMISSIONS.view,
  eventTables: EVENT_PERMISSIONS.tablesView,
  guestList: GUEST_PERMISSIONS.view,
  seatMapping: SEATING_PERMISSIONS.view,
  invitations: INVITATION_PERMISSIONS.view,
  checkInSystem: EVENT_PERMISSIONS.checkInView,
  eventsStaff: EVENT_PERMISSIONS.staffView,
  abayaLabels: EVENT_PERMISSIONS.abayaView,
  eventTimeline: EVENT_PERMISSIONS.timelineView,
};

function getModuleRoutes(moduleId: EventModuleId, eventId: string) {
  switch (moduleId) {
    case "guestList":
      return {
        view: routes.eventGuests(eventId),
        setup: routes.eventGuests(eventId),
      };
    case "eventTables":
      return {
        view: routes.eventTables(eventId),
        setup: routes.eventTables(eventId),
      };
    case "eventsStaff":
      return {
        view: routes.eventStaff(eventId),
        setup: routes.eventStaff(eventId),
      };
    case "abayaLabels":
      return {
        view: routes.eventAbayaLabels(eventId),
        setup: routes.eventAbayaLabels(eventId),
      };
    case "checkInSystem":
      return {
        view: routes.eventCheckIn(eventId),
        setup: routes.eventCheckIn(eventId),
      };
    case "invitations":
      return {
        view: routes.eventInvitation(eventId),
        setup: routes.eventInvitation(eventId),
      };
    case "eventTimeline":
      return {
        view: routes.eventTimeline(eventId),
        setup: routes.eventTimeline(eventId),
      };
    case "hallSetup":
    case "seatMapping":
    default:
      return {
        view: routes.event(eventId),
        setup: routes.event(eventId),
      };
  }
}

function HallTypeBadge({ hall }: { hall: Hall }) {
  const t = useTranslations("events");
  return (
    <Badge variant="secondary" className="text-xs">
      {hall.hallType === "wedding" ? t("hallTypeWedding") : t("hallTypeDining")}
    </Badge>
  );
}

function HallSetupModuleActions({ context }: { context: EventModuleContext }) {
  const t = useTranslations("events");
  const { can } = usePermissions();
  const canViewHall = can(HALL_PERMISSIONS.view);
  const canCreateHall = can(HALL_PERMISSIONS.create);

  return (
    <div className="space-y-3">
      {context.halls.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("noHallsYet")}</p>
      ) : (
        <ul className="space-y-2">
          {context.halls.map((hall) => (
            <li
              key={hall.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2"
            >
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <span className="truncate text-sm font-medium">{hall.name}</span>
                <HallTypeBadge hall={hall} />
              </div>
              {canViewHall ? (
                <div className="flex flex-wrap gap-1.5">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={routes.eventHallSetupById(context.eventId, hall.id)}>
                      {t("editHallLayout")}
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={routes.eventDesignerById(context.eventId, hall.id)}>
                      {t("openDesigner")}
                    </Link>
                  </Button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
      {/* One hall per event: hide create when a hall already exists. */}
      {canCreateHall && context.halls.length === 0 ? (
        <Button size="sm" className="w-full sm:w-auto" asChild>
          <Link href={routes.eventHallCreate(context.eventId)}>
            <Plus className="mr-1 size-4" />
            {t("addHall")}
          </Link>
        </Button>
      ) : null}
    </div>
  );
}

function SeatMappingModuleActions({ context }: { context: EventModuleContext }) {
  const t = useTranslations("events");
  const { can } = usePermissions();
  const canViewSeating = can(SEATING_PERMISSIONS.view);
  const locked = context.halls.length === 0;

  if (locked) {
    return <p className="text-sm text-muted-foreground">{t("seatMappingRequirement")}</p>;
  }

  if (!canViewSeating) return null;

  return (
    <ul className="space-y-2">
      {context.halls.map((hall) => (
        <li
          key={hall.id}
          className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2"
        >
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="truncate text-sm font-medium">{hall.name}</span>
            <HallTypeBadge hall={hall} />
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={routes.eventSeatingById(context.eventId, hall.id)}>{t("seating")}</Link>
          </Button>
        </li>
      ))}
    </ul>
  );
}

type EventModuleCardProps = {
  module: EventModuleDefinition;
  context: EventModuleContext;
  status: EventModuleStatus;
  lastUpdated?: string;
};

function EventModuleCard({ module, context, status, lastUpdated }: EventModuleCardProps) {
  const t = useTranslations("events");
  const { can } = usePermissions();
  const Icon = MODULE_ICONS[module.id];
  const complete = status === "done";
  const locked = status === "locked";
  const routesForModule = getModuleRoutes(module.id, context.eventId);
  const requirement = module.requirementKey ? t(module.requirementKey) : undefined;
  const isHallModule = module.id === "hallSetup";
  const isSeatModule = module.id === "seatMapping";
  const isTablesModule = module.id === "eventTables";
  const viewPermission = MODULE_VIEW_PERMISSION[module.id];
  const canOpenModule = viewPermission ? can(viewPermission) : true;

  if (!canOpenModule) return null;

  return (
    <Card className="flex h-full flex-col border-border/60 bg-card shadow-sm">
      <CardContent className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Icon className="size-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-medium">{t(module.titleKey)}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t(module.descriptionKey)}</p>
            </div>
          </div>
          <Badge
            variant="secondary"
            className={
              complete
                ? "shrink-0 bg-active text-active-foreground"
                : "shrink-0 bg-pending/20 text-pending-foreground"
            }
          >
            {complete ? t("moduleCompleted") : t("modulePending")}
          </Badge>
        </div>

        <Separator className="my-4" />

        <div className="mt-auto flex flex-1 flex-col justify-end">
          {isHallModule ? <HallSetupModuleActions context={context} /> : null}

          {isSeatModule ? <SeatMappingModuleActions context={context} /> : null}

          {isTablesModule ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {complete
                  ? t("moduleLastUpdated", { time: lastUpdated ?? t("moduleRecently") })
                  : (requirement ?? t("moduleSetupRequired"))}
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href={routesForModule.view}>{t("viewDetails")}</Link>
              </Button>
            </div>
          ) : null}

          {!isHallModule && !isSeatModule && !isTablesModule ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {complete
                  ? t("moduleLastUpdated", { time: lastUpdated ?? t("moduleRecently") })
                  : (requirement ?? t("moduleSetupRequired"))}
              </p>
              {complete ? (
                <Button variant="outline" size="sm" asChild>
                  <Link href={routesForModule.view}>{t("viewDetails")}</Link>
                </Button>
              ) : (
                <Button size="sm" asChild disabled={locked}>
                  <Link href={routesForModule.setup}>{t("setupNow")}</Link>
                </Button>
              )}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

type EventModulesViewProps = {
  event: EventRecord;
  context: EventModuleContext;
  setupProgress?: EventModulesApiResponse;
  stats?: EventStats;
  onEdit?: () => void;
};

export function EventModulesView({
  event,
  context,
  setupProgress,
  stats,
  onEdit,
}: EventModulesViewProps) {
  const t = useTranslations("events");
  /** Prefer backend progress; fall back to local mock until the API field is present. */
  const modulesApi = setupProgress ?? fetchEventModules(context);
  const progress = modulesApi.progress;

  const statsCards = [
    {
      label: t("statExpectedGuests"),
      value: (stats?.expected.count ?? event.expectedGuests).toLocaleString(),
      trend: stats?.expected.percent ?? "0%",
      icon: Users,
    },
    {
      label: t("statInvitationsSent"),
      value: (stats?.invitationsSent.count ?? event.invitationCount).toLocaleString(),
      trend: stats?.invitationsSent.percent ?? "0%",
      icon: Mail,
    },
    {
      label: t("statRsvpsConfirmed"),
      value: (stats?.rsvpsConfirmed.count ?? context.guests.length).toLocaleString(),
      trend: stats?.rsvpsConfirmed.percent ?? "0%",
      icon: CheckCircle2,
    },
    {
      label: t("statCheckedIn"),
      value: (
        stats?.checkedIn.count ??
        context.guests.filter((guest) => Boolean(guest.checkedInAt)).length
      ).toLocaleString(),
      trend: stats?.checkedIn.percent ?? "0%",
      icon: Clock3,
    },
  ];

  return (
    <div className="space-y-6">
      <EventSummaryHeader event={event} halls={context.halls} {...(onEdit ? { onEdit } : {})} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statsCards.map(({ label, value, trend, icon: Icon }) => (
          <Card key={label} className="border-border/60 bg-card shadow-sm">
            <CardContent className="flex items-start justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-2 font-display text-3xl font-semibold">{value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{trend}</p>
              </div>
              <div className="rounded-full bg-primary p-3 text-primary-foreground">
                <Icon className="size-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/60 bg-card shadow-sm">
        <CardContent className="space-y-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-medium">{t("eventSetupProgress")}</h2>
              <p className="text-sm text-muted-foreground">
                {t("eventSetupProgressSummary", {
                  completed: progress.completed,
                  total: progress.total,
                })}
              </p>
            </div>
            <span className="text-sm font-medium">{progress.percent}%</span>
          </div>
          <Progress value={progress.percent} className="h-2" />
        </CardContent>
      </Card>

      <div className="grid auto-rows-fr items-stretch gap-4 lg:grid-cols-2">
        {EVENT_MODULES.map((module) => (
          <EventModuleCard
            key={module.id}
            module={module}
            context={context}
            status={getModuleStatus(modulesApi, module.id)}
            lastUpdated={t("moduleRecently")}
          />
        ))}
      </div>
    </div>
  );
}
