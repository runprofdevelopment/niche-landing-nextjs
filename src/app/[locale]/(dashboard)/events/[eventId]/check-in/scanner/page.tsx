import { EventPageShell, CheckInScannerApp } from "@/features/events";
import { createEventPageMetadata } from "@/features/events/lib/event-metadata";
import { getTranslations } from "@/providers/i18n/server";

import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ eventId: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("events");
  return createEventPageMetadata(t("qrCodeScanner"), "guestListDescription");
}

export default async function Page({ params }: PageProps) {
  const { eventId } = await params;

  return (
    <EventPageShell>
      <CheckInScannerApp eventId={eventId} />
    </EventPageShell>
  );
}
