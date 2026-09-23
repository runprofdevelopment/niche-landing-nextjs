"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

import { useTranslations } from "@/hooks/useTranslations";

export function AboutSection() {
  const t = useTranslations("landing");
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.22, 0.72, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.22, 0.72, 1], [56, 0, 0, -56]);
  const scale = useTransform(scrollYProgress, [0, 0.22, 0.72, 1], [0.96, 1, 1, 0.97]);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative isolate overflow-hidden bg-background py-16 sm:py-20 lg:py-24"
    >
      <motion.div
        className="relative z-10 mx-auto w-full max-w-360 px-5 sm:px-8 lg:px-12"
        {...(!reduceMotion ? { style: { opacity, y, scale } } : {})}
      >
        <div className="relative">
          {/* Full-bleed primary band behind title + image */}
          <div
            aria-hidden
            className="absolute top-1/2 left-1/2 z-0 h-16 w-screen -translate-x-1/2 -translate-y-1/2 bg-primary sm:h-[72px]"
          />

          <div className="relative z-10 grid grid-cols-1 items-center gap-10 md:grid-cols-[1.05fr_0.95fr] md:gap-8 lg:gap-12">
            <div className="text-center">
              <p className="font-geist text-[11px] font-medium tracking-[0.22em] text-foreground/55 uppercase dark:text-secondary">
                — {t("about.eyebrow")} —
              </p>
              {/* Light: dark heading; dark: cream/white — matches design comps */}
              <h2 className="mt-5 text-center font-instrument text-[clamp(2rem,5vw,66px)] leading-[0.76] font-normal text-foreground lg:text-[66px] lg:leading-[50px] dark:text-[#efe2de]">
                <span className="block">{t("about.titleLine1")}</span>
                <span className="block">{t("about.titleLine2")}</span>
                <span className="block">{t("about.titleLine3")}</span>
              </h2>
            </div>

            <figure className="relative aspect-[1164/732] w-full overflow-hidden">
              <Image
                src="/images/girl.webp"
                alt={t("about.imageAlt")}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-center"
                priority
              />
            </figure>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
