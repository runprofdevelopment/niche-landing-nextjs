"use client";

import { useTranslations } from "@/hooks/useTranslations";

const STATS = ["entities", "clients", "satisfaction", "guests"] as const;

export function StatsSection() {
  const t = useTranslations("landing");

  return (
    <section
      id="stats"
      className="relative isolate overflow-hidden bg-[#1a0a10] py-14 sm:py-16 lg:py-20"
    >
      <div className="mx-auto grid w-full max-w-360 grid-cols-2 gap-10 px-5 sm:px-8 md:grid-cols-4 md:gap-6 lg:px-12">
        {STATS.map((key) => (
          <div key={key} className="text-center text-secondary">
            <p className="font-geist text-3xl font-light tracking-tight sm:text-4xl lg:text-5xl">
              {t(`stats.items.${key}.value`)}
            </p>
            <p className="mt-2 font-geist text-[10px] font-medium tracking-[0.18em] uppercase sm:text-[11px]">
              {t(`stats.items.${key}.label`)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
