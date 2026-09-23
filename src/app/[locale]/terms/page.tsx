import { siteConfig } from "@/config/site";
import { TermsAndConditionsPage } from "@/features/landing";
import { getTermsAndConditions } from "@/features/landing/content/terms-and-conditions";
import { getLocale } from "@/providers/i18n/server";

import type { Locale } from "@/config/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  const terms = getTermsAndConditions(locale);

  return {
    title: `${terms.title} | ${siteConfig.name}`,
    description:
      locale === "ar"
        ? "الشروط والأحكام لاستخدام موقع Niche Society وتطبيق Niche Frontdesk والخدمات المرتبطة."
        : "Terms and conditions for using the Niche Society website, Niche Frontdesk, and related services.",
  };
}

export default async function TermsPage() {
  const locale = (await getLocale()) as Locale;
  return <TermsAndConditionsPage locale={locale === "ar" ? "ar" : "en"} />;
}
