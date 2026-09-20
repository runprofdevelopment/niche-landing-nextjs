"use client";

import { useTranslations } from "@/hooks/useTranslations";

/** Full-screen hold for cold auth bootstrap (no session yet). */
export function AuthSessionLoading() {
  const t = useTranslations("common");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background text-sm text-muted-foreground">
      {t("loading")}
    </div>
  );
}

/**
 * Soft hold while an authenticated session is resolving dashboard access.
 * Keeps page chrome feel instead of a blank full-screen lock (A3).
 */
export function AuthSessionSkeleton() {
  const t = useTranslations("common");

  return (
    <div className="flex h-svh max-h-svh flex-col gap-4 overflow-hidden bg-background p-4">
      <div className="h-12 w-full animate-pulse rounded-md bg-muted/60" />
      <div className="flex min-h-0 flex-1 gap-4">
        <div className="hidden w-56 shrink-0 animate-pulse rounded-md bg-muted/50 md:block" />
        <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-3 rounded-md border border-border/40 bg-card/40">
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          <p className="text-sm text-muted-foreground">{t("loading")}</p>
        </div>
      </div>
    </div>
  );
}
