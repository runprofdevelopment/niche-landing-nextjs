import { PrivacyPolicyPage } from "@/features/landing";
import { JsonLd } from "@/features/landing/components/JsonLd";
import { getPrivacyPolicy } from "@/features/landing/content/privacy-policy";
import { createLocaleMetadata } from "@/lib/metadata";
import { getLocale, getTranslations } from "@/providers/i18n/server";

import type { Locale } from "@/config/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  const resolved: Locale = locale === "ar" ? "ar" : "en";
  const policy = getPrivacyPolicy(resolved);
  const t = await getTranslations("landing");

  return createLocaleMetadata({
    locale: resolved,
    title: policy.title,
    description: t("seo.privacyDescription"),
    path: "/privacy",
  });
}

export default async function PrivacyPage() {
  const locale = (await getLocale()) as Locale;
  const resolved: Locale = locale === "ar" ? "ar" : "en";

  return (
    <>
      <JsonLd locale={resolved} />
      <PrivacyPolicyPage locale={resolved} />
    </>
  );
}
