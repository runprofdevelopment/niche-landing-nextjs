import { MaintenancePage } from "@/features/landing";
import { createLocaleMetadata } from "@/lib/metadata";
import { getLocale, getTranslations } from "@/providers/i18n/server";

import type { Locale } from "@/config/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  const resolved: Locale = locale === "ar" ? "ar" : "en";
  const t = await getTranslations("landing");

  return createLocaleMetadata({
    locale: resolved,
    title: t("seo.title"),
    description: t("seo.description"),
    path: "/",
  });
}

export default async function HomePage() {
  return <MaintenancePage />;
}
