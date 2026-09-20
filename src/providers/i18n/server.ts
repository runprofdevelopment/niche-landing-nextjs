import { getTranslations as getNextIntlTranslations } from "next-intl/server";

export async function getTranslations(namespace?: string) {
  return getNextIntlTranslations(namespace);
}

export { getLocale, getMessages, getTimeZone, setRequestLocale } from "next-intl/server";
export { hasLocale } from "next-intl";
