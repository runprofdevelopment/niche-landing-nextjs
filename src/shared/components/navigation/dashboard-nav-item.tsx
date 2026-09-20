"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";
import { Link, usePathname } from "@/providers/i18n";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";

import type { DashboardNavChild, DashboardNavItem } from "./dashboard-nav-config";

type DashboardNavItemProps = {
  item: DashboardNavItem;
  variant: "rail" | "drawer";
  onNavigate?: () => void;
};

const drawerButtonClassName =
  "flex h-10 w-full items-center gap-2 rounded-lg px-2 text-sm text-sidebar-foreground/90 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";

const railButtonClassName =
  "flex size-10 items-center justify-center rounded-lg text-sidebar-foreground/90 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";

const childDrawerClassName =
  "flex h-9 w-full items-center gap-2 rounded-lg px-2 ps-9 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";

function RailTooltip({ label, children }: { label: string; children: React.ReactElement }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

function isChildPathActive(pathname: string, child: DashboardNavChild) {
  return pathname === child.href || pathname.startsWith(`${child.href}/`);
}

export function DashboardNavItemButton({ item, variant, onNavigate }: DashboardNavItemProps) {
  const t = useTranslations("navigation");
  const pathname = usePathname();
  const isRail = variant === "rail";

  const label = t(item.titleKey);
  const Icon = item.icon;
  const childActive = Boolean(item.children?.some((child) => isChildPathActive(pathname, child)));
  const isActive = Boolean(
    pathname === item.href || pathname.startsWith(`${item.href}/`) || childActive,
  );

  const [userOpen, setUserOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const open = childActive || userOpen;

  const activeClassName = cn(
    isRail ? railButtonClassName : drawerButtonClassName,
    isActive && "bg-primary-foreground text-primary",
  );

  if (!item.children?.length) {
    const link = (
      <Link href={item.href} className={activeClassName} aria-label={label} onClick={onNavigate}>
        <Icon className="size-4.5 shrink-0" />
        {!isRail ? <span className="min-w-0 truncate">{label}</span> : null}
      </Link>
    );

    return isRail ? <RailTooltip label={label}>{link}</RailTooltip> : link;
  }

  // Minimized rail: keep popover / dropdown (not accordion).
  if (isRail) {
    return (
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <RailTooltip label={label}>
          <DropdownMenuTrigger asChild>
            <button type="button" className={activeClassName} aria-label={label}>
              <Icon className="size-4.5 shrink-0" />
            </button>
          </DropdownMenuTrigger>
        </RailTooltip>
        <DropdownMenuContent side="right" align="start" sideOffset={8} className="min-w-48">
          {item.children.map((child) => {
            const ChildIcon = child.icon;
            const childLabel = t(child.titleKey);
            const isChildActive = isChildPathActive(pathname, child);

            return (
              <DropdownMenuItem key={child.href} asChild>
                <Link
                  href={child.href}
                  className={cn("gap-2", isChildActive && "bg-accent font-medium")}
                  onClick={() => {
                    setMenuOpen(false);
                    onNavigate?.();
                  }}
                >
                  <ChildIcon className="size-4 shrink-0" />
                  {childLabel}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Expanded drawer: accordion with icons beside each child.
  return (
    <Collapsible open={open} onOpenChange={setUserOpen} className="flex flex-col gap-0.5">
      <CollapsibleTrigger className={cn(activeClassName, "group")} aria-label={label}>
        <Icon className="size-4.5 shrink-0" />
        <span className="min-w-0 flex-1 truncate text-start">{label}</span>
        <ChevronDown
          className={cn(
            "size-3.5 shrink-0 opacity-60 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </CollapsibleTrigger>

      <CollapsibleContent className="flex flex-col gap-0.5 overflow-hidden data-[state=closed]:animate-none">
        {item.children.map((child) => {
          const ChildIcon = child.icon;
          const childLabel = t(child.titleKey);
          const isChildActive = isChildPathActive(pathname, child);

          return (
            <Link
              key={child.href}
              href={child.href}
              className={cn(
                childDrawerClassName,
                isChildActive && "bg-primary-foreground font-medium text-primary",
              )}
              onClick={onNavigate}
            >
              <ChildIcon className="size-4 shrink-0" />
              <span className="min-w-0 truncate">{childLabel}</span>
            </Link>
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );
}
