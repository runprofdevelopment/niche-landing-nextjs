"use client";

import { useTranslations as useNextIntlTranslations } from "next-intl";

import { localeDirection, type Locale } from "@/config/i18n";

export function useTranslations(namespace?: string) {
  return useNextIntlTranslations(namespace);
}

export { useLocale as useCurrentLocale, useTimeZone, useNow } from "next-intl";

export function getDirection(locale: string): "ltr" | "rtl" {
  return localeDirection[locale as Locale] ?? "ltr";
}

/**
 * Pragmatic translation-key type. When a feature is fully typed against a
 * namespace, tighten this to the union of that namespace's keys.
 * `_NS` documents the intended namespace without affecting the value type.
 */
export type TranslationKey<_NS extends string = string> = string;

/**
 * Translator function returned by `useTranslations`. Loosely typed so features
 * can pass it around without namespace-specific gymnastics.
 */
export type Translator<_NS extends string = string> = ReturnType<typeof useTranslations>;
