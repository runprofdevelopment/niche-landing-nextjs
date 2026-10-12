import { defaultLocale, type Locale } from "@/config/i18n";
import {
  absoluteUrl,
  getDefaultDescription,
  getDefaultKeywords,
  getDefaultTitle,
  getOgImageUrl,
  languageAlternates,
  seoConfig,
} from "@/config/seo";
import { siteConfig } from "@/config/site";

import type { Metadata } from "next";

type CreatePageMetadataOptions = {
  title: string;
  description?: string;
};

type CreateLocaleMetadataOptions = {
  locale: Locale;
  title?: string;
  description?: string;
  /** Path without locale prefix, e.g. `/` or `/privacy`. */
  path?: string;
};

function ogLocale(locale: Locale): string {
  return locale === "ar" ? "ar_SA" : "en_US";
}

export function createPageMetadata({ title, description }: CreatePageMetadataOptions): Metadata {
  const resolvedDescription = description ?? siteConfig.description;

  return {
    title,
    description: resolvedDescription,
    openGraph: {
      title,
      description: resolvedDescription,
      siteName: siteConfig.name,
    },
  };
}

/**
 * Locale-aware metadata for public marketing pages (home, privacy, terms).
 */
export function createLocaleMetadata({
  locale,
  title,
  description,
  path = "/",
}: CreateLocaleMetadataOptions): Metadata {
  const resolvedTitle = title ?? getDefaultTitle(locale);
  const resolvedDescription = description ?? getDefaultDescription(locale);
  const resolvedKeywords = [...getDefaultKeywords(locale)];
  const canonical = absoluteUrl(locale, path);
  const ogImage = getOgImageUrl();

  // Absolute title avoids double suffix from root `title.template`.
  const pageTitle =
    path === "/"
      ? { absolute: resolvedTitle }
      : { absolute: `${resolvedTitle} | ${siteConfig.name}` };

  return {
    title: pageTitle,
    description: resolvedDescription,
    keywords: resolvedKeywords,
    metadataBase: new URL(seoConfig.siteUrl),
    alternates: {
      canonical,
      languages: languageAlternates(path),
    },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: siteConfig.name,
      title: path === "/" ? resolvedTitle : `${resolvedTitle} | ${siteConfig.name}`,
      description: resolvedDescription,
      locale: ogLocale(locale),
      alternateLocale: locale === "ar" ? ["en_US"] : ["ar_SA"],
      images: [
        {
          url: ogImage,
          width: seoConfig.ogImageWidth,
          height: seoConfig.ogImageHeight,
          alt: siteConfig.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: seoConfig.twitterHandle,
      title: path === "/" ? resolvedTitle : `${resolvedTitle} | ${siteConfig.name}`,
      description: resolvedDescription,
      images: [ogImage],
    },
  };
}

export function createRootMetadata(): Metadata {
  return {
    metadataBase: new URL(seoConfig.siteUrl),
    title: {
      default: getDefaultTitle(defaultLocale),
      template: `%s | ${siteConfig.name}`,
    },
    description: getDefaultDescription(defaultLocale),
    keywords: [...getDefaultKeywords(defaultLocale)],
    icons: {
      icon: siteConfig.logos.meta,
      apple: siteConfig.logos.meta,
    },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title: getDefaultTitle(defaultLocale),
      description: getDefaultDescription(defaultLocale),
      images: [
        {
          url: getOgImageUrl(),
          width: seoConfig.ogImageWidth,
          height: seoConfig.ogImageHeight,
          alt: siteConfig.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: seoConfig.twitterHandle,
      title: getDefaultTitle(defaultLocale),
      description: getDefaultDescription(defaultLocale),
      images: [getOgImageUrl()],
    },
  };
}
