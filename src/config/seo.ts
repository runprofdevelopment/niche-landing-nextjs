import { defaultLocale, type Locale } from "@/config/i18n";

import { siteConfig } from "./site";

/**
 * Normalize `NEXT_PUBLIC_APP_URL` to a bare origin (`https://example.com`).
 * - Development: missing/blank values fall back to `http://localhost:3000`.
 * - Production: missing, invalid, or non-HTTPS values throw configuration errors.
 */
function normalizeSiteUrl(value: string | undefined): string {
  const isProd = process.env.NODE_ENV === "production";
  const trimmed = value?.trim() ?? "";

  if (!trimmed) {
    if (isProd) {
      throw new Error(
        "Missing NEXT_PUBLIC_APP_URL. Set a valid absolute HTTPS site URL in production (e.g. https://www.example.com).",
      );
    }
    return "http://localhost:3000";
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error(
      `Invalid NEXT_PUBLIC_APP_URL "${trimmed}". Expected an absolute URL (e.g. https://www.example.com).`,
    );
  }

  if (isProd && url.protocol !== "https:") {
    throw new Error(
      `NEXT_PUBLIC_APP_URL must use HTTPS in production. Received "${url.origin}" (${url.protocol}).`,
    );
  }

  return url.origin;
}

/** Public site origin — from `NEXT_PUBLIC_APP_URL`. */
export const siteUrl = normalizeSiteUrl(process.env["NEXT_PUBLIC_APP_URL"]);

export const seoConfig = {
  siteUrl,
  ogImagePath: "/images/og-default.webp",
  ogImageWidth: 1200,
  ogImageHeight: 630,
  twitterHandle: "@NicheSocietyksa",
  defaultTitle: {
    en: "Niche Society | Luxury Event & Household Management in Riyadh",
    ar: "Niche Society | إدارة الفعاليات والمنازل الفاخرة في الرياض",
  },
  defaultDescription: {
    en: "Niche Society curates luxury weddings, elite household management, and protocol services in Riyadh—25 years of excellence with absolute privacy.",
    ar: "Niche Society تقدّم تنظيم حفلات الزفاف الفاخرة وإدارة المنازل الراقية وخدمات البروتوكول في الرياض—٢٥ عاماً من التميّز بخصوصية تامة.",
  },
  /** Search keywords (meta keywords + shared SEO copy). Google weights title/description/content more. */
  keywords: {
    en: [
      "Niche Society",
      "luxury event management Riyadh",
      "luxury wedding planner Saudi Arabia",
      "elite household management",
      "protocol and etiquette services",
      "private estate management Riyadh",
      "bespoke events KSA",
      "Niche Frontdesk",
      "wedding planning Riyadh",
      "VIP event management",
    ],
    ar: [
      "Niche Society",
      "إدارة فعاليات فاخرة الرياض",
      "تنظيم حفلات زفاف فاخرة السعودية",
      "إدارة منازل راقية",
      "خدمات بروتوكول وإتيكيت",
      "إدارة عقارات خاصة الرياض",
      "فعاليات مخصصة السعودية",
      "Niche Frontdesk",
      "تخطيط حفلات زفاف الرياض",
      "إدارة فعاليات كبار الشخصيات",
    ],
  },
  contact: {
    email: "support@niche-society.com",
    phone: "+966573950656",
  },
} as const;

export function getDefaultTitle(locale: Locale): string {
  return seoConfig.defaultTitle[locale] ?? seoConfig.defaultTitle[defaultLocale];
}

export function getDefaultDescription(locale: Locale): string {
  return seoConfig.defaultDescription[locale] ?? seoConfig.defaultDescription[defaultLocale];
}

export function getDefaultKeywords(locale: Locale): readonly string[] {
  return seoConfig.keywords[locale] ?? seoConfig.keywords[defaultLocale];
}

/** Absolute OG image URL. */
export function getOgImageUrl(): string {
  return new URL(seoConfig.ogImagePath, `${seoConfig.siteUrl}/`).toString();
}

/** Locale-prefixed path (localePrefix: always). */
export function localizedPath(locale: Locale, path = "/"): string {
  const normalized = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${normalized}`;
}

export function absoluteUrl(locale: Locale, path = "/"): string {
  return new URL(localizedPath(locale, path), `${seoConfig.siteUrl}/`).toString();
}

export function languageAlternates(path = "/"): Record<string, string> {
  return {
    en: absoluteUrl("en", path),
    ar: absoluteUrl("ar", path),
    "x-default": absoluteUrl(defaultLocale, path),
  };
}

export const organizationSameAs = [
  siteConfig.social.instagram,
  siteConfig.social.facebook,
  siteConfig.social.x,
  siteConfig.social.linkedin,
] as const;
