import { createPageMetadata } from "@/lib/metadata";
import { getTranslations } from "@/providers/i18n/server";

import type meta from "@/locales/en/meta";
import type { Metadata } from "next";

type EventMetaKey = Extract<
  keyof typeof meta,
  | "eventsDescription"
  | "eventDetailsDescription"
  | "eventTimelineDescription"
  | "eventTablesDescription"
  | "eventStaffDescription"
  | "eventAbayaLabelsDescription"
  | "hallDesignerDescription"
  | "seatingAssignmentDescription"
  | "guestListDescription"
  | "invitationDesignerDescription"
>;

export async function createEventPageMetadata(
  title: string,
  descriptionKey: EventMetaKey,
): Promise<Metadata> {
  const tMeta = await getTranslations("meta");

  return createPageMetadata({
    title,
    description: tMeta(descriptionKey),
  });
}
