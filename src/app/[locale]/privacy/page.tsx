import { siteConfig } from "@/config/site";
import { PrivacyPolicyPage } from "@/features/landing";
import { getPrivacyPolicy } from "@/features/landing/content/privacy-policy";
import { getLocale } from "@/providers/i18n/server";

import type { Locale } from "@/config/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  const policy = getPrivacyPolicy(locale);

  return {
    title: `${policy.title} | ${siteConfig.name}`,
    description:
      locale === "ar"
        ? "كيف تجمع Niche Society البيانات الشخصية في Niche Frontdesk وتستخدمها وتخزّنها وتشاركها."
        : "How Niche Society collects, uses, stores, and shares personal data in Niche Frontdesk.",
  };
}

export default async function PrivacyPage() {
  const locale = (await getLocale()) as Locale;
  return <PrivacyPolicyPage locale={locale === "ar" ? "ar" : "en"} />;
}
