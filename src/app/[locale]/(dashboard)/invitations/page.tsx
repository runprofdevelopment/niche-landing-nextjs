"use client";

import { useHydrated } from "@/features/events/hooks/useHydrated";
import { InvitationsListView } from "@/features/invitations";
import { useTranslations } from "@/hooks/useTranslations";

export default function InvitationsPage() {
  const hydrated = useHydrated();
  const t = useTranslations("invitations");

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        {t("loading")}
      </div>
    );
  }

  return <InvitationsListView />;
}
