"use client";

import { use, useEffect, useMemo } from "react";

import { routes } from "@/constants/routes";
import { useAppStore } from "@/features/events/store/events.store";
import { useRouter } from "@/providers/i18n";

type Kind = "designer" | "setup" | "seating";

export function LegacyHallRedirect({
  params,
  kind,
}: {
  params: Promise<{ eventId: string }>;
  kind: Kind;
}) {
  const { eventId } = use(params);
  const router = useRouter();
  const allHalls = useAppStore((state) => state.halls);
  const halls = useMemo(
    () => allHalls.filter((hall) => hall.eventId === eventId),
    [allHalls, eventId],
  );

  useEffect(() => {
    const first = halls[0];
    if (!first) {
      router.replace(routes.event(eventId));
      return;
    }
    if (kind === "designer") router.replace(routes.eventDesignerById(eventId, first.id));
    else if (kind === "setup") router.replace(routes.eventHallSetupById(eventId, first.id));
    else router.replace(routes.eventSeatingById(eventId, first.id));
  }, [eventId, halls, kind, router]);

  return <p className="p-6 text-sm text-muted-foreground">Redirecting…</p>;
}
