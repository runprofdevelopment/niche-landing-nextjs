import { locales } from "@/config/i18n";
import { absoluteUrl } from "@/config/seo";

import type { MetadataRoute } from "next";

const PUBLIC_PATHS = ["/", "/privacy", "/terms"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PUBLIC_PATHS.flatMap((path) =>
    locales.map((locale) => ({
      url: absoluteUrl(locale, path),
      lastModified,
      changeFrequency: path === "/" ? ("weekly" as const) : ("monthly" as const),
      priority: path === "/" ? 1 : 0.6,
      alternates: {
        languages: {
          en: absoluteUrl("en", path),
          ar: absoluteUrl("ar", path),
          "x-default": absoluteUrl("en", path),
        },
      },
    })),
  );
}
