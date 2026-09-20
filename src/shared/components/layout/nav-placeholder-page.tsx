import { createPageMetadata } from "@/lib/metadata";
import { getTranslations } from "@/providers/i18n/server";
import { PermissionGate } from "@/shared/components/auth/permission-gate";
import { PagePlaceholder } from "@/shared/components/layout/page-placeholder";

import type { PermissionKey } from "@/constants/permissions";
import type meta from "@/locales/en/meta";
import type navigation from "@/locales/en/navigation";
import type { Metadata } from "next";

type NavTitleKey = keyof typeof navigation;
type MetaDescriptionKey = keyof typeof meta;

export async function createNavPageMetadata(titleKey: NavTitleKey): Promise<Metadata> {
  const tNav = await getTranslations("navigation");
  const tMeta = await getTranslations("meta");

  return createPageMetadata({
    title: tNav(titleKey),
    description: tMeta(`${titleKey}Description` as MetaDescriptionKey),
  });
}

export async function renderNavPlaceholder(titleKey: NavTitleKey, permission: PermissionKey) {
  const t = await getTranslations("navigation");
  return (
    <PermissionGate permission={permission}>
      <PagePlaceholder title={t(titleKey)} />
    </PermissionGate>
  );
}
