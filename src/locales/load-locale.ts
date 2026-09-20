import type { Locale } from "@/config/i18n";

export async function loadLocaleMessages(locale: Locale) {
  switch (locale) {
    case "en":
      return (await import("./en")).default;
    case "ar":
      return (await import("./ar")).default;
    default:
      return (await import("./en")).default;
  }
}
