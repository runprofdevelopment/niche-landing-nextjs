import {
  getDefaultDescription,
  getDefaultTitle,
  organizationSameAs,
  seoConfig,
} from "@/config/seo";
import { siteConfig } from "@/config/site";

import type { Locale } from "@/config/i18n";

type JsonLdProps = {
  locale: Locale;
};

/**
 * Organization + WebSite structured data for the landing (server-rendered).
 */
export function JsonLd({ locale }: JsonLdProps) {
  const logoUrl = new URL(siteConfig.logos.meta, `${seoConfig.siteUrl}/`).toString();
  const inLanguage = locale === "ar" ? "ar-SA" : "en-US";

  const graph = [
    {
      "@type": "Organization",
      "@id": `${seoConfig.siteUrl}/#organization`,
      name: siteConfig.name,
      url: seoConfig.siteUrl,
      logo: {
        "@type": "ImageObject",
        url: logoUrl,
      },
      email: seoConfig.contact.email,
      telephone: seoConfig.contact.phone,
      sameAs: [...organizationSameAs],
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: seoConfig.contact.email,
          telephone: seoConfig.contact.phone,
          areaServed: "SA",
          availableLanguage: ["en", "ar"],
        },
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${seoConfig.siteUrl}/#website`,
      url: seoConfig.siteUrl,
      name: siteConfig.name,
      description: getDefaultDescription(locale),
      inLanguage,
      publisher: { "@id": `${seoConfig.siteUrl}/#organization` },
    },
    {
      "@type": "WebPage",
      "@id": `${seoConfig.siteUrl}/${locale}/#webpage`,
      url: `${seoConfig.siteUrl}/${locale}`,
      name: getDefaultTitle(locale),
      description: getDefaultDescription(locale),
      inLanguage,
      isPartOf: { "@id": `${seoConfig.siteUrl}/#website` },
      about: { "@id": `${seoConfig.siteUrl}/#organization` },
    },
  ];

  const payload = {
    "@context": "https://schema.org",
    "@graph": graph,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
