"use client";

// import { Bell } from "lucide-react";

import { siteConfig } from "@/config/site";
import { routes } from "@/constants/routes";
import { useTranslations } from "@/hooks/useTranslations";
import { useAuth } from "@/providers/auth/useAuth";
import { Link, usePathname } from "@/providers/i18n";
// import { LanguageSwitcher } from "@/shared/components/layout/language-switcher";
import { getNavItemByPath } from "@/shared/components/navigation/dashboard-nav-config";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/ui/breadcrumb";
// import { Button } from "@/shared/components/ui/button";
import { SidebarTrigger } from "@/shared/components/ui/sidebar";

function getDisplayName(
  fullName: string | null | undefined,
  displayName: string | null | undefined,
  email: string | null | undefined,
): string {
  const name = fullName?.trim() || displayName?.trim();
  if (name) return name;
  if (email?.trim()) return email.trim();
  return "—";
}

function getInitials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "NS";
}

export function DashboardHeader() {
  const t = useTranslations("navigation");
  const pathname = usePathname();
  const { user, profile, isAdmin } = useAuth();
  const activeItem = getNavItemByPath(pathname);
  const pageTitle = activeItem ? t(activeItem.titleKey) : t("dashboard");

  const displayName = getDisplayName(
    profile?.fullName,
    user?.displayName,
    profile?.email || user?.email,
  );
  const avatarUrl = profile?.avatar?.publicUrl ?? profile?.photoURL ?? null;
  const roleLabel = isAdmin ? t("admin") : (profile?.roles?.[0] ?? null);

  return (
    <header className="flex h-14 min-w-0 shrink-0 items-center gap-3 overflow-hidden rounded-xl bg-card px-4">
      <SidebarTrigger className="-ms-1 shrink-0 text-foreground" />

      <Breadcrumb className="hidden min-w-0 flex-1 sm:block">
        <BreadcrumbList className="flex-nowrap">
          <BreadcrumbItem className="min-w-0">
            <BreadcrumbLink asChild>
              <Link href={routes.dashboard} className="truncate">
                {siteConfig.name}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem className="min-w-0">
            <BreadcrumbPage className="truncate">{pageTitle}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ms-auto flex shrink-0 items-center gap-2">
        {/* Temporarily hidden — language switcher
        <LanguageSwitcher label={t("changeLanguage")} />
        */}

        {/* <Button
          variant="ghost"
          size="icon"
          className="relative size-9 shrink-0 rounded-full bg-secondary/30 hover:bg-secondary/50"
          aria-label={t("notifications")}
        >
          <Bell className="size-4" />
          <span className="absolute end-1.5 top-1.5 size-2 rounded-full bg-destructive" />
        </Button> */}

        <div className="flex shrink-0 items-center gap-2 border-s ps-3">
          <Avatar className="size-8 shrink-0">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName} /> : null}
            <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
          </Avatar>
          <div className="hidden leading-tight md:block">
            <p className="max-w-32 truncate text-sm font-medium">{displayName}</p>
            {roleLabel ? (
              <p className="truncate text-xs text-muted-foreground">{roleLabel}</p>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
