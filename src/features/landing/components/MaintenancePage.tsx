import { Settings } from "lucide-react";
import Image from "next/image";

import { routes } from "@/constants/routes";
import { Link } from "@/providers/i18n/navigation";
import { getTranslations } from "@/providers/i18n/server";

/**
 * Full-viewport maintenance screen — primary background, logo, and status copy.
 */
export async function MaintenancePage() {
  const t = await getTranslations("landing");

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center bg-primary px-6 text-center text-primary-foreground">
      <Image
        src="/images/logo.png"
        alt={t("logoAlt")}
        width={120}
        height={140}
        priority
        className="h-24 w-auto sm:h-28"
      />

      <h1 className="mt-10 font-display text-[clamp(1.75rem,5vw,2.75rem)] leading-tight font-normal text-secondary-button">
        {t("maintenance.title")}
      </h1>
      <p className="mt-4 max-w-md font-geist text-base leading-relaxed text-primary-foreground/80 sm:text-lg">
        {t("maintenance.message")}
      </p>

      <Link
        href={routes.login}
        aria-label={t("maintenance.settingsAria")}
        className="mt-8 inline-flex size-16 animate-[maintenance-float_2.8s_ease-in-out_infinite] items-center justify-center rounded-full text-secondary-button transition-colors hover:bg-white/10 sm:size-20"
      >
        <Settings
          className="size-10 animate-[spin_3.5s_linear_infinite] sm:size-12"
          aria-hidden
        />
      </Link>
    </main>
  );
}
