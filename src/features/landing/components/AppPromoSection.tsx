import { Bell, LayoutGrid, UserCheck } from "lucide-react";
import Image from "next/image";

import { siteConfig } from "@/config/site";
import { getTranslations } from "@/providers/i18n/server";

const FEATURES = [
  { key: "hall", icon: LayoutGrid },
  { key: "rsvp", icon: UserCheck },
  { key: "alerts", icon: Bell },
] as const;

function AppStoreBadge({
  label,
  eyebrow,
  name,
  href,
}: {
  label: string;
  eyebrow: string;
  name: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="inline-flex h-12 items-center gap-2.5 rounded-full border border-foreground/20 bg-white px-3.5 text-start text-[#111] shadow-sm transition-opacity hover:opacity-90 dark:border-white/20 dark:bg-black dark:text-white"
    >
      <svg viewBox="0 0 24 24" className="size-7 shrink-0" fill="currentColor" aria-hidden>
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.37 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="text-[9px] tracking-wide opacity-90">{eyebrow}</span>
        <span className="text-sm font-semibold">{name}</span>
      </span>
    </a>
  );
}

function GooglePlayBadge({
  label,
  eyebrow,
  name,
  href,
}: {
  label: string;
  eyebrow: string;
  name: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="inline-flex h-12 items-center gap-2.5 rounded-full border border-foreground/20 bg-white px-3.5 text-start text-[#111] shadow-sm transition-opacity hover:opacity-90 dark:border-white/20 dark:bg-black dark:text-white"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 21 24"
        className="h-7 w-auto shrink-0"
        fill="none"
        aria-hidden
      >
        <path
          d="M9.80506 11.4617L0.0898438 22.0059C0.0907562 22.0078 0.0907561 22.0106 0.0916686 22.0125C0.390051 23.1574 1.41203 24 2.62564 24C3.11108 24 3.56641 23.8656 3.95695 23.6305L3.98798 23.6118L14.9232 17.1593L9.80506 11.4617Z"
          fill="#EA4335"
        />
        <path
          d="M19.6332 9.66619L19.624 9.65966L14.9029 6.86123L9.58398 11.7013L14.922 17.1582L19.6177 14.3878C20.4407 13.9324 21.0001 13.045 21.0001 12.0223C21.0001 11.0052 20.4489 10.1225 19.6332 9.66619Z"
          fill="#FBBC04"
        />
        <path
          d="M0.0894234 1.99325C0.0310244 2.21346 0 2.44488 0 2.68376V21.3163C0 21.5552 0.0310245 21.7866 0.0903359 22.0059L10.1386 11.7313L0.0894234 1.99325Z"
          fill="#4285F4"
        />
        <path
          d="M9.87617 12L14.904 6.85945L3.98152 0.383598C3.58459 0.140054 3.12105 8.67844e-05 2.62557 8.67844e-05C1.41197 8.67844e-05 0.388161 0.84456 0.0897792 1.99043C0.0897792 1.99136 0.0888672 1.9923 0.0888672 1.99323L9.87617 12Z"
          fill="#34A853"
        />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="text-[9px] tracking-wide opacity-90">{eyebrow}</span>
        <span className="text-sm font-semibold">{name}</span>
      </span>
    </a>
  );
}

export async function AppPromoSection() {
  const t = await getTranslations("landing");
  const downloadUrl = siteConfig.appDownloadUrl;

  return (
    <section id="app" className="relative bg-background py-16 sm:py-20 lg:py-24">
      <div className="relative z-10 mx-auto grid w-full max-w-360 items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:px-12">
        <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
          <div
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-1/2 z-0 size-[90%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/50 blur-[80px] sm:blur-[100px] dark:bg-primary/60"
          />
          <figure className="relative z-10 aspect-2418/2176 w-full">
            <Image
              src="/images/mockup.webp"
              alt={t("app.imageAlt")}
              fill
              sizes="(max-width: 1024px) 90vw, 50vw"
              className="object-contain object-center"
              priority={false}
            />
          </figure>
        </div>

        <div>
          <h2 className="font-instrument text-[clamp(2.25rem,6vw,87px)] leading-[1.05] font-normal text-selected-foreground">
            <span className="block">{t("app.titleLine1")}</span>
            <span className="block">{t("app.titleLine2")}</span>
          </h2>
          <p className="mt-5 max-w-xl font-geist text-base leading-relaxed font-normal text-foreground">
            {t("app.description")}
          </p>

          <ul className="mt-8 space-y-4">
            {FEATURES.map(({ key, icon: Icon }) => (
              <li
                key={key}
                className="flex items-center gap-3 font-geist text-sm text-foreground sm:text-base"
              >
                <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-primary">
                  <Icon className="size-4" aria-hidden />
                </span>
                {t(`app.features.${key}`)}
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <AppStoreBadge
              label={t("app.appStore")}
              eyebrow={t("app.appStoreEyebrow")}
              name={t("app.appStoreName")}
              href={downloadUrl}
            />
            <GooglePlayBadge
              label={t("app.googlePlay")}
              eyebrow={t("app.googlePlayEyebrow")}
              name={t("app.googlePlayName")}
              href={downloadUrl}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
