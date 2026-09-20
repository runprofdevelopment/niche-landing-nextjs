import { notFound } from "next/navigation";

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

  return (
    <RootProvider locale={locale} messages={messages as Messages} timeZone={timeZone}>
      {children}
    </RootProvider>
  );
}
