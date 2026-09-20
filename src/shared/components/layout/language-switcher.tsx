"use client";

import { Languages } from "lucide-react";

import { locales, localeLabels, type Locale } from "@/config/i18n";
import { cn } from "@/lib/utils";
import { useCurrentLocale, usePathname, useRouter, useSearchParams } from "@/providers/i18n";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

type LanguageSwitcherProps = {
  label: string;
  triggerClassName?: string;
};

export function LanguageSwitcher({ label, triggerClassName }: LanguageSwitcherProps) {
  const locale = useCurrentLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const switchLocale = (nextLocale: Locale) => {
    const query = Object.fromEntries(searchParams.entries());
    const href = Object.keys(query).length > 0 ? { pathname, query } : pathname;
    router.replace(href, { locale: nextLocale });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            "size-9 shrink-0 rounded-full bg-secondary/30 text-foreground hover:bg-secondary/50",
            triggerClassName,
          )}
          aria-label={label}
        >
          <Languages className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((entry) => (
          <DropdownMenuItem
            key={entry}
            className={entry === locale ? "font-medium" : undefined}
            onClick={() => switchLocale(entry)}
          >
            {localeLabels[entry]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
