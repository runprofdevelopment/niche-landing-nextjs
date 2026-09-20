"use client";

import { Languages, Moon, Sun } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import { localeLabels, type Locale } from "@/config/i18n";
import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";
import { useCurrentLocale, usePathname, useRouter } from "@/providers/i18n";
import { useTheme } from "@/providers/theme";

export function LandingNavbar() {
  const t = useTranslations("landing");
  const tNav = useTranslations("navigation");
  const locale = useCurrentLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const nextLocale: Locale = locale === "en" ? "ar" : "en";

  const switchLocale = () => {
    router.replace(pathname, { locale: nextLocale });
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-300",
        scrolled
          ? "border-b border-white/10 bg-black/60 shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-md"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-5 sm:h-[4.5rem] sm:px-8 lg:px-12">
        <div className="inline-flex items-center w-[170px] h-[70px] relative" aria-label={t("logoAlt")}>
          <Image
            src="/images/logo.png"
            alt=""
            fill
            priority
            className="h-9 w-auto mix-blend-screen sm:h-10"
          />
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={switchLocale}
            className="inline-flex h-9 items-center gap-2 rounded-sm px-2.5 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white"
            aria-label={`${tNav("changeLanguage")}: ${localeLabels[nextLocale]}`}
          >
            <Languages className="size-4 shrink-0" aria-hidden />
            <span className="hidden sm:inline">{localeLabels[nextLocale]}</span>
            <span className="sm:hidden uppercase">{nextLocale}</span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="relative inline-flex size-9 items-center justify-center rounded-sm text-white/90 transition-colors hover:bg-white/10 hover:text-white"
            aria-label={tNav("toggleTheme")}
          >
            <Sun className="size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          </button>
        </div>
      </div>
    </header>
  );
}
