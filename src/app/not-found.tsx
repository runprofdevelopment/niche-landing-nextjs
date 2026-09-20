import { getTranslations } from "@/providers/i18n/server";
import { NotFoundView } from "@/shared/components/feedback/NotFoundView";

import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("common");
  return {
    title: t("notFoundTitle"),
  };
}

export default function NotFound() {
  return <NotFoundView />;
}
