import { RegistrationUserDetailsView } from "@/features/registration-users";
import { createPageMetadata } from "@/lib/metadata";
import { getTranslations } from "@/providers/i18n/server";

import type { Metadata } from "next";

type RegistrationUserDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("registrationUsers");
  const tMeta = await getTranslations("meta");

  return createPageMetadata({
    title: t("detailsTitle"),
    description: tMeta("registerUsersDescription"),
  });
}

export default async function RegistrationUserDetailsPage({
  params,
}: RegistrationUserDetailsPageProps) {
  const { id } = await params;

  return <RegistrationUserDetailsView userId={id} />;
}
