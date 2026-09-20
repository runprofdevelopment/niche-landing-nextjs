import { RequestDetailsView } from "@/features/requests";
import { createPageMetadata } from "@/lib/metadata";
import { getTranslations } from "@/providers/i18n/server";

import type { Metadata } from "next";

type RequestDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("requests");
  return createPageMetadata({
    title: t("detailsTitle"),
  });
}

export default async function RequestDetailsPage({ params }: RequestDetailsPageProps) {
  const { id } = await params;
  return <RequestDetailsView requestId={id} />;
}
