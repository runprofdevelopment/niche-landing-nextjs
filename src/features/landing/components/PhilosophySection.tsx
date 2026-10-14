import Image from "next/image";

import { cn } from "@/lib/utils";
import { getLocale, getTranslations } from "@/providers/i18n/server";

const GALLERY = [
  {
    src: "/images/img1.webp",
    altKey: "img1Alt",
    aspect: "aspect-[3/4]",
    offset: "lg:-mb-48 md:-mb-40",
  },
  {
    src: "/images/img2.webp",
    altKey: "img2Alt",
    aspect: "aspect-[4/3] md:self-center",
    offset: "lg:-mb-72 md:-mb-40",
  },
  {
    src: "/images/img3.webp",
    altKey: "img3Alt",
    aspect: "aspect-[3/4]",
    offset: "lg:-mb-48 md:-mb-40",
  },
] as const;

export async function PhilosophySection() {
  const t = await getTranslations("landing");
  const locale = await getLocale();
  const isAr = locale === "ar";

  return (
    <section
      id="philosophy"
      className="relative isolate overflow-hidden bg-primary py-16 sm:py-20 lg:py-24"
    >
      <Image
        src="/images/natural.webp"
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-center"
      />
      <div aria-hidden className="absolute inset-0 bg-primary/5" />

      <div className="relative z-10 mx-auto w-full max-w-360 px-5 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl text-center text-primary-foreground">
          <p
            className={cn(
              "font-geist font-medium tracking-[0.2em] text-secondary uppercase",
              isAr ? "text-base sm:text-lg" : "text-[11px]",
            )}
          >
            {t("philosophy.eyebrow")}
          </p>
          <h2 className="mt-4 text-center font-display text-[clamp(2.75rem,9vw,5.5rem)] leading-[1.05] font-normal text-secondary-button">
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
                "group relative z-10 w-full overflow-hidden rounded-sm bg-background",
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
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
