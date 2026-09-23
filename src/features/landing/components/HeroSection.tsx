"use client";

import Image from "next/image";

import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";

import { useLandingMotion } from "./LandingMotion";

export function HeroSection() {
  const t = useTranslations("landing");
  const { ready } = useLandingMotion();

  return (
    <section className="relative isolate min-h-dvh overflow-hidden bg-[#1a1410] text-white">
      <Image
        src="/images/hero.webp"
        alt={t("heroAlt")}
        fill
        priority
        sizes="100vw"
        className={cn("object-cover object-center", ready && "animate-hero-ken")}
      />

      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,#140e0a73_0%,#140e0ab5_40%,#140e0a8c_100%)]"
      />

      <div className="relative z-10 flex min-h-dvh flex-col justify-between px-5 pb-10 pt-28 sm:px-8 sm:pb-12 lg:px-12 lg:pb-14">
        <div className="flex flex-1 items-center justify-center">
          <h1
            className={cn(
              "relative w-[min(92vw,1100px)]",
              !ready && "opacity-0",
              ready && "animate-hero-title",
            )}
          >
            <Image
              src="/images/heroTitle.webp"
              alt={t("brand")}
              width={1400}
              height={280}
              priority
              className="h-auto w-full mix-blend-screen"
            />
          </h1>
        </div>

        <div className="grid grid-cols-1 items-end gap-6 sm:grid-cols-12 sm:gap-10">
          <div
            className={cn(
              "order-2 min-w-0 space-y-2 text-primary-foreground sm:order-1 sm:col-span-9 sm:space-y-3",
              !ready && "opacity-0",
              ready && "animate-hero-rise [animation-delay:280ms]",
            )}
          >
            <h2 className="font-display text-[1.5rem] leading-tight font-bold sm:text-[32px]">
              {t("headline")}
            </h2>
            <p className="font-sans text-base leading-snug font-normal opacity-90 sm:text-[24px]">
              {t("subheadline")}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
            className={cn(
              "group relative order-1 ms-auto inline-flex size-24 shrink-0 items-center justify-center rounded-full bg-[#EFE2DE] text-center text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#2d1a1e] shadow-[0_12px_40px_rgba(0,0,0,0.28)] transition-transform duration-500 hover:scale-[1.04] sm:order-2 sm:col-span-3 sm:size-32 sm:text-xs",
              !ready && "opacity-0",
              ready && "animate-hero-rise [animation-delay:420ms]",
            )}
          >
            <span className="max-w-[5.5rem] leading-snug transition-transform duration-500 group-hover:scale-105">
              {t("cta")}
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
