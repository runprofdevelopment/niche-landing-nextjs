import { EventsListPage } from "@/features/events";
import { createEventPageMetadata } from "@/features/events/lib/event-metadata";
import { getTranslations } from "@/providers/i18n/server";

import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("events");
  return createEventPageMetadata(t("eventsTitle"), "eventsDescription");
}

export default function EventsPage() {
  return <EventsListPage />;
}
