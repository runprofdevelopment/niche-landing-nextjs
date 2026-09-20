import { RegistrationUsersView } from "@/features/registration-users";
import { createPageMetadata } from "@/lib/metadata";
import { getTranslations } from "@/providers/i18n/server";

import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const tNav = await getTranslations("navigation");
  const tMeta = await getTranslations("meta");

  return createPageMetadata({
    title: tNav("registerUsers"),
    description: tMeta("registerUsersDescription"),
  });
}

export default function RegistrationUsersPage() {
  return <RegistrationUsersView />;
}
