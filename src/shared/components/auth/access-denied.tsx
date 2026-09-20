"use client";

import { ShieldOff } from "lucide-react";

import { routes } from "@/constants/routes";
import { useTranslations } from "@/hooks/useTranslations";
import { Link } from "@/providers/i18n";
import { Button } from "@/shared/components/ui/button";

export function AccessDenied() {
  const t = useTranslations("common");

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <ShieldOff className="size-6" />
      </div>
      <div className="space-y-2">
        <h1 className="font-display text-2xl font-semibold">{t("accessDeniedTitle")}</h1>
        <p className="max-w-md text-sm text-muted-foreground">{t("accessDeniedDescription")}</p>
      </div>
      <Button asChild variant="outline">
        <Link href={routes.dashboard}>{t("goDashboard")}</Link>
      </Button>
    </div>
  );
}
