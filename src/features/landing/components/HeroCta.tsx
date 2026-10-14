"use client";

import { cn } from "@/lib/utils";

import { useIsClient } from "../hooks/use-is-client";

import { useLandingMotion } from "./LandingMotion";

type HeroCtaProps = {
  label: string;
};

export function HeroCta({ label }: HeroCtaProps) {
  const { ready } = useLandingMotion();
  const mounted = useIsClient();
  const hideUntilReady = mounted && !ready;

  return (
    <button
      type="button"
      onClick={() =>
        document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" })
      }
      className={cn(
        "group relative order-1 ms-auto inline-flex h-12 shrink-0 items-center justify-center rounded-xl bg-[#EFE2DE] px-6 text-center text-sm font-semibold tracking-[0.08em] text-[#2d1a1e] uppercase shadow-[0_12px_40px_rgba(0,0,0,0.28)] transition-transform duration-500 hover:scale-[1.03] sm:order-2 sm:col-span-3 sm:h-14 sm:px-8 sm:text-base",
        hideUntilReady && "opacity-0",
        ready && "animate-hero-rise [animation-delay:420ms]",
      )}
    >
      <span className="leading-none transition-transform duration-500 group-hover:scale-105">
        {label}
      </span>
    </button>
  );
}
