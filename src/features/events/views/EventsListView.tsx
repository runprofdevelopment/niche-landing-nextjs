"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { EVENT_PERMISSIONS } from "@/constants/permissions";
import { usePermissions } from "@/hooks/usePermissions";
import { useTranslations } from "@/hooks/useTranslations";
import { PermissionGate } from "@/shared/components/auth/permission-gate";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";

import { CreateEventDialog } from "../components/dialogs";
import { EventsTable, type EventsTab } from "../components/tables";

type EventsListPageProps = {
  initialTab?: EventsTab;
};

export default function EventsListPage({ initialTab = "live" }: EventsListPageProps) {
  const t = useTranslations("events");
  const { can } = usePermissions();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<EventsTab>(initialTab);
  const [totalCount, setTotalCount] = useState(0);
  const canCreateEvent = can(EVENT_PERMISSIONS.create);

  return (
    <PermissionGate permission={EVENT_PERMISSIONS.view}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-semibold">{t("eventsTitle")}</h1>
            <Badge className="rounded-full bg-primary px-2.5 text-primary-foreground">
              {totalCount}
            </Badge>
          </div>

          {canCreateEvent ? (
            <Button type="button" onClick={() => setOpen(true)}>
              <Plus className="me-1 size-4" /> {t("addNewEvent")}
            </Button>
          ) : null}
        </div>

        {canCreateEvent ? <CreateEventDialog open={open} onOpenChange={setOpen} /> : null}

        <EventsTable tab={tab} onTabChange={setTab} onTotalCountChange={setTotalCount} />
      </div>
    </PermissionGate>
  );
}
