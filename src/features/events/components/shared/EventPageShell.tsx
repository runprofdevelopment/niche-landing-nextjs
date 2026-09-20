"use client";

import { useTranslations } from "@/hooks/useTranslations";

import { useHydrated } from "../../hooks/useHydrated";

import type { ReactNode } from "react";

type EventPageShellProps = {
  children: ReactNode;
  /** Fill the dashboard content area (for canvas tools that must not page-scroll). */
  fill?: boolean;
};

export function EventPageShell({ children, fill = false }: EventPageShellProps) {
  const hydrated = useHydrated();
  const t = useTranslations("events");

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        {t("loadingEvent")}
      </div>
    );
  }

  if (fill) {
    return <div className="flex h-full min-h-0 flex-col overflow-hidden">{children}</div>;
  }

  return children;
}
