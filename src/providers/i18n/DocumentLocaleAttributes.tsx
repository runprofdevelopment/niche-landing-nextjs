"use client";

import { useLayoutEffect } from "react";

import { localeDirection, type Locale } from "@/config/i18n";

type DocumentLocaleAttributesProps = {
  locale: string;
};

function resolveLocale(locale: string): Locale {
  return locale === "ar" || locale === "en" ? locale : "en";
}

/** Keeps `<html lang/dir>` in sync on client locale switches (root layout does not remount). */
export function DocumentLocaleAttributes({ locale }: DocumentLocaleAttributesProps) {
  const resolved = resolveLocale(locale);
  const dir = localeDirection[resolved];

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.lang = resolved;
    root.setAttribute("dir", dir);
  }, [resolved, dir]);

  return null;
}
