"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";

import { useLandingMotion } from "./LandingMotion";

const SERVICES = [
  {
    key: "events",
    src: "/images/service1.webp",
    className: "md:col-start-1 md:row-start-1 md:justify-self-start",
  },
  {
    key: "digital",
    src: "/images/service2.webp",
    className: "md:col-start-2 md:row-start-1 md:mt-16 md:justify-self-end lg:mt-24",
  },
  {
    key: "etiquette",
    src: "/images/service3.webp",
    className: "md:col-span-2 md:row-start-2 md:mx-auto md:max-w-85 lg:max-w-95",
  },
  {
    key: "household",
    src: "/images/service4.webp",
    className: "md:col-start-1 md:row-start-3 md:mt-4 md:justify-self-start lg:mt-8",
  },
  {
    key: "certification",
    src: "/images/service5.webp",
    className: "md:col-start-2 md:row-start-3 md:-mt-8 md:justify-self-end lg:-mt-16",
  },
] as const;

/** Uneven delays so cards feel async rather than a rigid cascade. */
const ASYNC_DELAYS = [0, 0.18, 0.08, 0.32, 0.22] as const;

const ease = [0.22, 1, 0.36, 1] as const;

export function ServicesSection() {
  const t = useTranslations("landing");
  const { ready } = useLandingMotion();
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, {
    once: false,
    amount: 0.15,
  });

  const show = reduceMotion ? ready : ready && inView;

  return (
    <section
      ref={sectionRef}
      id="services"
      className="relative isolate overflow-hidden bg-background py-16 sm:py-20 lg:py-24"
    >
      {/* Full-width blurred groom — covers descriptions + services */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {/*
          Mobile: cap image height to ~viewport so a tall section doesn't
          over-zoom the portrait. Wider crop + upper focal point keep the subject framed.
          sm+: full-bleed cover across the section.
        */}
        <div
          className={cn(
            "absolute top-0 left-1/2 -translate-x-1/2 blur-[3px]",
            "h-[min(115vw,40rem)] w-[165%]",
            "sm:inset-0 sm:left-0 sm:h-auto sm:w-auto sm:translate-x-0 sm:-m-6 sm:blur-[5px]",
          )}
        >
          <Image
            src="/images/groom.webp"
            alt=""
            fill
            sizes="(max-width: 640px) 165vw, 100vw"
            className="object-cover object-[center_14%] sm:object-[center_26%] lg:object-[center_30%]"
            priority={false}
          />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(184deg,rgba(239,226,222,0.55)_8%,rgba(239,226,222,0.72)_42%,#EFE2DE_88%)] dark:hidden sm:bg-[linear-gradient(184deg,rgba(239,226,222,0.40)_17.47%,#EFE2DE_95.37%)]" />
        <div className="absolute inset-0 hidden bg-[linear-gradient(206deg,rgba(8,6,8,0.55)_8%,rgba(8,6,8,0.72)_42%,#080608_88%)] sm:bg-[linear-gradient(206deg,rgba(8,6,8,0.40)_20.05%,#080608_106.47%)] dark:block" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-360 px-5 sm:px-8 lg:px-12">
        <motion.div
          className="mx-auto max-w-4xl space-y-5 text-center sm:space-y-6"
          initial={false}
          animate={
            show || reduceMotion
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: 28 }
          }
          transition={{ duration: 0.65, ease }}
        >
          <p className="font-geist text-base leading-relaxed text-foreground sm:text-lg">
            {t("about.body1")}
          </p>
          <p className="font-geist text-base leading-relaxed text-foreground sm:text-lg">
            {t("about.body2")}
          </p>
        </motion.div>

        <motion.div
          className="mx-auto mt-12 max-w-4xl text-center sm:mt-14 lg:mt-16"
          initial={false}
          animate={
            show || reduceMotion
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: 24 }
          }
          transition={{ duration: 0.65, delay: reduceMotion ? 0 : 0.06, ease }}
        >
          <p className="font-geist text-[11px] font-medium tracking-[0.22em] text-secondary uppercase">
            {t("services.eyebrow")}
          </p>
          <h2 className="mt-4 font-instrument text-[clamp(2rem,5vw,3.5rem)] leading-[1.1] font-normal text-foreground">
            {t("services.title")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-geist text-sm leading-relaxed text-foreground/80 sm:text-base">
            {t("services.subtitle")}
          </p>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 gap-10 sm:mt-16 md:grid-cols-2 md:gap-x-10 md:gap-y-6 lg:mt-20 lg:gap-x-16">
          {SERVICES.map((service, index) => (
            <motion.article
              key={service.key}
              className={cn("w-full max-w-85 justify-self-center md:max-w-90", service.className)}
              initial={false}
              animate={
                show || reduceMotion
                  ? { opacity: 1, y: 0, scale: 1 }
                  : { opacity: 0, y: 40, scale: 0.96 }
              }
              transition={{
                duration: 0.7,
                ease,
                delay: reduceMotion ? 0 : ASYNC_DELAYS[index] ?? index * 0.15,
              }}
            >
              <motion.figure
                className="relative aspect-square overflow-hidden rounded-sm"
                {...(!reduceMotion ? { whileHover: { scale: 1.03 } } : {})}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
              >
                <Image
                  src={service.src}
                  alt={t(`services.items.${service.key}.alt`)}
                  fill
                  sizes="(max-width: 768px) 90vw, 360px"
                  className="object-cover"
                />
              </motion.figure>
              <h3 className="mt-4 font-instrument text-xl leading-snug font-normal text-foreground sm:text-2xl">
                {t(`services.items.${service.key}.title`)}
              </h3>
              <p className="mt-2 font-geist text-sm leading-relaxed text-foreground/80 sm:text-base">
                {t(`services.items.${service.key}.description`)}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
