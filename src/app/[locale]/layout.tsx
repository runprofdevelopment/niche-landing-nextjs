import { notFound } from "next/navigation";

import { localeDirection, type Locale } from "@/config/i18n";
import { RootProvider } from "@/providers";
import { routing } from "@/providers/i18n/routing";
import { getMessages, getTimeZone, hasLocale, setRequestLocale } from "@/providers/i18n/server";

import type { Messages } from "@/locales/types";
import type { ReactNode } from "react";

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const timeZone = await getTimeZone();
  const resolvedLocale: Locale = locale === "ar" || locale === "en" ? locale : "en";
  const dir = localeDirection[resolvedLocale];

  return (
    <div lang={resolvedLocale} dir={dir} className="min-h-dvh">
      <RootProvider locale={locale} messages={messages as Messages} timeZone={timeZone}>
        {children}
      </RootProvider>
    </div>
  );
}
