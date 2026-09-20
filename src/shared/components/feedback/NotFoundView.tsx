import Link from "next/link";

import { siteConfig } from "@/config/site";
import { routes } from "@/constants/routes";
import { getLocale, getTranslations } from "@/providers/i18n/server";
import { Button } from "@/shared/components/ui/button";

export async function NotFoundView() {
  const t = await getTranslations("common");
  const locale = await getLocale();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-lg rounded-2xl border border-border/60 bg-card p-8 text-center shadow-sm sm:p-10">
        <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
          {siteConfig.name}
        </p>

        <p className="mt-6 font-display text-7xl font-semibold tracking-tight text-primary sm:text-8xl">
          404
        </p>
        <h1 className="mt-4 font-display text-2xl font-semibold text-foreground sm:text-3xl">
          {t("notFoundTitle")}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {t("notFoundDescription")}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href={`/${locale}${routes.home === "/" ? "" : routes.home}`}>{t("goHome")}</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href={`/${locale}${routes.dashboard}`}>{t("goDashboard")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
