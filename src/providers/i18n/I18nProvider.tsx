"use client";

import { NextIntlClientProvider } from "next-intl";

import { DocumentLocaleAttributes } from "./DocumentLocaleAttributes";

import type { Messages } from "@/locales/types";
import type { ReactNode } from "react";

type I18nProviderProps = {
  children: ReactNode;
  locale: string;
  messages: Messages;
  timeZone: string;
};

export function I18nProvider({ children, locale, messages, timeZone }: I18nProviderProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone={timeZone}>
      <DocumentLocaleAttributes locale={locale} />
      {children}
    </NextIntlClientProvider>
  );
}
