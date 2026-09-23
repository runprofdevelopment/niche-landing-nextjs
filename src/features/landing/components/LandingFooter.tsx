"use client";

import { Facebook, Instagram, Linkedin } from "lucide-react";
import Image from "next/image";

import { siteConfig } from "@/config/site";
import { routes } from "@/constants/routes";
import { useTranslations } from "@/hooks/useTranslations";
import { Link } from "@/providers/i18n";

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

const NAV_LINKS = [
  { key: "legacy", href: "#philosophy" },
  { key: "services", href: "#services" },
  { key: "curators", href: "#about" },
  { key: "gallery", href: "#celebrate" },
] as const;

const SOCIAL_LINKS = [
  { key: "instagram", href: siteConfig.social.instagram, Icon: Instagram },
  { key: "facebook", href: siteConfig.social.facebook, Icon: Facebook },
  { key: "twitter", href: siteConfig.social.x, Icon: XIcon },
  { key: "linkedin", href: siteConfig.social.linkedin, Icon: Linkedin },
] as const;

export function LandingFooter() {
  const t = useTranslations("landing");

  return (
    <footer className="relative isolate overflow-hidden bg-[#0b0b0b] text-white dark:bg-black">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2">
        {/* SVG watermark — next/image is skipped for local SVG assets */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/footerSvg.svg"
          alt=""
          className="h-auto w-full object-cover"
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 pt-16 pb-8 sm:px-8 sm:pt-20 lg:px-12 lg:pt-24">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.6fr)] lg:gap-16">
          <div className="flex items-start">
            <Image
              src="/images/logoFooter.png"
              alt={t("logoAlt")}
              width={88}
              height={104}
              className="h-20 w-auto mix-blend-screen sm:h-24"
            />
          </div>

          <div className="grid gap-10 sm:grid-cols-3 sm:gap-8">
            <div>
              <h3 className="mb-4 text-[0.7rem] font-medium tracking-[0.22em] text-[#b8a078] uppercase">
                {t("footer.navigation")}
              </h3>
              <ul className="space-y-3 font-display text-base text-white/90 sm:text-lg">
                {NAV_LINKS.map(({ key, href }) => (
                  <li key={key}>
                    <a href={href} className="transition-colors hover:text-white">
                      {t(`footer.nav.${key}`)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-[0.7rem] font-medium tracking-[0.22em] text-[#b8a078] uppercase">
                {t("footer.social")}
              </h3>
              <ul className="space-y-3 text-sm text-white/90 sm:text-base">
                {SOCIAL_LINKS.map(({ key, href, Icon }) => (
                  <li key={key}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2.5 transition-colors hover:text-white"
                    >
                      <Icon className="size-4 shrink-0" />
                      {t(`footer.socialLinks.${key}`)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-[0.7rem] font-medium tracking-[0.22em] text-[#b8a078] uppercase">
                {t("footer.contact")}
              </h3>
              <ul className="space-y-3 text-sm text-white/90 sm:text-base">
                <li>
                  <a
                    href={`mailto:${t("footer.email")}`}
                    className="transition-colors hover:text-white"
                  >
                    {t("footer.email")}
                  </a>
                </li>
                <li>
                  <a
                    href={`tel:${t("footer.phone").replace(/\s/g, "")}`}
                    className="transition-colors hover:text-white"
                    dir="ltr"
                  >
                    {t("footer.phone")}
                  </a>
                </li>
                <li>{t("footer.location")}</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/15 pt-6 text-xs text-white/55 sm:mt-16 sm:flex-row sm:items-center sm:justify-between sm:text-sm">
          <p>{t("footer.copyright")}</p>
          <div className="flex items-center gap-6">
            <Link href={routes.privacy} className="transition-colors hover:text-white/80">
              {t("footer.privacy")}
            </Link>
            <Link href={routes.terms} className="transition-colors hover:text-white/80">
              {t("footer.terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
