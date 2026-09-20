import { siteConfig } from "@/config/site";

import type { Metadata } from "next";

type CreatePageMetadataOptions = {
  title: string;
  description?: string;
};

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

export function createRootMetadata(): Metadata {
  return {
    title: {
      default: siteConfig.name,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    icons: {
      icon: siteConfig.logos.meta,
      apple: siteConfig.logos.meta,
    },
    openGraph: {
      siteName: siteConfig.name,
      title: siteConfig.name,
      description: siteConfig.description,
    },
  };
}
