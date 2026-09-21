"use client";

import Image from "next/image";

import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";

const GALLERY = [
  {
    src: "/images/img1.png",
    altKey: "img1Alt",
    aspect: "aspect-[3/4]",
    offset: "lg:-mb-48 md:-mb-40",
  },
  {
    src: "/images/img2.png",
    altKey: "img2Alt",
    aspect: "aspect-[4/3] md:self-center",
    offset: "lg:-mb-72 md:-mb-40",
  },
  {
    src: "/images/img3.png",
    altKey: "img3Alt",
    aspect: "aspect-[3/4]",
    offset: "lg:-mb-48 md:-mb-40",
  },
] as const;

export function PhilosophySection() {
  const t = useTranslations("landing");

  return (
    <section
      id="philosophy"
      className="relative isolate overflow-hidden bg-primary py-16 sm:py-20 lg:py-24"
    >
      <Image
        src="/images/natural.png"
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-center"
      />
      <div aria-hidden className="absolute inset-0 bg-primary/5" />

      <div className="relative z-10 mx-auto w-full max-w-360 px-5 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl text-center text-primary-foreground">
          <p className="font-geist text-[11px] font-medium tracking-[0.2em] text-secondary uppercase">
            {t("philosophy.eyebrow")}
          </p>
          <h2 className="mt-4 font-display  text-secondary-button text-center text-[clamp(2.75rem,9vw,5.5rem)] leading-[1.05] font-normal">
            {t("philosophy.title")}
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-center font-geist text-base leading-relaxed font-normal text-primary-foreground/85">
            {t("philosophy.description")}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 items-end gap-10 sm:mt-14 md:grid-cols-3">
          {GALLERY.map((item) => (
            <figure
              key={item.src}
              className={cn(
                "group relative w-full overflow-hidden rounded-sm",
                item.aspect,
                item.offset,
              )}
            >
              <Image
                src={item.src}
                alt={t(`philosophy.${item.altKey}`)}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              <div aria-hidden className="absolute inset-0 bg-primary/30" />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
