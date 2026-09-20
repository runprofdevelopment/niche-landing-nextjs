"use client";

import { Moon, Sun } from "lucide-react";

import { useTranslations } from "@/hooks/useTranslations";
import { useTheme } from "@/providers/theme";
import { LanguageSwitcher } from "@/shared/components/layout/language-switcher";
import { Button } from "@/shared/components/ui/button";

export function AuthHeader() {
  const t = useTranslations("navigation");
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-50 flex items-center justify-end px-4 py-4 sm:px-6 lg:px-10">
      <div className="pointer-events-auto flex items-center gap-2">
        <LanguageSwitcher label={t("changeLanguage")} triggerClassName="rounded-sm" />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative size-9 shrink-0 rounded-sm bg-secondary/30 text-foreground hover:bg-secondary/50"
          aria-label={t("toggleTheme")}
          onClick={toggleTheme}
        >
          <Sun className="size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
        </Button>
      </div>
    </header>
  );
}
