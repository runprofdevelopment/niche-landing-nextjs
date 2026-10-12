import { TermsAndConditionsPage } from "@/features/landing";
import { JsonLd } from "@/features/landing/components/JsonLd";
import { getTermsAndConditions } from "@/features/landing/content/terms-and-conditions";
import { createLocaleMetadata } from "@/lib/metadata";
import { getLocale, getTranslations } from "@/providers/i18n/server";

import type { Locale } from "@/config/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  const resolved: Locale = locale === "ar" ? "ar" : "en";
  const terms = getTermsAndConditions(resolved);
  const t = await getTranslations("landing");

  return createLocaleMetadata({
    locale: resolved,
    title: terms.title,
    description: t("seo.termsDescription"),
    path: "/terms",
  });
}

export default async function TermsPage() {
  const locale = (await getLocale()) as Locale;
  const resolved: Locale = locale === "ar" ? "ar" : "en";

  return (
    <>
      <JsonLd locale={resolved} />
      <TermsAndConditionsPage locale={resolved} />
    </>
  );
}
