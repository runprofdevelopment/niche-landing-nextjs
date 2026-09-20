import { fontVariables } from "@/config/fonts";
import { defaultLocale, localeDirection, type Locale } from "@/config/i18n";
import { createRootMetadata } from "@/lib/metadata";
import { getLocale } from "@/providers/i18n/server";

import type { ReactNode } from "react";

import "./globals.css";

export const metadata = createRootMetadata();

/**
 * Next.js requires a root layout with <html> and <body>.
 * App providers, i18n validation, and route chrome live in `[locale]/layout.tsx`.
 */
export default async function RootLayout({ children }: { children: ReactNode }) {
  let locale: string = defaultLocale;

  try {
    locale = await getLocale();
  } catch {
    locale = defaultLocale;
  }

  const resolvedLocale: Locale = locale === "ar" || locale === "en" ? locale : defaultLocale;
  const dir = localeDirection[resolvedLocale];

  return (
    <html lang={resolvedLocale} dir={dir} suppressHydrationWarning>
      <body className={`${fontVariables} overflow-x-hidden`}>{children}</body>
    </html>
  );
}
