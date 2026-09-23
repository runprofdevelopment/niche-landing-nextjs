"use client";

import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
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
    from: "left",
  },
  {
    key: "digital",
    src: "/images/service2.webp",
    className: "md:col-start-2 md:row-start-1 md:mt-16 md:justify-self-end lg:mt-24",
    from: "right",
  },
  {
    key: "etiquette",
    src: "/images/service3.webp",
    className: "md:col-span-2 md:row-start-2 md:mx-auto md:max-w-85 lg:max-w-95",
    from: "up",
  },
  {
    key: "household",
    src: "/images/service5.webp",
    className: "md:col-start-1 md:row-start-3 md:mt-4 md:justify-self-start lg:mt-8",
    from: "left",
  },
  {
    key: "certification",
    src: "/images/service4.webp",
    className: "md:col-start-2 md:row-start-3 md:-mt-8 md:justify-self-end lg:-mt-16",
    from: "right",
  },
] as const;

/** Uneven delays so cards feel async rather than a rigid cascade. */
const ASYNC_DELAYS = [0, 0.22, 0.1, 0.36, 0.26] as const;

const ease = [0.22, 1, 0.36, 1] as const;

function entryOffset(from: "left" | "right" | "up") {
  if (from === "left") return { x: -56, y: 36, rotate: -2.5 };
  if (from === "right") return { x: 56, y: 36, rotate: 2.5 };
  return { x: 0, y: 48, rotate: 0 };
}

function ServiceCard({
  service,
  index,
  show,
  reduceMotion,
}: {
  service: (typeof SERVICES)[number];
  index: number;
  show: boolean;
  reduceMotion: boolean | null;
}) {
  const t = useTranslations("landing");
  const cardRef = useRef<HTMLElement>(null);
  const cardInView = useInView(cardRef, { once: false, amount: 0.28 });
  const visible = reduceMotion ? show : show && cardInView;
  const offset = entryOffset(service.from);
  const delay = reduceMotion ? 0 : (ASYNC_DELAYS[index] ?? index * 0.15);

  return (
    <motion.article
      ref={cardRef}
      className={cn("w-full max-w-85 justify-self-center md:max-w-90", service.className)}
      initial={false}
      animate={
        visible
          ? { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }
          : {
              opacity: 0,
              x: reduceMotion ? 0 : offset.x,
              y: reduceMotion ? 0 : offset.y,
              scale: reduceMotion ? 1 : 0.92,
              rotate: reduceMotion ? 0 : offset.rotate,
            }
      }
      transition={{
        type: reduceMotion ? "tween" : "spring",
        stiffness: 120,
        damping: 18,
        mass: 0.85,
        delay,
        opacity: { duration: 0.55, ease, delay },
      }}
      {...(!reduceMotion ? { whileHover: { y: -6 } } : {})}
    >
      <motion.figure
        className="relative aspect-square overflow-hidden rounded-sm"
        initial={false}
        animate={visible ? { scale: 1 } : { scale: reduceMotion ? 1 : 1.08 }}
        transition={{ duration: 0.9, ease, delay: delay + 0.05 }}
        {...(!reduceMotion
          ? {
              whileHover: { scale: 1.04 },
            }
          : {})}
      >
        <motion.div
          className="absolute inset-0"
          {...(!reduceMotion
            ? {
                whileHover: { scale: 1.08 },
                transition: { type: "spring" as const, stiffness: 220, damping: 24 },
              }
            : {})}
        >
          <Image
            src={service.src}
            alt={t(`services.items.${service.key}.alt`)}
            fill
            sizes="(max-width: 768px) 90vw, 360px"
            className="object-cover"
          />
        </motion.div>

        {/* Soft light sweep on reveal */}
        {!reduceMotion && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/25 to-transparent"
            initial={false}
            animate={
              visible
                ? { x: ["-120%", "120%"], opacity: [0, 0.55, 0] }
                : { x: "-120%", opacity: 0 }
            }
            transition={{ duration: 1.1, ease, delay: delay + 0.25 }}
          />
        )}
      </motion.figure>

      <motion.h3
        className="mt-4 font-instrument text-xl leading-snug font-normal text-foreground sm:text-2xl"
        initial={false}
        animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
        transition={{ duration: 0.55, ease, delay: delay + 0.18 }}
      >
        {t(`services.items.${service.key}.title`)}
      </motion.h3>
      <motion.p
        className="mt-2 font-geist text-sm leading-relaxed text-foreground/80 sm:text-base"
        initial={false}
        animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
        transition={{ duration: 0.55, ease, delay: delay + 0.28 }}
      >
        {t(`services.items.${service.key}.description`)}
      </motion.p>
    </motion.article>
  );
}

export function ServicesSection() {
  const t = useTranslations("landing");
  const { ready } = useLandingMotion();
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, {
    once: false,
    amount: 0.12,
  });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  const bgScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.06, 1, 1.04]);

  const show = reduceMotion ? ready : ready && inView;

  return (
    <section
      ref={sectionRef}
      id="services"
      className="relative isolate overflow-hidden bg-background py-16 sm:py-20 lg:py-24"
    >
      {/* Full-width blurred groom — covers descriptions + services */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          className={cn(
            "absolute top-0 left-1/2 -translate-x-1/2 blur-[3px]",
            "h-[min(115vw,40rem)] w-[165%]",
            "sm:inset-0 sm:left-0 sm:h-auto sm:w-auto sm:translate-x-0 sm:-m-6 sm:blur-[5px]",
          )}
          {...(!reduceMotion ? { style: { y: bgY, scale: bgScale } } : {})}
        >
          <Image
            src="/images/groom.webp"
            alt=""
            fill
            sizes="(max-width: 640px) 165vw, 100vw"
            className="object-cover object-[center_14%] sm:object-[center_26%] lg:object-[center_30%]"
            priority={false}
          />
        </motion.div>
        <div className="absolute inset-0 bg-[linear-gradient(184deg,rgba(239,226,222,0.55)_8%,rgba(239,226,222,0.72)_42%,#EFE2DE_88%)] dark:hidden sm:bg-[linear-gradient(184deg,rgba(239,226,222,0.40)_17.47%,#EFE2DE_95.37%)]" />
        <div className="absolute inset-0 hidden bg-[linear-gradient(206deg,rgba(8,6,8,0.55)_8%,rgba(8,6,8,0.72)_42%,#080608_88%)] sm:bg-[linear-gradient(206deg,rgba(8,6,8,0.40)_20.05%,#080608_106.47%)] dark:block" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-360 px-5 sm:px-8 lg:px-12">
        <motion.div
          className="mx-auto max-w-4xl space-y-5 text-center sm:space-y-6"
          initial={false}
          animate={show ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 28, filter: reduceMotion ? "blur(0px)" : "blur(6px)" }}
          transition={{ duration: 0.75, ease }}
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
          animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
          transition={{ duration: 0.7, delay: reduceMotion ? 0 : 0.08, ease }}
        >
          <motion.p
            className="font-geist text-[11px] font-medium tracking-[0.22em] text-secondary uppercase"
            initial={false}
            animate={show ? { opacity: 1, letterSpacing: "0.22em" } : { opacity: 0, letterSpacing: "0.4em" }}
            transition={{ duration: 0.8, ease }}
          >
            {t("services.eyebrow")}
          </motion.p>
          <motion.h2
            className="mt-4 font-instrument text-[clamp(2rem,5vw,3.5rem)] leading-[1.1] font-normal text-foreground"
            initial={false}
            animate={
              show
                ? { opacity: 1, y: 0, scale: 1 }
                : { opacity: 0, y: 24, scale: reduceMotion ? 1 : 0.96 }
            }
            transition={{ type: "spring", stiffness: 140, damping: 18, delay: reduceMotion ? 0 : 0.12 }}
          >
            {t("services.title")}
          </motion.h2>
          <motion.p
            className="mx-auto mt-4 max-w-2xl font-geist text-sm leading-relaxed text-foreground/80 sm:text-base"
            initial={false}
            animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={{ duration: 0.65, delay: reduceMotion ? 0 : 0.2, ease }}
          >
            {t("services.subtitle")}
          </motion.p>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 gap-10 sm:mt-16 md:grid-cols-2 md:gap-x-10 md:gap-y-6 lg:mt-20 lg:gap-x-16">
          {SERVICES.map((service, index) => (
            <ServiceCard
              key={service.key}
              service={service}
              index={index}
              show={show}
              reduceMotion={reduceMotion}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
