"use client";

import Image from "next/image";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type SidebarBrandProps = {
  variant: "rail" | "drawer";
  className?: string;
};

export function SidebarBrand({ variant, className }: SidebarBrandProps) {
  const isDrawer = variant === "drawer";

  return (
    <div
      className={cn(
        "flex items-center justify-center px-3 py-4 border-b border-primary-foreground/20 ",
        isDrawer ? "py-5" : "py-4",
        className,
      )}
    >
      <Image
        src={isDrawer ? siteConfig.logos.large : siteConfig.logos.small}
        alt={siteConfig.name}
        width={isDrawer ? 160 : 40}
        height={isDrawer ? 48 : 40}
        className={cn("h-auto w-auto object-contain", isDrawer ? "max-h-12" : "max-h-9 max-w-9")}
        priority
      />
    </div>
  );
}
