"use client";

import { ToastProvider } from "@/shared/components/ui/toast";

import { ApolloProvider } from "./apollo";
import { AuthProvider } from "./auth";
import { I18nProvider } from "./i18n/I18nProvider";
import { PhoneCountryProvider } from "./phone-country";
import { ThemeProvider } from "./theme";

import type { Messages } from "@/locales/types";
import type { ReactNode } from "react";

type RootProviderProps = {
  children: ReactNode;
  locale: string;
  messages: Messages;
  timeZone: string;
  phoneCountryCode?: string;
};

export function RootProvider({
  children,
  locale,
  messages,
  timeZone,
  phoneCountryCode,
}: RootProviderProps) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ApolloProvider>
          <AuthProvider>
            <PhoneCountryProvider {...(phoneCountryCode ? { countryCode: phoneCountryCode } : {})}>
              <I18nProvider locale={locale} messages={messages} timeZone={timeZone}>
                {children}
              </I18nProvider>
            </PhoneCountryProvider>
          </AuthProvider>
        </ApolloProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
