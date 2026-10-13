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
        "group relative order-1 ms-auto inline-flex size-24 shrink-0 items-center justify-center rounded-full bg-[#EFE2DE] text-center text-[0.65rem] font-semibold tracking-[0.14em] text-[#2d1a1e] uppercase shadow-[0_12px_40px_rgba(0,0,0,0.28)] transition-transform duration-500 hover:scale-[1.04] sm:order-2 sm:col-span-3 sm:size-32 sm:text-xs",
        hideUntilReady && "opacity-0",
        ready && "animate-hero-rise [animation-delay:420ms]",
      )}
    >
      <span className="max-w-22 leading-snug transition-transform duration-500 group-hover:scale-105">
        {label}
      </span>
    </button>
  );
}
