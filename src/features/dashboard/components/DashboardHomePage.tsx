"use client";

import { CalendarDays, Clock3, Plus, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { DASHBOARD_PERMISSIONS, EVENT_PERMISSIONS } from "@/constants/permissions";
import { DashboardCalendar } from "@/features/dashboard/components/DashboardCalendar";
import { CreateEventDialog } from "@/features/events/components/dialogs/CreateEventDialog";
import { EventsTable } from "@/features/events/components/tables/EventsTable";
import { useEventListQuery } from "@/features/events/graphql/hooks/use-event-list";
import { usePermissions } from "@/hooks/usePermissions";
import { useTranslations } from "@/hooks/useTranslations";
import { PermissionGate } from "@/shared/components/auth/permission-gate";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

const CHART_DATA = [
  { day: "mon", value: 3 },
  { day: "tue", value: 5 },
  { day: "wed", value: 2 },
  { day: "thu", value: 7 },
  { day: "fri", value: 4 },
  { day: "sat", value: 8 },
  { day: "sun", value: 6 },
];

const LIVE_FILTERS = { status: "live" as const };

export function DashboardHomePage() {
  const t = useTranslations("dashboard");
  const { can } = usePermissions();
  const [createOpen, setCreateOpen] = useState(false);
  const canCreateEvent = can(EVENT_PERMISSIONS.create);
  const canViewEvents = can(EVENT_PERMISSIONS.view);

  // Live events for calendar + KPI cards (recent table uses its own server query).
  const { events: liveEvents, totalCount: liveTotalCount } = useEventListQuery({
    filters: LIVE_FILTERS,
    pagination: { page: 1, limit: 50 },
    skip: !canViewEvents,
  });

  const dayLabels: Record<string, string> = {
    mon: t("mon"),
    tue: t("tue"),
    wed: t("wed"),
    thu: t("thu"),
    fri: t("fri"),
    sat: t("sat"),
    sun: t("sun"),
  };

  const chartData = CHART_DATA.map((entry) => ({
    ...entry,
    label: dayLabels[entry.day],
  }));

  const stats = useMemo(() => {
    const totalGuests = liveEvents.reduce((sum, event) => sum + event.expectedGuests, 0);
    return {
      // Live events only until dashboard overview KPIs are wired.
      totalEvents: liveTotalCount.toLocaleString(),
      upcomingEvents: "0",
      totalGuests: totalGuests.toLocaleString(),
    };
  }, [liveEvents, liveTotalCount]);

  return (
    <PermissionGate permission={DASHBOARD_PERMISSIONS.view}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold">
              {t("welcomeBack", { name: "Ahmed" })}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("welcomeSubtitle")}</p>
          </div>
          {canCreateEvent ? (
            <Button type="button" onClick={() => setCreateOpen(true)}>
              <Plus className="me-1 size-4" />
              {t("createNewEvent")}
            </Button>
          ) : null}
        </div>

        {canCreateEvent && createOpen ? (
          <CreateEventDialog open={createOpen} onOpenChange={setCreateOpen} />
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: t("totalEvents"), value: stats.totalEvents, icon: CalendarDays },
            { label: t("upcomingEvents"), value: stats.upcomingEvents, icon: Clock3 },
            { label: t("totalGuests"), value: stats.totalGuests, icon: Users },
          ].map(({ label, value, icon: Icon }) => (
            <Card key={label} className="border-border/60 bg-card shadow-sm">
              <CardContent className="w-full p-5">
                <div className="flex w-full items-center justify-between gap-2">
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <div className="rounded-xl bg-primary p-3 text-primary-foreground">
                    <Icon className="size-5" />
                  </div>
                </div>
                <p className="mt-1 font-display text-3xl font-semibold">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <Card className="border-border/60 bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-medium">{t("eventsChartTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barSize={28}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} width={28} />
                  <Tooltip cursor={{ fill: "var(--muted)" }} />
                  <Bar dataKey="value" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <DashboardCalendar events={liveEvents} />
        </div>

        {canViewEvents ? (
          <Card className="border-border/60 bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-medium">{t("recentEvents")}</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Omit `events` → server `eventList` with status=live */}
              <EventsTable statuses={["live"]} showTabs={false} />
            </CardContent>
          </Card>
        ) : null}
      </div>
    </PermissionGate>
  );
}
