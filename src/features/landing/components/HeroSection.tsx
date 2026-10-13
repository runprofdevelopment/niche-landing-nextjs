import Image from "next/image";

import { getTranslations } from "@/providers/i18n/server";

import { HeroCta } from "./HeroCta";
import { HeroBackground, HeroMotion } from "./HeroMotion";

export async function HeroSection() {
  const t = await getTranslations("landing");

  return (
    <section className="relative isolate min-h-dvh overflow-hidden bg-[#1a1410] text-white">
      <HeroBackground alt={t("heroAlt")} />

      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,#140e0a73_0%,#140e0ab5_40%,#140e0a8c_100%)]"
      />

      <div className="relative z-10 flex min-h-dvh flex-col justify-between px-5 pt-28 pb-10 sm:px-8 sm:pb-12 lg:px-12 lg:pb-14">
        <div className="flex flex-1 items-center justify-center">
          <HeroMotion
            className="relative w-[min(92vw,1100px)]"
            readyClassName="animate-hero-title"
          >
            <Image
              src="/images/heroTitle.webp"
              alt={t("brand")}
              width={1400}
              height={280}
              priority
              className="h-auto w-full mix-blend-screen"
            />
          </HeroMotion>
        </div>

        <div className="grid grid-cols-1 items-end gap-6 sm:grid-cols-12 sm:gap-10">
          <HeroMotion
            className="order-2 min-w-0 space-y-2 text-primary-foreground sm:order-1 sm:col-span-9 sm:space-y-3"
            readyClassName="animate-hero-rise [animation-delay:280ms]"
          >
            {/* Text H1 for SEO/a11y; brand wordmark above stays visual. */}
            <h1 className="font-display text-[1.5rem] leading-tight font-bold sm:text-[32px]">
              {t("headline")}
            </h1>
            <p className="font-sans text-base leading-snug font-normal opacity-90 sm:text-[24px]">
              {t("subheadline")}
            </p>
          </HeroMotion>

          <HeroCta label={t("cta")} />
        </div>
      </div>
    </section>
  );
}
