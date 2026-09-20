"use client";

import { use } from "react";

import { useHydrated } from "@/features/events/hooks/useHydrated";
import { BindInvitationView } from "@/features/invitations";
import { useTranslations } from "@/hooks/useTranslations";

type PageProps = {
  params: Promise<{ templateId: string }>;
};

export default function UseTemplatePage({ params }: PageProps) {
  const { templateId } = use(params);
  const hydrated = useHydrated();
  const t = useTranslations("invitations");

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        {t("loading")}
      </div>
    );
  }

  return <BindInvitationView templateId={templateId} />;
}
