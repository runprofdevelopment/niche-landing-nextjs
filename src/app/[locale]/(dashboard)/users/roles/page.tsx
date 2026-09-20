import { RolesView } from "@/features/roles/views/roles-view";
import { createPageMetadata } from "@/lib/metadata";
import { getTranslations } from "@/providers/i18n/server";

import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const tNav = await getTranslations("navigation");
  const tMeta = await getTranslations("meta");
  return createPageMetadata({
    title: tNav("permissions"),
    description: tMeta("permissionsDescription"),
  });
}

export default function RolesPage() {
  return <RolesView />;
}
