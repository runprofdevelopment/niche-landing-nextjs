import { EventsListPage } from "@/features/events";
import { getTranslations } from "@/providers/i18n/server";

import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const tNav = await getTranslations("navigation");
  const tEvents = await getTranslations("events");
  return { title: `${tNav("upcomingEvents")} — ${tEvents("eventsTitle")}` };
}

export default async function UpcomingEventsPage() {
  return <EventsListPage initialTab="upcoming" />;
}
