"use client";

import { Bell, LayoutGrid, UserCheck } from "lucide-react";
import Image from "next/image";

import { useTranslations } from "@/hooks/useTranslations";

const FEATURES = [
  { key: "hall", icon: LayoutGrid },
  { key: "rsvp", icon: UserCheck },
  { key: "alerts", icon: Bell },
] as const;

function AppStoreBadge({ label }: { label: string }) {
  return (
    <a
      href="#"
      aria-label={label}
      className="inline-flex h-12 items-center gap-2.5 rounded-full border border-foreground/20 bg-white px-3.5 text-[#111] shadow-sm transition-opacity hover:opacity-90 dark:border-white/20 dark:bg-black dark:text-white"
    >
      <svg viewBox="0 0 24 24" className="size-7 shrink-0" fill="currentColor" aria-hidden>
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.37 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="text-[9px] tracking-wide opacity-90">Download on the</span>
        <span className="text-sm font-semibold">App Store</span>
      </span>
    </a>
  );
}

function GooglePlayBadge({ label }: { label: string }) {
  return (
    <a
      href="#"
      aria-label={label}
      className="inline-flex h-12 items-center gap-2.5 rounded-full border border-foreground/20 bg-white px-3.5 text-[#111] shadow-sm transition-opacity hover:opacity-90 dark:border-white/20 dark:bg-black dark:text-white"
    >
      <svg viewBox="0 0 24 24" className="size-7 shrink-0" aria-hidden>
        <path fill="#EA4335" d="M3.6 2.2 13.4 12 3.6 21.8c-.4-.3-.6-.8-.6-1.3V3.5c0-.5.2-1 .6-1.3z" />
        <path fill="#FBBC04" d="m13.4 12 2.7-2.7 4.5 2.6c.6.3.9.8.9 1.4s-.3 1.1-.9 1.4l-4.5 2.6L13.4 12z" />
        <path fill="#4285F4" d="M13.4 12 3.6 2.2c.3-.2.6-.3 1-.3.4 0 .8.1 1.1.3L16.1 9.3 13.4 12z" />
        <path fill="#34A853" d="M13.4 12 16.1 14.7 5.7 21.8c-.3.2-.7.3-1.1.3-.4 0-.7-.1-1-.3L13.4 12z" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="text-[9px] tracking-wide opacity-90">GET IT ON</span>
        <span className="text-sm font-semibold">Google Play</span>
      </span>
    </a>
  );
}

export function AppPromoSection() {
  const t = useTranslations("landing");

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
              src="/images/mockup.png"
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
            <AppStoreBadge label={t("app.appStore")} />
            <GooglePlayBadge label={t("app.googlePlay")} />
          </div>
        </div>
      </div>
    </section>
  );
}
