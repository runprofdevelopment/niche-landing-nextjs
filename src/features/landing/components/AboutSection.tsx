"use client";

import Image from "next/image";

import { useTranslations } from "@/hooks/useTranslations";

export function AboutSection() {
  const t = useTranslations("landing");

  return (
    <section
      id="about"
      className="relative isolate overflow-hidden bg-background py-16 sm:py-20 lg:py-24"
    >
      <div className="relative z-10 mx-auto w-full max-w-360 px-5 sm:px-8 lg:px-12">
        <div className="relative">
          <div
            aria-hidden
            className="absolute top-1/2 left-1/2 z-0 h-[64px] w-screen -translate-x-1/2 -translate-y-1/2 bg-primary "
          />

          <div className="relative z-10 grid grid-cols-1 items-center gap-10 md:grid-cols-[1.05fr_0.95fr] md:gap-8 lg:gap-12">
            <div className="text-center">
              <p className="font-geist text-[11px] font-medium tracking-[0.22em] text-secondary uppercase">
                — {t("about.eyebrow")} —
              </p>
              <h2 className="mt-5 text-center font-instrument text-[clamp(2rem,5vw,66px)] leading-[0.76] font-normal text-secondary-button lg:text-[66px] lg:leading-[50px]">
                <span className="block">{t("about.titleLine1")}</span>
                <span className="block">{t("about.titleLine2")}</span>
                <span className="block">{t("about.titleLine3")}</span>
              </h2>
            </div>

            <figure className="relative aspect-[1164/732] w-full overflow-hidden">
              <Image
                src="/images/girl.png"
                alt={t("about.imageAlt")}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-center"
                priority
              />
            </figure>
          </div>
        </div>

        <div className="mx-auto mt-14 max-w-4xl space-y-6 text-center sm:mt-16 lg:mt-20">
          <p className="font-geist text-base leading-relaxed text-[#fffaf3]/90 sm:text-lg">
            {t("about.body1")}
          </p>
          <p className="font-geist text-base leading-relaxed text-[#fffaf3]/90 sm:text-lg">
            {t("about.body2")}
          </p>
        </div>
      </div>
    </section>
  );
}
