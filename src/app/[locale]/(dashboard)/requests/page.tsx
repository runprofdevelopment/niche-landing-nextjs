import { RequestsListView } from "@/features/requests";
import { createPageMetadata } from "@/lib/metadata";
import { getTranslations } from "@/providers/i18n/server";

import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const tNav = await getTranslations("navigation");
  const tMeta = await getTranslations("meta");
  return createPageMetadata({
    title: tNav("requests"),
    description: tMeta("requestsDescription"),
  });
}

export default function RequestsPage() {
  return <RequestsListView />;
}
