import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { timeZone } from "@/config/i18n";
import { loadLocaleMessages } from "@/locales/load-locale";

import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: await loadLocaleMessages(locale),
    timeZone,
  };
});
