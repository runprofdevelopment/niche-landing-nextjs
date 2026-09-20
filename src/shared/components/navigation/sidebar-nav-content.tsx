"use client";

import { LogOut, Moon, Sun } from "lucide-react";
import { useState } from "react";

import { routes } from "@/constants/routes";
import { usePermissions } from "@/hooks/usePermissions";
import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth/useAuth";
import { useRouter } from "@/providers/i18n";
import { useTheme } from "@/providers/theme/useTheme";
import { useErrorHandler } from "@/services/error-handling";
import { ConfirmDialog } from "@/shared/components/dialogs";
import { toast } from "@/shared/components/feedback/toast";
import { Button } from "@/shared/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";

import { dashboardNavItems } from "./dashboard-nav-config";
import { DashboardNavItemButton } from "./dashboard-nav-item";
import { SidebarBrand } from "./sidebar-brand";

import type { CircleHelp } from "lucide-react";

type SidebarNavContentProps = {
  variant: "rail" | "drawer";
  onNavigate?: () => void;
};

function RailIconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          onClick={onClick}
          aria-label={label}
          className="relative size-10 rounded-lg p-0 text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

function SidebarThemeToggle({
  variant,
  onNavigate,
}: {
  variant: "rail" | "drawer";
  onNavigate?: () => void;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations("navigation");

  const toggle = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
    onNavigate?.();
  };

  if (variant === "rail") {
    return (
      <RailIconButton label={t("toggleTheme")} onClick={toggle}>
        <Sun className="size-[18px] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
        <Moon className="absolute size-[18px] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      </RailIconButton>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={toggle}
      className="relative h-10 w-full justify-start gap-2 rounded-lg px-2 text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
    >
      <Sun className="size-[18px] shrink-0 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute size-[18px] shrink-0 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="truncate">{t("toggleTheme")}</span>
    </Button>
  );
}

function SidebarFooterAction({
  icon: Icon,
  label,
  onClick,
  variant,
}: {
  icon: typeof CircleHelp | typeof LogOut;
  label: string;
  onClick?: () => void;
  variant: "rail" | "drawer";
}) {
  if (variant === "rail") {
    return (
      <RailIconButton label={label} {...(onClick ? { onClick } : {})}>
        <Icon className="size-[18px]" />
      </RailIconButton>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      className="h-10 w-full justify-start gap-2 rounded-lg px-2 text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
    >
      <Icon className="size-[18px] shrink-0" />
      <span className="truncate">{label}</span>
    </Button>
  );
}

export function SidebarNavContent({ variant, onNavigate }: SidebarNavContentProps) {
  const t = useTranslations("navigation");
  const tAuth = useTranslations("auth");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { signOut } = useAuth();
  const { can } = usePermissions();
  const { handleError } = useErrorHandler();
  const isRail = variant === "rail";
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const visibleNavItems = dashboardNavItems.flatMap((item) => {
    const children = item.children?.filter((child) => can(child.permission));
    const canSeeParent = can(item.permission) || Boolean(children?.length);
    if (!canSeeParent) return [];
    return [
      {
        titleKey: item.titleKey,
        href: item.href,
        icon: item.icon,
        permission: item.permission,
        ...(children?.length ? { children } : {}),
      },
    ];
  });

  async function handleLogoutConfirm() {
    setLoggingOut(true);
    try {
      await signOut();
      toast.success(tAuth("logoutSuccess"));
      setLogoutOpen(false);
      onNavigate?.();
      router.replace(routes.login);
    } catch (error) {
      handleError(error, { context: { feature: "auth", action: "signOut" } });
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <SidebarBrand variant={variant} />

      <nav
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto mt-4",
          isRail ? "items-center gap-1 px-1" : "gap-1 px-2",
        )}
      >
        {visibleNavItems.map((item) => (
          <DashboardNavItemButton
            key={item.href}
            item={item}
            variant={variant}
            {...(onNavigate ? { onNavigate } : {})}
          />
        ))}
      </nav>

      <div
        className={cn(
          "flex flex-col border-t border-sidebar-border py-3",
          isRail ? "items-center gap-1 px-1" : "gap-1 px-2",
        )}
      >
        <SidebarThemeToggle variant={variant} {...(onNavigate ? { onNavigate } : {})} />
        <SidebarFooterAction
          icon={LogOut}
          label={t("logout")}
          variant={variant}
          onClick={() => setLogoutOpen(true)}
        />
      </div>

      <ConfirmDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        title={tAuth("logoutConfirmTitle")}
        description={tAuth("logoutConfirmDescription")}
        tone="default"
        icon={<LogOut className="size-5" />}
        cancelLabel={tCommon("cancel")}
        confirmLabel={t("logout")}
        loading={loggingOut}
        onConfirm={handleLogoutConfirm}
      />
    </div>
  );
}
