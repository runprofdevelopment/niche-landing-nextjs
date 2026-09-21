"use client";

import Image from "next/image";

import { useTranslations } from "@/hooks/useTranslations";

const PILLARS = ["heritage", "elegance", "prestige"] as const;

const NOISE_BG =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export function CelebrateSection() {
  const t = useTranslations("landing");

  return (
    <section
      id="celebrate"
      className="relative isolate overflow-hidden bg-background pt-4 pb-20 sm:pt-8 sm:pb-24 lg:pt-8 lg:pb-28"
    >
      <div className="relative z-10 mx-auto w-full max-w-360 px-5 sm:px-8 lg:px-12">
        <ul className=" grid grid-cols-3 gap-4 text-center">
          {PILLARS.map((key) => (
            <li
              key={key}
              className="font-display text-sm tracking-wide text-primary-foreground/90 sm:text-base"
            >
              {t(`celebrate.${key}`)}
            </li>
          ))}
        </ul>

        <div className="relative mx-auto mt-12 w-full max-w-360 sm:mt-14 lg:mt-16">
          <div className="relative mx-auto w-full max-w-[calc(565px+48px)]">
            {/* Primary panel — same size as image, offset left behind */}
            <div
              aria-hidden
              className="absolute top-[calc(24px+6%)] left-[calc(24px-8%)] z-0 aspect-[565/626] w-[calc(100%-48px)] max-w-[565px] bg-primary sm:left-[calc(24px-10%)] lg:top-[64px] lg:-left-40 lg:h-[626px] lg:w-[565px] lg:max-w-none lg:aspect-auto"
            >
              <div
                className="absolute inset-0 opacity-[0.45] mix-blend-soft-light"
                style={{ backgroundImage: NOISE_BG }}
              />
            </div>

            {/* Frame: border away from image with 24px padding */}
            <div className="relative z-10 border-t border-r border-l border-secondary p-6">
              <figure className="relative aspect-[565/626] w-full max-w-[565px] overflow-hidden lg:h-[626px] lg:w-[565px] lg:max-w-none lg:aspect-auto">
                <Image
                  src="/images/aboutus.png"
                  alt={t("celebrate.imageAlt")}
                  fill
                  sizes="565px"
                  className="object-cover"
                  priority
                />
              </figure>
            </div>
          </div>

          <h2 className="pointer-events-none relative z-20 -mt-8 whitespace-nowrap text-center font-display text-[clamp(1.75rem,8vw,110px)] leading-none font-normal sm:-mt-10 lg:-mt-12">
            <span className="bg-linear-to-r from-foreground from-15% via-foreground/60 via-50% to-transparent bg-clip-text text-transparent dark:from-primary-foreground dark:via-primary-foreground/70">
              {t("celebrate.title")}
            </span>
          </h2>
        </div>
      </div>
    </section>
  );
}
