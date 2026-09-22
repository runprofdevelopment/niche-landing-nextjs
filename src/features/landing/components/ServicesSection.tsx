"use client";

import Image from "next/image";

import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";

const SERVICES = [
  {
    key: "events",
    src: "/images/service1.png",
    className: "md:col-start-1 md:row-start-1 md:justify-self-start",
  },
  {
    key: "digital",
    src: "/images/service2.png",
    className: "md:col-start-2 md:row-start-1 md:mt-16 md:justify-self-end lg:mt-24",
  },
  {
    key: "etiquette",
    src: "/images/service3.png",
    className: "md:col-span-2 md:row-start-2 md:mx-auto md:max-w-85 lg:max-w-95",
  },
  {
    key: "household",
    src: "/images/service4.png",
    className: "md:col-start-1 md:row-start-3 md:mt-4 md:justify-self-start lg:mt-8",
  },
  {
    key: "certification",
    src: "/images/service5.png",
    className: "md:col-start-2 md:row-start-3 md:-mt-8 md:justify-self-end lg:-mt-16",
  },
] as const;

export function ServicesSection() {
  const t = useTranslations("landing");

  return (
    <section id="services" className="relative isolate overflow-hidden bg-background py-16 sm:py-20 lg:py-24">
      {/* Full-width blurred groom — covers descriptions + services */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -inset-6 blur-[5px]">
          <Image
            src="/images/groom.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-[center_30%]"
            priority={false}
          />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(184deg,rgba(239,226,222,0.40)_17.47%,#EFE2DE_95.37%)] dark:hidden" />
        <div className="absolute inset-0 hidden bg-[linear-gradient(206deg,rgba(8,6,8,0.40)_20.05%,#080608_106.47%)] dark:block" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-360 px-5 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl space-y-5 text-center sm:space-y-6">
          <p className="font-geist text-base leading-relaxed text-foreground sm:text-lg">
            {t("about.body1")}
          </p>
          <p className="font-geist text-base leading-relaxed text-foreground sm:text-lg">
            {t("about.body2")}
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-4xl text-center sm:mt-14 lg:mt-16">
          <p className="font-geist text-[11px] font-medium tracking-[0.22em] text-secondary uppercase">
            {t("services.eyebrow")}
          </p>
          <h2 className="mt-4 font-instrument text-[clamp(2rem,5vw,3.5rem)] leading-[1.1] font-normal text-foreground">
            {t("services.title")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-geist text-sm leading-relaxed text-foreground/80 sm:text-base">
            {t("services.subtitle")}
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-10 sm:mt-16 md:grid-cols-2 md:gap-x-10 md:gap-y-6 lg:mt-20 lg:gap-x-16">
          {SERVICES.map((service) => (
            <article
              key={service.key}
              className={cn("w-full max-w-85 justify-self-center md:max-w-90", service.className)}
            >
              <figure className="relative aspect-square overflow-hidden rounded-sm">
                <Image
                  src={service.src}
                  alt={t(`services.items.${service.key}.alt`)}
                  fill
                  sizes="(max-width: 768px) 90vw, 360px"
                  className="object-cover"
                />
              </figure>
              <h3 className="mt-4 font-instrument text-xl leading-snug font-normal text-foreground sm:text-2xl">
                {t(`services.items.${service.key}.title`)}
              </h3>
              <p className="mt-2 font-geist text-sm leading-relaxed text-foreground/80 sm:text-base">
                {t(`services.items.${service.key}.description`)}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
